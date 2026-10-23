/* kreis.js - Der Kreis, Fassung 3.
   Eine Datei fuer die Uebersicht und alle sieben Schritte. Keine Fremdbibliothek.

   Aufbau:
   1. Einstieg auf /kreis: Er tippt an, was ihn nervt, und landet beim passenden Schritt.
   2. Die Reihenfolge laeuft von dort weiter und faengt nach Schritt 7 wieder bei 1 an.
   3. Roter Faden: sein Problem steht in seinen Worten oben auf jeder Seite.
   4. Vier Teile pro Schritt: Frage, Was dahintersteckt, Uebung, Mitnehmen.
   5. Anmeldung erst nach einer gemachten Uebung, mit denselben Supabase-Aufrufen
      wie starter.js.

   WICHTIG: siehe EINRICHTEN-KREIS.md im Repo-Wurzelordner. Solange kein kreis_flow
   in Supabase liegt und kein Make-Szenario ihn ausliefert, bleibt KREIS_FLOW_AKTIV
   auf false. Dann wird der Lead nur gespeichert und Janosch bekommt die Hinweis-Mail. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- Anbindung */

  var SUPABASE_URL = "https://jztwnumtwihomgxwlwor.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yWcwDruITLbaok1rBl4Fiw_Ddjn9xZe";

  var KREIS_FLOW = "kreis_flow";
  var KREIS_FLOW_AKTIV = false;   /* auf true stellen, wenn Flow und Make stehen */
  var BEWERBUNG_AKTIV = false;    /* auf true stellen, wenn die Bewerbung offen ist */
  var MAGNET = "kreis";           /* damit Make die Kreis-Leute getrennt beschickt */

  var waNumber = "491632225456";
  var tgBotName = "shift_my_horizon_bot";
  var botMessage = "Hi Janosch, ich mach den Kreis. Schick mir den nächsten Schritt.";
  var accessLabel = "Dein Code:";

  /* ------------------------------------------------------- Die sieben Schritte */

  var STUFEN = [
    { slug: "verhalten", titel: "Verhalten",
      kurz: "Warum dein Plan immer an derselben Stelle kippt.",
      faden: "Hier geht es um das, was du jeden Tag tust. Du findest den Moment, an dem dein Plan kippt." },
    { slug: "gefuehle", titel: "Gefühle",
      kurz: "Was dich wirklich stört, wenn du sauer bist.",
      faden: "Wenn du sauer bist, steckt meistens was anderes dahinter. Hier findest du raus, was." },
    { slug: "alarm", titel: "Alarm und Planer",
      kurz: "Warum du reagierst, bevor du nachdenkst.",
      faden: "In dir gibt es einen schnellen Alarm und einen langsamen Planer. Hier verschaffst du dem Planer eine Sekunde." },
    { slug: "ruhe", titel: "Innere Ruhe",
      kurz: "Wie du abends wirklich Feierabend hast.",
      faden: "Du bist zu Hause, aber dein Kopf ist noch im Büro. Hier holst du ihn raus." },
    { slug: "satz", titel: "Der Satz",
      kurz: "Der Satz, der dich antreibt und nie Pause macht.",
      faden: "In deinem Kopf läuft ein Satz, der dich antreibt. Hier schreibst du ihn einmal auf." },
    { slug: "werte", titel: "Werte",
      kurz: "Was dir wirklich wichtig ist, und woran du das merkst.",
      faden: "Hier findest du raus, was dir wirklich wichtig ist und was nur gut klingt." },
    { slug: "wofuer", titel: "Für wen",
      kurz: "Für wen du das alles machst.",
      faden: "Am Ende die Frage, für wen du das alles machst. Daraus machst du einen festen Termin." }
  ];

  /* ------------------------------------------ Was nervt dich gerade am meisten */

  var PROBLEME = [
    { id: "abends",
      frage: "Abends geht mein Kopf nicht aus.",
      du: "Dein Kopf geht abends nicht aus.",
      satz: "Erst eine Minute runterfahren. Dann kriegst du deinen Feierabend zurück.",
      start: "ruhe",
      startsatz: "Du startest bei Schritt 4, weil dein Kopf abends nicht ausgeht. Die anderen Schritte kommen danach.",
      weiter: { nach: "ruhe", href: "/abschalten",
                text: "Dein Kopf geht abends nicht aus. Dazu hab ich eine eigene Seite gebaut.",
                knopf: "Zeig mir, wie ich abschalte" } },

    { id: "nachts",
      frage: "Ich wach nachts auf und denk an die Arbeit.",
      du: "Du wachst nachts auf und denkst an die Arbeit.",
      satz: "Erst eine Minute runterfahren. Dann kümmern wir uns um deine Nächte.",
      start: "ruhe",
      startsatz: "Du startest bei Schritt 4, weil du nachts wach wirst. Die anderen Schritte kommen danach.",
      variante: "nachts",
      weiter: { nach: "ruhe", href: "/nacht",
                text: "Du wachst nachts auf. Dafür hab ich eine eigene Seite, mit einer Sache, die du direkt im Bett machen kannst.",
                knopf: "Zeig mir, was ich heute Nacht mache" } },

    { id: "laut",
      frage: "Zu Hause bin ich schnell gereizt.",
      du: "Du bist zu Hause schnell gereizt.",
      satz: "Erst findest du raus, was dich wirklich stört. Dann bleibst du zu Hause ruhiger.",
      start: "gefuehle",
      startsatz: "Du startest bei Schritt 2, weil du zu Hause schnell gereizt bist. Die anderen Schritte kommen danach." },

    { id: "fokus",
      frage: "Ich krieg mich bei der Arbeit nicht konzentriert.",
      du: "Du kriegst dich bei der Arbeit nicht konzentriert.",
      satz: "Erst schaust du, was dich rausreißt. Dann bleibst du länger an einer Sache dran.",
      start: "alarm",
      startsatz: "Du startest bei Schritt 3, weil du dich bei der Arbeit schwer konzentrierst. Die anderen Schritte kommen danach.",
      variante: "fokus",
      weiter: { nach: "alarm", href: "/fokus",
                text: "Du kriegst dich bei der Arbeit schwer konzentriert. Dazu hab ich eine eigene Seite gebaut.",
                knopf: "Zeig mir, wie ich dranbleibe" } },

    { id: "puls",
      frage: "Vor wichtigen Terminen bin ich total angespannt.",
      du: "Du bist vor wichtigen Terminen total angespannt.",
      satz: "Erst eine Minute, die dich runterholt. Dann gehst du klar in den Termin.",
      start: "alarm",
      startsatz: "Du startest bei Schritt 3, weil du vor wichtigen Terminen angespannt bist. Die anderen Schritte kommen danach.",
      variante: "puls",
      weiter: { nach: "alarm", href: "/termin",
                text: "Du bist vor wichtigen Terminen angespannt. Dafür hab ich eine eigene Seite, für die Minute davor.",
                knopf: "Zeig mir die Minute vor dem Termin" } },

    { id: "handy",
      frage: "Ich hab ständig das Handy in der Hand.",
      du: "Du hast ständig das Handy in der Hand.",
      satz: "Erst findest du den Moment, in dem du zum Handy greifst. Dann bleibt es öfter liegen.",
      start: "verhalten",
      startsatz: "Du startest bei Schritt 1, weil du ständig das Handy in der Hand hast. Die anderen Schritte kommen danach." },

    { id: "vorsatz",
      frage: "Ich nehm mir was vor, und nach drei Tagen ist es weg.",
      du: "Du nimmst dir was vor, und nach drei Tagen ist es weg.",
      satz: "Erst findest du den Moment, an dem es jedes Mal kippt. Dann hält dein Plan länger als drei Tage.",
      start: "verhalten",
      startsatz: "Du startest bei Schritt 1, weil deine Pläne nach drei Tagen weg sind. Die anderen Schritte kommen danach." },

    { id: "aufhoeren",
      frage: "Ich hör abends einfach nicht auf zu arbeiten.",
      du: "Du hörst abends einfach nicht auf zu arbeiten.",
      satz: "Erst findest du den Satz, der dich weitermachen lässt. Dann kannst du abends wirklich Schluss machen.",
      start: "satz",
      startsatz: "Du startest bei Schritt 5, weil du abends nicht aufhörst zu arbeiten. Die anderen Schritte kommen danach.",
      weiter: { nach: "satz", href: "/abschalten",
                text: "Dein Kopf geht abends nicht aus. Dazu hab ich eine eigene Seite gebaut.",
                knopf: "Zeig mir, wie ich abschalte" } }
  ];

  /* ------------------------------------- Neugier auf den naechsten Schritt --- */

  var TEASER = {
    "verhalten>gefuehle": { h: "Warum kippt es genau dann, wenn du sauer bist?",
      s: "Hinter dem Ärger steckt fast immer was anderes. Im nächsten Schritt findest du raus, was." },
    "gefuehle>alarm": { h: "Warum reagierst du, bevor du nachdenkst?",
      s: "Da sind ein schneller Alarm und ein langsamer Planer. Im nächsten Schritt verschaffst du dem Planer eine Sekunde." },
    "alarm>ruhe": { h: "Und warum geht der Alarm abends nicht aus?",
      s: "Das Meeting ist vorbei, dein Puls ist noch drin. Im nächsten Schritt holst du ihn runter." },
    "ruhe>satz": { h: "Was lässt dich abends weitermachen, obwohl Schluss ist?",
      s: "Meistens ist es ein Satz, den du schon lange hast. Im nächsten Schritt schreibst du ihn auf." },
    "satz>werte": { h: "Wofür lohnt sich der ganze Einsatz eigentlich?",
      s: "Nicht alles, was gut klingt, ist dir wirklich wichtig. Im nächsten Schritt merkst du den Unterschied." },
    "werte>wofuer": { h: "Für wen machst du das alles?",
      s: "Im nächsten Schritt machst du daraus einen festen Termin. Zwanzig Minuten reichen." },
    "wofuer>verhalten": { h: "Jetzt nochmal von vorne, nur mit Richtung.",
      s: "Du nimmst dir dasselbe vor wie vorher. Diesmal weißt du, warum es bisher nicht geklappt hat." }
  };

  function stufeVon(slug) {
    for (var i = 0; i < STUFEN.length; i++) if (STUFEN[i].slug === slug) return STUFEN[i];
    return null;
  }
  function indexVon(slug) {
    for (var i = 0; i < STUFEN.length; i++) if (STUFEN[i].slug === slug) return i;
    return -1;
  }
  function problemVon(id) {
    for (var i = 0; i < PROBLEME.length; i++) if (PROBLEME[i].id === id) return PROBLEME[i];
    return null;
  }
  /* Nach Schritt 7 geht es wieder bei 1 weiter. */
  function naechsteStufe(slug) {
    return STUFEN[(indexVon(slug) + 1) % STUFEN.length];
  }

  /* ------------------------------------------------------------------ Der Stand */

  var KEY = "smh_kreis_v3";

  function stand() {
    try {
      var roh = window.localStorage.getItem(KEY);
      var o = roh ? JSON.parse(roh) : null;
      if (!o || typeof o !== "object") o = {};
      if (!o.stufen || typeof o.stufen !== "object") o.stufen = {};
      return o;
    } catch (e) { return { stufen: {} }; }
  }

  function merken(aenderung) {
    try {
      var o = stand();
      aenderung(o);
      window.localStorage.setItem(KEY, JSON.stringify(o));
    } catch (e) { /* privates Fenster oder Speicher aus: der Ablauf geht trotzdem */ }
  }

  function fertigeStufen(o) {
    return STUFEN.filter(function (s) { return o.stufen[s.slug] && o.stufen[s.slug].fertig; });
  }

  /* ----------------------------------------------------------- Kleine Helfer */

  function el(sel, wurzel) { return (wurzel || document).querySelector(sel); }
  function alle(sel, wurzel) { return Array.prototype.slice.call((wurzel || document).querySelectorAll(sel)); }

  function liste(woerter, klasse) {
    var ul = document.createElement("ul");
    ul.className = "kwords" + (klasse ? " " + klasse : "");
    woerter.forEach(function (w) {
      var li = document.createElement("li");
      li.textContent = w;
      ul.appendChild(li);
    });
    return ul;
  }

  function aufzaehlung(woerter) {
    if (!woerter.length) return "";
    if (woerter.length === 1) return woerter[0];
    return woerter.slice(0, -1).join(", ") + " und " + woerter[woerter.length - 1];
  }

  function mischen(arr, anzahl) {
    var kopie = arr.slice();
    for (var i = kopie.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = kopie[i]; kopie[i] = kopie[j]; kopie[j] = t;
    }
    return kopie.slice(0, anzahl);
  }

  function setze(name, inhalt) {
    alle('[data-kfill="' + name + '"]').forEach(function (ziel) {
      ziel.innerHTML = "";
      if (typeof inhalt === "string") ziel.textContent = inhalt;
      else if (inhalt) ziel.appendChild(inhalt.cloneNode(true));
    });
  }

  function zeige(name, an) {
    alle('[data-kif="' + name + '"]').forEach(function (ziel) { ziel.hidden = !an; });
  }

  /* --------------------------------- Die passende Frage fuer sein Problem --- */

  function initVariante(slug) {
    var bloecke = alle("[data-kvariante]");
    if (!bloecke.length) return;
    var o = stand();
    var p = o.problem ? problemVon(o.problem) : null;
    var gewuenscht = (p && p.variante && p.start === slug) ? p.variante : "standard";
    var treffer = bloecke.some(function (b) { return b.getAttribute("data-kvariante") === gewuenscht; });
    if (!treffer) gewuenscht = "standard";
    bloecke.forEach(function (b) {
      if (b.getAttribute("data-kvariante") !== gewuenscht) b.parentNode.removeChild(b);
      else b.removeAttribute("hidden");
    });
  }

  /* ------------------------------------------------------- Der rote Faden oben */

  function initFaden(slug) {
    var ziel = el("[data-kfaden]");
    if (!ziel) return;
    var o = stand();
    var stufe = stufeVon(slug);
    var p = o.problem ? problemVon(o.problem) : null;
    if (!p) { ziel.hidden = true; return; }
    ziel.hidden = false;
    /* Beim Einstieg steht, warum er hier anfaengt. Danach der Faden-Satz. */
    ziel.textContent = (p.start === slug && p.startsatz)
      ? p.startsatz
      : p.du + " " + stufe.faden;
  }

  /* ----------------------------------- Die eine Fortschrittsanzeige (Leiter) */

  function initLeiter(slug) {
    var ziel = el("[data-kleiter]");
    if (!ziel) return;
    var o = stand();
    ziel.innerHTML = "";
    STUFEN.forEach(function (s, i) {
      var li = document.createElement("li");
      var hier = s.slug === slug;
      var fertig = !!(o.stufen[s.slug] && o.stufen[s.slug].fertig);
      li.className = "kleiter__e" + (hier ? " is-hier" : "") + (fertig ? " is-fertig" : "") + (s.slug === o.start ? " is-start" : "");
      var a = document.createElement(hier ? "span" : "a");
      if (!hier) a.href = "/kreis/" + s.slug;
      a.className = "kleiter__p";
      a.textContent = String(i + 1);
      if (hier) a.setAttribute("aria-current", "step");
      a.title = "Schritt " + (i + 1) + ": " + s.titel + (s.slug === o.start ? " (hier startest du)" : "");
      li.appendChild(a);
      ziel.appendChild(li);
    });
    var hinweis = el("[data-kleiter-text]");
    if (hinweis) hinweis.textContent = "Schritt " + (indexVon(slug) + 1) + " von 7";
  }

  /* -------------------------------------------- Die Teile einer Schritt-Seite */

  function auswahl() {
    return alle(".kgrid[data-kpick] input:checked").map(function (i) {
      var label = i.closest(".kchip");
      return {
        wert: i.value,
        gruppe: i.getAttribute("data-g") || "",
        frage: i.getAttribute("data-q") || "",
        text: label ? label.textContent.replace(/\s+/g, " ").trim() : i.value
      };
    });
  }

  function nichtGewaehlt(gruppe) {
    return alle('.kgrid[data-kpick] input[data-g="' + gruppe + '"]')
      .filter(function (i) { return !i.checked; })
      .map(function (i) { return i.value; });
  }

  function felder() {
    var werte = {};
    alle("[data-kfeld]").forEach(function (e) {
      var name = e.getAttribute("data-kfeld");
      if (e.tagName === "INPUT" && e.type === "radio") { if (e.checked) werte[name] = e.value; }
      else if (e.tagName === "INPUT" || e.tagName === "TEXTAREA") { if (e.value.trim()) werte[name] = e.value.trim(); }
    });
    return werte;
  }

  function fuelleVorlage(vorlage, werte) {
    return vorlage.replace(/\{(\w+)\}/g, function (_, k) { return werte[k] || "…"; });
  }

  /* --------------------------------------------------------- Uebung: die Uhr */

  function initUhren(fertigGemeldet) {
    var reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    alle('[data-kuebung="timer"]').forEach(function (box) {
      var gesamt = 60;
      var anzeige = el("[data-kue-zeit]", box);
      var phase = el("[data-kue-phase]", box);
      var kreis = el(".kuhr__kreis", box);
      var knopf = el("[data-kue-start]", box);
      var danach = el("[data-kue-fertig]", box);
      var atem = box.getAttribute("data-kue-atem") === "true";
      var laeuft = false, ende = 0, tick = null, timers = [];
      var startLabel = knopf ? knopf.textContent : "";

      function stopp() {
        laeuft = false;
        if (tick) clearInterval(tick); tick = null;
        timers.forEach(clearTimeout); timers = [];
        if (kreis) { kreis.style.transitionDuration = "600ms"; kreis.style.transform = "scale(1)"; }
        if (phase) phase.textContent = "";
      }

      /* Vier Sekunden ein, acht Sekunden aus. Nur Text, wenn Bewegung aus ist. */
      function atemZyklus() {
        if (!laeuft || !atem) return;
        if (phase) phase.textContent = "ein";
        if (kreis && !reduziert) { kreis.style.transitionDuration = "4000ms"; kreis.style.transform = "scale(1.25)"; }
        timers.push(setTimeout(function () {
          if (!laeuft) return;
          if (phase) phase.textContent = "aus";
          if (kreis && !reduziert) { kreis.style.transitionDuration = "8000ms"; kreis.style.transform = "scale(0.92)"; }
          timers.push(setTimeout(atemZyklus, 8000));
        }, 4000));
      }

      function fertig() {
        stopp();
        anzeige.textContent = "0";
        knopf.textContent = "Nochmal";
        if (danach) danach.hidden = false;
        box.classList.add("is-fertig");
        fertigGemeldet();
      }

      knopf.addEventListener("click", function () {
        if (laeuft) {
          stopp();
          anzeige.textContent = String(gesamt);
          knopf.textContent = startLabel;
          return;
        }
        gesamt = Number(box.getAttribute("data-sekunden")) || 60;
        laeuft = true;
        ende = Date.now() + gesamt * 1000;
        knopf.textContent = "Stopp";
        if (danach) danach.hidden = true;
        anzeige.textContent = String(gesamt);
        atemZyklus();
        tick = setInterval(function () {
          var rest = Math.max(0, Math.ceil((ende - Date.now()) / 1000));
          anzeige.textContent = String(rest);
          if (rest <= 0) fertig();
        }, 200);
      });
    });
  }

  /* ------------------------------------------------------ Die Teile schalten */

  function initSchritt(slug) {
    var teile = alle(".kstep[data-kstep]");
    if (!teile.length) return;

    var maxTeil = teile.reduce(function (m, s) { return Math.max(m, Number(s.dataset.kstep)); }, 0);
    var aktuell = 1;
    var uhrenOffen = alle('.kstep[data-kstep="3"] [data-kuebung="timer"]').length;
    var uhrenFertig = 0;

    initUhren(function () { uhrenFertig++; pruefeUebung(); });

    function pruefeUebung() {
      var knopf = el('.kstep[data-kstep="3"] [data-knext-step]');
      if (!knopf) return;
      var pflicht = alle('.kstep[data-kstep="3"] [data-kpflicht]');
      var werte = felder();
      var allesDa = pflicht.every(function (f) { return !!werte[f.getAttribute("data-kfeld")]; });
      var offen = (uhrenFertig < uhrenOffen) || !allesDa;
      knopf.classList.toggle("btn--inactive", offen);
      knopf.setAttribute("aria-disabled", offen ? "true" : "false");
      var hinweis = el("[data-kue-hinweis]");
      if (hinweis) hinweis.hidden = !offen;
    }

    function zeigeTeil(n, scrollen) {
      aktuell = n;
      teile.forEach(function (s) { s.classList.toggle("is-active", Number(s.dataset.kstep) === n); });
      if (scrollen) {
        var kopf = el("[data-ktop]") || document.body;
        kopf.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      /* Fokus auf die neue Ueberschrift, damit Tastatur und Vorleseprogramm mitkommen. */
      var aktiv = el('.kstep[data-kstep="' + n + '"]');
      var ueberschrift = aktiv ? el("h1, h2", aktiv) : null;
      if (ueberschrift) { ueberschrift.setAttribute("tabindex", "-1"); if (scrollen) ueberschrift.focus({ preventScroll: true }); }

      if (n === 3) pruefeUebung();
      if (n === maxTeil) {
        var werte = felder();
        var mit = el("[data-kmit]");
        var text = mit ? fuelleVorlage(mit.getAttribute("data-kmit"), werte) : "";
        if (mit) mit.textContent = text;
        merken(function (o) {
          o.stufen[slug] = o.stufen[slug] || {};
          o.stufen[slug].fertig = true;
          o.stufen[slug].mitnehmen = text;
          o.stufen[slug].am = new Date().toISOString();
          o.letzte = slug;
        });
        initLeiter(slug);
        zeigeAbschluss(slug);
      }
    }

    document.addEventListener("click", function (e) {
      var vor = e.target.closest("[data-knext-step]");
      if (vor) {
        e.preventDefault();
        if (vor.getAttribute("aria-disabled") === "true") return;
        var mindestens = Number(vor.getAttribute("data-kmin") || "0");
        if (mindestens > 0 && auswahl().length < mindestens) {
          var hinweis = el("[data-khint]");
          if (hinweis) { hinweis.hidden = false; hinweis.textContent = "Tipp mindestens eins an."; }
          return;
        }
        var picks = auswahl();
        merken(function (o) {
          o.stufen[slug] = o.stufen[slug] || {};
          o.stufen[slug].picks = picks.map(function (p) { return p.wert; });
          o.letzte = slug;
        });
        if (AUFLOESUNG[slug]) AUFLOESUNG[slug](picks);
        if (UEBUNG[slug]) UEBUNG[slug](picks);
        zeigeTeil(Math.min(aktuell + 1, maxTeil), true);
        return;
      }
      var zurueck = e.target.closest("[data-kprev-step]");
      if (zurueck) { e.preventDefault(); zeigeTeil(Math.max(aktuell - 1, 1), true); }
    });

    document.addEventListener("change", function (e) {
      if (e.target.closest(".kgrid[data-kpick]")) {
        var hinweis = el("[data-khint]");
        if (hinweis) hinweis.hidden = true;
        var zaehler = el("[data-kpicked]");
        if (zaehler) zaehler.textContent = String(auswahl().length);
      }
      if (e.target.hasAttribute("data-kfeld")) pruefeUebung();
    });
    document.addEventListener("input", function (e) {
      if (e.target.hasAttribute("data-kfeld")) pruefeUebung();
    });

    zeigeTeil(1, false);
  }

  /* ------------------------------------- Der Abschluss unter dem Mitnehmen -- */

  function zeigeAbschluss(slug) {
    var o = stand();
    var naechste = naechsteStufe(slug);
    var rum = o.start && naechste.slug === o.start;
    var p = o.problem ? problemVon(o.problem) : null;

    /* Hoechstens ein Hinweis auf eine andere Seite, und nur wenn er passt. */
    var seiten = el("[data-kseite]");
    if (seiten && p && p.weiter && p.weiter.nach === slug) {
      seiten.hidden = false;
      var t = el("[data-kseite-text]", seiten);
      var k = el("[data-kseite-knopf]", seiten);
      if (t) t.textContent = p.weiter.text;
      if (k) { k.href = p.weiter.href; k.textContent = p.weiter.knopf; }
    }

    /* "Fahr dich runter" erst ab Schritt 4. */
    var programm = el("[data-kprogramm]");
    if (programm) programm.hidden = indexVon(slug) < indexVon("ruhe");

    var weiter = el("[data-knaechste]");
    var schluss = el("[data-krum]");
    if (rum) {
      if (weiter) weiter.hidden = true;
      if (schluss) {
        schluss.hidden = false;
        var liste7 = el("[data-krum-liste]", schluss);
        if (liste7) {
          liste7.innerHTML = "";
          STUFEN.forEach(function (s) {
            var e = o.stufen[s.slug];
            if (!e || !e.mitnehmen) return;
            var li = document.createElement("li");
            var b = document.createElement("b"); b.textContent = s.titel;
            var span = document.createElement("span"); span.textContent = e.mitnehmen;
            li.appendChild(b); li.appendChild(span);
            liste7.appendChild(li);
          });
        }
        var bew = el("[data-kbewerbung]", schluss);
        if (bew) bew.hidden = !BEWERBUNG_AKTIV;
      }
      return;
    }
    if (!weiter) return;
    var teaser = TEASER[slug + ">" + naechste.slug] || { h: naechste.titel, s: naechste.kurz };
    var nr = el("[data-knaechste-nr]", weiter);
    var h = el("[data-knaechste-h]", weiter);
    var s = el("[data-knaechste-s]", weiter);
    var knopf = el("[data-knaechste-knopf]", weiter);
    if (nr) nr.textContent = "Als Nächstes: Schritt " + (indexVon(naechste.slug) + 1);
    if (h) h.textContent = teaser.h;
    if (s) s.textContent = teaser.s;
    if (knopf) knopf.href = "/kreis/" + naechste.slug;
  }

  /* ---------------------------------------- Was in der Aufloesung erscheint */

  var AUFLOESUNG = {};
  var UEBUNG = {};

  AUFLOESUNG.gefuehle = function (picks) {
    var gesamt = alle(".kgrid[data-kpick] input").length;
    var laut = picks.filter(function (p) { return p.gruppe === "laut"; });
    var leise = picks.filter(function (p) { return p.gruppe === "leise"; });

    setze("anzahl", String(picks.length));
    setze("gesamt", String(gesamt));
    setze("meine", liste(picks.map(function (p) { return p.wert; }), "kwords--mine"));

    zeige("vieleLaut", laut.length >= leise.length && laut.length > 0);
    zeige("schonFein", leise.length > laut.length && leise.length > 0);

    setze("offeneLeise", liste(mischen(nichtGewaehlt("leise"), 6)));
    setze("offeneGut", liste(mischen(nichtGewaehlt("gut"), 6)));
    setze("offeneGutText", aufzaehlung(mischen(nichtGewaehlt("gut"), 3)));
  };

  UEBUNG.gefuehle = function (picks) {
    var ziel = el("[data-kue-meine]");
    if (!ziel) return;
    ziel.innerHTML = "";
    var quelle = picks.length ? picks.map(function (p) { return p.wert; }) : ["genervt", "unter Druck", "wütend"];
    quelle.forEach(function (w, i) {
      var label = document.createElement("label");
      label.className = "kchip";
      label.innerHTML = '<input type="radio" name="kue-wort" data-kfeld="wort" data-kpflicht value="' + w + '"' + (i === 0 ? " checked" : "") + ">" + w;
      ziel.appendChild(label);
    });
  };

  AUFLOESUNG.werte = function (picks) {
    var kasten = el('[data-kfill="werteliste"]');
    if (kasten) {
      kasten.innerHTML = "";
      var ul = document.createElement("ul");
      ul.className = "kpairs";
      picks.forEach(function (p) {
        var li = document.createElement("li");
        var b = document.createElement("b"); b.textContent = p.wert;
        var span = document.createElement("span"); span.textContent = p.frage;
        li.appendChild(b); li.appendChild(span);
        ul.appendChild(li);
      });
      kasten.appendChild(ul);
    }
    zeige("nurMittel", picks.filter(function (p) { return p.gruppe === "wert"; }).length === 0 && picks.length > 0);
    setze("anzahl", String(picks.length));
  };

  UEBUNG.werte = function (picks) {
    var ziel = el("[data-kue-meine]");
    if (!ziel) return;
    ziel.innerHTML = "";
    (picks.length ? picks : [{ wert: "Wort halten" }]).forEach(function (p, i) {
      var label = document.createElement("label");
      label.className = "kchip";
      label.innerHTML = '<input type="radio" name="kue-wert" data-kfeld="wert" data-kpflicht value="' + p.wert + '"' + (i === 0 ? " checked" : "") + ">" + p.wert;
      ziel.appendChild(label);
    });
  };

  AUFLOESUNG.verhalten = function (picks) { setze("meinVorsatz", picks.length ? picks[0].text : ""); };
  AUFLOESUNG.alarm = function (picks) { setze("meineSzene", picks.length ? picks[0].text : ""); };
  AUFLOESUNG.ruhe = function (picks) {
    setze("anzahl", String(picks.length));
    setze("meineMomente", liste(picks.map(function (p) { return p.wert; }), "kwords--mine"));
  };
  AUFLOESUNG.satz = function (picks) { setze("meinSatz", picks.length ? picks[0].text : ""); };
  AUFLOESUNG.wofuer = function (picks) { setze("meinWofuer", picks.length ? picks[0].text : ""); };

  UEBUNG.satz = function (picks) {
    var feld = el('[data-kfeld="satz"]');
    if (feld && !feld.value && picks.length && picks[0].wert.indexOf("Keiner") !== 0) feld.value = picks[0].wert;
  };
  UEBUNG.wofuer = function (picks) {
    var feld = el('[data-kfeld="wen"]');
    if (feld && !feld.value && picks.length) feld.value = picks[0].wert;
  };
  /* Bei nachts liegt der Zettel neben dem Bett, nicht vor der Haustuer. */
  UEBUNG.ruhe = function () {
    var o = stand();
    if (o.problem !== "nachts") return;
    alle("[data-knachts]").forEach(function (e) { e.hidden = false; });
    alle("[data-ktags]").forEach(function (e) { e.hidden = true; });
  };

  /* ------------------------------------------------- Die Uebersicht /kreis -- */

  function initEinstieg() {
    var kasten = el("[data-keinstieg]");
    if (!kasten) return;
    var o = stand();

    var antwort = el("[data-kantwort]");
    var satz = el("[data-kantwort-satz]");
    var wo = el("[data-kantwort-wo]");
    var knopf = el("[data-kantwort-knopf]");

    function waehle(id, scrollen) {
      var p = problemVon(id);
      if (!p) return;
      merken(function (s) { s.problem = id; s.start = p.start; });
      alle("[data-kproblem]", kasten).forEach(function (b) {
        var an = b.getAttribute("data-kproblem") === id;
        b.classList.toggle("is-gewaehlt", an);
        b.setAttribute("aria-pressed", an ? "true" : "false");
      });
      if (satz) satz.textContent = p.satz;
      if (wo) wo.textContent = "Startet bei Schritt " + (indexVon(p.start) + 1) + " von 7. Dauert zwei Minuten.";
      if (knopf) knopf.href = "/kreis/" + p.start;
      if (antwort) {
        antwort.hidden = false;
        if (scrollen) antwort.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      initRad();
    }

    alle("[data-kproblem]", kasten).forEach(function (b) {
      b.addEventListener("click", function () { waehle(b.getAttribute("data-kproblem"), true); });
    });

    if (o.problem) waehle(o.problem, false);
  }

  function initRad() {
    var rad = el(".wheel");
    var listeEl = el(".klist");
    if (!rad && !listeEl) return;

    var o = stand();
    var fertig = fertigeStufen(o);
    var param = new URLSearchParams(location.search).get("weiter");
    var ziel = indexVon(param || "") >= 0 ? stufeVon(param)
      : (o.letzte && o.stufen[o.letzte] && o.stufen[o.letzte].fertig ? naechsteStufe(o.letzte)
      : (o.start ? stufeVon(o.start) : STUFEN[0]));

    alle(".wheel__node").forEach(function (a) {
      var slug = a.getAttribute("data-slug");
      var e = o.stufen[slug];
      a.classList.toggle("is-done", !!(e && e.fertig));
      a.classList.toggle("is-next", slug === ziel.slug);
    });
    var schild = el("[data-kstart-schild]");
    if (schild) {
      var startKnoten = o.start ? el('.wheel__node[data-slug="' + o.start + '"]') : null;
      schild.hidden = !startKnoten;
      if (startKnoten) {
        schild.style.left = startKnoten.style.left;
        schild.style.top = startKnoten.style.top;
      }
    }
    alle(".klist li").forEach(function (li) {
      var e = o.stufen[li.getAttribute("data-slug")];
      li.classList.toggle("is-done", !!(e && e.fertig));
    });

    var hubStand = el("[data-khub-stand]");
    var hubBtn = el("[data-khub-btn]");
    if (hubStand) hubStand.textContent = fertig.length > 0 ? fertig.length + " von 7 gemacht" : "Sieben Schritte";
    if (hubBtn) { hubBtn.href = "/kreis/" + ziel.slug; hubBtn.textContent = "Los geht's"; }
    alle("[data-kweiter]").forEach(function (a) {
      a.href = "/kreis/" + ziel.slug;
      if (a.getAttribute("data-kweiter") === "lang") {
        a.textContent = (fertig.length > 0 ? "Weiter mit: " : "Starten mit: ") + ziel.titel;
      }
    });

    var mit = el("[data-kmitnahmen]");
    if (mit) {
      var zeilen = STUFEN.filter(function (s) {
        var e = o.stufen[s.slug];
        return e && e.mitnehmen;
      });
      mit.hidden = !zeilen.length;
      if (zeilen.length) {
        var box = el("[data-kmitnahmen-liste]", mit);
        box.innerHTML = "";
        zeilen.forEach(function (s) {
          var li = document.createElement("li");
          var b = document.createElement("b"); b.textContent = s.titel;
          var span = document.createElement("span"); span.textContent = o.stufen[s.slug].mitnehmen;
          li.appendChild(b); li.appendChild(span);
          box.appendChild(li);
        });
      }
    }
  }

  /* --------------------------------------------------------------- Anmeldung */

  function zugangscode() {
    var p = function () { return Math.random().toString(36).substring(2, 6).toUpperCase(); };
    return p() + "-" + p();
  }

  async function rpc(name, body) {
    var r = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(name + ": " + r.status + " " + (await r.text()));
    return r;
  }

  function initAnmeldung(slug) {
    var btn = el("#k-btn");
    if (!btn) return;

    var fehler = el("#k-error");
    var live = el("#k-form-live");
    var fertigBox = el("#k-form-done");
    var schonDa = el("[data-kschon]");
    var label = btn.textContent;

    if (stand().lead) {
      if (live) live.hidden = true;
      if (schonDa) schonDa.hidden = false;
      return;
    }

    function abbruch(text) {
      fehler.textContent = text;
      fehler.classList.add("is-visible");
      btn.disabled = false;
      btn.textContent = label;
    }

    btn.addEventListener("click", async function () {
      var vorname = el("#k-vorname").value.trim();
      var email = el("#k-email").value.trim().toLowerCase();
      var kanalEl = el('input[name="kkanal"]:checked');
      var kanal = kanalEl ? kanalEl.value : "email";

      fehler.classList.remove("is-visible");
      if (!vorname) return abbruch("Wie heißt du?");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return abbruch("Die Mail stimmt so noch nicht.");
      if (!el("#k-c-start").checked) return abbruch("Setz noch den Haken beim Datenschutz, sonst darf ich dir nichts schicken.");
      if (!el("#k-c-eigen").checked) return abbruch("Setz noch den Haken bei der Eigenverantwortung.");

      btn.disabled = true;
      btn.textContent = "…";

      var params = new URLSearchParams(location.search);
      var o = stand();
      var code = zugangscode();
      var naechste = naechsteStufe(slug);
      var onboarding = {
        magnet: MAGNET,
        kreis_problem: o.problem || null,
        kreis_start: o.start || null,
        kreis_stufe: slug,
        kreis_stufe_nr: indexVon(slug) + 1,
        kreis_erledigt: fertigeStufen(o).map(function (s) { return s.slug; }),
        kreis_antworten: (o.stufen[slug] && o.stufen[slug].picks) || [],
        kreis_mitnehmen: (o.stufen[slug] && o.stufen[slug].mitnehmen) || null,
        kreis_weiter_link: "https://www.shiftmyhorizon.com/kreis?weiter=" + naechste.slug,
        flow: KREIS_FLOW,
        access_code: code,
        utm_source: params.get("utm_source"), utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"), via: params.get("via"),
        referrer: document.referrer || null,
        landed_at: new Date().toISOString(),
        eigenverantwortung_bestaetigt: true
      };

      try {
        await rpc("register_tripwire_lead", {
          p_email: email, p_first_name: vorname, p_delivery_channel: kanal,
          p_source: "kreis_flow", p_language: "de",
          p_onboarding_data: onboarding, p_access_code: code
        });

        if (KREIS_FLOW_AKTIV) {
          await rpc("register_lead", {
            p_email: email, p_first_name: vorname, p_delivery_channel: kanal,
            p_source: "kreis_flow", p_language: "de",
            p_onboarding_data: onboarding, p_access_code: code,
            p_chosen_path: KREIS_FLOW, p_flow_name: KREIS_FLOW
          });
        }

        if (window.smhNotify) {
          var p = o.problem ? problemVon(o.problem) : null;
          await window.smhNotify({
            kind: "kreis", name: vorname, email: email, phone: "",
            page: "kreis/" + slug, route: "Der Kreis",
            answers: [
              { frage: "Was nervt am meisten", antwort: p ? p.frage : "nicht angetippt" },
              { frage: "Schritt", antwort: (indexVon(slug) + 1) + ". " + stufeVon(slug).titel },
              { frage: "Mitgenommen", antwort: onboarding.kreis_mitnehmen || "nichts" },
              { frage: "Wohin", antwort: kanal }
            ]
          });
        }

        merken(function (s) { s.lead = true; s.letzte = slug; });

        var titelEl = el("#k-done-title");
        if (titelEl) titelEl.textContent = "Danke, " + vorname + ". Ich hab gespeichert, wo du stehst.";
        if (kanal === "email") {
          var mail = el("#k-done-email");
          if (mail) mail.hidden = false;
        } else {
          var mess = el("#k-done-messenger");
          var link = el("#k-done-link");
          if (mess) mess.hidden = false;
          if (link) {
            var text = encodeURIComponent(botMessage + "\n\n" + accessLabel + " " + code);
            if (kanal === "telegram") { link.href = "https://t.me/" + tgBotName + "?text=" + text; link.textContent = "Telegram öffnen"; }
            else { link.href = "https://wa.me/" + waNumber + "?text=" + text; link.textContent = "WhatsApp öffnen"; }
          }
        }
        if (live) live.hidden = true;
        if (fertigBox) { fertigBox.hidden = false; fertigBox.scrollIntoView({ behavior: "smooth", block: "center" }); }
      } catch (e) {
        console.error("Deinen Stand sichern:", e);
        abbruch("Hat nicht geklappt. Versuch es gleich nochmal.");
      }
    });
  }

  /* --------------------------------------------------------------------- Start */

  function start() {
    var slug = document.body.getAttribute("data-kreis");
    initEinstieg();
    initRad();
    if (slug) {
      initVariante(slug);
      initFaden(slug);
      initLeiter(slug);
      initSchritt(slug);
      initAnmeldung(slug);
      merken(function (o) {
        o.letzte = slug;
        if (!o.start) o.start = slug;   /* Einstieg direkt aus einem Video */
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
