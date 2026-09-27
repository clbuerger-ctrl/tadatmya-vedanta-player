(function () {
  const BROKER = "wss://broker.emqx.io:8084/mqtt";
  const TOPIC = "tvp/clbuerger/presence/v1/";
  const WINDOW_MS = 10 * 60 * 1000;
  const INTERVAL_MS = 75 * 1000;
  // V1.84: pro Vortrag aktive Hörer/Leser (Heartbeat mit Vortrags-Schlüssel "l")
  const LISTEN_MS = 3 * 60 * 1000;
  const BEAT_MS = 60 * 1000;
  let lastPub = 0;
  let lastLec = "";
  let lastSig = "";
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
      if (!p.c && !p.o) return;
      var label = [p.c, p.o].filter(Boolean).join(", ");
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
    refreshList();
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
          l: String(p.l || "").slice(0, 40),
          t: +p.t || 0
        };
    } catch (e) {
      delete peers[id];
    }
    draw();
  }

  function hashStr(s) {
    s = String(s || "");
    var h = 5381;
    for (var k = 0; k < s.length; k++) h = ((h << 5) + h + s.charCodeAt(k)) | 0;
    return (h >>> 0).toString(16);
  }

  function lecKey(L) {
    if (!L) return "";
    if (L.nr) return "n" + L.nr;
    return "f" + hashStr(L.file || L.titel || "");
  }

  function curLecture() {
    try {
      if (typeof sichtbar === "undefined" || typeof i !== "number" || i < 0) return null;
      return sichtbar[i] || null;
    } catch (e) {
      return null;
    }
  }

  // aktiv = Audio läuft (dieser Vortrag) oder Excerpt-Fenster offen (Lesen)
  function activeKey() {
    var au = document.getElementById("a");
    if (au && au.getAttribute("src") && !au.paused && !au.ended) return lecKey(curLecture());
    var dlg = document.getElementById("dlg");
    if (dlg && dlg.classList.contains("on")) {
      var L = curLecture();
      if (!L) {
        try { L = (typeof sichtbar !== "undefined" && sichtbar[0]) || null; } catch (e) {}
      }
      return lecKey(L);
    }
    return "";
  }

  function liveCounts() {
    prune();
    var now = Date.now();
    var by = Object.create(null);
    Object.keys(peers).forEach(function (id) {
      var p = peers[id];
      if (!p || !p.l || now - p.t > LISTEN_MS) return;
      by[p.l] = (by[p.l] || 0) + 1;
    });
    return by;
  }

  var countsCache = Object.create(null);
  window.__tvLiveCount = function (L) {
    var k = lecKey(L);
    return (k && countsCache[k]) || 0;
  };

  var redrawT = 0;
  function refreshList() {
    var by = liveCounts();
    var sig = Object.keys(by).sort().map(function (k) { return k + ":" + by[k]; }).join(",");
    countsCache = by;
    if (sig === lastSig) return;
    lastSig = sig;
    if (redrawT) return;
    redrawT = setTimeout(function () {
      redrawT = 0;
      if (typeof window.zeichne === "function") try { window.zeichne(); } catch (e) {}
    }, 250);
  }

  function payload() {
    lastLec = activeKey();
    return JSON.stringify({
      c: (city || "").slice(0, 64),
      o: (country || "").slice(0, 8),
      l: lastLec,
      t: Date.now()
    });
  }

  function publish() {
    if (!client || !client.connected) return;
    var body = payload();
    lastPub = Date.now();
    try {
      client.publish(TOPIC + sid, body, { qos: 0, retain: true });
      applyPeer(sid, body);
    } catch (e) {}
  }

  // bei Zustandswechsel (Play/Pause/anderer Vortrag/Excerpt auf/zu) sofort melden
  function maybePublish(force) {
    var k = activeKey();
    if (force || k !== lastLec || (k && Date.now() - lastPub > BEAT_MS)) publish();
  }

  function hookActivity() {
    var au = document.getElementById("a");
    if (au && !au.__tvLiveHook) {
      au.__tvLiveHook = 1;
      ["play", "playing", "pause", "ended", "emptied"].forEach(function (ev) {
        au.addEventListener(ev, function () { maybePublish(false); });
      });
      au.addEventListener("timeupdate", function () { maybePublish(false); });
    }
    var dlg = document.getElementById("dlg");
    if (dlg && !dlg.__tvLiveHook && window.MutationObserver) {
      dlg.__tvLiveHook = 1;
      new MutationObserver(function () { maybePublish(false); }).observe(dlg, { attributes: true, attributeFilter: ["class"] });
    }
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
            // im Hintergrund nur weiter melden, solange gehört wird
            if (document.visibilityState === "hidden" && !activeKey()) return;
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
    hookActivity();
    setInterval(refreshList, 30 * 1000);
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
  var img = document.querySelector("img.cover");
  if (img) {
    img.style.filter = "none";
    img.style.webkitFilter = "none";
  }
  var svg = document.getElementById("tv-water-svg");
  if (svg && svg.parentNode) svg.parentNode.removeChild(svg);
  var css = document.getElementById("tv-water-css");
  if (css && css.parentNode) css.parentNode.removeChild(css);
  document.querySelectorAll("canvas.cover").forEach(function (c) {
    if (c.parentNode) c.parentNode.removeChild(c);
  });
})();
