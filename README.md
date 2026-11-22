<a id="languages"></a>

# Diavasma 📖


> A quiet, 100% offline reading sanctuary, study space, and organizer for books & articles — no ads, no tracking, zero server dependencies.


> Ένας ήσυχος, 100% offline χώρος ανάγνωσης, συγκέντρωσης και οργάνωσης βιβλίων & άρθρων — χωρίς διαφημίσεις, χωρίς παρακολούθηση (tracking), χωρίς εξαρτήσεις από servers.


---

### 🌍 Languages / Γλώσσες / 语言 / Langues / Sprachen / भाषाएँ / 言語 / Idiomas / Языки / Lingue / 언어 / Języki / Diller / Bahasa

[🇬🇧 English](#lang-en) · [🇬🇷 Ελληνικά](#lang-el) · [🇨🇳 简体中文](#lang-zh) · [🇫🇷 Français](#lang-fr) · [🇩🇪 Deutsch](#lang-de) · [🇮🇳 हिन्दी](#lang-hi) · [🇮🇩 Bahasa Indonesia](#lang-id) · [🇮🇹 Italiano](#lang-it) · [🇯🇵 日本語](#lang-ja) · [🇰🇷 한국어](#lang-ko) · [🇵🇱 Polski](#lang-pl) · [🇵🇹 Português](#lang-pt) · [🇷🇺 Русский](#lang-ru) · [🇪🇸 Español](#lang-es) · [🇹🇷 Türkçe](#lang-tr)

---


<a id="lang-en"></a>
# Diavasma 📖 (English)

> A quiet, 100% offline reading sanctuary, study space, and organizer for books & articles — no ads, no tracking, zero server dependencies.

## ✨ Key Features

- **📚 Multi-Format Support & Organization:** Native offline reading for EPUB, PDF (offline reflow engine with smart line break cleanup & persistent IndexedDB pagination cache), Markdown (`.md`) and plain text (`.txt`). Organize items into groups (Books, Articles, custom collections) with an instant contextual `+` import modal.
- **🌐 Articles from URL & Custom Selectors:** Smart article extraction from web links, site-specific custom CSS scraper rules (with JSON import/export), raw HTML source pasting (`Ctrl+U`), and automated offline site icon (favicon) grabbing.
- **⚡ 100% Offline PWA (Progressive Web App):** Fully functional without an internet connection. Installable as a standalone app on Android, iOS, Windows, and macOS via modern web browsers, featuring robust Service Worker precaching and a zero-flash welcome screen (Light/Dark, Desktop/Mobile).
- **🎨 6 Curated Themes & Self-Hosted Typography:** Paper, Warm, Sage, Slate, Night, and AMOLED themes. Includes locally bundled typefaces (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), support for custom font uploads (`.ttf`, `.otf`, `.woff`, `.woff2`), text alignment (Left, Center, Right, Justify), customizable line height, and 1 or 2 page spread view.
- **🎧 Music & Ambient Soundscapes:** Built-in Winamp-style mini audio player (persistent IndexedDB playlist, shuffle, 3-state loop, seek bar, and mobile volume control) alongside 6 procedural Web Audio soundscapes (Rain, Fireplace, Ocean Waves, Forest & Wind, Library & Vinyl, Deep Noise) with lock-screen background playback support.
- **🗣️ Text-to-Speech (TTS) & Notes:** Voice narration with sentence-level highlight synchronization and background audio playback. Highlight text in 3 distinct colors, take notes, export to Markdown, translate selected words instantly, and create adaptive Quote Share Cards that inherit reader typography.
- **⏱️ Pomodoro & Reading Habit Stats:** Focus timer with an animated hourglass screensaver during breaks, local reading habit tracker with a GitHub-style activity heatmap, and exportable Stats Share Cards.
- **🔄 Full Local Backup & Restore (JSON):** Complete export and restoration of all library books (with full text from IndexedDB), notes, highlights, reading stats, custom scraper rules, and reader preferences in a single portable `.json` file.
- **✨ Sanctuary Reading Upgrades:** Interactive Highlight Popover (`#highlightPopover`) for instant note editing, color switching, and Quote Cards without accidental page turns; "Continue Reading" card (`#continueReadingCard`) with 1-tap resume; clean 3-dots item action menu (`⋯`); and Web Share Target API integration to auto-import shared links directly into Articles.
- **🌍 15 Languages:** Comprehensive, native UI localization in 15 languages: English, Greek, Chinese (Simplified), French, German, Hindi, Indonesian, Italian, Japanese, Korean, Polish, Portuguese, Russian, Spanish, and Turkish.

## 🚀 Installation as an App (PWA)

1. Open `index.html` (or your GitHub Pages deployment URL) in a modern browser (Chrome, Edge, Safari, Brave, Firefox).
2. Click the **"Install App"** icon in the address bar, or open the browser menu **(⋯) → Install Diavasma**.
3. On **iOS (Safari)**: Tap the **Share** button → select **"Add to Home Screen"**.

## 🌐 Hosting on GitHub Pages

To host your own private or public instance on GitHub Pages, upload all the repository files:

- `index.html` (main application shell & reader interface)
- `manifest.json` (PWA configuration & metadata)
- `sw.js` (Service Worker for offline precaching & caching strategy)
- `css/` (`styles.css` - complete responsive stylesheet)
- `js/` (`boot.js`, `i18n.js`, `app.js` - bootstrap, 10-language localization & core logic)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - self-hosted offline PDF engine)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - app icons)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - welcome screen artwork)
- `fonts/` (self-hosted WOFF2 web fonts & `fonts.css`)
- `README.md` (project documentation)

1. Create a new repository on GitHub.
2. Push or upload all listed files to your repository.
3. Go to repository **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose the `main` (or `master`) branch and `/ (root)` folder, then click **Save**.
5. Within minutes, your reading room will be live and installable worldwide at `https://<username>.github.io/<repository-name>/`.

## 🔒 Privacy First

- **100% Local Data & Strict Offline Mode:** Diavasma does not collect, store, or transmit any personal information, browsing history, or book content to external servers. All library items, annotations, notes, and reading statistics remain strictly on your device inside `localStorage` and `IndexedDB`. Features an optional **Strict Offline Mode** that disables all external network requests (translation, scraping proxies), plus a complete "Clear All Local Data" option for shared devices.
- **Self-Hosted Fonts & Assets:** All typography, sound generators, and reader engines (including PDF.js) are self-hosted within the app. Zero network requests are made to third-party CDNs like Google Fonts, preserving your IP address and client identity.
- **Notice on URL Fetching:** The "Fetch from URL" feature relies on public CORS proxies to bypass browser cross-origin boundaries when fetching remote web pages. For 100% guaranteed offline privacy without transmitting URL queries across the network, use **"Paste HTML (Ctrl+U)"** or import local files (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Back to languages](#languages)

---

<a id="lang-el"></a>
# Diavasma 📖 (Ελληνικά)

> Ένας ήσυχος, 100% offline χώρος ανάγνωσης, συγκέντρωσης και οργάνωσης βιβλίων & άρθρων — χωρίς διαφημίσεις, χωρίς παρακολούθηση (tracking), χωρίς εξαρτήσεις από servers.

## ✨ Κύρια Χαρακτηριστικά (Features)

- **📚 Υποστήριξη Πολλαπλών Μορφών & Οργάνωση:** Αυτόνομη offline ανάγνωση για EPUB, PDF (offline reflow engine με έξυπνο καθαρισμό αλλαγών γραμμής & μόνιμη IndexedDB pagination cache), Markdown (`.md`) και απλό κείμενο (`.txt`). Οργάνωση σε ομάδες (Βιβλία, Άρθρα, προσαρμοσμένες ομάδες) με άμεσο contextual `+` import modal.
- **🌐 Άρθρα από URL & Custom Selectors:** Έξυπνη εξαγωγή άρθρων από συνδέσμους, εξειδικευμένοι κανόνες CSS scraper ανά ιστοσελίδα (με δυνατότητα εξαγωγής/εισαγωγής JSON), υποστήριξη επικόλλησης πηγαίου κώδικα HTML (`Ctrl+U`) και αυτόματο offline grab του favicon του site.
- **⚡ 100% Offline PWA (Progressive Web App):** Πλήρως λειτουργικό χωρίς σύνδεση στο διαδίκτυο. Εγκαθίσταται ως αυτόνομη εφαρμογή σε Android, iOS, Windows και macOS μέσω του browser, με ανθεκτικό Service Worker precaching και zero-flash οθόνη καλωσορίσματος (Light/Dark, Desktop/Mobile).
- **🎨 6 Επιμελημένα Θέματα & Self-hosted Τυπογραφία:** Χαρτί (Paper), Θερμό (Warm), Φασκόμηλο (Sage), Σχιστόλιθος (Slate), Νύχτα (Night) και AMOLED. Περιλαμβάνει τοπικά ενσωματωμένες γραμματοσειρές (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), ανέβασμα custom fonts (`.ttf`, `.otf`, `.woff`, `.woff2`), στοίχιση (Αριστερά, Κέντρο, Δεξιά, Πλήρης), διάστιχο και προβολή 1 ή 2 σελίδων.
- **🎧 Μουσική & Ηχοτοπία:** Ενσωματωμένος Winamp-style mini audio player (μόνιμη λίστα κομματιών στην IndexedDB, shuffle, 3-state loop, μπάρα πλοήγησης και έλεγχος έντασης στα κινητά) μαζί με 6 procedural Web Audio ηχοτοπία (Βροχή, Τζάκι, Κύματα θάλασσας, Δάσος & άνεμος, Βιβλιοθήκη & βινύλιο, Βαθύς θόρυβος) με δυνατότητα αναπαραγωγής στο παρασκήνιο με κλειστή οθόνη.
- **🗣️ Εκφώνηση (TTS) & Σημειώσεις:** Φωνητική ανάγνωση με ζωντανή επισήμανση πρότασης και background playback. Υπογραμμίσεις σε 3 χρώματα, σημειώσεις, εξαγωγή σε Markdown, άμεση μετάφραση επιλεγμένου κειμένου και δημιουργία Quote Share Cards που κληρονομούν την τυπογραφία του αναγνωστηρίου.
- **⏱️ Pomodoro & Στατιστικά Ανάγνωσης:** Χρονόμετρο εστίασης με δυναμικό screensaver κλεψύδρας κατά τα διαλείμματα, τοπικό habit tracker με activity heatmap τύπου GitHub και εξαγώγιμες Stats Share Cards.
- **🔄 Πλήρες Τοπικό Backup & Restore (JSON):** Πλήρης εξαγωγή και επαναφορά ολόκληρου του αναγνωστηρίου (βιβλία με το πλήρες κείμενό τους από το IndexedDB, σημειώσεις, επισημάνσεις, στατιστικά ανάγνωσης, κανόνες scraper και ρυθμίσεις) σε ένα ενιαίο αρχείο `.json`.
- **✨ Αναβαθμίσεις Sanctuary Reading:** Διαδραστικό Highlight Popover (`#highlightPopover`) για άμεση επεξεργασία σημείωσης, αλλαγή χρώματος και Quote Cards χωρίς άσκοπο γύρισμα σελίδας, κάρτα «Συνέχιση Ανάγνωσης» (`#continueReadingCard`) με άμεσο 1-tap άνοιγμα, καθαρό μενού επιλογών 3 τελειών (`⋯`) στη Βιβλιοθήκη και ενσωμάτωση Web Share Target API για αυτόματη προσθήκη κοινοποιημένων συνδέσμων στα Άρθρα.
- **🌍 15 Γλώσσες:** Πλήρες περιβάλλον χρήσης μεταφρασμένο σε 15 γλώσσες: Αγγλικά, Ελληνικά, Κινεζικά (Απλοποιημένα), Γαλλικά, Γερμανικά, Χίντι, Ινδονησιακά, Ιταλικά, Ιαπωνικά, Κορεατικά, Πολωνικά, Πορτογαλικά, Ρωσικά, Ισπανικά και Τουρκικά.

## 🚀 Εγκατάσταση ως Εφαρμογή (PWA)

1. Ανοίξτε το `index.html` (ή το URL σας στο GitHub Pages) σε έναν σύγχρονο browser (Chrome, Edge, Safari, Brave, Firefox).
2. Πατήστε το εικονίδιο **«Εγκατάσταση εφαρμογής»** στη γραμμή διευθύνσεων ή από το μενού του browser **(⋯) → Εγκατάσταση Diavasma**.
3. Στο **iOS (Safari)**: Πατήστε το κουμπί **Κοινοποίηση (Share)** → επιλέξτε **«Προσθήκη στην οθόνη αφετηρίας» (Add to Home Screen)**.

## 🌐 Φιλοξενία στο GitHub Pages

Για να φιλοξενήσετε τη δική σας προσωπική ή δημόσια εγκατάσταση στο GitHub Pages, ανεβάστε όλα τα αρχεία του φακέλου:

- `index.html` (κύριο κέλυφος εφαρμογής & διεπαφή ανάγνωσης)
- `manifest.json` (ρυθμίσεις & μεταδεδομένα PWA)
- `sw.js` (Service Worker για ανθεκτική offline λειτουργία & precaching)
- `css/` (`styles.css` - πλήρες responsive stylesheet)
- `js/` (`boot.js`, `i18n.js`, `app.js` - εκκίνηση, λεξικό 15 γλωσσών & βασική λογική)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - τοπική μηχανή απόδοσης PDF)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - εικονίδια εφαρμογής)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - εικαστικά οθόνης καλωσορίσματος)
- `fonts/` (τοπικές γραμματοσειρές WOFF2 & `fonts.css`)
- `README.md` (τεκμηρίωση του έργου)

1. Δημιουργήστε ένα νέο αποθετήριο (repository) στο GitHub.
2. Ανεβάστε όλα τα παραπάνω αρχεία στο αποθετήριό σας.
3. Μεταβείτε στις ρυθμίσεις του αποθετηρίου (**Settings → Pages**).
4. Στην ενότητα **Build and deployment**, επιλέξτε **Deploy from a branch**, διαλέξτε το branch `main` (ή `master`) και τον φάκελο `/ (root)`, και πατήστε **Save**.
5. Μέσα σε λίγα λεπτά, η εφαρμογή σας θα είναι διαθέσιμη παγκοσμίως και έτοιμη για εγκατάσταση στο `https://<username>.github.io/<repository-name>/`.

## 🔒 Ιδιωτικότητα (Privacy First)

- **100% Τοπικά Δεδομένα & Strict Offline Mode:** Το Diavasma δεν συλλέγει, δεν αποθηκεύει και δεν διαβιβάζει κανένα προσωπικό δεδομένο, ιστορικό ανάγνωσης ή περιεχόμενο αρχείων σε εξωτερικούς διακομιστές. Όλα τα βιβλία, τα κείμενα, οι σημειώσεις και τα στατιστικά παραμένουν αποκλειστικά στη συσκευή σας (`localStorage` & `IndexedDB`). Περιλαμβάνει επιλογή **Strict Offline Mode** για πλήρη αποκλεισμό εξωτερικών δικτυακών αιτημάτων, καθώς και επιλογή «Εκκαθάριση Όλων των Δεδομένων» για κοινόχρηστες συσκευές.
- **Τοπικές Γραμματοσειρές & Βιβλιοθήκες:** Όλη η τυπογραφία, οι γεννήτριες ήχου και οι μηχανές ανάγνωσης (συμπεριλαμβανομένου του PDF engine) είναι self-hosted. Δεν πραγματοποιείται καμία δικτυακή κλήση σε εξωτερικά CDN όπως το Google Fonts, προστατεύοντας πλήρως την IP διεύθυνση και το απόρρητό σας.
- **Σημείωση για Εξωτερικά URLs:** Η λειτουργία «Λήψη από URL» επικοινωνεί αναγκαστικά με δημόσια CORS proxies για την παράκαμψη των περιορισμών cross-origin των browsers κατά τη λήψη απομακρυσμένων σελίδων. Για απόλυτη, 100% ιδιωτικότητα χωρίς καμία δικτυακή κίνηση, συνιστάται η απευθείας **«Επικόλληση HTML (Ctrl+U)»** ή η εισαγωγή τοπικών αρχείων (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Επιστροφή στις γλώσσες](#languages)

---

<a id="lang-zh"></a>
# Diavasma 📖 (简体中文)

> 一个安静、100% 离线的阅读庇护所、学习空间与图书文章整理工具 —— 无广告、无追踪、零服务器依赖。

## ✨ 核心特性

- **📚 多格式支持与分类整理：** 原生离线阅读 EPUB、PDF（配备智能断行清理与持久 IndexedDB 分页缓存的离线排版引擎）、Markdown (`.md`) 和纯文本 (`.txt`)。通过即时上下文 `+` 导入弹窗将内容归类为书籍、文章或自定义分组。
- **🌐 网页文章抓取与自定义选择器：** 从网址智能提取文章内容，支持针对每个网站的自定义 CSS 选择器规则（带 JSON 导入/导出），支持粘贴原始网页源码 (`Ctrl+U`)，并自动离线获取网站图标 (Favicon)。
- **⚡ 100% 离线 PWA (渐进式 Web 应用)：** 无需互联网连接即可完全运行。可通过浏览器在 Android、iOS、Windows 和 macOS 上安装为独立应用程序，具备稳健的 Service Worker 预缓存和零闪烁欢迎屏幕（深浅色/桌面移动端自适应）。
- **🎨 6 种精选主题与本地字体：** 报纸 (Paper)、温和 (Warm)、鼠尾草 (Sage)、板岩 (Slate)、暗夜 (Night) 与 AMOLED 纯黑主题。内置本地字体库 (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`)，支持上传自定义字体 (`.ttf`, `.otf`, `.woff`, `.woff2`)，支持四向对齐（左/中/右/两端）、自定义行高以及单双页跨页排版。
- **🎧 音乐播放与环境音效：** 内置 Winamp 风格的迷你音频播放器（基于 IndexedDB 的持久播放列表、随机播放、三态循环、进度控制与移动端音量调节），以及 6 种 Web Audio 程序化白噪音（雨声、壁炉、海浪、森林微风、图书馆黑胶唱片、深层底噪），支持息屏后台播放。
- **🗣️ 文本朗读 (TTS) 与读书笔记：** 语音朗读伴随实时句子高亮与锁屏后台播放。提供 3 种颜色的高亮划线、笔记记录、Markdown 格式导出、即时选词翻译，以及自动继承阅读器字体的名句分享卡片生成。
- **⏱️ 番茄钟专注计时与阅读统计：** 专注计时器配备休息时随主题变换的沙漏动态屏保，内置 GitHub 风格热力图的本地阅读打卡器，以及可导出的阅读统计分享卡片。
- **🔄 完整本地备份与恢复 (JSON)：** 一键导出与还原整个书房（含 IndexedDB 完整文本的书籍、笔记、划线、阅读统计、自定义规则与设置）到单个便携式 `.json` 文件。
- **✨ 宁静阅读体验升级：** 交互式划线浮窗 (`#highlightPopover`) 支持免误翻页编辑笔记/换色/生成名言卡；顶部“继续阅读”卡片 (`#continueReadingCard`) 一键续读；精简的三点操作菜单 (`⋯`)；支持 Web Share Target API 将网页链接直接分享至书房。
- **🌍 15 种语言：** 提供英语、希腊语、简体中文、法语、德语、印地语、印度尼西亚语、意大利语、日语、韩语、波兰语、葡萄牙语、俄语、西班牙语和土耳其语 15 种语言的完整原生界面。

## 🚀 安装为应用程序 (PWA)

1. 在现代浏览器（Chrome、Edge、Safari、Brave、Firefox）中打开 `index.html`（或您的 GitHub Pages 网址）。
2. 点击地址栏中的 **“安装应用”** 图标，或打开浏览器菜单 **(⋯) → 安装 Diavasma**。
3. 在 **iOS (Safari)** 上：点击底部的 **分享 (Share)** 按钮 → 选择 **“添加到主屏幕” (Add to Home Screen)**。

## 🌐 在 GitHub Pages 上部署托管

要在 GitHub Pages 上托管您自己的个人或公开实例，只需上传仓库中的所有文件：

- `index.html` (主应用程序外壳与阅读器界面)
- `manifest.json` (PWA 配置文件与元数据)
- `sw.js` (用于离线强力预缓存与离线策略的 Service Worker)
- `css/` (`styles.css` - 完整的自适应排版样式表)
- `js/` (`boot.js`, `i18n.js`, `app.js` - 安全引导、15 语言词典与核心逻辑)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - 自托管离线 PDF 渲染引擎)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - 应用图标)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - 欢迎画面插图)
- `fonts/` (本地 WOFF2 网络字体与 `fonts.css`)
- `README.md` (项目文档说明)

1. 在 GitHub 上创建一个新的仓库 (Repository)。
2. 将上述所有文件推送到或上传到您的仓库中。
3. 进入仓库的 **Settings → Pages** 设置页面。
4. 在 **Build and deployment** 下，选择 **Deploy from a branch**，指定 `main`（或 `master`）分支及 `/ (root)` 根目录，点击 **Save**。
5. 几分钟后，您的专属阅读空间便可在 `https://<username>.github.io/<repository-name>/` 全球访问并支持直接安装。

## 🔒 隐私保护 (Privacy First)

- **100% 本地数据与严格离线模式：** Diavasma 不会收集、存储或向任何外部服务器发送您的个人隐私、阅读历史或书籍文件。所有的书籍、文本、划线笔记与阅读习惯数据均严格保存在您设备的 `localStorage` 与 `IndexedDB` 本地数据库中。支持可选的**严格离线模式 (Strict Offline Mode)** 与一键“清除所有本地数据”。
- **自托管字体与组件：** 所有字体、音频生成器和阅读引擎（包括 PDF.js）全部本地内置。应用运行时完全不向 Google Fonts 等第三方 CDN 发起网络请求，全面保护您的 IP 地址和设备指纹。
- **关于外部 URL 抓取的说明：** “从 URL 抓取” 功能必须依赖公共 CORS 代理来突破浏览器的跨域安全策略。若您追求绝对 100% 无网络流量的极客隐私环境，建议优先使用 **“粘贴 HTML (Ctrl+U)”** 或直接导入本地文件 (`.epub`, `.pdf`, `.txt`, `.md`)。

[↑ 返回语言选择](#languages)

---

<a id="lang-fr"></a>
# Diavasma 📖 (Français)

> Un sanctuaire de lecture calme, 100 % hors ligne, dédié à l'étude et à l'organisation de vos livres et articles — sans publicité, sans pistage, sans dépendance serveur.

## ✨ Fonctionnalités Principales

- **📚 Prise en charge multiformat & Organisation :** Lecture hors ligne native des formats EPUB, PDF (moteur de recomposition hors ligne avec nettoyage intelligent des sauts de ligne et cache de pagination persistant dans IndexedDB), Markdown (`.md`) et texte brut (`.txt`). Classez vos lectures en groupes (Livres, Articles, collections personnalisées) grâce à un modal d'importation contextuel `+` instantané.
- **🌐 Articles depuis une URL & Sélecteurs personnalisés :** Extraction intelligente d'articles Web, règles de scraping CSS personnalisées par site (avec import/export JSON), collage direct du code source HTML (`Ctrl+U`), et récupération automatique hors ligne du favicon du site.
- **⚡ PWA 100 % hors ligne (Progressive Web App) :** Entièrement utilisable sans connexion Internet. S'installe comme une application autonome sur Android, iOS, Windows et macOS depuis votre navigateur, avec un préchargement robuste par Service Worker et un écran d'accueil sans scintillement (clair/sombre, bureau/mobile).
- **🎨 6 Thèmes soignés & Typographie auto-hébergée :** Thèmes Papier (Paper), Chaleureux (Warm), Sauge (Sage), Ardoise (Slate), Nuit (Night) et AMOLED. Intègre des polices locales (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), l'importation de polices personnalisées (`.ttf`, `.otf`, `.woff`, `.woff2`), l'alignement (Gauche, Centre, Droite, Justifié), l'interligne réglable et l'affichage en 1 ou 2 pages.
- **🎧 Musique & Paysages sonores ambiants :** Mini-lecteur audio intégré de style Winamp (liste de lecture persistante dans IndexedDB, lecture aléatoire, boucle à 3 états, curseur de progression et contrôle du volume mobile) accompagné de 6 paysages sonores procéduraux Web Audio (Pluie, Cheminée, Vagues, Forêt & vent, Bibliothèque & vinyle, Bruit profond) avec lecture en arrière-plan écran verrouillé.
- **🗣️ Synthèse vocale (TTS) & Prise de notes :** Lecture vocale avec surlignage en direct de la phrase lue et poursuite en arrière-plan. Surlignages en 3 couleurs, notes d'étude, exportation Markdown, traduction instantanée de la sélection et génération de cartes de citation partagées héritant de la typographie du lecteur.
- **⏱️ Pomodoro & Suivi des habitudes de lecture :** Minuteur de concentration avec économiseur d'écran sablier animé pendant les pauses, suivi des habitudes de lecture local avec carte thermique d'activité style GitHub et cartes de statistiques exportables.
- **🔄 Sauvegarde & Restauration locale complète (JSON) :** Exportation et restauration intégrale de votre sanctuaire (livres avec texte complet depuis IndexedDB, surlignages, notes, statistiques, règles et réglages) dans un fichier `.json`.
- **✨ Améliorations de lecture Sanctuary :** Popover interactif (`#highlightPopover`) pour éditer vos notes, changer de couleur et partager sans tourner la page par inadvertance ; carte « Continuer la lecture » (`#continueReadingCard`) ; menu à 3 points épuré (`⋯`) ; et cible de partage Web Share Target.
- **🌍 15 Langues :** Interface utilisateur traduite nativement et intégralement en 15 langues : anglais, grec, chinois simplifié, français, allemand, hindi, indonésien, italien, japonais, coréen, polonais, portugais, russe, espagnol et turc.

## 🚀 Installation en tant qu'application (PWA)

1. Ouvrez `index.html` (ou l'URL de votre déploiement GitHub Pages) dans un navigateur moderne (Chrome, Edge, Safari, Brave, Firefox).
2. Cliquez sur l'icône **« Installer l'application »** dans la barre d'adresse, ou dans le menu **(⋯) → Installer Diavasma**.
3. Sur **iOS (Safari)** : Appuyez sur le bouton **Partager** → choisissez **« Sur l'écran d'accueil » (Add to Home Screen)**.

## 🌐 Hébergement sur GitHub Pages

Pour héberger votre propre instance privée ou publique sur GitHub Pages, déposez l'ensemble des fichiers du projet :

- `index.html` (coquille principale & interface du lecteur)
- `manifest.json` (configuration & métadonnées de la PWA)
- `sw.js` (Service Worker pour la mise en cache hors ligne et la stratégie de cache)
- `css/` (`styles.css` - feuille de style responsive complète)
- `js/` (`boot.js`, `i18n.js`, `app.js` - amorçage, dictionnaire 15 langues & logique applicative)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - moteur PDF hors ligne auto-hébergé)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - icônes d'application)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - visuels d'accueil)
- `fonts/` (polices web locales WOFF2 & `fonts.css`)
- `README.md` (documentation du projet)

1. Créez un nouveau dépôt (repository) sur GitHub.
2. Téléversez ou poussez l'ensemble des fichiers listés ci-dessus.
3. Accédez aux paramètres du dépôt (**Settings → Pages**).
4. Sous la section **Build and deployment**, choisissez **Deploy from a branch**, sélectionnez la branche `main` (ou `master`) et le dossier `/ (root)`, puis validez avec **Save**.
5. En quelques instants, votre espace de lecture sera accessible et installable mondialement sur `https://<username>.github.io/<repository-name>/`.

## 🔒 Confidentialité garantie (Privacy First)

- **Données 100 % locales & Mode Hors Ligne Strict :** Diavasma ne collecte, ne stocke et ne transmet aucune donnée personnelle, aucun historique et aucun texte vers des serveurs distants. Vos livres, notes et statistiques résident exclusivement sur votre appareil (`localStorage` & `IndexedDB`). Inclut un **Mode Hors Ligne Strict** coupant toute requête réseau externe et une option « Effacer toutes les données locales ».
- **Polices et bibliothèques auto-hébergées :** L'ensemble des polices, générateurs de son et moteurs de lecture (dont PDF.js) sont hébergés localement. Aucune requête n'est adressée à des services tiers comme Google Fonts, préservant ainsi votre adresse IP et votre vie privée.
- **Précision sur la récupération d'URL :** La fonction « Importer depuis une URL » fait appel à des proxys CORS publics pour contourner les restrictions des navigateurs lors de la récupération de pages distantes. Pour une confidentialité 100 % hors ligne sans trafic réseau, privilégiez **« Coller le HTML (Ctrl+U) »** ou l'import de fichiers locaux (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Retour aux langues](#languages)

---

<a id="lang-de"></a>
# Diavasma 📖 (Deutsch)

> Ein ruhiges, zu 100 % offline nutzbares Lese-Refugium, Lernbereich und Organizer für Bücher & Artikel — werbefrei, ohne Tracking, ohne Server-Abhängigkeiten.

## ✨ Hauptmerkmale

- **📚 Multi-Format-Unterstützung & Organisation:** Natives Offline-Lesen von EPUB, PDF (Offline-Reflow-Engine mit intelligenter Zeilenumbruch-Bereinigung und persistentem IndexedDB-Paginierungs-Cache), Markdown (`.md`) und Reintext (`.txt`). Organisieren Sie Ihre Inhalte in Gruppen (Bücher, Artikel, benutzerdefinierte Sammlungen) mit einem kontextuellen `+`-Import-Modal.
- **🌐 Web-Artikel & Benutzerdefinierte Selektoren:** Intelligente Artikelextraktion aus Web-Links, seitenspezifische CSS-Scraper-Regeln (mit JSON-Import/Export), Einfügen von Roh-HTML (`Ctrl+U`) und automatischer Offline-Abruf des Website-Icons (Favicon).
- **⚡ 100 % Offline-PWA (Progressive Web App):** Ohne Internetverbindung voll funktionsfähig. Über den Browser installierbar als eigenständige Anwendung unter Android, iOS, Windows und macOS, mit robustem Service Worker Precaching und flackerfreiem Willkommensbildschirm (Hell/Dunkel, Desktop/Mobil).
- **🎨 6 Kuratierte Themes & Selbst gehostete Typografie:** Themes Papier (Paper), Warm, Salbei (Sage), Schiefer (Slate), Nacht (Night) und AMOLED. Enthält lokale Schriftarten (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), Hochladen eigener Schriftarten (`.ttf`, `.otf`, `.woff`, `.woff2`), Textausrichtung (Links, Zentriert, Rechts, Blocksatz), einstellbare Zeilenhöhe sowie 1- oder 2-seitige Buchansicht.
- **🎧 Musik & Ambient-Klangwelten:** Integrierter Mini-Audioplayer im Winamp-Stil (persistente IndexedDB-Wiedergabeliste, Zufallswiedergabe, 3-Stufen-Wiederholung, Fortschrittsleiste und mobile Lautstärkeregelung) sowie 6 prozedurale Web Audio Klangwelten (Regen, Kaminfeuer, Meereswellen, Wald & Wind, Bibliothek & Vinyl, Tiefes Rauschen) mit Hintergrundwiedergabe bei gesperrtem Bildschirm.
- **🗣️ Sprachausgabe (TTS) & Notizen:** Vorlesefunktion mit satzweiser Live-Hervorhebung und Hintergrundwiedergabe. Markierungen in 3 Farben, Notizen, Markdown-Export, sofortige Übersetzung ausgewählter Textstellen und Zitatkarten (Quote Share Cards), die das typografische Design des Lesers übernehmen.
- **⏱️ Pomodoro-Timer & Lese-Statistiken:** Fokus-Timer mit animiertem Sanduhr-Bildschirmschoner während der Pausen, lokaler Lese-Gewohnheitstracker mit GitHub-artigem Aktivitäts-Heatmap und exportierbare Statistik-Karten.
- **🔄 Vollständiges lokales Backup & Wiederherstellung (JSON):** Export und Import aller Bücher (inklusive Volltext aus IndexedDB), Notizen, Markierungen, Lesestatistiken, Scraper-Regeln und Einstellungen in einer portablen `.json`-Datei.
- **✨ Sanctuary Lese-Upgrades:** Interaktives Highlight-Popover (`#highlightPopover`) zum Bearbeiten von Notizen, Ändern von Farben und Erstellen von Zitatkarten ohne unbeabsichtigtes Umblättern; „Weiterlesen“-Karte (`#continueReadingCard`); klares 3-Punkte-Aktionsmenü (`⋯`); und Web Share Target Integration.
- **🌍 15 Sprachen:** Vollständig lokalisierte Benutzeroberfläche in 15 Sprachen: Englisch, Griechisch, Chinesisch (Vereinfacht), Französisch, Deutsch, Hindi, Indonesisch, Italienisch, Japanisch, Koreanisch, Polnisch, Portugiesisch, Russisch, Spanisch und Türkisch.

## 🚀 Installation als App (PWA)

1. Öffnen Sie `index.html` (oder Ihre GitHub Pages-URL) in einem modernen Browser (Chrome, Edge, Safari, Brave, Firefox).
2. Klicken Sie auf das Symbol **„App installieren“** in der Adressleiste oder wählen Sie im Menü **(⋯) → Diavasma installieren**.
3. Unter **iOS (Safari)**: Tippen Sie auf die Schaltfläche **Teilen** → wählen Sie **„Zum Home-Bildschirm“ (Add to Home Screen)**.

## 🌐 Hosting auf GitHub Pages

Um Ihre eigene private oder öffentliche Instanz auf GitHub Pages zu betreiben, laden Sie alle Repository-Dateien hoch:

- `index.html` (Haupt-App-Shell & Leseoberfläche)
- `manifest.json` (PWA-Konfiguration & Metadaten)
- `sw.js` (Service Worker für Offline-Betrieb & Precaching)
- `css/` (`styles.css` - vollständiges responsives Stylesheet)
- `js/` (`boot.js`, `i18n.js`, `app.js` - Bootstrap, 10-Sprachen-Wörterbuch & Kernlogik)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - selbst gehostete Offline-PDF-Engine)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - App-Icons)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - Begrüßungsbilder)
- `fonts/` (lokale WOFF2-Webschriften & `fonts.css`)
- `README.md` (Projektdokumentation)

1. Erstellen Sie ein neues Repository auf GitHub.
2. Laden Sie alle oben aufgeführten Dateien in Ihr Repository hoch.
3. Öffnen Sie die Repository-Einstellungen (**Settings → Pages**).
4. Wählen Sie unter **Build and deployment** die Option **Deploy from a branch**, stellen Sie den `main`- (oder `master`-)Branch und den Ordner `/ (root)` ein und klicken Sie auf **Save**.
5. Nach wenigen Minuten ist Ihre Leseumgebung weltweit unter `https://<username>.github.io/<repository-name>/` erreichbar und installierbar.

## 🔒 Datenschutz an erster Stelle (Privacy First)

- **100 % lokale Daten & Strenger Offline-Modus:** Diavasma erfasst, speichert oder überträgt keinerlei personenbezogene Daten, Leseverläufe oder Buchinhalte an externe Server. Sämtliche Dokumente, Notizen und Statistiken verbleiben ausschließlich lokal auf Ihrem Gerät (`localStorage` & `IndexedDB`). Mit optionalem **Strengen Offline-Modus** und Funktion zum vollständigen Löschen aller lokalen Daten.
- **Selbst gehostete Schriften & Komponenten:** Alle Schriftarten, Tongeneratoren und Lesemotoren (inklusive PDF.js) werden lokal bereitgestellt. Es erfolgen keine Verbindungen zu Drittanbietern wie Google Fonts, wodurch Ihre IP-Adresse und Privatsphäre geschützt bleiben.
- **Hinweis zum Abrufen von URLs:** Die Funktion „Von URL abrufen“ nutzt öffentliche CORS-Proxys, um browserseitige Cross-Origin-Beschränkungen beim Laden entfernter Seiten zu überwinden. Für absolute Offline-Privatsphäre ohne Netzwerkverkehr empfehlen wir **„HTML einfügen (Ctrl+U)“** oder den direkten Import lokaler Dateien (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Zurück zur Sprachauswahl](#languages)

---

<a id="lang-hi"></a>
# Diavasma 📖 (हिन्दी)

> पुस्तकों और लेखों के अध्ययन, एकाग्रता और संगठन के लिए एक शांत, 100% ऑफ़लाइन वाचन अभयारण्य — बिना किसी विज्ञापन, ट्रैकिंग या सर्वर निर्भरता के।

## ✨ मुख्य विशेषताएँ

- **📚 बहु-प्रारूप समर्थन और संगठन:** EPUB, PDF (स्मार्ट लाइन ब्रेक क्लीनअप और स्थायी IndexedDB पेजिनेशन कैश से युक्त ऑफ़लाइन रीफ्लो इंजन), Markdown (`.md`) और सादा पाठ (`.txt`) का मूल ऑफ़लाइन वाचन। एक त्वरित प्रासंगिक `+` आयात मोडल के साथ सामग्री को समूहों (पुस्तकें, लेख, कस्टम समूह) में व्यवस्थित करें।
- **🌐 वेब लिंक से लेख और कस्टम चयनकर्ता:** वेब URL से लेखों का स्मार्ट निष्कर्षण, वेबसाइट-विशिष्ट कस्टम CSS स्क्रैपर नियम (JSON आयात/निर्यात के साथ), कच्चा HTML स्रोत पेस्ट (`Ctrl+U`), और स्वचालित ऑफ़लाइन साइट आइकन (फ़ेविकॉन) प्राप्ति।
- **⚡ 100% ऑफ़लाइन PWA (प्रोग्रेसिव वेब ऐप):** इंटरनेट कनेक्शन के बिना पूरी तरह कार्यात्मक। आधुनिक ब्राउज़र के माध्यम से Android, iOS, Windows और macOS पर स्टैंडअलोन ऐप के रूप में स्थापित किया जा सकता है, जिसमें मजबूत Service Worker प्रीकैशिंग और शून्य-फ़्लैश स्वागत स्क्रीन शामिल है।
- **🎨 6 चयनित थीम और स्व-होस्टेड टाइपोग्राफी:** पेपर (Paper), वार्म (Warm), सेज (Sage), स्लेट (Slate), नाइट (Night) और AMOLED थीम। अंतर्निहित स्थानीय फ़ॉन्ट (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), कस्टम फ़ॉन्ट अपलोड (`.ttf`, `.otf`, `.woff`, `.woff2`), संरेखण (बाएँ, केंद्र, दाएँ, औचित्य), पंक्ति रिक्ति और 1 या 2 पृष्ठ प्रसार दृश्य।
- **🎧 संगीत और परिवेशी ध्वनियाँ:** अंतर्निहित Winamp-शैली मिनी ऑडियो प्लेयर (स्थायी IndexedDB प्लेलिस्ट, शफ़ल, 3-स्थिति लूप, सीक बार और मोबाइल वॉल्यूम नियंत्रण) तथा 6 प्रक्रियात्मक Web Audio परिवेशी ध्वनियाँ (बारिश, चिमनी, समुद्र की लहरें, वन और हवा, पुस्तकालय और विनाइल, गहरा शोर) जो लॉक स्क्रीन पर भी पृष्ठभूमि में बजती हैं।
- **🗣️ टेक्स्ट-टू-स्पीच (TTS) और अध्ययन नोट्स:** वाक्य-स्तरीय लाइव हाइलाइट और बैकग्राउंड प्लेबैक के साथ आवाज़ वाचन। 3 रंगों में हाइलाइट, नोट्स, Markdown निर्यात, त्वरित चयन अनुवाद, और पाठक टाइपोग्राफी को अपनाने वाले उद्धरण साझाकरण कार्ड (Quote Share Cards)।
- **⏱️ पोमोडोरो और वाचन आदत सांख्यिकी:** अंतराल के दौरान एनिमेटेड ऑवरग्लास स्क्रीनसेवर के साथ फ़ोकस टाइमर, GitHub-शैली गतिविधि हीटमैप के साथ स्थानीय आदत ट्रैकर, और निर्यात योग्य आँकड़े कार्ड।
- **🔄 पूर्ण स्थानीय बैकअप और पुनर्स्थापना (JSON):** सभी पुस्तकों (IndexedDB से पूर्ण पाठ सहित), नोट्स, हाइलाइट्स, आँकड़ों, नियमों और सेटिंग्स का एक ही `.json` फ़ाइल में निर्यात और पुनर्स्थापना।
- **✨ अभयारण्य वाचन संवर्द्धन:** पृष्ठ पलटने से बचाते हुए त्वरित नोट संपादन हेतु इंटरएक्टिव हाइलाइट पॉपओवर (`#highlightPopover`), 1-टैप "पढ़ना जारी रखें" कार्ड (`#continueReadingCard`), स्वच्छ 3-डॉट्स मेनू (`⋯`), और वेब शेयर लक्ष्य API।
- **🌍 15 भाषाएँ:** 15 भाषाओं में पूर्ण मूल यूआई स्थानीयकरण: अंग्रेजी, ग्रीक, चीनी (सरलीकृत), फ्रेंच, जर्मन, हिन्दी, इंडोनेशियाई, इतालवी, जापानी, कोरियाई, पोलिश, पुर्तगाली, रूसी, स्पैनिश और तुर्की।

## 🚀 एप्लिकेशन के रूप में स्थापना (PWA)

1. किसी आधुनिक ब्राउज़र (Chrome, Edge, Safari, Brave, Firefox) में `index.html` (या अपना GitHub Pages URL) खोलें।
2. पता बार में **"ऐप इंस्टॉल करें"** आइकन पर क्लिक करें, या मेनू **(⋯) → Diavasma इंस्टॉल करें** चुनें।
3. **iOS (Safari)** पर: **शेयर (Share)** बटन टैप करें → **"होम स्क्रीन में जोड़ें" (Add to Home Screen)** चुनें।

## 🌐 GitHub Pages पर होस्टिंग

GitHub Pages पर अपना स्वयं का निजी या सार्वजनिक इंस्टेंस होस्ट करने के लिए, सभी फ़ाइलों को अपलोड करें:

- `index.html` (मुख्य एप्लिकेशन शैल और वाचन इंटरफ़ेस)
- `manifest.json` (PWA कॉन्फ़िगरेशन और मेटाडेटा)
- `sw.js` (ऑफ़लाइन प्रीकैशिंग के लिए Service Worker)
- `css/` (`styles.css` - संपूर्ण उत्तरदायी स्टाइलशीट)
- `js/` (`boot.js`, `i18n.js`, `app.js` - बूटस्ट्रैप, 15-भाषा शब्दकोश और मुख्य तर्क)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - स्व-होस्टेड ऑफ़लाइन PDF इंजन)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - ऐप आइकन)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - स्वागत स्क्रीन कलाकृतियां)
- `fonts/` (स्थानीय WOFF2 फ़ॉन्ट और `fonts.css`)
- `README.md` (परियोजना दस्तावेज़ीकरण)

1. GitHub पर एक नया रिपॉजिटरी (Repository) बनाएँ।
2. उपर्युक्त सभी फ़ाइलों को अपने रिपॉजिटरी में अपलोड या पुश करें।
3. रिपॉजिटरी की सेटिंग्स में जाएँ (**Settings → Pages**)।
4. **Build and deployment** के तहत, **Deploy from a branch** चुनें, `main` (या `master`) शाखा और `/ (root)` फ़ोल्डर का चयन करें, फिर **Save** पर क्लिक करें।
5. कुछ ही मिनटों में आपका वाचन कक्ष विश्व स्तर पर `https://<username>.github.io/<repository-name>/` पर उपलब्ध और स्थापित करने योग्य हो जाएगा।

## 🔒 गोपनीयता सर्वोपरि (Privacy First)

- **100% स्थानीय डेटा और सख्त ऑफ़लाइन मोड:** Diavasma किसी भी व्यक्तिगत जानकारी, वाचन इतिहास या दस्तावेज़ को बाहरी सर्वर पर संग्रहीत या प्रेषित नहीं करता है। सभी पुस्तकें, नोट्स और आँकड़े पूरी तरह से आपके डिवाइस के `localStorage` और `IndexedDB` में सुरक्षित रहते हैं। बाहरी अनुरोधों को पूरी तरह अवरुद्ध करने वाला **सख्त ऑफ़लाइन मोड** और "सभी स्थानीय डेटा साफ़ करें" विकल्प शामिल है।
- **स्व-होस्टेड फ़ॉन्ट और घटक:** सभी फ़ॉन्ट, ध्वनि जनरेटर और रेंडरिंग इंजन (PDF.js सहित) स्थानीय रूप से होस्ट किए जाते हैं। Google Fonts जैसे तृतीय-पक्ष सर्वर पर कोई नेटवर्क अनुरोध नहीं भेजा जाता, जिससे आपका आईपी पता और गोपनीयता सुरक्षित रहती है।
- **URL निष्कर्षण संबंधी सूचना:** "URL से प्राप्त करें" सुविधा बाहरी वेब पेजों को लोड करते समय ब्राउज़र प्रतिबंधों को बायपास करने के लिए सार्वजनिक CORS प्रॉक्सी का उपयोग करती है। शून्य नेटवर्क ट्रैफ़िक के साथ पूर्ण ऑफ़लाइन गोपनीयता के लिए, **"HTML पेस्ट करें (Ctrl+U)"** या स्थानीय फ़ाइलों (`.epub`, `.pdf`, `.txt`, `.md`) का उपयोग करें।

[↑ भाषाओं पर वापस जाएँ](#languages)

---

<a id="lang-ja"></a>
# Diavasma 📖 (日本語)

> 広告なし、トラッキングなし、外部サーバー依存ゼロ —— 読書、学習、書籍や記事の整理に最適な静寂の100%オフライン読書サンクチュアリ。

## ✨ 主な機能

- **📚 マルチフォーマット対応と整理：** EPUB、PDF（スマートな改行補正と永続的なIndexedDBページネーションキャッシュを備えたオフラインリフローエンジン）、Markdown (`.md`)、テキスト (`.txt`) をネイティブにオフライン読書。即時コンテキスト `+` インポートモーダルで書籍、記事、カスタムグループに整理できます。
- **🌐 Web記事取得とカスタムセレクター：** URLから記事本文をスマートに抽出、サイトごとのカスタムCSSスクレイパールール（JSONインポート/エクスポート対応）、HTMLソースの直接貼り付け (`Ctrl+U`)、サイトアイコン（ファビコン）の自動オフライン取得をサポート。
- **⚡ 100% オフラインPWA（プログレッシブウェブアプリ）：** インターネット接続なしで完全に動作。最新ブラウザを介してAndroid、iOS、Windows、macOSに独立したアプリとしてインストール可能。強力なService Workerプリキャッシュと、ちらつきゼロのウェルカム画面（ライト/ダーク、デスクトップ/モバイル適応）を搭載。
- **🎨 6つの洗練されたテーマとセルフホストフォント：** Paper（紙）、Warm（温かみ）、Sage（セージ）、Slate（スレート）、Night（夜）、AMOLED純黒テーマ。ローカルフォント（`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`）、カスタムフォントのアップロード（`.ttf`, `.otf`, `.woff`, `.woff2`）、文字揃え（左/中央/右/両端揃え）、行間調整、1ページまたは2ページ見開き表示に対応。
- **🎧 音楽と環境アンビエント音：** Winampスタイルのミニ音楽プレーヤー（IndexedDB永続プレイリスト、シャッフル、3状態ループ、シークバー、モバイル音量調整）と、画面ロック時も再生が続く6つのプロシージャルWeb Audio環境音（雨、暖炉、波、森と風、図書館とレコード、ディープノイズ）を搭載。
- **🗣️ 音声読み上げ（TTS）と読書ノート：** 文単位のリアルタイムハイライトとバックグラウンド再生に対応した音声読み上げ。3色の蛍光ペンハイライト、ノート記録、Markdown書き出し、選択箇所の即時翻訳、リーダーのタイポグラフィを継承する引用共有カード（Quote Share Cards）生成。
- **⏱️ ポモドーロと読書習慣トラッカー：** 休憩時にテーマ連動の砂時計スクリーンセーバーが表示される集中タイマー、GitHubスタイルのアクティビティヒートマップを備えたローカル習慣トラッカー、統計共有カード。
- **🔄 完全ローカルバックアップ＆復元 (JSON)：** すべての蔵書（IndexedDBの全文テキスト含む）、メモ、ハイライト、読書統計、カスタム抽出ルール、設定を1つの `.json` ファイルに完全書き出し・復元。
- **✨ サンクチュアリ読書機能の向上：** 誤ってページをめくることなくメモ編集や色変更ができるインタラクティブ・ハイライトポップオーバー (`#highlightPopover`)、トップの「続きを読む」カード (`#continueReadingCard`)、すっきりとした3点ドットメニュー (`⋯`)、Web Share Target 対応。
- **🌍 15言語対応：** 英語、ギリシャ語、簡体字中国語、フランス語、ドイツ語、ヒンディー語、日本語、ポルトガル語、ロシア語、スペイン語の完全なネイティブUI翻訳。

## 🚀 アプリとしてインストール（PWA）

1. モダンブラウザ（Chrome、Edge、Safari、Brave、Firefox）で `index.html`（またはGitHub PagesのURL）を開きます。
2. アドレスバーの **「アプリをインストール」** アイコンをクリックするか、メニュー **(⋯) → Diavasmaをインストール** を選択します。
3. **iOS (Safari)** の場合：**共有** ボタンをタップ → **「ホーム画面に追加」 (Add to Home Screen)** を選択します。

## 🌐 GitHub Pagesでのホスティング

GitHub Pages上で自分専用または公開インスタンスをホストするには、すべてのプロジェクトファイルをアップロードします：

- `index.html` (メインアプリシェルとリーダーUI)
- `manifest.json` (PWA設定とメタデータ)
- `sw.js` (オフライン動作とプリキャッシュ用Service Worker)
- `css/` (`styles.css` - 完全レスポンシブスタイルシート)
- `js/` (`boot.js`, `i18n.js`, `app.js` - 起動ブートストラップ、10言語辞書、コアロジック)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - セルフホストオフラインPDFエンジン)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - アプリアイコン)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - ウェルカム画面イラスト)
- `fonts/` (ローカルWOFF2フォントと `fonts.css`)
- `README.md` (プロジェクト解説ドキュメント)

1. GitHub上で新しいリポジトリを作成します。
2. 上記のファイルをすべてリポジトリにプッシュまたはアップロードします。
3. リポジトリの **Settings → Pages** を開きます。
4. **Build and deployment** で **Deploy from a branch** を選択し、`main`（または `master`）ブランチと `/ (root)` フォルダを指定して **Save** をクリックします。
5. 数分後、`https://<username>.github.io/<repository-name>/` であなた専用の読書空間が世界中から利用可能になります。

## 🔒 プライバシー最優先（Privacy First）

- **100% ローカルデータ＆完全オフラインモード：** Diavasmaはいかなる個人情報、読書履歴、ファイル内容も外部サーバーへ収集・送信しません。すべての書籍、ノート、統計データは端末内の `localStorage` および `IndexedDB` にのみ安全に保持されます。外部通信を完全に遮断する**完全オフラインモード (Strict Offline Mode)** やデータ一括消去機能を備えています。
- **セルフホストフォントとコンポーネント：** すべてのフォント、音源生成エンジン、リーダーエンジン（PDF.jsを含む）はローカルから提供されます。Google Fontsなどのサードパーティへの通信は一切行われないため、IPアドレスやプライバシーが完全に保護されます。
- **外部URL取得に関する注意：** 「URLから取得」機能は、ブラウザのクロスオリジン制約を回避するためパブリックCORSプロキシを経由します。外部通信を一切行わない完全なオフラインプライバシー環境には、**「HTML貼り付け (Ctrl+U)」** またはローカルファイル（`.epub`, `.pdf`, `.txt`, `.md`）のご利用をお勧めします。

[↑ 言語の選択に戻る](#languages)

---

<a id="lang-pt"></a>
# Diavasma 📖 (Português)

> Um santuário de leitura calmo, 100% offline, para estudo e organização de livros e artigos — sem anúncios, sem rastreamento, sem dependências de servidores.

## ✨ Principais Recursos

- **📚 Suporte Multiformato & Organização:** Leitura offline nativa para EPUB, PDF (motor de refluxo offline com limpeza inteligente de quebras de linha e cache de paginação persistente no IndexedDB), Markdown (`.md`) e texto simples (`.txt`). Organize tudo em grupos (Livros, Artigos, coleções personalizadas) através de um modal de importação contextual `+` instantâneo.
- **🌐 Artigos de URLs & Seletores Personalizados:** Extração inteligente de artigos da Web, regras de scraping CSS personalizadas por site (com importação/exportação JSON), colagem direta do código-fonte HTML (`Ctrl+U`) e captura automática offline do favicon do site.
- **⚡ PWA 100% Offline (Progressive Web App):** Totalmente funcional sem conexão com a internet. Pode ser instalado como aplicativo autônomo no Android, iOS, Windows e macOS pelo navegador, com pré-carregamento robusto via Service Worker e tela de boas-vindas sem cintilação (claro/escuro, desktop/celular).
- **🎨 6 Temas Selecionados & Tipografia Própria:** Temas Papel (Paper), Quente (Warm), Sálvia (Sage), Ardósia (Slate), Noite (Night) e AMOLED. Inclui fontes locais (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), envio de fontes personalizadas (`.ttf`, `.otf`, `.woff`, `.woff2`), alinhamento de texto (Esquerda, Centro, Direita, Justificado), espaçamento entre linhas ajustável e visualização em 1 ou 2 páginas.
- **🎧 Música & Paisagens Sonoras:** Mini player de áudio integrado no estilo Winamp (lista de reprodução persistente no IndexedDB, modo aleatório, repetição de 3 estados, barra de busca e controle de volume no celular) com 6 paisagens sonoras Web Audio procedurais (Chuva, Lareira, Ondas do mar, Floresta & vento, Biblioteca & vinil, Ruído profundo) e reprodução contínua em segundo plano com a tela desligada.
- **🗣️ Leitura em Voz Alta (TTS) & Anotações:** Narração de voz com destaque em tempo real da frase em leitura e reprodução em segundo plano. Destaques em 3 cores, anotações, exportação em Markdown, tradução instantânea do trecho selecionado e cartões de citação compartilháveis (Quote Share Cards) com a mesma tipografia do leitor.
- **⏱️ Pomodoro & Estatísticas de Leitura:** Temporizador de foco com descanso de tela animado em ampulheta durante os intervalos, rastreador de hábitos local com mapa de calor no estilo GitHub e cartões de estatísticas exportáveis.
- **🔄 Backup & Restauração Local Completa (JSON):** Exportação e restauração de toda a biblioteca (com texto completo do IndexedDB), notas, destaques, estatísticas, regras de scraping e preferências em um único arquivo `.json`.
- **✨ Melhorias de Leitura Sanctuary:** Popover interativo de destaque (`#highlightPopover`) para edição rápida de notas e cores sem virar a página; cartão "Continuar Lendo" (`#continueReadingCard`); menu compacto de 3 pontos (`⋯`); e suporte ao Web Share Target.
- **🌍 15 Idiomas:** Interface de usuário completa e traduzida nativamente em 15 idiomas: inglês, grego, chinês simplificado, francês, alemão, híndi, indonésio, italiano, japonês, coreano, polonês, português, russo, espanhol e turco.

## 🚀 Instalação como Aplicativo (PWA)

1. Abra o `index.html` (ou a URL do seu GitHub Pages) em um navegador moderno (Chrome, Edge, Safari, Brave, Firefox).
2. Clique no ícone **"Instalar aplicativo"** na barra de endereços ou no menu **(⋯) → Instalar Diavasma**.
3. No **iOS (Safari)**: Toque no botão **Compartilhar** → escolha **"Adicionar à Tela de Início" (Add to Home Screen)**.

## 🌐 Hospedagem no GitHub Pages

Para hospedar sua própria instância privada ou pública no GitHub Pages, envie todos os arquivos do repositório:

- `index.html` (estrutura principal da aplicação e interface do leitor)
- `manifest.json` (configurações e metadados da PWA)
- `sw.js` (Service Worker para operação offline e pré-carregamento)
- `css/` (`styles.css` - folha de estilos responsiva completa)
- `js/` (`boot.js`, `i18n.js`, `app.js` - inicialização, dicionário de 15 idiomas e lógica central)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - motor PDF offline auto-hospedado)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - ícones do app)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - ilustrações da tela de boas-vindas)
- `fonts/` (fontes web WOFF2 locais & `fonts.css`)
- `README.md` (documentação do projeto)

1. Crie um novo repositório no GitHub.
2. Faça upload ou envie por push todos os arquivos listados acima.
3. Acesse as configurações do repositório (**Settings → Pages**).
4. Na seção **Build and deployment**, selecione **Deploy from a branch**, escolha a branch `main` (ou `master`) e a pasta `/ (root)`, e clique em **Save**.
5. Em poucos minutos, seu espaço de leitura estará disponível globalmente e pronto para instalação em `https://<username>.github.io/<repository-name>/`.

## 🔒 Privacidade em Primeiro Lugar (Privacy First)

- **Dados 100% Locais & Modo Offline Estrito:** O Diavasma não coleta, não armazena e não envia dados pessoais, histórico de leitura ou conteúdo de arquivos para servidores externos. Todos os livros, notas e estatísticas permanecem salvos no seu dispositivo em `localStorage` e `IndexedDB`. Inclui **Modo Offline Estrito** (bloqueio total de requisições externas) e botão para limpar todos os dados locais.
- **Fontes e Componentes Locais:** Todas as fontes, geradores de áudio e motores de leitura (incluindo o PDF.js) são auto-hospedados. Nenhuma requisição é feita a servidores de terceiros como o Google Fonts, preservando seu IP e sua privacidade.
- **Aviso sobre Links Web:** A opção "Obter de URL" utiliza proxies CORS públicos para contornar restrições dos navegadores ao buscar páginas remotas. Para total privacidade offline sem tráfego de rede, utilize **"Colar HTML (Ctrl+U)"** ou importe arquivos locais (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Voltar aos idiomas](#languages)

---

<a id="lang-ru"></a>
# Diavasma 📖 (Русский)

> Тихое, на 100% автономное пространство для чтения, учебы и упорядочивания книг и статей — без рекламы, без слежки и без зависимости от серверов.

## ✨ Ключевые возможности

- **📚 Поддержка множества форматов и организация:** Встроенное чтение офлайн для EPUB, PDF (офлайн-движок перекомпоновки текста с умной очисткой переносов строк и постоянным кэшем пагинации в IndexedDB), Markdown (`.md`) и обычного текста (`.txt`). Организуйте материалы по группам (Книги, Статьи, пользовательские подборки) с помощью быстрого контекстного модального окна `+`.
- **🌐 Статьи по URL и пользовательские селекторы:** Интеллектуальное извлечение статей по ссылке, индивидуальные правила CSS-скрейпинга для конкретных сайтов (с импортом/экспортом JSON), поддержка вставки исходного кода HTML (`Ctrl+U`) и автоматическое сохранение иконки сайта (favicon) офлайн.
- **⚡ 100% автономное PWA (Progressive Web App):** Полноценная работа без подключения к Интернету. Устанавливается как отдельное приложение на Android, iOS, Windows и macOS прямо из браузера, оснащено надежным предварительным кэшированием Service Worker и экраном приветствия без мерцания (светлая/темная тема, десктоп/мобильный).
- **🎨 6 тщательно подобранных тем и локальные шрифты:** Темы Бумага (Paper), Теплая (Warm), Шалфей (Sage), Сланец (Slate), Ночь (Night) и AMOLED. Локальный набор шрифтов (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), загрузка собственных шрифтов (`.ttf`, `.otf`, `.woff`, `.woff2`), выравнивание (по левому краю, по центру, по правому краю, по ширине), регулировка межстрочного интервала и режим 1 или 2 страниц.
- **🎧 Музыка и окружающие звуковые ландшафты:** Встроенный мини-плеер в стиле Winamp (постоянный плейлист в IndexedDB, случайный порядок, 3 режима зацикливания, полоса перемотки и мобильный регулятор громкости) и 6 процедурных звуковых ландшафтов Web Audio (дождь, камин, морские волны, лес и ветер, библиотека и винил, глубокий шум) с фоновым воспроизведением при заблокированном экране.
- **🗣️ Озвучивание текста (TTS) и заметки:** Голосовое чтение с синхронным выделением текущего предложения и фоновым воспроизведением. Выделение текста 3 цветами, ведение заметок, экспорт в Markdown, мгновенный перевод выделенного фрагмента и создание карточек с цитатами (Quote Share Cards), наследующих оформление читалки.
- **⏱️ Помодоро и трекер привычки чтения:** Таймер концентрации с анимированной заставкой-песочными часами во время перерывов, локальный трекер привычек с тепловой картой активности в стиле GitHub и экспорт карточек со статистикой.
- **🔄 Полный локальный бэкап и восстановление (JSON):** Экспорт и восстановление всей библиотеки (включая полный текст из IndexedDB), заметок, выделений, статистики, правил и настроек в один переносимый файл `.json`.
- **✨ Улучшения спокойного чтения (Sanctuary):** Интерактивный поповер выделения (`#highlightPopover`) для редактирования заметок, смены цвета и создания карточек без случайного перелистывания страниц; карточка «Продолжить чтение» (`#continueReadingCard`); аккуратное меню из 3 точек (`⋯`); и поддержка Web Share Target.
- **🌍 15 языков:** Полный перевод интерфейса на 15 языков: английский, греческий, китайский (упрощенный), французский, немецкий, хинди, индонезийский, итальянский, японский, корейский, польский, португальский, русский, испанский и турецкий.

## 🚀 Установка в качестве приложения (PWA)

1. Откройте `index.html` (или адрес вашего проекта на GitHub Pages) в современном браузере (Chrome, Edge, Safari, Brave, Firefox).
2. Нажмите на значок **«Установить приложение»** в адресной строке или откройте меню **(⋯) → Установить Diavasma**.
3. На **iOS (Safari)**: Нажмите кнопку **Поделиться (Share)** → выберите **«На экран \"Домой\"» (Add to Home Screen)**.

## 🌐 Развертывание на GitHub Pages

Чтобы опубликовать собственный приватный или публичный экземпляр на GitHub Pages, загрузите все файлы проекта:

- `index.html` (основная оболочка приложения и интерфейс читалки)
- `manifest.json` (конфигурация и метаданные PWA)
- `sw.js` (Service Worker для автономной работы и кэширования)
- `css/` (`styles.css` - полная адаптивная таблица стилей)
- `js/` (`boot.js`, `i18n.js`, `app.js` - загрузка, словарь для 15 языков и основная логика)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - автономный движок рендеринга PDF)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - иконки приложения)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - графика экрана приветствия)
- `fonts/` (локальные веб-шрифты WOFF2 и `fonts.css`)
- `README.md` (документация проекта)

1. Создайте новый репозиторий на GitHub.
2. Загрузите или отправьте через push все перечисленные файлы в репозиторий.
3. Перейдите в настройки репозитория (**Settings → Pages**).
4. В блоке **Build and deployment** выберите **Deploy from a branch**, укажите ветку `main` (или `master`) и папку `/ (root)`, затем нажмите **Save**.
5. Через пару минут ваша читалка станет доступна и готова к установке по адресу `https://<username>.github.io/<repository-name>/`.

## 🔒 Конфиденциальность превыше всего (Privacy First)

- **100% локальные данные и Строгий офлайн-режим:** Diavasma не собирает, не сохраняет и не передает персональные данные, историю чтения или файлы на внешние серверы. Все книги, тексты, заметки и статистика хранятся исключительно на вашем устройстве в `localStorage` и `IndexedDB`. Включает **Строгий офлайн-режим (Strict Offline Mode)** и функцию полной очистки всех локальных данных.
- **Локальные шрифты и компоненты:** Все шрифты, генераторы звука и движки чтения (включая PDF.js) размещены локально. Приложение не выполняет запросов к сторонним сервисам вроде Google Fonts, сохраняя в тайне ваш IP-адрес и системные параметры.
- **Примечание по загрузке статей по URL:** Функция «Загрузка по URL» задействует публичные CORS-прокси для обхода ограничений браузера при чтении сторонних сайтов. Для абсолютной автономной приватности без сетевого трафика используйте функцию **«Вставить HTML (Ctrl+U)»** или локальные файлы (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Наверх к выбору языка](#languages)

---

<a id="lang-es"></a>
# Diavasma 📖 (Español)

> Un santuario de lectura tranquilo, 100% offline, para estudiar y organizar libros y artículos — sin anuncios, sin rastreo y sin dependencias de servidores.

## ✨ Características Principales

- **📚 Compatibilidad Multiformato y Organización:** Lectura offline nativa para EPUB, PDF (motor de reflujo offline con limpieza inteligente de saltos de línea y caché de paginación persistente en IndexedDB), Markdown (`.md`) y texto plano (`.txt`). Organice sus lecturas en grupos (Libros, Artículos, colecciones personalizadas) mediante un modal de importación contextual `+` instantáneo.
- **🌐 Artículos desde URL y Selectores Personalizados:** Extracción inteligente de artículos web, reglas de scraping CSS personalizadas por sitio (con importación/exportación JSON), pegado directo del código fuente HTML (`Ctrl+U`) y captura automática offline del icono del sitio (favicon).
- **⚡ PWA 100% Offline (Progressive Web App):** Completamente funcional sin conexión a internet. Se puede instalar como una aplicación independiente en Android, iOS, Windows y macOS desde el navegador, con precaching robusto mediante Service Worker y pantalla de bienvenida sin parpadeos (claro/oscuro, escritorio/móvil).
- **🎨 6 Temas Cuidados y Tipografía Autoalojada:** Temas Papel (Paper), Cálido (Warm), Salvia (Sage), Pizarra (Slate), Noche (Night) y AMOLED. Incluye fuentes locales (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), carga de fuentes personalizadas (`.ttf`, `.otf`, `.woff`, `.woff2`), alineación de texto (Izquierda, Centro, Derecha, Justificado), interlineado ajustable y vista a 1 o 2 páginas.
- **🎧 Música y Paisajes Sonoros:** Mini reproductor de audio integrado estilo Winamp (lista de reproducción persistente en IndexedDB, reproducción aleatoria, bucle de 3 estados, barra de búsqueda y control de volumen para móviles) junto con 6 paisajes sonoros procedimentales de Web Audio (Lluvia, Chimenea, Olas del mar, Bosque y viento, Biblioteca y vinilo, Ruido profundo) con reproducción en segundo plano y pantalla bloqueada.
- **🗣️ Lectura por Voz (TTS) y Notas:** Lectura en voz alta con resaltado en vivo de la frase y reproducción en segundo plano. Subrayados en 3 colores, notas de estudio, exportación a Markdown, traducción instantánea del texto seleccionado y generación de tarjetas de citas compartibles (Quote Share Cards) que adoptan la tipografía del lector.
- **⏱️ Pomodoro y Estadísticas de Lectura:** Temporizador de enfoque con protector de pantalla animado de reloj de arena durante los descansos, seguimiento de hábitos local con mapa de calor de actividad estilo GitHub y tarjetas de estadísticas exportables.
- **🔄 Copia de seguridad y Restauración local completa (JSON):** Exportación y restauración de toda la biblioteca (con texto completo de IndexedDB), notas, resaltados, estadísticas, reglas y ajustes en un único archivo `.json`.
- **✨ Mejoras de lectura Sanctuary:** Popover interactivo de resaltado (`#highlightPopover`) para editar notas y colores sin pasar de página por error; tarjeta "Continuar Leyendo" (`#continueReadingCard`); menú limpio de 3 puntos (`⋯`); y soporte para Web Share Target.
- **🌍 15 Idiomas:** Interfaz de usuario traducida de forma nativa e íntegra en 15 idiomas: inglés, griego, chino simplificado, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español y turco.

## 🚀 Instalación como Aplicación (PWA)

1. Abra `index.html` (o la URL de su despliegue en GitHub Pages) en un navegador moderno (Chrome, Edge, Safari, Brave, Firefox).
2. Haga clic en el icono **«Instalar aplicación»** en la barra de direcciones o en el menú **(⋯) → Instalar Diavasma**.
3. En **iOS (Safari)**: Pulse el botón **Compartir (Share)** → elija **«Añadir a la pantalla de inicio» (Add to Home Screen)**.

## 🌐 Alojamiento en GitHub Pages

Para alojar su propia instancia privada o pública en GitHub Pages, suba todos los archivos del repositorio:

- `index.html` (estructura principal de la aplicación e interfaz de lectura)
- `manifest.json` (configuración y metadatos de la PWA)
- `sw.js` (Service Worker para funcionamiento offline y precaching)
- `css/` (`styles.css` - hoja de estilos responsive completa)
- `js/` (`boot.js`, `i18n.js`, `app.js` - arranque seguro, diccionario de 15 idiomas y lógica central)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - motor PDF offline autoalojado)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - iconos de la aplicación)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - imágenes de la pantalla de bienvenida)
- `fonts/` (fuentes web WOFF2 locales y `fonts.css`)
- `README.md` (documentación del proyecto)

1. Cree un nuevo repositorio en GitHub.
2. Suba o haga push de todos los archivos indicados a su repositorio.
3. Vaya a la configuración del repositorio (**Settings → Pages**).
4. En **Build and deployment**, elija **Deploy from a branch**, seleccione la rama `main` (o `master`) y la carpeta `/ (root)`, y haga clic en **Save**.
5. En pocos minutos, su espacio de lectura estará disponible globalmente e instalable en `https://<username>.github.io/<repository-name>/`.

## 🔒 Privacidad Ante Todo (Privacy First)

- **Datos 100% Locales y Modo Offline Estricto:** Diavasma no recopila, no almacena ni transmite ningún dato personal, historial de lectura o contenido de archivos a servidores externos. Todos los libros, notas y estadísticas permanecen exclusivamente en su dispositivo (`localStorage` e `IndexedDB`). Incluye **Modo Offline Estricto** (cero peticiones externas) y opción para borrar todos los datos locales.
- **Fuentes y Recursos Locales:** Todas las tipografías, generadores de audio y motores de lectura (incluido PDF.js) se ejecutan de manera local. No se realiza ninguna solicitud a servidores de terceros como Google Fonts, protegiendo su dirección IP y su privacidad.
- **Aviso sobre Enlaces Web:** La función «Obtener desde URL» utiliza proxies CORS públicos para sortear las restricciones del navegador al cargar páginas remotas. Para una privacidad 100% offline sin tráfico de red, utilice **«Pegar HTML (Ctrl+U)»** o importe archivos locales (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Volver a la selección de idiomas](#languages)

---
<a id="lang-it"></a>
# Diavasma 📖 (Italiano)

> Un santuario di lettura tranquillo, 100% offline, per studiare e organizzare libri e articoli — senza pubblicità, senza tracciamento e senza dipendenze da server.

## ✨ Caratteristiche Principali

- **📚 Supporto Multiformato e Organizzazione:** Lettura offline nativa per EPUB, PDF (motore di reflow offline con pulizia intelligente delle interruzioni di riga e cache di impaginazione persistente in IndexedDB), Markdown (`.md`) e testo normale (`.txt`). Organizza le tue letture in gruppi (Libri, Articoli, raccolte personalizzate) tramite una finestra modale di importazione `+` istantanea.
- **🌐 Articoli da URL e Selettori Personalizzati:** Estrazione intelligente di articoli web, regole CSS personalizzate per sito (con importazione/esportazione JSON), incolla diretto del codice sorgente HTML (`Ctrl+U`) e recupero automatico offline dell'icona del sito (favicon).
- **⚡ PWA 100% Offline (Progressive Web App):** Perfettamente funzionante senza connessione Internet. Installabile come app indipendente su Android, iOS, Windows e macOS tramite i browser moderni, con solido pre-caching tramite Service Worker e schermata di benvenuto senza sfarfallio (Chiaro/Scuro, Desktop/Mobile).
- **🎨 6 Temi Curati e Tipografia Locale:** Temi Carta (Paper), Caldo (Warm), Salvia (Sage), Lavagna (Slate), Notte (Night) e AMOLED. Include font locali (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), caricamento di font personalizzati (`.ttf`, `.otf`, `.woff`, `.woff2`), allineamento del testo (Sinistra, Centro, Destra, Giustificato), interlinea regolabile e visualizzazione a 1 o 2 pagine.
- **🎧 Musica e Paesaggi Sonori:** Mini lettore audio integrato stile Winamp (playlist persistente in IndexedDB, riproduzione casuale, ripetizione a 3 stati, barra di ricerca e controllo volume mobile) insieme a 6 paesaggi sonori procedurali Web Audio (Pioggia, Camino, Onde del mare, Foresta e vento, Biblioteca e vinile, Rumore marrone profondo) con riproduzione in background a schermo bloccato.
- **🗣️ Lettura Vocale (TTS) e Note:** Lettura ad alta voce con evidenziazione in tempo reale delle frasi e riproduzione in background. Evidenziazioni in 3 colori, note di studio, esportazione in Markdown, traduzione istantanea del testo selezionato e generazione di schede citazione condivisibili (Quote Share Cards) con la tipografia del lettore.
- **⏱️ Pomodoro e Statistiche di Lettura:** Timer di concentrazione con salvaschermo animato a clessidra durante le pause, monitoraggio delle abitudini locali con mappa di calore stile GitHub e schede statistiche esportabili.
- **🔄 Backup e Ripristino Locale Completo (JSON):** Esportazione e ripristino dell'intera libreria (con testo completo da IndexedDB), note, evidenziazioni, statistiche, regole e impostazioni in un unico file `.json`.
- **✨ Miglioramenti di Lettura Sanctuary:** Popover interattivo per evidenziazioni (`#highlightPopover`) per modificare note e colori senza girare pagina involontariamente; scheda "Continua a leggere" (`#continueReadingCard`); menu compatto a 3 punti (`⋯`); e supporto Web Share Target.
- **🌍 15 Lingue:** Interfaccia utente tradotta nativamente in 15 lingue: inglese, greco, cinese semplificato, francese, tedesco, hindi, indonesiano, italiano, giapponese, coreano, polacco, portoghese, russo, spagnolo e turco.

## 🚀 Installazione come Applicazione (PWA)

1. Apri `index.html` (o l'URL della tua istanza su GitHub Pages) in un browser moderno (Chrome, Edge, Safari, Brave, Firefox).
2. Fai clic sull'icona **«Installa applicazione»** nella barra degli indirizzi o nel menu **(⋯) → Installa Diavasma**.
3. Su **iOS (Safari)**: Tocca il pulsante **Condividi (Share)** → seleziona **«Aggiungi alla schermata Home» (Add to Home Screen)**.

## 🌐 Hosting su GitHub Pages

Per ospitare la tua istanza privata o pubblica su GitHub Pages, carica tutti i file del repository:

- `index.html` (struttura principale dell'applicazione e interfaccia di lettura)
- `manifest.json` (configurazione e metadati della PWA)
- `sw.js` (Service Worker per funzionamento offline e caching)
- `css/` (`styles.css` - foglio di stile responsive completo)
- `js/` (`boot.js`, `i18n.js`, `app.js` - avvio sicuro, dizionario a 15 lingue e logica applicativa)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - motore PDF offline locale)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - icone dell'applicazione)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - immagini della schermata di benvenuto)
- `fonts/` (font web locali WOFF2 e `fonts.css`)
- `README.md` (documentazione del progetto)

1. Crea un nuovo repository su GitHub.
2. Carica tutti i file indicati nel tuo repository.
3. Vai alle impostazioni del repository (**Settings → Pages**).
4. Sotto **Build and deployment**, seleziona **Deploy from a branch**, scegli il ramo `main` (o `master`) e la cartella `/ (root)`, quindi clicca su **Save**.
5. In pochi minuti, il tuo santuario di lettura sarà disponibile globalmente su `https://<username>.github.io/<repository-name>/`.

## 🔒 La Privacy Prima di Tutto (Privacy First)

- **Dati 100% Locali e Modalità Offline Rigorosa:** Diavasma non raccoglie, memorizza o trasmette alcun dato personale, cronologia di lettura o contenuto dei file a server esterni. Tutti i libri, le note e le statistiche risiedono esclusivamente sul dispositivo (`localStorage` e `IndexedDB`). Include una **Modalità Offline Rigorosa** (zero richieste esterne) e un pulsante per cancellare tutti i dati locali.
- **Font e Risorse Locali:** Tutte le tipografie, i generatori audio e i motori di lettura (incluso PDF.js) funzionano localmente senza contattare server esterni come Google Fonts.
- **Nota sulle Pagine Web:** La funzione «Recupera da URL» utilizza proxy CORS pubblici per aggirare le restrizioni del browser. Per una privacy totale e l'uso offline, preferisci **«Incolla HTML (Ctrl+U)»** o importa file locali.

[↑ Torna alla selezione lingua](#languages)

---

<a id="lang-ko"></a>
# Diavasma 📖 (한국어)

> 광고, 추적, 서버 의존 없이 책과 기사를 정리하고 집중해서 읽을 수 있는 조용하고 100% 오프라인 독서 안식처입니다.

## ✨ 주요 기능

- **📚 다양한 포맷 지원 및 정리:** EPUB, PDF(지능형 줄바꿈 정리 및 IndexedDB 기반 페이지네이션 캐시를 갖춘 오프라인 텍스트 재배치 엔진), Markdown(`.md`), 일반 텍스트(`.txt`) 오프라인 독서 지원. `+` 모달을 통해 도서, 기사, 사용자 정의 컬렉션 그룹으로 신속하게 정리할 수 있습니다.
- **🌐 URL 기사 가져오기 & 사용자 지정 선택기:** 웹 링크 기사 스마트 추출, 사이트별 CSS 스크레이퍼 규칙(JSON 가져오기/내보내기 지원), 원시 HTML 소스 코드 직접 붙여넣기(`Ctrl+U`), 오프라인 사이트 아이콘(파비콘) 자동 다운로드.
- **⚡ 100% 오프라인 PWA (Progressive Web App):** 인터넷 연결 없이 완벽하게 작동합니다. 서비스 워커 사전 캐싱 및 깜빡임 없는 분위기 있는 웰컴 화면(라이트/다크, 데스크톱/모바일)을 제공하여 브라우저에서 독립된 독립형 앱으로 설치 가능합니다.
- **🎨 6가지 감성 테마 & 로컬 글꼴 탑재:** Paper, Warm, Sage, Slate, Night, AMOLED 테마 제공. 고품질 로컬 글꼴(`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`) 탑재, 커스텀 글꼴(`.ttf`, `.otf`, `.woff`, `.woff2`) 업로드, 텍스트 정렬, 줄 간격 및 1면/2면 보기 설정 지원.
- **🎧 음악 및 앰비언트 사운드스케이프:** 내장 Winamp 스타일 오디오 플레이어(IndexedDB 재생목록, 셔플, 3가지 반복 모드, 탐색 막대, 모바일 볼륨 조절기) 및 6가지 절차적 사운드스케이프(빗소리, 벽난로, 파도, 숲과 바람, 도서관과 바이닐, 딥 브라운 노이즈) 탑재, 화면이 꺼져도 백그라운드 재생 지속.
- **🗣️ 음성 읽어주기 (TTS) & 메모:** 화면 꺼짐 상태에서도 백그라운드 재생을 지원하는 실시간 문장 하이라이트 TTS. 3가지 색상 하이라이트, 메모 작성, Markdown 내보내기, 선택 텍스트 번역 및 인용구 카드(Quote Share Cards) 생성.
- **⏱️ 포모도로 타이머 & 독서 통계:** 휴식 시간 모래시계 화면보호기가 포함된 집중 타이머, GitHub 스타일 활동 잔디 히트맵 및 이미지 공유 카드를 지원하는 로컬 독서 통계.
- **🔄 전체 로컬 백업 & 복원 (JSON):** 전체 라이브러리, 본문 텍스트, 메모, 통계, 규칙 및 설정을 단일 `.json` 파일로 안전하게 백업 및 복원.
- **✨ Sanctuary 독서 편의 기능:** 실수로 페이지가 넘어가지 않도록 보호하는 인터랙티브 하이라이트 팝오버(`#highlightPopover`), "이어서 읽기" 카드(`#continueReadingCard`), 깔끔한 3단 메뉴(`⋯`), Web Share Target 지원.
- **🌍 15개 언어 지원:** 한국어, 그리스어, 영어, 스페인어, 프랑스어, 독일어, 러시아어, 중국어 간체, 일본어, 힌디어, 포르투갈어, 이탈리아어, 폴란드어, 튀르키예어, 인도네시아어 15개 국어 완벽 로컬라이제이션.

## 🚀 앱 설치 안내 (PWA)

1. 최신 웹 브라우저(Chrome, Edge, Safari, Brave 등)에서 `index.html`(또는 GitHub Pages URL)을 엽니다.
2. 주소창의 **«앱 설치»** 아이콘을 클릭하거나 메뉴 **(⋯) → Diavasma 설치**를 선택합니다.
3. **iOS (Safari)**: **공유(Share)** 버튼 → **«홈 화면에 추가»(Add to Home Screen)**를 선택합니다.

## 🌐 GitHub Pages 배포 안내

GitHub Pages에 배포하려면 다음 저장소 파일들을 업로드하세요:

- `index.html` (메인 애플리케이션 구조 및 리더 UI)
- `manifest.json` (PWA 구성 및 메타데이터)
- `sw.js` (오프라인 기능 및 캐싱을 위한 서비스 워커)
- `css/` (`styles.css` - 반응형 스타일시트)
- `js/` (`boot.js`, `i18n.js`, `app.js` - 부트스트랩, 15개 언어 사전 및 핵심 로직)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - 자체 호스팅 오프라인 PDF 엔진)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - 앱 아이콘)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - 웰컴 화면 배경)
- `fonts/` (로컬 WOFF2 웹폰트 및 `fonts.css`)
- `README.md` (프로젝트 문서)

1. GitHub에서 새 저장소를 생성합니다.
2. 해당 파일들을 저장소에 업로드합니다.
3. 저장소 설정(**Settings → Pages**)으로 이동합니다.
4. **Build and deployment**에서 **Deploy from a branch**를 선택하고, `main` 브랜치 및 `/ (root)` 폴더를 지정한 후 **Save**를 누릅니다.
5. 몇 분 내에 나만의 온라인 독서 공간이 완성됩니다.

## 🔒 개인정보 보호 (Privacy First)

- **100% 로컬 데이터 & 엄격한 오프라인 모드:** Diavasma는 어떠한 개인정보, 독서 기록, 파일 내용도 외부 서버로 전송하지 않습니다. 모든 책, 메모, 통계는 기기의 `localStorage` 및 `IndexedDB`에 안전하게 보관됩니다. 외부 요청을 일체 차단하는 **엄격한 오프라인 모드** 및 원클릭 데이터 삭제 기능을 지원합니다.
- **자체 호스팅 폰트 및 리소스:** 모든 폰트와 오디오, PDF 엔진은 로컬에서 로드되며 Google Fonts 등의 외부 서버 요청이 발생하지 않습니다.
- **웹 링크 관련 안내:** "URL에서 가져오기" 기능은 브라우저 제약을 우회하기 위해 공개 CORS 프록시를 사용합니다. 100% 프라이버시를 원할 경우 **«HTML 붙여넣기 (Ctrl+U)»** 또는 로컬 파일 가져오기를 권장합니다.

[↑ 언어 선택으로 돌아가기](#languages)

---

<a id="lang-pl"></a>
# Diavasma 📖 (Polski)

> Ciche, w 100% działające offline sanktuarium do czytania, nauki i organizacji książek oraz artykułów — bez reklam, bez śledzenia i bez zależności od serwerów.

## ✨ Kluczowe Funkcje

- **📚 Obsługa Wielu Formatów i Organizacja:** Natywne czytanie offline dla formatów EPUB, PDF (lokalny silnik reflow z inteligentnym oczyszczaniem podziałów wierszy i trwałą pamięcią podręczną paginacji w IndexedDB), Markdown (`.md`) oraz zwykłego tekstu (`.txt`). Organizuj pozycje w grupy (Książki, Artykuły, własne kolekcje) za pomocą błyskawicznego modala importu `+`.
- **🌐 Artykuły z URL i Własne Selektory:** Inteligentne wyodrębnianie artykułów ze stron internetowych, własne reguły selektorów CSS dla witryn (z importem/eksportem JSON), wklejanie surowego kodu źródłowego HTML (`Ctrl+U`) i automatyczne pobieranie favicon do trybu offline.
- **⚡ PWA w 100% Offline (Progressive Web App):** Pełna funkcjonalność bez połączenia z siecią. Możliwość instalacji jako samodzielna aplikacja na urządzeniach z systemem Android, iOS, Windows oraz macOS, ze stabilnym buforowaniem przez Service Worker i nastrojowym ekranem powitalnym (jasny/ciemny, desktop/mobile).
- **🎨 6 Dopracowanych Motywów i Lokalne Czcionki:** Motywy Papier (Paper), Ciepły (Warm), Szałwia (Sage), Łupek (Slate), Noc (Night) i AMOLED. Zestaw wbudowanych czcionek (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), obsługa własnych czcionek (`.ttf`, `.otf`, `.woff`, `.woff2`), wyrównanie tekstu, regulacja interlinii oraz widok 1 lub 2 stron.
- **🎧 Muzyka i Pejzaże Dźwiękowe:** Zintegrowany mini odtwarzacz audio w stylu Winampa (trwała playlista w IndexedDB, odtwarzanie losowe, 3 tryby pętli, pasek postępu, suwak głośności dla urządzeń mobilnych) oraz 6 proceduralnych pejzaży dźwiękowych Web Audio (Deszcz, Kominek, Fale oceanu, Las i wiatr, Biblioteka i winyl, Głęboki brązowy szum) z odtwarzaniem w tle przy wyłączonym ekranie.
- **🗣️ Czytanie na Głos (TTS) i Notatki:** Czytanie tekstu na głos z podświetlaniem bieżącego zdania i pracą w tle. 3 kolory wyróżnień, notatki, eksport do Markdown, natychmiastowe tłumaczenie zaznaczonego tekstu oraz generator kart cytatów (Quote Share Cards) zachowujących typografię czytnika.
- **⏱️ Pomodoro i Statystyki Czytania:** Czasomierz skupienia z animowanym wygaszaczem klepsydry podczas przerw, lokalny rejestr nawyków z wykresem aktywności w stylu GitHub i kartami statystyk gotowymi do udostępnienia.
- **🔄 Kompletna Kopia Zapasowa i Przywracanie (JSON):** Bezpieczny eksport i import całej biblioteki (wraz z pełnymi tekstami w IndexedDB), notatek, wyróżnień, statystyk, reguł i ustawień w jednym pliku `.json`.
- **✨ Udoskonalenia Trybu Sanctuary:** Interaktywny popover wyróżnień (`#highlightPopover`) zapobiegający przypadkowym zmianom stron przy edycji notatek, karta "Kontynuuj czytanie" (`#continueReadingCard`), czyste menu opcji (`⋯`) oraz obsługa Web Share Target.
- **🌍 15 Języków:** Interfejs użytkownika w pełni przetłumaczony na 15 języków: angielski, grecki, chiński uproszczony, francuski, niemiecki, hindi, indonezyjski, włoski, japoński, koreański, polski, portugalski, rosyjski, hiszpański oraz turecki.

## 🚀 Instalacja Aplikacji (PWA)

1. Otwórz `index.html` (lub adres wdrożenia na GitHub Pages) w nowoczesnej przeglądarce (Chrome, Edge, Safari, Brave, Firefox).
2. Kliknij ikonę **«Zainstaluj aplikację»** na pasku adresu lub wybierz w menu **(⋯) → Zainstaluj Diavasma**.
3. Na systemie **iOS (Safari)**: Dotknij przycisku **Udostępnij (Share)** → wybierz **«Do ekranu początkowego» (Add to Home Screen)**.

## 🌐 Hosting na GitHub Pages

Aby uruchomić własną instalację na GitHub Pages, prześlij pliki repozytorium:

- `index.html` (główna struktura aplikacji i interfejs czytnika)
- `manifest.json` (konfiguracja i metadane PWA)
- `sw.js` (Service Worker do pracy offline i buforowania)
- `css/` (`styles.css` - kompletny responsywny arkusz stylów)
- `js/` (`boot.js`, `i18n.js`, `app.js` - rozruch, słownik 15 języków i logika aplikacji)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - lokalny silnik PDF)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - ikony aplikacji)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - obrazy tła)
- `fonts/` (lokalne czcionki WOFF2 i plik `fonts.css`)
- `README.md` (dokumentacja projektu)

1. Utwórz nowe repozytorium na GitHubie.
2. Prześlij wszystkie powyższe pliki.
3. Otwórz ustawienia repozytorium (**Settings → Pages**).
4. W sekcji **Build and deployment** wybierz **Deploy from a branch**, ustaw gałąź `main` (lub `master`) oraz katalog `/ (root)`, a następnie kliknij **Save**.
5. Po chwili Twoja przestrzeń do czytania będzie dostępna pod adresem `https://<username>.github.io/<repository-name>/`.

## 🔒 Prywatność na Pierwszym Miejscu (Privacy First)

- **100% Danych Lokalnie i Ścisły Tryb Offline:** Diavasma nie gromadzi, nie zapisuje ani nie przesyła żadnych danych osobowych, historii czytania czy treści plików na serwery zewnętrzne. Wszystkie książki, notatki i statystyki pozostają wyłącznie na Twoim urządzeniu (`localStorage` i `IndexedDB`). Dostępny jest **Ścisły Tryb Offline** (całkowity brak zapytań sieciowych) oraz opcja wyczyszczenia wszystkich danych lokalnych.
- **Własne Czcionki i Zasoby:** Wszelkie kroje pisma, syntezatory dźwięku i silniki renderowania działają lokalnie bez odwołań do Google Fonts czy innych podmiotów trzecich.
- **Uwaga dotycząca Łączy Web:** Opcja «Pobierz z URL» korzysta z publicznych proxy CORS w celu ominięcia ograniczeń przeglądarki. Aby zachować 100% prywatności offline, użyj **«Wklej HTML (Ctrl+U)»** lub plików lokalnych.

[↑ Powrót do wyboru języka](#languages)

---

<a id="lang-tr"></a>
# Diavasma 📖 (Türkçe)

> Kitaplar ve makaleler için dikkatsiz, reklamsız, izleyicisiz ve sunucu bağımlılığı olmayan, %100 çevrimdışı sessiz bir okuma ve çalışma alanı.

## ✨ Temel Özellikler

- **📚 Çoklu Format Desteği ve Düzenleme:** EPUB, PDF (akıllı satır sonu temizleme ve IndexedDB sayfalandırma önbelleğine sahip çevrimdışı yeniden akış motoru), Markdown (`.md`) ve düz metin (`.txt`) için yerel çevrimdışı okuma. Hızlı içe aktarma modali `+` ile okumalarınızı gruplar (Kitaplar, Makaleler, özel koleksiyonlar) halinde düzenleyin.
- **🌐 URL'den Makale ve Özel Seçiciler:** Web bağlantılarından akıllı makale çıkarma, siteye özel CSS kazıma kuralları (JSON içe/dışa aktarma özellikli), doğrudan ham HTML kaynak kodu yapıştırma (`Ctrl+U`) ve otomatik çevrimdışı site simgesi (favicon) alma.
- **⚡ %100 Çevrimdışı PWA (Progressive Web App):** İnternet bağlantısı olmadan eksiksiz çalışır. Service Worker önbelleğe alması ve kesintisiz açılış ekranı (Açık/Koyu, Masaüstü/Mobil) sayesinde Android, iOS, Windows ve macOS cihazlarda bağımsız bir uygulama olarak yüklenebilir.
- **🎨 6 Özel Tema ve Yerel Tipografi:** Kağıt (Paper), Sıcak (Warm), Adaçayı (Sage), Arduvaz (Slate), Gece (Night) ve AMOLED temaları. Yerel yazı tipleri (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), özel font yükleme (`.ttf`, `.otf`, `.woff`, `.woff2`), metin hizalama, satır yüksekliği ve 1 veya 2 sayfa görünümü desteği.
- **🎧 Müzik ve Ortam Sesleri:** Entegre Winamp tarzı mini müzik çalar (IndexedDB kalıcı çalma listesi, karışık çalma, 3 modlu döngü, arama çubuğu ve mobil ses kontrolü) ve ekran kapalıyken arka planda çalabilen 6 prosedürel Web Audio ortam sesi (Yağmur, Şömine, Okyanus dalgaları, Orman ve rüzgar, Kütüphane ve plak cızırtısı, Derin kahverengi gürültü).
- **🗣️ Sesli Okuma (TTS) ve Notlar:** Canlı cümle vurgulama ve ekran kapalıyken arka planda oynatma özellikli sesli okuma. 3 renkte vurgulama, ders notları, Markdown dışa aktarma, anında metin çevirisi ve okuyucu tipografisini benimseyen paylaşılabilir alıntı kartları (Quote Share Cards).
- **⏱️ Pomodoro ve Okuma İstatistikleri:** Molalarda hareketli kum saati ekran koruyuculu odaklanma zamanlayıcısı, GitHub tarzı aktivite ısı haritası ve paylaşılabilir istatistik kartları içeren yerel alışkanlık takipçisi.
- **🔄 Tam Yerel Yedekleme ve Geri Yükleme (JSON):** Tüm kütüphaneyi (IndexedDB'deki tam metinler dahil), notları, vurguları, istatistikleri, kuralları ve ayarları tek bir `.json` dosyasında dışa aktarma ve geri yükleme.
- **✨ Sanctuary Okuma Geliştirmeleri:** Sayfa geçişlerini koruyan etkileşimli vurgu popover'ı (`#highlightPopover`), "Okumaya Devam Et" kartı (`#continueReadingCard`), sade 3 nokta menüsü (`⋯`) ve Web Share Target desteği.
- **🌍 15 Dil:** Türkçe, Yunanca, İngilizce, İspanyolca, Fransızca, Almanca, Rusça, Basitleştirilmiş Çince, Japonca, Hintçe, Portekizce, İtalyanca, Korece, Lehçe ve Endonezce olmak üzere 15 dilde eksiksiz yerel kullanıcı arayüzü.

## 🚀 Uygulama Olarak Yükleme (PWA)

1. Modern bir web tarayıcısında (Chrome, Edge, Safari, Brave, Firefox) `index.html` dosyasını (veya GitHub Pages adresinizi) açın.
2. Adres çubuğundaki **«Uygulamayı Yükle»** simgesine tıklayın veya menüden **(⋯) → Diavasma'yı Yükle** seçeneğini seçin.
3. **iOS (Safari)** üzerinde: **Paylaş (Share)** düğmesine dokunun → **«Ana Ekrana Ekle» (Add to Home Screen)** seçeneğini seçin.

## 🌐 GitHub Pages Üzerinde Barındırma

Kendi kütüphanenizi GitHub Pages üzerinde çalıştırmak için tüm proje dosyalarını yükleyin:

- `index.html` (ana uygulama yapısı ve okuyucu arayüzü)
- `manifest.json` (PWA yapılandırması ve meta verileri)
- `sw.js` (çevrimdışı çalışma ve önbellekleme için Service Worker)
- `css/` (`styles.css` - duyarlı stil dosyası)
- `js/` (`boot.js`, `i18n.js`, `app.js` - güvenli önyükleme, 15 dil sözlüğü ve uygulama mantığı)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - yerel PDF motoru)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - uygulama simgeleri)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - karşılama ekranı görselleri)
- `fonts/` (yerel WOFF2 yazı tipleri ve `fonts.css`)
- `README.md` (proje dokümantasyonu)

1. GitHub'da yeni bir depo (repository) oluşturun.
2. İlgili dosyaları depoya yükleyin.
3. Depo ayarlarına (**Settings → Pages**) gidin.
4. **Build and deployment** altında **Deploy from a branch** seçeneğini belirleyin, `main` dalını ve `/ (root)` dizinini seçerek **Save** düğmesine tıklayın.
5. Birkaç dakika içinde okuma alanınız `https://<kullanıcı-adınız>.github.io/<depo-adı>/` adresinde yayına girecektir.

## 🔒 Önce Gizlilik (Privacy First)

- **%100 Yerel Veri ve Katı Çevrimdışı Modu:** Diavasma hiçbir kişisel veriyi, okuma geçmişini veya dosya içeriğini harici sunuculara göndermez. Tüm kitaplar, notlar ve istatistikler yalnızca cihazınızda (`localStorage` ve `IndexedDB`) saklanır. Dış bağlantıları tamamen engelleyen **Katı Çevrimdışı Modu** ve tek tıkla tüm verileri temizleme özelliği mevcuttur.
- **Yerel Yazı Tipleri ve Kaynaklar:** Tüm yazı tipleri, ses üreteçleri ve okuma motorları yerel olarak çalıştırılır; Google Fonts gibi üçüncü taraf sunuculara bağlanmaz.
- **Web Bağlantıları Bildirimi:** "URL'den Al" özelliği, tarayıcı kısıtlamalarını aşmak için genel CORS proxy sunucularını kullanır. %100 gizlilik için **«HTML Yapıştır (Ctrl+U)»** yöntemini veya yerel dosyaları tercih edin.

[↑ Dil seçimine dön](#languages)

---

<a id="lang-id"></a>
# Diavasma 📖 (Bahasa Indonesia)

> Suaka membaca yang tenang, 100% offline, untuk belajar dan mengelola buku serta artikel — tanpa iklan, tanpa pelacakan, dan tanpa ketergantungan server.

## ✨ Fitur Utama

- **📚 Dukungan Multi-Format & Organisasi:** Membaca offline untuk EPUB, PDF (mesin reflow offline dengan pembersihan jeda baris cerdas dan cache penomoran halaman persisten di IndexedDB), Markdown (`.md`), dan teks biasa (`.txt`). Atur bacaan ke dalam grup (Buku, Artikel, koleksi kustom) melalui modal impor cepat `+`.
- **🌐 Artikel dari URL & Selektor Kustom:** Ekstraksi artikel web pintar, aturan scraper CSS kustom per situs (dengan impor/ekspor JSON), tempel kode sumber HTML mentah (`Ctrl+U`), dan pengambilan favicon situs secara offline.
- **⚡ PWA 100% Offline (Progressive Web App):** Berfungsi penuh tanpa koneksi internet. Dapat diinstal sebagai aplikasi mandiri di Android, iOS, Windows, dan macOS melalui peramban modern, dilengkapi precaching Service Worker yang tangguh dan layar pembuka tanpa kedip (Terang/Gelap, Desktop/Seluler).
- **🎨 6 Tema Pilihan & Tipografi Lokal:** Tema Kertas (Paper), Hangat (Warm), Sage, Batu Tulis (Slate), Malam (Night), dan AMOLED. Termasuk font bawaan (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), unggah font kustom (`.ttf`, `.otf`, `.woff`, `.woff2`), perataan teks, jarak antarbaris, dan tampilan 1 atau 2 halaman.
- **🎧 Musik & Lanskap Suara:** Pemutar audio mini terintegrasi bergaya Winamp (daftar putar persisten di IndexedDB, acak lagu, 3 mode pengulangan, bilah pencarian, kontrol volume seluler) dan 6 lanskap suara prosedural Web Audio (Hujan, Perapian, Ombak laut, Hutan & angin, Perpustakaan & piringan hitam, Derau cokelat dalam) dengan pemutaran latar belakang saat layar mati.
- **🗣️ Baca Nyaring (TTS) & Catatan:** Pembacaan suara nyaring dengan penyorotan kalimat waktu nyata dan pemutaran latar belakang. Sorotan 3 warna, catatan belajar, ekspor Markdown, terjemahan instan teks yang dipilih, dan pembuatan kartu kutipan yang dapat dibagikan (Quote Share Cards).
- **⏱️ Timer Pomodoro & Statistik Membaca:** Timer fokus dengan screensaver animasi jam pasir saat istirahat, pelacak kebiasaan membaca lokal dengan peta panas aktivitas gaya GitHub, dan kartu statistik yang dapat dibagikan.
- **🔄 Cadangan & Pemulihan Lokal Penuh (JSON):** Ekspor dan pemulihan seluruh perpustakaan (termasuk teks lengkap dari IndexedDB), catatan, sorotan, statistik, aturan, dan pengaturan dalam satu file `.json`.
- **✨ Penyempurnaan Membaca Sanctuary:** Popover sorotan interaktif (`#highlightPopover`) untuk mengedit catatan tanpa salah membalik halaman; kartu "Lanjutkan Membaca" (`#continueReadingCard`); menu ringkas 3 titik (`⋯`); dan dukungan Web Share Target.
- **🌍 15 Bahasa:** Antarmuka pengguna diterjemahkan secara native dalam 15 bahasa: Indonesia, Inggris, Yunani, Spanyol, Prancis, Jerman, Rusia, Mandarin Sederhana, Jepang, Hindi, Portugis, Italia, Korea, Polandia, dan Turki.

## 🚀 Instalasi sebagai Aplikasi (PWA)

1. Buka `index.html` (atau URL GitHub Pages Anda) di peramban modern (Chrome, Edge, Safari, Brave, Firefox).
2. Klik ikon **«Instal Aplikasi»** di bilah alamat atau pilih menu **(⋯) → Instal Diavasma**.
3. Di **iOS (Safari)**: Ketuk tombol **Bagikan (Share)** → pilih **«Tambahkan ke Layar Utama» (Add to Home Screen)**.

## 🌐 Hosting di GitHub Pages

Untuk menjalankan instans Anda di GitHub Pages, unggah seluruh file repositori:

- `index.html` (struktur utama aplikasi dan antarmuka pembaca)
- `manifest.json` (konfigurasi dan metadata PWA)
- `sw.js` (Service Worker untuk fungsi offline dan caching)
- `css/` (`styles.css` - stylesheet responsif lengkap)
- `js/` (`boot.js`, `i18n.js`, `app.js` - boot aman, kamus 15 bahasa, dan logika aplikasi)
- `libs/` (`pdf.min.js`, `pdf.worker.min.js` - mesin PDF offline lokal)
- `assets/icons/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` - ikon aplikasi)
- `assets/images/` (`DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` - gambar latar layar pembuka)
- `fonts/` (font web WOFF2 lokal dan `fonts.css`)
- `README.md` (dokumentasi proyek)

1. Buat repositori baru di GitHub.
2. Unggah file-file di atas ke repositori Anda.
3. Buka pengaturan repositori (**Settings → Pages**).
4. Di bagian **Build and deployment**, pilih **Deploy from a branch**, pilih cabang `main` (atau `master`) dan folder `/ (root)`, lalu klik **Save**.
5. Dalam beberapa menit, aplikasi membaca Anda akan aktif dan dapat diakses di `https://<username>.github.io/<repository-name>/`.

## 🔒 Privasi Utama (Privacy First)

- **100% Data Lokal & Mode Offline Ketat:** Diavasma tidak mengumpulkan, menyimpan, atau mengirimkan data pribadi, riwayat membaca, atau konten file ke server eksternal. Semua buku, catatan, dan statistik tersimpan secara eksklusif di perangkat Anda (`localStorage` dan `IndexedDB`). Dilengkapi dengan **Mode Offline Ketat** (nol permintaan eksternal) dan tombol hapus semua data lokal.
- **Font & Sumber Daya Lokal:** Semua tipografi, generator audio, dan mesin pembaca berjalan secara lokal tanpa menghubungi server pihak ketiga seperti Google Fonts.
- **Catatan Tautan Web:** Fitur "Ambil dari URL" menggunakan proksi CORS publik untuk melewati batasan peramban. Untuk privasi offline 100%, gunakan **«Tempel HTML (Ctrl+U)»** atau impor file lokal.

[↑ Kembali ke pilihan bahasa](#languages)

---
