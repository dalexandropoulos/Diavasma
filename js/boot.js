(function() {
  try {
    var pRaw = localStorage.getItem("reading-room-prefs-v14") || localStorage.getItem("reading-room-prefs-v13") || localStorage.getItem("reading-room-prefs-v12");
    var p = pRaw ? JSON.parse(pRaw) : null;
    var appEl = document.getElementById("app");
    var ov = document.getElementById("welcomeOverlay");
    var theme = (p && p.theme) ? p.theme : "paper";
    if (appEl) appEl.dataset.theme = theme;
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
