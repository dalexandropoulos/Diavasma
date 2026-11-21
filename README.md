<a id="languages"></a>

# Diavasma 📖


> A quiet, 100% offline reading sanctuary, study space, and organizer for books & articles — no ads, no tracking, zero server dependencies.


> Ένας ήσυχος, 100% offline χώρος ανάγνωσης, συγκέντρωσης και οργάνωσης βιβλίων & άρθρων — χωρίς διαφημίσεις, χωρίς παρακολούθηση (tracking), χωρίς εξαρτήσεις από servers.


---

### 🌍 Languages / Γλώσσες / 语言 / Langues / Sprachen / भाषाएँ / 言語 / Idiomas / Языки

[🇬🇧 English](#lang-en) · [🇬🇷 Ελληνικά](#lang-el) · [🇨🇳 简体中文](#lang-zh) · [🇫🇷 Français](#lang-fr) · [🇩🇪 Deutsch](#lang-de) · [🇮🇳 हिन्दी](#lang-hi) · [🇯🇵 日本語](#lang-ja) · [🇵🇹 Português](#lang-pt) · [🇷🇺 Русский](#lang-ru) · [🇪🇸 Español](#lang-es)

---


<a id="lang-en"></a>
# Diavasma 📖 (English)

> A quiet, 100% offline reading sanctuary, study space, and organizer for books & articles — no ads, no tracking, zero server dependencies.

## ✨ Key Features

- **📚 Multi-Format Support & Organization:** Native offline reading for EPUB, PDF (offline reflow engine with smart line break cleanup & persistent IndexedDB pagination cache), Markdown (`.md`), plain text (`.txt`), and audio files. Organize items into groups (Books, Articles, custom collections) with an instant contextual `+` import modal.
- **🌐 Articles from URL & Custom Selectors:** Smart article extraction from web links, site-specific custom CSS scraper rules (with JSON import/export), raw HTML source pasting (`Ctrl+U`), and automated offline site icon (favicon) grabbing.
- **⚡ 100% Offline PWA (Progressive Web App):** Fully functional without an internet connection. Installable as a standalone app on Android, iOS, Windows, and macOS via modern web browsers, featuring robust Service Worker precaching and a zero-flash welcome screen (Light/Dark, Desktop/Mobile).
- **🎨 6 Curated Themes & Self-Hosted Typography:** Paper, Warm, Sage, Slate, Night, and AMOLED themes. Includes locally bundled typefaces (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), support for custom font uploads (`.ttf`, `.otf`, `.woff`, `.woff2`), text alignment (Left, Center, Right, Justify), customizable line height, and 1 or 2 page spread view.
- **🎧 Music & Ambient Soundscapes:** Built-in Winamp-style mini audio player (persistent IndexedDB playlist, shuffle, 3-state loop, seek bar, and mobile volume control) alongside 6 procedural Web Audio soundscapes (Rain, Fireplace, Ocean Waves, Forest & Wind, Library & Vinyl, Deep Noise) with lock-screen background playback support.
- **🗣️ Text-to-Speech (TTS) & Notes:** Voice narration with sentence-level highlight synchronization and background audio playback. Highlight text in 3 distinct colors, take notes, export to Markdown, translate selected words instantly, and create adaptive Quote Share Cards that inherit reader typography.
- **⏱️ Pomodoro & Reading Habit Stats:** Focus timer with an animated hourglass screensaver during breaks, local reading habit tracker with a GitHub-style activity heatmap, and exportable Stats Share Cards.
- **🌍 10 Languages:** Comprehensive, native UI localization in English, Greek, Chinese (Simplified), French, German, Hindi, Japanese, Portuguese, Russian, and Spanish.

## 🚀 Installation as an App (PWA)

1. Open `index.html` (or your GitHub Pages deployment URL) in a modern browser (Chrome, Edge, Safari, Brave, Firefox).
2. Click the **"Install App"** icon in the address bar, or open the browser menu **(⋯) → Install Diavasma**.
3. On **iOS (Safari)**: Tap the **Share** button → select **"Add to Home Screen"**.

## 🌐 Hosting on GitHub Pages

To host your own private or public instance on GitHub Pages, upload all the repository files:

- `index.html` & `Diavasma.html` (application shell & reader interface)
- `styles.css` (complete responsive stylesheet)
- `i18n.js` (complete 10-language localization dictionary)
- `app.js` (core application logic, storage, audio & paginator)
- `sw.js` (Service Worker for offline precaching & caching strategy)
- `manifest.json` (PWA configuration & metadata)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (app icons)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (welcome screen artwork)
- `pdf.min.js` & `pdf.worker.min.js` (self-hosted offline PDF engine)
- `fonts/` (self-hosted WOFF2 web fonts & `fonts.css`)
- `README.md` (project documentation)

1. Create a new repository on GitHub.
2. Push or upload all listed files to your repository.
3. Go to repository **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose the `main` (or `master`) branch and `/ (root)` folder, then click **Save**.
5. Within minutes, your reading room will be live and installable worldwide at `https://<username>.github.io/<repository-name>/`.

## 🔒 Privacy First

- **100% Local Data:** Diavasma does not collect, store, or transmit any personal information, browsing history, or book content to external servers. All library items, annotations, notes, and reading statistics remain strictly on your device inside `localStorage` and `IndexedDB`.
- **Self-Hosted Fonts & Assets:** All typography, sound generators, and reader engines (including PDF.js) are self-hosted within the app. Zero network requests are made to third-party CDNs like Google Fonts, preserving your IP address and client identity.
- **Notice on URL Fetching:** The "Fetch from URL" feature relies on public CORS proxies to bypass browser cross-origin boundaries when fetching remote web pages. For 100% guaranteed offline privacy without transmitting URL queries across the network, use **"Paste HTML (Ctrl+U)"** or import local files (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Back to languages](#languages)

---

<a id="lang-el"></a>
# Diavasma 📖 (Ελληνικά)

> Ένας ήσυχος, 100% offline χώρος ανάγνωσης, συγκέντρωσης και οργάνωσης βιβλίων & άρθρων — χωρίς διαφημίσεις, χωρίς παρακολούθηση (tracking), χωρίς εξαρτήσεις από servers.

## ✨ Κύρια Χαρακτηριστικά (Features)

- **📚 Υποστήριξη Πολλαπλών Μορφών & Οργάνωση:** Αυτόνομη offline ανάγνωση για EPUB, PDF (offline reflow engine με έξυπνο καθαρισμό αλλαγών γραμμής & μόνιμη IndexedDB pagination cache), Markdown (`.md`), απλό κείμενο (`.txt`) και αρχεία ήχου. Οργάνωση σε ομάδες (Βιβλία, Άρθρα, προσαρμοσμένες ομάδες) με άμεσο contextual `+` import modal.
- **🌐 Άρθρα από URL & Custom Selectors:** Έξυπνη εξαγωγή άρθρων από συνδέσμους, εξειδικευμένοι κανόνες CSS scraper ανά ιστοσελίδα (με δυνατότητα εξαγωγής/εισαγωγής JSON), υποστήριξη επικόλλησης πηγαίου κώδικα HTML (`Ctrl+U`) και αυτόματο offline grab του favicon του site.
- **⚡ 100% Offline PWA (Progressive Web App):** Πλήρως λειτουργικό χωρίς σύνδεση στο διαδίκτυο. Εγκαθίσταται ως αυτόνομη εφαρμογή σε Android, iOS, Windows και macOS μέσω του browser, με ανθεκτικό Service Worker precaching και zero-flash οθόνη καλωσορίσματος (Light/Dark, Desktop/Mobile).
- **🎨 6 Επιμελημένα Θέματα & Self-hosted Τυπογραφία:** Χαρτί (Paper), Θερμό (Warm), Φασκόμηλο (Sage), Σχιστόλιθος (Slate), Νύχτα (Night) και AMOLED. Περιλαμβάνει τοπικά ενσωματωμένες γραμματοσειρές (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), ανέβασμα custom fonts (`.ttf`, `.otf`, `.woff`, `.woff2`), στοίχιση (Αριστερά, Κέντρο, Δεξιά, Πλήρης), διάστιχο και προβολή 1 ή 2 σελίδων.
- **🎧 Μουσική & Ηχοτοπία:** Ενσωματωμένος Winamp-style mini audio player (μόνιμη λίστα κομματιών στην IndexedDB, shuffle, 3-state loop, μπάρα πλοήγησης και έλεγχος έντασης στα κινητά) μαζί με 6 procedural Web Audio ηχοτοπία (Βροχή, Τζάκι, Κύματα θάλασσας, Δάσος & άνεμος, Βιβλιοθήκη & βινύλιο, Βαθύς θόρυβος) με δυνατότητα αναπαραγωγής στο παρασκήνιο με κλειστή οθόνη.
- **🗣️ Εκφώνηση (TTS) & Σημειώσεις:** Φωνητική ανάγνωση με ζωντανή επισήμανση πρότασης και background playback. Υπογραμμίσεις σε 3 χρώματα, σημειώσεις, εξαγωγή σε Markdown, άμεση μετάφραση επιλεγμένου κειμένου και δημιουργία Quote Share Cards που κληρονομούν την τυπογραφία του αναγνωστηρίου.
- **⏱️ Pomodoro & Στατιστικά Ανάγνωσης:** Χρονόμετρο εστίασης με δυναμικό screensaver κλεψύδρας κατά τα διαλείμματα, τοπικό habit tracker με activity heatmap τύπου GitHub και εξαγώγιμες Stats Share Cards.
- **🌍 10 Γλώσσες:** Πλήρες περιβάλλον χρήσης μεταφρασμένο σε Αγγλικά, Ελληνικά, Κινεζικά (Απλοποιημένα), Γαλλικά, Γερμανικά, Χίντι, Ιαπωνικά, Πορτογαλικά, Ρωσικά και Ισπανικά.

## 🚀 Εγκατάσταση ως Εφαρμογή (PWA)

1. Ανοίξτε το `index.html` (ή το URL σας στο GitHub Pages) σε έναν σύγχρονο browser (Chrome, Edge, Safari, Brave, Firefox).
2. Πατήστε το εικονίδιο **«Εγκατάσταση εφαρμογής»** στη γραμμή διευθύνσεων ή από το μενού του browser **(⋯) → Εγκατάσταση Diavasma**.
3. Στο **iOS (Safari)**: Πατήστε το κουμπί **Κοινοποίηση (Share)** → επιλέξτε **«Προσθήκη στην οθόνη αφετηρίας» (Add to Home Screen)**.

## 🌐 Φιλοξενία στο GitHub Pages

Για να φιλοξενήσετε τη δική σας προσωπική ή δημόσια εγκατάσταση στο GitHub Pages, ανεβάστε όλα τα αρχεία του φακέλου:

- `index.html` & `Diavasma.html` (κέλυφος εφαρμογής & διεπαφή ανάγνωσης)
- `styles.css` (πλήρες responsive stylesheet)
- `i18n.js` (πλήρες λεξικό μετάφρασης 10 γλωσσών)
- `app.js` (βασική λογική εφαρμογής, αποθήκευση, ήχος & σελιδοποίηση)
- `sw.js` (Service Worker για ανθεκτική offline λειτουργία & precaching)
- `manifest.json` (ρυθμίσεις & μεταδεδομένα PWA)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (εικονίδια εφαρμογής)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (εικόνες οθόνης καλωσορίσματος)
- `pdf.min.js` & `pdf.worker.min.js` (τοπική μηχανή απόδοσης PDF)
- `fonts/` (τοπικές γραμματοσειρές WOFF2 & `fonts.css`)
- `README.md` (τεκμηρίωση του έργου)

1. Δημιουργήστε ένα νέο αποθετήριο (repository) στο GitHub.
2. Ανεβάστε όλα τα παραπάνω αρχεία στο αποθετήριό σας.
3. Μεταβείτε στις ρυθμίσεις του αποθετηρίου (**Settings → Pages**).
4. Στην ενότητα **Build and deployment**, επιλέξτε **Deploy from a branch**, διαλέξτε το branch `main` (ή `master`) και τον φάκελο `/ (root)`, και πατήστε **Save**.
5. Μέσα σε λίγα λεπτά, η εφαρμογή σας θα είναι διαθέσιμη παγκοσμίως και έτοιμη για εγκατάσταση στο `https://<username>.github.io/<repository-name>/`.

## 🔒 Ιδιωτικότητα (Privacy First)

- **100% Τοπικά Δεδομένα:** Το Diavasma δεν συλλέγει, δεν αποθηκεύει και δεν διαβιβάζει κανένα προσωπικό δεδομένο, ιστορικό ανάγνωσης ή περιεχόμενο αρχείων σε εξωτερικούς διακομιστές. Όλα τα βιβλία, τα κείμενα, οι σημειώσεις και τα στατιστικά παραμένουν αποκλειστικά στη συσκευή σας (`localStorage` & `IndexedDB`).
- **Τοπικές Γραμματοσειρές & Βιβλιοθήκες:** Όλη η τυπογραφία, οι γεννήτριες ήχου και οι μηχανές ανάγνωσης (συμπεριλαμβανομένου του PDF engine) είναι self-hosted. Δεν πραγματοποιείται καμία δικτυακή κλήση σε εξωτερικά CDN όπως το Google Fonts, προστατεύοντας πλήρως την IP διεύθυνση και το απόρρητό σας.
- **Σημείωση για Εξωτερικά URLs:** Η λειτουργία «Λήψη από URL» επικοινωνεί αναγκαστικά με δημόσια CORS proxies για την παράκαμψη των περιορισμών cross-origin των browsers κατά τη λήψη απομακρυσμένων σελίδων. Για απόλυτη, 100% ιδιωτικότητα χωρίς καμία δικτυακή κίνηση, συνιστάται η απευθείας **«Επικόλληση HTML (Ctrl+U)»** ή η εισαγωγή τοπικών αρχείων (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Επιστροφή στις γλώσσες](#languages)

---

<a id="lang-zh"></a>
# Diavasma 📖 (简体中文)

> 一个安静、100% 离线的阅读庇护所、学习空间与图书文章整理工具 —— 无广告、无追踪、零服务器依赖。

## ✨ 核心特性

- **📚 多格式支持与分类整理：** 原生离线阅读 EPUB、PDF（配备智能断行清理与持久 IndexedDB 分页缓存的离线排版引擎）、Markdown (`.md`)、纯文本 (`.txt`) 和音频文件。通过即时上下文 `+` 导入弹窗将内容归类为书籍、文章或自定义分组。
- **🌐 网页文章抓取与自定义选择器：** 从网址智能提取文章内容，支持针对每个网站的自定义 CSS 选择器规则（带 JSON 导入/导出），支持粘贴原始网页源码 (`Ctrl+U`)，并自动离线获取网站图标 (Favicon)。
- **⚡ 100% 离线 PWA (渐进式 Web 应用)：** 无需互联网连接即可完全运行。可通过浏览器在 Android、iOS、Windows 和 macOS 上安装为独立应用程序，具备稳健的 Service Worker 预缓存和零闪烁欢迎屏幕（深浅色/桌面移动端自适应）。
- **🎨 6 种精选主题与本地字体：** 报纸 (Paper)、温和 (Warm)、鼠尾草 (Sage)、板岩 (Slate)、暗夜 (Night) 与 AMOLED 纯黑主题。内置本地字体库 (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`)，支持上传自定义字体 (`.ttf`, `.otf`, `.woff`, `.woff2`)，支持四向对齐（左/中/右/两端）、自定义行高以及单双页跨页排版。
- **🎧 音乐播放与环境音效：** 内置 Winamp 风格的迷你音频播放器（基于 IndexedDB 的持久播放列表、随机播放、三态循环、进度控制与移动端音量调节），以及 6 种 Web Audio 程序化白噪音（雨声、壁炉、海浪、森林微风、图书馆黑胶唱片、深层底噪），支持息屏后台播放。
- **🗣️ 文本朗读 (TTS) 与读书笔记：** 语音朗读伴随实时句子高亮与锁屏后台播放。提供 3 种颜色的高亮划线、笔记记录、Markdown 格式导出、即时选词翻译，以及自动继承阅读器字体的名句分享卡片生成。
- **⏱️ 番茄钟专注计时与阅读统计：** 专注计时器配备休息时随主题变换的沙漏动态屏保，内置 GitHub 风格热力图的本地阅读打卡器，以及可导出的阅读统计分享卡片。
- **🌍 10 种语言：** 提供英语、希腊语、简体中文、法语、德语、印地语、日语、葡萄牙语、俄语和西班牙语的完整原生界面汉化。

## 🚀 安装为应用程序 (PWA)

1. 在现代浏览器（Chrome、Edge、Safari、Brave、Firefox）中打开 `index.html`（或您的 GitHub Pages 网址）。
2. 点击地址栏中的 **“安装应用”** 图标，或打开浏览器菜单 **(⋯) → 安装 Diavasma**。
3. 在 **iOS (Safari)** 上：点击底部的 **分享 (Share)** 按钮 → 选择 **“添加到主屏幕” (Add to Home Screen)**。

## 🌐 在 GitHub Pages 上部署托管

要在 GitHub Pages 上托管您自己的个人或公开实例，只需上传仓库中的所有文件：

- `index.html` 与 `Diavasma.html` (应用程序外壳与阅读器界面)
- `styles.css` (完整的自适应排版样式表)
- `i18n.js` (完整的 10 语言本地化词典)
- `app.js` (核心业务逻辑、存储、音频与分页引擎)
- `sw.js` (用于离线强力预缓存与离线策略的 Service Worker)
- `manifest.json` (PWA 配置文件与元数据)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (应用图标)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (欢迎界面艺术插图)
- `pdf.min.js` 与 `pdf.worker.min.js` (自托管离线 PDF 渲染引擎)
- `fonts/` (本地 WOFF2 网络字体与 `fonts.css`)
- `README.md` (项目文档说明)

1. 在 GitHub 上创建一个新的仓库 (Repository)。
2. 将上述所有文件推送到或上传到您的仓库中。
3. 进入仓库的 **Settings → Pages** 设置页面。
4. 在 **Build and deployment** 下，选择 **Deploy from a branch**，指定 `main`（或 `master`）分支及 `/ (root)` 根目录，点击 **Save**。
5. 几分钟后，您的专属阅读空间便可在 `https://<username>.github.io/<repository-name>/` 全球访问并支持直接安装。

## 🔒 隐私保护 (Privacy First)

- **100% 本地数据：** Diavasma 不会收集、存储或向任何外部服务器发送您的个人隐私、阅读历史或书籍文件。所有的书籍、文本、划线笔记与阅读习惯数据均严格保存在您设备的 `localStorage` 与 `IndexedDB` 本地数据库中。
- **自托管字体与组件：** 所有字体、音频生成器和阅读引擎（包括 PDF.js）全部本地内置。应用运行时完全不向 Google Fonts 等第三方 CDN 发起网络请求，全面保护您的 IP 地址和设备指纹。
- **关于外部 URL 抓取的说明：** “从 URL 抓取” 功能必须依赖公共 CORS 代理来突破浏览器的跨域安全策略。若您追求绝对 100% 无网络流量的极客隐私环境，建议优先使用 **“粘贴 HTML (Ctrl+U)”** 或直接导入本地文件 (`.epub`, `.pdf`, `.txt`, `.md`)。

[↑ 返回语言选择](#languages)

---

<a id="lang-fr"></a>
# Diavasma 📖 (Français)

> Un sanctuaire de lecture calme, 100 % hors ligne, dédié à l'étude et à l'organisation de vos livres et articles — sans publicité, sans pistage, sans dépendance serveur.

## ✨ Fonctionnalités Principales

- **📚 Prise en charge multiformat & Organisation :** Lecture hors ligne native des formats EPUB, PDF (moteur de recomposition hors ligne avec nettoyage intelligent des sauts de ligne et cache de pagination persistant dans IndexedDB), Markdown (`.md`), texte brut (`.txt`) et fichiers audio. Classez vos lectures en groupes (Livres, Articles, collections personnalisées) grâce à un modal d'importation contextuel `+` instantané.
- **🌐 Articles depuis une URL & Sélecteurs personnalisés :** Extraction intelligente d'articles Web, règles de scraping CSS personnalisées par site (avec import/export JSON), collage direct du code source HTML (`Ctrl+U`), et récupération automatique hors ligne du favicon du site.
- **⚡ PWA 100 % hors ligne (Progressive Web App) :** Entièrement utilisable sans connexion Internet. S'installe comme une application autonome sur Android, iOS, Windows et macOS depuis votre navigateur, avec un préchargement robuste par Service Worker et un écran d'accueil sans scintillement (clair/sombre, bureau/mobile).
- **🎨 6 Thèmes soignés & Typographie auto-hébergée :** Thèmes Papier (Paper), Chaleureux (Warm), Sauge (Sage), Ardoise (Slate), Nuit (Night) et AMOLED. Intègre des polices locales (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), l'importation de polices personnalisées (`.ttf`, `.otf`, `.woff`, `.woff2`), l'alignement (Gauche, Centre, Droite, Justifié), l'interligne réglable et l'affichage en 1 ou 2 pages.
- **🎧 Musique & Paysages sonores ambiants :** Mini-lecteur audio intégré de style Winamp (liste de lecture persistante dans IndexedDB, lecture aléatoire, boucle à 3 états, curseur de progression et contrôle du volume mobile) accompagné de 6 paysages sonores procéduraux Web Audio (Pluie, Cheminée, Vagues, Forêt & vent, Bibliothèque & vinyle, Bruit profond) avec lecture en arrière-plan écran verrouillé.
- **🗣️ Synthèse vocale (TTS) & Prise de notes :** Lecture vocale avec surlignage en direct de la phrase lue et poursuite en arrière-plan. Surlignages en 3 couleurs, notes d'étude, exportation Markdown, traduction instantanée de la sélection et génération de cartes de citation partagées héritant de la typographie du lecteur.
- **⏱️ Pomodoro & Suivi des habitudes de lecture :** Minuteur de concentration avec économiseur d'écran sablier animé pendant les pauses, suivi des habitudes de lecture local avec carte thermique d'activité style GitHub et cartes de statistiques exportables.
- **🌍 10 Langues :** Interface utilisateur traduite nativement et intégralement en anglais, grec, chinois simplifié, français, allemand, hindi, japonais, portugais, russe et espagnol.

## 🚀 Installation en tant qu'application (PWA)

1. Ouvrez `index.html` (ou l'URL de votre déploiement GitHub Pages) dans un navigateur moderne (Chrome, Edge, Safari, Brave, Firefox).
2. Cliquez sur l'icône **« Installer l'application »** dans la barre d'adresse, ou dans le menu **(⋯) → Installer Diavasma**.
3. Sur **iOS (Safari)** : Appuyez sur le bouton **Partager** → choisissez **« Sur l'écran d'accueil » (Add to Home Screen)**.

## 🌐 Hébergement sur GitHub Pages

Pour héberger votre propre instance privée ou publique sur GitHub Pages, déposez l'ensemble des fichiers du projet :

- `index.html` & `Diavasma.html` (coquille de l'application & interface du lecteur)
- `styles.css` (feuille de style responsive complète)
- `i18n.js` (dictionnaire complet de localisation en 10 langues)
- `app.js` (logique applicative, stockage local, audio & moteur de pagination)
- `sw.js` (Service Worker pour la mise en cache hors ligne et le precaching)
- `manifest.json` (configuration & métadonnées de la PWA)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (icônes de l'application)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (illustrations de l'écran d'accueil)
- `pdf.min.js` & `pdf.worker.min.js` (moteur PDF hors ligne auto-hébergé)
- `fonts/` (polices web locales WOFF2 & `fonts.css`)
- `README.md` (documentation du projet)

1. Créez un nouveau dépôt (repository) sur GitHub.
2. Téléversez ou poussez l'ensemble des fichiers listés ci-dessus.
3. Accédez aux paramètres du dépôt (**Settings → Pages**).
4. Sous la section **Build and deployment**, choisissez **Deploy from a branch**, sélectionnez la branche `main` (ou `master`) et le dossier `/ (root)`, puis validez avec **Save**.
5. En quelques instants, votre espace de lecture sera accessible et installable mondialement sur `https://<username>.github.io/<repository-name>/`.

## 🔒 Confidentialité garantie (Privacy First)

- **Données 100 % locales :** Diavasma ne collecte, ne stocke et ne transmet aucune donnée personnelle, aucun historique et aucun texte vers des serveurs distants. Vos livres, notes et statistiques résident exclusivement sur votre appareil (`localStorage` & `IndexedDB`).
- **Polices et bibliothèques auto-hébergées :** L'ensemble des polices, générateurs de son et moteurs de lecture (dont PDF.js) sont hébergés localement. Aucune requête n'est adressée à des services tiers comme Google Fonts, préservant ainsi votre adresse IP et votre vie privée.
- **Précision sur la récupération d'URL :** La fonction « Importer depuis une URL » fait appel à des proxys CORS publics pour contourner les restrictions des navigateurs lors de la récupération de pages distantes. Pour une confidentialité 100 % hors ligne sans trafic réseau, privilégiez **« Coller le HTML (Ctrl+U) »** ou l'import de fichiers locaux (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Retour aux langues](#languages)

---

<a id="lang-de"></a>
# Diavasma 📖 (Deutsch)

> Ein ruhiges, zu 100 % offline nutzbares Lese-Refugium, Lernbereich und Organizer für Bücher & Artikel — werbefrei, ohne Tracking, ohne Server-Abhängigkeiten.

## ✨ Hauptmerkmale

- **📚 Multi-Format-Unterstützung & Organisation:** Natives Offline-Lesen von EPUB, PDF (Offline-Reflow-Engine mit intelligenter Zeilenumbruch-Bereinigung und persistentem IndexedDB-Paginierungs-Cache), Markdown (`.md`), Reintext (`.txt`) und Audiodateien. Organisieren Sie Ihre Inhalte in Gruppen (Bücher, Artikel, benutzerdefinierte Sammlungen) mit einem kontextuellen `+`-Import-Modal.
- **🌐 Web-Artikel & Benutzerdefinierte Selektoren:** Intelligente Artikelextraktion aus Web-Links, seitenspezifische CSS-Scraper-Regeln (mit JSON-Import/Export), Einfügen von Roh-HTML (`Ctrl+U`) und automatischer Offline-Abruf des Website-Icons (Favicon).
- **⚡ 100 % Offline-PWA (Progressive Web App):** Ohne Internetverbindung voll funktionsfähig. Über den Browser installierbar als eigenständige Anwendung unter Android, iOS, Windows und macOS, mit robustem Service Worker Precaching und flackerfreiem Willkommensbildschirm (Hell/Dunkel, Desktop/Mobil).
- **🎨 6 Kuratierte Themes & Selbst gehostete Typografie:** Themes Papier (Paper), Warm, Salbei (Sage), Schiefer (Slate), Nacht (Night) und AMOLED. Enthält lokale Schriftarten (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), Hochladen eigener Schriftarten (`.ttf`, `.otf`, `.woff`, `.woff2`), Textausrichtung (Links, Zentriert, Rechts, Blocksatz), einstellbare Zeilenhöhe sowie 1- oder 2-seitige Buchansicht.
- **🎧 Musik & Ambient-Klangwelten:** Integrierter Mini-Audioplayer im Winamp-Stil (persistente IndexedDB-Wiedergabeliste, Zufallswiedergabe, 3-Stufen-Wiederholung, Fortschrittsleiste und mobile Lautstärkeregelung) sowie 6 prozedurale Web Audio Klangwelten (Regen, Kaminfeuer, Meereswellen, Wald & Wind, Bibliothek & Vinyl, Tiefes Rauschen) mit Hintergrundwiedergabe bei gesperrtem Bildschirm.
- **🗣️ Sprachausgabe (TTS) & Notizen:** Vorlesefunktion mit satzweiser Live-Hervorhebung und Hintergrundwiedergabe. Markierungen in 3 Farben, Notizen, Markdown-Export, sofortige Übersetzung ausgewählter Textstellen und Zitatkarten (Quote Share Cards), die das typografische Design des Lesers übernehmen.
- **⏱️ Pomodoro-Timer & Lese-Statistiken:** Fokus-Timer mit animiertem Sanduhr-Bildschirmschoner während der Pausen, lokaler Lese-Gewohnheitstracker mit GitHub-artigem Aktivitäts-Heatmap und exportierbare Statistik-Karten.
- **🌍 10 Sprachen:** Vollständig lokalisierte Benutzeroberfläche in Englisch, Griechisch, Chinesisch (Vereinfacht), Französisch, Deutsch, Hindi, Japanisch, Portugiesisch, Russisch und Spanisch.

## 🚀 Installation als App (PWA)

1. Öffnen Sie `index.html` (oder Ihre GitHub Pages-URL) in einem modernen Browser (Chrome, Edge, Safari, Brave, Firefox).
2. Klicken Sie auf das Symbol **„App installieren“** in der Adressleiste oder wählen Sie im Menü **(⋯) → Diavasma installieren**.
3. Unter **iOS (Safari)**: Tippen Sie auf die Schaltfläche **Teilen** → wählen Sie **„Zum Home-Bildschirm“ (Add to Home Screen)**.

## 🌐 Hosting auf GitHub Pages

Um Ihre eigene private oder öffentliche Instanz auf GitHub Pages zu betreiben, laden Sie alle Repository-Dateien hoch:

- `index.html` & `Diavasma.html` (App-Shell & Benutzeroberfläche)
- `styles.css` (vollständiges responsives Stylesheet)
- `i18n.js` (vollständiges Lokalisierungs-Wörterbuch für 10 Sprachen)
- `app.js` (zentrale Anwendungslogik, Speicher, Audio & Paginierung)
- `sw.js` (Service Worker für Offline-Betrieb & Precaching)
- `manifest.json` (PWA-Konfiguration & Metadaten)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (App-Symbole)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (Grafiken des Willkommensbildschirms)
- `pdf.min.js` & `pdf.worker.min.js` (selbst gehostete Offline-PDF-Engine)
- `fonts/` (lokale WOFF2-Webschriften & `fonts.css`)
- `README.md` (Projektdokumentation)

1. Erstellen Sie ein neues Repository auf GitHub.
2. Laden Sie alle oben aufgeführten Dateien in Ihr Repository hoch.
3. Öffnen Sie die Repository-Einstellungen (**Settings → Pages**).
4. Wählen Sie unter **Build and deployment** die Option **Deploy from a branch**, stellen Sie den `main`- (oder `master`-)Branch und den Ordner `/ (root)` ein und klicken Sie auf **Save**.
5. Nach wenigen Minuten ist Ihre Leseumgebung weltweit unter `https://<username>.github.io/<repository-name>/` erreichbar und installierbar.

## 🔒 Datenschutz an erster Stelle (Privacy First)

- **100 % lokale Daten:** Diavasma erfasst, speichert oder überträgt keinerlei personenbezogene Daten, Leseverläufe oder Buchinhalte an externe Server. Sämtliche Dokumente, Notizen und Statistiken verbleiben ausschließlich lokal auf Ihrem Gerät (`localStorage` & `IndexedDB`).
- **Selbst gehostete Schriften & Komponenten:** Alle Schriftarten, Tongeneratoren und Lesemotoren (inklusive PDF.js) werden lokal bereitgestellt. Es erfolgen keine Verbindungen zu Drittanbietern wie Google Fonts, wodurch Ihre IP-Adresse und Privatsphäre geschützt bleiben.
- **Hinweis zum Abrufen von URLs:** Die Funktion „Von URL abrufen“ nutzt öffentliche CORS-Proxys, um browserseitige Cross-Origin-Beschränkungen beim Laden entfernter Seiten zu überwinden. Für absolute Offline-Privatsphäre ohne Netzwerkverkehr empfehlen wir **„HTML einfügen (Ctrl+U)“** oder den direkten Import lokaler Dateien (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Zurück zur Sprachauswahl](#languages)

---

<a id="lang-hi"></a>
# Diavasma 📖 (हिन्दी)

> पुस्तकों और लेखों के अध्ययन, एकाग्रता और संगठन के लिए एक शांत, 100% ऑफ़लाइन वाचन अभयारण्य — बिना किसी विज्ञापन, ट्रैकिंग या सर्वर निर्भरता के।

## ✨ मुख्य विशेषताएँ

- **📚 बहु-प्रारूप समर्थन और संगठन:** EPUB, PDF (स्मार्ट लाइन ब्रेक क्लीनअप और स्थायी IndexedDB पेजिनेशन कैश से युक्त ऑफ़लाइन रीफ्लो इंजन), Markdown (`.md`), सादा पाठ (`.txt`), और ऑडियो फ़ाइलों का मूल ऑफ़लाइन वाचन। एक त्वरित प्रासंगिक `+` आयात मोडल के साथ सामग्री को समूहों (पुस्तकें, लेख, कस्टम समूह) में व्यवस्थित करें।
- **🌐 वेब लिंक से लेख और कस्टम चयनकर्ता:** वेब URL से लेखों का स्मार्ट निष्कर्षण, वेबसाइट-विशिष्ट कस्टम CSS स्क्रैपर नियम (JSON आयात/निर्यात के साथ), कच्चा HTML स्रोत पेस्ट (`Ctrl+U`), और स्वचालित ऑफ़लाइन साइट आइकन (फ़ेविकॉन) प्राप्ति।
- **⚡ 100% ऑफ़लाइन PWA (प्रोग्रेसिव वेब ऐप):** इंटरनेट कनेक्शन के बिना पूरी तरह कार्यात्मक। आधुनिक ब्राउज़र के माध्यम से Android, iOS, Windows और macOS पर स्टैंडअलोन ऐप के रूप में स्थापित किया जा सकता है, जिसमें मजबूत Service Worker प्रीकैशिंग और शून्य-फ़्लैश स्वागत स्क्रीन शामिल है।
- **🎨 6 चयनित थीम और स्व-होस्टेड टाइपोग्राफी:** पेपर (Paper), वार्म (Warm), सेज (Sage), स्लेट (Slate), नाइट (Night) और AMOLED थीम। अंतर्निहित स्थानीय फ़ॉन्ट (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), कस्टम फ़ॉन्ट अपलोड (`.ttf`, `.otf`, `.woff`, `.woff2`), संरेखण (बाएँ, केंद्र, दाएँ, औचित्य), पंक्ति रिक्ति और 1 या 2 पृष्ठ प्रसार दृश्य।
- **🎧 संगीत और परिवेशी ध्वनियाँ:** अंतर्निहित Winamp-शैली मिनी ऑडियो प्लेयर (स्थायी IndexedDB प्लेलिस्ट, शफ़ल, 3-स्थिति लूप, सीक बार और मोबाइल वॉल्यूम नियंत्रण) तथा 6 प्रक्रियात्मक Web Audio परिवेशी ध्वनियाँ (बारिश, चिमनी, समुद्र की लहरें, वन और हवा, पुस्तकालय और विनाइल, गहरा शोर) जो लॉक स्क्रीन पर भी पृष्ठभूमि में बजती हैं।
- **🗣️ टेक्स्ट-टू-स्पीच (TTS) और अध्ययन नोट्स:** वाक्य-स्तरीय लाइव हाइलाइट और बैकग्राउंड प्लेबैक के साथ आवाज़ वाचन। 3 रंगों में हाइलाइट, नोट्स, Markdown निर्यात, त्वरित चयन अनुवाद, और पाठक टाइपोग्राफी को अपनाने वाले उद्धरण साझाकरण कार्ड (Quote Share Cards)।
- **⏱️ पोमोडोरो और वाचन आदत सांख्यिकी:** अंतराल के दौरान एनिमेटेड ऑवरग्लास स्क्रीनसेवर के साथ फ़ोकस टाइमर, GitHub-शैली गतिविधि हीटमैप के साथ स्थानीय आदत ट्रैकर, और निर्यात योग्य आँकड़े कार्ड।
- **🌍 10 भाषाएँ:** अंग्रेजी, ग्रीक, चीनी (सरलीकृत), फ्रेंच, जर्मन, हिन्दी, जापानी, पुर्तगाली, रूसी और स्पैनिश में पूर्ण मूल यूआई स्थानीयकरण।

## 🚀 एप्लिकेशन के रूप में स्थापना (PWA)

1. किसी आधुनिक ब्राउज़र (Chrome, Edge, Safari, Brave, Firefox) में `index.html` (या अपना GitHub Pages URL) खोलें।
2. पता बार में **"ऐप इंस्टॉल करें"** आइकन पर क्लिक करें, या मेनू **(⋯) → Diavasma इंस्टॉल करें** चुनें।
3. **iOS (Safari)** पर: **शेयर (Share)** बटन टैप करें → **"होम स्क्रीन में जोड़ें" (Add to Home Screen)** चुनें।

## 🌐 GitHub Pages पर होस्टिंग

GitHub Pages पर अपना स्वयं का निजी या सार्वजनिक इंस्टेंस होस्ट करने के लिए, सभी फ़ाइलों को अपलोड करें:

- `index.html` और `Diavasma.html` (एप्लिकेशन शैल और वाचन इंटरफ़ेस)
- `styles.css` (संपूर्ण उत्तरदायी स्टाइलशीट)
- `i18n.js` (संपूर्ण 10-भाषा स्थानीयकरण शब्दकोश)
- `app.js` (मुख्य अनुप्रयोग तर्क, भंडारण, ऑडियो और पेजिनेटर)
- `sw.js` (ऑफ़लाइन प्रीकैशिंग के लिए Service Worker)
- `manifest.json` (PWA कॉन्फ़िगरेशन और मेटाडेटा)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (ऐप आइकन)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (स्वागत स्क्रीन कलाकृति)
- `pdf.min.js` और `pdf.worker.min.js` (स्व-होस्टेड ऑफ़लाइन PDF इंजन)
- `fonts/` (स्थानीय WOFF2 फ़ॉन्ट और `fonts.css`)
- `README.md` (परियोजना दस्तावेज़ीकरण)

1. GitHub पर एक नया रिपॉजिटरी (Repository) बनाएँ।
2. उपर्युक्त सभी फ़ाइलों को अपने रिपॉजिटरी में अपलोड या पुश करें।
3. रिपॉजिटरी की सेटिंग्स में जाएँ (**Settings → Pages**)।
4. **Build and deployment** के तहत, **Deploy from a branch** चुनें, `main` (या `master`) शाखा और `/ (root)` फ़ोल्डर का चयन करें, फिर **Save** पर क्लिक करें।
5. कुछ ही मिनटों में आपका वाचन कक्ष विश्व स्तर पर `https://<username>.github.io/<repository-name>/` पर उपलब्ध और स्थापित करने योग्य हो जाएगा।

## 🔒 गोपनीयता सर्वोपरि (Privacy First)

- **100% स्थानीय डेटा:** Diavasma किसी भी व्यक्तिगत जानकारी, वाचन इतिहास या दस्तावेज़ को बाहरी सर्वर पर संग्रहीत या प्रेषित नहीं करता है। सभी पुस्तकें, नोट्स और आँकड़े पूरी तरह से आपके डिवाइस के `localStorage` और `IndexedDB` में सुरक्षित रहते हैं।
- **स्व-होस्टेड फ़ॉन्ट और घटक:** सभी फ़ॉन्ट, ध्वनि जनरेटर और रेंडरिंग इंजन (PDF.js सहित) स्थानीय रूप से होस्ट किए जाते हैं। Google Fonts जैसे तृतीय-पक्ष सर्वर पर कोई नेटवर्क अनुरोध नहीं भेजा जाता, जिससे आपका आईपी पता और गोपनीयता सुरक्षित रहती है।
- **URL निष्कर्षण संबंधी सूचना:** "URL से प्राप्त करें" सुविधा बाहरी वेब पेजों को लोड करते समय ब्राउज़र प्रतिबंधों को बायपास करने के लिए सार्वजनिक CORS प्रॉक्सी का उपयोग करती है। शून्य नेटवर्क ट्रैफ़िक के साथ पूर्ण ऑफ़लाइन गोपनीयता के लिए, **"HTML पेस्ट करें (Ctrl+U)"** या स्थानीय फ़ाइलों (`.epub`, `.pdf`, `.txt`, `.md`) का उपयोग करें।

[↑ भाषाओं पर वापस जाएँ](#languages)

---

<a id="lang-ja"></a>
# Diavasma 📖 (日本語)

> 広告なし、トラッキングなし、外部サーバー依存ゼロ —— 読書、学習、書籍や記事の整理に最適な静寂の100%オフライン読書サンクチュアリ。

## ✨ 主な機能

- **📚 マルチフォーマット対応と整理：** EPUB、PDF（スマートな改行補正と永続的なIndexedDBページネーションキャッシュを備えたオフラインリフローエンジン）、Markdown (`.md`)、テキスト (`.txt`)、音声ファイルをネイティブにオフライン読書。即時コンテキスト `+` インポートモーダルで書籍、記事、カスタムグループに整理できます。
- **🌐 Web記事取得とカスタムセレクター：** URLから記事本文をスマートに抽出、サイトごとのカスタムCSSスクレイパールール（JSONインポート/エクスポート対応）、HTMLソースの直接貼り付け (`Ctrl+U`)、サイトアイコン（ファビコン）の自動オフライン取得をサポート。
- **⚡ 100% オフラインPWA（プログレッシブウェブアプリ）：** インターネット接続なしで完全に動作。最新ブラウザを介してAndroid、iOS、Windows、macOSに独立したアプリとしてインストール可能。強力なService Workerプリキャッシュと、ちらつきゼロのウェルカム画面（ライト/ダーク、デスクトップ/モバイル適応）を搭載。
- **🎨 6つの洗練されたテーマとセルフホストフォント：** Paper（紙）、Warm（温かみ）、Sage（セージ）、Slate（スレート）、Night（夜）、AMOLED純黒テーマ。ローカルフォント（`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`）、カスタムフォントのアップロード（`.ttf`, `.otf`, `.woff`, `.woff2`）、文字揃え（左/中央/右/両端揃え）、行間調整、1ページまたは2ページ見開き表示に対応。
- **🎧 音楽と環境アンビエント音：** Winampスタイルのミニ音楽プレーヤー（IndexedDB永続プレイリスト、シャッフル、3状態ループ、シークバー、モバイル音量調整）と、画面ロック時も再生が続く6つのプロシージャルWeb Audio環境音（雨、暖炉、波、森と風、図書館とレコード、ディープノイズ）を搭載。
- **🗣️ 音声読み上げ（TTS）と読書ノート：** 文単位のリアルタイムハイライトとバックグラウンド再生に対応した音声読み上げ。3色の蛍光ペンハイライト、ノート記録、Markdown書き出し、選択箇所の即時翻訳、リーダーのタイポグラフィを継承する引用共有カード（Quote Share Cards）生成。
- **⏱️ ポモドーロと読書習慣トラッカー：** 休憩時にテーマ連動の砂時計スクリーンセーバーが表示される集中タイマー、GitHubスタイルのアクティビティヒートマップを備えたローカル習慣トラッカー、統計共有カード。
- **🌍 10言語対応：** 英語、ギリシャ語、簡体字中国語、フランス語、ドイツ語、ヒンディー語、日本語、ポルトガル語、ロシア語、スペイン語の完全なネイティブUI翻訳。

## 🚀 アプリとしてインストール（PWA）

1. モダンブラウザ（Chrome、Edge、Safari、Brave、Firefox）で `index.html`（またはGitHub PagesのURL）を開きます。
2. アドレスバーの **「アプリをインストール」** アイコンをクリックするか、メニュー **(⋯) → Diavasmaをインストール** を選択します。
3. **iOS (Safari)** の場合：**共有** ボタンをタップ → **「ホーム画面に追加」 (Add to Home Screen)** を選択します。

## 🌐 GitHub Pagesでのホスティング

GitHub Pages上で自分専用または公開インスタンスをホストするには、すべてのプロジェクトファイルをアップロードします：

- `index.html` および `Diavasma.html` (アプリシェルとリーダーUI)
- `styles.css` (完全レスポンシブスタイルシート)
- `i18n.js` (10言語の完全ローカライズ辞書)
- `app.js` (コアロジック、ストレージ、オーディオ、ページネーター)
- `sw.js` (オフライン動作とプリキャッシュ用Service Worker)
- `manifest.json` (PWA設定とメタデータ)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (アプリアイコン)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (ウェルカム画面アートワーク)
- `pdf.min.js` および `pdf.worker.min.js` (セルフホストオフラインPDFエンジン)
- `fonts/` (ローカルWOFF2フォントと `fonts.css`)
- `README.md` (プロジェクト解説ドキュメント)

1. GitHub上で新しいリポジトリを作成します。
2. 上記のファイルをすべてリポジトリにプッシュまたはアップロードします。
3. リポジトリの **Settings → Pages** を開きます。
4. **Build and deployment** で **Deploy from a branch** を選択し、`main`（または `master`）ブランチと `/ (root)` フォルダを指定して **Save** をクリックします。
5. 数分後、`https://<username>.github.io/<repository-name>/` であなた専用の読書空間が世界中から利用可能になります。

## 🔒 プライバシー最優先（Privacy First）

- **100% ローカルデータ：** Diavasmaはいかなる個人情報、読書履歴、ファイル内容も外部サーバーへ収集・送信しません。すべての書籍、ノート、統計データは端末内の `localStorage` および `IndexedDB` にのみ安全に保持されます。
- **セルフホストフォントとコンポーネント：** すべてのフォント、音源生成エンジン、リーダーエンジン（PDF.jsを含む）はローカルから提供されます。Google Fontsなどのサードパーティへの通信は一切行われないため、IPアドレスやプライバシーが完全に保護されます。
- **外部URL取得に関する注意：** 「URLから取得」機能は、ブラウザのクロスオリジン制約を回避するためパブリックCORSプロキシを経由します。外部通信を一切行わない完全なオフラインプライバシー環境には、**「HTML貼り付け (Ctrl+U)」** またはローカルファイル（`.epub`, `.pdf`, `.txt`, `.md`）のご利用をお勧めします。

[↑ 言語の選択に戻る](#languages)

---

<a id="lang-pt"></a>
# Diavasma 📖 (Português)

> Um santuário de leitura calmo, 100% offline, para estudo e organização de livros e artigos — sem anúncios, sem rastreamento, sem dependências de servidores.

## ✨ Principais Recursos

- **📚 Suporte Multiformato & Organização:** Leitura offline nativa para EPUB, PDF (motor de refluxo offline com limpeza inteligente de quebras de linha e cache de paginação persistente no IndexedDB), Markdown (`.md`), texto simples (`.txt`) e arquivos de áudio. Organize tudo em grupos (Livros, Artigos, coleções personalizadas) através de um modal de importação contextual `+` instantâneo.
- **🌐 Artigos de URLs & Seletores Personalizados:** Extração inteligente de artigos da Web, regras de scraping CSS personalizadas por site (com importação/exportação JSON), colagem direta do código-fonte HTML (`Ctrl+U`) e captura automática offline do favicon do site.
- **⚡ PWA 100% Offline (Progressive Web App):** Totalmente funcional sem conexão com a internet. Pode ser instalado como aplicativo autônomo no Android, iOS, Windows e macOS pelo navegador, com pré-carregamento robusto via Service Worker e tela de boas-vindas sem cintilação (claro/escuro, desktop/celular).
- **🎨 6 Temas Selecionados & Tipografia Própria:** Temas Papel (Paper), Quente (Warm), Sálvia (Sage), Ardósia (Slate), Noite (Night) e AMOLED. Inclui fontes locais (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), envio de fontes personalizadas (`.ttf`, `.otf`, `.woff`, `.woff2`), alinhamento de texto (Esquerda, Centro, Direita, Justificado), espaçamento entre linhas ajustável e visualização em 1 ou 2 páginas.
- **🎧 Música & Paisagens Sonoras:** Mini player de áudio integrado no estilo Winamp (lista de reprodução persistente no IndexedDB, modo aleatório, repetição de 3 estados, barra de busca e controle de volume no celular) com 6 paisagens sonoras Web Audio procedurais (Chuva, Lareira, Ondas do mar, Floresta & vento, Biblioteca & vinil, Ruído profundo) e reprodução contínua em segundo plano com a tela desligada.
- **🗣️ Leitura em Voz Alta (TTS) & Anotações:** Narração de voz com destaque em tempo real da frase em leitura e reprodução em segundo plano. Destaques em 3 cores, anotações, exportação em Markdown, tradução instantânea do trecho selecionado e cartões de citação compartilháveis (Quote Share Cards) com a mesma tipografia do leitor.
- **⏱️ Pomodoro & Estatísticas de Leitura:** Temporizador de foco com descanso de tela animado em ampulheta durante os intervalos, rastreador de hábitos local com mapa de calor no estilo GitHub e cartões de estatísticas exportáveis.
- **🌍 10 Idiomas:** Interface de usuário completa e traduzida nativamente em inglês, grego, chinês simplificado, francês, alemão, híndi, japonês, português, russo e espanhol.

## 🚀 Instalação como Aplicativo (PWA)

1. Abra o `index.html` (ou a URL do seu GitHub Pages) em um navegador moderno (Chrome, Edge, Safari, Brave, Firefox).
2. Clique no ícone **"Instalar aplicativo"** na barra de endereços ou no menu **(⋯) → Instalar Diavasma**.
3. No **iOS (Safari)**: Toque no botão **Compartilhar** → escolha **"Adicionar à Tela de Início" (Add to Home Screen)**.

## 🌐 Hospedagem no GitHub Pages

Para hospedar sua própria instância privada ou pública no GitHub Pages, envie todos os arquivos do repositório:

- `index.html` & `Diavasma.html` (estrutura da aplicação e interface do leitor)
- `styles.css` (folha de estilos responsiva completa)
- `i18n.js` (dicionário completo de localização em 10 idiomas)
- `app.js` (lógica principal, armazenamento, áudio e paginação)
- `sw.js` (Service Worker para operação offline e pré-carregamento)
- `manifest.json` (configurações e metadados da PWA)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (ícones do app)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (artes da tela de boas-vindas)
- `pdf.min.js` & `pdf.worker.min.js` (motor PDF offline auto-hospedado)
- `fonts/` (fontes web WOFF2 locais & `fonts.css`)
- `README.md` (documentação do projeto)

1. Crie um novo repositório no GitHub.
2. Faça upload ou envie por push todos os arquivos listados acima.
3. Acesse as configurações do repositório (**Settings → Pages**).
4. Na seção **Build and deployment**, selecione **Deploy from a branch**, escolha a branch `main` (ou `master`) e a pasta `/ (root)`, e clique em **Save**.
5. Em poucos minutos, seu espaço de leitura estará disponível globalmente e pronto para instalação em `https://<username>.github.io/<repository-name>/`.

## 🔒 Privacidade em Primeiro Lugar (Privacy First)

- **Dados 100% Locais:** O Diavasma não coleta, não armazena e não envia dados pessoais, histórico de leitura ou conteúdo de arquivos para servidores externos. Todos os livros, notas e estatísticas permanecem salvos no seu dispositivo em `localStorage` e `IndexedDB`.
- **Fontes e Componentes Locais:** Todas as fontes, geradores de áudio e motores de leitura (incluindo o PDF.js) são auto-hospedados. Nenhuma requisição é feita a servidores de terceiros como o Google Fonts, preservando seu IP e sua privacidade.
- **Aviso sobre Links Web:** A opção "Obter de URL" utiliza proxies CORS públicos para contornar restrições dos navegadores ao buscar páginas remotas. Para total privacidade offline sem tráfego de rede, utilize **"Colar HTML (Ctrl+U)"** ou importe arquivos locais (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Voltar aos idiomas](#languages)

---

<a id="lang-ru"></a>
# Diavasma 📖 (Русский)

> Тихое, на 100% автономное пространство для чтения, учебы и упорядочивания книг и статей — без рекламы, без слежки и без зависимости от серверов.

## ✨ Ключевые возможности

- **📚 Поддержка множества форматов и организация:** Встроенное чтение офлайн для EPUB, PDF (офлайн-движок перекомпоновки текста с умной очисткой переносов строк и постоянным кэшем пагинации в IndexedDB), Markdown (`.md`), обычного текста (`.txt`) и аудиофайлов. Организуйте материалы по группам (Книги, Статьи, пользовательские подборки) с помощью быстрого контекстного модального окна `+`.
- **🌐 Статьи по URL и пользовательские селекторы:** Интеллектуальное извлечение статей по ссылке, индивидуальные правила CSS-скрейпинга для конкретных сайтов (с импортом/экспортом JSON), поддержка вставки исходного кода HTML (`Ctrl+U`) и автоматическое сохранение иконки сайта (favicon) офлайн.
- **⚡ 100% автономное PWA (Progressive Web App):** Полноценная работа без подключения к Интернету. Устанавливается как отдельное приложение на Android, iOS, Windows и macOS прямо из браузера, оснащено надежным предварительным кэшированием Service Worker и экраном приветствия без мерцания (светлая/темная тема, десктоп/мобильный).
- **🎨 6 тщательно подобранных тем и локальные шрифты:** Темы Бумага (Paper), Теплая (Warm), Шалфей (Sage), Сланец (Slate), Ночь (Night) и AMOLED. Локальный набор шрифтов (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), загрузка собственных шрифтов (`.ttf`, `.otf`, `.woff`, `.woff2`), выравнивание (по левому краю, по центру, по правому краю, по ширине), регулировка межстрочного интервала и режим 1 или 2 страниц.
- **🎧 Музыка и окружающие звуковые ландшафты:** Встроенный мини-плеер в стиле Winamp (постоянный плейлист в IndexedDB, случайный порядок, 3 режима зацикливания, полоса перемотки и мобильный регулятор громкости) и 6 процедурных звуковых ландшафтов Web Audio (дождь, камин, морские волны, лес и ветер, библиотека и винил, глубокий шум) с фоновым воспроизведением при заблокированном экране.
- **🗣️ Озвучивание текста (TTS) и заметки:** Голосовое чтение с синхронным выделением текущего предложения и фоновым воспроизведением. Выделение текста 3 цветами, ведение заметок, экспорт в Markdown, мгновенный перевод выделенного фрагмента и создание карточек с цитатами (Quote Share Cards), наследующих оформление читалки.
- **⏱️ Помодоро и трекер привычки чтения:** Таймер концентрации с анимированной заставкой-песочными часами во время перерывов, локальный трекер привычек с тепловой картой активности в стиле GitHub и экспорт карточек со статистикой.
- **🌍 10 языков:** Полный перевод интерфейса на английский, греческий, китайский (упрощенный), французский, немецкий, хинди, японский, португальский, русский и испанский языки.

## 🚀 Установка в качестве приложения (PWA)

1. Откройте `index.html` (или адрес вашего проекта на GitHub Pages) в современном браузере (Chrome, Edge, Safari, Brave, Firefox).
2. Нажмите на значок **«Установить приложение»** в адресной строке или откройте меню **(⋯) → Установить Diavasma**.
3. На **iOS (Safari)**: Нажмите кнопку **Поделиться (Share)** → выберите **«На экран \"Домой\"» (Add to Home Screen)**.

## 🌐 Развертывание на GitHub Pages

Чтобы опубликовать собственный приватный или публичный экземпляр на GitHub Pages, загрузите все файлы проекта:

- `index.html` и `Diavasma.html` (оболочка приложения и интерфейс читалки)
- `styles.css` (полная адаптивная таблица стилей)
- `i18n.js` (полный словарь локализации для 10 языков)
- `app.js` (основная логика, хранилище, звук и движок пагинации)
- `sw.js` (Service Worker для автономной работы и кэширования)
- `manifest.json` (конфигурация и метаданные PWA)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (иконки приложения)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (иллюстрации экрана приветствия)
- `pdf.min.js` и `pdf.worker.min.js` (автономный движок рендеринга PDF)
- `fonts/` (локальные веб-шрифты WOFF2 и `fonts.css`)
- `README.md` (документация проекта)

1. Создайте новый репозиторий на GitHub.
2. Загрузите или отправьте через push все перечисленные файлы в репозиторий.
3. Перейдите в настройки репозитория (**Settings → Pages**).
4. В блоке **Build and deployment** выберите **Deploy from a branch**, укажите ветку `main` (или `master`) и папку `/ (root)`, затем нажмите **Save**.
5. Через пару минут ваша читалка станет доступна и готова к установке по адресу `https://<username>.github.io/<repository-name>/`.

## 🔒 Конфиденциальность превыше всего (Privacy First)

- **100% локальные данные:** Diavasma не собирает, не сохраняет и не передает персональные данные, историю чтения или файлы на внешние серверы. Все книги, тексты, заметки и статистика хранятся исключительно на вашем устройстве в `localStorage` и `IndexedDB`.
- **Локальные шрифты и компоненты:** Все шрифты, генераторы звука и движки чтения (включая PDF.js) размещены локально. Приложение не выполняет запросов к сторонним сервисам вроде Google Fonts, сохраняя в тайне ваш IP-адрес и системные параметры.
- **Примечание по загрузке статей по URL:** Функция «Загрузка по URL» задействует публичные CORS-прокси для обхода ограничений браузера при чтении сторонних сайтов. Для абсолютной автономной приватности без сетевого трафика используйте функцию **«Вставить HTML (Ctrl+U)»** или локальные файлы (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Наверх к выбору языка](#languages)

---

<a id="lang-es"></a>
# Diavasma 📖 (Español)

> Un santuario de lectura tranquilo, 100% offline, para estudiar y organizar libros y artículos — sin anuncios, sin rastreo y sin dependencias de servidores.

## ✨ Características Principales

- **📚 Compatibilidad Multiformato y Organización:** Lectura offline nativa para EPUB, PDF (motor de reflujo offline con limpieza inteligente de saltos de línea y caché de paginación persistente en IndexedDB), Markdown (`.md`), texto plano (`.txt`) y archivos de audio. Organice sus lecturas en grupos (Libros, Artículos, colecciones personalizadas) mediante un modal de importación contextual `+` instantáneo.
- **🌐 Artículos desde URL y Selectores Personalizados:** Extracción inteligente de artículos web, reglas de scraping CSS personalizadas por sitio (con importación/exportación JSON), pegado directo del código fuente HTML (`Ctrl+U`) y captura automática offline del icono del sitio (favicon).
- **⚡ PWA 100% Offline (Progressive Web App):** Completamente funcional sin conexión a internet. Se puede instalar como una aplicación independiente en Android, iOS, Windows y macOS desde el navegador, con precaching robusto mediante Service Worker y pantalla de bienvenida sin parpadeos (claro/oscuro, escritorio/móvil).
- **🎨 6 Temas Cuidados y Tipografía Autoalojada:** Temas Papel (Paper), Cálido (Warm), Salvia (Sage), Pizarra (Slate), Noche (Night) y AMOLED. Incluye fuentes locales (`Literata`, `Newsreader`, `Source Serif 4`, `Lora`, `Merriweather`, `Atkinson Hyperlegible Next`, `Inter`), carga de fuentes personalizadas (`.ttf`, `.otf`, `.woff`, `.woff2`), alineación de texto (Izquierda, Centro, Derecha, Justificado), interlineado ajustable y vista a 1 o 2 páginas.
- **🎧 Música y Paisajes Sonoros:** Mini reproductor de audio integrado estilo Winamp (lista de reproducción persistente en IndexedDB, reproducción aleatoria, bucle de 3 estados, barra de búsqueda y control de volumen para móviles) junto con 6 paisajes sonoros procedimentales de Web Audio (Lluvia, Chimenea, Olas del mar, Bosque y viento, Biblioteca y vinilo, Ruido profundo) con reproducción en segundo plano y pantalla bloqueada.
- **🗣️ Lectura por Voz (TTS) y Notas:** Lectura en voz alta con resaltado en vivo de la frase y reproducción en segundo plano. Subrayados en 3 colores, notas de estudio, exportación a Markdown, traducción instantánea del texto seleccionado y generación de tarjetas de citas compartibles (Quote Share Cards) que adoptan la tipografía del lector.
- **⏱️ Pomodoro y Estadísticas de Lectura:** Temporizador de enfoque con protector de pantalla animado de reloj de arena durante los descansos, seguimiento de hábitos local con mapa de calor de actividad estilo GitHub y tarjetas de estadísticas exportables.
- **🌍 10 Idiomas:** Interfaz de usuario traducida de forma nativa e íntegra en inglés, griego, chino simplificado, francés, alemán, hindi, japonés, portugués, ruso y español.

## 🚀 Instalación como Aplicación (PWA)

1. Abra `index.html` (o la URL de su despliegue en GitHub Pages) en un navegador moderno (Chrome, Edge, Safari, Brave, Firefox).
2. Haga clic en el icono **«Instalar aplicación»** en la barra de direcciones o en el menú **(⋯) → Instalar Diavasma**.
3. En **iOS (Safari)**: Pulse el botón **Compartir (Share)** → elija **«Añadir a la pantalla de inicio» (Add to Home Screen)**.

## 🌐 Alojamiento en GitHub Pages

Para alojar su propia instancia privada o pública en GitHub Pages, suba todos los archivos del repositorio:

- `index.html` y `Diavasma.html` (estructura de la aplicación e interfaz de lectura)
- `styles.css` (hoja de estilos responsive completa)
- `i18n.js` (diccionario completo de localización en 10 idiomas)
- `app.js` (lógica principal, almacenamiento, audio y paginación)
- `sw.js` (Service Worker para funcionamiento offline y precaching)
- `manifest.json` (configuración y metadatos de la PWA)
- `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (iconos de la aplicación)
- `DesktopD.png`, `DesktopL.png`, `MobileD.jpg`, `MobileL.jpg` (imágenes de la pantalla de bienvenida)
- `pdf.min.js` y `pdf.worker.min.js` (motor PDF offline autoalojado)
- `fonts/` (fuentes web WOFF2 locales y `fonts.css`)
- `README.md` (documentación del proyecto)

1. Cree un nuevo repositorio en GitHub.
2. Suba o haga push de todos los archivos indicados a su repositorio.
3. Vaya a la configuración del repositorio (**Settings → Pages**).
4. En **Build and deployment**, elija **Deploy from a branch**, seleccione la rama `main` (o `master`) y la carpeta `/ (root)`, y haga clic en **Save**.
5. En pocos minutos, su espacio de lectura estará disponible globalmente e instalable en `https://<username>.github.io/<repository-name>/`.

## 🔒 Privacidad Ante Todo (Privacy First)

- **Datos 100% Locales:** Diavasma no recopila, no almacena ni transmite ningún dato personal, historial de lectura o contenido de archivos a servidores externos. Todos los libros, notas y estadísticas permanecen exclusivamente en su dispositivo (`localStorage` e `IndexedDB`).
- **Fuentes y Recursos Locales:** Todas las tipografías, generadores de audio y motores de lectura (incluido PDF.js) se ejecutan de manera local. No se realiza ninguna solicitud a servidores de terceros como Google Fonts, protegiendo su dirección IP y su privacidad.
- **Aviso sobre Enlaces Web:** La función «Obtener desde URL» utiliza proxies CORS públicos para sortear las restricciones del navegador al cargar páginas remotas. Para una privacidad 100% offline sin tráfico de red, utilice **«Pegar HTML (Ctrl+U)»** o importe archivos locales (`.epub`, `.pdf`, `.txt`, `.md`).

[↑ Volver a la selección de idiomas](#languages)

---
