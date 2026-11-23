(function() {
  try {
    var pRaw = localStorage.getItem("reading-room-prefs-v14") || localStorage.getItem("reading-room-prefs-v13") || localStorage.getItem("reading-room-prefs-v12");
    var p = pRaw ? JSON.parse(pRaw) : null;
    var lang = (p && p.lang) ? p.lang : (navigator.language || "").slice(0, 2).toLowerCase();
    var isRtl = (lang === "ar" || lang === "he" || lang === "fa");
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    if (p && p.lang) document.documentElement.lang = p.lang;
    var appEl = document.getElementById("app");
    var ov = document.getElementById("welcomeOverlay");
    var theme = (p && p.theme) ? p.theme : "paper";
    if (appEl) appEl.dataset.theme = theme;
    var themeBgMap = { paper: "#ede9df", warm: "#e5d4bc", sage: "#dce4da", slate: "#1b1e24", night: "#121312", amoled: "#000000" };
    var bgHex = themeBgMap[theme] || "#ede9df";
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", bgHex);
    var hasShare = /[?&](share_url|share_text|share_title)=/i.test(window.location.search);
    if (hasShare || (p && p.showWelcome === false)) {
      if (ov) ov.hidden = true;
    } else if (ov) {
      var isDark = (theme === "night" || theme === "slate" || theme === "amoled");
      var mob = document.getElementById("welcomeSourceMobile");
      var dsk = document.getElementById("welcomeImgDesktop");
      if (mob) mob.srcset = isDark ? "./assets/images/MobileD.jpg" : "./assets/images/MobileL.jpg";
      if (dsk) dsk.src = isDark ? "./assets/images/DesktopD.png" : "./assets/images/DesktopL.png";
    }
  } catch (_) {}
})();
