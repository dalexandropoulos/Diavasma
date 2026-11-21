/* =========================================================================
   DIAVASMA — Main Application Logic
   ========================================================================= */
(function () {
  "use strict";
  try {
    const I18N = window.DIAVASMA_I18N || {};

    /* --- Persistent Storage Keys & Full Settings State --- */
    const PREFS_KEY = "reading-room-prefs-v14";
    const LIB_KEY = "reading-room-library-v14";
    const GROUPS_KEY = "reading-room-groups-v14";
    const SCRAPERS_KEY = "reading-room-scrapers-v14";

    const DEFAULT_GROUPS = [
      { id: "grp-books", name: "Βιβλία" },
      { id: "grp-articles", name: "Άρθρα" }
    ];

    const DEFAULTS = {
      theme: "paper",
      font: "Literata",
      size: 20,
      lineHeight: 1.72,
      align: "left",
      spread: "1",
      mode: "paged",
      keepAwake: true,
      backgroundPlayback: true,
      ttsVoice: "",
      ttsRate: 1.0,
      lastTrackIdx: 0,
      audioVol: 0.85,
      noiseType: "rain",
      noiseVol: 0.28,
      workMin: 25,
      breakMin: 5,
      showWelcome: true,
      audioShuffle: false,
      audioLoopMode: "none",
      lang: ""
    };

    let prefs = Object.assign({}, DEFAULTS);
    if (prefs.backgroundPlayback === undefined) prefs.backgroundPlayback = true;
    let groups = [...DEFAULT_GROUPS];
    let activeGroupFilter = "all";
    let library = [];
    let scraperRules = [];

    let currentBookId = null;
    let currentGroupId = "grp-articles";
    let bookTitle = "";
    let bookText = "";
    let bookKind = "Άρθρο";
    let bookToc = []; // Embedded file TOC if available
    let effectiveToc = []; // Resolved TOC (embedded -> smart chapter headings -> empty for pages)
    let pages = [];
    let pageIndex = 0;
    let charOffset = 0;
    let bookmarkOffset = 0;
    let highlights = [];
    let bookAudio = null;
    let bookNoise = null;
    let needsRepaginate = true;
        let suppressAudioStateSync = false;
    let suppressNoiseStateSync = false;

    // Active text selection state
    let currentSelection = null;
    let translateTargetLang = "el";
    let selectionDebounceTimer = 0;

    // Search state
    let searchQuery = "";
    let searchMatches = [];
    let activeMatchIdx = -1;

    // TTS State with Live Sentence Highlight Range
    let ttsActive = false;
    let ttsQueue = [];
    let ttsQueueIdx = 0;
    let activeTtsRange = null;
    let currentTtsUtterance = null;

    // Persistent Audio Playlist (IndexedDB)
    let audioTracks = [];
    let trackIdx = -1;
    let playlistReadyPromise = null;

    // Procedural Multi-Layered Ambient Soundscape State
    let audioCtx = null;
    let ambientMasterGain = null;
    let ambientSources = [];
    let ambientIntervals = [];
    let ambientActive = false;

    // Pomodoro
    let pomoTimer = 0;
    let pomoRunning = false;
    let pomoIsBreak = false;
    let pomoRemaining = 25 * 60;
    let toastTimer = 0;
    let pdfJsPromise = null;
    let wheelLock = 0;

    const $ = (sel) => document.querySelector(sel);

    /* --- Load Settings, Groups, Scraper Rules & Library from localStorage --- */
    try {
      const savedPrefs = JSON.parse(localStorage.getItem(PREFS_KEY) || localStorage.getItem("reading-room-prefs-v13") || localStorage.getItem("reading-room-prefs-v12") || "null");
      if (savedPrefs && typeof savedPrefs === "object") prefs = Object.assign(prefs, savedPrefs);
      if (!prefs.lang) {
        const navLang = (navigator.language || "").slice(0, 2).toLowerCase();
        prefs.lang = (typeof I18N !== "undefined" && I18N[navLang]) ? navLang : "el";
      }
      if (typeof prefs.showWelcome === "undefined") prefs.showWelcome = true;

      const savedGroups = JSON.parse(localStorage.getItem(GROUPS_KEY) || localStorage.getItem("reading-room-groups-v13") || localStorage.getItem("reading-room-groups-v12") || "null");
      if (Array.isArray(savedGroups) && savedGroups.length) groups = savedGroups;

      const savedScrapers = JSON.parse(localStorage.getItem(SCRAPERS_KEY) || "null");
      if (Array.isArray(savedScrapers)) scraperRules = savedScrapers;

      const savedLib = JSON.parse(localStorage.getItem(LIB_KEY) || localStorage.getItem("reading-room-library-v13") || localStorage.getItem("reading-room-library-v12") || "[]");
      if (Array.isArray(savedLib)) {
        library = savedLib.map((b, i) => ({
          ...b,
          groupId: b.groupId && groups.some((g) => g.id === b.groupId) ? b.groupId : groups[0].id,
          order: typeof b.order === "number" ? b.order : i,
          toc: Array.isArray(b.toc) ? b.toc : []
        }));
      }
    } catch (_) { }

    pomoRemaining = (Number(prefs.workMin) || 25) * 60;

    function savePrefs() {
      try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (_) { }
    }

    function saveGroups() {
      try { localStorage.setItem(GROUPS_KEY, JSON.stringify(groups)); } catch (_) { }
    }

    function saveScraperRules() {
      try { localStorage.setItem(SCRAPERS_KEY, JSON.stringify(scraperRules)); } catch (_) { }
    }

    function getGroupItems(groupId) {
      return library
        .filter((b) => b.groupId === groupId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    function normalizeGroupOrders(groupId) {
      const items = getGroupItems(groupId);
      items.forEach((item, idx) => { item.order = idx; });
    }

    async function saveLibraryState() {
      if (currentBookId && bookText) {
        const pct = bookText.length ? Math.min(100, Math.round((charOffset / bookText.length) * 100)) : 0;
        const idx = library.findIndex((b) => b.id === currentBookId);
        const existing = idx >= 0 ? library[idx] : (currentBookMeta || {});
        const existingOrder = idx >= 0 ? library[idx].order : getGroupItems(currentGroupId).length;
        const words = (bookText || "").trim().split(/\s+/).filter(Boolean).length;
        const readMins = Math.max(1, Math.round(words / 200));
        const entry = {
          ...existing,
          ...(currentBookMeta || {}),
          id: currentBookId,
          groupId: currentGroupId,
          order: existingOrder,
          kind: bookKind,
          title: bookTitle,
          wordCount: (existing && existing.wordCount) || words,
          readMinutes: (existing && existing.readMinutes) || readMins,
          text: "", // Never store full text in localStorage
          toc: bookToc,
          charOffset: charOffset,
          bookmarkOffset: bookmarkOffset,
          highlights: highlights,
          audio: bookAudio,
          noise: bookNoise,
          progress: pct,
          updatedAt: Date.now(),
          isChunked: true
        };
        if (idx >= 0) library[idx] = entry;
        else library.push(entry);

        // Reliably persist text chunks in AssetDB IndexedDB BEFORE metadata storage
        if (typeof AssetDB !== "undefined" && AssetDB.saveBookChunks) {
          try {
            await AssetDB.saveBookChunks(currentBookId, bookText);
          } catch (err) {
            console.warn("[AssetDB] Error saving chunks for book:", currentBookId, err);
          }
        }
      }

      // Strip text from library records before localStorage persistence to guarantee lightweight metadata
      const chunkPromises = [];
      const lightweightLib = library.map((b) => {
        if (b.text) {
          if (typeof AssetDB !== "undefined" && AssetDB.saveBookChunks) {
            chunkPromises.push(AssetDB.saveBookChunks(b.id, b.text).catch(() => { }));
          }
          return { ...b, text: "", isChunked: true };
        }
        return b;
      });

      if (chunkPromises.length > 0) {
        try { await Promise.allSettled(chunkPromises); } catch (_) { }
      }

      try {
        localStorage.setItem(LIB_KEY, JSON.stringify(lightweightLib));
      } catch (err) {
        console.error("[Storage] localStorage quota exceeded:", err);
        showToast(t("error_db_quota") || "Σφάλμα αποθηκευτικού χώρου: Το quota της συσκευής εξαντλήθηκε.");
      }
      renderLibraryHub();
      updateNotesBadge();
    }

    /* --- Background Audio Manager (Silent Keep-Alive + Media Session API) --- */
    const BackgroundAudioManager = (() => {
      // Minimal inline silent PCM WAV audio anchor (0.1s mono silence, loop = true, volume = 0.01)
      const SILENT_WAV_BASE64 = "data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";

      let keepAliveAudio = null;
      let ttsWatchdogTimer = 0;

      function getOrCreateKeepAliveAudio() {
        if (!keepAliveAudio) {
          keepAliveAudio = new Audio();
          keepAliveAudio.src = SILENT_WAV_BASE64;
          keepAliveAudio.loop = true;
          keepAliveAudio.volume = 0.01;
          keepAliveAudio.preload = "auto";
          keepAliveAudio.setAttribute("playsinline", "true");
        }
        return keepAliveAudio;
      }

      function isMp3Playing() {
        const p = $("#audioPlayer");
        return p && !p.paused && Boolean(p.src);
      }

      function syncKeepAlive() {
        const isBgEnabled = prefs.backgroundPlayback !== false;
        const needsKeepAlive = isBgEnabled && (ttsActive || ambientActive) && !isMp3Playing();

        if (needsKeepAlive) {
          const audio = getOrCreateKeepAliveAudio();
          if (audio.paused) {
            audio.play().catch(() => {});
          }
        } else if (keepAliveAudio && !keepAliveAudio.paused) {
          keepAliveAudio.pause();
        }
      }

      function updateMediaSession() {
        if (!("mediaSession" in navigator)) return;

        const mp3Playing = isMp3Playing();
        const active = mp3Playing || ttsActive || ambientActive;

        if (!active) {
          navigator.mediaSession.playbackState = "none";
          return;
        }

        navigator.mediaSession.playbackState = "playing";

        let title = "Diavasma";
        let artist = "Diavasma";
        let album = "Diavasma";

        if (mp3Playing) {
          const curTrack = (trackIdx >= 0 && audioTracks[trackIdx]) ? audioTracks[trackIdx].name : "";
          title = curTrack || (typeof t === "function" ? t("nav_music") : "Μουσική") || "Μουσική";
          artist = "Diavasma";
          album = "Diavasma Audio";
        } else if (ttsActive) {
          title = bookTitle || "Diavasma";
          artist = "Diavasma · TTS";
          const grp = groups.find((g) => g.id === currentGroupId);
          album = grp ? grp.name : "Diavasma";
        } else if (ambientActive) {
          const noiseName = prefs.noiseType ? ((typeof t === "function" ? t(`noise_${prefs.noiseType}`) : "") || prefs.noiseType) : "Ambient";
          title = `${typeof t === "function" ? (t("nav_music") || "Μουσική") : "Μουσική"}: ${noiseName}`;
          artist = "Diavasma";
          album = "Diavasma Soundscape";
        }

        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            album: album,
            artwork: [
              { src: "./icon-192.png", sizes: "192x192", type: "image/png" },
              { src: "./icon-512.png", sizes: "512x512", type: "image/png" }
            ]
          });
        } catch (_) {}
      }

      function setupActionHandlers() {
        if (!("mediaSession" in navigator)) return;

        const setHandler = (action, handler) => {
          try {
            navigator.mediaSession.setActionHandler(action, handler);
          } catch (_) {}
        };

        setHandler("play", () => {
          const p = $("#audioPlayer");
          if (p && p.paused && p.src && audioTracks.length > 0) {
            p.play().catch(() => {});
          } else if (!ttsActive && bookText) {
            speakCurrentSpread();
          } else if (!ambientActive) {
            startNoise(true);
          }
          sync();
        });

        setHandler("pause", () => {
          const p = $("#audioPlayer");
          if (p && !p.paused) {
            p.pause();
          }
          if (ttsActive) {
            stopTts();
          }
          if (ambientActive) {
            stopNoise(true);
          }
          sync();
        });

        setHandler("stop", () => {
          const p = $("#audioPlayer");
          if (p && !p.paused) {
            p.pause();
          }
          if (ttsActive) {
            stopTts();
          }
          if (ambientActive) {
            stopNoise(true);
          }
          sync();
        });

        setHandler("previoustrack", () => {
          if (audioTracks.length > 0 && isMp3Playing()) {
            playTrack(trackIdx - 1, true);
          } else if (ttsActive) {
            movePage(-1);
          }
          sync();
        });

        setHandler("nexttrack", () => {
          if (audioTracks.length > 0 && isMp3Playing()) {
            playTrack(trackIdx + 1, true);
          } else if (ttsActive) {
            movePage(1);
          }
          sync();
        });
      }

      function startTtsWatchdog() {
        if (ttsWatchdogTimer) clearInterval(ttsWatchdogTimer);
        ttsWatchdogTimer = setInterval(() => {
          if (ttsActive && "speechSynthesis" in window && !window.speechSynthesis.paused) {
            try { window.speechSynthesis.resume(); } catch (_) {}
          }
        }, 10000);
      }

      function stopTtsWatchdog() {
        if (ttsWatchdogTimer) {
          clearInterval(ttsWatchdogTimer);
          ttsWatchdogTimer = 0;
        }
      }

      function sync() {
        syncKeepAlive();
        updateMediaSession();
      }

      function init() {
        setupActionHandlers();
        document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
            if (prefs.backgroundPlayback === false) {
              const p = $("#audioPlayer");
              if (p && !p.paused) {
                p.pause();
              }
              if (ambientActive) {
                stopNoise(false);
              }
              if (ttsActive) {
                stopTts();
              }
              syncKeepAlive();
            } else {
              // Background playback enabled
              syncKeepAlive();
              if (ambientActive && typeof audioCtx !== "undefined" && audioCtx && audioCtx.state === "suspended") {
                audioCtx.resume().catch(() => {});
              }
            }
          } else {
            // Screen / tab visible again
            if (ambientActive && typeof audioCtx !== "undefined" && audioCtx && audioCtx.state === "suspended") {
              audioCtx.resume().catch(() => {});
            }
            if (ttsActive && "speechSynthesis" in window && window.speechSynthesis.paused) {
              try { window.speechSynthesis.resume(); } catch (_) {}
            }
          }
        });
      }

      return {
        init,
        sync,
        syncKeepAlive,
        updateMediaSession,
        startTtsWatchdog,
        stopTtsWatchdog
      };
    })();

    /* --- Screen Wake Lock Manager (Keeps Screen Awake While Reading) --- */
    const WakeLockManager = (function () {
      let sentinel = null;

      async function sync() {
        const shouldStayAwake = Boolean(prefs.keepAwake) && !$("#readingView").hidden && document.visibilityState === "visible";

        if (!shouldStayAwake) {
          if (sentinel) {
            try { await sentinel.release(); } catch (_) { }
            sentinel = null;
          }
          return;
        }

        if (sentinel || !("wakeLock" in navigator)) return;
        try {
          sentinel = await navigator.wakeLock.request("screen");
          sentinel.addEventListener("release", () => {
            sentinel = null;
          });
        } catch (_) {
          sentinel = null;
        }
      }

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") sync();
      });

      return { sync };
    })();

    /* --- Ambient Fireflies Engine (Dark Theme + Fullscreen + 60s Mouse Idle) --- */
    const FireflyEngine = (function () {
      const canvas = $("#fireflyCanvas");
      const ctx = canvas.getContext("2d");
      const COUNT = 30;
      const IDLE_MS = 60000;
      let flies = [];
      let rafId = 0;
      let running = false;
      let idleTimer = 0;

      function isDarkMode() {
        return ["slate", "night", "amoled"].includes(prefs.theme);
      }

      function isZenFullscreen() {
        return $("#app").classList.contains("zen") || Boolean(document.fullscreenElement);
      }

      function getTextExclusionRects() {
        const rects = [];
        const pad = 18;
        const candidates = prefs.mode === "scroll"
          ? [$("#scrollContent")]
          : [$("#contentA"), $("#pageB").hidden ? null : $("#contentB")];

        for (const el of candidates) {
          if (!el || el.offsetParent === null) continue;
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            rects.push({
              left: r.left - pad,
              right: r.right + pad,
              top: r.top - pad,
              bottom: r.bottom + pad
            });
          }
        }
        return rects;
      }

      function isInsideExclusion(x, y, rects) {
        for (const r of rects) {
          if (x > r.left && x < r.right && y > r.top && y < r.bottom) return r;
        }
        return null;
      }

      function spawnInMargins(rects, w, h) {
        for (let attempt = 0; attempt < 40; attempt++) {
          const x = 14 + Math.random() * Math.max(20, w - 28);
          const y = 14 + Math.random() * Math.max(20, h - 28);
          if (!isInsideExclusion(x, y, rects)) return { x, y };
        }
        const leftSide = Math.random() < 0.5;
        return {
          x: leftSide ? (8 + Math.random() * 28) : (w - 8 - Math.random() * 28),
          y: 16 + Math.random() * Math.max(20, h - 32)
        };
      }

      function initFlies() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const rects = getTextExclusionRects();
        flies = [];
        for (let i = 0; i < COUNT; i++) {
          const pos = spawnInMargins(rects, w, h);
          flies.push({
            x: pos.x,
            y: pos.y,
            angle: Math.random() * Math.PI * 2,
            speed: 0.14 + Math.random() * 0.24,
            turnFreq: 0.4 + Math.random() * 0.8,
            turnPhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.9 + Math.random() * 1.4,
            pulsePhase: Math.random() * Math.PI * 2,
            radius: 10 + Math.random() * 7
          });
        }
      }

      function resizeCanvas() {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function frame(nowMs) {
        if (!running) return;
        const t = nowMs * 0.001;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const rects = getTextExclusionRects();

        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";

        for (const f of flies) {
          f.angle += Math.sin(t * f.turnFreq + f.turnPhase) * 0.032;
          let nx = f.x + Math.cos(f.angle) * f.speed;
          let ny = f.y + Math.sin(f.angle) * f.speed;

          if (nx < 10) { nx = 10; f.angle = Math.PI - f.angle; }
          else if (nx > w - 10) { nx = w - 10; f.angle = Math.PI - f.angle; }
          if (ny < 10) { ny = 10; f.angle = -f.angle; }
          else if (ny > h - 10) { ny = h - 10; f.angle = -f.angle; }

          const hit = isInsideExclusion(nx, ny, rects);
          if (hit) {
            const dLeft = Math.abs(nx - hit.left);
            const dRight = Math.abs(hit.right - nx);
            const dTop = Math.abs(ny - hit.top);
            const dBottom = Math.abs(hit.bottom - ny);
            const minD = Math.min(dLeft, dRight, dTop, dBottom);
            if (minD === dLeft) { nx = hit.left - 1; f.angle = Math.PI - f.angle; }
            else if (minD === dRight) { nx = hit.right + 1; f.angle = Math.PI - f.angle; }
            else if (minD === dTop) { ny = hit.top - 1; f.angle = -f.angle; }
            else { ny = hit.bottom + 1; f.angle = -f.angle; }
          }

          f.x = nx;
          f.y = ny;

          const wave = 0.5 + 0.5 * Math.sin(t * f.pulseSpeed + f.pulsePhase);
          const glow = 0.18 + 0.82 * Math.pow(wave, 2.3);
          const r = f.radius * (0.85 + 0.25 * glow);

          const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
          grad.addColorStop(0, `rgba(255, 255, 245, ${0.95 * glow})`);
          grad.addColorStop(0.16, `rgba(255, 232, 130, ${0.72 * glow})`);
          grad.addColorStop(0.45, `rgba(255, 185, 50, ${0.28 * glow})`);
          grad.addColorStop(1, "rgba(255, 155, 25, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * glow})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 1.35, 0, Math.PI * 2);
          ctx.fill();
        }

        rafId = requestAnimationFrame(frame);
      }

      function start() {
        if (running) return;
        if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if ($("#readingView").hidden || !isDarkMode() || !isZenFullscreen()) return;
        resizeCanvas();
        initFlies();
        running = true;
        canvas.classList.add("visible");
        rafId = requestAnimationFrame(frame);
      }

      function stop() {
        canvas.classList.remove("visible");
        if (!running) return;
        running = false;
        cancelAnimationFrame(rafId);
        setTimeout(() => {
          if (!running) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }, 2400);
      }

      function resetIdleTimer() {
        stop();
        clearTimeout(idleTimer);
        if (!$("#readingView").hidden && isDarkMode() && isZenFullscreen()) {
          idleTimer = setTimeout(start, IDLE_MS);
        }
      }

      window.addEventListener("resize", () => {
        if (running) resizeCanvas();
      }, { passive: true });

      return { resetIdleTimer, stop, evaluate: resetIdleTimer };
    })();

    /* --- Multi-Language (i18n) Engine --- */


    function t(key) {
      const curLang = prefs.lang || "el";
      if (I18N[curLang] && I18N[curLang][key]) return I18N[curLang][key];
      if (I18N["el"] && I18N["el"][key]) return I18N["el"][key];
      if (I18N["en"] && I18N["en"][key]) return I18N["en"][key];
      return key;
    }

    function applyLanguage(lang) {
      if (!I18N[lang]) lang = "el";
      prefs.lang = lang;
      savePrefs();
      document.documentElement.lang = lang;
      document.title = `${t("app_name") || "Diavasma"} — ${t("app_title_suffix") || "Χώρος Ανάγνωσης"}`;

      const badge = $("#currentLangBadge");
      if (badge) badge.textContent = lang.toUpperCase();

      document.querySelectorAll(".lang-opt").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
      });

      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (I18N[lang] && I18N[lang][key]) {
          if (el.children.length === 0) {
            el.textContent = I18N[lang][key];
          } else {
            const span = el.querySelector("span[data-i18n]") || el.querySelector("span");
            if (span) span.textContent = I18N[lang][key];
          }
        }
      });

      document.querySelectorAll("[data-i18n-title]").forEach((el) => {
        const key = el.getAttribute("data-i18n-title");
        if (I18N[lang] && I18N[lang][key]) el.title = I18N[lang][key];
      });

      document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
        const key = el.getAttribute("data-i18n-aria");
        if (I18N[lang] && I18N[lang][key]) el.setAttribute("aria-label", I18N[lang][key]);
      });

      document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
        const key = el.getAttribute("data-i18n-ph");
        if (I18N[lang] && I18N[lang][key]) el.placeholder = I18N[lang][key];
      });

      document.querySelectorAll("[data-i18n-label]").forEach((el) => {
        const key = el.getAttribute("data-i18n-label");
        if (I18N[lang] && I18N[lang][key]) el.label = I18N[lang][key];
      });

      document.querySelectorAll("[data-i18n-html]").forEach((el) => {
        const key = el.getAttribute("data-i18n-html");
        if (I18N[lang] && I18N[lang][key]) el.innerHTML = I18N[lang][key];
      });

      const scraperHeading = $("#scraperFormHeading");
      if (scraperHeading) {
        const ruleId = $("#ruleEditIdInput") ? $("#ruleEditIdInput").value : "";
        const domainVal = $("#ruleDomainInput") ? $("#ruleDomainInput").value : "";
        if (ruleId || domainVal) {
          scraperHeading.textContent = `${t("edit_rule_heading")} ${domainVal || ruleId}`;
        } else {
          scraperHeading.textContent = t("new_rule_heading");
        }
      }

      const scrapersView = $("#scrapersHubView");
      const headerTitle = $("#headerTitle");
      if (scrapersView && !scrapersView.classList.contains("d-none") && !scrapersView.hidden) {
        if (headerTitle) headerTitle.textContent = t("scrapers_title");
      }

/* #brandHeader is static */

      const statsMsgInput = $("#statsCustomMsgInput");
      if (statsMsgInput) {
        const prevDefaults = [
          "Η συνήθεια της καθημερινής ανάγνωσης", "The habit of daily reading",
          "El hábito de la lectura diaria", "L'habitude de la lecture quotidienne",
          "Die Gewohnheit des täglichen Lesens", "Привычка ежедневного чтения",
          "每日阅读的好习惯", "毎日の読书习惯", "毎日の読書習慣", "दैनिक पढ़ने की आदत", "O hábito da leitura diária"
        ];
        if (!statsMsgInput.value || prevDefaults.includes(statsMsgInput.value.trim())) {
          statsMsgInput.value = t("stats_default_custom_msg") || "Η συνήθεια της καθημερινής ανάγνωσης";
        }
        if (typeof StatsCardStudio !== "undefined") {
          StatsCardStudio.customMessage = statsMsgInput.value;
          if (typeof StatsCardStudio.render === "function") StatsCardStudio.render();
        }
      }

      const pasteInput = $("#pasteInput");
      const countHint = $("#wordCountHint");
      if (countHint) {
        const words = pasteInput && pasteInput.value ? pasteInput.value.trim().split(/\s+/).filter(Boolean).length : 0;
        countHint.textContent = `${words} ${t("lbl_words") || "λέξεις"}`;
      }

      if (typeof updateHubUI === "function") updateHubUI();
      if (typeof renderLibraryHub === "function") renderLibraryHub();
      if (typeof syncGroupSelectors === "function") syncGroupSelectors();
      if (typeof buildOutline === "function") buildOutline();
      if (typeof renderScraperRulesList === "function") renderScraperRulesList();
      if (typeof renderNotesDrawer === "function") renderNotesDrawer();
      if (typeof updatePomoUI === "function") updatePomoUI();
      if (typeof ReadingStatsEngine !== "undefined" && typeof ReadingStatsEngine.render === "function") ReadingStatsEngine.render();
      if (typeof StatsCardStudio !== "undefined" && typeof StatsCardStudio.draw === "function") StatsCardStudio.draw();
      if (typeof QuoteCardStudio !== "undefined" && typeof QuoteCardStudio.draw === "function") QuoteCardStudio.draw();
    }
    window.applyLanguage = applyLanguage;

    /* --- IndexedDB Persistent Fonts --- */
    const FontDB = {
      open() {
        return new Promise((resolve, reject) => {
          if (!window.indexedDB) return reject(new Error("No IndexedDB"));
          const req = indexedDB.open("reading-room-fonts-v1", 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("fonts")) {
              db.createObjectStore("fonts", { keyPath: "id", autoIncrement: true });
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      },
      async getAll() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("fonts", "readonly");
          const req = tx.objectStore("fonts").getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
      },
      async addFile(file) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("fonts", "readwrite");
          const store = tx.objectStore("fonts");
          const cleanName = file.name.replace(/\.[^/.]+$/, "").trim() || "CustomFont";
          const record = {
            name: cleanName,
            fileName: file.name,
            type: file.type,
            size: file.size,
            blob: file,
            addedAt: Date.now()
          };
          const addReq = store.add(record);
          addReq.onsuccess = () => resolve(addReq.result);
          tx.onerror = () => reject(tx.error);
        });
      },
      async remove(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("fonts", "readwrite");
          tx.objectStore("fonts").delete(id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    };
    window.FontDB = FontDB;

    let uploadedFonts = [];

    async function refreshUploadedFonts() {
      try {
        const saved = await FontDB.getAll();
        uploadedFonts = [];
        for (const f of saved) {
          const family = `UserFont_${f.id}`;
          try {
            const buf = await f.blob.arrayBuffer();
            const face = new FontFace(family, buf);
            const loaded = await face.load();
            document.fonts.add(loaded);
            uploadedFonts.push({ id: f.id, name: f.name, family });
          } catch (err) {
            console.warn("Failed loading font:", f.name, err);
          }
        }
      } catch (err) {
        console.warn("FontDB error:", err);
      }
      renderUploadedFontsUI();
    }

    function renderUploadedFontsUI() {
      const optgroup = $("#uploadedFontsOptgroup");
      if (optgroup) {
        optgroup.innerHTML = "";
        if (uploadedFonts.length > 0) {
          optgroup.hidden = false;
          uploadedFonts.forEach((uf) => {
            const opt = document.createElement("option");
            opt.value = uf.family;
            opt.textContent = `${uf.name} (${t("uploaded_tag") || "Custom"})`;
            optgroup.appendChild(opt);
          });
        } else {
          optgroup.hidden = true;
        }
      }
      if ($("#fontSelect")) $("#fontSelect").value = prefs.font;

      const box = $("#fontsBox");
      if (!box) return;
      if (!uploadedFonts.length) {
        box.hidden = true;
        box.innerHTML = "";
        return;
      }
      box.hidden = false;
      box.innerHTML = "";
      uploadedFonts.forEach((uf) => {
        const row = document.createElement("div");
        row.className = "font-row" + (prefs.font === uf.family ? " active" : "");
        row.innerHTML = `
            <span class="font-name" title="${escapeHtml(uf.name)}">${prefs.font === uf.family ? "✓ " : ""}${escapeHtml(uf.name)}</span>
            <button class="font-del" title="${t("btn_delete") || "Διαγραφή"}" aria-label="Διαγραφή">×</button>
          `;
        row.addEventListener("click", (e) => {
          if (e.target.closest(".font-del")) return;
          prefs.font = uf.family;
          applyPrefs(true);
          renderUploadedFontsUI();
        });
        row.querySelector(".font-del").addEventListener("click", async (e) => {
          e.stopPropagation();
          await FontDB.remove(uf.id);
          if (prefs.font === uf.family) {
            prefs.font = "Literata";
            applyPrefs(true);
          }
          await refreshUploadedFonts();
          showToast(t("toast_font_deleted"));
        });
        box.appendChild(row);
      });
    }

    async function handleFontFiles(fileList) {
      const valid = Array.from(fileList || []).filter((f) =>
        /\.(woff|woff2|ttf|otf)$/i.test(f.name) || (f.type && f.type.startsWith("font/"))
      );
      if (!valid.length) {
        showToast(t("toast_font_invalid"));
        return;
      }
      for (const f of valid) {
        const newId = await FontDB.addFile(f);
        prefs.font = `UserFont_${newId}`;
      }
      await refreshUploadedFonts();
      applyPrefs(true);
      showToast(t("toast_font_loaded"));
    }

    function setupDropzone(dropzoneSelector, inputSelector, fileHandler) {
      const zone = $(dropzoneSelector);
      const input = $(inputSelector);
      if (!zone || !input) return;

      zone.addEventListener("click", () => input.click());
      zone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          input.click();
        }
      });

      input.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length) {
          fileHandler(e.target.files);
          e.target.value = "";
        }
      });

      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add("drag-over");
      });
      zone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove("drag-over");
      });
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove("drag-over");
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          fileHandler(e.dataTransfer.files);
        }
      });
    }

    /* --- JSON Extract / Export & Import for Rules & Settings --- */
    function exportScraperRules() {
      if (!scraperRules || !scraperRules.length) {
        showToast(t("toast_no_rules_export") || "Δεν υπάρχουν κανόνες για εξαγωγή.");
        return;
      }
      const exportPayload = {
        app: "Diavasma",
        type: "scraper-rules",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        rules: scraperRules
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `reading-room-rules-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast(t("toast_rules_exported"));
    }

    function importScraperRulesFromFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const imported = Array.isArray(data) ? data : (data && Array.isArray(data.rules) ? data.rules : null);
          if (!imported || !imported.length) {
            showToast(t("toast_invalid_json") || "Μη έγκυρο αρχείο JSON.");
            return;
          }
          let count = 0;
          imported.forEach((r) => {
            if (!r || !r.domain) return;
            const norm = normalizeDomainInput(r.domain);
            const idx = scraperRules.findIndex((existing) => normalizeDomainInput(existing.domain) === norm);
            if (idx >= 0) {
              scraperRules[idx] = Object.assign({}, scraperRules[idx], r);
            } else {
              scraperRules.push(r);
            }
            count++;
          });
          saveScraperRules();
          renderScraperRulesList();
          showToast(`${t("toast_rules_imported")} (${count})`);
        } catch (_) {
          showToast(t("toast_json_read_error") || "Σφάλμα κατά την ανάγνωση του JSON.");
        }
      };
      reader.readAsText(file, "UTF-8");
    }

    function exportSettings() {
      const exportPayload = {
        app: "Diavasma",
        type: "settings",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        settings: {
          theme: prefs.theme,
          font: prefs.font,
          size: prefs.size,
          lineHeight: prefs.lineHeight,
          align: prefs.align,
          spread: prefs.spread,
          mode: prefs.mode,
          keepAwake: prefs.keepAwake,
          ttsRate: prefs.ttsRate,
          ttsVoice: prefs.ttsVoice,
          workMin: prefs.workMin,
          breakMin: prefs.breakMin,
          backgroundPlayback: prefs.backgroundPlayback !== false,
          audioVol: prefs.audioVol,
          audioShuffle: Boolean(prefs.audioShuffle),
          audioLoopMode: prefs.audioLoopMode || "none",
          noiseType: prefs.noiseType,
          noiseVol: prefs.noiseVol,
          showWelcome: prefs.showWelcome !== false,
          lang: prefs.lang
        }
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `reading-room-settings-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast(t("toast_settings_exported"));
    }

    function importSettingsFromFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const incoming = data && data.settings ? data.settings : data;
          if (!incoming || typeof incoming !== "object") {
            showToast(t("toast_invalid_settings_file") || "Μη έγκυρο αρχείο ρυθμίσεων.");
            return;
          }
          Object.keys(DEFAULTS).forEach((k) => {
            if (incoming[k] !== undefined) prefs[k] = incoming[k];
          });
          savePrefs();
          applyPrefs(true);
          if (prefs.lang) applyLanguage(prefs.lang);
          showToast(t("toast_settings_imported"));
        } catch (_) {
          showToast(t("toast_json_read_error") || "Σφάλμα κατά την ανάγνωση των ρυθμίσεων JSON.");
        }
      };
      reader.readAsText(file, "UTF-8");
    }

    /* --- Hourglass Simulation Screensaver by Masahito (ma5a.com / CodePen: emYPavz) --- */
    const HourglassScreensaver = (() => {
      const backgroundImages = {
        future: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAAAXNSR0IArs4c6QAAAHxJREFUSEvlVEEKwDAIa/7/aIcDRxE17rB20J5aFGOiKcamg02443BgERGVHkCqhOZU8e7oHoBuwW4ea+B/wDMzu9sojI1KHuVp3I/Nv2/GbwvOM84aZDmp1BUTVtTvQURsGbB3wnJgU6Pc6szXbHEiy4XLxTz3Rfy8v/oCexTYEcTeEjAAAAAASUVORK5CYII=',
        now: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAAAXNSR0IArs4c6QAAAH5JREFUSEvllUsOwCAIBeX+h8awoHlFsGhSXOhOAgxfpXbo0CFuuxjMzExEQwU8uciwRdYu4+sBZZQFFgWC8IyvF1gcz6KPHNqAlsECtUZ43wFH9m6pI+XfwVi60ox1YnV6te8lGSP8a2Kzc4F6y+ukbZjtsadjN+biJ7P6l+ryRuwRlNfZlgAAAABJRU5ErkJggg==',
        past: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAQCAYAAAABOs/SAAAAAXNSR0IArs4c6QAAAIRJREFUSEvtlEEOwCAIBOX/j8ZwIEEKdIkmHlpvypqFAaVxadEl3/EbHyXPzExEIdXHoYjVPbuEZgcbe6HdVwllsW3jt4QsGdXaZISQp7egrgwsXk8ia0mrYmvgK0FiUfXRTJQV6wWUhOhRGtvGnf4vxLLeeTx+crsTXw4X+j5P6L73V08enaAR6ux4iQAAAABJRU5ErkJggg=='
      };

      const px = num => `${num}px`;

      const settings = {
        friction: 0.3,
        bounce: 0.2,
        gravity: 3,
        lines: [],
        objects: []
      };

      let animTimer = null;
      let isInitialized = false;

      class Vector {
        constructor(props) {
          Object.assign(this, { x: 0, y: 0, ...props });
        }
        setXy(xy) { this.x = xy.x; this.y = xy.y; }
        addXy(xy) { this.x += xy.x; this.y += xy.y; }
        multiplyXy(n) { this.x *= n; this.y *= n; }
      }

      class WorldObject {
        constructor(props) {
          Object.assign(this, {
            w: 0, h: 0, pos: { x: 0, y: 0 },
            id: settings.objects.length,
            ...props
          });
          const wrapper = document.getElementById("pomoSaverWrapper");
          if (this.wrapper) {
            this.el = this.wrapper.querySelector(".pomo-sand");
          }
          if (wrapper && this.el) wrapper.appendChild(this.el);
          this.defPos = { x: this.pos.x, y: this.pos.y };
          this.setStyles();
        }
        setStyles() {
          const { el, pos: { x, y }, w, h } = this;
          if (!el) return;
          if (w) el.style.width = px(w);
          if (h) el.style.height = px(h);
          if (this.wrapper) {
            Object.assign(el.style, {
              marginTop: px(h * -0.5),
              marginLeft: px(w * -0.5)
            });
          }
          el.style.transform = `translate(${x ? px(x) : 0}, ${y ? px(y) : 0})`;
        }
        distanceBetween(target) {
          return Math.sqrt(Math.pow((this.pos.x - target.x), 2) + Math.pow((this.pos.y - target.y), 2));
        }
      }

      class Line {
        constructor(props) {
          Object.assign(this, {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
            ...props
          });
        }
        get length() {
          return Math.sqrt(Math.pow((this.start.x - this.end.x), 2) + Math.pow((this.start.y - this.end.y), 2));
        }
        get dx() { return this.end.x - this.start.x; }
        get dy() { return this.end.y - this.start.y; }
      }

      class GravityObject extends WorldObject {
        constructor(props) {
          super({
            wrapper: Object.assign(document.createElement("div"), {
              innerHTML: '<div class="pomo-sand"></div>'
            }),
            pos: new Vector({ x: props.x, y: props.y }),
            velocity: new Vector({ x: 0, y: 0.1 }),
            acceleration: new Vector({ x: 0, y: settings.gravity }),
            w: 30,
            h: 16,
            radius: 10,
            isAtBottom: false,
            isFaded: false,
            ...props
          });
        }
        accelerate() { this.velocity.addXy(this.acceleration); }
        hitCheckWalls() {
          const width = 300;
          const height = 440;
          const buffer = 0;
          if (this.pos.x + this.radius + buffer > width) {
            this.pos.x = width - this.radius;
            this.velocity.x *= settings.bounce;
          }
          if (this.pos.x - (this.radius + buffer) < 0) {
            this.pos.x = this.radius;
            this.velocity.x *= settings.bounce;
          }
          if (this.pos.y + this.radius + buffer > height) {
            this.pos.y = height - this.radius;
            this.velocity.y *= settings.bounce;
          }
          if (this.pos.y - this.radius < 0) {
            this.pos.y = this.radius;
            this.velocity.y *= settings.bounce;
          }
        }
        getNewPosBasedOnTarget = ({ target, distance: d, fullDistance }) => {
          const { pos: { x: aX, y: aY } } = this;
          const { x: bX, y: bY } = target;
          const remainingD = fullDistance - d;
          return {
            x: Math.round(((remainingD * aX) + (d * bX)) / fullDistance),
            y: Math.round(((remainingD * aY) + (d * bY)) / fullDistance)
          };
        };
        hitCheckLine(line) {
          const t = Math.max(0, Math.min(1, ((this.pos.x - line.start.x) * line.dx + (this.pos.y - line.start.y) * line.dy) / Math.pow(line.length, 2)));
          const closestXy = {
            x: line.start.x + t * line.dx,
            y: line.start.y + t * line.dy
          };
          const fullDistance = this.distanceBetween(closestXy);
          if (fullDistance < this.radius) {
            const overlap = this.radius - fullDistance;
            const normalX = (this.pos.x - closestXy.x) / (fullDistance || 1);
            const normalY = (this.pos.y - closestXy.y) / (fullDistance || 1);
            this.pos.setXy({
              x: this.pos.x + normalX * overlap,
              y: this.pos.y + normalY * overlap
            });
            if (!this.pos.x || !this.pos.y) {
              this.pos.setXy(closestXy);
            }
            this.velocity.multiplyXy(-0.8);
            this.velocity.y *= -0.6;
          }
        }
        spaceOutObjects() {
          settings.objects.forEach((o) => {
            if (this.id === o.id || this.isFaded) return;
            const distanceBetweenObjects = this.distanceBetween(o.pos);
            if (distanceBetweenObjects < (this.radius * 2)) {
              const overlap = distanceBetweenObjects - (this.radius * 2);
              this.pos.setXy(
                this.getNewPosBasedOnTarget({
                  target: o.pos,
                  distance: overlap / 2,
                  fullDistance: distanceBetweenObjects
                })
              );
            }
          });
        }
        fadeIn() {
          setTimeout(() => {
            if (!this.el) return;
            this.el.className = "pomo-sand fade-in";
            this.pos.x = this.defPos.x;
            this.pos.y = 0;
            this.isFaded = false;
            this.isAtBottom = false;
            setTimeout(() => {
              if (this.el) this.el.classList.remove("fade-in");
            }, 2000);
          }, 1000);
        }
        fadeAndFadeIn() {
          if (this.el) this.el.classList.add("fade-out");
          this.isFaded = true;
          this.fadeIn();
        }
        reset() {
          if (this.el) this.el.classList.add("d-none");
          this.isFaded = true;
          this.fadeIn();
        }
        animateObject() {
          this.spaceOutObjects();
          this.hitCheckWalls();
          settings.lines.forEach((l) => this.hitCheckLine(l));
          this.accelerate();
          this.velocity.multiplyXy(settings.friction);
          this.pos.addXy(this.velocity);

          if (!this.pos.x || !this.pos.y) {
            this.reset();
          }
          this.setStyles();

          if (this.el) {
            const bgKey = this.pos.y < 210
              ? "future"
              : Math.abs(this.pos.y - 190) < 40
                ? "now"
                : "past";
            const imgUrl = `url("${backgroundImages[bgKey]}")`;
            this.el.style.webkitMaskImage = imgUrl;
            this.el.style.maskImage = imgUrl;
            this.el.style.backgroundColor = "var(--ink)";
          }

          if (this.pos.y > 430 && !this.isAtBottom) {
            this.isAtBottom = true;
            setTimeout(() => {
              this.fadeAndFadeIn();
            }, 1500);
          }
        }
      }

      function init() {
        if (isInitialized) return;
        const wrapper = document.getElementById("pomoSaverWrapper");
        if (!wrapper) return;

        const timeSeed = [
          { x: 93, y: 30 }, { x: 201, y: 30 }, { x: 129, y: 31 }, { x: 166, y: 31 },
          { x: 176, y: 47 }, { x: 211, y: 47 }, { x: 73, y: 48 }, { x: 142, y: 48 },
          { x: 39, y: 49 }, { x: 108, y: 49 }, { x: 245, y: 49 }, { x: 169, y: 64 },
          { x: 133, y: 65 }, { x: 236, y: 65 }, { x: 32, y: 66 }, { x: 67, y: 66 },
          { x: 99, y: 66 }, { x: 204, y: 66 }, { x: 268, y: 66 }, { x: 32, y: 84 },
          { x: 70, y: 84 }, { x: 104, y: 84 }, { x: 144, y: 84 }, { x: 181, y: 84 },
          { x: 223, y: 85 }, { x: 259, y: 85 }, { x: 105, y: 102 }, { x: 141, y: 102 },
          { x: 35, y: 103 }, { x: 70, y: 103 }, { x: 179, y: 103 }, { x: 214, y: 103 },
          { x: 254, y: 104 }, { x: 78, y: 121 }, { x: 112, y: 121 }, { x: 145, y: 121 },
          { x: 180, y: 121 }, { x: 44, y: 122 }, { x: 214, y: 122 }, { x: 250, y: 124 },
          { x: 128, y: 140 }, { x: 168, y: 140 }, { x: 56, y: 141 }, { x: 89, y: 141 },
          { x: 209, y: 141 }, { x: 244, y: 141 }, { x: 147, y: 158 }, { x: 192, y: 158 },
          { x: 231, y: 158 }, { x: 66, y: 159 }, { x: 109, y: 159 }, { x: 115, y: 175 },
          { x: 147, y: 175 }, { x: 180, y: 175 }, { x: 215, y: 176 }, { x: 81, y: 177 },
          { x: 114, y: 194 }, { x: 147, y: 194 }, { x: 180, y: 195 }, { x: 147, y: 212 }
        ];

        timeSeed.forEach((b) => settings.objects.push(new GravityObject(b)));

        [
          { start: { x: 0, y: 0 }, end: { x: 10, y: 100 } },
          { start: { x: 10, y: 100 }, end: { x: 60, y: 180 } },
          { start: { x: 60, y: 180 }, end: { x: 130, y: 220 } },
          { start: { x: 130, y: 220 }, end: { x: 60, y: 260 } },
          { start: { x: 60, y: 260 }, end: { x: 10, y: 340 } },
          { start: { x: 10, y: 340 }, end: { x: 0, y: 440 } },
          { start: { x: 300, y: 0 }, end: { x: 290, y: 100 } },
          { start: { x: 290, y: 100 }, end: { x: 240, y: 180 } },
          { start: { x: 240, y: 180 }, end: { x: 170, y: 220 } },
          { start: { x: 170, y: 220 }, end: { x: 240, y: 260 } },
          { start: { x: 240, y: 260 }, end: { x: 290, y: 340 } },
          { start: { x: 290, y: 340 }, end: { x: 300, y: 440 } }
        ].forEach((l) => settings.lines.push(new Line(l)));

        isInitialized = true;
      }

      function updateSandglassScale() {
        const outer = document.getElementById("pomoSaverOuter");
        const wrapper = document.getElementById("pomoSaverWrapper");
        if (!outer || !wrapper) return;
        const availW = outer.clientWidth - 16;
        const availH = outer.clientHeight - 16;
        if (availW <= 0 || availH <= 0) return;
        const scaleW = availW / 300;
        const scaleH = availH / 536;
        const scale = Math.min(scaleW, scaleH);
        const clampedScale = Math.max(0.40, Math.min(scale, 1.45));
        wrapper.style.transform = `scale(${clampedScale.toFixed(3)})`;
      }

      function start() {
        if (!isInitialized) init();
        updateSandglassScale();
        requestAnimationFrame(() => updateSandglassScale());
        if (animTimer) return;
        animTimer = setInterval(() => {
          settings.objects.forEach((o) => o.animateObject());
        }, 17);
      }

      function stop() {
        if (animTimer) {
          clearInterval(animTimer);
          animTimer = null;
        }
      }

      return { init, start, stop, updateSandglassScale };
    })();

    window.addEventListener("resize", () => {
      const ov = document.getElementById("pomodoroBreakOverlay");
      if (ov && !ov.hidden && typeof HourglassScreensaver !== "undefined") {
        HourglassScreensaver.updateSandglassScale();
      }
    }, { passive: true });

    /* --- Category 1: IndexedDB AssetDB for Large Assets & Chunked Books --- */
    const AssetDB = {
      dbPromise: null,
      open() {
        if (this.dbPromise) return this.dbPromise;
        this.dbPromise = new Promise((resolve, reject) => {
          if (!window.indexedDB) return reject(new Error("No IndexedDB"));
          const req = indexedDB.open("reading-room-assets-v1", 2);
          req.onupgradeneeded = (e) => {
            const db = req.result;
            if (!db.objectStoreNames.contains("book_chunks")) {
              const store = db.createObjectStore("book_chunks", { keyPath: "id" });
              store.createIndex("bookId", "bookId", { unique: false });
            }
            if (!db.objectStoreNames.contains("pagination_cache")) {
              const pStore = db.createObjectStore("pagination_cache", { keyPath: "key" });
              pStore.createIndex("bookId", "bookId", { unique: false });
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        return this.dbPromise;
      },
      async saveBookChunks(bookId, fullText, chunkSize = 131072) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("book_chunks", "readwrite");
          const store = tx.objectStore("book_chunks");
          const idx = store.index("bookId");
          const req = idx.getAllKeys(bookId);
          req.onsuccess = () => {
            (req.result || []).forEach((k) => store.delete(k));
            const len = fullText.length;
            let cIdx = 0;
            for (let offset = 0; offset < len; offset += chunkSize) {
              const slice = fullText.slice(offset, offset + chunkSize);
              store.put({
                id: `${bookId}_c_${cIdx}`,
                bookId: bookId,
                chunkIdx: cIdx,
                start: offset,
                end: offset + slice.length,
                text: slice
              });
              cIdx++;
            }
          };
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      },
      async getFullBookText(bookId) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("book_chunks", "readonly");
          const store = tx.objectStore("book_chunks");
          const idx = store.index("bookId");
          const req = idx.getAll(bookId);
          req.onsuccess = () => {
            const chunks = req.result || [];
            if (!chunks.length) return resolve(null);
            chunks.sort((a, b) => a.chunkIdx - b.chunkIdx);
            resolve(chunks.map((c) => c.text).join(""));
          };
          req.onerror = () => reject(req.error);
        });
      },
      async getPagination(key) {
        try {
          const db = await this.open();
          return new Promise((resolve) => {
            const tx = db.transaction("pagination_cache", "readonly");
            const store = tx.objectStore("pagination_cache");
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result ? req.result.offsets : null);
            req.onerror = () => resolve(null);
          });
        } catch (_) {
          return null;
        }
      },
      async savePagination(key, bookId, offsets) {
        try {
          const db = await this.open();
          return new Promise((resolve) => {
            const tx = db.transaction("pagination_cache", "readwrite");
            const store = tx.objectStore("pagination_cache");
            store.put({ key, bookId, offsets, updatedAt: Date.now() });
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
          });
        } catch (_) {}
      },
      async deletePaginationByBook(bookId) {
        try {
          const db = await this.open();
          return new Promise((resolve) => {
            const tx = db.transaction("pagination_cache", "readwrite");
            const store = tx.objectStore("pagination_cache");
            const idx = store.index("bookId");
            const req = idx.getAllKeys(bookId);
            req.onsuccess = () => {
              (req.result || []).forEach((k) => store.delete(k));
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
          });
        } catch (_) {}
      },
      async cleanupOrphans(validBookIds = []) {
        try {
          const db = await this.open();
          const idSet = new Set(validBookIds);
          // 1. Cleanup book_chunks orphans
          await new Promise((resolve) => {
            const tx = db.transaction("book_chunks", "readwrite");
            const store = tx.objectStore("book_chunks");
            const req = store.openCursor();
            req.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor) {
                const record = cursor.value;
                if (record && record.bookId && !idSet.has(record.bookId)) {
                  cursor.delete();
                }
                cursor.continue();
              } else {
                resolve();
              }
            };
            req.onerror = () => resolve();
          });

          // 2. Cleanup pagination_cache orphans
          await new Promise((resolve) => {
            const tx = db.transaction("pagination_cache", "readwrite");
            const store = tx.objectStore("pagination_cache");
            const req = store.openCursor();
            req.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor) {
                const record = cursor.value;
                if (record && record.bookId && !idSet.has(record.bookId)) {
                  cursor.delete();
                }
                cursor.continue();
              } else {
                resolve();
              }
            };
            req.onerror = () => resolve();
          });
        } catch (err) {
          console.warn("[AssetDB] Cleanup orphans error:", err);
        }
      },
      async deleteBook(bookId) {
        try {
          const db = await this.open();
          await new Promise((resolve, reject) => {
            const tx = db.transaction("book_chunks", "readwrite");
            const store = tx.objectStore("book_chunks");
            const idx = store.index("bookId");
            const req = idx.getAllKeys(bookId);
            req.onsuccess = () => {
              (req.result || []).forEach((k) => store.delete(k));
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          });
          await this.deletePaginationByBook(bookId);
        } catch (err) {
          console.warn("[AssetDB] Delete book error:", err);
        }
      }
    };
    window.AssetDB = AssetDB;

    /* Startup Migration: Move Large Books from localStorage to AssetDB Chunks */
    async function migrateLibraryToChunks() {
      try {
        let dirty = false;
        for (const item of library) {
          if (item.text) {
            if (!item.wordCount || !item.readMinutes) {
              const words = item.text.trim().split(/\s+/).filter(Boolean).length;
              item.wordCount = item.wordCount || words;
              item.readMinutes = item.readMinutes || Math.max(1, Math.round(words / 200));
            }
            await AssetDB.saveBookChunks(item.id, item.text);
            item.isChunked = true;
            item.textSample = item.text.slice(0, 300);
            item.text = ""; // Free memory in library array
            dirty = true;
          }
        }
        if (dirty) {
          saveLibraryState();
          console.log("[AssetDB] Successfully migrated all book texts to IndexedDB chunks.");
        }
        // Clean orphan chunks that don't belong to any item in library
        const validIds = library.map((b) => b.id);
        await AssetDB.cleanupOrphans(validIds);
      } catch (err) {
        console.warn("[AssetDB] Migration/cleanup error (non-fatal):", err);
      }
    }

    /* --- IndexedDB Persistent Audio Playlist (Virtualized / On-Demand Loading) --- */
    const AudioDB = {
      open() {
        return new Promise((resolve, reject) => {
          if (!window.indexedDB) return reject(new Error("No IndexedDB"));
          const req = indexedDB.open("reading-room-audio-v1", 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("tracks")) {
              db.createObjectStore("tracks", { keyPath: "id", autoIncrement: true });
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      },
      async getAllMetadata() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("tracks", "readonly");
          const store = tx.objectStore("tracks");
          const items = [];
          const req = store.openCursor();
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              const val = cursor.value;
              items.push({ id: val.id, name: val.name, size: val.size, type: val.type, addedAt: val.addedAt });
              cursor.continue();
            } else {
              resolve(items);
            }
          };
          req.onerror = () => reject(req.error);
        });
      },
      async getTrackBlob(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("tracks", "readonly");
          const req = tx.objectStore("tracks").get(id);
          req.onsuccess = () => resolve(req.result ? req.result.blob : null);
          req.onerror = () => reject(req.error);
        });
      },
      async addFiles(files) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("tracks", "readwrite");
          const store = tx.objectStore("tracks");
          for (const f of files) {
            store.add({ name: f.name, type: f.type, size: f.size, blob: f, addedAt: Date.now() });
          }
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      },
      async remove(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("tracks", "readwrite");
          tx.objectStore("tracks").delete(id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    };
    window.AudioDB = AudioDB;

    const audioPlayer = $("#audioPlayer");
    let lastNonZeroAudioVol = Number(prefs.audioVol) || 0.85;
    let isSeekingAudio = false;

    if (typeof prefs.audioShuffle === "undefined") prefs.audioShuffle = false;
    if (typeof prefs.audioLoopMode === "undefined") prefs.audioLoopMode = "none";

    function formatAudioTime(seconds) {
      if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }

    function updateMiniPlayerUI() {
      const titleEl = $("#miniPlayerTitle");
      const timeEl = $("#miniPlayerTime");
      const seekRange = $("#audioSeekRange");

      if (trackIdx >= 0 && audioTracks[trackIdx]) {
        if (titleEl) titleEl.textContent = audioTracks[trackIdx].name;
      } else {
        if (titleEl) titleEl.textContent = t("player_no_track") || "Κανένα κομμάτι σε αναπαραγωγή";
      }

      const cur = audioPlayer.currentTime || 0;
      const dur = audioPlayer.duration || 0;
      if (timeEl) {
        timeEl.textContent = `${formatAudioTime(cur)} / ${formatAudioTime(dur)}`;
      }
      if (seekRange && !isSeekingAudio) {
        seekRange.value = dur > 0 ? String((cur / dur) * 100) : "0";
      }
    }

    function updateMiniPlayerControls() {
      const playBtn = $("#playPauseTrackBtn");
      if (playBtn) {
        const isPlaying = !audioPlayer.paused && Boolean(audioPlayer.src);
        const playIcon = playBtn.querySelector(".play-icon");
        const pauseIcon = playBtn.querySelector(".pause-icon");
        if (playIcon) playIcon.style.display = isPlaying ? "none" : "";
        if (pauseIcon) pauseIcon.style.display = isPlaying ? "" : "none";
        const title = isPlaying ? (t("player_pause") || "Παύση") : (t("player_play") || "Αναπαραγωγή");
        playBtn.title = title;
        playBtn.setAttribute("aria-label", title);
      }

      const shuffleBtn = $("#shuffleTrackBtn");
      if (shuffleBtn) {
        shuffleBtn.classList.toggle("active", Boolean(prefs.audioShuffle));
      }

      const loopBtn = $("#loopModeBtn");
      if (loopBtn) {
        const mode = prefs.audioLoopMode || "none";
        loopBtn.classList.toggle("active", mode !== "none");
        const badgeOne = loopBtn.querySelector(".loop-badge-one");
        if (badgeOne) badgeOne.style.display = mode === "one" ? "" : "none";
        let title = t("player_loop_none") || "Χωρίς επανάληψη";
        if (mode === "all") title = t("player_loop_all") || "Επανάληψη όλων";
        else if (mode === "one") title = t("player_loop_one") || "Επανάληψη τρέχοντος";
        loopBtn.title = title;
        loopBtn.setAttribute("aria-label", title);
      }
    }

    function updateNoiseUI(isActive) {
      const nBtn = $("#noiseToggleBtn");
      if (!nBtn) return;
      nBtn.classList.toggle("active", Boolean(isActive));
      const playIcon = nBtn.querySelector(".ambient-play-icon");
      const pauseIcon = nBtn.querySelector(".ambient-pause-icon");
      if (playIcon) playIcon.style.display = isActive ? "none" : "";
      if (pauseIcon) pauseIcon.style.display = isActive ? "" : "none";
      const title = isActive ? (t("noise_stop") || "Διακοπή") : (t("noise_start") || "Έναρξη");
      nBtn.title = title;
      nBtn.setAttribute("aria-label", title);
    }

    function updateMusicVolUI(vol, isMuted) {
      const range = $("#musicVolRange");
      const valSpan = $("#musicVolValue");
      const muteBtn = $("#musicMuteBtn");
      if (!range) return;

      range.value = String(vol);
      if (valSpan) valSpan.textContent = isMuted ? "0%" : `${Math.round(vol * 100)}%`;

      if (muteBtn) {
        const unmutedIcon = muteBtn.querySelector(".vol-icon-unmuted");
        const mutedIcon = muteBtn.querySelector(".vol-icon-muted");
        const showMuted = isMuted || vol === 0;
        if (unmutedIcon) unmutedIcon.style.display = showMuted ? "none" : "";
        if (mutedIcon) mutedIcon.style.display = showMuted ? "" : "none";
        const title = showMuted ? (t("title_unmute") || "Κατάργηση σίγασης") : (t("title_mute") || "Σίγαση");
        muteBtn.title = title;
        muteBtn.setAttribute("aria-label", title);
      }
    }

    audioPlayer.volume = Math.min(1, Math.max(0, Number(prefs.audioVol) || 0.85));
    updateMusicVolUI(audioPlayer.volume, audioPlayer.muted);

    function syncBookAudioRecord(isPlayingOverride = null) {
      if (!currentBookId || suppressAudioStateSync || $("#readingView").hidden) return;
      if (trackIdx < 0 || !audioTracks[trackIdx]) return;
      const tr = audioTracks[trackIdx];
      const playing = isPlayingOverride !== null ? isPlayingOverride : !audioPlayer.paused;
      bookAudio = {
        trackId: tr.id,
        trackName: tr.name,
        volume: audioPlayer.volume,
        autoPlay: playing
      };
      saveLibraryState();
    }

    audioPlayer.addEventListener("volumechange", () => {
      prefs.audioVol = audioPlayer.volume;
      if (audioPlayer.volume > 0) lastNonZeroAudioVol = audioPlayer.volume;
      savePrefs();
      syncBookAudioRecord();
      updateMusicVolUI(audioPlayer.volume, audioPlayer.muted);
    });
    audioPlayer.addEventListener("play", () => {
      if (!suppressAudioStateSync && currentBookId && !$("#readingView").hidden) {
        syncBookAudioRecord(true);
      }
      updateMiniPlayerControls();
      renderPlaylistUI();
      if (typeof BackgroundAudioManager !== "undefined") BackgroundAudioManager.sync();
    });
    audioPlayer.addEventListener("pause", () => {
      if (!suppressAudioStateSync && currentBookId && !$("#readingView").hidden) {
        syncBookAudioRecord(false);
      }
      updateMiniPlayerControls();
      renderPlaylistUI();
      if (typeof BackgroundAudioManager !== "undefined") BackgroundAudioManager.sync();
    });

    let currentActiveAudioUrl = null;

    async function refreshPersistentPlaylist(autoplayNewIdx = null) {
      try {
        // Virtualized: only fetch lightweight metadata instead of loading all blobs into RAM
        const savedMeta = await AudioDB.getAllMetadata();
        if (currentActiveAudioUrl) {
          URL.revokeObjectURL(currentActiveAudioUrl);
          currentActiveAudioUrl = null;
        }
        audioTracks = savedMeta.map((rec) => ({
          id: rec.id,
          name: rec.name,
          size: rec.size,
          type: rec.type
        }));
        renderPlaylistUI();

        if (!audioTracks.length) {
          suppressAudioStateSync = true;
          audioPlayer.pause();
          audioPlayer.removeAttribute("src");
          audioPlayer.load();
          setTimeout(() => { suppressAudioStateSync = false; }, 60);
          trackIdx = -1;
          return;
        }

        if (autoplayNewIdx !== null && audioTracks[autoplayNewIdx]) {
          await playTrack(autoplayNewIdx, true);
        } else {
          const restoredIdx = Math.min(Math.max(0, Number(prefs.lastTrackIdx) || 0), audioTracks.length - 1);
          await playTrack(restoredIdx, false);
        }
      } catch (err) {
        console.warn("[AudioDB] Error refreshing playlist:", err);
      }
    }

    function renderPlaylistUI() {
      const box = $("#playlistBox");
      const miniPlayer = $("#miniPlayer");
      updateMiniPlayerUI();
      updateMiniPlayerControls();
      if (miniPlayer) miniPlayer.classList.toggle("solo", !audioTracks.length);
      if (!audioTracks.length) {
        box.hidden = true;
        box.innerHTML = "";
        return;
      }
      box.hidden = false;
      box.innerHTML = "";
      audioTracks.forEach((tr, idx) => {
        const row = document.createElement("div");
        row.className = "playlist-item" + (idx === trackIdx ? " active-track" : "");
        row.innerHTML = `
            <div class="playlist-item-left">
              <span class="playlist-item-num">${idx + 1}</span>
              <span class="playlist-item-title" title="${escapeHtml(tr.name)}">${escapeHtml(tr.name)}</span>
            </div>
            <button type="button" class="playlist-item-del" title="${t("aria_remove") || "Αφαίρεση"}" aria-label="${t("aria_remove") || "Αφαίρεση"}">×</button>
          `;
        row.addEventListener("click", (e) => {
          if (e.target.closest(".playlist-item-del")) return;
          playTrack(idx, true);
        });
        row.querySelector(".playlist-item-del").addEventListener("click", async (e) => {
          e.stopPropagation();
          await AudioDB.remove(tr.id);
          await refreshPersistentPlaylist();
        });
        box.appendChild(row);
      });
    }

    async function addAudioFilesToPlaylist(fileList) {
      const valid = Array.from(fileList || []).filter((f) =>
        f.type.startsWith("audio/") || /\.(mp3|m4a|aac|wav|ogg|opus|flac)$/i.test(f.name)
      );
      if (!valid.length) return;
      const startIdx = audioTracks.length;
      try {
        await AudioDB.addFiles(valid);
        await refreshPersistentPlaylist(startIdx);
        showToast(`${valid.length} ${t("toast_tracks_added") || "κομμάτια προστέθηκαν στη λίστα."}`);
      } catch (_) {
        valid.forEach((f) => audioTracks.push({ id: Date.now(), name: f.name, url: URL.createObjectURL(f) }));
        renderPlaylistUI();
        playTrack(startIdx, true);
      }
    }

    async function playTrack(idx, autoplay, preserveCurrentTimeIfSame = false) {
      if (!audioTracks.length) return;
      const nextIdx = (idx + audioTracks.length) % audioTracks.length;
      const isSameTrack = nextIdx === trackIdx && Boolean(audioPlayer.getAttribute("src"));
      trackIdx = nextIdx;
      prefs.lastTrackIdx = trackIdx;
      savePrefs();

      suppressAudioStateSync = true;
      if (!isSameTrack || !preserveCurrentTimeIfSame) {
        try {
          const tr = audioTracks[trackIdx];
          const blob = await AudioDB.getTrackBlob(tr.id);
          if (blob) {
            if (currentActiveAudioUrl) {
              URL.revokeObjectURL(currentActiveAudioUrl);
              currentActiveAudioUrl = null;
            }
            currentActiveAudioUrl = URL.createObjectURL(blob);
            audioPlayer.src = currentActiveAudioUrl;
          }
        } catch (err) {
          console.warn("[Audio] Error loading track blob:", err);
        }
      }
      audioPlayer.loop = (prefs.audioLoopMode === "one");
      updateMiniPlayerUI();
      updateMiniPlayerControls();
      renderPlaylistUI();

      if (autoplay) {
        const playPromise = audioPlayer.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.then(() => {
            suppressAudioStateSync = false;
            syncBookAudioRecord(true);
          }).catch((err) => {
            suppressAudioStateSync = false;
            syncBookAudioRecord(true);
            if (err && err.name !== "NotAllowedError") {
              showToast(t("error_audio_playback"));
            }
          });
        } else {
          suppressAudioStateSync = false;
          syncBookAudioRecord(true);
        }
      } else {
        setTimeout(() => { suppressAudioStateSync = false; }, 60);
        syncBookAudioRecord(false);
      }
    }

    function applyBookAudioNow(savedAudio, keepCurrentPlaying = false) {
      if (keepCurrentPlaying && !audioPlayer.paused && trackIdx >= 0) {
        syncBookAudioRecord(true);
        return;
      }

      if (!savedAudio || !audioTracks.length) {
        suppressAudioStateSync = true;
        audioPlayer.pause();
        setTimeout(() => { suppressAudioStateSync = false; }, 60);
        return;
      }

      if (typeof savedAudio.volume === "number" && !Number.isNaN(savedAudio.volume)) {
        audioPlayer.volume = Math.min(1, Math.max(0, savedAudio.volume));
      }

      let foundIdx = audioTracks.findIndex((t) => t.id === savedAudio.trackId);
      if (foundIdx < 0 && savedAudio.trackName) {
        foundIdx = audioTracks.findIndex((t) => t.name === savedAudio.trackName);
      }
      if (foundIdx >= 0) {
        playTrack(foundIdx, Boolean(savedAudio.autoPlay), true);
      } else {
        suppressAudioStateSync = true;
        audioPlayer.pause();
        setTimeout(() => { suppressAudioStateSync = false; }, 60);
      }
    }

    function restoreBookAudio(savedAudio, keepCurrentPlaying = false) {
      if (audioTracks.length > 0) {
        applyBookAudioNow(savedAudio, keepCurrentPlaying);
        return;
      }
      if (playlistReadyPromise) {
        playlistReadyPromise.then(() => applyBookAudioNow(savedAudio, keepCurrentPlaying));
      }
    }

    /* --- Rich Multi-Layered Procedural Ambient Soundscapes (Scoped per Book) --- */
    const NOISE_LABELS = {
      rain: "Βροχή",
      fire: "Τζάκι",
      ocean: "Κύματα",
      forest: "Δάσος",
      cafe: "Βιβλιοθήκη",
      brown: "Βαθύς θόρυβος"
    };

    function syncBookNoiseRecord(isActiveOverride = null) {
      if (!currentBookId || suppressNoiseStateSync || $("#readingView").hidden) return;
      const active = isActiveOverride !== null ? isActiveOverride : ambientActive;
      bookNoise = {
        active: active,
        type: prefs.noiseType || "rain",
        volume: Number(prefs.noiseVol) || 0.28
      };
      saveLibraryState();
    }

    function stopNoise(persistState = true) {
      ambientIntervals.forEach((id) => clearInterval(id));
      ambientIntervals = [];
      ambientSources.forEach((node) => { try { node.stop(); } catch (_) { } });
      ambientSources = [];
      if (audioCtx) {
        audioCtx.close().catch(() => { });
        audioCtx = null;
      }
      ambientMasterGain = null;
      ambientActive = false;
      updateNoiseUI(false);
      if (persistState) syncBookNoiseRecord(false);
      if (typeof BackgroundAudioManager !== "undefined") BackgroundAudioManager.sync();
    }

    function createPinkNoiseBuffer(ctx, seconds = 4) {
      const len = ctx.sampleRate * seconds;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const out = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.045;
        b6 = w * 0.115926;
      }
      return buf;
    }

    function createBrownNoiseBuffer(ctx, seconds = 4) {
      const len = ctx.sampleRate * seconds;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const out = buf.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        out[i] = (lastOut + 0.02 * w) / 1.02;
        lastOut = out[i];
        out[i] *= 2.8;
      }
      return buf;
    }

    function triggerWaterDroplet(ctx, dest) {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = 850 + Math.random() * 1750;
      const dur = 0.035 + Math.random() * 0.045;

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * (1.25 + Math.random() * 0.35), now + dur);

      const peak = 0.025 + Math.random() * 0.055;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain).connect(dest);
      osc.start(now);
      osc.stop(now + dur + 0.01);
    }

    function triggerFireCrackle(ctx, dest) {
      const now = ctx.currentTime;
      const dur = 0.006 + Math.random() * 0.018;
      const len = Math.max(32, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.35));
      }

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1200 + Math.random() * 2600;
      bp.Q.value = 1.8;

      const gain = ctx.createGain();
      gain.gain.value = 0.12 + Math.random() * 0.35;

      src.connect(bp).connect(gain).connect(dest);
      src.start(now);
    }

    function triggerSoftCricket(ctx, dest) {
      const now = ctx.currentTime;
      const chirps = 2 + Math.floor(Math.random() * 2);
      const freq = 3900 + Math.random() * 450;

      for (let c = 0; c < chirps; c++) {
        const t0 = now + c * 0.095;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.014, t0 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.065);

        osc.connect(gain).connect(dest);
        osc.start(t0);
        osc.stop(t0 + 0.07);
      }
    }

    function startNoise(persistState = true) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return showToast(t("toast_web_audio_unsupported") || "Ο browser δεν υποστηρίζει Web Audio.");
      stopNoise(false);

      audioCtx = new Ctx();
      const type = prefs.noiseType || "rain";
      ambientMasterGain = audioCtx.createGain();
      ambientMasterGain.gain.value = Number(prefs.noiseVol) || 0.28;
      ambientMasterGain.connect(audioCtx.destination);

      if (type === "rain") {
        const bed = audioCtx.createBufferSource();
        bed.buffer = createPinkNoiseBuffer(audioCtx, 4);
        bed.loop = true;

        const lp = audioCtx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 1050;

        const hp = audioCtx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 140;

        const bedGain = audioCtx.createGain();
        bedGain.gain.value = 0.72;

        bed.connect(hp).connect(lp).connect(bedGain).connect(ambientMasterGain);
        bed.start();
        ambientSources.push(bed);

        const dropTimer = setInterval(() => {
          if (!audioCtx || audioCtx.state !== "running") return;
          if (Math.random() < 0.72) triggerWaterDroplet(audioCtx, ambientMasterGain);
          if (Math.random() < 0.28) setTimeout(() => {
            if (audioCtx && audioCtx.state === "running") triggerWaterDroplet(audioCtx, ambientMasterGain);
          }, 45);
        }, 115);
        ambientIntervals.push(dropTimer);

      } else if (type === "fire") {
        const rumble = audioCtx.createBufferSource();
        rumble.buffer = createBrownNoiseBuffer(audioCtx, 4);
        rumble.loop = true;

        const lp = audioCtx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 260;

        const rumbleGain = audioCtx.createGain();
        rumbleGain.gain.value = 0.85;

        rumble.connect(lp).connect(rumbleGain).connect(ambientMasterGain);
        rumble.start();
        ambientSources.push(rumble);

        const crackleTimer = setInterval(() => {
          if (!audioCtx || audioCtx.state !== "running") return;
          if (Math.random() < 0.58) triggerFireCrackle(audioCtx, ambientMasterGain);
          if (Math.random() < 0.22) setTimeout(() => {
            if (audioCtx && audioCtx.state === "running") triggerFireCrackle(audioCtx, ambientMasterGain);
          }, 35);
        }, 95);
        ambientIntervals.push(crackleTimer);

      } else if (type === "ocean") {
        const surf = audioCtx.createBufferSource();
        surf.buffer = createPinkNoiseBuffer(audioCtx, 5);
        surf.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 420;

        const waveGain = audioCtx.createGain();
        waveGain.gain.value = 0.55;

        const lfo = audioCtx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 0.11;

        const lfoFilterDepth = audioCtx.createGain();
        lfoFilterDepth.gain.value = 480;

        const lfoAmpDepth = audioCtx.createGain();
        lfoAmpDepth.gain.value = 0.32;

        lfo.connect(lfoFilterDepth).connect(filter.frequency);
        lfo.connect(lfoAmpDepth).connect(waveGain.gain);

        surf.connect(filter).connect(waveGain).connect(ambientMasterGain);
        surf.start();
        lfo.start();
        ambientSources.push(surf, lfo);

      } else if (type === "forest") {
        const wind = audioCtx.createBufferSource();
        wind.buffer = createPinkNoiseBuffer(audioCtx, 5);
        wind.loop = true;

        const bp = audioCtx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 480;
        bp.Q.value = 0.85;

        const breezeLfo = audioCtx.createOscillator();
        breezeLfo.type = "sine";
        breezeLfo.frequency.value = 0.08;
        const breezeDepth = audioCtx.createGain();
        breezeDepth.gain.value = 210;
        breezeLfo.connect(breezeDepth).connect(bp.frequency);

        const windGain = audioCtx.createGain();
        windGain.gain.value = 0.78;

        wind.connect(bp).connect(windGain).connect(ambientMasterGain);
        wind.start();
        breezeLfo.start();
        ambientSources.push(wind, breezeLfo);

        const cricketTimer = setInterval(() => {
          if (!audioCtx || audioCtx.state !== "running") return;
          if (Math.random() < 0.35) triggerSoftCricket(audioCtx, ambientMasterGain);
        }, 1400);
        ambientIntervals.push(cricketTimer);

      } else if (type === "cafe") {
        const room = audioCtx.createBufferSource();
        room.buffer = createBrownNoiseBuffer(audioCtx, 4);
        room.loop = true;

        const lp = audioCtx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 220;

        const roomGain = audioCtx.createGain();
        roomGain.gain.value = 0.65;
        room.connect(lp).connect(roomGain).connect(ambientMasterGain);
        room.start();
        ambientSources.push(room);

        const vinylTimer = setInterval(() => {
          if (!audioCtx || audioCtx.state !== "running") return;
          if (Math.random() < 0.45) {
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = "triangle";
            osc.frequency.value = 1800 + Math.random() * 2400;
            g.gain.setValueAtTime(0.012 + Math.random() * 0.018, now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);
            osc.connect(g).connect(ambientMasterGain);
            osc.start(now);
            osc.stop(now + 0.009);
          }
        }, 130);
        ambientIntervals.push(vinylTimer);

      } else {
        const brown = audioCtx.createBufferSource();
        brown.buffer = createBrownNoiseBuffer(audioCtx, 4);
        brown.loop = true;

        const lp = audioCtx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 460;

        brown.connect(lp).connect(ambientMasterGain);
        brown.start();
        ambientSources.push(brown);
      }

      ambientActive = true;
      updateNoiseUI(true);
      if (persistState) syncBookNoiseRecord(true);
      if (typeof BackgroundAudioManager !== "undefined") BackgroundAudioManager.sync();
    }

    function restoreBookNoise(savedNoise, keepCurrentPlaying = false) {
      if (keepCurrentPlaying && ambientActive) {
        syncBookNoiseRecord(true);
        return;
      }
      if (savedNoise && savedNoise.active) {
        prefs.noiseType = savedNoise.type || prefs.noiseType;
        prefs.noiseVol = typeof savedNoise.volume === "number" ? savedNoise.volume : prefs.noiseVol;
        $("#noiseTypeSelect").value = prefs.noiseType;
        $("#noiseVolRange").value = String(prefs.noiseVol);
        const noiseValSpan = $("#noiseVolValue");
        if (noiseValSpan) noiseValSpan.textContent = `${Math.round(prefs.noiseVol * 100)}%`;
        savePrefs();
        startNoise(false);
      } else {
        stopNoise(false);
      }
    }

    /* --- Helpers & Markdown Cleaner / TOC Extractor --- */
    function showToast(msg) {
      const el = $("#toast");
      el.textContent = msg;
      el.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
    }

    function normalizeText(raw) {
      return String(raw || "")
        .replace(/\r\n?/g, "\n")
        .replace(/\u0000/g, "")
        .replace(/[\t\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000]+/g, " ")
        .replace(/ {2,}/g, " ")
        .replace(/^ +| +$/gm, "")
        .replace(/([a-zA-Zα-ωΑ-ΩάέήίόύώΆΈΉΊΌΎΏϊϋΐΰ])-\n([a-zα-ωάέήίόύώϊϋΐΰ])/g, "$1$2")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    function parseMarkdownAndToc(rawText) {
      const normalized = String(rawText || "").replace(/\r\n?/g, "\n").trim();
      if (!normalized) return { text: "", toc: [] };

      const withoutFrontmatter = normalized.replace(/^---\n[\s\S]*?\n---\n+/, "");
      const lines = withoutFrontmatter.split("\n");
      const cleanLines = [];
      const toc = [];
      let runningOffset = 0;
      let inCodeBlock = false;

      const cleanInlineMd = (s) => s
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, (_, alt) => (alt ? `[${alt}]` : ""))
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/(\*\*\*|___)(.*?)\1/g, "$2")
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/(\*|_)(.*?)\1/g, "$2")
        .replace(/~~(.*?)~~/g, "$1")
        .replace(/`([^`]+)`/g, "$1");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (/^```/.test(trimmed)) {
          inCodeBlock = !inCodeBlock;
          continue;
        }

        if (inCodeBlock) {
          const codeLine = line.replace(/\s+$/, "");
          cleanLines.push(codeLine);
          runningOffset += codeLine.length + 1;
          continue;
        }

        const atxMatch = trimmed.match(/^(#{1,4})\s+(.+?)\s*#*$/);
        if (atxMatch) {
          const level = atxMatch[1].length;
          const headingText = cleanInlineMd(atxMatch[2]).trim();
          if (headingText) {
            const indent = level > 1 ? "  ".repeat(level - 1) + "↳ " : "";
            toc.push({ label: indent + headingText, offset: runningOffset });
            cleanLines.push(headingText);
            runningOffset += headingText.length + 1;
          }
          continue;
        }

        if (i + 1 < lines.length && trimmed.length > 1 && /^(=+|-+)\s*$/.test(lines[i + 1].trim()) && !/^[-*+]\s/.test(trimmed)) {
          const isTop = lines[i + 1].trim().startsWith("=");
          const headingText = cleanInlineMd(trimmed);
          toc.push({ label: (isTop ? "" : "  ↳ ") + headingText, offset: runningOffset });
          cleanLines.push(headingText);
          runningOffset += headingText.length + 1;
          i++;
          continue;
        }

        if (/^([-*_]){3,}\s*$/.test(trimmed)) {
          const divider = "— — —";
          cleanLines.push(divider);
          runningOffset += divider.length + 1;
          continue;
        }

        let outLine = line
          .replace(/^>\s?/, "")
          .replace(/^(\s*)[-*+]\s+/, "$1• ");
        outLine = cleanInlineMd(outLine).replace(/ {2,}/g, " ").trim();

        cleanLines.push(outLine);
        runningOffset += outLine.length + 1;
      }

      const joined = normalizeText(cleanLines.join("\n"));
      const alignedToc = [];
      let searchFrom = 0;
      for (const item of toc) {
        const rawLabel = item.label.replace(/^\s*↳\s*/, "");
        const foundAt = joined.indexOf(rawLabel, searchFrom);
        if (foundAt >= 0) {
          alignedToc.push({ label: item.label, offset: foundAt });
          searchFrom = foundAt + rawLabel.length;
        }
      }

      return { text: joined, toc: alignedToc };
    }

    /* --- Heuristic Chapter & Heading Detector (Fallback for TXT, PDF without outline, Pasted Text) --- */
    function detectChaptersFromText(text) {
      if (!text) return [];
      const lines = text.split("\n");
      const candidates = [];
      let runningOffset = 0;

      const chapterKeywordRe = /^(κεφάλαιο|μέρος|ενότητα|βιβλίο|πρόλογος|επίλογος|εισαγωγή|πράξη|σκηνή|chapter|part|section|book|prologue|epilogue|introduction|preface|act|scene)\b/i;
      const numberedHeadingRe = /^(?:[IVXLCDM]+\.|[Α-Ω]\.|[0-9]{1,3}[.)])\s+[A-ZΑ-ΩΆΈΉΊΌΎΏ]/;

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        if (trimmed.length >= 2 && trimmed.length <= 72) {
          const isMd = /^#{1,4}\s+/.test(trimmed);
          const cleanLabel = trimmed.replace(/^#{1,4}\s+/, "").trim();
          const isKeywordChapter = chapterKeywordRe.test(cleanLabel) && !/[.,;!?]$/.test(cleanLabel);
          const isNumbered = numberedHeadingRe.test(cleanLabel) && !/[.,;!?]$/.test(cleanLabel);

          const prevBlank = i === 0 || !lines[i - 1].trim();
          const nextBlank = i + 1 < lines.length && !lines[i + 1].trim();
          const isAllCaps = cleanLabel.length >= 3 &&
            /[A-ZΑ-ΩΆΈΉΊΌΎΏ]/.test(cleanLabel) &&
            cleanLabel === cleanLabel.toLocaleUpperCase() &&
            !/[.,;!?]$/.test(cleanLabel);
          const isStandaloneTitle = prevBlank && nextBlank &&
            cleanLabel.length >= 3 && cleanLabel.length <= 60 &&
            !/[.,;:!?…]$/.test(cleanLabel) &&
            !/^[•\-–—*]/.test(cleanLabel);

          if (isMd || isKeywordChapter || isNumbered || (prevBlank && isAllCaps) || isStandaloneTitle) {
            if (cleanLabel.length >= 2 && !candidates.some((c) => c.label === cleanLabel && Math.abs(c.offset - runningOffset) < 120)) {
              candidates.push({ label: cleanLabel, offset: runningOffset });
            }
          }
        }
        runningOffset += rawLine.length + 1;
      }

      return candidates.slice(0, 200);
    }

    function escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function estimateReadMinutes(text) {
      const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
      return Math.max(1, Math.round(words / 200));
    }

    /* --- Custom Site CSS Selector Scraping & Resilient Multi-Proxy HTML Fetcher --- */
    function normalizeDomainInput(raw) {
      let val = String(raw || "").trim().toLowerCase();
      if (!val) return "";
      try {
        if (/^https?:\/\//i.test(val)) {
          val = new URL(val).hostname.toLowerCase();
        } else if (val.includes("/")) {
          val = new URL("https://" + val).hostname.toLowerCase();
        }
      } catch (_) { }
      return val.replace(/^www\./, "").trim();
    }

    function findMatchingScraperRule(urlObj) {
      const host = urlObj.hostname.replace(/^www\./i, "").toLowerCase();
      return (
        scraperRules.find((r) => normalizeDomainInput(r.domain) === host) ||
        scraperRules.find((r) => {
          const d = normalizeDomainInput(r.domain);
          return d && host.endsWith("." + d);
        }) ||
        null
      );
    }

    function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      return fetch(url, Object.assign({}, options, { signal: controller.signal }))
        .finally(() => clearTimeout(timer));
    }

    async function fetchRawHtmlWithFallback(targetUrl) {
      const enc = encodeURIComponent(targetUrl);
      const validateHtml = (htmlText, sourceName) => {
        if (!htmlText || htmlText.length < 300 || !/<html|<body|<article|<div|<p/i.test(htmlText)) {
          throw new Error(`${sourceName}: empty/non-HTML`);
        }
        if (/cf-browser-verification|Just a moment\.\.\.|Enable JavaScript and cookies to continue/i.test(htmlText)) {
          throw new Error(`${sourceName}: blocked by anti-bot challenge`);
        }
        return htmlText;
      };

      const proxyJobs = [
        // Jina Reader HTML mode (renders full DOM server-side so custom CSS selectors work even on CORS-restricted sites)
        (async () => {
          const res = await fetchWithTimeout(`https://r.jina.ai/${targetUrl}`, {
            headers: { "X-Return-Format": "html" }
          }, 15000);
          if (!res.ok) throw new Error(`jina-html HTTP ${res.status}`);
          return validateHtml(await res.text(), "jina-html");
        })(),
        (async () => {
          const res = await fetchWithTimeout(`https://api.allorigins.win/get?url=${enc}`, { cache: "no-store" }, 15000);
          if (!res.ok) throw new Error(`allorigins-json HTTP ${res.status}`);
          const data = await res.json();
          return validateHtml(data && data.contents ? data.contents : "", "allorigins-json");
        })(),
        (async () => {
          const res = await fetchWithTimeout(`https://api.allorigins.win/raw?url=${enc}`, { cache: "no-store" }, 15000);
          if (!res.ok) throw new Error(`allorigins-raw HTTP ${res.status}`);
          return validateHtml(await res.text(), "allorigins-raw");
        })(),
        (async () => {
          const res = await fetchWithTimeout(`https://corsproxy.io/?url=${enc}`, { cache: "no-store" }, 15000);
          if (!res.ok) throw new Error(`corsproxy HTTP ${res.status}`);
          return validateHtml(await res.text(), "corsproxy");
        })(),
        (async () => {
          const res = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${enc}`, { cache: "no-store" }, 15000);
          if (!res.ok) throw new Error(`codetabs HTTP ${res.status}`);
          return validateHtml(await res.text(), "codetabs");
        })(),
        (async () => {
          const res = await fetchWithTimeout(`https://api.cors.lol/?url=${enc}`, { cache: "no-store" }, 15000);
          if (!res.ok) throw new Error(`cors.lol HTTP ${res.status}`);
          return validateHtml(await res.text(), "cors.lol");
        })(),
        (async () => {
          const res = await fetchWithTimeout(targetUrl, { cache: "no-store" }, 6000);
          if (!res.ok) throw new Error(`direct HTTP ${res.status}`);
          return validateHtml(await res.text(), "direct");
        })()
      ];

      try {
        return await Promise.any(proxyJobs);
      } catch (aggErr) {
        // Direct scraping without unsafe iframe execution
        console.warn("[Scraper] Direct proxy requests failed for target URL:", targetUrl);

        const reasons = (aggErr && aggErr.errors)
          ? aggErr.errors.map((e) => e.message).slice(0, 3).join(" | ")
          : "CORS / network blocked";
        throw new Error(`Αδυναμία λήψης HTML (${reasons}). Χρησιμοποίησε «Επικόλληση HTML (Ctrl+U)».`);
      }
    }

    async function fetchViaJinaReader(targetUrl) {
      const jinaRes = await fetchWithTimeout(`https://r.jina.ai/${targetUrl}`, { cache: "no-store" }, 15000);
      if (!jinaRes.ok) throw new Error(`Jina HTTP ${jinaRes.status}`);
      const md = await jinaRes.text();
      const titleMatch = md.match(/^Title:\s*(.+)$/m);
      const t = titleMatch ? titleMatch[1].trim() : "";
      const timeMatch = md.match(/^Published Time:\s*(.+)$/m);
      const pubTime = timeMatch ? timeMatch[1].trim() : "";
      let bodyPart = md.replace(/^Title:.*\n?/m, "")
        .replace(/^URL Source:.*\n?/m, "")
        .replace(/^Published Time:.*\n?/m, "")
        .replace(/^Markdown Content:\s*\n?/m, "");

      // Strip navigation link-heavy menu/sidebar lines when falling back to plain Markdown
      const cleanedLines = bodyPart.split("\n").filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return true;
        // Drop pure navigation list items like "* [LINK](https://...)" or image-only links
        if (/^[-*+]\s+\[[^\]]*\]\(https?:\/\/[^)]+\)\s*$/.test(trimmed)) return false;
        if (/^\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)\s*$/.test(trimmed)) return false;
        if (/^!\[Image \d+:/.test(trimmed)) return false;
        return true;
      });

      const parsed = parseMarkdownAndToc(cleanedLines.join("\n"));
      if (!parsed.text || parsed.text.length < 40) throw new Error("Jina empty response");
      return { title: t, datetime: pubTime, text: parsed.text, toc: parsed.toc };
    }

    function extractWithCustomRule(htmlText, rule, parsedUrl) {
      const doc = new DOMParser().parseFromString(htmlText, "text/html");
      const siteName = parsedUrl.hostname.replace(/^www\./i, "");

      const pickText = (selector, attrFallback = null) => {
        const sel = (selector || "").trim();
        if (!sel) return "";
        try {
          const el = doc.querySelector(sel);
          if (!el) return "";
          const txt = el.textContent.replace(/\s+/g, " ").trim();
          if (txt) return txt;
          if (attrFallback && el.getAttribute(attrFallback)) {
            return el.getAttribute(attrFallback).trim();
          }
        } catch (_) { }
        return "";
      };

      let title = pickText(rule.titleSelector);
      if (!title) {
        const fallbackEl = doc.querySelector("meta[property='og:title']") || doc.querySelector("h1") || doc.querySelector("title");
        title = (fallbackEl && (fallbackEl.getAttribute("content") || fallbackEl.textContent) || "").replace(/\s+/g, " ").trim() || siteName;
      }

      const datetime = pickText(rule.datetimeSelector, "datetime");
      const category = pickText(rule.categorySelector);
      const author = pickText(rule.authorSelector) || siteName;

      let bodyHtml = "";
      const artSel = (rule.articleSelector || "").trim();
      if (artSel) {
        try {
          const nodes = Array.from(doc.querySelectorAll(artSel));
          if (nodes.length) {
            bodyHtml = nodes.map((n) => {
              const clone = n.cloneNode(true);
              clone.querySelectorAll("script, style, nav, aside, form, iframe, noscript, svg, button, .service-links, .share, .social, .related, .advertisement, .ads").forEach((el) => el.remove());
              return clone.innerHTML;
            }).join("\n<p></p>\n");
          }
        } catch (e) {
          throw new Error(`Μη έγκυρο CSS selector άρθρου: ${e.message}`);
        }
      }

      if (!bodyHtml) {
        throw new Error(`Ο selector άρθρου δεν βρήκε περιεχόμενο (${artSel || "κενό"}).`);
      }

      const converted = htmlToCleanBookText(bodyHtml);
      if (!converted.text || converted.text.length < 20) {
        throw new Error("Το επιλεγμένο στοιχείο άρθρου είναι κενό.");
      }

      // Clean structured header: Title + Category · Author · Datetime + Body
      const metaParts = [category, author, datetime].filter(Boolean);
      const metaHeader = metaParts.join(" · ");
      const headerBlock = metaHeader ? `${title}\n${metaHeader}\n\n` : `${title}\n\n`;
      const shift = headerBlock.length;

      const articleToc = [{ label: title, offset: 0 }].concat(
        converted.toc.map((item) => ({
          label: item.label,
          offset: item.offset + shift
        }))
      );

      return {
        title,
        datetime,
        category,
        author,
        metaHeader,
        text: normalizeText(headerBlock + converted.text),
        toc: articleToc
      };
    }

    /* --- Offline CSP-Compliant Favicon Multi-Tier Pipeline & Resizer --- */
    async function validateImageBlob(blob) {
      if (!blob || blob.size < 40) return null;
      try {
        const header = new Uint8Array(await blob.slice(0, 32).arrayBuffer());
        // PNG: 89 50 4E 47
        if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
          return "image/png";
        }
        // JPEG: FF D8 FF
        if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
          return "image/jpeg";
        }
        // GIF: 47 49 46 38 ('GIF8')
        if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) {
          return "image/gif";
        }
        // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
        if (
          header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
          header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
        ) {
          return "image/webp";
        }
        // ICO / CUR: 00 00 01 00 (ICO) or 00 00 02 00 (CUR)
        if (header[0] === 0x00 && header[1] === 0x00 && (header[2] === 0x01 || header[2] === 0x02) && header[3] === 0x00) {
          return "image/x-icon";
        }
        // SVG: inspect first 512 bytes for <svg
        const textSlice = new TextDecoder("utf-8").decode(new Uint8Array(await blob.slice(0, 512).arrayBuffer())).toLowerCase();
        if (textSlice.includes("<svg")) {
          return "image/svg+xml";
        }
      } catch (_) { }
      return null;
    }

    function blobToOfflineIconDataUrl(blob, detectedMime = "image/png") {
      return new Promise((resolve) => {
        if (!blob) return resolve("");
        const typedBlob = (blob.type === detectedMime) ? blob : new Blob([blob], { type: detectedMime });

        const tryFileReader = () => {
          if (typedBlob.size <= 45000) {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result;
              if (typeof res === "string" && res.startsWith("data:image/")) {
                return resolve(res);
              }
              resolve("");
            };
            reader.onerror = () => resolve("");
            reader.readAsDataURL(typedBlob);
          } else {
            resolve("");
          }
        };

        const blobUrl = URL.createObjectURL(typedBlob);
        const img = new Image();
        img.onload = () => {
          try {
            // Reject tracking pixels (e.g. 1x1)
            if (img.naturalWidth < 8 || img.naturalHeight < 8) {
              URL.revokeObjectURL(blobUrl);
              return tryFileReader();
            }
            const canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, 64, 64);
            const dataUrl = canvas.toDataURL("image/png");
            URL.revokeObjectURL(blobUrl);
            if (dataUrl && dataUrl.startsWith("data:image/png;base64,")) {
              return resolve(dataUrl);
            }
            tryFileReader();
          } catch (_) {
            URL.revokeObjectURL(blobUrl);
            tryFileReader();
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          tryFileReader();
        };
        img.src = blobUrl;
      });
    }

    function renderImageToDataUrl(src) {
      return new Promise((resolve) => {
        if (!src) return resolve("");
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, 64, 64);
            resolve(canvas.toDataURL("image/png"));
          } catch (_) {
            resolve(src.startsWith("data:image/") ? src : "");
          }
        };
        img.onerror = () => resolve(src.startsWith("data:image/") ? src : "");
        img.src = src;
      });
    }

    async function fetchSingleFavicon(targetUrl, timeoutMs = 2800) {
      if (!targetUrl) throw new Error("Empty URL");
      const res = await fetchWithTimeout(targetUrl, { mode: "cors", cache: "force-cache" }, timeoutMs);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const detectedMime = await validateImageBlob(blob);
      if (!detectedMime) throw new Error("Invalid image blob");
      const dataUrl = await blobToOfflineIconDataUrl(blob, detectedMime);
      if (!dataUrl) throw new Error("Failed to render data URL");
      return dataUrl;
    }

    async function grabSiteFavicon(htmlDocOrText, pageUrl) {
      if (!pageUrl) return "";
      let origin = "";
      let domain = "";
      try {
        const u = new URL(pageUrl);
        origin = u.origin;
        domain = u.hostname.replace(/^www\./i, "").toLowerCase();
      } catch (_) {
        return "";
      }
      if (!domain) return "";

      // Parse HTML if available and look for candidate icons
      let doc = null;
      if (typeof htmlDocOrText === "string" && htmlDocOrText.trim()) {
        try {
          doc = new DOMParser().parseFromString(htmlDocOrText, "text/html");
        } catch (_) { }
      } else if (htmlDocOrText && htmlDocOrText.querySelector) {
        doc = htmlDocOrText;
      }

      const htmlCandidates = [];
      if (doc) {
        const links = Array.from(doc.querySelectorAll("link[rel*='icon'], link[rel*='apple-touch-icon']"));
        links.sort((a, b) => {
          const typeA = (a.getAttribute("type") || "").toLowerCase();
          const typeB = (b.getAttribute("type") || "").toLowerCase();
          if (typeA.includes("svg") && !typeB.includes("svg")) return -1;
          if (!typeA.includes("svg") && typeB.includes("svg")) return 1;
          const relA = (a.getAttribute("rel") || "").toLowerCase();
          const relB = (b.getAttribute("rel") || "").toLowerCase();
          if (relA.includes("apple") && !relB.includes("apple")) return -1;
          if (!relA.includes("apple") && relB.includes("apple")) return 1;
          return 0;
        });

        for (const link of links) {
          const href = (link.getAttribute("href") || "").trim();
          if (!href) continue;
          if (href.startsWith("data:image/")) {
            // Tier 0: Direct inline data URL
            try {
              const res = await renderImageToDataUrl(href);
              if (res) return res;
            } catch (_) { }
            return href;
          }
          try {
            const fullUrl = new URL(href, pageUrl).href;
            if (!htmlCandidates.includes(fullUrl)) htmlCandidates.push(fullUrl);
          } catch (_) { }
        }
      }

      // Root fallbacks
      const rootIco = `${origin}/favicon.ico`;
      const rootApple = `${origin}/apple-touch-icon.png`;
      if (!htmlCandidates.includes(rootIco)) htmlCandidates.push(rootIco);
      if (!htmlCandidates.includes(rootApple)) htmlCandidates.push(rootApple);

      // Tier 1A: Fast parallel race (direct Favicone API + candidate via CORS proxy + direct candidate)
      const primaryCandidate = htmlCandidates[0] || rootIco;
      const tier1AJobs = [
        fetchSingleFavicon(`https://favicone.com/${encodeURIComponent(domain)}?s=64`, 2800),
        fetchSingleFavicon(`https://corsproxy.io/?url=${encodeURIComponent(primaryCandidate)}`, 2800),
        fetchSingleFavicon(`https://api.allorigins.win/raw?url=${encodeURIComponent(primaryCandidate)}`, 2800),
        fetchSingleFavicon(primaryCandidate, 2500)
      ];

      try {
        const res1A = await Promise.any(tier1AJobs);
        if (res1A) return res1A;
      } catch (_) { }

      // Tier 1B: Fallback aggregators & alternate candidates race
      const tier1BJobs = [
        fetchSingleFavicon(`https://icon.horse/icon/${encodeURIComponent(domain)}`, 2500),
        fetchSingleFavicon(`https://corsproxy.io/?url=${encodeURIComponent(`https://icons.duckduckgo.com/ip3/${domain}.ico`)}`, 2500),
        fetchSingleFavicon(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://icons.duckduckgo.com/ip3/${domain}.ico`)}`, 2500),
        fetchSingleFavicon(`https://corsproxy.io/?url=${encodeURIComponent(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`)}`, 2500)
      ];

      if (htmlCandidates[1]) {
        tier1BJobs.push(fetchSingleFavicon(`https://corsproxy.io/?url=${encodeURIComponent(htmlCandidates[1])}`, 2500));
        tier1BJobs.push(fetchSingleFavicon(htmlCandidates[1], 2200));
      }

      try {
        const res1B = await Promise.any(tier1BJobs);
        if (res1B) return res1B;
      } catch (_) { }

      return "";
    }
    window.grabSiteFavicon = grabSiteFavicon;

    /* --- Import Article from URL (Open Immediately or Save to Group) --- */
    async function importArticleFromUrl(saveOnlyToGroup = false, opts = null) {
      const isFromShare = Boolean(opts && opts.fromShare);
      let rawUrl = (opts && opts.url) ? String(opts.url).trim() : $("#urlImportInput").value.trim();
      const manualHtml = (!isFromShare && $("#rawHtmlUrlInput") && !$("#rawHtmlUrlBox").hidden) ? $("#rawHtmlUrlInput").value.trim() : "";

      if (!rawUrl && !manualHtml) {
        if (!isFromShare) showToast(t("toast_paste_url_first") || "Επικόλλησε πρώτα ένα URL.");
        return false;
      }
      if (rawUrl && !/^https?:\/\//i.test(rawUrl)) rawUrl = "https://" + rawUrl;

      let parsedUrl;
      try {
        parsedUrl = new URL(rawUrl || "https://local-import.article/");
      } catch (_) {
        if (!isFromShare) showToast(t("toast_invalid_url") || "Μη έγκυρη διεύθυνση URL.");
        return false;
      }

      const openBtn = $("#importUrlBtn");
      const saveBtn = $("#saveUrlToGroupBtn");
      if (openBtn) openBtn.disabled = true;
      if (saveBtn) saveBtn.disabled = true;
      if (!isFromShare) {
        if (saveOnlyToGroup && saveBtn) saveBtn.textContent = t("status_fetching") || "Λήψη...";
        else if (openBtn) openBtn.textContent = t("status_fetching") || "Λήψη...";
      }

      const matchedRule = findMatchingScraperRule(parsedUrl);
      if (!isFromShare) {
        showToast(
          manualHtml
            ? (t("toast_processing_html") || "Επεξεργασία επικολλημένου HTML...")
            : (matchedRule
              ? (t("toast_rule_applying") || "Εφαρμογή κανόνα ({domain})...").replace("{domain}", matchedRule.domain)
              : (t("toast_fetching_article") || "Λήψη άρθρου από URL..."))
        );
      }

      let rawHtmlForFavicon = manualHtml || "";

      try {
        let extractedTitle = "";
        let extractedBody = "";
        let extractedToc = [];
        let extractedDatetime = "";
        let extractedCategory = "";
        let extractedAuthor = "";
        let kindLabel = "Άρθρο URL";
        let usedFallbackReader = false;

        if (matchedRule) {
          if (manualHtml) {
            const scraped = extractWithCustomRule(manualHtml, matchedRule, parsedUrl);
            extractedTitle = scraped.title;
            extractedBody = scraped.text;
            extractedToc = scraped.toc;
            extractedDatetime = scraped.datetime || "";
            extractedCategory = scraped.category || "";
            extractedAuthor = scraped.author || "";
            kindLabel = scraped.category || matchedRule.domain;
          } else {
            try {
              const rawHtml = await fetchRawHtmlWithFallback(parsedUrl.href);
              rawHtmlForFavicon = rawHtml;
              const scraped = extractWithCustomRule(rawHtml, matchedRule, parsedUrl);
              extractedTitle = scraped.title;
              extractedBody = scraped.text;
              extractedToc = scraped.toc;
              extractedDatetime = scraped.datetime || "";
              extractedCategory = scraped.category || "";
              extractedAuthor = scraped.author || "";
              kindLabel = scraped.category || matchedRule.domain;
            } catch (proxyErr) {
              const jina = await fetchViaJinaReader(parsedUrl.href);
              extractedTitle = jina.title;
              extractedDatetime = jina.datetime || "";
              const siteName = parsedUrl.hostname.replace(/^www\./i, "");
              const metaHeader = [siteName, jina.datetime].filter(Boolean).join(" · ");
              const headerBlock = metaHeader ? `${extractedTitle}\n${metaHeader}\n\n` : `${extractedTitle}\n\n`;
              extractedBody = normalizeText(headerBlock + jina.text);
              extractedToc = [{ label: extractedTitle, offset: 0 }].concat(
                jina.toc.map((it) => ({ label: it.label, offset: it.offset + headerBlock.length }))
              );
              kindLabel = matchedRule.domain;
              usedFallbackReader = true;
            }
          }
        } else if (manualHtml) {
          const doc = new DOMParser().parseFromString(manualHtml, "text/html");
          const titleEl = doc.querySelector("meta[property='og:title']") || doc.querySelector("h1") || doc.querySelector("title");
          extractedTitle = (titleEl && (titleEl.getAttribute("content") || titleEl.textContent) || "").trim();
          doc.querySelectorAll("script, style, nav, header, footer, aside, form, iframe, noscript, svg").forEach((el) => el.remove());
          const root = doc.querySelector("article") || doc.querySelector("main") || doc.querySelector('[role="main"]') || doc.body;
          const converted = htmlToCleanBookText(root ? root.innerHTML : manualHtml);
          extractedBody = converted.text;
          extractedToc = converted.toc;
        } else {
          const genericJobs = [
            fetchViaJinaReader(parsedUrl.href),
            (async () => {
              const htmlText = await fetchRawHtmlWithFallback(parsedUrl.href);
              rawHtmlForFavicon = htmlText;
              const doc = new DOMParser().parseFromString(htmlText, "text/html");
              const titleEl = doc.querySelector("meta[property='og:title']") || doc.querySelector("h1") || doc.querySelector("title");
              const t = (titleEl && (titleEl.getAttribute("content") || titleEl.textContent) || "").trim();
              const timeEl = doc.querySelector("meta[property='article:published_time']") || doc.querySelector("meta[name='publication_date']") || doc.querySelector("meta[name='date']") || doc.querySelector("time");
              const dt = timeEl ? (timeEl.getAttribute("content") || timeEl.getAttribute("datetime") || timeEl.textContent || "").trim() : "";
              const catEl = doc.querySelector("meta[property='article:section']") || doc.querySelector("meta[name='category']");
              const cat = catEl ? (catEl.getAttribute("content") || catEl.textContent || "").trim() : "";
              doc.querySelectorAll("script, style, nav, header, footer, aside, form, iframe, noscript, svg").forEach((el) => el.remove());
              const root = doc.querySelector("article") || doc.querySelector("main") || doc.querySelector('[role="main"]') || doc.body;
              const converted = htmlToCleanBookText(root ? root.innerHTML : htmlText);
              if (!converted.text || converted.text.length < 40) throw new Error("HTML body too short");
              return { title: t, text: converted.text, toc: converted.toc, datetime: dt, category: cat };
            })()
          ];

          const result = await Promise.any(genericJobs);
          extractedTitle = result.title;
          extractedBody = result.text;
          extractedToc = result.toc;
          if (result.datetime) extractedDatetime = result.datetime;
          if (result.category) extractedCategory = result.category;
        }

        if (!extractedBody || extractedBody.length < 25) {
          throw new Error(t("toast_extract_failed") || "Δεν κατέστη δυνατή η εξαγωγή κειμένου από αυτό το URL.");
        }

        const fallbackTitle = (opts && opts.fallbackTitle) ? String(opts.fallbackTitle).trim() : "";
        const finalTitle = extractedTitle || fallbackTitle || parsedUrl.hostname.replace(/^www\./, "");
        const selectedGrp = (opts && opts.groupId) || $("#targetGroupSelect")?.value || (groups.some((g) => g.id === "grp-articles") ? "grp-articles" : groups[0].id);

        if (!isFromShare) {
          $("#urlImportInput").value = "";
          if ($("#rawHtmlUrlInput")) $("#rawHtmlUrlInput").value = "";
          $("#urlRuleMatchHint").hidden = true;
        }

        const siteDomain = parsedUrl.hostname.replace(/^www\./i, "");
        let siteFavicon = "";
        try {
          siteFavicon = await grabSiteFavicon(rawHtmlForFavicon, parsedUrl.href);
        } catch (_) { }
        if (saveOnlyToGroup) {
          const words = (extractedBody || "").trim().split(/\s+/).filter(Boolean).length;
          const readMinutes = Math.max(1, Math.round(words / 200));
          const newEntry = {
            id: "book-" + Date.now(),
            groupId: selectedGrp,
            order: getGroupItems(selectedGrp).length,
            kind: kindLabel,
            title: finalTitle,
            wordCount: words,
            readMinutes: readMinutes,
            text: extractedBody,
            toc: extractedToc,
            charOffset: 0,
            bookmarkOffset: 0,
            highlights: [],
            audio: null,
            noise: null,
            progress: 0,
            updatedAt: Date.now(),
            url: parsedUrl.href,
            domain: siteDomain,
            favicon: siteFavicon || "",
            datetime: extractedDatetime || null,
            category: extractedCategory || null,
            author: extractedAuthor || null
          };
          library.push(newEntry);
          saveLibraryState();
          if (!isFromShare) {
            const grp = groups.find((g) => g.id === selectedGrp);
            showToast((t("toast_saved_to_group") || "Αποθηκεύτηκε στην ομάδα «{name}»!").replace("{name}", grp ? grp.name : ""));
            closeImportModal();
          }
          return true;
        } else {
          openBook(
            finalTitle,
            extractedBody,
            0,
            0,
            null,
            [],
            null,
            null,
            selectedGrp,
            kindLabel,
            false,
            extractedToc,
            {
              url: parsedUrl.href,
              domain: siteDomain,
              favicon: siteFavicon || "",
              datetime: extractedDatetime || null,
              category: extractedCategory || null,
              author: extractedAuthor || null
            }
          );
          if (usedFallbackReader) {
            showToast(t("toast_proxy_blocked_hint") || "Τα HTML proxies μπλοκαρίστηκαν — χρησιμοποίησε «Επικόλληση HTML (Ctrl+U)».");
          } else {
            showToast(matchedRule ? (t("toast_rule_extracted") || "Εξήχθη καθαρά με κανόνα {domain}!").replace("{domain}", matchedRule.domain) : (t("toast_article_loaded") || "Το άρθρο φορτώθηκε επιτυχώς!"));
          }
          return true;
        }
      } catch (err) {
        if (!isFromShare) {
          const msg = (err && err.errors && err.errors[0] && err.errors[0].message) || (err && err.message) || (t("toast_url_fetch_error") || "Σφάλμα λήψης URL.");
          showToast(msg);
        }
        return false;
      } finally {
        if (openBtn) {
          openBtn.disabled = false;
          openBtn.textContent = t("btn_fetch_and_open") || "Λήψη & Άνοιγμα";
        }
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = t("btn_fetch_to_group") || "Λήψη στην ομάδα";
        }
      }
    }

    /* --- Custom Scraper Rules Page UI & Live Tester --- */
    function fillScraperForm(rule = null) {
      $("#ruleEditIdInput").value = rule ? rule.id : "";
      $("#ruleDomainInput").value = rule ? rule.domain : "";
      $("#ruleTitleInput").value = rule ? (rule.titleSelector || "") : "";
      $("#ruleDatetimeInput").value = rule ? (rule.datetimeSelector || "") : "";
      $("#ruleCategoryInput").value = rule ? (rule.categorySelector || "") : "";
      $("#ruleAuthorInput").value = rule ? (rule.authorSelector || "") : "";
      $("#ruleArticleInput").value = rule ? (rule.articleSelector || "") : "";
      $("#ruleTestUrlInput").value = rule && rule.sampleUrl ? rule.sampleUrl : "";
      $("#scraperFormHeading").textContent = rule ? `${t("edit_rule_heading")} ${rule.domain}` : t("new_rule_heading");
      $("#scraperPreviewBox").hidden = true;
    }

    function readScraperForm() {
      const domain = normalizeDomainInput($("#ruleDomainInput").value);
      return {
        id: $("#ruleEditIdInput").value || ("rule-" + Date.now()),
        domain,
        titleSelector: $("#ruleTitleInput").value.trim(),
        datetimeSelector: $("#ruleDatetimeInput").value.trim(),
        categorySelector: $("#ruleCategoryInput").value.trim(),
        authorSelector: $("#ruleAuthorInput").value.trim(),
        articleSelector: $("#ruleArticleInput").value.trim(),
        sampleUrl: $("#ruleTestUrlInput").value.trim()
      };
    }

    function renderScraperRulesList() {
      const listEl = $("#scraperRulesList");
      $("#scraperRulesCountLabel").textContent = `${scraperRules.length} ${t("scrapers_count_label")}`;
      listEl.innerHTML = "";

      if (!scraperRules.length) {
        listEl.innerHTML = `<div class="empty-group-msg">${t("scrapers_empty_msg")}</div>`;
        return;
      }

      scraperRules.forEach((rule) => {
        const card = document.createElement("div");
        card.className = "playlist-card";
        card.innerHTML = `
            <div class="playlist-card-head">
              <div class="playlist-card-title">
                <h2>${escapeHtml(rule.domain)}</h2>
                <span class="meta-tag">${rule.authorSelector ? t("scraper_custom_author") : `${t("lbl_author")}: ${escapeHtml(rule.domain)}`}</span>
                ${rule.categorySelector ? `<span class="meta-tag">${t("lbl_category")}</span>` : ""}
                ${rule.datetimeSelector ? `<span class="meta-tag">${t("lbl_datetime")}</span>` : ""}
              </div>

              <div class="playlist-card-actions">
                <button class="btn sm accent-btn edit-rule-btn">${t("btn_edit_test")}</button>
                <button class="btn sm del-rule-btn" style="color:#e05252">${t("btn_delete")}</button>
              </div>

            </div>

            <div class="rule-selectors-list">
              <div><strong>${t("rule_title_lbl") || "Title"}:</strong> <code>${escapeHtml(rule.titleSelector || "—")}</code></div>
              <div><strong>${t("rule_article_lbl") || "Article"}:</strong> <code>${escapeHtml(rule.articleSelector || "—")}</code></div>
              ${rule.datetimeSelector ? `<div><strong>${t("lbl_datetime")}:</strong> <code>${escapeHtml(rule.datetimeSelector)}</code></div>` : ""}
              ${rule.categorySelector ? `<div><strong>${t("lbl_category")}:</strong> <code>${escapeHtml(rule.categorySelector)}</code></div>` : ""}
              ${rule.authorSelector ? `<div><strong>${t("lbl_author")}:</strong> <code>${escapeHtml(rule.authorSelector)}</code></div>` : ""}
            </div>

          `;

        card.querySelector(".edit-rule-btn").addEventListener("click", () => {
          fillScraperForm(rule);
          $("#scraperEditorCard").scrollIntoView({ behavior: "smooth" });
        });

        card.querySelector(".del-rule-btn").addEventListener("click", () => {
          scraperRules = scraperRules.filter((r) => r.id !== rule.id);
          saveScraperRules();
          renderScraperRulesList();
          showToast((t("toast_rule_deleted") || "Διαγράφηκε ο κανόνας για {domain}.").replace("{domain}", rule.domain));
        });

        listEl.appendChild(card);
      });
    }

    function setActiveView(viewName) {
      const libView = $("#libraryHubView");
      const readView = $("#readingView");
      const scrapView = $("#scrapersHubView");
      const appEl = $("#app");

      // 1. Explicitly toggle visibility on all 3 views
      if (libView) {
        libView.hidden = (viewName !== "library");
        libView.classList.remove("d-none");
      }
      if (readView) {
        readView.hidden = (viewName !== "reading");
        readView.classList.remove("d-none");
      }
      if (scrapView) {
        scrapView.hidden = (viewName !== "scrapers");
        scrapView.classList.remove("d-none");
      }

      // 2. Close any open drawers or popups
      closeAllDrawers();
      const moreDrop = $("#moreDropdown");
      if (moreDrop) moreDrop.hidden = true;
      const moreBtn = $("#moreMenuBtn");
      if (moreBtn) moreBtn.setAttribute("aria-expanded", "false");

      // 3. Update #app reading-active and zen classes
      if (appEl) {
        if (viewName === "reading") {
          appEl.classList.add("reading-active");
        } else {
          appEl.classList.remove("reading-active", "zen", "reveal-top", "reveal-dock");
        }
      }

      // 4. Update action buttons
      const zenBtn = $("#zenBtn");
      if (zenBtn) {
        zenBtn.hidden = (viewName !== "reading");
        if (viewName !== "reading") zenBtn.classList.remove("active-zen");
      }
      const notesBtn = $("#notesBtn");
      if (notesBtn) notesBtn.hidden = (viewName !== "reading");
      const moreNotesBtn = $("#moreNotesBtn");
      if (moreNotesBtn) moreNotesBtn.hidden = (viewName !== "reading");

      const libraryBtn = $("#libraryBtn");
      if (libraryBtn) libraryBtn.hidden = false;

      const scrapersBtn = $("#scrapersBtn");
      if (scrapersBtn) scrapersBtn.hidden = (viewName === "reading");

      const statsBtn = $("#statsBtn");
      if (statsBtn) statsBtn.hidden = (viewName === "reading");

      const moreScrapersBtn = $("#moreScrapersBtn");
      if (moreScrapersBtn) moreScrapersBtn.hidden = (viewName === "reading");

      const langWrap = $("#langSelectorWrap");
      if (langWrap) langWrap.hidden = (viewName === "reading");

      // 5. Cleanup when leaving reading view
      if (viewName !== "reading") {
        if (typeof closeImportModal === "function") closeImportModal();
        stopTts();
        hideSelectionMenu();
        FireflyEngine.stop();

        suppressAudioStateSync = true;
        if (typeof audioPlayer !== "undefined" && audioPlayer) audioPlayer.pause();
        setTimeout(() => { suppressAudioStateSync = false; }, 80);

        suppressNoiseStateSync = true;
        if (typeof stopNoise === "function") stopNoise(false);
        suppressNoiseStateSync = false;

        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => { });
        }
        const progFill = $("#progressFill");
        if (progFill) progFill.style.width = "0%";
      }

      // 6. View-specific lifecycle & headerTitle
      if (viewName === "scrapers") {
        const headerTitle = $("#headerTitle");
        if (headerTitle) headerTitle.textContent = t("scrapers_title") || "Κανόνες Εξαγωγής Άρθρων";
        if (scrapView) scrapView.scrollTop = 0;
        renderScraperRulesList();
      } else if (viewName === "library") {
        if (currentBookId && bookText) {
          saveLibraryState();
        }
        currentBookId = null;
        updateHubUI();
        if (libView) libView.scrollTop = 0;
        renderLibraryHub();
      } else if (viewName === "reading") {
        const grpObj = groups.find((g) => g.id === currentGroupId);
        const headerTitle = $("#headerTitle");
        if (headerTitle) {
          headerTitle.textContent = grpObj ? `${grpObj.name} · ${bookTitle}` : bookTitle;
        }
        updateNotesBadge();
        recalcAfterLayoutSettle();
      }

      WakeLockManager.sync();
    }
    window.setActiveView = setActiveView;

    function showScrapersView() {
      setActiveView("scrapers");
    }

    /* --- Dedicated Library & Groups Hub Rendering --- */
    function syncGroupSelectors() {
      const sel = $("#targetGroupSelect");
      if (!sel) return;
      const prevVal = sel.value;
      sel.innerHTML = "";
      groups.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = g.id;
        let displayName = g.name;
        if (g.id === "grp-books") displayName = t("group_books");
        else if (g.id === "grp-articles") displayName = t("group_articles");
        const groupPrefix = t("lbl_group") || "Group";
        opt.textContent = `${groupPrefix}: ${displayName}`;
        sel.appendChild(opt);
      });
      const activeTab = document.querySelector(".mode-tab.active");
      const pane = activeTab ? activeTab.dataset.pane : "paneFile";
      if (prevVal && groups.some((g) => g.id === prevVal)) {
        sel.value = prevVal;
      } else if (activeGroupFilter !== "all" && groups.some((g) => g.id === activeGroupFilter)) {
        sel.value = activeGroupFilter;
      } else if (pane === "paneFile" && groups.some((g) => g.id === "grp-books")) {
        sel.value = "grp-books";
      } else if ((pane === "paneUrl" || pane === "panePaste") && groups.some((g) => g.id === "grp-articles")) {
        sel.value = "grp-articles";
      } else {
        sel.value = groups[0]?.id || "grp-books";
      }
    }

    function renderLibraryHub() {
      if (typeof ReadingStatsEngine !== "undefined" && ReadingStatsEngine.render) {
        ReadingStatsEngine.render();
      }
      syncGroupSelectors();

      const filterBar = $("#groupFilterBar");
      filterBar.innerHTML = "";

      const allPill = document.createElement("button");
      allPill.className = "group-pill" + (activeGroupFilter === "all" ? " active" : "");
      allPill.innerHTML = `${t("filter_all_groups")} <span class="pill-num">${library.length}</span>`;
      allPill.addEventListener("click", () => {
        activeGroupFilter = "all";
        renderLibraryHub();
      });
      filterBar.appendChild(allPill);

      groups.forEach((g) => {
        const count = getGroupItems(g.id).length;
        let displayName = g.name;
        if (g.id === "grp-books") displayName = t("group_books");
        else if (g.id === "grp-articles") displayName = t("group_articles");

        const pill = document.createElement("button");
        pill.className = "group-pill" + (activeGroupFilter === g.id ? " active" : "");
        const pillIcon = g.id === "grp-books"
          ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" style="vertical-align:-1px;margin-right:4px"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>`
          : (g.id === "grp-articles"
            ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" style="vertical-align:-1px;margin-right:4px"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M7 8h6"/><path d="M7 12h8"/><path d="M7 16h5"/></svg>`
            : "");
        pill.innerHTML = `${pillIcon}${escapeHtml(displayName)} <span class="pill-num">${count}</span>`;
        pill.addEventListener("click", () => {
          activeGroupFilter = g.id;
          renderLibraryHub();
        });
        filterBar.appendChild(pill);
      });

      $("#hubStatsLabel").textContent = `${library.length} ${t("stat_items")} ${groups.length} ${t("stat_groups")}`;

      const container = $("#groupsContainer");
      container.innerHTML = "";

      const visibleGroups = activeGroupFilter === "all"
        ? groups
        : groups.filter((g) => g.id === activeGroupFilter);

      visibleGroups.forEach((grp) => {
        const items = getGroupItems(grp.id);
        const totalMins = items.reduce((acc, it) => acc + (it.readMinutes || estimateReadMinutes(it.text)), 0);

        const card = document.createElement("section");
        card.className = "playlist-card";

        let grpTitle = grp.name;
        if (grp.id === "grp-books") grpTitle = t("group_books");
        else if (grp.id === "grp-articles") grpTitle = t("group_articles");

        let grpIconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" style="vertical-align:-3px;margin-right:8px;flex-shrink:0"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
        if (grp.id === "grp-books") {
          grpIconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" style="vertical-align:-3px;margin-right:8px;flex-shrink:0"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>`;
        } else if (grp.id === "grp-articles") {
          grpIconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" style="vertical-align:-3px;margin-right:8px;flex-shrink:0"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M7 8h6"/><path d="M7 12h8"/><path d="M7 16h5"/></svg>`;
        }

        let addBtnTitle = t("btn_add_content") || "Προσθήκη περιεχομένου";
        if (grp.id === "grp-books") {
          addBtnTitle = t("title_add_book") || "Προσθήκη βιβλίου / αρχείου";
        } else if (grp.id === "grp-articles") {
          addBtnTitle = t("title_add_article") || "Προσθήκη άρθρου / κειμένου";
        }

        const isDefaultGrp = grp.id === "grp-books" || grp.id === "grp-articles";
        card.innerHTML = `
            <div class="playlist-card-head">
              <div class="playlist-card-title">
                <h2 style="display:inline-flex;align-items:center">${grpIconSvg}<span>${escapeHtml(grpTitle)}</span></h2>
                <span class="playlist-subtitle">${items.length} ${t("stat_items_short")} · ~${totalMins} ${t("mins_short")}</span>
              </div>

              <div class="playlist-card-actions">
                <button class="btn sm primary group-add-btn" data-group-id="${grp.id}" title="${escapeHtml(addBtnTitle)}" aria-label="${escapeHtml(addBtnTitle)}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                ${items.length ? `<button class="btn sm accent-btn play-group-btn" title="${t("btn_play_group")}">▶ ${t("btn_play_group")}</button>` : ""}
                <button class="btn sm rename-grp-btn" title="${t("btn_rename_group")}">${t("btn_rename_group")}</button>
                ${!isDefaultGrp ? `<button class="btn sm del-grp-btn" style="color:#e05252" title="${t("btn_delete_group")}">${t("btn_delete_group")}</button>` : ""}
              </div>

            </div>

            <div class="playlist-tracks"></div>
          `;

        card.querySelector(".group-add-btn")?.addEventListener("click", () => {
          openImportModal(grp.id);
        });

        const playGrpBtn = card.querySelector(".play-group-btn");
        if (playGrpBtn) {
          playGrpBtn.addEventListener("click", () => {
            const first = items[0];
            if (!first) return;
            openBook(first.title, first.text, first.charOffset || 0, first.bookmarkOffset || 0, first.id, first.highlights || [], first.audio || null, first.noise || null, first.groupId, first.kind, false, first.toc || []);
            setTimeout(() => speakCurrentSpread(first.charOffset || 0), 320);
          });
        }

        card.querySelector(".rename-grp-btn").addEventListener("click", () => {
          const nextName = prompt(t("prompt_rename_group"), grpTitle);
          if (nextName && nextName.trim()) {
            grp.name = nextName.trim();
            saveGroups();
            renderLibraryHub();
          }
        });

        const delGrpBtn = card.querySelector(".del-grp-btn");
        if (delGrpBtn) {
          delGrpBtn.addEventListener("click", () => {
            const grpTitle = grp.id === "grp-books" ? t("group_books") : (grp.id === "grp-articles" ? t("group_articles") : grp.name);
            const confirmMsg = (t("confirm_delete_group") || "Διαγραφή της ομάδας «{name}» και όλων των περιεχομένων της;").replace("{name}", grpTitle);
            if (!confirm(confirmMsg)) return;
            const fallbackId = groups[0].id;
            library.forEach((b) => { if (b.groupId === grp.id) b.groupId = fallbackId; });
            normalizeGroupOrders(fallbackId);
            groups = groups.filter((g) => g.id !== grp.id);
            if (activeGroupFilter === grp.id) activeGroupFilter = "all";
            saveGroups();
            saveLibraryState();
            renderLibraryHub();
            showToast(t("toast_group_deleted"));
          });
        }

        const listEl = card.querySelector(".playlist-tracks");
        if (!items.length) {
          listEl.innerHTML = `<div class="empty-group-msg" style="cursor:pointer" title="${escapeHtml(addBtnTitle)}">${t("empty_group_msg")} <span style="text-decoration:underline;color:var(--accent);margin-left:4px">+ ${escapeHtml(addBtnTitle)}</span></div>`;
          listEl.querySelector(".empty-group-msg")?.addEventListener("click", () => openImportModal(grp.id));
        } else {
          items.forEach((item, idx) => {
            const row = document.createElement("div");
            row.className = "track-row";
            const mins = item.readMinutes || estimateReadMinutes(item.text);
            const hlCount = (item.highlights && item.highlights.length) ? `<span class="meta-tag">✎ ${item.highlights.length} ${t("notes_short")}</span>` : "";
            const tocCount = (item.toc && item.toc.length) ? `<span class="meta-tag">☰ ${item.toc.length} ${t("chapters_short")}</span>` : "";
            const audioBadge = (item.audio && item.audio.trackName) ? `<span class="meta-tag" title="${escapeHtml(item.audio.trackName)}">♪ MP3</span>` : "";
            const noiseBadge = (item.noise && item.noise.active) ? `<span class="meta-tag">🌧 ${t("noise_" + item.noise.type) || NOISE_LABELS[item.noise.type] || "Audio"}</span>` : "";

            let kindText = item.kind || "Κείμενο";
            if (kindText === "Κείμενο") kindText = t("kind_text");
            else if (kindText === "Άρθρο") kindText = t("kind_article");
            else if (kindText === "Βιβλίο") kindText = t("kind_book");

            const moveOptions = groups.map((g) => {
              let gName = g.name;
              if (g.id === "grp-books") gName = t("group_books");
              else if (g.id === "grp-articles") gName = t("group_articles");
              return `<option value="${g.id}" ${g.id === grp.id ? "selected" : ""}>${escapeHtml(gName)}</option>`;
            }).join("");

            let domain = item.domain || item.siteDomain || "";
            if (!domain && item.url) {
              try { domain = new URL(item.url).hostname.replace(/^www\./i, ""); } catch (_) { }
            }
            if (!domain && item.kind && /\.[a-z]{2,}$/i.test(item.kind)) {
              domain = item.kind.replace(/^www\./i, "");
            }
            if (!domain && item.text) {
              const urlMatch = item.text.slice(0, 500).match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-z]{2,})/);
              if (urlMatch) domain = urlMatch[1];
            }

            let faviconHtml = "";
            const hasFavicon = Boolean(item.favicon && (item.favicon.startsWith("data:image/") || item.favicon.startsWith("blob:") || item.favicon.startsWith("http")));

            if (domain || hasFavicon) {
              const fbLetter = domain ? domain.charAt(0).toUpperCase() : (item.title ? item.title.charAt(0).toUpperCase() : "A");
              if (hasFavicon) {
                faviconHtml = `<span class="track-favicon-wrap" title="${escapeHtml(domain || item.title)}">
                    <img class="track-favicon" src="${escapeHtml(item.favicon)}" alt="${escapeHtml(domain || item.title)}" />
                    <span class="track-favicon-fallback" style="display:none">${escapeHtml(fbLetter)}</span>
                  </span>`;
              } else {
                faviconHtml = `<span class="track-favicon-wrap" title="${escapeHtml(domain || item.title)}">
                    <span class="track-favicon-fallback">${escapeHtml(fbLetter)}</span>
                  </span>`;
              }
            } else if (grp.id === "grp-articles" || (item.kind && item.kind.includes("Άρθρο"))) {
              faviconHtml = `<span class="track-favicon-wrap" title="Article">
                  <span class="track-favicon-fallback"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M7 8h6"/><path d="M7 12h8"/><path d="M7 16h5"/></svg></span>
                </span>`;
            } else {
              faviconHtml = `<span class="track-favicon-wrap" title="${escapeHtml(item.kind || "Book")}">
                  <span class="track-favicon-fallback"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
                </span>`;
            }

            const dateHtml = item.datetime ? `<span class="meta-tag date-tag">📅 ${escapeHtml(item.datetime)}</span>` : "";

            row.innerHTML = `
                <div class="track-left">
                  <span class="track-num">${idx + 1}</span>
                  ${faviconHtml}
                  <div class="track-info">
                    <strong>${escapeHtml(item.title)}</strong>
                    <div class="track-meta">
                      ${dateHtml}
                      <span class="meta-tag">${escapeHtml(kindText)}</span>
                      <span>~${mins} ${t("mins_short")}</span>
                      <span>${t("lbl_progress")}: ${item.progress || 0}%</span>
                      ${tocCount}
                      ${audioBadge}
                      ${noiseBadge}
                      ${hlCount}
                    </div>
                  </div>
                </div>

                <div class="track-controls">
                  <button class="mini-icon-btn move-up-btn" title="${t("title_move_up")}" ${idx === 0 ? "disabled style='opacity:0.35'" : ""}>↑</button>
                  <button class="mini-icon-btn move-down-btn" title="${t("title_move_down")}" ${idx === items.length - 1 ? "disabled style='opacity:0.35'" : ""}>↓</button>
                  <select class="move-group-select" title="${t("title_move_group")}" aria-label="Ομάδα">${moveOptions}</select>
                  <button class="mini-icon-btn danger del-item-btn" title="${t("title_delete")}">×</button>
                </div>
              `;

            const favImg = row.querySelector(".track-favicon");
            if (favImg) {
              favImg.addEventListener("error", () => {
                favImg.style.display = "none";
                const fallbackEl = favImg.nextElementSibling;
                if (fallbackEl) fallbackEl.style.display = "grid";
              });
            }

            row.addEventListener("click", (e) => {
              if (e.target.closest(".track-controls")) return;
              openBook(
                item.title,
                item.text,
                item.charOffset || 0,
                item.bookmarkOffset || 0,
                item.id,
                item.highlights || [],
                item.audio || null,
                item.noise || null,
                item.groupId,
                item.kind || "Κείμενο",
                false,
                item.toc || []
              );
            });

            row.querySelector(".move-up-btn").addEventListener("click", (e) => {
              e.stopPropagation();
              if (idx <= 0) return;
              const prev = items[idx - 1];
              const tmp = item.order;
              item.order = prev.order;
              prev.order = tmp;
              saveLibraryState();
            });

            row.querySelector(".move-down-btn").addEventListener("click", (e) => {
              e.stopPropagation();
              if (idx >= items.length - 1) return;
              const next = items[idx + 1];
              const tmp = item.order;
              item.order = next.order;
              next.order = tmp;
              saveLibraryState();
            });

            row.querySelector(".move-group-select").addEventListener("change", (e) => {
              e.stopPropagation();
              const newGrpId = e.target.value;
              item.groupId = newGrpId;
              item.order = getGroupItems(newGrpId).length;
              normalizeGroupOrders(grp.id);
              saveLibraryState();
              showToast(t("toast_item_moved") || "Μεταφέρθηκε στην ομάδα.");
            });

            row.querySelector(".del-item-btn").addEventListener("click", (e) => {
              e.stopPropagation();
              const confirmMsg = (t("confirm_delete_item") || "Διαγραφή του «{title}» από τη βιβλιοθήκη;").replace("{title}", item.title);
              if (!confirm(confirmMsg)) return;
              const bookIdToDel = item.id;
              library = library.filter((b) => b.id !== bookIdToDel);
              if (typeof AssetDB !== "undefined" && AssetDB.deleteBook) {
                AssetDB.deleteBook(bookIdToDel).catch(() => { });
              }
              normalizeGroupOrders(grp.id);
              saveLibraryState();
            });

            listEl.appendChild(row);
          });
        }

        container.appendChild(card);
      });
    }

    /* --- 100% Offline Native EPUB Reader with Real TOC Extraction (nav / ncx + Fragment Anchors) --- */
    async function extractZipEntries(arrayBuffer) {
      const view = new DataView(arrayBuffer);
      const bytes = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder("utf-8");

      let eocdOffset = -1;
      const minOffset = Math.max(0, bytes.length - 65558);
      for (let i = bytes.length - 22; i >= minOffset; i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
          eocdOffset = i;
          break;
        }
      }
      if (eocdOffset < 0) throw new Error("Μη έγκυρο αρχείο EPUB (ZIP).");

      const totalEntries = view.getUint16(eocdOffset + 10, true);
      let cdOffset = view.getUint32(eocdOffset + 16, true);
      const entries = new Map();

      for (let i = 0; i < totalEntries; i++) {
        if (view.getUint32(cdOffset, true) !== 0x02014b50) break;
        const method = view.getUint16(cdOffset + 10, true);
        const compSize = view.getUint32(cdOffset + 20, true);
        const nameLen = view.getUint16(cdOffset + 28, true);
        const extraLen = view.getUint16(cdOffset + 30, true);
        const commentLen = view.getUint16(cdOffset + 32, true);
        const localHeaderOffset = view.getUint32(cdOffset + 42, true);

        const fileName = decoder.decode(bytes.subarray(cdOffset + 46, cdOffset + 46 + nameLen));
        cdOffset += 46 + nameLen + extraLen + commentLen;

        if (fileName.endsWith("/")) continue;

        entries.set(fileName, async () => {
          if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) return new Uint8Array(0);
          const lNameLen = view.getUint16(localHeaderOffset + 26, true);
          const lExtraLen = view.getUint16(localHeaderOffset + 28, true);
          const dataStart = localHeaderOffset + 30 + lNameLen + lExtraLen;
          const compData = bytes.subarray(dataStart, dataStart + compSize);

          if (method === 0) return compData;
          if (method === 8) {
            const ds = new DecompressionStream("deflate-raw");
            const stream = new Blob([compData]).stream().pipeThrough(ds);
            const ab = await new Response(stream).arrayBuffer();
            return new Uint8Array(ab);
          }
          throw new Error(`Μη υποστηριζόμενη συμπίεση ZIP (${method}).`);
        });
      }
      return entries;
    }

    function resolveZipPath(baseDir, relPath) {
      const cleanRel = decodeURIComponent((relPath || "").split("#")[0]).replace(/\\/g, "/");
      const stack = baseDir ? baseDir.split("/").filter(Boolean) : [];
      for (const part of cleanRel.split("/")) {
        if (part === "..") stack.pop();
        else if (part && part !== ".") stack.push(part);
      }
      return stack.join("/");
    }

    function htmlToCleanBookText(xhtmlStr) {
      const doc = new DOMParser().parseFromString(xhtmlStr, "text/html");
      doc.querySelectorAll("script, style, nav, svg").forEach((el) => el.remove());

      const blocks = [];
      const headings = [];
      const anchorSnippets = new Map(); // id -> snippet text near anchor

      const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const t = node.textContent.replace(/\s+/g, " ");
          if (t.trim()) blocks.push(t);
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const tag = node.tagName.toLowerCase();

        const elId = node.getAttribute("id") || node.getAttribute("name");
        if (elId) {
          const snippet = node.textContent.replace(/\s+/g, " ").trim().slice(0, 60);
          if (snippet) anchorSnippets.set(elId, snippet);
        }

        if (/^h[1-6]$/.test(tag)) {
          const heading = node.textContent.replace(/\s+/g, " ").trim();
          if (heading) {
            headings.push(heading);
            blocks.push(`\n\n${heading}\n\n`);
          }
          return;
        }
        if (/^(p|div|li|blockquote|section|article|tr|br)$/.test(tag)) {
          blocks.push("\n\n");
          node.childNodes.forEach(walk);
          blocks.push("\n\n");
          return;
        }
        node.childNodes.forEach(walk);
      };

      if (doc.body) doc.body.childNodes.forEach(walk);
      const text = normalizeText(blocks.join(""));

      const toc = [];
      let cursor = 0;
      for (const h of headings) {
        const idx = text.indexOf(h, cursor);
        if (idx >= 0) {
          toc.push({ label: h, offset: idx });
          cursor = idx + h.length;
        }
      }

      const anchorOffsets = new Map();
      for (const [id, snippet] of anchorSnippets.entries()) {
        const idx = text.indexOf(snippet);
        if (idx >= 0) anchorOffsets.set(id, idx);
      }

      return { text, toc, anchorOffsets };
    }

    async function loadEpubFile(file) {
      showToast(t("toast_opening_epub") || "Άνοιγμα βιβλίου EPUB...");
      try {
        const ab = await file.arrayBuffer();
        const entries = await extractZipEntries(ab);
        const decoder = new TextDecoder("utf-8");

        const readTextEntry = async (path) => {
          if (!path) return null;
          const getter = entries.get(path) || entries.get(decodeURIComponent(path));
          if (getter) {
            const u8 = await getter();
            return decoder.decode(u8);
          }
          const lower = path.toLowerCase();
          for (const [k, fn] of entries.entries()) {
            if (k.toLowerCase() === lower) {
              const u8 = await fn();
              return decoder.decode(u8);
            }
          }
          return null;
        };

        const containerXml = await readTextEntry("META-INF/container.xml");
        if (!containerXml) throw new Error(t("toast_invalid_epub") || "Δεν βρέθηκε το container.xml στο EPUB.");

        const containerDoc = new DOMParser().parseFromString(containerXml, "application/xml");
        const rootfile = containerDoc.querySelector("rootfile");
        const opfPath = rootfile ? rootfile.getAttribute("full-path") : "";
        const opfXml = await readTextEntry(opfPath);
        if (!opfXml) throw new Error("Δεν βρέθηκε το πακέτο περιεχομένων OPF.");

        const opfDoc = new DOMParser().parseFromString(opfXml, "application/xml");
        const titleEl = opfDoc.querySelector("metadata title, dc\\:title");
        const docTitle = (titleEl && titleEl.textContent.trim()) || file.name.replace(/\.epub$/i, "");

        const manifest = new Map();
        let navHref = null;
        let ncxHref = null;

        opfDoc.querySelectorAll("manifest > item").forEach((item) => {
          const id = item.getAttribute("id");
          const href = item.getAttribute("href");
          const type = item.getAttribute("media-type") || "";
          const props = item.getAttribute("properties") || "";
          manifest.set(id, { href, type });
          if (/\bnav\b/.test(props)) navHref = href;
          if (type === "application/x-dtbncx+xml") ncxHref = href;
        });

        const baseDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/")) : "";
        const spineRefs = Array.from(opfDoc.querySelectorAll("spine > itemref"));
        const chapters = [];
        const fileStartOffsets = new Map();
        const fullAnchorOffsets = new Map(); // "path#id" -> offset
        const headingToc = [];
        let runningLen = 0;

        for (const ref of spineRefs) {
          const item = manifest.get(ref.getAttribute("idref"));
          if (!item || !item.href) continue;
          const fullPath = resolveZipPath(baseDir, item.href);
          const html = await readTextEntry(fullPath);
          if (!html) continue;
          const parsed = htmlToCleanBookText(html);
          if (parsed.text && parsed.text.length > 15) {
            fileStartOffsets.set(fullPath.toLowerCase(), runningLen);
            for (const [id, relOff] of parsed.anchorOffsets.entries()) {
              fullAnchorOffsets.set(`${fullPath.toLowerCase()}#${id}`, runningLen + relOff);
            }
            for (const h of parsed.toc) {
              headingToc.push({ label: h.label, offset: runningLen + h.offset });
            }
            chapters.push(parsed.text);
            runningLen += parsed.text.length + 2;
          }
        }

        const fullBook = normalizeText(chapters.join("\n\n"));
        if (!fullBook) throw new Error(t("toast_epub_no_text") || "Το EPUB δεν περιέχει αναγνώσιμο κείμενο.");

        const resolveTargetHref = (dir, rawHref) => {
          const [filePart, fragPart] = (rawHref || "").split("#");
          const targetPath = resolveZipPath(dir, filePart).toLowerCase();
          if (fragPart && fullAnchorOffsets.has(`${targetPath}#${fragPart}`)) {
            return fullAnchorOffsets.get(`${targetPath}#${fragPart}`);
          }
          if (fileStartOffsets.has(targetPath)) {
            return fileStartOffsets.get(targetPath);
          }
          return null;
        };

        let officialToc = [];
        if (navHref) {
          const navPath = resolveZipPath(baseDir, navHref);
          const navDir = navPath.includes("/") ? navPath.slice(0, navPath.lastIndexOf("/")) : "";
          const navHtml = await readTextEntry(navPath);
          if (navHtml) {
            const navDoc = new DOMParser().parseFromString(navHtml, "text/html");
            const navs = Array.from(navDoc.querySelectorAll("nav"));
            const tocNav =
              navs.find((n) => (n.getAttribute("epub:type") || "").includes("toc") || n.getAttribute("role") === "doc-toc") ||
              navs.sort((a, b) => b.querySelectorAll("a[href]").length - a.querySelectorAll("a[href]").length)[0];

            if (tocNav) {
              tocNav.querySelectorAll("a[href]").forEach((a) => {
                const label = a.textContent.replace(/\s+/g, " ").trim();
                const href = a.getAttribute("href");
                if (!label || !href) return;
                const off = resolveTargetHref(navDir, href);
                if (off !== null) {
                  officialToc.push({ label, offset: off });
                }
              });
            }
          }
        }

        if (!officialToc.length && ncxHref) {
          const ncxPath = resolveZipPath(baseDir, ncxHref);
          const ncxDir = ncxPath.includes("/") ? ncxPath.slice(0, ncxPath.lastIndexOf("/")) : "";
          const ncxXml = await readTextEntry(ncxPath);
          if (ncxXml) {
            const ncxDoc = new DOMParser().parseFromString(ncxXml, "application/xml");
            ncxDoc.querySelectorAll("navPoint").forEach((np) => {
              const labelEl = np.querySelector("navLabel > text");
              const contentEl = np.querySelector("content");
              const label = labelEl ? labelEl.textContent.replace(/\s+/g, " ").trim() : "";
              const src = contentEl ? contentEl.getAttribute("src") : "";
              if (!label || !src) return;
              const off = resolveTargetHref(ncxDir, src);
              if (off !== null) {
                officialToc.push({ label, offset: off });
              }
            });
          }
        }

        const finalToc = officialToc.length ? officialToc : headingToc;

        const existing = library.find((b) => b.title === docTitle);
        const defaultGrp = $("#targetGroupSelect").value || (groups.some((g) => g.id === "grp-books") ? "grp-books" : groups[0].id);
        openBook(
          docTitle,
          fullBook,
          existing ? existing.charOffset : 0,
          existing ? existing.bookmarkOffset : 0,
          existing ? existing.id : null,
          existing ? existing.highlights : [],
          existing ? existing.audio : null,
          existing ? existing.noise : null,
          existing ? existing.groupId : defaultGrp,
          "EPUB",
          false,
          finalToc
        );
        showToast((t("toast_epub_loaded_sections") || "Φορτώθηκε το EPUB ({count} ενότητες).").replace("{count}", chapters.length));
      } catch (err) {
        showToast(err && err.message ? err.message : (t("toast_epub_error") || "Σφάλμα ανάγνωσης EPUB."));
      }
    }

    /* --- PDF Reader Engine (Classic <script> Loader with Multi-CDN URLs & Outline TOC) --- */
    function loadScriptTag(libUrl, workerUrl) {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = libUrl;
        script.onload = async () => {
          const lib = window.pdfjsLib;
          if (!lib) return reject(new Error("Invalid pdfjsLib"));
          try {
            const res = await fetch(workerUrl);
            const code = await res.text();
            const blob = new Blob([code], { type: "application/javascript" });
            lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
          } catch (_) {
            lib.GlobalWorkerOptions.workerSrc = workerUrl;
          }
          resolve(lib);
        };
        script.onerror = () => {
          script.remove();
          reject(new Error("Failed to load " + libUrl));
        };
        document.head.appendChild(script);
      });
    }

    function ensurePdfJs() {
      if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
      if (pdfJsPromise) return pdfJsPromise;

      const cdnMirrors = [
        {
          lib: "./pdf.min.js",
          worker: "./pdf.worker.min.js"
        },
        {
          lib: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
          worker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
        },
        {
          lib: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
          worker: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js"
        },
        {
          lib: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js",
          worker: "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js"
        }
      ];

      pdfJsPromise = (async () => {
        for (const mirror of cdnMirrors) {
          try {
            return await loadScriptTag(mirror.lib, mirror.worker);
          } catch (_) { }
        }
        pdfJsPromise = null;
        throw new Error(t("pdf_engine_err") || "Απαιτείται σύνδεση internet για τη φόρτωση της μηχανής PDF.");
      })();

      return pdfJsPromise;
    }
    window.ensurePdfJs = ensurePdfJs;

    function reflowPdfPageItems(items) {
      const tokens = [];
      for (const item of items) {
        if (!item || typeof item.str !== "string") continue;
        const cleanStr = item.str.replace(/[\t\u00A0\u2000-\u200B\u3000]+/g, " ").replace(/ {2,}/g, " ");
        if (!cleanStr.trim()) continue;
        const x = item.transform ? item.transform[4] : 0;
        const y = item.transform ? item.transform[5] : 0;
        const h = Math.abs(item.height || (item.transform ? item.transform[3] : 12)) || 12;
        const w = item.width || 0;
        tokens.push({ str: cleanStr, x, y, h, w });
      }
      if (!tokens.length) return "";

      tokens.sort((a, b) => {
        if (Math.abs(a.y - b.y) > Math.min(a.h, b.h) * 0.45) return b.y - a.y;
        return a.x - b.x;
      });

      const lines = [];
      let currentLine = [tokens[0]];
      let lineY = tokens[0].y;
      let lineH = tokens[0].h;

      for (let i = 1; i < tokens.length; i++) {
        const t = tokens[i];
        if (Math.abs(t.y - lineY) <= Math.max(lineH, t.h) * 0.45) {
          currentLine.push(t);
        } else {
          lines.push({ tokens: currentLine, y: lineY, h: lineH });
          currentLine = [t];
          lineY = t.y;
          lineH = t.h;
        }
      }
      lines.push({ tokens: currentLine, y: lineY, h: lineH });

      const textLines = lines.map((line) => {
        line.tokens.sort((a, b) => a.x - b.x);
        let lineText = "";
        let prevEnd = null;
        for (const t of line.tokens) {
          const s = t.str.trim();
          if (!s) continue;
          if (!lineText) {
            lineText = s;
          } else {
            const gap = prevEnd !== null ? (t.x - prevEnd) : 5;
            if (gap > t.h * 0.12 && !lineText.endsWith("-") && !/^[,.;:!?)\]»”’]/.test(s)) {
              lineText += " " + s;
            } else {
              lineText += s;
            }
          }
          prevEnd = t.x + t.w;
        }
        return { text: lineText.replace(/ {2,}/g, " ").trim(), y: line.y, h: line.h };
      }).filter((l) => l.text.length > 0);

      if (!textLines.length) return "";

      const dySteps = [];
      for (let i = 1; i < textLines.length; i++) {
        const step = Math.abs(textLines[i - 1].y - textLines[i].y);
        if (step > 2) dySteps.push(step);
      }
      dySteps.sort((a, b) => a - b);
      const medianStep = dySteps.length ? dySteps[Math.floor(dySteps.length / 2)] : 16;

      let result = textLines[0].text;
      for (let i = 1; i < textLines.length; i++) {
        const prev = textLines[i - 1];
        const curr = textLines[i];
        const dy = Math.abs(prev.y - curr.y);
        const avgH = (prev.h + curr.h) / 2;

        const isLargeGap = dy > Math.max(avgH * 1.55, medianStep * 1.32);
        const prevIsHeading = prev.text.length < 55 && !/[.,;:]$/.test(prev.text) && prev.text === prev.text.toLocaleUpperCase();
        const currIsBullet = /^([•\-–—*▪‣]|\d+[.)])\s+/.test(curr.text);

        if (isLargeGap || prevIsHeading || currIsBullet) {
          result += "\n\n" + curr.text;
        } else if (/[a-zA-Zα-ωΑ-ΩάέήίόύώΆΈΉΊΌΎΏϊϋΐΰ]-$/.test(result) && /^[a-zα-ωάέήίόύώϊϋΐΰ]/.test(curr.text)) {
          result = result.slice(0, -1) + curr.text;
        } else {
          result += " " + curr.text;
        }
      }

      return result;
    }

    async function extractPdfOutlineToc(pdf, pdfPageStartOffsets) {
      try {
        const outline = await pdf.getOutline();
        if (!outline || !outline.length) return [];
        const toc = [];

        const walkOutline = async (items, depth = 0) => {
          for (const item of items) {
            const label = (item.title || "").replace(/\s+/g, " ").trim();
            if (label && item.dest) {
              try {
                const dest = typeof item.dest === "string"
                  ? await pdf.getDestination(item.dest)
                  : item.dest;
                if (Array.isArray(dest) && dest[0]) {
                  const pageIdx = await pdf.getPageIndex(dest[0]);
                  const pdfPageNum = pageIdx + 1;
                  const offset = pdfPageStartOffsets[pdfPageNum] ?? 0;
                  const prefix = depth > 0 ? "  ".repeat(Math.min(depth, 3)) + "↳ " : "";
                  toc.push({ label: prefix + label, offset });
                }
              } catch (_) { }
            }
            if (item.items && item.items.length) {
              await walkOutline(item.items, depth + 1);
            }
          }
        };

        await walkOutline(outline, 0);
        return toc;
      } catch (_) {
        return [];
      }
    }

    /* --- Visual Loading / Waiting Screen --- */
    const LoadingOverlay = {
      show(title, detail = "", pct = null) {
        const ov = $("#loadingOverlay");
        if (!ov) return;
        const titleEl = $("#loadingTitle");
        const detailEl = $("#loadingDetail");
        const barEl = $("#loadingProgressFill") || $("#loadingProgressBar");
        const trackEl = $("#loadingProgressTrack");
        if (titleEl) titleEl.textContent = title || t("loading_title") || "Φόρτωση...";
        if (detailEl) detailEl.textContent = detail || "";
        if (trackEl && barEl) {
          if (typeof pct === "number" && pct >= 0) {
            trackEl.hidden = false;
            barEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
          } else {
            trackEl.hidden = true;
          }
        }
        ov.hidden = false;
        ov.classList.remove("closing");
      },
      update(detail = "", pct = null) {
        const detailEl = $("#loadingDetail");
        const barEl = $("#loadingProgressFill") || $("#loadingProgressBar");
        const trackEl = $("#loadingProgressTrack");
        if (detailEl && detail) detailEl.textContent = detail;
        if (trackEl && barEl && typeof pct === "number" && pct >= 0) {
          trackEl.hidden = false;
          barEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
        }
      },
      hide() {
        const ov = $("#loadingOverlay");
        if (!ov || ov.hidden) return;
        ov.classList.add("closing");
        setTimeout(() => {
          ov.hidden = true;
          ov.classList.remove("closing");
        }, 220);
      }
    };
    window.LoadingOverlay = LoadingOverlay;

    /* --- Pagination Layout-Keyed Cache --- */
    const PaginationCache = {
      mem: new Map(),
      getKey(bookId) {
        const sheet = $("#pageA");
        const contentEl = $("#contentA");
        const w = contentEl ? Math.round(contentEl.getBoundingClientRect().width) : 0;
        const h = sheet ? Math.round(sheet.clientHeight) : 0;
        const spread = pagesPerView();
        return `${bookId || "active"}_${w}x${h}_${prefs.font}_${prefs.size}_${prefs.lineHeight}_${prefs.align}_${spread}`;
      },
      get(bookId) {
        const key = this.getKey(bookId);
        if (this.mem.has(key)) return this.mem.get(key);
        return null;
      },
      async load(bookId) {
        const key = this.getKey(bookId);
        if (this.mem.has(key)) return this.mem.get(key);
        if (typeof AssetDB !== "undefined" && AssetDB.getPagination) {
          const cached = await AssetDB.getPagination(key);
          if (Array.isArray(cached) && cached.length > 0) {
            this.mem.set(key, cached);
            return cached;
          }
        }
        return null;
      },
      set(bookId, offsets) {
        if (!Array.isArray(offsets) || offsets.length === 0) return;
        const key = this.getKey(bookId);
        this.mem.set(key, offsets);
        if (typeof AssetDB !== "undefined" && AssetDB.savePagination) {
          AssetDB.savePagination(key, bookId, offsets);
        }
      },
      clear() {
        this.mem.clear();
      }
    };
    window.PaginationCache = PaginationCache;

        function cleanPdfExtractedText(rawText) {
      if (!rawText) return "";
      let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

      // 1. Dehyphenation: word broken with hyphen across newline
      text = text.replace(/([A-Za-zΑ-Ωα-ωά-ώΆ-Ώ]{2,})-\n([a-zα-ωά-ώ]{2,})/g, "$1$2");

      // 2. Split into lines
      const rawLines = text.split("\n").map((l) => l.trim());
      const cleanedLines = [];

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if (!line) {
          if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== "") {
            cleanedLines.push("");
          }
          continue;
        }

        if (cleanedLines.length === 0) {
          cleanedLines.push(line);
          continue;
        }

        const prev = cleanedLines[cleanedLines.length - 1];
        if (prev === "") {
          cleanedLines.push(line);
          continue;
        }

        // Terminal punctuation: . ! ? : ; … » " ” ) ]
        const prevEndsPunct = /[.!?…»”")\]]$/.test(prev);
        const currStartsDialogue = /^[—–\-«"“]/.test(line);
        const currStartsList = /^([•\-–—*▪‣]|\d+[.)])\s+/.test(line);
        const prevIsHeading = prev.length < 55 && (prev === prev.toUpperCase() || /^(ΚΕΦΑΛΑΙΟ|CHAPTER|ΜΕΡΟΣ|PART|BOOK)\b/i.test(prev));

        if (prevEndsPunct || currStartsDialogue || currStartsList || prevIsHeading) {
          cleanedLines.push(line);
        } else {
          // Soft line wrap inside a paragraph: join with a space
          cleanedLines[cleanedLines.length - 1] = prev + " " + line;
        }
      }

      // Second pass: fix spurious double enters (\n\n) across page boundaries & double-spaced lines
      const finalLines = [];
      for (let i = 0; i < cleanedLines.length; i++) {
        const cur = cleanedLines[i];
        if (cur === "") {
          const prev = finalLines.length > 0 ? finalLines[finalLines.length - 1] : null;
          let next = null;
          for (let j = i + 1; j < cleanedLines.length; j++) {
            if (cleanedLines[j] !== "") {
              next = cleanedLines[j];
              break;
            }
          }
          if (prev && next) {
            const prevEndsPunct = /[.!?…»”")\]]$/.test(prev);
            const prevIsHeading = prev.length < 55 && (prev === prev.toUpperCase() || /^(ΚΕΦΑΛΑΙΟ|CHAPTER|ΜΕΡΟΣ|PART|BOOK)\b/i.test(prev));
            const nextStartsLower = /^[a-zα-ωά-ώϊϋΐΰ]/.test(next);
            const nextStartsDialogue = /^[—–\-«"“]/.test(next);
            const nextStartsList = /^([•\-–—*▪‣]|\d+[.)])\s+/.test(next);

            if (!prevEndsPunct && !prevIsHeading && nextStartsLower && !nextStartsDialogue && !nextStartsList) {
              // Join prev and next across this empty line with a space
              finalLines[finalLines.length - 1] = prev + " " + next;
              // Advance past consumed next
              for (let j = i + 1; j < cleanedLines.length; j++) {
                if (cleanedLines[j] !== "") {
                  i = j;
                  break;
                }
              }
              continue;
            }
          }
          if (finalLines.length > 0 && finalLines[finalLines.length - 1] !== "") {
            finalLines.push("");
          }
        } else {
          finalLines.push(cur);
        }
      }

      let result = finalLines.join("\n");
      // Collapse 3+ newlines to max \n\n
      result = result.replace(/\n{3,}/g, "\n\n");
      return result.trim();
    }

    window.cleanPdfExtractedText = cleanPdfExtractedText;

    async function loadPdfFile(file) {
      LoadingOverlay.show(t("loading_pdf_title") || "Επεξεργασία PDF...", file.name, 0);
      try {
        const pdfjsLib = await ensurePdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let docTitle = file.name.replace(/\.pdf$/i, "");
        try {
          const meta = await pdf.getMetadata();
          if (meta && meta.info && meta.info.Title && meta.info.Title.trim().length > 2) {
            docTitle = meta.info.Title.trim();
          }
        } catch (_) { }

        const extractedPages = [];
        const pdfPageStartOffsets = {};
        let runningLen = 0;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const pct = Math.round((pageNum / pdf.numPages) * 100);
          LoadingOverlay.update((t("loading_pdf_detail") || "Σελίδα {current} / {total}").replace("{current}", pageNum).replace("{total}", pdf.numPages), pct);
          if (pageNum === 1 || pageNum % 5 === 0 || pageNum === pdf.numPages) {
            await new Promise((r) => setTimeout(r, 0));
          }
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const reflowed = normalizeText(reflowPdfPageItems(content.items));
          pdfPageStartOffsets[pageNum] = runningLen;
          if (reflowed) {
            extractedPages.push(reflowed);
            runningLen += reflowed.length + 2;
          }
        }

        const fullText = normalizeText(cleanPdfExtractedText(extractedPages.join("\n\n")));
        if (!fullText) {
          LoadingOverlay.hide();
          showToast(t("toast_pdf_no_text") || "Το PDF δεν περιέχει επιλέξιμο κείμενο (πιθανώς σκαναρισμένο).");
          return;
        }

        const pdfToc = await extractPdfOutlineToc(pdf, pdfPageStartOffsets);

        const existing = library.find((b) => b.title === docTitle);
        const defaultGrp = $("#targetGroupSelect").value || (groups.some((g) => g.id === "grp-books") ? "grp-books" : groups[0].id);
        LoadingOverlay.hide();
        openBook(
          docTitle,
          fullText,
          existing ? existing.charOffset : 0,
          existing ? existing.bookmarkOffset : 0,
          existing ? existing.id : null,
          existing ? existing.highlights : [],
          existing ? existing.audio : null,
          existing ? existing.noise : null,
          existing ? existing.groupId : defaultGrp,
          t("kind_book") || "Βιβλίο",
          false,
          pdfToc
        );
        showToast(t("toast_pdf_done") || "Έτοιμο! Αναδιατάχθηκε το PDF.");
      } catch (err) {
        LoadingOverlay.hide();
        showToast(err && err.message ? err.message : (t("toast_pdf_error") || "Σφάλμα ανάγνωσης αρχείου PDF."));
      }
    }

    /* --- Exact DOM-Measured Pagination (Zero Scroll & Zero Leading Spaces on Split) --- */
    function paginateExact(text) {
      if (prefs.mode === "scroll") {
        return [{ text: text, start: 0, end: text.length }];
      }

      // Check layout-keyed cache first
      const cachedOffsets = PaginationCache.get(currentBookId);
      if (Array.isArray(cachedOffsets) && cachedOffsets.length > 0) {
        const cachedPages = [];
        for (let i = 0; i < cachedOffsets.length; i++) {
          const s = cachedOffsets[i];
          const e = (i + 1 < cachedOffsets.length) ? cachedOffsets[i + 1] : text.length;
          const sl = text.slice(s, e).replace(/\s+$/, "");
          if (sl) cachedPages.push({ text: sl, start: s, end: s + sl.length });
        }
        if (cachedPages.length > 0) return cachedPages;
      }

      const sheet = $("#pageA");
      const contentEl = $("#contentA");
      const measurer = $("#pageMeasurer");

      const sheetStyle = getComputedStyle(sheet);
      const contentStyle = getComputedStyle(contentEl);

      const padTop = parseFloat(sheetStyle.paddingTop) || 0;
      const padBottom = parseFloat(sheetStyle.paddingBottom) || 0;
      const availHeight = Math.max(120, sheet.clientHeight - padTop - padBottom - 8);
      const contentWidth = contentEl.getBoundingClientRect().width;

      if (contentWidth < 50 || availHeight < 80) {
        return [{ text: text, start: 0, end: text.length }];
      }

      measurer.style.width = `${contentWidth}px`;
      measurer.style.fontFamily = contentStyle.fontFamily;
      measurer.style.fontSize = contentStyle.fontSize;
      measurer.style.lineHeight = contentStyle.lineHeight;
      measurer.style.textAlign = contentStyle.textAlign;
      measurer.style.letterSpacing = contentStyle.letterSpacing;
      measurer.style.wordSpacing = contentStyle.wordSpacing;

      const result = [];
      let cursor = 0;
      const len = text.length;
      let estChunk = 1800;

      while (cursor < len) {
        // Skip ALL leading whitespace (newlines, spaces, tabs) so a split sentence never starts with a space on the next page
        while (cursor < len && /\s/.test(text[cursor])) cursor++;
        if (cursor >= len) break;

        const remaining = len - cursor;
        if (remaining <= estChunk * 1.5) {
          const tail = text.slice(cursor, len).replace(/\s+$/, "");
          measurer.textContent = tail;
          if (measurer.offsetHeight <= availHeight) {
            if (tail) result.push({ text: tail, start: cursor, end: cursor + tail.length });
            break;
          }
        }

        let lo = cursor + 1;
        let hi = Math.min(len, cursor + estChunk);

        measurer.textContent = text.slice(cursor, hi);
        let step = Math.max(400, Math.floor(estChunk * 0.5));
        while (measurer.offsetHeight <= availHeight && hi < len) {
          lo = hi;
          hi = Math.min(len, hi + step);
          step = Math.floor(step * 1.4);
          measurer.textContent = text.slice(cursor, hi);
        }

        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          measurer.textContent = text.slice(cursor, mid);
          if (measurer.offsetHeight <= availHeight) lo = mid;
          else hi = mid - 1;
        }

        let cut = lo;
        if (cut < len) {
          const slice = text.slice(cursor, cut);
          const minSnap = Math.floor(slice.length * 0.72);
          const lastPara = slice.lastIndexOf("\n\n");
          const lastLine = slice.lastIndexOf("\n");
          const lastSpace = slice.lastIndexOf(" ");

          if (lastPara >= minSnap) cut = cursor + lastPara;
          else if (lastLine >= minSnap) cut = cursor + lastLine;
          else if (lastSpace >= Math.floor(slice.length * 0.5)) cut = cursor + lastSpace;
        }

        if (cut <= cursor) cut = Math.min(len, cursor + 1);

        const pageSlice = text.slice(cursor, cut).replace(/\s+$/, "");
        if (pageSlice) {
          result.push({ text: pageSlice, start: cursor, end: cursor + pageSlice.length });
          estChunk = Math.max(300, Math.round((cut - cursor) * 1.15));
        }
        cursor = cut;
      }

      measurer.textContent = "";
      const finalRes = result.length ? result : [{ text: text, start: 0, end: text.length }];
      PaginationCache.set(currentBookId, finalRes.map((p) => p.start));
      return finalRes;
    }

    /* --- Upgraded TOC Builder: Embedded TOC -> Smart Chapter Detection -> Pages Fallback --- */
    function resolveEffectiveToc() {
      if (Array.isArray(bookToc) && bookToc.length > 0) {
        return bookToc;
      }
      return detectChaptersFromText(bookText);
    }

    function buildOutline() {
      const select = $("#tocSelect");
      if (!select) return;
      select.innerHTML = "";

      effectiveToc = resolveEffectiveToc();

      if (effectiveToc.length > 0) {
        effectiveToc.slice(0, 300).forEach((item) => {
          const opt = document.createElement("option");
          opt.value = String(item.offset);
          opt.textContent = item.label;
          select.appendChild(opt);
        });
      } else {
        pages.forEach((p, idx) => {
          const opt = document.createElement("option");
          opt.value = String(p.start);
          opt.textContent = `${t("lbl_page") || "Σελίδα"} ${idx + 1}`;
          select.appendChild(opt);
        });
      }
      syncTocSelection();
    }

    function syncTocSelection() {
      const select = $("#tocSelect");
      if (!select || !select.options.length) return;

      let activeVal = null;
      if (effectiveToc.length > 0) {
        for (let i = effectiveToc.length - 1; i >= 0; i--) {
          if (charOffset >= effectiveToc[i].offset - 5) {
            activeVal = String(effectiveToc[i].offset);
            break;
          }
        }
        if (activeVal === null && effectiveToc.length) {
          activeVal = String(effectiveToc[0].offset);
        }
      } else if (pages[pageIndex]) {
        activeVal = String(pages[pageIndex].start);
      }

      if (activeVal && Array.from(select.options).some((o) => o.value === activeVal)) {
        select.value = activeVal;
      }
    }
    window.syncTocSelection = syncTocSelection;

    /* --- Render Page HTML with TTS Active Sentence, Highlights & Search Hits --- */
    function renderPageSliceHtml(pageObj) {
      const sliceStart = pageObj.start;
      const sliceText = pageObj.text;
      const sliceEnd = sliceStart + sliceText.length;

      const spans = [];

      if (activeTtsRange) {
        const ts = Math.max(sliceStart, activeTtsRange.start) - sliceStart;
        const te = Math.min(sliceEnd, activeTtsRange.end) - sliceStart;
        if (te > ts) spans.push({ s: ts, e: te, kind: "tts", priority: 1 });
      }

      if (searchQuery) {
        const lowerSlice = sliceText.toLocaleLowerCase();
        const lowerQ = searchQuery.toLocaleLowerCase();
        let pos = 0;
        while ((pos = lowerSlice.indexOf(lowerQ, pos)) !== -1) {
          spans.push({ s: pos, e: pos + lowerQ.length, kind: "search", priority: 2 });
          pos += lowerQ.length;
        }
      }

      for (const hl of highlights) {
        const s = Math.max(sliceStart, hl.start) - sliceStart;
        const e = Math.min(sliceEnd, hl.end) - sliceStart;
        if (e > s) spans.push({ s, e, kind: "hl", hl, priority: 3 });
      }

      if (!spans.length) return escapeHtml(sliceText);

      spans.sort((a, b) => a.s - b.s || a.priority - b.priority || b.e - a.e);
      let html = "";
      let cursor = 0;

      for (const sp of spans) {
        if (sp.e <= cursor) continue;
        const start = Math.max(cursor, sp.s);
        if (start > cursor) html += escapeHtml(sliceText.slice(cursor, start));
        const seg = escapeHtml(sliceText.slice(start, sp.e));
        if (sp.kind === "tts") {
          html += `<mark class="tts-active">${seg}</mark>`;
        } else if (sp.kind === "search") {
          html += `<mark class="search-hit">${seg}</mark>`;
        } else {
          const noteCls = sp.hl.note ? " has-note" : "";
          const titleAttr = sp.hl.note ? ` title="${escapeHtml(sp.hl.note)}"` : "";
          html += `<mark class="user-hl hl-${sp.hl.color || "yellow"}${noteCls}" data-hl-id="${sp.hl.id}"${titleAttr}>${seg}</mark>`;
        }
        cursor = sp.e;
      }

      if (cursor < sliceText.length) html += escapeHtml(sliceText.slice(cursor));
      return html;
    }

    function pagesPerView() {
      return (prefs.spread === "2" && window.innerWidth > 820) ? 2 : 1;
    }

    function findPageByOffset(offset) {
      for (let i = 0; i < pages.length; i++) {
        if (offset >= pages[i].start && offset < pages[i].end) return i;
        if (i + 1 < pages.length && offset >= pages[i].end && offset < pages[i + 1].start) return i + 1;
      }
      return Math.max(0, pages.length - 1);
    }

    function renderPages(animate = false, forceRecalc = false) {
      if (!bookText) return;
      const isScroll = prefs.mode === "scroll";
      $("#bookStage").hidden = isScroll;
      $("#scrollStage").hidden = !isScroll;

      if (isScroll) {
        $("#scrollContent").innerHTML = renderPageSliceHtml({ text: bookText, start: 0, end: bookText.length });
        $("#pageCounter").textContent = t("page_scroll_mode") || "Κύλιση";
        $("#progressFill").style.width = "100%";
        if (activeTtsRange) {
          const activeEl = $("#scrollContent .tts-active");
          if (activeEl) activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        syncTocSelection();
        return;
      }

      const perView = pagesPerView();
      $("#bookStage").classList.toggle("two", perView === 2);
      $("#pageB").hidden = perView !== 2;

      const didRecalc = forceRecalc || needsRepaginate || !pages.length;
      if (didRecalc) {
        if (ttsActive && activeTtsRange) {
          charOffset = activeTtsRange.start;
        }
        pages = paginateExact(bookText);
        needsRepaginate = false;
        buildOutline();
      }

      const anchorOffset = (ttsActive && activeTtsRange) ? activeTtsRange.start : charOffset;
      pageIndex = findPageByOffset(anchorOffset);
      if (perView === 2) pageIndex = Math.floor(pageIndex / 2) * 2;
      pageIndex = Math.max(0, Math.min(pageIndex, pages.length - 1));
      charOffset = pages[pageIndex].start;

      const pA = pages[pageIndex];
      const pB = pages[pageIndex + 1];
      $("#contentA").innerHTML = pA ? renderPageSliceHtml(pA) : "";
      $("#contentB").innerHTML = pB ? renderPageSliceHtml(pB) : "";

      if (animate) {
        $("#pageA").classList.remove("turn-anim");
        $("#pageB").classList.remove("turn-anim");
        void $("#pageA").offsetWidth;
        $("#pageA").classList.add("turn-anim");
        if (perView === 2) $("#pageB").classList.add("turn-anim");
      }

      const endPage = perView === 2 && pB ? pageIndex + 2 : pageIndex + 1;
      const rangeLabel = (perView === 2 && pB) ? `${pageIndex + 1}–${endPage}` : `${pageIndex + 1}`;
      $("#pageCounter").textContent = `${rangeLabel} / ${pages.length}`;

      const progressPct = Math.min(100, Math.round((endPage / pages.length) * 100));
      $("#progressFill").style.width = `${progressPct}%`;

      syncTocSelection();
      saveLibraryState();
    }

    /* --- Open Book / Switch Views --- */
    let currentBookMeta = {};
    async function openBook(
      title,
      rawText,
      startOffset = 0,
      savedBookmark = 0,
      existingId = null,
      savedHighlights = [],
      savedAudio = null,
      savedNoise = null,
      groupId = null,
      kind = "Άρθρο",
      inheritActiveMedia = false,
      extractedToc = [],
      extraMeta = {}
    ) {
      let textToUse = rawText;
      if (!textToUse && existingId) {
        try {
          const chunked = await AssetDB.getFullBookText(existingId);
          if (chunked) textToUse = chunked;
        } catch (err) {
          console.warn("[AssetDB] Error loading chunked text:", err);
        }
      }
      const cleaned = normalizeText(textToUse);
      if (!cleaned) {
        showToast(t("toast_no_text_found") || "Δεν βρέθηκε κείμενο για ανάγνωση.");
        return;
      }
      if (typeof closeImportModal === "function") closeImportModal();
      stopTts();
      bookTitle = title || (t("lbl_untitled") || "Χωρίς τίτλο");
      window.bookTitle = bookTitle;
      bookText = cleaned;
      bookKind = kind || "Άρθρο";
      bookToc = Array.isArray(extractedToc) ? extractedToc : [];
      currentGroupId = (groupId && groups.some((g) => g.id === groupId)) ? groupId : groups[0].id;
      charOffset = Math.max(0, Math.min(startOffset, cleaned.length - 1));
      bookmarkOffset = savedBookmark || 0;
      highlights = Array.isArray(savedHighlights) ? savedHighlights : [];
      bookAudio = savedAudio || null;
      bookNoise = savedNoise || null;
      currentBookId = existingId || ("book-" + Date.now());
      const existingEntry = existingId ? library.find((b) => b.id === existingId) : null;
      currentBookMeta = Object.assign({}, existingEntry || {}, extraMeta || {});
      needsRepaginate = true;
      buildOutline();
      setActiveView("reading");

      restoreBookAudio(savedAudio, inheritActiveMedia);
      restoreBookNoise(savedNoise, inheritActiveMedia);
      saveLibraryState();
    }
    window.openBook = openBook;

    let hubMode = "library"; // always library in current UI

    function setHubMode(mode) {
      hubMode = "library";
      updateHubUI();
      renderLibraryHub();
    }
    window.setHubMode = setHubMode;
    window.getHubMode = () => "library";

    function updateHubUI() {
      const composerCard = $("#composerCard");
      const libraryListSection = $("#libraryListSection");
      const hubMainTitle = $("#hubMainTitle");
      const hubSubtitle = $("#hubSubtitle");
      const headerTitle = $("#headerTitle");
      const newGroupBtn = $("#newGroupBtn");

      if (composerCard) composerCard.hidden = true;
      if (libraryListSection) libraryListSection.hidden = false;

      const mainTitleText = t("hub_title") || "Βιβλιοθήκη & Ομάδες";
      if (hubMainTitle) hubMainTitle.textContent = mainTitleText;
      if (headerTitle && $("#readingView").hidden) headerTitle.textContent = mainTitleText;
      if (hubSubtitle) {
        hubSubtitle.textContent = t("hub_desc") || "Το ήσυχο, 100% offline αναγνωστήριό σου — χωρίς θόρυβο, χωρίς tracking.";
      }

      if (newGroupBtn) newGroupBtn.hidden = false;
    }

    function showLibraryView() {
      setHubMode("library");
      setActiveView("library");
    }

    /* --- Contextual Import Modal Controls --- */
    function setImportPane(targetId) {
      document.querySelectorAll("#importModal .mode-tab").forEach((t) => {
        const active = t.dataset.pane === targetId;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", String(active));
      });
      ["paneFile", "paneUrl", "panePaste"].forEach((id) => {
        const el = $("#" + id);
        if (el) el.hidden = (id !== targetId);
      });
      if (targetId === "paneUrl") setTimeout(() => $("#urlImportInput")?.focus(), 60);
      else if (targetId === "panePaste") setTimeout(() => $("#pasteInput")?.focus(), 60);
    }
    window.setImportPane = setImportPane;

    function openImportModal(groupId) {
      const modal = $("#importModal");
      if (!modal) return;
      const targetGrp = groups.find((g) => g.id === groupId) || groups[0];
      const activeGrpId = targetGrp ? targetGrp.id : (groups[0]?.id || "grp-books");

      // Sync dropdown
      syncGroupSelectors();
      const grpSel = $("#targetGroupSelect");
      if (grpSel) grpSel.value = activeGrpId;

      let grpName = targetGrp ? targetGrp.name : "";
      if (activeGrpId === "grp-books") grpName = t("group_books") || "Βιβλία";
      else if (activeGrpId === "grp-articles") grpName = t("group_articles") || "Άρθρα";

      const subtitleEl = $("#importModalSubtitle");
      if (subtitleEl) subtitleEl.textContent = grpName ? `${t("lbl_group") || "Ομάδα"}: ${grpName}` : "";

      const titleEl = $("#importModalTitle");
      const modeTabsContainer = modal.querySelector(".mode-tabs");
      const tabFile = modal.querySelector('.mode-tab[data-pane="paneFile"]');
      const tabUrl = modal.querySelector('.mode-tab[data-pane="paneUrl"]');
      const tabPaste = modal.querySelector('.mode-tab[data-pane="panePaste"]');

      if (activeGrpId === "grp-books") {
        // Books: Only paneFile, hide mode tabs bar completely
        if (titleEl) titleEl.textContent = t("import_modal_books_title") || "Προσθήκη Βιβλίου / Αρχείου";
        if (modeTabsContainer) modeTabsContainer.hidden = true;
        if (tabFile) tabFile.hidden = false;
        if (tabUrl) tabUrl.hidden = true;
        if (tabPaste) tabPaste.hidden = true;
        setImportPane("paneFile");
        setTimeout(() => $("#pickFileBtn")?.focus(), 60);
      } else if (activeGrpId === "grp-articles") {
        // Articles: paneUrl & panePaste (paneUrl default)
        if (titleEl) titleEl.textContent = t("import_modal_articles_title") || "Προσθήκη Άρθρου / Κειμένου";
        if (modeTabsContainer) modeTabsContainer.hidden = false;
        if (tabFile) tabFile.hidden = true;
        if (tabUrl) tabUrl.hidden = false;
        if (tabPaste) tabPaste.hidden = false;
        setImportPane("paneUrl");
        setTimeout(() => $("#urlImportInput")?.focus(), 60);
      } else {
        // Custom group: all 3 tabs
        if (titleEl) titleEl.textContent = `${t("import_modal_group_title") || "Προσθήκη στην Ομάδα"} «${grpName}»`;
        if (modeTabsContainer) modeTabsContainer.hidden = false;
        if (tabFile) tabFile.hidden = false;
        if (tabUrl) tabUrl.hidden = false;
        if (tabPaste) tabPaste.hidden = false;
        setImportPane("paneFile");
        setTimeout(() => $("#pickFileBtn")?.focus(), 60);
      }

      modal.hidden = false;
    }
    window.openImportModal = openImportModal;

    function closeImportModal() {
      const modal = $("#importModal");
      if (modal) modal.hidden = true;
    }
    window.closeImportModal = closeImportModal;

    /* --- Fullscreen & Typography Layout Settle (Waits for Fonts + Frame Paint) --- */
    async function waitForActiveFontLoad() {
      if (!document.fonts) return;
      try {
        const sizePx = `${prefs.size}px`;
        const family = prefs.font === "ReaderUploaded" ? "ReaderUploaded" : `"${prefs.font}"`;
        await Promise.race([
          document.fonts.load(`${sizePx} ${family}`),
          new Promise((r) => setTimeout(r, 700))
        ]);
      } catch (_) { }
    }

    async function recalcAfterLayoutSettle() {
      if (!bookText || $("#readingView").hidden) return;
      if (prefs.mode === "scroll") {
        renderPages(false, true);
        buildOutline();
        return;
      }
      const wasSpeaking = ttsActive;
      const resumeFromOffset = activeTtsRange ? activeTtsRange.start : null;

      needsRepaginate = true;
      const shouldShowLoading = typeof LoadingOverlay !== "undefined";

      await waitForActiveFontLoad();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      // Layout-keyed cache check
      const cached = await PaginationCache.load(currentBookId);
      if (cached && cached.length > 0) {
        try {
          renderPages(false, true);
          if (wasSpeaking && resumeFromOffset !== null) {
            speakCurrentSpread(resumeFromOffset);
          }
        } catch (e) {
          console.warn("[PaginationCache hit render error]", e);
        }
        return;
      }

      // Cache miss: show loading overlay and calculate
      if (shouldShowLoading) {
        LoadingOverlay.show(t("loading_repaginating") || "Επανυπολογισμός σελίδων...", t("loading_repaginating_sub") || "Εφαρμογή νέας τυπογραφίας και διάταξης", null);
      }
      await new Promise((r) => requestAnimationFrame(r));

      try {
        renderPages(false, true);
        if (wasSpeaking && resumeFromOffset !== null) {
          speakCurrentSpread(resumeFromOffset);
        }
      } finally {
        if (shouldShowLoading) {
          LoadingOverlay.hide();
        }
      }
    }

    function toggleFullscreenZen() {
      // Deprecate fullscreen on mobile and tablet viewports
      const isMobileOrTablet = window.innerWidth <= 900 || window.matchMedia("(pointer: coarse)").matches;
      if (isMobileOrTablet) {
        return; // Simplified UI on mobile/tablet
      }
      const app = $("#app");
      const isCurrentlyZen = app.classList.contains("zen") || Boolean(document.fullscreenElement);

      if (!isCurrentlyZen) {
        app.classList.add("zen");
        $("#zenBtn").classList.add("active-zen");
        FireflyEngine.evaluate();
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {
            recalcAfterLayoutSettle();
          });
        } else {
          recalcAfterLayoutSettle();
        }
      } else {
        app.classList.remove("zen", "reveal-top", "reveal-dock");
        $("#zenBtn").classList.remove("active-zen");
        FireflyEngine.stop();
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {
            recalcAfterLayoutSettle();
          });
        } else {
          recalcAfterLayoutSettle();
        }
      }
    }

    document.addEventListener("fullscreenchange", () => {
      const inFs = Boolean(document.fullscreenElement);
      $("#app").classList.toggle("zen", inFs);
      $("#zenBtn").classList.toggle("active-zen", inFs);
      if (!inFs) $("#app").classList.remove("reveal-top", "reveal-dock");
      FireflyEngine.evaluate();
      recalcAfterLayoutSettle();
    });

    /* --- Proximity Detection (120px Radius) & Firefly Idle Reset --- */
    const PROXIMITY_RADIUS = 120;

    function distanceToRect(x, y, rect) {
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      return Math.hypot(dx, dy);
    }

    document.addEventListener("mousemove", (e) => {
      FireflyEngine.resetIdleTimer();

      const app = $("#app");
      if (!app.classList.contains("zen")) return;

      const drawerOpen = $("#drawer").classList.contains("open") || $("#notesDrawer").classList.contains("open") || $("#musicDrawer").classList.contains("open") || $("#pomodoroDrawer").classList.contains("open") || Boolean($("#statsDrawer")?.classList.contains("open"));
      const searchOpen = !$("#searchBar").hidden;

      const topRect = $("#topbar").getBoundingClientRect();
      const dockRect = $("#floatingDock").getBoundingClientRect();

      const nearTop = drawerOpen || distanceToRect(e.clientX, e.clientY, topRect) <= PROXIMITY_RADIUS;
      const nearDock = searchOpen || distanceToRect(e.clientX, e.clientY, dockRect) <= PROXIMITY_RADIUS;

      app.classList.toggle("reveal-top", nearTop);
      app.classList.toggle("reveal-dock", nearDock);
    }, { passive: true });

    ["mousedown", "wheel", "touchstart"].forEach((evt) => {
      document.addEventListener(evt, () => FireflyEngine.resetIdleTimer(), { passive: true });
    });

    /* --- Apply & Persist All Settings (Defer Heavy Pagination Until Drawer Closes) --- */
    /* isHexDark removed */

    function applyPrefs(recalculatePages = true) {
      const app = $("#app");
      app.dataset.theme = prefs.theme || "paper";
      app.style.removeProperty("color-scheme");
      app.style.removeProperty("--sheet");
      app.style.removeProperty("--bg");
      app.style.removeProperty("--ink");
      app.style.removeProperty("--glass");

      const sansFonts = ["Inter", "Atkinson Hyperlegible Next"];
      let fontStack;
      if (prefs.font && prefs.font.startsWith("UserFont_")) {
        fontStack = `"${prefs.font}", Georgia, serif`;
      } else if (sansFonts.includes(prefs.font)) {
        fontStack = `"${prefs.font}", -apple-system, BlinkMacSystemFont, sans-serif`;
      } else {
        fontStack = `"${prefs.font || "Literata"}", Georgia, serif`;
      }
      app.style.setProperty("--reader-font", fontStack);
      app.style.setProperty("--reader-size", `${prefs.size}px`);
      app.style.setProperty("--reader-lh", String(prefs.lineHeight));
      app.style.setProperty("--reader-align", prefs.align);

      document.querySelectorAll(".theme-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.val === prefs.theme);
      });
      if (typeof updateWelcomeImage === "function") {
        updateWelcomeImage(prefs.theme);
      }
      if ($("#fontSelect")) $("#fontSelect").value = prefs.font;
      $("#sizeRange").value = String(prefs.size);
      $("#sizeValue").textContent = `${prefs.size} px`;
      $("#lhRange").value = String(prefs.lineHeight);
      $("#lhValue").textContent = Number(prefs.lineHeight).toFixed(2);

      // Sync segmented control buttons for Alignment and Spread
      document.querySelectorAll(".align-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.val === prefs.align);
      });
      document.querySelectorAll(".spread-btn").forEach((btn) => {
        btn.classList.toggle("active", String(btn.dataset.val) === String(prefs.spread));
      });

      $("#modeSelect").value = prefs.mode;
      $("#keepAwakeChk").checked = Boolean(prefs.keepAwake);
      if ($("#bgPlaybackChk")) $("#bgPlaybackChk").checked = (prefs.backgroundPlayback !== false);

      $("#ttsRateRange").value = String(prefs.ttsRate);
      $("#ttsRateValue").textContent = `${Number(prefs.ttsRate).toFixed(2)}x`;
      $("#noiseTypeSelect").value = prefs.noiseType;
      $("#noiseVolRange").value = String(prefs.noiseVol);
        const noiseValSpan = $("#noiseVolValue");
        if (noiseValSpan) noiseValSpan.textContent = `${Math.round(prefs.noiseVol * 100)}%`;
      $("#workMinInput").value = String(prefs.workMin);
      $("#breakMinInput").value = String(prefs.breakMin);

      savePrefs();
      WakeLockManager.sync();
      FireflyEngine.evaluate();

      if (recalculatePages) {
        needsRepaginate = true;
        if (bookText && !$("#readingView").hidden) {
          recalcAfterLayoutSettle();
        }
      }
    }
    window.applyPrefs = applyPrefs;

    /* --- Text Selection, Highlights, Notes & Translation (Mobile & Desktop Collision-Free) --- */
    function isTouchOrSmallScreen() {
      return window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 820;
    }

    function hideSelectionMenu() {
      const menu = $("#selectionMenu");
      menu.hidden = true;
      menu.classList.remove("touch-docked");
      $("#selNoteBox").hidden = true;
      $("#translateCard").hidden = true;
      currentSelection = null;
      window.currentSelection = null;
    }

    function handleTextSelection(preserveOpenSubpanel = false) {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return;

      const selectedText = sel.toString().trim();
      if (!selectedText || selectedText.length < 1) return;

      const range = sel.getRangeAt(0);
      const containerNode = range.commonAncestorContainer;
      const el = containerNode.nodeType === 1 ? containerNode : containerNode.parentElement;
      const contentContainer = el ? el.closest(".page-content") : null;
      if (!contentContainer) return;

      let baseOffset = 0;
      if (prefs.mode === "paged") {
        if (contentContainer.id === "contentA" && pages[pageIndex]) baseOffset = pages[pageIndex].start;
        else if (contentContainer.id === "contentB" && pages[pageIndex + 1]) baseOffset = pages[pageIndex + 1].start;
      }

      const preRange = document.createRange();
      preRange.selectNodeContents(contentContainer);
      preRange.setEnd(range.startContainer, range.startOffset);
      const relStart = preRange.toString().length;
      const exactStart = baseOffset + relStart;
      const exactEnd = exactStart + sel.toString().length;

      currentSelection = { start: exactStart, end: exactEnd, text: selectedText };
      window.currentSelection = currentSelection;

      const menu = $("#selectionMenu");
      if (!preserveOpenSubpanel) {
        $("#selNoteBox").hidden = true;
        $("#translateCard").hidden = true;
      }
      menu.hidden = false;

      if (isTouchOrSmallScreen()) {
        menu.classList.add("touch-docked");
        menu.style.left = "";
        menu.style.top = "";
        $("#app").classList.add("reveal-dock");
      } else {
        menu.classList.remove("touch-docked");
        const rect = range.getBoundingClientRect();
        const menuW = menu.offsetWidth || 260;
        const left = Math.max(12, Math.min(window.innerWidth - menuW - 12, rect.left + rect.width / 2 - menuW / 2));
        const top = rect.top > 130 ? (rect.top - 56) : (rect.bottom + 12);
        menu.style.left = `${left}px`;
        menu.style.top = `${Math.max(64, Math.min(window.innerHeight - 190, top))}px`;
      }
    }

    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest("#readingView") || e.target.closest(".page-content") || e.target.closest("#selectionMenu")) {
        e.preventDefault();
      }
    });

    document.addEventListener("selectionchange", () => {
      if ($("#readingView").hidden) return;
      clearTimeout(selectionDebounceTimer);
      selectionDebounceTimer = setTimeout(() => {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.closest("#selectionMenu")) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          if ($("#selNoteBox").hidden && $("#translateCard").hidden) hideSelectionMenu();
        } else {
          handleTextSelection(true);
        }
      }, 180);
    });

    function addHighlight(color = "yellow", note = "") {
      const curSel = currentSelection || window.currentSelection;
      if (!curSel) return;
      const entry = {
        id: "hl-" + Date.now(),
        start: curSel.start,
        end: curSel.end,
        text: curSel.text,
        note: note.trim(),
        color: color,
        createdAt: Date.now()
      };
      highlights.push(entry);
      highlights.sort((a, b) => a.start - b.start);
      saveLibraryState();
      window.getSelection().removeAllRanges();
      hideSelectionMenu();
      renderPages(false, false);
      showToast(note.trim() ? (t("toast_note_saved") || "Αποθηκεύτηκε η σημείωση.") : (t("toast_highlight_saved") || "Αποθηκεύτηκε το highlight."));
    }

    function updateNotesBadge() {
      const badge = $("#notesCountBadge");
      badge.textContent = String(highlights.length);
      badge.hidden = highlights.length === 0;
      renderNotesDrawer();
    }

    function renderNotesDrawer() {
      const hls = (Array.isArray(window.highlights) && window.highlights.length) ? window.highlights : highlights;
      const container = $("#notesListContainer");
      if (!hls.length) {
        container.innerHTML = `<div style="text-align:center;color:var(--muted);padding:24px 0;font-size:13px">${t("notes_empty")}</div>`;
        return;
      }
      container.innerHTML = "";
      hls.forEach((hl) => {
        const card = document.createElement("div");
        card.className = "note-card";
        const pgNum = pages.length ? (findPageByOffset(hl.start) + 1) : 1;
        card.innerHTML = `
            <div class="note-quote" style="border-left-color:${hl.color === "green" ? "#66bb8a" : (hl.color === "blue" ? "#64a5eb" : "#f5c642")}">${escapeHtml(hl.text)}</div>
            ${hl.note ? `<div class="note-body">${escapeHtml(hl.note)}</div>` : ""}
            <div class="note-foot">
              <span>${t("lbl_page")} ~${pgNum}</span>
              <div style="display:flex;gap:6px">
                <button type="button" class="btn sm share-hl-btn" style="height:26px;padding:0 8px;font-size:11.5px;gap:3px">📸 ${t("btn_share_card")}</button>
                <button type="button" class="dock-btn del-hl-btn" style="height:26px;padding:0 8px;color:#e05252">${t("btn_delete")}</button>
              </div>

            </div>

          `;
        card.addEventListener("click", (e) => {
          if (e.target.closest(".del-hl-btn") || e.target.closest(".share-hl-btn")) return;
          charOffset = hl.start;
          closeAllDrawers();
          renderPages(true, false);
        });
        card.querySelector(".share-hl-btn")?.addEventListener("click", (e) => {
          e.stopPropagation();
          QuoteCardStudio.open(hl.text, hl.note, {
            title: bookTitle,
            page: pgNum
          });
        });
        card.querySelector(".del-hl-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          highlights = highlights.filter((item) => item.id !== hl.id);
          saveLibraryState();
          renderPages(false, false);
        });
        container.appendChild(card);
      });
    }
    window.renderNotesDrawer = renderNotesDrawer;

    /* --- Instant Selection Translation --- */
    async function translateSelection(forceTargetLang = null) {
      const curSel = currentSelection || window.currentSelection;
      if (!curSel) return;
      const text = curSel.text.slice(0, 800);
      const card = $("#translateCard");
      const out = $("#translateOutput");
      const label = $("#translateLangLabel");

      if (forceTargetLang) {
        translateTargetLang = forceTargetLang;
      } else {
        const hasGreek = /[α-ωΑ-ΩάέήίόύώΆΈΉΊΌΎΏ]/.test(text);
        translateTargetLang = hasGreek ? "en" : "el";
      }

      label.textContent = (t("lbl_translate_to") || "Μετάφραση σε {lang}").replace("{lang}", translateTargetLang.toUpperCase());
      out.textContent = t("lbl_translating") || "Μετάφραση...";
      card.hidden = false;

      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${translateTargetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const translated = Array.isArray(data[0]) ? data[0].map((part) => part[0]).join("") : "";
        out.textContent = translated || (t("lbl_no_translation") || "Δεν βρέθηκε μετάφραση.");
      } catch (_) {
        const webUrl = `https://translate.google.com/?sl=auto&tl=${translateTargetLang}&text=${encodeURIComponent(text)}&op=translate`;
        out.innerHTML = `${t("lbl_offline_translate") || "Offline μετάφραση μη διαθέσιμη"}. <a href="${webUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);font-weight:600">${t("lbl_open_google_translate") || "Άνοιγμα στο Google Translate"} ↗</a>`;
      }
    }

    /* --- Text-to-Speech (TTS with Live Highlight & Group Auto-Advance) --- */
    function populateTtsVoices() {
      if (!("speechSynthesis" in window)) return;
      const select = $("#ttsVoiceSelect");
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const sorted = [...voices].sort((a, b) => {
        const score = (v) => {
          let s = 0;
          if (/natural|online/i.test(v.name)) s += 10;
          if (/^el/i.test(v.lang)) s += 5;
          else if (/^en/i.test(v.lang)) s += 2;
          return s;
        };
        return score(b) - score(a);
      });

      select.innerHTML = `<option value="">${t("tts_voice_auto") || "Αυτόματη επιλογή (Edge Natural)"}</option>`;
      sorted.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v.voiceURI;
        opt.textContent = `${v.name} (${v.lang})`;
        select.appendChild(opt);
      });

      if (prefs.ttsVoice) select.value = prefs.ttsVoice;
    }

    if ("speechSynthesis" in window) {
      populateTtsVoices();
      window.speechSynthesis.onvoiceschanged = populateTtsVoices;
    }

    function pickBestVoice(sampleText) {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;
      if (prefs.ttsVoice) {
        const chosen = voices.find((v) => v.voiceURI === prefs.ttsVoice);
        if (chosen) return chosen;
      }
      const isGreek = /[α-ωΑ-ΩάέήίόύώΆΈΉΊΌΎΏ]/.test(sampleText);
      const langPrefix = isGreek ? "el" : "en";
      return (
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix) && /natural|online/i.test(v.name)) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
        voices.find((v) => /natural|online/i.test(v.name)) ||
        voices[0]
      );
    }

    function stopTts() {
      ttsActive = false;
      ttsQueue = [];
      const hadHighlight = Boolean(activeTtsRange);
      activeTtsRange = null;
      currentTtsUtterance = null;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (typeof BackgroundAudioManager !== "undefined") {
        BackgroundAudioManager.stopTtsWatchdog();
        BackgroundAudioManager.sync();
      }
      $("#ttsToggleBtn").classList.remove("speaking");
      $("#ttsBtnLabel").textContent = t("tts_btn_label") || "Εκφώνηση";
      if (hadHighlight && bookText && !$("#readingView").hidden) {
        renderPages(false, false);
      }
    }

    function buildTtsSentenceQueue(pageObjects) {
      const queue = [];
      for (const pObj of pageObjects) {
        if (!pObj || !pObj.text) continue;
        const regex = /[^.!?;·\n]+[.!?;·\n]*/g;
        let match;
        while ((match = regex.exec(pObj.text)) !== null) {
          const raw = match[0];
          const trimmed = raw.trim();
          if (!trimmed) continue;
          const spoken = trimmed.replace(/^#{1,3}\s+/, "").trim();
          if (!spoken) continue;
          const leadingOffset = raw.indexOf(trimmed);
          const absStart = pObj.start + match.index + (leadingOffset >= 0 ? leadingOffset : 0);
          const absEnd = absStart + trimmed.length;
          queue.push({ text: spoken, start: absStart, end: absEnd });
        }
      }
      return queue;
    }

    function advanceToNextItemInSameGroup() {
      const groupItems = getGroupItems(currentGroupId);
      const idxInGroup = groupItems.findIndex((b) => b.id === currentBookId);
      const grpObj = groups.find((g) => g.id === currentGroupId);

      if (idxInGroup >= 0 && idxInGroup + 1 < groupItems.length) {
        const nextItem = groupItems[idxInGroup + 1];
        const inheritedAudio = (!audioPlayer.paused && trackIdx >= 0 && audioTracks[trackIdx])
          ? { trackId: audioTracks[trackIdx].id, trackName: audioTracks[trackIdx].name, volume: audioPlayer.volume, autoPlay: true }
          : (nextItem.audio || bookAudio);
        const inheritedNoise = ambientActive
          ? { active: true, type: prefs.noiseType, volume: Number(prefs.noiseVol) || 0.28 }
          : (nextItem.noise || bookNoise);

        openBook(
          nextItem.title,
          nextItem.text,
          0,
          nextItem.bookmarkOffset || 0,
          nextItem.id,
          nextItem.highlights || [],
          inheritedAudio,
          inheritedNoise,
          nextItem.groupId,
          nextItem.kind || "Άρθρο",
          true,
          nextItem.toc || []
        );
        showToast((t("toast_next_in_group") || "Επόμενο στην ομάδα: {title}").replace("{title}", nextItem.title));
        setTimeout(() => speakCurrentSpread(0), 280);
      } else {
        if (typeof closeImportModal === "function") closeImportModal();
        stopTts();
        showToast(t("toast_group_finished") || "Ολοκληρώθηκαν όλα τα άρθρα της ομάδας!");
      }
    }

    function speakCurrentSpread(startAtOffset = null) {
      if (!("speechSynthesis" in window)) {
        showToast(t("toast_tts_unsupported") || "Ο browser δεν υποστηρίζει φωνητική ανάγνωση.");
        return;
      }
      window.speechSynthesis.cancel();

      const targetPages = prefs.mode === "scroll"
        ? [{ text: bookText, start: 0, end: bookText.length }]
        : [pages[pageIndex], pagesPerView() === 2 ? pages[pageIndex + 1] : null].filter(Boolean);

      ttsQueue = buildTtsSentenceQueue(targetPages);
      if (!ttsQueue.length) {
        if (typeof closeImportModal === "function") closeImportModal();
        stopTts();
        return;
      }

      ttsQueueIdx = 0;
      if (startAtOffset !== null) {
        const found = ttsQueue.findIndex((item) => item.end > startAtOffset);
        if (found >= 0) ttsQueueIdx = found;
      }

      ttsActive = true;
      $("#ttsToggleBtn").classList.add("speaking");
      $("#ttsBtnLabel").textContent = t("pomo_pause") || "Παύση";
      if (typeof BackgroundAudioManager !== "undefined") {
        BackgroundAudioManager.startTtsWatchdog();
        BackgroundAudioManager.sync();
      }

      const speakNextSentence = () => {
        if (!ttsActive) return;
        if (ttsQueueIdx >= ttsQueue.length) {
          const step = pagesPerView();
          if (prefs.mode === "paged" && pageIndex + step < pages.length) {
            charOffset = pages[pageIndex + step].start;
            activeTtsRange = null;
            renderPages(true, false);
            setTimeout(() => speakCurrentSpread(), 220);
          } else {
            advanceToNextItemInSameGroup();
          }
          return;
        }

        const item = ttsQueue[ttsQueueIdx++];
        activeTtsRange = { start: item.start, end: item.end };
        charOffset = item.start;
        renderPages(false, false);

        const utter = new SpeechSynthesisUtterance(item.text);
        currentTtsUtterance = utter;
        const voice = pickBestVoice(item.text);
        if (voice) {
          utter.voice = voice;
          utter.lang = voice.lang;
        }
        utter.rate = Number(prefs.ttsRate) || 1.0;
        utter.onend = () => {
          currentTtsUtterance = null;
          speakNextSentence();
        };
        utter.onerror = (e) => {
          currentTtsUtterance = null;
          if (e.error !== "interrupted" && e.error !== "canceled") stopTts();
        };
        window.speechSynthesis.speak(utter);
      };

      speakNextSentence();
    }

    function toggleTts() {
      if (ttsActive) stopTts();
      else speakCurrentSpread();
    }

    /* --- Search Logic --- */
    function runSearch() {
      const q = $("#searchInput").value.trim();
      searchQuery = q;
      searchMatches = [];
      activeMatchIdx = -1;

      if (!q || !bookText) {
        $("#searchStats").textContent = "";
        renderPages(false, false);
        return;
      }

      const lowerText = bookText.toLocaleLowerCase();
      const lowerQ = q.toLocaleLowerCase();
      let pos = 0;
      while ((pos = lowerText.indexOf(lowerQ, pos)) !== -1) {
        searchMatches.push(pos);
        pos += lowerQ.length;
      }

      if (!searchMatches.length) {
        $("#searchStats").textContent = t("search_no_results") || "0 αποτελέσματα";
        renderPages(false, false);
        return;
      }
      jumpToMatch(0);
    }

    function jumpToMatch(idx) {
      if (!searchMatches.length) return;
      activeMatchIdx = (idx + searchMatches.length) % searchMatches.length;
      charOffset = searchMatches[activeMatchIdx];
      $("#searchStats").textContent = `${activeMatchIdx + 1} / ${searchMatches.length}`;
      renderPages(true, false);
    }

    /* --- File Handling (EPUB, PDF, Markdown, TXT) --- */
    function loadDocumentFile(file) {
      if (!file) return;
      if (/\.epub$/i.test(file.name) || file.type === "application/epub+zip") {
        loadEpubFile(file);
        return;
      }
      if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
        loadPdfFile(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const isMd = /\.(md|markdown)$/i.test(file.name) || file.type === "text/markdown";
        const parsed = parseMarkdownAndToc(String(reader.result || ""));
        const firstLine = parsed.text.split("\n")[0];
        const title = (firstLine && firstLine.length < 90) ? firstLine : file.name.replace(/\.(txt|md|markdown)$/i, "");
        const existing = library.find((b) => b.title === title);
        const selectedGrp = $("#targetGroupSelect").value || groups[0].id;
        openBook(
          title,
          parsed.text,
          existing ? existing.charOffset : 0,
          existing ? existing.bookmarkOffset : 0,
          existing ? existing.id : null,
          existing ? existing.highlights : [],
          existing ? existing.audio : null,
          existing ? existing.noise : null,
          existing ? existing.groupId : selectedGrp,
          isMd ? "Markdown" : "TXT",
          false,
          parsed.toc
        );
      };
      reader.onerror = () => showToast(t("toast_file_error") || "Σφάλμα ανάγνωσης αρχείου.");
      reader.readAsText(file, "UTF-8");
    }

    /* --- Pomodoro --- */
    function playChime() {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(528, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      } catch (_) { }
    }

    function updatePomoUI() {
      const m = String(Math.floor(pomoRemaining / 60)).padStart(2, "0");
      const s = String(pomoRemaining % 60).padStart(2, "0");
      const formatted = `${m}:${s}`;
      $("#pomoDisplay").textContent = formatted;
      $("#headerTimerPill").textContent = formatted;
      $("#headerTimerPill").hidden = !pomoRunning;
      const breakClock = $("#breakClockDisplay");
      if (breakClock) breakClock.textContent = formatted;
      $("#pomoLabel").textContent = pomoIsBreak ? (t("pomo_break_label") || "Χρόνος διαλείμματος") : (t("pomo_work_label") || "Χρόνος συγκέντρωσης");
      $("#pomoStartBtn").textContent = pomoRunning ? (t("pomo_pause") || "Παύση") : (t("pomo_start") || "Έναρξη");
    }

    function triggerBreakScreensaver() {
      pomoIsBreak = true;
      const mins = Number(prefs.breakMin) || 5;
      pomoRemaining = Math.max(1, mins) * 60;
      if (!pomoRunning) {
        pomoRunning = true;
        pomoTimer = setInterval(tickPomo, 1000);
      }
      $("#pomodoroBreakOverlay").hidden = false;
      HourglassScreensaver.start();
      updatePomoUI();
      showToast(t("toast_break_time"));
    }

    function endBreakScreensaver() {
      HourglassScreensaver.stop();
      $("#pomodoroBreakOverlay").hidden = true;
      pomoIsBreak = false;
      const mins = Number(prefs.workMin) || 25;
      pomoRemaining = Math.max(1, mins) * 60;
      playChime();
      updatePomoUI();
      showToast(t("toast_focus_time"));
    }

    function tickPomo() {
      if (pomoRemaining > 0) pomoRemaining--;
      if (pomoRemaining <= 0) {
        pomoIsBreak = !pomoIsBreak;
        playChime();
        if (pomoIsBreak) {
          const mins = Number(prefs.breakMin) || 5;
          pomoRemaining = Math.max(1, mins) * 60;
          $("#pomodoroBreakOverlay").hidden = false;
          HourglassScreensaver.start();
          showToast(t("toast_break_time"));
        } else {
          const mins = Number(prefs.workMin) || 25;
          pomoRemaining = Math.max(1, mins) * 60;
          HourglassScreensaver.stop();
          $("#pomodoroBreakOverlay").hidden = true;
          showToast(t("toast_focus_time"));
        }
      }
      updatePomoUI();
    }

    /* --- Drawers Control (Triggers Deferred Pagination Upon Closing Settings) --- */
    function closeAllDrawers() {
      const wasSettingsOpen = $("#drawer").classList.contains("open");
      $("#drawer").classList.remove("open");
      $("#notesDrawer").classList.remove("open");
      $("#musicDrawer").classList.remove("open");
      $("#pomodoroDrawer").classList.remove("open");
      const statsDrawer = $("#statsDrawer");
      if (statsDrawer) statsDrawer.classList.remove("open");
      $("#drawerBackdrop").classList.remove("open");
      const langDropdown = $("#langDropdown");
      if (langDropdown) langDropdown.hidden = true;


    }

    function toggleSettingsDrawer(open = true) {
      if (!open) { closeAllDrawers(); return; }
      closeAllDrawers();
      $("#app").classList.add("reveal-top");
      $("#drawer").classList.add("open");
      $("#drawerBackdrop").classList.add("open");
    }

    function toggleNotesDrawer(open = true) {
      if (!open) { closeAllDrawers(); return; }
      closeAllDrawers();
      $("#app").classList.add("reveal-top");
      renderNotesDrawer();
      $("#notesDrawer").classList.add("open");
      $("#drawerBackdrop").classList.add("open");
    }

    function toggleMusicDrawer(open = true) {
      if (!open) { closeAllDrawers(); return; }
      closeAllDrawers();
      $("#app").classList.add("reveal-top");
      $("#musicDrawer").classList.add("open");
      $("#drawerBackdrop").classList.add("open");
    }

    function togglePomodoroDrawer(open = true) {
      if (!open) { closeAllDrawers(); return; }
      closeAllDrawers();
      $("#app").classList.add("reveal-top");
      $("#pomodoroDrawer").classList.add("open");
      $("#drawerBackdrop").classList.add("open");
    }

    function toggleStatsDrawer(open = true) {
      if (!open) { closeAllDrawers(); return; }
      closeAllDrawers();
      $("#app").classList.add("reveal-top");
      if (typeof ReadingStatsEngine !== "undefined" && ReadingStatsEngine.render) {
        ReadingStatsEngine.render();
      }
      $("#statsDrawer")?.classList.add("open");
      $("#drawerBackdrop").classList.add("open");
    }

    window.toggleSettingsDrawer = toggleSettingsDrawer;
    window.toggleNotesDrawer = toggleNotesDrawer;
    window.toggleMusicDrawer = toggleMusicDrawer;
    window.togglePomodoroDrawer = togglePomodoroDrawer;
    window.toggleStatsDrawer = toggleStatsDrawer;
    window.closeAllDrawers = closeAllDrawers;
    window.library = library;
    window.renderLibraryHub = renderLibraryHub;
    window.saveLibraryState = saveLibraryState;
    window.t = t;

    /* --- Event Bindings --- */
    $("#brandLogoBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAllDrawers();
      $("#aboutModal").hidden = false;
    });

/* #goHome navigation removed, use #libraryBtn */

    $("#libraryBtn")?.addEventListener("click", () => {
      const scrapersView = $("#scrapersHubView");
      const readingView = $("#readingView");
      if (scrapersView && !scrapersView.hidden) {
        setHubMode("library");
        setActiveView("library");
      } else if (readingView && !readingView.hidden) {
        setHubMode("library");
        setActiveView("library");
      } else {
        setActiveView("library");
        const libView = $("#libraryHubView");
        if (libView) libView.scrollTop = 0;
      }
    });

    // Contextual Import Modal Events
    $("#closeImportModalBtn")?.addEventListener("click", closeImportModal);
    $("#importModal")?.addEventListener("click", (e) => {
      if (e.target === $("#importModal")) closeImportModal();
    });
    /* showLibraryListBtn / goToImporterBtn retired for modal */
    $("#zenBtn")?.addEventListener("click", toggleFullscreenZen);
    $("#headerTimerPill")?.addEventListener("click", () => togglePomodoroDrawer(true));
    $("#pomodoroBtn")?.addEventListener("click", () => togglePomodoroDrawer(true));
    $("#closePomodoroDrawerBtn")?.addEventListener("click", closeAllDrawers);
    $("#musicBtn")?.addEventListener("click", () => toggleMusicDrawer(true));
    $("#closeMusicDrawerBtn")?.addEventListener("click", closeAllDrawers);
    $("#statsBtn")?.addEventListener("click", () => toggleStatsDrawer(true));
    $("#closeStatsDrawerBtn")?.addEventListener("click", closeAllDrawers);
    $("#resetStatsBtn")?.addEventListener("click", () => {
      if (typeof ReadingStatsEngine !== "undefined") ReadingStatsEngine.reset();
    });
    $("#settingsBtn")?.addEventListener("click", () => toggleSettingsDrawer(true));


    // Power feature drawer buttons
    $("#drawerStatsBtn")?.addEventListener("click", () => {
      closeAllDrawers();
      toggleStatsDrawer(true);
    });
    $("#drawerScrapersBtn")?.addEventListener("click", () => {
      closeAllDrawers();
      showScrapersView();
    });
    $("#closeDrawerBtn")?.addEventListener("click", closeAllDrawers);
    $("#settingsAboutBtn")?.addEventListener("click", () => {
      closeAllDrawers();
      $("#aboutModal").hidden = false;
    });
    $("#notesBtn")?.addEventListener("click", () => toggleNotesDrawer(true));
    $("#closeNotesDrawerBtn")?.addEventListener("click", closeAllDrawers);
    $("#drawerBackdrop")?.addEventListener("click", closeAllDrawers);

    // Screensaver Break events
    $("#skipBreakBtn")?.addEventListener("click", endBreakScreensaver);
    $("#pomoTriggerBreakBtn")?.addEventListener("click", () => {
      closeAllDrawers();
      triggerBreakScreensaver();
    });

    // --- Category 1: Global Error Handlers & User Feedback ---
    window.addEventListener("error", (event) => {
      console.error("[Global Error]:", event.error || event.message);
      if (event.message && !event.message.includes("ResizeObserver") && !event.message.includes("Script error")) {
        showToast(t("error_generic"));
      }
    });
    window.addEventListener("unhandledrejection", (event) => {
      console.error("[Unhandled Promise Rejection]:", event.reason);
      const reason = (event.reason && event.reason.message) ? event.reason.message : String(event.reason);
      if (!reason.includes("AbortError") && !reason.includes("ResizeObserver") && !reason.includes("canceled")) {
        showToast(t("error_generic"));
      }
    });

    // --- Category 1 & 3: Service Worker Registration & PWA Smart Install Prompt ---
    let deferredInstallPrompt = null;
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").then((reg) => {
          console.log("[SW] Registered successfully with scope:", reg.scope);
        }).catch((err) => {
          console.warn("[SW] Registration failed (ignored):", err);
        });
      });
    }

    // Track engagement visit count
    const visitCount = (parseInt(localStorage.getItem("reading-room-visit-count") || "0", 10) + 1);
    localStorage.setItem("reading-room-visit-count", String(visitCount));

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const installBtns = document.querySelectorAll(".pwa-install-btn");
      installBtns.forEach((btn) => btn.hidden = false);

      // Smart Frequency Capping: Show prompt only on 3rd or 10th visit, if not dismissed recently
      const dismissedTime = parseInt(localStorage.getItem("reading-room-pwa-dismissed") || "0", 10);
      const daysSinceDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if ((visitCount === 3 || visitCount === 10) && daysSinceDismiss > 7) {
        const banner = $("#pwaInstallBanner");
        if (banner) banner.hidden = false;
      }
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      const banner = $("#pwaInstallBanner");
      if (banner) banner.hidden = true;
      showToast(t("toast_pwa_installed"));
    });

    $("#pwaDismissBannerBtn")?.addEventListener("click", () => {
      $("#pwaInstallBanner").hidden = true;
      localStorage.setItem("reading-room-pwa-dismissed", String(Date.now()));
    });

    $("#pwaAcceptInstallBtn")?.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      $("#pwaInstallBanner").hidden = true;
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === "accepted") {
        showToast(t("toast_pwa_installed"));
      }
      deferredInstallPrompt = null;
    });

    $("#moreInstallBtn")?.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
      } else {
        showToast(t("pwa_install_title"));
      }
    });

    // --- Category 2: Responsive Overflow Menu Events ---
    const moreMenuBtn = $("#moreMenuBtn");
    const moreDropdown = $("#moreDropdown");
    if (moreMenuBtn && moreDropdown) {
      moreMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = moreDropdown.hidden;
        moreDropdown.hidden = !isHidden;
        moreMenuBtn.setAttribute("aria-expanded", String(isHidden));
      });
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".more-selector-wrap")) {
          moreDropdown.hidden = true;
          moreMenuBtn.setAttribute("aria-expanded", "false");
        }
      });
      $("#moreMusicBtn")?.addEventListener("click", () => {
        moreDropdown.hidden = true;
        moreMenuBtn.setAttribute("aria-expanded", "false");
        toggleMusicDrawer(true);
      });
      $("#morePomodoroBtn")?.addEventListener("click", () => {
        moreDropdown.hidden = true;
        moreMenuBtn.setAttribute("aria-expanded", "false");
        togglePomodoroDrawer(true);
      });
      $("#moreNotesBtn")?.addEventListener("click", () => {
        moreDropdown.hidden = true;
        moreMenuBtn.setAttribute("aria-expanded", "false");
        toggleNotesDrawer(true);
      });
      $("#moreScrapersBtn")?.addEventListener("click", () => {
        moreDropdown.hidden = true;
        moreMenuBtn.setAttribute("aria-expanded", "false");
        showScrapersView();
      });
      $("#moreAboutBtn")?.addEventListener("click", () => {
        moreDropdown.hidden = true;
        moreMenuBtn.setAttribute("aria-expanded", "false");
        $("#aboutModal").hidden = false;
      });
    }

    // --- Category 3: About Modal & Donations ---
    $("#closeAboutModalBtn")?.addEventListener("click", () => {
      $("#aboutModal").hidden = true;
    });
    $("#aboutModal")?.addEventListener("click", (e) => {
      if (e.target.id === "aboutModal") $("#aboutModal").hidden = true;
    });

    // Desktop Donation Pill Persistence & Close
    if (localStorage.getItem("reading-room-donation-dismissed") === "1") {
      const pill = $("#desktopDonationPill");
      if (pill) pill.hidden = true;
    }
    setTimeout(() => {
      if (document.querySelector(".about-donation-actions .bmc-btn, .about-donation-actions .bmc-btn-container")) {
        const fb = $("#bmcFallbackBtn");
        if (fb) fb.style.display = "none";
      }
    }, 400);
    $("#closeDonationPillBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const pill = $("#desktopDonationPill");
      if (pill) pill.hidden = true;
      localStorage.setItem("reading-room-donation-dismissed", "1");
      showToast(t("donate_thank_you"));
    });
    $("#donationPillTrigger")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const pill = $("#desktopDonationPill");
      if (pill) pill.classList.toggle("expanded");
    });
    $("#desktopDonationPill")?.addEventListener("click", (e) => {
      if (e.target.closest(".pill-tiers")) return;
      e.stopPropagation();
      const pill = $("#desktopDonationPill");
      if (pill) pill.classList.toggle("expanded");
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#desktopDonationPill")) {
        $("#desktopDonationPill")?.classList.remove("expanded");
      }
    });

    // Language Switcher events
    const langBtn = $("#langBtn");
    const langDropdown = $("#langDropdown");
    if (langBtn && langDropdown) {
      langBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        langDropdown.hidden = !langDropdown.hidden;
      });
      document.querySelectorAll(".lang-opt").forEach((opt) => {
        opt.addEventListener("click", () => {
          const chosen = opt.dataset.lang;
          applyLanguage(chosen);
          langDropdown.hidden = true;
          showToast(t("toast_lang_changed"));
        });
      });
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".lang-selector-wrap")) {
          langDropdown.hidden = true;
        }
      });
    }

    // Scrapers Export & Import JSON events
    $("#exportScrapersBtn")?.addEventListener("click", exportScraperRules);
    $("#importScrapersInput")?.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        importScraperRulesFromFile(e.target.files[0]);
        e.target.value = "";
      }
    });

    // Settings Export & Import JSON events
    $("#exportSettingsBtn")?.addEventListener("click", exportSettings);
    $("#importSettingsInput")?.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        importSettingsFromFile(e.target.files[0]);
        e.target.value = "";
      }
    });

    // Segmented Controls (Alignment & Spread)
    document.querySelectorAll(".align-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        prefs.align = btn.dataset.val;
        applyPrefs(true);
      });
    });
    document.querySelectorAll(".spread-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        prefs.spread = btn.dataset.val;
        applyPrefs(true);
      });
    });

    // Drag and Drop Zones for Fonts & Audio
    setupDropzone("#fontDropzone", "#fontFileInput", handleFontFiles);
    setupDropzone("#audioDropzone", "#audioFilesInput", addAudioFilesToPlaylist);

    // Compartmentalized 3-Mode Importer Tabs
    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.dataset.pane) {
          setImportPane(tab.dataset.pane);
        }
      });
    });

    // URL Importer & Live Rule Match Indicator
    $("#importUrlBtn")?.addEventListener("click", () => importArticleFromUrl(false));
    $("#saveUrlToGroupBtn")?.addEventListener("click", () => importArticleFromUrl(true));
    $("#urlImportInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") importArticleFromUrl(false);
    });
    $("#urlImportInput")?.addEventListener("input", () => {
      const hint = $("#urlRuleMatchHint");
      let val = $("#urlImportInput").value.trim();
      if (!val) { hint.hidden = true; return; }
      try {
        if (!/^https?:\/\//i.test(val)) val = "https://" + val;
        const u = new URL(val);
        const rule = findMatchingScraperRule(u);
        if (rule) {
          hint.textContent = (t("hint_rule_matched") || "✓ Εντοπίστηκε custom mapping για {domain}").replace("{domain}", rule.domain);
          hint.hidden = false;
        } else {
          hint.hidden = true;
        }
      } catch (_) {
        hint.hidden = true;
      }
    });

    // Custom Scraper Mapping Page Events
    $("#scrapersBtn")?.addEventListener("click", showScrapersView);
    $("#backFromScrapersBtn")?.addEventListener("click", showLibraryView);
    $("#clearScraperFormBtn")?.addEventListener("click", () => fillScraperForm(null));

    $("#saveScraperRuleBtn")?.addEventListener("click", () => {
      const rule = readScraperForm();
      if (!rule.domain || !rule.titleSelector || !rule.articleSelector) {
        return showToast(t("toast_rule_missing_fields") || "Συμπλήρωσε το Domain και τα απαραίτητα selectors.");
      }
      const existingIdx = scraperRules.findIndex(
        (r) => r.id === rule.id || normalizeDomainInput(r.domain) === rule.domain
      );
      if (existingIdx >= 0) {
        rule.id = scraperRules[existingIdx].id;
        scraperRules[existingIdx] = rule;
      } else {
        scraperRules.unshift(rule);
      }
      saveScraperRules();
      renderScraperRulesList();
      fillScraperForm(rule);
      showToast((t("toast_rule_saved") || "Αποθηκεύτηκε ο κανόνας για {domain}.").replace("{domain}", rule.domain));
    });

    $("#toggleRawHtmlUrlBtn")?.addEventListener("click", () => {
      const box = $("#rawHtmlUrlBox");
      box.hidden = !box.hidden;
      if (!box.hidden) $("#rawHtmlUrlInput").focus();
    });

    $("#toggleRuleHtmlTestBtn")?.addEventListener("click", () => {
      const box = $("#ruleRawHtmlBox");
      box.hidden = !box.hidden;
      if (!box.hidden) $("#ruleRawHtmlInput").focus();
    });

    $("#testScraperRuleBtn")?.addEventListener("click", async () => {
      const rule = readScraperForm();
      let testUrl = rule.sampleUrl;
      const pastedTestHtml = ($("#ruleRawHtmlInput") && !$("#ruleRawHtmlBox").hidden) ? $("#ruleRawHtmlInput").value.trim() : "";

      if (!testUrl && !pastedTestHtml) return showToast(t("toast_paste_url_first") || "Επικόλλησε πρώτα ένα URL.");
      if (testUrl && !/^https?:\/\//i.test(testUrl)) testUrl = "https://" + testUrl;

      let parsedUrl;
      try { parsedUrl = new URL(testUrl || ("https://" + (rule.domain || "example.com") + "/")); } catch (_) { return showToast(t("toast_invalid_url") || "Μη έγκυρη διεύθυνση URL."); }

      const btn = $("#testScraperRuleBtn");
      btn.disabled = true;
      btn.textContent = t("status_testing") || "Δοκιμή...";
      try {
        const rawHtml = pastedTestHtml || await fetchRawHtmlWithFallback(parsedUrl.href);
        const res = extractWithCustomRule(rawHtml, rule, parsedUrl);

        $("#previewTitleOut").textContent = res.title;
        const metaBadges = [];
        if (res.category) metaBadges.push(`<span class="meta-tag">${t("lbl_category") || "Κατηγορία"}: ${escapeHtml(res.category)}</span>`);
        metaBadges.push(`<span class="meta-tag">${t("lbl_author") || "Συγγραφέας"}: ${escapeHtml(res.author)}</span>`);
        if (res.datetime) metaBadges.push(`<span class="meta-tag">${t("lbl_datetime") || "Ημ/νία"}: ${escapeHtml(res.datetime)}</span>`);
        $("#previewMetaOut").innerHTML = metaBadges.join(" ");

        const headerPrefix = res.metaHeader ? `${res.title}\n${res.metaHeader}` : res.title;
        const bodyOnly = res.text.startsWith(headerPrefix)
          ? res.text.slice(headerPrefix.length).trim()
          : res.text;
        $("#previewBodyOut").textContent = bodyOnly.slice(0, 500) + (bodyOnly.length > 500 ? "..." : "");
        $("#scraperPreviewBox").hidden = false;
        showToast(t("toast_rule_test_ok") || "Επιτυχής εξαγωγή!");
      } catch (err) {
        $("#scraperPreviewBox").hidden = true;
        $("#ruleRawHtmlBox").hidden = false;
        showToast((err && err.message) || t("toast_rule_test_fail") || "Αποτυχία δοκιμής.");
      } finally {
        btn.disabled = false;
        btn.textContent = t("btn_test_rule") || "Δοκιμή";
      }
    });

    // Library Hub: Groups & Composer Controls
    $("#newGroupBtn")?.addEventListener("click", () => {
      const name = prompt(t("prompt_new_group") || "Όνομα νέας ομάδας:");
      if (!name || !name.trim()) return;
      const newGrp = { id: "grp-" + Date.now(), name: name.trim() };
      groups.push(newGrp);
      activeGroupFilter = newGrp.id;
      saveGroups();
      renderLibraryHub();
      showToast((t("toast_group_created") || "Δημιουργήθηκε η ομάδα «{name}».").replace("{name}", newGrp.name));
    });

    /* toggleComposerBtn retired */

    function extractComposerArticle() {
      const raw = $("#pasteInput").value;
      const parsed = parseMarkdownAndToc(raw);
      if (!parsed.text) return null;
      const customTitle = $("#pasteTitleInput").value.trim();
      const firstLine = parsed.text.split("\n")[0];
      const title = customTitle || ((firstLine && firstLine.length < 90) ? firstLine : (t("lbl_pasted_article") || "Επικολλημένο άρθρο"));
      const groupId = $("#targetGroupSelect").value || groups[0].id;
      return { title, text: parsed.text, toc: parsed.toc, groupId };
    }

    $("#saveToGroupBtn")?.addEventListener("click", () => {
      const item = extractComposerArticle();
      if (!item) return showToast(t("toast_paste_empty") || "Επικόλλησε πρώτα το κείμενο.");
      const words = (item.text || "").trim().split(/\s+/).filter(Boolean).length;
      const readMinutes = Math.max(1, Math.round(words / 200));
      const newEntry = {
        id: "book-" + Date.now(),
        groupId: item.groupId,
        order: getGroupItems(item.groupId).length,
        kind: "Άρθρο",
        title: item.title,
        wordCount: words,
        readMinutes: readMinutes,
        text: item.text,
        toc: item.toc,
        charOffset: 0,
        bookmarkOffset: 0,
        highlights: [],
        audio: null,
        noise: null,
        progress: 0,
        updatedAt: Date.now()
      };
      library.push(newEntry);
      saveLibraryState();
      $("#pasteInput").value = "";
      $("#pasteTitleInput").value = "";
      $("#wordCountHint").textContent = `0 ${t("lbl_words") || "λέξεις"}`;
      const grp = groups.find((g) => g.id === item.groupId);
      showToast((t("toast_saved_to_group") || "Αποθηκεύτηκε στην ομάδα «{name}».").replace("{name}", grp ? grp.name : ""));
      closeImportModal();
    });

    $("#openPasteBtn")?.addEventListener("click", () => {
      const item = extractComposerArticle();
      if (!item) return showToast(t("toast_no_text_found") || "Δεν βρέθηκε κείμενο.");
      $("#pasteInput").value = "";
      $("#pasteTitleInput").value = "";
      $("#wordCountHint").textContent = `0 ${t("lbl_words") || "λέξεις"}`;
      openBook(item.title, item.text, 0, 0, null, [], null, null, item.groupId, "Άρθρο", false, item.toc);
    });

    // Export Notes as Markdown
    $("#exportNotesBtn")?.addEventListener("click", () => {
      if (!highlights.length) return showToast(t("toast_no_notes_export") || "Δεν υπάρχουν σημειώσεις για εξαγωγή.");
      const mdLines = [`# ${t("md_notes_heading") || "Σημειώσεις"}: ${bookTitle}\n`];
      highlights.forEach((hl, idx) => {
        mdLines.push(`### ${idx + 1}. ${t("md_quote_heading") || "Απόσπασμα"}`);
        mdLines.push(`> ${hl.text}\n`);
        if (hl.note) mdLines.push(`**${t("lbl_note") || "Σημείωση"}:** ${hl.note}\n`);
      });
      const blob = new Blob([mdLines.join("\n")], { type: "text/markdown;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${bookTitle.replace(/[^a-zA-Z0-9α-ωΑ-Ω _-]/g, "").trim() || "notes"}-notes.md`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // Selection Events
    document.addEventListener("mouseup", (e) => {
      if (e.target.closest("#selectionMenu")) return;
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) hideSelectionMenu();
        else handleTextSelection(false);
      }, 10);
    });

    document.addEventListener("touchend", (e) => {
      if (e.target.closest("#selectionMenu")) return;
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) handleTextSelection(false);
      }, 60);
    });

    $("#selectionMenu")?.addEventListener("mousedown", (e) => {
      if (!e.target.closest("input, textarea")) {
        e.preventDefault();
      }
    });

    $("#selectionMenu")?.addEventListener("click", (e) => {
      const dot = e.target.closest(".color-dot");
      if (dot) addHighlight(dot.dataset.hl, "");
    });

    $("#selNoteToggleBtn")?.addEventListener("click", () => {
      $("#translateCard").hidden = true;
      $("#selNoteBox").hidden = !$("#selNoteBox").hidden;
      if (!$("#selNoteBox").hidden) $("#selNoteInput").focus();
    });

    $("#selNoteSaveBtn")?.addEventListener("click", () => addHighlight("yellow", $("#selNoteInput").value));
    $("#selNoteInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addHighlight("yellow", $("#selNoteInput").value);
    });

    $("#selTranslateBtn")?.addEventListener("click", () => {
      $("#selNoteBox").hidden = true;
      translateSelection();
    });

    $("#selCopyBtn")?.addEventListener("click", async () => {
      const curSel = currentSelection || window.currentSelection;
      if (!curSel) return;
      try {
        await navigator.clipboard.writeText(curSel.text);
        showToast(t("toast_copied") || "Αντιγράφηκε στο πρόχειρο.");
      } catch (_) {
        document.execCommand("copy");
        showToast(t("toast_copied") || "Αντιγράφηκε.");
      }
      window.getSelection().removeAllRanges();
      hideSelectionMenu();
    });

    $("#selShareCardBtn")?.addEventListener("click", () => {
      const curSel = currentSelection || window.currentSelection;
      if (!curSel || !curSel.text) return;
      const textToShare = curSel.text;
      const noteText = ($("#selNoteInput") && !$("#selNoteBox").hidden) ? $("#selNoteInput").value.trim() : "";
      const pgNum = (pages && pages.length && typeof findPageByOffset === "function")
        ? (findPageByOffset(curSel.start) + 1)
        : (pageIndex + 1);
      hideSelectionMenu();
      if (window.getSelection()) {
        window.getSelection().removeAllRanges();
      }
      if (typeof QuoteCardStudio !== "undefined" && typeof QuoteCardStudio.open === "function") {
        QuoteCardStudio.open(textToShare, noteText, {
          title: bookTitle || window.bookTitle || "",
          page: pgNum
        });
      }
    });

    $("#toggleTargetLangBtn")?.addEventListener("click", () => {
      translateSelection(translateTargetLang === "el" ? "en" : "el");
    });

    // File Input & Pick File
    $("#pickFileBtn")?.addEventListener("click", () => $("#textFileInput").click());
    $("#textFileInput")?.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type.startsWith("audio/") || /\.(mp3|m4a|wav|ogg)$/i.test(file.name)) {
          addAudioFilesToPlaylist([file]);
          toggleMusicDrawer(true);
          showToast(t("toast_audio_added") || "Το αρχείο ήχου προστέθηκε στη μουσική!");
        } else {
          loadDocumentFile(file);
        }
        e.target.value = "";
      }
    });

    $("#pasteInput")?.addEventListener("input", (e) => {
      const words = e.target.value.trim().split(/\s+/).filter(Boolean).length;
      const hintEl = $("#wordCountHint");
      if (hintEl) hintEl.textContent = `${words} ${t("lbl_words") || "λέξεις"}`;
    });

    // Drag & Drop
    window.addEventListener("dragover", (e) => { e.preventDefault(); $("#dropZone")?.classList.add("dragover"); });
    window.addEventListener("dragleave", () => $("#dropZone")?.classList.remove("dragover"));
    window.addEventListener("drop", (e) => {
      e.preventDefault();
      $("#dropZone")?.classList.remove("dragover");
      const files = Array.from(e.dataTransfer?.files || []);
      const doc = files.find((f) => /\.(epub|pdf|txt|md|markdown)$/i.test(f.name) || f.type === "application/pdf" || f.type === "application/epub+zip" || f.type.startsWith("text/"));
      const audio = files.filter((f) => f.type.startsWith("audio/") || /\.(mp3|m4a|aac|wav|ogg|opus|flac)$/i.test(f.name));
      if (doc) loadDocumentFile(doc);
      if (audio.length) {
        addAudioFilesToPlaylist(audio);
        toggleMusicDrawer(true);
      }
    });

    // Page Navigation
    function movePage(dir) {
      if (!pages.length || prefs.mode !== "paged") return;
      const step = pagesPerView();
      const nextIdx = Math.max(0, Math.min(pages.length - 1, pageIndex + dir * step));
      if (nextIdx === pageIndex) return;
      const wasSpeaking = ttsActive;
      if (wasSpeaking) stopTts();
      hideSelectionMenu();
      charOffset = pages[nextIdx].start;
      renderPages(true, false);
      if (wasSpeaking) speakCurrentSpread();
    }
    window.movePage = movePage;



    $("#bookStage")?.addEventListener("wheel", (e) => {
      if (prefs.mode !== "paged") return;
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock < 240) return;
      if (Math.abs(e.deltaY) > 12 || Math.abs(e.deltaX) > 12) {
        wheelLock = now;
        const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        movePage(delta > 0 ? 1 : -1);
      }
    }, { passive: false });

    $("#bookStage")?.addEventListener("click", (e) => {
      if (prefs.mode !== "paged") return;
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) return;
      const rect = $("#bookStage").getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      if (relX < 0.22) {
        movePage(-1);
      } else if (relX > 0.78) {
        movePage(1);
      } else if ($("#app").classList.contains("zen")) {
        const app = $("#app");
        const show = !app.classList.contains("reveal-top");
        app.classList.toggle("reveal-top", show);
        app.classList.toggle("reveal-dock", show);
      }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    $("#bookStage")?.addEventListener("touchstart", (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }
    }, { passive: true });
    $("#bookStage")?.addEventListener("touchend", (e) => {
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) return;
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        movePage(dx < 0 ? 1 : -1);
      }
    }, { passive: true });

    // Bookmark & TOC
    $("#saveBookmarkBtn")?.addEventListener("click", () => {
      bookmarkOffset = charOffset;
      saveLibraryState();
      showToast(t("toast_bookmark_saved") || "Αποθηκεύτηκε σελιδοδείκτης.");
    });

    $("#gotoBookmarkBtn")?.addEventListener("click", () => {
      if (!bookText) return;
      charOffset = bookmarkOffset;
      renderPages(true, false);
      showToast(t("toast_bookmark_jump") || "Μετάβαση στον σελιδοδείκτη.");
    });

    $("#tocSelect")?.addEventListener("change", (e) => {
      if (e.target.value === "") return;
      charOffset = Number(e.target.value) || 0;
      renderPages(true, false);
    });

    // TTS Controls
    $("#ttsToggleBtn")?.addEventListener("click", toggleTts);
    $("#drawerTtsPlayBtn")?.addEventListener("click", toggleTts);
    $("#drawerTtsStopBtn")?.addEventListener("click", stopTts);
    $("#ttsVoiceSelect")?.addEventListener("change", (e) => {
      prefs.ttsVoice = e.target.value;
      savePrefs();
      if (ttsActive) speakCurrentSpread(activeTtsRange ? activeTtsRange.start : null);
    });
    $("#ttsRateRange")?.addEventListener("input", (e) => {
      prefs.ttsRate = Number(e.target.value);
      $("#ttsRateValue").textContent = `${prefs.ttsRate.toFixed(2)}x`;
      savePrefs();
      if (ttsActive) speakCurrentSpread(activeTtsRange ? activeTtsRange.start : null);
    });

    // Search Bar Toggle
    $("#searchToggleBtn")?.addEventListener("click", () => {
      const bar = $("#searchBar");
      bar.hidden = !bar.hidden;
      if (!bar.hidden) {
        const menu = $("#selectionMenu");
        if (menu) menu.hidden = true;
        $("#app").classList.add("reveal-dock");
        $("#searchInput").focus();
      } else {
        searchQuery = "";
        renderPages(false, false);
      }
    });
    $("#closeSearchBtn")?.addEventListener("click", () => {
      $("#searchBar").hidden = true;
      searchQuery = "";
      renderPages(false, false);
    });

    $("#searchInput")?.addEventListener("input", runSearch);
    $("#searchInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") jumpToMatch(e.shiftKey ? activeMatchIdx - 1 : activeMatchIdx + 1);
    });
    $("#prevMatchBtn")?.addEventListener("click", () => jumpToMatch(activeMatchIdx - 1));
    $("#nextMatchBtn")?.addEventListener("click", () => jumpToMatch(activeMatchIdx + 1));

    // Preferences Controls
    $("#themeChips")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".theme-chip");
      if (!btn) return;
      prefs.theme = btn.dataset.val;
      applyPrefs(false);
    });
    let debounceSettingsTimer = null;
    function scheduleDebouncedRecalc() {
      if (debounceSettingsTimer) clearTimeout(debounceSettingsTimer);
      debounceSettingsTimer = setTimeout(() => {
        debounceSettingsTimer = null;
        savePrefs();
        if (bookText && !$("#readingView").hidden) {
          recalcAfterLayoutSettle();
        }
      }, 220);
    }

    $("#fontSelect")?.addEventListener("change", (e) => {
      prefs.font = e.target.value;
      applyPrefs(true);
      renderUploadedFontsUI();
    });
    $("#sizeRange")?.addEventListener("input", (e) => {
      prefs.size = Number(e.target.value);
      const app = $("#app");
      if (app) app.style.setProperty("--reader-size", `${prefs.size}px`);
      const valSpan = $("#sizeValue");
      if (valSpan) valSpan.textContent = `${prefs.size} px`;
      scheduleDebouncedRecalc();
    });
    $("#sizeRange")?.addEventListener("change", () => {
      if (debounceSettingsTimer) { clearTimeout(debounceSettingsTimer); debounceSettingsTimer = null; }
      savePrefs();
      if (bookText && !$("#readingView").hidden) recalcAfterLayoutSettle();
    });
    $("#lhRange")?.addEventListener("input", (e) => {
      prefs.lineHeight = Number(e.target.value);
      const app = $("#app");
      if (app) app.style.setProperty("--reader-lh", String(prefs.lineHeight));
      const valSpan = $("#lhValue");
      if (valSpan) valSpan.textContent = Number(prefs.lineHeight).toFixed(2);
      scheduleDebouncedRecalc();
    });
    $("#lhRange")?.addEventListener("change", () => {
      if (debounceSettingsTimer) { clearTimeout(debounceSettingsTimer); debounceSettingsTimer = null; }
      savePrefs();
      if (bookText && !$("#readingView").hidden) recalcAfterLayoutSettle();
    });
    $("#modeSelect")?.addEventListener("change", (e) => {
      prefs.mode = e.target.value;
      applyPrefs(true);
    });
    $("#keepAwakeChk")?.addEventListener("change", (e) => {
      prefs.keepAwake = e.target.checked;
      savePrefs();
      WakeLockManager.sync();
      showToast(prefs.keepAwake ? (t("toast_keepawake_on") || "Η οθόνη θα παραμένει ανοιχτή κατά την ανάγνωση.") : (t("toast_keepawake_off") || "Απενεργοποιήθηκε η διατήρηση ενεργής οθόνης."));
    });
    $("#bgPlaybackChk")?.addEventListener("change", (e) => {
      prefs.backgroundPlayback = e.target.checked;
      savePrefs();
      BackgroundAudioManager.sync();
      showToast(prefs.backgroundPlayback ? (t("toast_bgplayback_on") || "Η αναπαραγωγή θα συνεχίζεται στο παρασκήνιο.") : (t("toast_bgplayback_off") || "Η αναπαραγωγή θα σταματάει όταν κλείνει η οθόνη."));
    });

    // Audio Playlist & Per-Book Ambient Noise Events
    $("#audioFilesInput")?.addEventListener("change", (e) => {
      addAudioFilesToPlaylist(e.target.files);
      e.target.value = "";
    });
    // Winamp-style mini player event listeners
    $("#playPauseTrackBtn")?.addEventListener("click", () => {
      if (!audioPlayer.paused) {
        audioPlayer.pause();
      } else {
        if (!audioTracks.length) return;
        if (trackIdx < 0) {
          playTrack(0, true);
        } else if (audioPlayer.src) {
          audioPlayer.play().catch(() => {});
        } else {
          playTrack(trackIdx, true);
        }
      }
      updateMiniPlayerControls();
    });

    $("#stopTrackBtn")?.addEventListener("click", () => {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      updateMiniPlayerUI();
      updateMiniPlayerControls();
      renderPlaylistUI();
      syncBookAudioRecord(false);
    });

    $("#prevTrackBtn")?.addEventListener("click", () => {
      if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
      } else if (prefs.audioShuffle && audioTracks.length > 1) {
        let randIdx = Math.floor(Math.random() * audioTracks.length);
        if (randIdx === trackIdx) randIdx = (trackIdx + 1) % audioTracks.length;
        playTrack(randIdx, true);
      } else {
        playTrack(trackIdx - 1, true);
      }
    });

    $("#nextTrackBtn")?.addEventListener("click", () => {
      if (prefs.audioShuffle && audioTracks.length > 1) {
        let randIdx = Math.floor(Math.random() * audioTracks.length);
        if (randIdx === trackIdx) randIdx = (trackIdx + 1) % audioTracks.length;
        playTrack(randIdx, true);
      } else {
        playTrack(trackIdx + 1, true);
      }
    });

    $("#shuffleTrackBtn")?.addEventListener("click", () => {
      prefs.audioShuffle = !prefs.audioShuffle;
      savePrefs();
      updateMiniPlayerControls();
      showToast(prefs.audioShuffle ? (t("player_shuffle") || "Τυχαία σειρά") : (t("player_loop_none") || "Κανονική σειρά"));
    });

    $("#loopModeBtn")?.addEventListener("click", () => {
      const modes = ["none", "all", "one"];
      const cur = prefs.audioLoopMode || "none";
      const next = modes[(modes.indexOf(cur) + 1) % modes.length];
      prefs.audioLoopMode = next;
      audioPlayer.loop = (next === "one");
      savePrefs();
      updateMiniPlayerControls();
      let msg = t("player_loop_none") || "Χωρίς επανάληψη";
      if (next === "all") msg = t("player_loop_all") || "Επανάληψη όλων";
      else if (next === "one") msg = t("player_loop_one") || "Επανάληψη τρέχοντος";
      showToast(msg);
    });

    $("#audioSeekRange")?.addEventListener("input", (e) => {
      isSeekingAudio = true;
      const dur = audioPlayer.duration || 0;
      const cur = (parseFloat(e.target.value) / 100) * dur;
      const timeEl = $("#miniPlayerTime");
      if (timeEl) timeEl.textContent = `${formatAudioTime(cur)} / ${formatAudioTime(dur)}`;
    });

    $("#audioSeekRange")?.addEventListener("change", (e) => {
      const dur = audioPlayer.duration || 0;
      if (dur > 0) {
        audioPlayer.currentTime = (parseFloat(e.target.value) / 100) * dur;
      }
      isSeekingAudio = false;
      updateMiniPlayerUI();
    });

    audioPlayer.addEventListener("timeupdate", () => {
      if (!isSeekingAudio) {
        const cur = audioPlayer.currentTime || 0;
        const dur = audioPlayer.duration || 0;
        const timeEl = $("#miniPlayerTime");
        if (timeEl) timeEl.textContent = `${formatAudioTime(cur)} / ${formatAudioTime(dur)}`;
        const seekRange = $("#audioSeekRange");
        if (seekRange && dur > 0) {
          seekRange.value = String((cur / dur) * 100);
        }
      }
    });

    /* audioPlayer play/pause consolidated */

    audioPlayer.addEventListener("ended", () => {
      if (prefs.audioLoopMode === "one") {
        audioPlayer.currentTime = 0;
        audioPlayer.play().catch(() => {});
      } else if (prefs.audioShuffle && audioTracks.length > 1) {
        let randIdx = Math.floor(Math.random() * audioTracks.length);
        if (randIdx === trackIdx) randIdx = (trackIdx + 1) % audioTracks.length;
        playTrack(randIdx, true);
      } else if (prefs.audioLoopMode === "all") {
        playTrack((trackIdx + 1) % audioTracks.length, true);
      } else {
        if (trackIdx + 1 < audioTracks.length) {
          playTrack(trackIdx + 1, true);
        } else {
          audioPlayer.currentTime = 0;
          updateMiniPlayerUI();
          updateMiniPlayerControls();
          renderPlaylistUI();
        }
      }
      if (typeof BackgroundAudioManager !== "undefined") BackgroundAudioManager.sync();
    });

    // Dedicated Mobile Music Volume Control
    $("#musicVolRange")?.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      if (audioPlayer.muted && v > 0) audioPlayer.muted = false;
      audioPlayer.volume = v;
      if (v > 0) lastNonZeroAudioVol = v;
      prefs.audioVol = v;
      savePrefs();
      updateMusicVolUI(v, audioPlayer.muted);
    });

    $("#musicMuteBtn")?.addEventListener("click", () => {
      if (audioPlayer.muted || audioPlayer.volume === 0) {
        audioPlayer.muted = false;
        if (audioPlayer.volume === 0) {
          audioPlayer.volume = lastNonZeroAudioVol || 0.85;
        }
      } else {
        audioPlayer.muted = true;
      }
      updateMusicVolUI(audioPlayer.volume, audioPlayer.muted);
    });

    $("#noiseToggleBtn")?.addEventListener("click", () => {
      if (ambientActive) stopNoise(true);
      else startNoise(true);
    });
    $("#noiseTypeSelect")?.addEventListener("change", (e) => {
      prefs.noiseType = e.target.value;
      savePrefs();
      if (ambientActive) startNoise(true);
      else syncBookNoiseRecord(false);
    });
    $("#noiseVolRange")?.addEventListener("input", (e) => {
      prefs.noiseVol = Number(e.target.value);
      savePrefs();
      if (ambientMasterGain) ambientMasterGain.gain.value = prefs.noiseVol;
      const valSpan = $("#noiseVolValue");
      if (valSpan) valSpan.textContent = `${Math.round(prefs.noiseVol * 100)}%`;
      syncBookNoiseRecord();
    });

    // Pomodoro Events
    $("#pomoStartBtn")?.addEventListener("click", () => {
      if (pomoRunning) { clearInterval(pomoTimer); pomoRunning = false; }
      else { pomoRunning = true; pomoTimer = setInterval(tickPomo, 1000); }
      updatePomoUI();
    });
    $("#pomoResetBtn")?.addEventListener("click", () => {
      clearInterval(pomoTimer);
      pomoRunning = false;
      pomoIsBreak = false;
      pomoRemaining = (Number(prefs.workMin) || 25) * 60;
      updatePomoUI();
    });
    $("#workMinInput")?.addEventListener("change", (e) => {
      prefs.workMin = Math.max(1, Number(e.target.value) || 25);
      savePrefs();
      if (!pomoRunning && !pomoIsBreak) {
        pomoRemaining = prefs.workMin * 60;
        updatePomoUI();
      }
    });
    $("#breakMinInput")?.addEventListener("change", (e) => {
      prefs.breakMin = Math.max(1, Number(e.target.value) || 5);
      savePrefs();
    });

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      // Welcome Overlay handling: block shortcuts and allow Enter / Space / Escape to enter
      const welcomeOverlay = $("#welcomeOverlay");
      if (welcomeOverlay && !welcomeOverlay.hidden) {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          if (typeof closeWelcomeOverlay === "function") closeWelcomeOverlay();
        } else {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      if (e.key === "Escape") {
        const importModal = $("#importModal");
        if (importModal && !importModal.hidden) {
          e.preventDefault();
          e.stopPropagation();
          closeImportModal();
          return;
        }

        const scrapersView = $("#scrapersHubView");
        const anyDrawerOpen = $("#drawer")?.classList.contains("open") ||
          $("#notesDrawer")?.classList.contains("open") ||
          $("#statsDrawer")?.classList.contains("open") ||
          $("#pomodoroDrawer")?.classList.contains("open") ||
          $("#musicDrawer")?.classList.contains("open") ||
          !$("#aboutModal")?.hidden ||
          !$("#quoteCardModal")?.hidden ||
          !$("#statsCardModal")?.hidden;

        closeAllDrawers();
        hideSelectionMenu();
        $("#searchBar").hidden = true;
        if ($("#app").classList.contains("zen") || document.fullscreenElement) {
          toggleFullscreenZen();
        }

        // UX bonus: If in scrapersHubView, not inside input/textarea, and no drawer/modal was open, return to Library
        if (scrapersView && !scrapersView.hidden && !anyDrawerOpen && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
          setHubMode("library");
          setActiveView("library");
        }
        return;
      }
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if ($("#readingView").hidden) return;

      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); movePage(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); movePage(-1); }
      else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreenZen();
      } else if (e.key === "/") {
        e.preventDefault();
        $("#app").classList.add("reveal-dock");
        $("#searchBar").hidden = false;
        $("#searchInput").focus();
      }
    });

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        recalcAfterLayoutSettle();
      }, 120);
    }, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        recalcAfterLayoutSettle();
      });
    }

    /* =========================================================================
       READING STATS & HABIT TRACKER ENGINE (GitHub-style Heatmap & Daily Tracker)
       ========================================================================= */
    const ReadingStatsEngine = {
      STORAGE_KEY: "diavasma_reading_stats_v1",
      data: null,
      pendingSeconds: 0,
      lastInteraction: Date.now(),

      init() {
        this.load();
        this.setupTicker();
        this.setupUserActivityListeners();
      },

      load() {
        try {
          const raw = localStorage.getItem(this.STORAGE_KEY);
          if (raw) {
            this.data = JSON.parse(raw);
          }
        } catch (_) { }

        // Reset if uninitialized or if contains previous v1 seeded fake data
        if (!this.data || typeof this.data !== "object" || this.data.version !== 2) {
          this.data = {
            version: 2,
            daily: {},
            bestStreak: 0
          };
          this.save();
        }
        if (!this.data.daily) this.data.daily = {};
      },

      reset() {
        const msg = t("confirm_clear_stats") || "Θέλετε να μηδενίσετε όλα τα στατιστικά ανάγνωσης;";
        if (!confirm(msg)) return;
        this.data = {
          version: 2,
          daily: {},
          bestStreak: 0
        };
        this.pendingSeconds = 0;
        this.save();
        this.render();
        showToast(t("toast_stats_reset") || "Όλα τα στατιστικά ανάγνωσης μηδενίστηκαν.");
      },

      save() {
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (_) { }
      },

      formatDateKey(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      },

      getTodayKey() {
        return this.formatDateKey(new Date());
      },

      addSeconds(sec) {
        if (sec <= 0) return;
        const todayKey = this.getTodayKey();
        this.data.daily[todayKey] = (this.data.daily[todayKey] || 0) + sec;
        this.save();
      },

      flushPending() {
        if (this.pendingSeconds > 0) {
          this.addSeconds(this.pendingSeconds);
          this.pendingSeconds = 0;
          this.render();
        }
      },

      setupTicker() {
        setInterval(() => {
          const inReadingView = !$("#readingView").hidden;
          const isDocumentVisible = !document.hidden;
          const isUserActive = (Date.now() - this.lastInteraction) < 150000;

          if (inReadingView && isDocumentVisible && isUserActive) {
            this.pendingSeconds++;
            if (this.pendingSeconds >= 10) {
              this.flushPending();
            }
          }
        }, 1000);

        document.addEventListener("visibilitychange", () => {
          if (document.hidden) this.flushPending();
        });
        window.addEventListener("beforeunload", () => {
          this.flushPending();
        });
      },

      setupUserActivityListeners() {
        const markActive = () => { this.lastInteraction = Date.now(); };
        ["mousemove", "mousedown", "keydown", "touchstart", "scroll"].forEach((evt) => {
          window.addEventListener(evt, markActive, { passive: true });
        });
      },

      calculateStreaks() {
        const daily = this.data.daily || {};
        let currentStreak = 0;
        let bestStreak = this.data.bestStreak || 0;

        const today = new Date();
        const todayKey = this.formatDateKey(today);
        const hasToday = (daily[todayKey] || 0) >= 60;

        let checkDate = new Date(today);
        if (!hasToday) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
          const key = this.formatDateKey(checkDate);
          if ((daily[key] || 0) >= 60) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        const sortedKeys = Object.keys(daily).filter((k) => (daily[k] || 0) >= 60).sort();
        let tempStreak = 0;
        let prevDate = null;
        for (const k of sortedKeys) {
          const [y, m, d] = k.split("-").map(Number);
          const curDate = new Date(y, m - 1, d);
          if (prevDate) {
            const diffDays = Math.round((curDate - prevDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              tempStreak++;
            } else if (diffDays > 1) {
              tempStreak = 1;
            }
          } else {
            tempStreak = 1;
          }
          if (tempStreak > bestStreak) bestStreak = tempStreak;
          prevDate = curDate;
        }
        if (currentStreak > bestStreak) bestStreak = currentStreak;

        this.data.bestStreak = bestStreak;
        return { currentStreak, bestStreak };
      },

      render() {
        const streakEl = $("#statStreak");
        if (!streakEl) return;

        const { currentStreak, bestStreak } = this.calculateStreaks();
        $("#statStreak").textContent = currentStreak;
        $("#statBestStreak").textContent = bestStreak;

        const todayKey = this.getTodayKey();
        const todaySec = (this.data.daily[todayKey] || 0) + this.pendingSeconds;
        const todayMins = Math.round(todaySec / 60);
        if (todayMins >= 60) {
          const hrs = (todayMins / 60).toFixed(1);
          $("#statToday").textContent = `${hrs}h`;
        } else {
          $("#statToday").textContent = `${todayMins}m`;
        }

        let totalSec = Object.values(this.data.daily || {}).reduce((a, b) => a + (Number(b) || 0), 0) + this.pendingSeconds;
        const totalHours = (totalSec / 3600).toFixed(1);
        $("#statTotal").textContent = `${totalHours}h`;

        const completedCount = (library || []).filter((item) => (Number(item.progress) || 0) >= 99).length;
        $("#statCompleted").textContent = completedCount;

        this.renderHeatmap();
      },

      renderHeatmap() {
        const container = $("#heatmapContainer");
        if (!container) return;

        container.innerHTML = "";
        const grid = document.createElement("div");
        grid.className = "heatmap-grid";

        const today = new Date();
        const dayOfWeek = (today.getDay() + 6) % 7;
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

        const totalDays = 18 * 7;
        const startDate = new Date(endOfWeek);
        startDate.setDate(endOfWeek.getDate() - totalDays + 1);

        const cur = new Date(startDate);
        for (let i = 0; i < totalDays; i++) {
          const dateKey = this.formatDateKey(cur);
          const isFuture = cur > today;
          const sec = isFuture ? 0 : (this.data.daily[dateKey] || 0);
          const mins = Math.round(sec / 60);

          let lvl = 0;
          if (!isFuture && mins > 0) {
            if (mins >= 60) lvl = 4;
            else if (mins >= 30) lvl = 3;
            else if (mins >= 15) lvl = 2;
            else lvl = 1;
          }

          const cell = document.createElement("div");
          cell.className = `heatmap-cell lvl-${lvl}` + (dateKey === this.getTodayKey() ? " today" : "");

          const localeMap = { el: "el-GR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", ru: "ru-RU", zh: "zh-CN", ja: "ja-JP", hi: "hi-IN", pt: "pt-PT" };
          const dateFormatted = cur.toLocaleDateString(localeMap[prefs.lang] || "en-US", {
            month: "short",
            day: "numeric",
            weekday: "short"
          });
          const minutesLabel = t("mins_short") || "m";
          const tooltipText = isFuture
            ? `${dateFormatted}`
            : (mins > 0 ? `${dateFormatted}: ${mins} ${minutesLabel}` : `${dateFormatted}: 0 ${minutesLabel}`);
          cell.setAttribute("title", tooltipText);

          grid.appendChild(cell);
          cur.setDate(cur.getDate() + 1);
        }

        container.appendChild(grid);
        requestAnimationFrame(() => {
          container.scrollLeft = container.scrollWidth;
        });
      }
    };

    /* =========================================================================
       QUOTE & NOTE CARD SHARE STUDIO (Pure Canvas 2D Generation)
       ========================================================================= */
    const QuoteCardStudio = {
      theme: "paper",
      aspect: "adaptive",
      currentQuote: "",
      currentNote: "",
      currentMeta: {},
      isInitialized: false,

      themes: {
        paper: {
          bg: "#EDE9DF",
          cardBg: "#FAF7F0",
          border: "#E2DCCE",
          text: "#24201B",
          quoteIcon: "#8C5A32",
          noteBg: "#F2EDE3",
          noteBorder: "#8C5A32",
          noteText: "#4A453E",
          metaText: "#6E665B",
          brandText: "#8C5A32"
        },
        warm: {
          bg: "#E5D4BC",
          cardBg: "#F5EAD8",
          border: "#DFC9B0",
          text: "#36291E",
          quoteIcon: "#9E582B",
          noteBg: "#EBDCC6",
          noteBorder: "#9E582B",
          noteText: "#524538",
          metaText: "#75604E",
          brandText: "#9E582B"
        },
        sage: {
          bg: "#DCE4DA",
          cardBg: "#EBF0E9",
          border: "#CCD8CA",
          text: "#1F2B22",
          quoteIcon: "#3C6E47",
          noteBg: "#DEE7DC",
          noteBorder: "#3C6E47",
          noteText: "#38473B",
          metaText: "#58695C",
          brandText: "#3C6E47"
        },
        slate: {
          bg: "#1B1E24",
          cardBg: "#23272F",
          border: "#343A46",
          text: "#E2E6ED",
          quoteIcon: "#7AA2F7",
          noteBg: "#2C323C",
          noteBorder: "#7AA2F7",
          noteText: "#C5CDD9",
          metaText: "#9AA3B2",
          brandText: "#7AA2F7"
        },
        night: {
          bg: "#121312",
          cardBg: "#1B1C1A",
          border: "#2A2C29",
          text: "#E8E3D9",
          quoteIcon: "#D4A373",
          noteBg: "#252724",
          noteBorder: "#D4A373",
          noteText: "#CFC9BE",
          metaText: "#A19C92",
          brandText: "#D4A373"
        },
        amoled: {
          bg: "#000000",
          cardBg: "#0B0B0C",
          border: "#222225",
          text: "#DCD8D0",
          quoteIcon: "#E0B17E",
          noteBg: "#161618",
          noteBorder: "#E0B17E",
          noteText: "#C8C4BC",
          metaText: "#8E8A82",
          brandText: "#E0B17E"
        }
      },

      init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        const themeContainer = $("#quoteThemeChips");
        if (themeContainer) {
          themeContainer.addEventListener("click", (e) => {
            const chip = e.target.closest(".theme-chip");
            if (!chip) return;
            themeContainer.querySelectorAll(".theme-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            this.theme = chip.dataset.qtheme || "paper";
            this.draw();
          });
        }

        $("#quoteTextInput")?.addEventListener("input", (e) => {
          this.currentQuote = e.target.value;
          this.draw();
        });
        $("#quoteNoteInput")?.addEventListener("input", (e) => {
          this.currentNote = e.target.value;
          this.draw();
        });
        $("#quoteIncMetaChk")?.addEventListener("change", () => this.draw());
        $("#quoteIncWatermarkChk")?.addEventListener("change", () => this.draw());

        $("#closeQuoteModalBtn")?.addEventListener("click", () => this.close());
        $("#quoteCardModal")?.addEventListener("click", (e) => {
          if (e.target.id === "quoteCardModal") this.close();
        });

        $("#downloadQuoteBtn")?.addEventListener("click", () => this.downloadImage());
        $("#shareQuoteBtn")?.addEventListener("click", () => this.shareImage());
      },

      open(quoteText, noteText = "", meta = {}) {
        this.init();
        this.currentQuote = (quoteText || "").trim();
        this.currentNote = (noteText || "").trim();
        this.currentMeta = meta || {};

        const quoteInput = $("#quoteTextInput");
        if (quoteInput) quoteInput.value = this.currentQuote;
        const noteInput = $("#quoteNoteInput");
        if (noteInput) noteInput.value = this.currentNote;

        const modal = $("#quoteCardModal");
        if (modal) {
          modal.hidden = false;
          document.body.style.overflow = "hidden";
        }
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => this.draw());
        }
        this.draw();
      },

      close() {
        const modal = $("#quoteCardModal");
        if (modal) {
          modal.hidden = true;
          document.body.style.overflow = "";
        }
      },

      draw() {
        const canvas = $("#quoteCardCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const width = 1080;
        const margin = 56;
        const cardX = margin;
        const cardW = width - margin * 2; // 968px
        const maxTextW = cardW - 88;      // 880px

        const th = (this.themes[this.theme] || (this.theme === "dark" ? this.themes.night : null) || this.themes.paper);
        const incMeta = $("#quoteIncMetaChk") ? $("#quoteIncMetaChk").checked : true;
        const incWatermark = $("#quoteIncWatermarkChk") ? $("#quoteIncWatermarkChk").checked : true;

        // Typography inheritance from user reading preferences (prefs)
        const activeFont = (typeof prefs !== "undefined" && prefs.font) ? prefs.font : "Literata";
        const sansFonts = ["Inter", "Atkinson Hyperlegible Next"];
        let fontStack;
        if (activeFont.startsWith("UserFont_")) {
          fontStack = `"${activeFont}", Georgia, serif`;
        } else if (sansFonts.includes(activeFont)) {
          fontStack = `"${activeFont}", -apple-system, BlinkMacSystemFont, sans-serif`;
        } else {
          fontStack = `"${activeFont}", Georgia, serif`;
        }

        const activeAlign = (typeof prefs !== "undefined" && prefs.align) ? prefs.align : "left";
        const userSize = (typeof prefs !== "undefined" && prefs.size) ? Number(prefs.size) : 20;
        const userLh = (typeof prefs !== "undefined" && prefs.lineHeight) ? Number(prefs.lineHeight) : 1.5;

        // 1. Calculate Header metrics (outside bubble)
        let headerH = 0;
        const watermarkH = 24;
        let titleH = 0;
        let titleLines = [];
        const titleLineH = 48;

        const rawTitle = (this.currentMeta.title || bookTitle || window.bookTitle || "").trim() || "Diavasma Reader";
        if (incMeta && rawTitle) {
          ctx.font = `700 36px ${fontStack}`;
          titleLines = this.wrapText(ctx, rawTitle, cardW);
          if (titleLines.length > 3) {
            titleLines = titleLines.slice(0, 3);
            let last = titleLines[2];
            while (ctx.measureText(last + "...").width > cardW && last.length > 4) {
              last = last.slice(0, -2);
            }
            titleLines[2] = last.trim() + "...";
          }
          titleH = titleLines.length * titleLineH + 18; // lines + gap + accent bar
        }

        if (incWatermark && incMeta && rawTitle) {
          headerH = watermarkH + 16 + titleH;
        } else if (incWatermark) {
          headerH = watermarkH;
        } else if (incMeta && rawTitle) {
          headerH = titleH;
        }

        const hasHeader = headerH > 0;
        const topMargin = 52;
        const headerToBubbleGap = hasHeader ? 32 : 0;
        const cardY = topMargin + headerH + headerToBubbleGap;

        // 2. Pre-calculate Quote & Note metrics inside bubble
        const quoteText = (this.currentQuote || "").trim() || t("quote_default_text");
        let baseFontSize = 38;
        if (quoteText.length > 280) baseFontSize = 28;
        else if (quoteText.length > 180) baseFontSize = 32;
        else if (quoteText.length < 80) baseFontSize = 44;

        const scaleRatio = userSize / 20;
        const quoteFontSize = Math.min(62, Math.max(28, Math.round(baseFontSize * scaleRatio)));
        const quoteLineHeight = Math.round(quoteFontSize * userLh);

        ctx.font = `italic 500 ${quoteFontSize}px ${fontStack}`;
        const quoteLineObjs = this.layoutParagraphs(ctx, quoteText, maxTextW);
        const quoteH = quoteLineObjs.length * quoteLineHeight;

        const noteText = (this.currentNote || "").trim();
        let noteBoxH = 0;
        let noteFontSize = 0;
        let noteLineHeight = 0;
        let noteLineObjs = [];
        if (noteText) {
          noteFontSize = Math.min(28, Math.max(20, Math.round(quoteFontSize * 0.68)));
          noteLineHeight = Math.round(noteFontSize * Math.max(1.35, userLh * 0.95));
          ctx.font = `400 ${noteFontSize}px ${fontStack}`;
          noteLineObjs = this.layoutParagraphs(ctx, noteText, maxTextW - 54);
          noteBoxH = noteLineObjs.length * noteLineHeight + 46;
        }

        const topPadInsideBubble = 110;
        const noteGap = noteText ? 28 : 0;
        const bubbleBottomPad = 52;
        const neededCardH = topPadInsideBubble + quoteH + noteGap + noteBoxH + bubbleBottomPad;

        // 3. Exclusively Dynamic Adaptive Height
        const cardH = Math.max(260, Math.round(neededCardH));
        const height = cardY + cardH + 56; // 56px bottom margin below bubble

        canvas.width = width;
        canvas.height = height;

        // 4. Background Fill
        ctx.fillStyle = th.bg;
        ctx.fillRect(0, 0, width, height);

        // 5. Draw Header (Outside Bubble)
        if (hasHeader) {
          let headerCurY = topMargin;

          // Watermark (Δ DIAVASMA)
          if (incWatermark) {
            ctx.font = '700 16px "Playfair Display", "Literata", serif';
            ctx.fillStyle = th.brandText;
            ctx.textBaseline = "top";
            ctx.textAlign = "left";
            ctx.fillText("Δ  D I A V A S M A", cardX, headerCurY);
            headerCurY += watermarkH;
            if (incMeta && rawTitle) headerCurY += 16;
          }

          // Emphatic Title
          if (incMeta && rawTitle) {
            ctx.font = `700 36px ${fontStack}`;
            ctx.fillStyle = th.text;
            ctx.textBaseline = "top";
            ctx.textAlign = "left";
            for (let i = 0; i < titleLines.length; i++) {
              ctx.fillText(titleLines[i], cardX, headerCurY);
              headerCurY += titleLineH;
            }

            // Accent Bar below title
            headerCurY += 4;
            ctx.fillStyle = th.quoteIcon;
            this.roundRect(ctx, cardX, headerCurY, 56, 4, 2);
            ctx.fill();
          }
        }

        // 6. Draw Text Bubble (Card Container)
        const cornerR = 24;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = th.cardBg;
        this.roundRect(ctx, cardX, cardY, cardW, cardH, cornerR);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = th.border;
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, cardX, cardY, cardW, cardH, cornerR);
        ctx.stroke();

        // 7. Decorative Quote Mark
        ctx.fillStyle = th.quoteIcon;
        ctx.font = 'bold 84px "Georgia", "Times New Roman", serif';
        ctx.textBaseline = "top";
        if (activeAlign === "center") {
          ctx.textAlign = "center";
          ctx.fillText("“", cardX + cardW / 2, cardY + 36);
        } else if (activeAlign === "right") {
          ctx.textAlign = "right";
          ctx.fillText("“", cardX + cardW - 44, cardY + 36);
        } else {
          ctx.textAlign = "left";
          ctx.fillText("“", cardX + 44, cardY + 36);
        }
        ctx.textAlign = "left";

        // 8. Quote Text inside Bubble
        ctx.font = `italic 500 ${quoteFontSize}px ${fontStack}`;
        ctx.fillStyle = th.text;
        const quoteY = cardY + 110;

        let currentY = quoteY;
        for (let i = 0; i < quoteLineObjs.length; i++) {
          this.renderAlignedLine(ctx, quoteLineObjs[i], cardX + 44, currentY, maxTextW, activeAlign);
          currentY += quoteLineHeight;
        }

        // 9. Note Box inside Bubble
        if (noteText) {
          currentY += 28;
          ctx.fillStyle = th.noteBg;
          this.roundRect(ctx, cardX + 44, currentY, maxTextW, noteBoxH, 14);
          ctx.fill();

          ctx.fillStyle = th.noteBorder;
          this.roundRect(ctx, cardX + 44, currentY, 6, noteBoxH, 3);
          ctx.fill();

          ctx.fillStyle = th.quoteIcon;
          ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(`💭 ${t("card_note_label") || "ΣΗΜΕΙΩΣΗ"}`, cardX + 64, currentY + 16);

          ctx.fillStyle = th.noteText;
          ctx.font = `400 ${noteFontSize}px ${fontStack}`;
          let ny = currentY + 38;
          for (let i = 0; i < noteLineObjs.length; i++) {
            this.renderAlignedLine(ctx, noteLineObjs[i], cardX + 64, ny, maxTextW - 54, activeAlign);
            ny += noteLineHeight;
          }
        }
      },

      layoutParagraphs(ctx, text, maxWidth) {
        const lines = [];
        const paragraphs = String(text || "").split("\n");
        for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
          const p = paragraphs[pIdx].trim();
          if (!p) continue;
          const words = p.split(/\s+/).filter(Boolean);
          if (words.length === 0) continue;

          let currentWords = [words[0]];
          for (let i = 1; i < words.length; i++) {
            const candidate = currentWords.concat(words[i]).join(" ");
            if (ctx.measureText(candidate).width <= maxWidth) {
              currentWords.push(words[i]);
            } else {
              lines.push({
                text: currentWords.join(" "),
                words: currentWords,
                isLastLine: false
              });
              currentWords = [words[i]];
            }
          }
          if (currentWords.length > 0) {
            lines.push({
              text: currentWords.join(" "),
              words: currentWords,
              isLastLine: true
            });
          }
        }
        return lines;
      },

      renderAlignedLine(ctx, lineObj, textLeft, y, maxWidth, align) {
        ctx.textBaseline = "top";
        if (align === "center") {
          ctx.textAlign = "center";
          ctx.fillText(lineObj.text, textLeft + maxWidth / 2, y);
        } else if (align === "right") {
          ctx.textAlign = "right";
          ctx.fillText(lineObj.text, textLeft + maxWidth, y);
        } else if (align === "justify") {
          ctx.textAlign = "left";
          if (lineObj.isLastLine || lineObj.words.length <= 1) {
            ctx.fillText(lineObj.text, textLeft, y);
          } else {
            const totalWordsWidth = lineObj.words.reduce((sum, w) => sum + ctx.measureText(w).width, 0);
            const spaceWidth = ctx.measureText(" ").width;
            const gaps = lineObj.words.length - 1;
            const extraSpace = maxWidth - totalWordsWidth;
            const gap = extraSpace / gaps;

            // Fallback to normal spacing if word gap is abnormally large
            if (gap > spaceWidth * 4 || gap < spaceWidth * 0.5) {
              ctx.fillText(lineObj.text, textLeft, y);
            } else {
              let curX = textLeft;
              for (let i = 0; i < lineObj.words.length; i++) {
                ctx.fillText(lineObj.words[i], curX, y);
                curX += ctx.measureText(lineObj.words[i]).width + gap;
              }
            }
          }
        } else {
          ctx.textAlign = "left";
          ctx.fillText(lineObj.text, textLeft, y);
        }
        ctx.textAlign = "left";
      },

      wrapText(ctx, text, maxWidth) {
        const lines = [];
        const paragraphs = text.split("\n");
        for (const p of paragraphs) {
          const words = p.split(/\s+/).filter(Boolean);
          let currentLine = "";
          for (let n = 0; n < words.length; n++) {
            const testLine = currentLine ? (currentLine + " " + words[n]) : words[n];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              lines.push(currentLine);
              currentLine = words[n];
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);
        }
        return lines;
      },

      roundRect(ctx, x, y, width, height, radius) {
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(x, y, width, height, radius);
          return;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      },

      getBlob() {
        const canvas = $("#quoteCardCanvas");
        if (!canvas) return Promise.resolve(null);
        return new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
        });
      },

      async downloadImage() {
        const blob = await this.getBlob();
        if (!blob) return;
        const a = document.createElement("a");
        const safeTitle = (this.currentMeta.title || bookTitle || "quote")
          .slice(0, 30)
          .replace(/[^\w\d\u0370-\u03ff]+/g, "-")
          .toLowerCase();
        a.download = `diavasma-${safeTitle}-${Date.now()}.png`;
        a.href = URL.createObjectURL(blob);
        a.click();
        showToast(t("toast_download_success") || "Η κάρτα αποθηκεύτηκε επιτυχώς!");
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      },

      async shareImage() {
        const blob = await this.getBlob();
        if (!blob) return;
        const file = new File([blob], "diavasma-quote.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: this.currentMeta.title || bookTitle || "Diavasma Quote",
              text: this.currentQuote,
              files: [file]
            });
            showToast(t("toast_share_success") || "Επιτυχής κοινοποίηση!");
            return;
          } catch (err) {
            if (err.name === "AbortError") return;
          }
        }
        this.downloadImage();
      }
    };
    window.QuoteCardStudio = QuoteCardStudio;
    window.ReadingStatsEngine = ReadingStatsEngine;
    window.prefs = prefs;

    /* =========================================================================
       STATS SHARE CARD STUDIO (Canvas 2D Export for Social / Promotion)
       ========================================================================= */
    const StatsCardStudio = {
      theme: "paper",
      aspect: "square",
      customMessage: "Η συνήθεια της καθημερινής ανάγνωσης",
      isInitialized: false,

      themes: {
        paper: {
          bg: "#EDE9DF",
          cardBg: "#FAF7F0",
          border: "#E2DCCE",
          text: "#24201B",
          muted: "#6E665B",
          pillBg: "#F0EBE0",
          pillText: "#8C5A32",
          boxBg: "#F5F0E6",
          boxBorder: "#E6DFD2",
          cell0: "#EBE6DB",
          cell1: "#C8D9BE",
          cell2: "#8EB87B",
          cell3: "#569643",
          cell4: "#2E6B21",
          brandText: "#24201B"
        },
        warm: {
          bg: "#E5D4BC",
          cardBg: "#F5EAD8",
          border: "#DFC9B0",
          text: "#36291E",
          muted: "#75604E",
          pillBg: "#ECDCC5",
          pillText: "#9E582B",
          boxBg: "#EEDFC9",
          boxBorder: "#E2CFB4",
          cell0: "#EBDCC6",
          cell1: "#DEC29B",
          cell2: "#C99B64",
          cell3: "#B07238",
          cell4: "#8C4E20",
          brandText: "#36291E"
        },
        sage: {
          bg: "#DCE4DA",
          cardBg: "#EBF0E9",
          border: "#CCD8CA",
          text: "#1F2B22",
          muted: "#58695C",
          pillBg: "#DBE4D8",
          pillText: "#3C6E47",
          boxBg: "#E1E9DF",
          boxBorder: "#D0DCD0",
          cell0: "#D8E2D5",
          cell1: "#B8CFB4",
          cell2: "#82AA7B",
          cell3: "#4F8247",
          cell4: "#2E5728",
          brandText: "#1F2B22"
        },
        slate: {
          bg: "#1B1E24",
          cardBg: "#23272F",
          border: "#343A46",
          text: "#E2E6ED",
          muted: "#9AA3B2",
          pillBg: "#2E3440",
          pillText: "#7AA2F7",
          boxBg: "#282D37",
          boxBorder: "#383E4C",
          cell0: "#2C323C",
          cell1: "#344A70",
          cell2: "#3D6AA3",
          cell3: "#4F8CD9",
          cell4: "#7AA2F7",
          brandText: "#E2E6ED"
        },
        night: {
          bg: "#121312",
          cardBg: "#1B1C1A",
          border: "#2A2C29",
          text: "#E8E3D9",
          muted: "#A19C92",
          pillBg: "#262724",
          pillText: "#D4A373",
          boxBg: "#222320",
          boxBorder: "#30322D",
          cell0: "#242522",
          cell1: "#483C2E",
          cell2: "#755C41",
          cell3: "#AD8358",
          cell4: "#D4A373",
          brandText: "#E8E3D9"
        },
        amoled: {
          bg: "#000000",
          cardBg: "#0B0B0C",
          border: "#222225",
          text: "#DCD8D0",
          muted: "#8E8A82",
          pillBg: "#161618",
          pillText: "#E0B17E",
          boxBg: "#121213",
          boxBorder: "#202022",
          cell0: "#17171A",
          cell1: "#3D3324",
          cell2: "#6B5335",
          cell3: "#A87D4D",
          cell4: "#E0B17E",
          brandText: "#DCD8D0"
        }
      },

      init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Wire drawer button
        $("#shareStatsCardBtn")?.addEventListener("click", () => {
          this.open();
        });

        // Theme chips
        const themeContainer = $("#statsThemeChips");
        if (themeContainer) {
          themeContainer.addEventListener("click", (e) => {
            const chip = e.target.closest(".theme-chip");
            if (!chip) return;
            themeContainer.querySelectorAll(".theme-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            this.theme = chip.dataset.stheme || "paper";
            this.draw();
          });
        }

        // Aspect ratio buttons
        const sqBtn = $("#statsAspectSquare");
        const stBtn = $("#statsAspectStory");
        if (sqBtn && stBtn) {
          sqBtn.addEventListener("click", () => {
            sqBtn.classList.add("active");
            stBtn.classList.remove("active");
            this.aspect = "square";
            this.draw();
          });
          stBtn.addEventListener("click", () => {
            stBtn.classList.add("active");
            sqBtn.classList.remove("active");
            this.aspect = "story";
            this.draw();
          });
        }

        // Custom message input
        $("#statsCustomMsgInput")?.addEventListener("input", (e) => {
          this.customMessage = e.target.value;
          this.draw();
        });

        // Modal close
        $("#closeStatsModalBtn")?.addEventListener("click", () => this.close());
        $("#statsCardModal")?.addEventListener("click", (e) => {
          if (e.target.id === "statsCardModal") this.close();
        });

        // Actions
        $("#downloadStatsCardBtn")?.addEventListener("click", () => this.downloadImage());
        $("#shareStatsCardApiBtn")?.addEventListener("click", () => this.shareImage());
      },

      open() {
        this.init();
        const modal = $("#statsCardModal");
        if (modal) {
          modal.hidden = false;
          document.body.style.overflow = "hidden";
        }
        this.draw();
      },

      close() {
        const modal = $("#statsCardModal");
        if (modal) {
          modal.hidden = true;
          document.body.style.overflow = "";
        }
      },

      draw() {
        const canvas = $("#statsCardCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const width = 1080;
        const height = this.aspect === "story" ? 1350 : 1080;
        canvas.width = width;
        canvas.height = height;

        const th = (this.themes[this.theme] || (this.theme === "dark" ? this.themes.night : null) || this.themes.paper);

        // 1. Background Fill
        ctx.fillStyle = th.bg;
        ctx.fillRect(0, 0, width, height);

        // 2. Inner Frame / Card
        const margin = 56;
        const cardX = margin;
        const cardY = margin;
        const cardW = width - margin * 2;
        const cardH = height - margin * 2;
        const cornerR = 24;

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
        ctx.shadowBlur = 32;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = th.cardBg;
        this.roundRect(ctx, cardX, cardY, cardW, cardH, cornerR);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = th.border;
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, cardX, cardY, cardW, cardH, cornerR);
        ctx.stroke();

        // 3. Top Tag / Pill
        const pillX = cardX + 44;
        const pillY = cardY + 42;
        const pillText = t("card_stats_pill") || "📊 DIAVASMA · READING HABIT";
        ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
        const pillTextW = ctx.measureText(pillText).width;
        const pillW = pillTextW + 28;
        const pillH = 32;

        ctx.fillStyle = th.pillBg;
        this.roundRect(ctx, pillX, pillY, pillW, pillH, 16);
        ctx.fill();

        ctx.fillStyle = th.pillText;
        ctx.textBaseline = "middle";
        ctx.fillText(pillText, pillX + 14, pillY + pillH / 2);

        // 4. Headline / Message
        ctx.textBaseline = "alphabetic";
        const headlineY = pillY + pillH + 38;
        ctx.fillStyle = th.text;
        ctx.font = 'bold 34px "Literata", "Georgia", serif';
        const maxHeadW = cardW - 88;
        let msg = (this.customMessage || t("stats_default_msg")).trim();
        while (ctx.measureText(msg).width > maxHeadW && msg.length > 10) {
          msg = msg.slice(0, -4) + "...";
        }
        ctx.fillText(msg, cardX + 44, headlineY);

        // 5. Four Key Metric Cards
        const streaks = (typeof ReadingStatsEngine !== "undefined" && ReadingStatsEngine.calculateStreaks)
          ? ReadingStatsEngine.calculateStreaks()
          : { currentStreak: 0, bestStreak: 0 };
        const streakVal = `${streaks.currentStreak} ${t("stat_days") || "ημ."}`;
        const bestVal = `${streaks.bestStreak} ${t("stat_days") || "ημ."}`;

        const totalSec = ReadingStatsEngine ? (Object.values(ReadingStatsEngine.data?.daily || {}).reduce((a, b) => a + (Number(b) || 0), 0) + ReadingStatsEngine.pendingSeconds) : 0;
        const totalHours = (totalSec / 3600).toFixed(1) + "h";

        const completedCount = (typeof library !== "undefined" && Array.isArray(library))
          ? library.filter((item) => (Number(item.progress) || 0) >= 99).length
          : 0;

        const metrics = [
          { icon: "🔥", label: t("stat_streak") || "Σερί", val: streakVal },
          { icon: "⚡", label: t("stat_best_streak") || "Καλύτερο", val: bestVal },
          { icon: "⌛", label: t("stat_total") || "Σύνολο", val: totalHours },
          { icon: "📖", label: t("stat_completed") || "Ολοκληρωμένα", val: `${completedCount}` }
        ];

        const boxesY = headlineY + 28;
        const gap = 16;
        const boxW = (cardW - 88 - gap * 3) / 4;
        const boxH = 92;

        for (let b = 0; b < 4; b++) {
          const bx = cardX + 44 + b * (boxW + gap);
          ctx.fillStyle = th.boxBg;
          this.roundRect(ctx, bx, boxesY, boxW, boxH, 14);
          ctx.fill();
          ctx.strokeStyle = th.boxBorder;
          ctx.lineWidth = 1;
          this.roundRect(ctx, bx, boxesY, boxW, boxH, 14);
          ctx.stroke();

          ctx.font = '600 13px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = th.muted;
          ctx.fillText(`${metrics[b].icon} ${metrics[b].label}`, bx + 14, boxesY + 30);

          ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = th.text;
          ctx.fillText(metrics[b].val, bx + 14, boxesY + 68);
        }

        // 6. GitHub-style Calendar Heatmap Grid
        const heatSectionY = boxesY + boxH + 42;
        ctx.font = '600 16px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = th.muted;
        ctx.fillText(t("heatmap_title"), cardX + 44, heatSectionY);

        const gridStartX = cardX + 88;
        const gridStartY = heatSectionY + 22;
        const cellSize = this.aspect === "story" ? 38 : 34;
        const cellGap = this.aspect === "story" ? 7 : 6;

        const dayLabels = [t("day_mon") || "Δευ", "", t("day_wed") || "Τετ", "", t("day_fri") || "Παρ", "", t("day_sun") || "Κυρ"];
        ctx.font = '600 12px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = th.muted;
        ctx.textBaseline = "middle";
        for (let d = 0; d < 7; d++) {
          if (dayLabels[d]) {
            const ly = gridStartY + d * (cellSize + cellGap) + cellSize / 2;
            ctx.fillText(dayLabels[d], cardX + 44, ly);
          }
        }
        ctx.textBaseline = "alphabetic";

        const today = new Date();
        const dayOfWeek = (today.getDay() + 6) % 7;
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

        const totalDays = 18 * 7;
        const startDate = new Date(endOfWeek);
        startDate.setDate(endOfWeek.getDate() - totalDays + 1);

        const daily = (ReadingStatsEngine && ReadingStatsEngine.data?.daily) || {};
        const cur = new Date(startDate);

        for (let col = 0; col < 18; col++) {
          for (let row = 0; row < 7; row++) {
            const dateKey = ReadingStatsEngine ? ReadingStatsEngine.formatDateKey(cur) : "";
            const isFuture = cur > today;
            const sec = isFuture ? 0 : (daily[dateKey] || 0);
            const mins = Math.round(sec / 60);

            let lvlColor = th.cell0;
            if (!isFuture && mins > 0) {
              if (mins >= 60) lvlColor = th.cell4;
              else if (mins >= 30) lvlColor = th.cell3;
              else if (mins >= 15) lvlColor = th.cell2;
              else lvlColor = th.cell1;
            }

            const cx = gridStartX + col * (cellSize + cellGap);
            const cy = gridStartY + row * (cellSize + cellGap);

            ctx.fillStyle = lvlColor;
            this.roundRect(ctx, cx, cy, cellSize, cellSize, 5);
            ctx.fill();

            if (dateKey === (ReadingStatsEngine && ReadingStatsEngine.getTodayKey())) {
              ctx.strokeStyle = th.pillText;
              ctx.lineWidth = 2.5;
              this.roundRect(ctx, cx - 1, cy - 1, cellSize + 2, cellSize + 2, 6);
              ctx.stroke();
            }

            cur.setDate(cur.getDate() + 1);
          }
        }

        // Legend at bottom right of heatmap
        const legendY = gridStartY + 7 * (cellSize + cellGap) + 18;
        ctx.font = '500 12px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = th.muted;
        const legendRightX = gridStartX + 18 * (cellSize + cellGap) - cellGap;
        ctx.textAlign = "right";
        ctx.fillText(t("heatmap_more"), legendRightX, legendY + 11);

        const legCellSize = 13;
        const legColors = [th.cell4, th.cell3, th.cell2, th.cell1, th.cell0];
        let legCurX = legendRightX - 86;
        for (let lc = 0; lc < 5; lc++) {
          ctx.fillStyle = legColors[lc];
          this.roundRect(ctx, legCurX, legendY, legCellSize, legCellSize, 3);
          ctx.fill();
          legCurX -= (legCellSize + 4);
        }
        ctx.fillText(t("heatmap_less"), legCurX - 4, legendY + 11);
        ctx.textAlign = "left";

        // 7. Promotional / Advertisement Footer ("για να διαφημιστούμε")
        const footerY = cardY + cardH - 58;

        ctx.strokeStyle = th.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cardX + 44, footerY - 26);
        ctx.lineTo(cardX + cardW - 44, footerY - 26);
        ctx.stroke();

        // Left: App Brand & Calligraphic Δ Logo Badge
        const badgeX = cardX + 44;
        const badgeY = footerY - 14;
        const badgeR = 22;
        ctx.fillStyle = th.pillBg;
        ctx.beginPath();
        ctx.arc(badgeX + badgeR, badgeY + badgeR, badgeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = th.pillText;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = th.pillText;
        ctx.font = 'bold 24px "Playfair Display", "Georgia", serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Δ", badgeX + badgeR, badgeY + badgeR);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        ctx.fillStyle = th.brandText;
        ctx.font = 'bold 24px "Playfair Display", "Georgia", serif';
        ctx.fillText("Diavasma", badgeX + badgeR * 2 + 14, footerY + 8);

        ctx.fillStyle = th.muted;
        ctx.font = '500 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(t("promo_tagline") || "Χώρος απόλυτης ηρεμίας & ανάγνωσης · 100% Offline", badgeX + badgeR * 2 + 14, footerY + 28);

        // Right: Badge / Link
        ctx.save();
        ctx.textAlign = "right";
        ctx.fillStyle = th.pillText;
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText("diavasma.app", cardX + cardW - 44, footerY + 18);
        ctx.restore();
      },

      roundRect(ctx, x, y, width, height, radius) {
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(x, y, width, height, radius);
          return;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      },

      getBlob() {
        const canvas = $("#statsCardCanvas");
        if (!canvas) return Promise.resolve(null);
        return new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
        });
      },

      async downloadImage() {
        const blob = await this.getBlob();
        if (!blob) return;
        const a = document.createElement("a");
        const dateStr = ReadingStatsEngine ? ReadingStatsEngine.getTodayKey() : Date.now();
        a.download = `diavasma-stats-${dateStr}.png`;
        a.href = URL.createObjectURL(blob);
        a.click();
        showToast(t("toast_download_success") || "Η κάρτα αποθηκεύτηκε επιτυχώς!");
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      },

      async shareImage() {
        const blob = await this.getBlob();
        if (!blob) return;
        const file = new File([blob], "diavasma-stats.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: "Diavasma — Reading Habit & Stats",
              text: `${this.customMessage} · Diavasma App`,
              files: [file]
            });
            showToast(t("toast_share_success") || "Επιτυχής κοινοποίηση!");
            return;
          } catch (err) {
            if (err.name === "AbortError") return;
          }
        }
        this.downloadImage();
      }
    };
    window.StatsCardStudio = StatsCardStudio;

    /* =========================================================================
       ATMOSPHERIC WELCOME SPLASH SCREEN (Welcome Overlay Manager)
       ========================================================================= */
    function updateWelcomeImage(theme) {
      const isDark = ["slate", "night", "amoled"].includes(theme || prefs.theme);
      const mobileSrc = isDark ? "./MobileD.jpg" : "./MobileL.jpg";
      const desktopSrc = isDark ? "./DesktopD.png" : "./DesktopL.png";
      const sourceMob = $("#welcomeSourceMobile");
      const imgDesk = $("#welcomeImgDesktop");
      if (sourceMob && sourceMob.getAttribute("srcset") !== mobileSrc) {
        sourceMob.srcset = mobileSrc;
      }
      if (imgDesk && imgDesk.getAttribute("src") !== desktopSrc) {
        imgDesk.src = desktopSrc;
      }
    }

    function openWelcomeOverlay() {
      if (prefs.showWelcome === false || window._welcomeShownInSession) return;
      window._welcomeShownInSession = true;
      updateWelcomeImage(prefs.theme);
      const ov = $("#welcomeOverlay");
      if (!ov) return;
      ov.hidden = false;
      ov.classList.remove("closing");
      document.body.style.overflow = "hidden";
      ov.focus();
    }

    function closeWelcomeOverlay() {
      const ov = $("#welcomeOverlay");
      if (!ov || ov.hidden) return;
      ov.classList.add("closing");
      setTimeout(() => {
        ov.hidden = true;
        ov.classList.remove("closing");
        document.body.style.overflow = "";
      }, 340);
    }

        /* --- Web Share Target API Handler --- */
    async function handleIncomingShareTarget() {
      const params = new URLSearchParams(window.location.search);
      const shareUrl = (params.get("share_url") || "").trim();
      const shareText = (params.get("share_text") || "").trim();
      const shareTitle = (params.get("share_title") || "").trim();

      if (!shareUrl && !shareText && !shareTitle) return;

      window._launchedViaShare = true;
      try {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      } catch (_) {}

      // Android-safe URL extraction
      let extractedUrl = "";
      if (/^https?:\/\//i.test(shareUrl)) {
        extractedUrl = shareUrl;
      } else {
        const textMatch = shareText.match(/https?:\/\/[^\s"'<>]+/i);
        const titleMatch = shareTitle.match(/https?:\/\/[^\s"'<>]+/i);
        if (textMatch) extractedUrl = textMatch[0];
        else if (titleMatch) extractedUrl = titleMatch[0];
      }
      if (extractedUrl) {
        extractedUrl = extractedUrl.replace(/[.,;)\]>]+$/, "");
      }

      const articlesGrpId = groups.some((g) => g.id === "grp-articles")
        ? "grp-articles"
        : (groups[0]?.id || "grp-articles");

      if (extractedUrl) {
        if (typeof LoadingOverlay !== "undefined") {
          LoadingOverlay.show(t("share_importing_title") || "Προσθήκη κοινοποιημένου άρθρου...", extractedUrl, null);
        }
        let ok = false;
        try {
          ok = await importArticleFromUrl(true, {
            url: extractedUrl,
            groupId: articlesGrpId,
            fallbackTitle: shareTitle,
            fromShare: true
          });
        } catch (err) {
          console.warn("[Share Target Import Error]", err);
          ok = false;
        } finally {
          if (typeof LoadingOverlay !== "undefined") {
            LoadingOverlay.hide();
          }
        }

        if (ok === true) {
          activeGroupFilter = articlesGrpId;
          renderLibraryHub();
          showToast(t("toast_share_imported") || "Το άρθρο προστέθηκε στα Άρθρα!");
        } else {
          openImportModal(articlesGrpId);
          const tabBtn = document.querySelector('#importModal .mode-tab[data-pane="paneUrl"]');
          if (tabBtn) tabBtn.click();
          const urlInput = $("#urlImportInput");
          if (urlInput) {
            urlInput.value = extractedUrl;
            urlInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
          showToast(t("toast_share_import_fallback") || "Αδυναμία αυτόματης λήψης — το URL συμπληρώθηκε για χειροκίνητη εισαγωγή.");
        }
      } else if (shareText.length >= 20) {
        const words = shareText.trim().split(/\s+/).filter(Boolean).length;
        const readMinutes = Math.max(1, Math.round(words / 200));
        const title = shareTitle || shareText.trim().split("\n")[0].slice(0, 80) || "Κοινοποιημένο κείμενο";
        const parsed = (typeof parseMarkdownAndToc === "function") ? parseMarkdownAndToc(shareText) : { text: shareText, toc: [] };
        const newEntry = {
          id: "book-" + Date.now(),
          groupId: articlesGrpId,
          order: getGroupItems(articlesGrpId).length,
          kind: "Άρθρο",
          title: title,
          wordCount: words,
          readMinutes: readMinutes,
          text: parsed.text || shareText,
          toc: parsed.toc || [],
          charOffset: 0,
          bookmarkOffset: 0,
          highlights: [],
          audio: null,
          noise: null,
          progress: 0,
          updatedAt: Date.now(),
          url: "",
          domain: "",
          favicon: "",
          datetime: new Date().toISOString(),
          category: null,
          author: null
        };
        library.push(newEntry);
        saveLibraryState();
        activeGroupFilter = articlesGrpId;
        renderLibraryHub();
        showToast(t("toast_share_imported") || "Το άρθρο προστέθηκε στα Άρθρα!");
      }
    }

    function initWelcomeOverlay() {
      const ov = $("#welcomeOverlay");
      if (!ov) return;

      // Click/tap anywhere on the overlay to enter
      ov.addEventListener("click", () => {
        closeWelcomeOverlay();
      });

      const toggle = $("#showWelcomeToggle");
      if (toggle) {
        toggle.checked = prefs.showWelcome !== false;
        toggle.addEventListener("change", (e) => {
          prefs.showWelcome = e.target.checked;
          savePrefs();
        });
      }

      updateWelcomeImage(prefs.theme);

      if (window._launchedViaShare === true) {
        ov.hidden = true;
      } else if (prefs.showWelcome !== false) {
        window._welcomeShownInSession = true;
        document.body.style.overflow = "hidden";
        ov.focus();
      } else {
        ov.hidden = true;
      }
    }

    window.openWelcomeOverlay = openWelcomeOverlay;
    window.closeWelcomeOverlay = closeWelcomeOverlay;
    window.updateWelcomeImage = updateWelcomeImage;
    window.HourglassScreensaver = HourglassScreensaver;

    /* --- Init --- */
    if (!prefs.lang || !I18N[prefs.lang]) {
      const navLang = (navigator.language || "").slice(0, 2).toLowerCase();
      prefs.lang = I18N[navLang] ? navLang : "el";
      savePrefs();
    }
    applyPrefs(false);
    BackgroundAudioManager.init();
    ReadingStatsEngine.init();
    QuoteCardStudio.init();
    StatsCardStudio.init();
    applyLanguage(prefs.lang);
    renderLibraryHub();
    updatePomoUI();
    playlistReadyPromise = refreshPersistentPlaylist();
    refreshUploadedFonts();
    migrateLibraryToChunks();
    handleIncomingShareTarget();
    initWelcomeOverlay();
  } catch (err) {
    window.__INIT_ERR = { msg: err.message, stack: err.stack };
    console.error("[Diavasma Init Error]", err);
  }
})();
