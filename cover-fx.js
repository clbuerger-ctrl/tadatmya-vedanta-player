/* [Grok.com] V1.92: Unter Windows/Desktop bleibt neben dem Buchbild Platz für den Klappentext; Größe folgt der Fensterbreite. */
(function () {
  function findCover() {
    return document.querySelector("img.cover");
  }

  function isMobile() {
    return window.matchMedia("(max-width: 800px)").matches;
  }

  function sizeCover() {
    var img = findCover();
    if (!img) return;
    img.style.setProperty("object-fit", "contain", "important");
    if (isMobile()) {
      img.style.setProperty("width", "90vw", "important");
      img.style.setProperty("max-width", "90vw", "important");
      img.style.setProperty("height", "auto", "important");
      img.style.setProperty("max-height", "none", "important");
      return;
    }
    var row = document.querySelector(".cover-row");
    var avail = row ? row.clientWidth : window.innerWidth;
    var textMin = 280;
    var gap = 28;
    var maxImgW = Math.max(140, Math.min(Math.round(avail * 0.42), avail - textMin - gap));
    var maxImgH = Math.max(140, Math.round(window.innerHeight * 0.34));
    img.style.setProperty("width", "auto", "important");
    img.style.setProperty("height", "auto", "important");
    img.style.setProperty("max-width", maxImgW + "px", "important");
    img.style.setProperty("max-height", maxImgH + "px", "important");
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function softScrollTo(targetY, durationMs) {
    var startY = window.scrollY || window.pageYOffset || 0;
    var diff = targetY - startY;
    if (Math.abs(diff) < 2) return;
    var duration = durationMs || 1800;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / duration);
      var y = startY + diff * easeInOutCubic(p);
      window.scrollTo(0, y);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function centerPlayerSoft() {
    var el = document.getElementById("playerBar");
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var mid = (window.scrollY || 0) + rect.top + rect.height / 2;
    var target = Math.max(0, mid - window.innerHeight / 2);
    softScrollTo(target, 1800);
  }

  function boot() {
    sizeCover();
    setTimeout(sizeCover, 50);
    setTimeout(sizeCover, 120);
    setTimeout(sizeCover, 600);

    var startY = window.scrollY || 0;
    var userMoved = false;
    function onUserScroll() {
      if (Math.abs((window.scrollY || 0) - startY) > 48) userMoved = true;
    }
    window.addEventListener("scroll", onUserScroll, { passive: true });
    setTimeout(function () {
      window.removeEventListener("scroll", onUserScroll);
      if (!userMoved) centerPlayerSoft();
    }, 3000);
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeCover, 80);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
