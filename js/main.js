(function () {
  "use strict";

  var canvas, ctx, w, h, dpr;
  var stars = [];
  var mode = "twinkle"; // "twinkle" | "warp"
  var reduceMotion = false;
  var warp = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    var count = Math.round((w * h) / 9000);
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.004
      });
    }
  }

  function drawTwinkle(t) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = s.baseAlpha;
      if (!reduceMotion) {
        a = s.baseAlpha + Math.sin(t * s.speed + s.phase) * 0.25;
        if (a < 0) a = 0;
        if (a > 1) a = 1;
      }
      ctx.beginPath();
      ctx.fillStyle = "rgba(233,237,246," + a.toFixed(3) + ")";
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(t) {
    if (mode === "warp") return; // drawWarp drives its own rAF chain while active
    drawTwinkle(t);
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  function initStarfield() {
    canvas = document.getElementById("starfield");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    window.addEventListener("resize", resize);
    resize();
    if (reduceMotion) {
      drawTwinkle(0);
    } else {
      requestAnimationFrame(loop);
    }
  }

  // ---------- Hyperspace warp launch (splash "Enter Site" button) ----------

  function drawWarp(ts) {
    if (!warp) return;
    if (warp.start === null) warp.start = ts;
    var elapsed = ts - warp.start;
    var t = Math.min(elapsed / warp.duration, 1);
    var accel = Math.pow(t, 2.4) * 46 + 0.6;

    ctx.fillStyle = "rgba(5,7,13," + (t < 0.12 ? 0.4 : 0.24) + ")";
    ctx.fillRect(0, 0, w, h);

    for (var i = 0; i < warp.streaks.length; i++) {
      var s = warp.streaks[i];
      var prevDist = s.dist;
      s.dist += s.speed * accel;
      var len = (s.dist - prevDist) + accel * 1.6;
      var x1 = warp.cx + Math.cos(s.angle) * (s.dist - len);
      var y1 = warp.cy + Math.sin(s.angle) * (s.dist - len);
      var x2 = warp.cx + Math.cos(s.angle) * s.dist;
      var y2 = warp.cy + Math.sin(s.angle) * s.dist;
      var alpha = Math.min(0.18 + t * 0.85, 1);
      ctx.strokeStyle = "rgba(" + s.hue + "," + alpha.toFixed(3) + ")";
      ctx.lineWidth = Math.max(1, t * 2.6);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    if (t >= 1) {
      var cb = warp.onDone;
      warp = null;
      mode = "twinkle";
      if (cb) cb();
      return;
    }
    requestAnimationFrame(drawWarp);
  }

  function startWarp(onDone) {
    mode = "warp";
    var cx = w / 2;
    var cy = h / 2;
    var streaks = [];
    var count = Math.min(380, Math.round((w * h) / 2400));
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      streaks.push({
        angle: angle,
        dist: Math.random() * Math.min(w, h) * 0.12,
        speed: Math.random() * 1.4 + 0.7,
        hue: Math.random() < 0.72 ? "150,210,255" : "195,150,255"
      });
    }
    warp = { streaks: streaks, cx: cx, cy: cy, start: null, duration: 1150, onDone: onDone };
    requestAnimationFrame(drawWarp);
  }

  function initWarpLaunch() {
    var btn = document.getElementById("enter-site");
    if (!btn || !canvas) return;
    var splash = document.querySelector(".splash");
    var launched = false;

    btn.addEventListener("click", function (e) {
      var dest = btn.getAttribute("href");
      if (!dest || launched) return;

      if (reduceMotion) return; // respect reduced-motion: let the plain link navigate

      launched = true;
      e.preventDefault();
      if (splash) splash.classList.add("warping");
      startWarp(function () {
        window.location.href = dest;
      });
    });
  }

  // ---------- Nav ----------

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });

    var path = window.location.pathname.split("/").pop() || "index.html";
    links.querySelectorAll("a").forEach(function (a) {
      var href = a.getAttribute("href").split("/").pop();
      if (href === path) a.classList.add("active");
    });
  }

  // ---------- Ask The Cosmos form (Web3Forms) ----------

  function initAskForms() {
    var forms = document.querySelectorAll(".ask-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var status = form.querySelector(".form-status");
        var submitBtn = form.querySelector('button[type="submit"]');
        var accessKeyInput = form.querySelector('input[name="access_key"]');
        var accessKey = accessKeyInput ? accessKeyInput.value.trim() : "";
        var honeypot = form.querySelector('input[name="botcheck"]');

        function setStatus(text, cls) {
          if (!status) return;
          status.textContent = text;
          status.classList.remove("ok", "err");
          status.classList.add("show");
          if (cls) status.classList.add(cls);
        }

        if (honeypot && honeypot.checked) return; // bot trap tripped, silently drop

        if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
          setStatus(
            "This form isn't connected yet — add a free Web3Forms access key in ask.html to go live.",
            "err"
          );
          return;
        }

        var data = new FormData(form);
        var payload = {};
        data.forEach(function (value, key) {
          payload[key] = value;
        });

        if (submitBtn) submitBtn.disabled = true;
        setStatus("Sending…");

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (res) { return res.json(); })
          .then(function (result) {
            if (result && result.success) {
              form.reset();
              setStatus("Sent — thanks. We'll review it and add it to the backlog if it checks out.", "ok");
            } else {
              setStatus((result && result.message) || "Something went wrong sending that. Try again.", "err");
            }
          })
          .catch(function () {
            setStatus("Couldn't reach the submission service. Try again shortly.", "err");
          })
          .finally(function () {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initStarfield();
    initWarpLaunch();
    initNav();
    initAskForms();
  });
})();
