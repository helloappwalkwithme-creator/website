/* Umschalt-Check. Rechnung und Texte nur im Browser. Nichts wird gespeichert. */
(function (factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined" && api.boot) api.boot();
})(function () {
  "use strict";

  function round5(n) {
    return Math.round(n / 5) * 5;
  }

  var BEREICHE = [
    { id: "fokus", name: "Fokus", von: 0, bis: 1, max: 6, seite: "/fokus", profil: "Schwerpunkt Fokus", uebung: "Fokus im Job" },
    { id: "termine", name: "Termine", von: 2, bis: 4, max: 9, seite: "/termin", profil: "Schwerpunkt Termine", uebung: "die Minute vor dem Termin" },
    { id: "abschalten", name: "Abschalten", von: 5, bis: 6, max: 6, seite: "/abschalten", profil: "Schwerpunkt Abschalten", uebung: "Abschalten am Abend" },
    { id: "schlaf", name: "Schlaf", von: 7, bis: 8, max: 6, seite: "/nacht", profil: "Schwerpunkt Schlaf", uebung: "die Anleitung für die Nacht" },
    { id: "dranbleiben", name: "Dranbleiben", von: 9, bis: 9, max: 3, seite: "/clear-state/verhalten", profil: "Schwerpunkt Dranbleiben", uebung: "Schritt 1 in Clear State" }
  ];

  var TIE = ["schlaf", "abschalten", "termine", "fokus", "dranbleiben"];

  var BAND = {
    niedrig: "Hier liegt am meisten drin",
    mittel: "Läuft, mit Luft nach oben",
    hoch: "Sitzt schon"
  };

  function band(n) {
    if (n < 45) return "niedrig";
    if (n < 75) return "mittel";
    return "hoch";
  }

  function bewerten(punkte) {
    var werte = {};
    BEREICHE.forEach(function (b) {
      var sum = 0;
      var i;
      for (i = b.von; i <= b.bis; i++) sum += Number(punkte[i]) || 0;
      werte[b.id] = round5((sum / b.max) * 100);
    });
    var summe = 0;
    BEREICHE.forEach(function (b) { summe += werte[b.id]; });
    var gesamt = round5(summe / BEREICHE.length);
    var alleHoch = BEREICHE.every(function (b) { return werte[b.id] >= 75; });
    var profil = "gut";
    if (!alleHoch) {
      var min = Math.min.apply(null, BEREICHE.map(function (b) { return werte[b.id]; }));
      profil = TIE.filter(function (id) { return werte[id] === min; })[0];
    }
    return { werte: werte, gesamt: gesamt, profil: profil };
  }

  function bereich(id) {
    var i;
    for (i = 0; i < BEREICHE.length; i++) if (BEREICHE[i].id === id) return BEREICHE[i];
    return null;
  }

  var TEXTE = {
    gesamt: {
      niedrig: "Dein Umschalt-Wert liegt zwischen 0 und 44. In so einer Woche läuft viel auf Vollgas, und beim Runterkommen nach der Arbeit ist der größte Unterschied zu holen.",
      mittel: "Dein Umschalt-Wert liegt zwischen 45 und 74. Im Job kommst du rein. Beim Runterkommen nach der Arbeit ist noch Luft.",
      hoch: "Dein Umschalt-Wert liegt zwischen 75 und 100. Du kannst hochfahren und wieder runterkommen. Als Nächstes hältst du das auch in einer vollen Woche."
    },
    fokus: {
      niedrig: "Unter 45 springt der Kopf oft von der Aufgabe weg, bevor sie fertig ist. Morgen 25 Minuten an einer Sache, das Handy in der Schublade.",
      mittel: "Zwischen 45 und 74 kommst du in die Arbeit rein, bleibst aber nicht lange dran. Am Nachmittag merkst du es am ehesten. Ein Block ohne zweite Tabs reicht als Probe.",
      hoch: "Ab 75 bleibst du an Sachen dran. Das trägt dich, wenn der Tag eng wird."
    },
    termine: {
      niedrig: "Unter 45 geht der Puls vor wichtigen Gesprächen schnell hoch, und die Antwort kommt oft erst danach. Vor dem nächsten Termin: eine Minute ohne Handy und zwei Sätze, die du im Raum sagen willst.",
      mittel: "Zwischen 45 und 74 bist du im Termin da, brauchst aber ein paar Minuten, bis du klar bist. Die Minute kannst du dir vor der Tür holen.",
      hoch: "Ab 75 macht Druck dich wach, und du bleibst im Gespräch beim Satz."
    },
    abschalten: {
      niedrig: "Unter 45 ist der Laptop zu, und der Kopf ist oft noch bei der Arbeit. Wenn du heute zuklappst, schreib drei offene Punkte mit Uhrzeit für morgen auf, und dann steh auf.",
      mittel: "Zwischen 45 und 74 kommst du abends runter, aber spät. Je früher du umschaltest, desto mehr hast du vom Abend. Eine feste Uhrzeit im Kalender ist ein Anfang.",
      hoch: "Ab 75 kannst du Feierabend machen. Das schaffen viele mit vollem Kalender nicht."
    },
    schlaf: {
      niedrig: "Unter 45 arbeitet der Kopf im Bett oft weiter. Für heute Nacht reicht ein Zettel: was morgen ansteht, mit Uhrzeit, dann Licht aus.",
      mittel: "Zwischen 45 und 74 schläfst du, aber nicht immer gleich. Oft liegt der Grund im Abend davor. Dieselbe Liste wie vor dem Schlafen, dann Handy weg vom Bett.",
      hoch: "Ab 75 trägt dich der Schlaf. In einer vollen Woche lohnt sich derselbe Ablauf nochmal."
    },
    dranbleiben: {
      niedrig: "Unter 45 halten Vorsätze oft nur ein paar Tage. Meistens hängt der Plan an keiner festen Uhrzeit. Such dir einen Moment, den du jeden Tag hast, und häng eine Sache daran.",
      mittel: "Zwischen 45 und 74 hält ein Vorsatz eine Weile, dann reißt er. Such den Tag, an dem es zuletzt gekippt ist, und schreib die Uhrzeit auf.",
      hoch: "Ab 75 bleibt, was du dir vornimmst. Damit kriegst du die anderen Bereiche leichter hin."
    }
  };

  var DRUCK = {
    rattert: "Wenn bei dir unter Druck der Kopf rattert, hilft Aufschreiben oft mehr als Weiterdenken.",
    dicht: "Wenn du unter Druck dicht machst, hilft eine Minute, bevor du antwortest.",
    ungeduldig: "Wenn du unter Druck ungeduldig wirst, hilft länger ausatmen, bevor du redest.",
    leitung: "Wenn du unter Druck kurz auf der Leitung stehst, hilft eine Minute vorher, ohne Handy."
  };

  function vorschlag(id, n) {
    return TEXTE[id][band(n)];
  }

  var SCREENS = [
    {
      id: "typ", art: "wort", feld: "typ",
      frage: "Wie läuft es bei dir gerade?",
      hinweis: "Eine Antwort reicht. Sie ändert deinen Wert nicht.",
      antworten: [
        { text: "Ich bin dauernd unter Strom", wert: "strom" },
        { text: "Ich bin abends platt", wert: "platt" },
        { text: "Ich reagiere schneller, als mir lieb ist", wert: "schnell" },
        { text: "Ich kriege den Kopf nicht aus der Arbeit", wert: "kopf" },
        { text: "Ich bin zerstreut", wert: "zerstreut" },
        { text: "Eigentlich gut, ich will mehr rausholen", wert: "gut" },
        { text: "Schwer zu sagen", wert: "offen" }
      ]
    },
    {
      id: "ort", art: "wort", feld: "ort",
      frage: "Wo merkst du es am meisten?",
      antworten: [
        { text: "Bei der Arbeit", wert: "arbeit" },
        { text: "Vor Terminen", wert: "termine" },
        { text: "Zu Hause", wert: "zuhause" },
        { text: "Abends", wert: "abend" },
        { text: "Im Bett", wert: "bett" },
        { text: "Überall ein bisschen", wert: "ueberall" }
      ]
    },
    {
      id: "druckart", art: "wort", feld: "druckart",
      frage: "Was passiert bei dir unter Druck?",
      antworten: [
        { text: "Der Kopf rattert", wert: "rattert" },
        { text: "Ich mache dicht", wert: "dicht" },
        { text: "Ich werde ungeduldig", wert: "ungeduldig" },
        { text: "Ich stehe kurz auf der Leitung", wert: "leitung" }
      ]
    },
    {
      id: "f1", art: "punkte", bereich: "Fokus",
      frage: "Du sitzt an einer Aufgabe, die Kopf braucht. Wie oft gehst du in einer halben Stunde ans Handy oder in einen anderen Tab?",
      hinweis: "Nimm eine normale Woche, nicht die beste und nicht die schlimmste.",
      antworten: [
        { text: "Ständig, ich merke es kaum", punkte: 0 },
        { text: "Bestimmt fünfmal", punkte: 1 },
        { text: "Ein, zwei Mal", punkte: 2 },
        { text: "Ich bleibe meistens dran", punkte: 3 }
      ]
    },
    {
      id: "f2", art: "punkte", bereich: "Fokus",
      frage: "Es ist 15 Uhr. Wie klar bist du im Kopf, verglichen mit 9 Uhr?",
      antworten: [
        { text: "Deutlich langsamer, ich schiebe Sachen", punkte: 0 },
        { text: "Merklich weniger", punkte: 1 },
        { text: "Etwas weniger", punkte: 2 },
        { text: "Fast gleich", punkte: 3 }
      ]
    },
    {
      id: "f3", art: "punkte", bereich: "Termine",
      frage: "Gleich ist der wichtige Kundentermin oder das Gespräch mit dem Chef. Was passiert bei dir?",
      antworten: [
        { text: "Der Puls geht hoch, der Kopf ist leer, ich rede zu schnell", punkte: 0 },
        { text: "Der Puls geht hoch, ich komme erst nach ein paar Minuten rein", punkte: 1 },
        { text: "Ein bisschen angespannt, aber ich bin da", punkte: 2 },
        { text: "Ich bin wach und klar", punkte: 3 }
      ]
    },
    {
      id: "f4", art: "punkte", bereich: "Termine",
      frage: "Eine Mail ärgert dich. Was machst du?",
      antworten: [
        { text: "Ich antworte sofort, und es ist zu scharf", punkte: 0 },
        { text: "Ich antworte sofort und bereue es manchmal", punkte: 1 },
        { text: "Ich warte kurz, dann antworte ich", punkte: 2 },
        { text: "Ich lege mir eine Uhrzeit für die Antwort fest", punkte: 3 }
      ]
    },
    {
      id: "f5", art: "punkte", bereich: "Termine",
      frage: "Im Gespräch kommt eine Frage, mit der du nicht gerechnet hast. Was passiert?",
      antworten: [
        { text: "Ich rede schneller und verliere den Faden", punkte: 0 },
        { text: "Ich brauche einen Moment, dann bin ich wieder da", punkte: 1 },
        { text: "Ich hole kurz Luft und antworte", punkte: 2 },
        { text: "Ich habe meistens einen Satz parat", punkte: 3 }
      ]
    },
    {
      id: "f6", art: "punkte", bereich: "Abschalten",
      frage: "Du klappst den Laptop zu. Wie lange ist dein Kopf danach noch bei der Arbeit?",
      antworten: [
        { text: "Bis ins Bett", punkte: 0 },
        { text: "Ein, zwei Stunden", punkte: 1 },
        { text: "Eine halbe Stunde", punkte: 2 },
        { text: "Kaum, ich bin schnell zu Hause", punkte: 3 }
      ]
    },
    {
      id: "f7", art: "punkte", bereich: "Abschalten",
      frage: "Wie oft schaust du abends nach Feierabend noch in Mails oder Teams?",
      antworten: [
        { text: "Fast jeden Abend, oft länger", punkte: 0 },
        { text: "Mehrmals die Woche", punkte: 1 },
        { text: "Selten, nur wenn etwas ansteht", punkte: 2 },
        { text: "Gar nicht", punkte: 3 }
      ]
    },
    {
      id: "f8", art: "punkte", bereich: "Schlaf",
      frage: "Du liegst im Bett. Wie lange dauert es, bis du schläfst?",
      antworten: [
        { text: "Lange, der Kopf geht die Liste durch", punkte: 0 },
        { text: "Oft länger als eine halbe Stunde", punkte: 1 },
        { text: "Meist unter einer halben Stunde", punkte: 2 },
        { text: "Ich schlafe schnell ein", punkte: 3 }
      ]
    },
    {
      id: "f9", art: "punkte", bereich: "Schlaf",
      frage: "Du wachst nachts auf. Was passiert dann?",
      antworten: [
        { text: "Ich bin wach und denke an die Arbeit", punkte: 0 },
        { text: "Ich brauche lange, bis ich wieder schlafe", punkte: 1 },
        { text: "Ich schlafe meist bald wieder ein", punkte: 2 },
        { text: "Ich wache selten auf", punkte: 3 }
      ]
    },
    {
      id: "f10", art: "punkte", bereich: "Dranbleiben",
      frage: "Du nimmst dir etwas fest vor, früher Schluss oder dreimal Sport. Wie lange hält das?",
      antworten: [
        { text: "Zwei, drei Tage", punkte: 0 },
        { text: "Etwa eine Woche", punkte: 1 },
        { text: "Ein paar Wochen", punkte: 2 },
        { text: "Meistens bleibt es", punkte: 3 }
      ]
    },
    {
      id: "ziel", art: "wort", feld: "ziel",
      frage: "Was hättest du am liebsten zurück?",
      antworten: [
        { text: "Klaren Kopf im Meeting", wert: "Klaren Kopf im Meeting" },
        { text: "Abende, an denen ich zu Hause bin", wert: "Abende, an denen ich zu Hause bin" },
        { text: "Durchschlafen", wert: "Durchschlafen" },
        { text: "Morgens fit aufwachen", wert: "Morgens fit aufwachen" },
        { text: "Ruhe bei Druck", wert: "Ruhe bei Druck" }
      ]
    }
  ];

  function boot() {
    if (!document.body || document.body.getAttribute("data-page") !== "check") return;
    var start = document.getElementById("uc-start");
    var flow = document.getElementById("uc-flow");
    var result = document.getElementById("uc-result");
    var host = document.getElementById("uc-screen");
    var count = document.getElementById("uc-count");
    var back = document.getElementById("uc-back");
    var go = document.getElementById("uc-go");
    if (!start || !host) return;

    var index = 0;
    var worte = {};
    var punkte = [];
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function punkteIndex(screen) {
      var n = 0;
      var i;
      for (i = 0; i < SCREENS.length; i++) {
        if (SCREENS[i].id === screen.id) return n;
        if (SCREENS[i].art === "punkte") n++;
      }
      return -1;
    }

    function gewaehlt(screen) {
      if (screen.art === "punkte") return punkte[punkteIndex(screen)];
      return worte[screen.feld];
    }

    function zeige(i) {
      index = i;
      var screen = SCREENS[i];
      start.hidden = true;
      result.hidden = true;
      flow.hidden = false;
      count.textContent = (i + 1) + " von " + SCREENS.length;
      host.innerHTML = "";
      var fs = document.createElement("fieldset");
      fs.className = "ucfrage";
      var legend = document.createElement("legend");
      legend.textContent = screen.frage;
      fs.appendChild(legend);
      if (screen.bereich) {
        var klein = document.createElement("p");
        klein.className = "ucbereich";
        klein.textContent = screen.bereich;
        fs.appendChild(klein);
      }
      if (screen.hinweis) {
        var hin = document.createElement("p");
        hin.className = "uchinweis";
        hin.textContent = screen.hinweis;
        fs.appendChild(hin);
      }
      var stand = gewaehlt(screen);
      screen.antworten.forEach(function (a, ai) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ucantwort";
        btn.textContent = a.text;
        var mark = screen.art === "punkte" ? a.punkte : a.wert;
        if (stand === mark) btn.setAttribute("aria-pressed", "true");
        btn.addEventListener("click", function () { waehle(screen, a, btn); });
        fs.appendChild(btn);
        if (ai === 0) btn.dataset.first = "1";
      });
      host.appendChild(fs);
      back.hidden = i === 0;
      var focusEl = fs.querySelector("legend");
      if (focusEl) {
        focusEl.tabIndex = -1;
        focusEl.focus({ preventScroll: true });
      }
      flow.scrollIntoView({ block: "start" });
    }

    function waehle(screen, antwort) {
      if (screen.art === "punkte") punkte[punkteIndex(screen)] = antwort.punkte;
      else worte[screen.feld] = antwort.wert;
      var wait = reduce ? 0 : 250;
      window.setTimeout(function () {
        if (index >= SCREENS.length - 1) ergebnis();
        else zeige(index + 1);
      }, wait);
    }

    function satzZiel() {
      if (!worte.ziel) return "";
      return "Am liebsten hättest du das hier zurück: " + worte.ziel + ". Der Vorschlag unten geht in die Richtung.";
    }

    function ergebnis() {
      var r = bewerten(punkte);
      flow.hidden = true;
      result.hidden = false;
      var profilId = r.profil === "gut" ? null : r.profil;
      var profilBereich = profilId ? bereich(profilId) : null;
      var name = profilBereich ? profilBereich.profil : "Gut aufgestellt";
      document.getElementById("uc-profil").textContent = name;
      document.getElementById("uc-zahl").textContent = String(r.gesamt);
      document.getElementById("uc-gesamt-satz").textContent = TEXTE.gesamt[band(r.gesamt)];
      var extra = document.getElementById("uc-extra");
      extra.innerHTML = "";
      if (worte.typ === "gut") {
        var p = document.createElement("p");
        p.textContent = "Du sagst, es läuft gut. Der Check zeigt, wo noch Luft ist.";
        extra.appendChild(p);
      }
      if (worte.ziel) {
        var z = document.createElement("p");
        z.textContent = satzZiel();
        extra.appendChild(z);
      }
      if (worte.druckart && DRUCK[worte.druckart]) {
        var d = document.createElement("p");
        d.textContent = DRUCK[worte.druckart];
        extra.appendChild(d);
      }

      var liste = BEREICHE.slice().sort(function (a, b) { return r.werte[a.id] - r.werte[b.id]; });
      var ul = document.getElementById("uc-balken");
      ul.innerHTML = "";
      var offen = profilId || liste[0].id;
      liste.forEach(function (b) {
        var n = r.werte[b.id];
        var li = document.createElement("li");
        li.className = "ucbar" + (b.id === offen ? " is-open" : "") + " is-" + band(n);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ucbar__kopf";
        btn.setAttribute("aria-expanded", b.id === offen ? "true" : "false");
        btn.innerHTML = '<span class="ucbar__name"></span><span class="ucbar__track" aria-hidden="true"><span class="ucbar__fill"></span></span><span class="ucbar__zahl"></span>';
        btn.querySelector(".ucbar__name").textContent = b.name;
        btn.querySelector(".ucbar__zahl").textContent = String(n);
        var fill = btn.querySelector(".ucbar__fill");
        fill.style.width = "0%";
        window.requestAnimationFrame(function () { fill.style.width = n + "%"; });
        var body = document.createElement("div");
        body.className = "ucbar__text";
        body.hidden = b.id !== offen;
        var stufe = document.createElement("p");
        stufe.className = "ucbar__stufe";
        stufe.textContent = BAND[band(n)] + ". " + (n < 45 ? "0 bis 44." : n < 75 ? "45 bis 74." : "75 bis 100.");
        var satz = document.createElement("p");
        satz.textContent = vorschlag(b.id, n);
        body.appendChild(stufe);
        body.appendChild(satz);
        btn.addEventListener("click", function () {
          var open = body.hidden;
          ul.querySelectorAll(".ucbar__text").forEach(function (el) { el.hidden = true; });
          ul.querySelectorAll(".ucbar__kopf").forEach(function (el) { el.setAttribute("aria-expanded", "false"); });
          ul.querySelectorAll(".ucbar").forEach(function (el) { el.classList.remove("is-open"); });
          if (open) {
            body.hidden = false;
            btn.setAttribute("aria-expanded", "true");
            li.classList.add("is-open");
          }
        });
        li.appendChild(btn);
        li.appendChild(body);
        ul.appendChild(li);
      });

      var link = document.getElementById("uc-uebung");
      if (profilBereich) {
        link.hidden = false;
        link.href = profilBereich.seite;
        link.textContent = "Die passende Übung: " + profilBereich.uebung;
      } else {
        link.hidden = false;
        link.href = "/clear-state";
        link.textContent = "Die sieben Schritte in Clear State ansehen";
      }

      var aria = BEREICHE.map(function (b) { return b.name + " " + r.werte[b.id]; }).join(", ");
      var wo = profilBereich ? profilBereich.name : "keinem einzelnen Bereich";
      document.getElementById("uc-aria").textContent = "Dein Umschalt-Check. " + aria + ". Am meisten liegt bei " + wo + " drin.";
      result.scrollIntoView({ block: "start" });
      var h = document.getElementById("uc-profil");
      if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    }

    if (go) go.addEventListener("click", function () { zeige(0); });
    back.addEventListener("click", function () {
      if (index > 0) zeige(index - 1);
    });
    var neu = document.getElementById("uc-neu");
    if (neu) neu.addEventListener("click", function (e) {
      e.preventDefault();
      worte = {};
      punkte = [];
      result.hidden = true;
      start.hidden = false;
      start.scrollIntoView({ block: "start" });
    });
  }

  return {
    bewerten: bewerten,
    band: band,
    round5: round5,
    BEREICHE: BEREICHE,
    SCREENS: SCREENS,
    vorschlag: vorschlag,
    boot: boot
  };
});
