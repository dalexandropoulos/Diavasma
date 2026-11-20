import json
import urllib.request
import subprocess
import time
import os
import http.server
import socketserver
import threading
import tempfile
import asyncio
import websockets

os.chdir(os.path.join(os.path.dirname(__file__), ".."))

# Dynamic port
Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("127.0.0.1", 0), Handler)
PORT = httpd.server_address[1]
server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
server_thread.start()

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

temp_profile = tempfile.mkdtemp()
CDP_PORT = 9227
cmd = [
    edge_path,
    "--headless=new",
    f"--user-data-dir={temp_profile}",
    f"--remote-debugging-port={CDP_PORT}",
    "--disable-gpu",
    "--no-sandbox",
    "about:blank"
]
proc = subprocess.Popen(cmd)
time.sleep(1.5)

try:
    with urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json") as res:
        tabs = json.loads(res.read().decode())
    target_tab = [t for t in tabs if t.get("type") == "page"][0]
    ws_url = target_tab["webSocketDebuggerUrl"]

    async def run_tests():
        async with websockets.connect(ws_url) as ws:
            msg_id = 0
            async def send_cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                req_id = msg_id
                req = {"id": req_id, "method": method}
                if params:
                    req["params"] = params
                await ws.send(json.dumps(req))
                while True:
                    raw = await ws.recv()
                    msg = json.loads(raw)
                    if msg.get("id") == req_id:
                        return msg.get("result", {})

            async def eval_js(expr):
                res = await send_cmd("Runtime.evaluate", {"expression": expr, "returnByValue": True})
                if "exceptionDetails" in res:
                    print("JS Exception:", res["exceptionDetails"])
                return res.get("result", {}).get("value")

            await send_cmd("Page.enable")
            await send_cmd("Runtime.enable")
            await send_cmd("Log.enable")

            # Navigate
            await send_cmd("Page.navigate", {"url": f"http://127.0.0.1:{PORT}/Diavasma.html"})

            # Wait for Page.loadEventFired or document.readyState
            for _ in range(50):
                ready = await eval_js("document.readyState === 'complete' && typeof window.setActiveView === 'function'")
                if ready:
                    break
                await asyncio.sleep(0.2)

            # Bypass welcome overlay
            await eval_js("""
                if (typeof closeWelcomeOverlay === 'function') closeWelcomeOverlay();
                if (typeof setActiveView === 'function') setActiveView('library');
                if (typeof renderLibraryHub === 'function') renderLibraryHub();
            """)
            await asyncio.sleep(0.3)

            # Test 1: Check old buttons removed from DOM
            res1 = await eval_js("""
                ({
                    goToImporterBtn: document.getElementById('goToImporterBtn') === null,
                    showLibraryListBtn: document.getElementById('showLibraryListBtn') === null,
                    libraryListSectionVisible: !document.getElementById('libraryListSection').hidden,
                    importModalPresent: document.getElementById('importModal') !== null,
                    importModalHidden: document.getElementById('importModal').hidden
                })
            """)
            print("Test 1 (DOM structure):", res1)
            assert res1["goToImporterBtn"] is True, "goToImporterBtn should be removed from DOM"
            assert res1["showLibraryListBtn"] is True, "showLibraryListBtn should be removed from DOM"
            assert res1["libraryListSectionVisible"] is True, "libraryListSection must be visible"
            assert res1["importModalPresent"] is True, "importModal must exist"
            assert res1["importModalHidden"] is True, "importModal must be initially hidden"

            # Test 2: Click '+' on Books (grp-books)
            res2 = await eval_js("""
                (() => {
                    const btn = document.querySelector('.group-add-btn[data-group-id="grp-books"]');
                    if (!btn) return { error: 'Books add button not found' };
                    btn.click();
                    const modal = document.getElementById('importModal');
                    const modeTabs = modal.querySelector('.mode-tabs');
                    const paneFile = document.getElementById('paneFile');
                    const paneUrl = document.getElementById('paneUrl');
                    const panePaste = document.getElementById('panePaste');
                    const targetSelect = document.getElementById('targetGroupSelect');
                    const title = document.getElementById('importModalTitle').textContent;
                    return {
                        modalVisible: !modal.hidden,
                        modeTabsHidden: modeTabs.hidden,
                        paneFileVisible: !paneFile.hidden,
                        paneUrlHidden: paneUrl.hidden,
                        panePasteHidden: panePaste.hidden,
                        targetVal: targetSelect.value,
                        title: title
                    };
                })()
            """)
            print("Test 2 (Books contextual modal):", res2)
            assert res2["modalVisible"] is True, "Modal must open for books"
            assert res2["modeTabsHidden"] is True, "Mode tabs container must be hidden for books (single compartment)"
            assert res2["paneFileVisible"] is True, "File pane must be visible for books"
            assert res2["paneUrlHidden"] is True, "URL pane must be hidden for books"
            assert res2["panePasteHidden"] is True, "Paste pane must be hidden for books"
            assert res2["targetVal"] == "grp-books", "Target select must be grp-books"

            # Test 3: Close modal via Escape
            res3 = await eval_js("""
                (() => {
                    const evt = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
                    document.dispatchEvent(evt);
                    const modal = document.getElementById('importModal');
                    return { modalHidden: modal.hidden };
                })()
            """)
            print("Test 3 (Escape close):", res3)
            assert res3["modalHidden"] is True, "Modal should close on Escape"

            # Test 4: Click '+' on Articles (grp-articles)
            res4 = await eval_js("""
                (() => {
                    const btn = document.querySelector('.group-add-btn[data-group-id="grp-articles"]');
                    if (!btn) return { error: 'Articles add button not found' };
                    btn.click();
                    const modal = document.getElementById('importModal');
                    const modeTabs = modal.querySelector('.mode-tabs');
                    const tabFile = modal.querySelector('.mode-tab[data-pane="paneFile"]');
                    const tabUrl = modal.querySelector('.mode-tab[data-pane="paneUrl"]');
                    const tabPaste = modal.querySelector('.mode-tab[data-pane="panePaste"]');
                    const paneFile = document.getElementById('paneFile');
                    const paneUrl = document.getElementById('paneUrl');
                    const panePaste = document.getElementById('panePaste');
                    const targetSelect = document.getElementById('targetGroupSelect');
                    const title = document.getElementById('importModalTitle').textContent;
                    return {
                        modalVisible: !modal.hidden,
                        modeTabsVisible: !modeTabs.hidden,
                        tabFileHidden: tabFile.hidden,
                        tabUrlVisible: !tabUrl.hidden,
                        tabPasteVisible: !tabPaste.hidden,
                        tabUrlActive: tabUrl.classList.contains('active'),
                        paneFileHidden: paneFile.hidden,
                        paneUrlVisible: !paneUrl.hidden,
                        panePasteHidden: panePaste.hidden,
                        targetVal: targetSelect.value,
                        title: title
                    };
                })()
            """)
            print("Test 4 (Articles contextual modal):", res4)
            assert res4["modalVisible"] is True, "Modal must open for articles"
            assert res4["modeTabsVisible"] is True, "Mode tabs container must be visible for articles"
            assert res4["tabFileHidden"] is True, "File tab must be hidden for articles"
            assert res4["tabUrlVisible"] is True, "URL tab must be visible for articles"
            assert res4["tabPasteVisible"] is True, "Paste tab must be visible for articles"
            assert res4["tabUrlActive"] is True, "URL tab must be active by default for articles"
            assert res4["paneUrlVisible"] is True, "URL pane must be visible for articles"
            assert res4["targetVal"] == "grp-articles", "Target select must be grp-articles"

            # Test 5: Switch to panePaste tab in articles
            res5 = await eval_js("""
                (() => {
                    const tabPaste = document.querySelector('#importModal .mode-tab[data-pane="panePaste"]');
                    tabPaste.click();
                    const panePaste = document.getElementById('panePaste');
                    const paneUrl = document.getElementById('paneUrl');
                    return {
                        tabPasteActive: tabPaste.classList.contains('active'),
                        panePasteVisible: !panePaste.hidden,
                        paneUrlHidden: paneUrl.hidden
                    };
                })()
            """)
            print("Test 5 (Switch tab to Paste):", res5)
            assert res5["tabPasteActive"] is True
            assert res5["panePasteVisible"] is True
            assert res5["paneUrlHidden"] is True

            # Test 6: Close modal via close button
            res6 = await eval_js("""
                (() => {
                    document.getElementById('closeImportModalBtn').click();
                    return { modalHidden: document.getElementById('importModal').hidden };
                })()
            """)
            print("Test 6 (Close button):", res6)
            assert res6["modalHidden"] is True

            # Test 7: Custom group test via real UI
            res7 = await eval_js("""
                (() => {
                    window.prompt = () => 'Ερευνητικά';
                    document.getElementById('newGroupBtn').click();

                    const allBtns = Array.from(document.querySelectorAll('.group-add-btn'));
                    const customBtn = allBtns.find(b => b.dataset.groupId !== 'grp-books' && b.dataset.groupId !== 'grp-articles');
                    if (!customBtn) return { error: 'Custom group button not created' };
                    customBtn.click();

                    const modal = document.getElementById('importModal');
                    const modeTabs = modal.querySelector('.mode-tabs');
                    const tabFile = modal.querySelector('.mode-tab[data-pane="paneFile"]');
                    const tabUrl = modal.querySelector('.mode-tab[data-pane="paneUrl"]');
                    const tabPaste = modal.querySelector('.mode-tab[data-pane="panePaste"]');
                    const targetSelect = document.getElementById('targetGroupSelect');
                    const title = document.getElementById('importModalTitle').textContent;
                    return {
                        modalVisible: !modal.hidden,
                        modeTabsVisible: !modeTabs.hidden,
                        tabFileVisible: !tabFile.hidden,
                        tabUrlVisible: !tabUrl.hidden,
                        tabPasteVisible: !tabPaste.hidden,
                        targetVal: targetSelect.value,
                        title: title
                    };
                })()
            """)
            print("Test 7 (Custom group all 3 tabs):", res7)
            assert res7["modalVisible"] is True
            assert res7["modeTabsVisible"] is True
            assert res7["tabFileVisible"] is True
            assert res7["tabUrlVisible"] is True
            assert res7["tabPasteVisible"] is True
            assert "grp-" in res7["targetVal"]

            # Test 8: Auto-close on paste save
            res8 = await eval_js("""
                (() => {
                    document.getElementById('pasteTitleInput').value = 'Test Auto Close Article';
                    document.getElementById('pasteInput').value = 'This is content to test automatic modal closing.';
                    document.getElementById('saveToGroupBtn').click();
                    const modal = document.getElementById('importModal');
                    return { modalHidden: modal.hidden };
                })()
            """)
            print("Test 8 (Auto-close on save):", res8)
            assert res8["modalHidden"] is True, "Modal must auto-close after save"

            print("\n>>> ALL 8 AUTOMATION TESTS PASSED 100%! <<<")

    asyncio.run(run_tests())
finally:
    proc.terminate()
    httpd.shutdown()
