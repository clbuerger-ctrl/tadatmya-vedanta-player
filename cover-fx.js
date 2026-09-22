(function () {
  var STYLE_ID = "tv-cover-fx";
  var HOST_CLASS = "cover-wave-host";
  var sized = false;

  function injectCss() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent =
      "." + HOST_CLASS + "{position:relative;display:inline-block;max-width:100%;line-height:0;overflow:hidden;border-radius:4px;isolation:isolate}" +
      "." + HOST_CLASS + " img.cover{display:block;margin:0!important;border-radius:4px;transform-origin:center center;will-change:transform}" +
      "." + HOST_CLASS + "::before," +
      "." + HOST_CLASS + "::after{content:\"\";position:absolute;inset:-12%;pointer-events:none;z-index:2;" +
      "background:" +
      "radial-gradient(ellipse 70% 40% at 30% 20%,rgba(170,220,255,.35),transparent 55%)," +
      "radial-gradient(ellipse 60% 35% at 70% 75%,rgba(120,190,230,.28),transparent 50%)," +
      "repeating-linear-gradient(100deg,rgba(255,255,255,.0) 0 10px,rgba(200,230,255,.12) 14px,rgba(255,255,255,0) 22px);" +
      "mix-blend-mode:soft-light;opacity:.75}" +
      "." + HOST_CLASS + "::before{animation:tvRippleA 5.5s ease-in-out infinite}" +
      "." + HOST_CLASS + "::after{animation:tvRippleB 7s ease-in-out infinite reverse;opacity:.55}" +
      "@keyframes tvRippleA{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(1.2%,2.2%,0) scale(1.06)}}" +
      "@keyframes tvRippleB{0%,100%{transform:translate3d(0,0,0) scale(1.02)}50%{transform:translate3d(-1.5%,-1.8%,0) scale(1.08)}}" +
      "@keyframes tvCoverWobble{0%,100%{transform:scale(1.04) translate(0,0)}33%{transform:scale(1.055) translate(-.35%,.4%)}66%{transform:scale(1.05) translate(.4%,-.25%)}}" +
      "." + HOST_CLASS + " img.cover{animation:tvCoverWobble 6.5s ease-in-out infinite}" +
      "@media (prefers-reduced-motion:reduce){" +
      "." + HOST_CLASS + "::before,." + HOST_CLASS + "::after,." + HOST_CLASS + " img.cover{animation:none!important}" +
      "}";
    document.head.appendChild(st);
  }

  function findCover() {
    return document.querySelector("img.cover");
  }

  function wrapCover(img) {
    if (!img || img.closest("." + HOST_CLASS)) return img && img.closest("." + HOST_CLASS);
    var parent = img.parentElement;
    var host = document.createElement("span");
    host.className = HOST_CLASS;
    host.setAttribute("aria-hidden", "false");
    if (parent && parent.tagName === "A") {
      parent.insertBefore(host, img);
      host.appendChild(img);
    } else if (parent) {
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
    // kill feedback.js 200px / conflicting CSS
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
    sized = true;
  }

  function centerPlayer() {
    var el = document.getElementById("playerBar");
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var mid = window.scrollY + rect.top + rect.height / 2;
    var target = Math.max(0, mid - window.innerHeight / 2);
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  function boot() {
    injectCss();
    sizeCover();
    // feedback.js builds cover-row a moment later
    setTimeout(sizeCover, 50);
    setTimeout(sizeCover, 250);
    setTimeout(sizeCover, 800);
    var startY = window.scrollY || 0;
    var userMoved = false;
    function onUserScroll() {
      if (Math.abs((window.scrollY || 0) - startY) > 48) userMoved = true;
    }
    window.addEventListener("scroll", onUserScroll, { passive: true });
    setTimeout(function () {
      window.removeEventListener("scroll", onUserScroll);
      if (!userMoved) centerPlayer();
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
