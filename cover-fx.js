(function () {
  var STYLE_ID = "tv-cover-fx";
  var HOST_CLASS = "cover-wave-host";
  var waterRunning = false;
  var waterRaf = 0;

  function injectCss() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent =
      "." + HOST_CLASS + "{position:relative;display:inline-block;max-width:100%;line-height:0;overflow:hidden;border-radius:4px}" +
      "." + HOST_CLASS + " img.cover{display:block;margin:0!important;border-radius:4px}" +
      "." + HOST_CLASS + " canvas.cover-wave{" +
      "position:absolute;left:0;top:0;width:100%;height:100%;" +
      "border-radius:4px;pointer-events:none;display:block;z-index:1}" +
      "@media (prefers-reduced-motion:reduce){." + HOST_CLASS + " canvas.cover-wave{display:none!important}" +
      "." + HOST_CLASS + " img.cover{opacity:1!important}}";
    document.head.appendChild(st);
  }

  function findCover() {
    return document.querySelector("img.cover");
  }

  function wrapCover(img) {
    if (!img) return null;
    var existing = img.closest("." + HOST_CLASS);
    if (existing) return existing;
    var parent = img.parentElement;
    var host = document.createElement("span");
    host.className = HOST_CLASS;
    if (parent) {
      parent.insertBefore(host, img);
      host.appendChild(img);
    }
    return host;
  }

  function isMobile() {
    return window.matchMedia("(max-width: 800px)").matches;
  }

  function sizeCover() {
    var img = findCover();
    if (!img) return;
    wrapCover(img);
    img.style.setProperty("max-width", "none", "important");
    img.style.setProperty("object-fit", "contain", "important");
    if (isMobile()) {
      img.style.setProperty("width", "90vw", "important");
      img.style.setProperty("height", "auto", "important");
      img.style.setProperty("max-height", "none", "important");
    } else {
      var h = Math.max(160, Math.round(window.innerHeight * 0.5));
      img.style.setProperty("height", h + "px", "important");
      img.style.setProperty("max-height", h + "px", "important");
      img.style.setProperty("width", "auto", "important");
    }
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

  function stopWater() {
    waterRunning = false;
    if (waterRaf) cancelAnimationFrame(waterRaf);
    waterRaf = 0;
  }

  function startWater() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var img = findCover();
    if (!img) return;
    var host = wrapCover(img);
    if (!host) return;

    var canvas = host.querySelector("canvas.cover-wave");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "cover-wave";
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas);
    }

    function whenReady(fn) {
      if (img.complete && img.naturalWidth) fn();
      else img.addEventListener("load", fn, { once: true });
    }

    whenReady(function () {
      if (waterRunning) return;
      waterRunning = true;
      img.style.setProperty("opacity", "0", "important");

      var t0 = performance.now();
      function frame(now) {
        if (!waterRunning) return;
        var w = img.clientWidth | 0;
        var h = img.clientHeight | 0;
        if (w < 4 || h < 4) {
          waterRaf = requestAnimationFrame(frame);
          return;
        }
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        var ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, w, h);

        var t = (now - t0) / 1000;
        var amp = Math.max(3.5, Math.min(14, h * 0.018));
        var wave1 = Math.max(18, h / 5.5);
        var wave2 = Math.max(28, h / 3.2);
        var step = h > 700 ? 2 : 1;

        for (var y = 0; y < h; y += step) {
          var ox =
            Math.sin(y / wave1 + t * 1.55) * amp +
            Math.sin(y / wave2 + t * 2.1) * amp * 0.45 +
            Math.sin(y / (wave1 * 2.4) - t * 0.9) * amp * 0.25;
          try {
            ctx.drawImage(img, 0, y, w, step, ox, y, w, step);
          } catch (e) {
            stopWater();
            img.style.removeProperty("opacity");
            canvas.remove();
            return;
          }
        }
        waterRaf = requestAnimationFrame(frame);
      }
      waterRaf = requestAnimationFrame(frame);
    });
  }

  function boot() {
    injectCss();
    sizeCover();
    setTimeout(sizeCover, 50);
    setTimeout(function () {
      sizeCover();
      startWater();
    }, 120);
    setTimeout(function () {
      sizeCover();
      startWater();
    }, 600);

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
    resizeTimer = setTimeout(function () {
      sizeCover();
      stopWater();
      var img = findCover();
      if (img) img.style.removeProperty("opacity");
      startWater();
    }, 100);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
