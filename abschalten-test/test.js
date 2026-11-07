/* Abschalten-Test. Rechnung nur im Browser. Nichts wird gespeichert oder abgeschickt. */
(function (factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined" && api.boot) api.boot();
})(function () {
  "use strict";

  /* Unter SCHWELLE_NIEDRIG (höchste Problemskala) ist das Ergebnis Regulierter.
     Bis SCHWELLE_MIT_ERHOLUNG auch, wenn die Erholung mindestens ERHOLUNG_MIN hat.
     Sonst gewinnt die höchste Problemskala. Gleichstand: wach, dann gruebel, dann dauer. */
  var SCHWELLE_NIEDRIG = 3;
  var SCHWELLE_MIT_ERHOLUNG = 5;
  var ERHOLUNG_MIN = 6;

  var SKALA = [
    { wert: 0, text: "Trifft kaum zu" },
    { wert: 1, text: "Ab und zu" },
    { wert: 2, text: "An den meisten Tagen" },
    { wert: 3, text: "Fast jeden Tag" }
  ];

  var FRAGEN = [
    { skala: "dauer", text: "Nach Feierabend bin ich innerlich noch auf dem Tempo von der Arbeit." },
    { skala: "dauer", text: "Ich schaue nach der Arbeit noch in Mails oder Chats, obwohl nichts Dringendes ansteht." },
    { skala: "dauer", text: "Stillsitzen am Abend fällt mir schwer. Ich brauche noch etwas, das mich beschäftigt." },
    { skala: "dauer", text: "Eine Pause fühlt sich an wie verlorene Zeit." },
    { skala: "gruebel", text: "Abends gehe ich Gespräche, Mails oder offene Punkte noch einmal durch." },
    { skala: "gruebel", text: "Ich formuliere im Kopf Sätze, die ich morgen schreiben oder sagen will." },
    { skala: "gruebel", text: "Wenn ich an etwas anderes denke, springt der Kopf zurück zur Arbeit." },
    { skala: "gruebel", text: "Bevor ich einschlafe, ist der nächste Arbeitstag schon im Kopf." },
    { skala: "wach", text: "Ich bin abends müde und werde wacher, sobald ich im Bett liege." },
    { skala: "wach", text: "Ich wache nachts auf, und der Kopf ist sofort bei der Arbeit." },
    { skala: "wach", text: "Kiefer, Schultern oder Bauch sind abends noch fest, auch wenn ich sitze." },
    { skala: "wach", text: "Morgens bin ich schon vor dem ersten Kaffee bei dem, was ansteht." },
    { skala: "erholung", text: "An einem normalen Abend komme ich runter, ohne mich dazu zu zwingen." },
    { skala: "erholung", text: "Nach einem normalen Arbeitstag habe ich abends noch Energie für etwas, das nichts mit der Arbeit zu tun hat." },
    { skala: "erholung", text: "Am Wochenende ist der Kopf schon am Samstagvormittag leiser." }
  ];

  var TYP_VON_SKALA = {
    wach: "erschoepft-wach",
    gruebel: "gruebler",
    dauer: "dauerlaeufer"
  };
  var REIHENFOLGE = ["wach", "gruebel", "dauer"];
  var SPEICHER = "abschalten-test-antworten";

  function punkteLeer() {
    var a = [];
    var i;
    for (i = 0; i < FRAGEN.length; i++) a.push(null);
    return a;
  }

  function gueltig(n) {
    return n === 0 || n === 1 || n === 2 || n === 3;
  }

  function summieren(antworten) {
    var s = { dauer: 0, gruebel: 0, wach: 0, erholung: 0 };
    var i;
    if (!antworten || antworten.length !== FRAGEN.length) return null;
    for (i = 0; i < FRAGEN.length; i++) {
      var n = Number(antworten[i]);
      if (!gueltig(n)) return null;
      s[FRAGEN[i].skala] += n;
    }
    return s;
  }

  function typVon(s) {
    var maxP = Math.max(s.dauer, s.gruebel, s.wach);
    if (maxP <= SCHWELLE_NIEDRIG) return "reguliert";
    if (maxP <= SCHWELLE_MIT_ERHOLUNG && s.erholung >= ERHOLUNG_MIN) return "reguliert";
    var best = REIHENFOLGE[0];
    var bestVal = -1;
    var i;
    for (i = 0; i < REIHENFOLGE.length; i++) {
      var id = REIHENFOLGE[i];
      if (s[id] > bestVal) {
        bestVal = s[id];
        best = id;
      }
    }
    return TYP_VON_SKALA[best];
  }

  function werten(antworten) {
    var s = summieren(antworten);
    if (!s) return null;
    return { punkte: s, typ: typVon(s) };
  }

  function bootPreis() {
    if (typeof window.abschaltenTestPreis !== "function") return;
    var text = window.abschaltenTestPreis();
    document.querySelectorAll(".js-preis").forEach(function (el) {
      el.textContent = text;
    });
    document.querySelectorAll(".js-kaufen").forEach(function (a) {
      if (typeof window.abschaltenTestCheckout !== "function") return;
      var url = window.abschaltenTestCheckout(a.getAttribute("data-typ"));
      if (url) a.setAttribute("href", url);
    });
  }

  function bootTeilen() {
    var btn = document.getElementById("teilen");
    if (!btn) return;
    var hinweis = document.getElementById("teilen-hinweis");
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-text") || "";
      var url = btn.getAttribute("data-url") || window.location.href;
      if (navigator.share) {
        navigator.share({ text: text, url: url }).catch(function () {});
        return;
      }
      var zeile = text + " " + url;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(zeile).then(function () {
          if (hinweis) hinweis.textContent = "Link kopiert.";
        }).catch(function () {
          if (hinweis) hinweis.textContent = zeile;
        });
        return;
      }
      if (hinweis) hinweis.textContent = zeile;
    });
  }

  function lesen() {
    try {
      var roh = window.sessionStorage.getItem(SPEICHER);
      if (!roh) return punkteLeer();
      var arr = JSON.parse(roh);
      if (!arr || arr.length !== FRAGEN.length) return punkteLeer();
      return arr.map(function (n) { return gueltig(n) ? n : null; });
    } catch (e) {
      return punkteLeer();
    }
  }

  function speichern(arr) {
    try {
      window.sessionStorage.setItem(SPEICHER, JSON.stringify(arr));
    } catch (e) { /* privates Fenster, dann bleibt der Stand nur im Speicher */ }
  }

  function loeschen() {
    try { window.sessionStorage.removeItem(SPEICHER); } catch (e) {}
  }

  function ersterOffener(arr) {
    var i;
    for (i = 0; i < arr.length; i++) if (!gueltig(arr[i])) return i;
    return 0;
  }

  function hatStand(arr) {
    var i;
    for (i = 0; i < arr.length; i++) if (gueltig(arr[i])) return true;
    return false;
  }

  function bootQuiz() {
    var go = document.getElementById("at-go");
    var start = document.getElementById("at-start");
    var flow = document.getElementById("at-flow");
    var label = document.getElementById("at-label");
    var bar = document.getElementById("at-bar");
    var screen = document.getElementById("at-screen");
    var back = document.getElementById("at-back");
    var next = document.getElementById("at-next");
    if (!go || !start || !flow || !screen || !label || !bar || !back || !next) return;

    var punkte = lesen();
    var index = 0;
    var timer = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (hatStand(punkte)) {
      go.textContent = "Weiter bei Frage " + (ersterOffener(punkte) + 1);
    }

    function zeichnen(i) {
      index = i;
      window.clearTimeout(timer);
      var frage = FRAGEN[i];
      label.textContent = "Frage " + (i + 1) + " von " + FRAGEN.length;
      bar.style.width = (((i + 1) / FRAGEN.length) * 100) + "%";
      screen.textContent = "";

      var feld = document.createElement("fieldset");
      feld.className = "choicecards at-frage";
      var legende = document.createElement("legend");
      legende.textContent = frage.text;
      feld.appendChild(legende);

      SKALA.forEach(function (opt) {
        var lab = document.createElement("label");
        lab.className = "choicecard";
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "at-antwort";
        input.value = String(opt.wert);
        if (punkte[i] === opt.wert) input.checked = true;
        var mark = document.createElement("span");
        mark.className = "choicecard__mark";
        var span = document.createElement("span");
        span.className = "choicecard__text";
        span.textContent = opt.text;
        lab.appendChild(input);
        lab.appendChild(mark);
        lab.appendChild(span);
        feld.appendChild(lab);
      });

      feld.addEventListener("change", function (e) {
        var v = Number(e.target.value);
        if (!gueltig(v)) return;
        punkte[i] = v;
        speichern(punkte);
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { weiter(); }, reduce ? 0 : 180);
      });

      screen.appendChild(feld);
      back.hidden = i === 0;
      next.hidden = !gueltig(punkte[i]);
      document.title = "Frage " + (i + 1) + " von " + FRAGEN.length + " · Abschalten-Test";
      flow.hidden = false;
      start.hidden = true;
      var faq = document.getElementById("fragen");
      if (faq) faq.hidden = true;
      legende.tabIndex = -1;
      legende.focus({ preventScroll: true });
      flow.scrollIntoView({ block: "start" });
    }

    function weiter() {
      window.clearTimeout(timer);
      if (!gueltig(punkte[index])) {
        next.hidden = false;
        return;
      }
      if (index < FRAGEN.length - 1) {
        zeichnen(index + 1);
        return;
      }
      var ergebnis = werten(punkte);
      if (!ergebnis) return;
      loeschen();
      window.location.assign("/abschalten-test/ergebnis/" + ergebnis.typ);
    }

    go.addEventListener("click", function () {
      zeichnen(ersterOffener(punkte));
    });
    back.addEventListener("click", function () {
      window.clearTimeout(timer);
      if (index > 0) zeichnen(index - 1);
    });
    next.addEventListener("click", weiter);
  }

  function boot() {
    bootPreis();
    bootTeilen();
    bootQuiz();
  }

  return {
    FRAGEN: FRAGEN,
    SKALA: SKALA,
    SCHWELLE_NIEDRIG: SCHWELLE_NIEDRIG,
    SCHWELLE_MIT_ERHOLUNG: SCHWELLE_MIT_ERHOLUNG,
    ERHOLUNG_MIN: ERHOLUNG_MIN,
    summieren: summieren,
    typVon: typVon,
    werten: werten,
    boot: boot
  };
});
