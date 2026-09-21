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

  function box() {
    var el = document.getElementById("tv-live");
    if (el) return el;
    var st = document.createElement("style");
    st.textContent =
      "#tv-live{font-size:.68rem;color:#cbb89a;line-height:1.35;text-align:right;padding:0 12px 8px}";
    document.head.appendChild(st);
    el = document.createElement("div");
    el.id = "tv-live";
    var foot = document.querySelector("footer.fb") || document.body;
    foot.appendChild(el);
    return el;
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

  function draw() {
    var rows = top10();
    var el = box();
    var total = rows.reduce(function (s, r) {
      return s + r.n;
    }, 0);
    if (!rows.length) {
      el.textContent =
        "gerade aktiv (10 Min): —" + (here ? " · hier: " + here : "");
      return;
    }
    el.innerHTML =
      "gerade aktiv (10 Min): " +
      total +
      " · TOP10: " +
      rows
        .map(function (r) {
          return r.name + (r.n > 1 ? " ×" + r.n : "");
        })
        .join(" · ") +
      (here ? "<br>hier: " + here : "");
  }

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
      box().textContent =
        "gerade aktiv (10 Min): — (Verbindung gerade nicht möglich)" +
        (here ? " · hier: " + here : "");
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
