/* site.js - Verhalten der Seiten, Stand v4 10.10.2026. Keine Fremdbibliothek. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("js");

  /* K1 Menue auf dem Handy */
  function initNav() {
    var hdr = document.querySelector(".hdr");
    var btn = document.querySelector(".nav-toggle");
    if (!hdr || !btn) return;
    btn.addEventListener("click", function () {
      var open = hdr.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    hdr.querySelectorAll(".hdr__nav a, .hdr__cta").forEach(function (a) {
      a.addEventListener("click", function () { hdr.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); });
    });
  }

  /* K13 Sticky-Balken: erscheint nach dem ersten Bildschirm und verschwindet,
     solange ein Abschnitt mit data-hide-sticky (Formular) im Bild ist. */
  function initStickyBar() {
    var bar = document.querySelector(".stickybar");
    if (!bar) return;
    document.body.classList.add("has-sticky");
    var blockers = Array.prototype.slice.call(document.querySelectorAll("[data-hide-sticky]"));
    var blocked = false;
    if ("IntersectionObserver" in window && blockers.length) {
      var seen = new Map();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { seen.set(e.target, e.isIntersecting); });
        blocked = Array.from(seen.values()).some(Boolean);
        sync();
      }, { threshold: 0.05 });
      blockers.forEach(function (b) { io.observe(b); });
    }
    function sync() {
      bar.classList.toggle("is-visible", !blocked && window.scrollY > window.innerHeight * 0.85);
    }
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  /* K2 VSL-Player: <div class="vsl" data-src="" data-poster="" data-cta-at="155">.
     Ohne data-src bleibt der Platzhalter stehen. Startet stumm, "Ton an" schaltet frei. */
  function initPlayers() {
    document.querySelectorAll(".vsl").forEach(function (box) {
      var src = box.getAttribute("data-src");
      var ph = box.querySelector(".ph");
      var playBtn = box.querySelector(".vsl__play");
      var soundBtn = box.querySelector(".vsl__sound");
      var cta = box.querySelector(".vsl__cta");
      if (!src) {
        [playBtn, soundBtn].forEach(function (el) { if (el) el.hidden = true; });
        return;
      }
      var video = document.createElement("video");
      video.src = src; video.muted = true; video.playsInline = true; video.controls = true; video.preload = "metadata";
      if (box.getAttribute("data-poster")) video.poster = box.getAttribute("data-poster");
      if (box.getAttribute("data-captions")) {
        var t = document.createElement("track");
        t.kind = "captions"; t.srclang = "de"; t.label = "Deutsch"; t.default = true; t.src = box.getAttribute("data-captions");
        video.appendChild(t);
      }
      box.insertBefore(video, box.firstChild);
      function start() { if (ph) ph.hidden = true; if (playBtn) playBtn.hidden = true; video.play(); }
      if (playBtn) { playBtn.hidden = false; playBtn.addEventListener("click", start); }
      if (soundBtn) {
        soundBtn.hidden = false;
        soundBtn.addEventListener("click", function () {
          video.muted = !video.muted;
          soundBtn.textContent = video.muted ? "Ton an" : "Ton aus";
          if (video.paused) start();
        });
      }
      var ctaAt = parseFloat(box.getAttribute("data-cta-at"));
      if (cta && !isNaN(ctaAt)) {
        video.addEventListener("timeupdate", function () { if (video.currentTime >= ctaAt) cta.hidden = false; });
      }
    });
  }

  /* K2 Hero-Loop: erst nach dem Laden, nicht bei reduzierter Bewegung oder Datensparmodus */
  function initHeroLoop() {
    document.querySelectorAll("[data-loop]").forEach(function (holder) {
      var src = holder.getAttribute("data-loop");
      var conn = navigator.connection || {};
      if (!src || reduceMotion || conn.saveData) return;
      window.addEventListener("load", function () {
        var v = document.createElement("video");
        v.src = src; v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none";
        v.setAttribute("aria-hidden", "true");
        if (holder.getAttribute("data-poster")) v.poster = holder.getAttribute("data-poster");
        holder.appendChild(v);
      });
    });
  }

  /* K9 Laufband: Inhalt einmal verdoppeln (Kopie fuer Screenreader verborgen) */
  function initMarquee() {
    document.querySelectorAll(".marquee__track").forEach(function (track) {
      Array.prototype.slice.call(track.children).forEach(function (el) {
        var c = el.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        c.querySelectorAll("a, button").forEach(function (f) { f.tabIndex = -1; });
        track.appendChild(c);
      });
    });
  }

  /* K10 Phasen-Tabs, mit Pfeiltasten bedienbar */
  function initTabs() {
    document.querySelectorAll(".tabs").forEach(function (tabs) {
      var buttons = Array.prototype.slice.call(tabs.querySelectorAll('[role="tab"]'));
      function select(btn, focus) {
        buttons.forEach(function (b) {
          var on = b === btn;
          b.setAttribute("aria-selected", on ? "true" : "false");
          b.tabIndex = on ? 0 : -1;
          var p = document.getElementById(b.getAttribute("aria-controls"));
          if (p) { p.hidden = !on; if (on) { p.classList.remove("is-in"); void p.offsetWidth; p.classList.add("is-in"); } }
        });
        if (focus) btn.focus();
      }
      buttons.forEach(function (btn, i) {
        btn.addEventListener("click", function () { select(btn, false); });
        btn.addEventListener("keydown", function (e) {
          var k = e.key, n = null;
          if (k === "ArrowRight") n = buttons[(i + 1) % buttons.length];
          if (k === "ArrowLeft") n = buttons[(i - 1 + buttons.length) % buttons.length];
          if (k === "Home") n = buttons[0];
          if (k === "End") n = buttons[buttons.length - 1];
          if (n) { e.preventDefault(); select(n, true); }
        });
      });
    });
  }


  /* Sofort-Übung: zweimal ein, lang aus, 60 Sekunden mit Anzeige */
  function initTry() {
    document.querySelectorAll("[data-try]").forEach(function (box) {
      var total = Number(box.getAttribute("data-seconds")) || 60;
      var orb = box.querySelector(".try__orb"), phase = box.querySelector(".try__phase");
      var time = box.querySelector("[data-try-time]"), btn = box.querySelector("[data-try-btn]");
      var after = box.querySelector("[data-try-after]");
      var steps = [["Durch die Nase einatmen", 4000, 1], ["Oben kurz nachziehen", 1500, 1.12], ["Langsam durch den Mund aus", 6500, .6]];
      var running = false, t0 = 0, timers = [], tick = null;
      function setOrb(scale, ms) { if (!orb) return; orb.style.transitionDuration = (reduceMotion ? 0 : ms) + "ms"; orb.style.transform = "scale(" + scale + ")"; }
      function clear() { timers.forEach(clearTimeout); timers = []; if (tick) clearInterval(tick); tick = null; }
      function cycle(i) {
        if (!running) return;
        var st = steps[i % steps.length];
        var left = total * 1000 - (Date.now() - t0);
        if (left <= 300) { finish(); return; }
        phase.textContent = st[0]; setOrb(st[2], st[1]);
        timers.push(setTimeout(function () { cycle(i + 1); }, Math.min(st[1], left)));
      }
      function finish() {
        running = false; clear(); setOrb(.6, 800);
        phase.textContent = "Fertig. Atme normal weiter."; time.textContent = "0";
        btn.textContent = "Noch einmal"; if (after) after.hidden = false;
      }
      function stop() { running = false; clear(); setOrb(.6, 600); phase.textContent = "Angehalten."; time.textContent = String(total); btn.textContent = total + " Sekunden starten"; }
      btn.addEventListener("click", function () {
        if (running) { stop(); return; }
        running = true; t0 = Date.now(); btn.textContent = "Stopp"; if (after) after.hidden = true;
        time.textContent = String(total);
        tick = setInterval(function () { var s = Math.max(0, total - Math.floor((Date.now() - t0) / 1000)); time.textContent = String(s); }, 250);
        cycle(0);
      });
    });
  }

  /* Dezentes Einblenden beim Scrollen */
  function initReveal() {
    var els = document.querySelectorAll(".rv");
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  function init() { initNav(); initStickyBar(); initPlayers(); initHeroLoop(); initMarquee(); initTabs(); initTry(); initReveal(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
