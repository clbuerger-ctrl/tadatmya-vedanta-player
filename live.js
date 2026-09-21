(function () {
  const BROKER = "wss://broker.emqx.io:8084/mqtt";
  const TOPIC = "tvp/clbuerger/presence/v1/";
  const WINDOW_MS = 10 * 60 * 1000;
  const INTERVAL_MS = 75 * 1000;
  const peers = Object.create(null);
  let client = null;
  let timer = null;
  let sid = "";
  let city = "";
  let country = "";
  let here = "";

  function sessionId() {
    try {
      var id = sessionStorage.getItem("tvp-presence-id");
      if (!id) {
        id = "s" + Math.random().toString(16).slice(2) + Date.now().toString(16);
        sessionStorage.setItem("tvp-presence-id", id);
      }
      return id;
    } catch (e) {
      return "s" + Math.random().toString(16).slice(2);
    }
  }

  function clearOldLive() {
    var old = document.getElementById("tv-live");
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function slot() {
    clearOldLive();
    return document.getElementById("tv-live-slot");
  }

  function prune() {
    var now = Date.now();
    Object.keys(peers).forEach(function (id) {
      var p = peers[id];
      if (!p || !p.t || now - p.t > WINDOW_MS) delete peers[id];
    });
  }

  function top10() {
    prune();
    var by = Object.create(null);
    Object.keys(peers).forEach(function (id) {
      var p = peers[id];
      if (!p) return;
      var label = [p.c, p.o].filter(Boolean).join(", ") || "unbekannt";
      by[label] = (by[label] || 0) + 1;
    });
    return Object.keys(by)
      .map(function (k) {
        return { name: k, n: by[k] };
      })
      .sort(function (a, b) {
        return b.n - a.n || a.name.localeCompare(b.name);
      })
      .slice(0, 10);
  }

  function paint() {
    var el = slot();
    if (!el) return;
    var rows = top10();
    if (!rows.length) {
      el.textContent = "";
      return;
    }
    el.textContent =
      " · aktiv in: " +
      rows
        .map(function (r) {
          return r.name + (r.n > 1 ? " ×" + r.n : "");
        })
        .join(" · ");
  }

  function draw() {
    paint();
  }

  window.__tvLivePaint = paint;

  function applyPeer(id, raw) {
    if (!id) return;
    if (!raw) {
      delete peers[id];
      draw();
      return;
    }
    try {
      var p = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!p || !p.t) delete peers[id];
      else
        peers[id] = {
          c: String(p.c || "").slice(0, 64),
          o: String(p.o || "").slice(0, 8),
          t: +p.t || 0
        };
    } catch (e) {
      delete peers[id];
    }
    draw();
  }

  function payload() {
    return JSON.stringify({
      c: (city || "").slice(0, 64),
      o: (country || "").slice(0, 8),
      t: Date.now()
    });
  }

  function publish() {
    if (!client || !client.connected) return;
    if (!city && !country) return;
    var body = payload();
    try {
      client.publish(TOPIC + sid, body, { qos: 0, retain: true });
      applyPeer(sid, body);
    } catch (e) {}
  }

  function clearMine() {
    if (!client || !sid) return;
    try {
      client.publish(TOPIC + sid, "", { qos: 0, retain: true });
    } catch (e) {}
  }

  function loadMqtt(cb) {
    if (window.mqtt) {
      cb();
      return;
    }
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/mqtt@4.3.7/dist/mqtt.min.js";
    s.async = true;
    s.onload = function () {
      cb();
    };
    s.onerror = function () {
      var el = slot();
      if (el) el.textContent = "";
    };
    document.head.appendChild(s);
  }

  function connect() {
    loadMqtt(function () {
      if (!window.mqtt) return;
      try {
        client = window.mqtt.connect(BROKER, {
          clientId: "tvp-" + sid.slice(0, 18),
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 12000
        });
        client.on("connect", function () {
          client.subscribe(TOPIC + "#", { qos: 0 });
          publish();
          if (timer) clearInterval(timer);
          timer = setInterval(function () {
            if (document.visibilityState === "hidden") return;
            publish();
            draw();
          }, INTERVAL_MS);
        });
        client.on("message", function (topic, buf) {
          if (topic.indexOf(TOPIC) !== 0) return;
          var id = topic.slice(TOPIC.length);
          if (!id || id.indexOf("/") !== -1) return;
          var raw = buf && buf.length ? buf.toString() : "";
          applyPeer(id, raw);
        });
        client.on("error", function () {});
      } catch (e) {}
    });
  }

  function start() {
    if (window.__tvLiveOn) return;
    window.__tvLiveOn = 1;
    sid = sessionId();
    draw();
    fetch("https://get.geojs.io/v1/ip/geo.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (g) {
        city = (g.city || "").trim();
        country = (g.country_code || g.country || "").trim();
        here = [city, country].filter(Boolean).join(", ");
        draw();
        connect();
      })
      .catch(function () {
        connect();
      });
    window.addEventListener("pagehide", clearMine);
    window.addEventListener("beforeunload", clearMine);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") publish();
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start);
  else start();
})();

(function () {
  if (document.getElementById("tv-cover-size")) return;
  var st = document.createElement("style");
  st.id = "tv-cover-size";
  st.textContent =
    "header{padding-left:0;padding-right:0}" +
    ".cover-row{max-width:none!important;width:100%;padding:0!important;gap:16px}" +
    "img.cover,canvas.cover{display:block;width:100vw!important;max-width:100vw!important;height:auto!important;margin:0 auto 8px!important;object-fit:contain}" +
    ".cover-row a{display:block;width:100%}" +
    "@media (max-width:800px){.cover-row{flex-direction:column!important}.cover-blurb{text-align:center;padding:0 12px}}" +
    "@media (min-width:801px){header{padding-left:12px;padding-right:12px}.cover-row{padding:0 12px!important;align-items:flex-start;justify-content:center}.cover-row a{width:auto}img.cover,canvas.cover{width:auto!important;max-width:90vw!important;height:50vh!important;max-height:50vh!important}}";
  document.head.appendChild(st);
})();

(function () {
  function reduce() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function waterCover() {
    var img = document.querySelector("img.cover");
    if (!img) return;
    img.style.position = "";
    img.style.opacity = "";
    img.style.pointerEvents = "";
    img.style.width = "";
    img.style.height = "";
    document.querySelectorAll("canvas.cover").forEach(function (c) {
      if (c.parentNode) c.parentNode.removeChild(c);
    });
    if (window.__tvWaterOn) return;
    window.__tvWaterOn = 1;
    if (reduce()) return;
    if (!document.getElementById("tv-water-svg")) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = "tv-water-svg";
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.setAttribute("aria-hidden", "true");
      svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
      svg.innerHTML =
        '<filter id="tvWater" x="-12%" y="-12%" width="124%" height="124%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.007 0.018" numOctaves="2" seed="3" result="n">' +
        '<animate attributeName="baseFrequency" dur="8s" repeatCount="indefinite" values="0.007 0.018;0.011 0.026;0.007 0.018"/>' +
        "</feTurbulence>" +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G"/>' +
        "</filter>";
      document.body.appendChild(svg);
    }
    var st = document.getElementById("tv-water-css");
    if (!st) {
      st = document.createElement("style");
      st.id = "tv-water-css";
      document.head.appendChild(st);
    }
    st.textContent =
      "img.cover{filter:url(#tvWater);-webkit-filter:url(#tvWater)}" +
      "@media (min-width:801px){img.cover{filter:url(#tvWater);-webkit-filter:url(#tvWater)}}";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", waterCover);
  else waterCover();
  setTimeout(waterCover, 200);
  setTimeout(waterCover, 800);
})();
