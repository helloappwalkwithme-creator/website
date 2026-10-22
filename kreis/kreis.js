/* kreis.js - Lernreise "Der Kreis", Fassung 2.
   Eine Datei fuer die Uebersicht und alle sieben Stufen. Keine Fremdbibliothek.

   Was hier passiert:
   1. Der Einstieg auf /kreis: Er tippt an, wo es drueckt, und landet beim passenden Schritt.
   2. Die Reihenfolge laeuft von dort weiter und faengt nach 7 wieder bei 1 an.
   3. Der rote Faden: sein Problem steht in seinen Worten oben auf jeder Seite.
   4. Die vier Schritte einer Stufe: Frage, Aufloesung, Uebung auf der Seite, Mitnehmen.
   5. Die Anmeldung, erst nach einer gemachten Uebung, mit denselben Supabase-Aufrufen
      wie starter.js.

   WICHTIG vor dem Live-Schalten: siehe EINRICHTEN-KREIS.md im Repo-Wurzelordner.
   Solange kein kreis_flow in Supabase liegt und kein Make-Szenario ihn ausliefert,
   bleibt KREIS_FLOW_AKTIV auf false. Dann wird der Lead nur gespeichert und Janosch
   bekommt die Hinweis-Mail; es wartet niemand auf eine Nachricht, die kein Szenario
   verschickt. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- Anbindung */

  var SUPABASE_URL = "https://jztwnumtwihomgxwlwor.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yWcwDruITLbaok1rBl4Fiw_Ddjn9xZe";

  var KREIS_FLOW = "kreis_flow";
  var KREIS_FLOW_AKTIV = false;   /* auf true stellen, wenn Flow und Make stehen */
  var MAGNET = "kreis";           /* damit Make die Kreis-Leute von den Feierabend-Mails trennt */

  var waNumber = "491632225456";
  var tgBotName = "shift_my_horizon_bot";
  var botMessage = "Hallo, ich mache den Kreis. Bitte schick mir den nächsten Schritt.";
  var accessLabel = "Mein Zugangscode:";

  /* ------------------------------------------------------------ Die sieben Ebenen */

  var STUFEN = [
    { slug: "verhalten", titel: "Verhalten",
      kurz: "Was du tust, und warum es an derselben Stelle kippt.",
      faden: "Hier oben siehst du es zuerst, an dem, was du tust. Hier findest du die Stelle, an der es kippt." },
    { slug: "gefuehle", titel: "Gefühle",
      kurz: "Was du oft spürst, und was darunter liegt.",
      faden: "Eine Ebene tiefer liegt das, was du spürst, und meistens meldet sich nur das Lauteste. Hier findest du das Wort darunter." },
    { slug: "alarm", titel: "Alarm und Planer",
      kurz: "Warum dein Kopf schneller ist als du.",
      faden: "Darunter arbeiten zwei Teile, ein schneller und ein langsamer. Hier gibst du dem langsamen eine Sekunde." },
    { slug: "ruhe", titel: "Innere Ruhe",
      kurz: "Warum der Abend nicht von selbst ruhig wird.",
      faden: "Dein Körper ist noch bei der Arbeit. Hier machst du ihn leiser." },
    { slug: "satz", titel: "Der Satz, der dich nicht aufhören lässt",
      kurz: "Der Satz, der dich weit gebracht hat und nie aufhört.",
      faden: "Darunter läuft ein Satz mit, den du dir nie ausgesucht hast. Hier siehst du ihn dir einmal an." },
    { slug: "werte", titel: "Werte",
      kurz: "Was davon wirklich deins ist.",
      faden: "Weiter unten steht, wonach du entscheidest. Hier trennst du das, was wirklich deins ist." },
    { slug: "wofuer", titel: "Für wen",
      kurz: "Für wen oder was du das alles machst.",
      faden: "Und ganz unten die Frage, für wen das alles ist. Hier machst du daraus einen Termin." }
  ];

  /* -------------------------------------------------- Wo drückt es bei dir --- */

  var PROBLEME = [
    { id: "abends", frage: "Mein Kopf kommt abends nicht runter.",
      du: "Dein Kopf kommt abends nicht runter.",
      start: "ruhe", satz: "Fang mit einer Minute zum Umschalten an." },
    { id: "nachts", frage: "Ich wache nachts auf und grübel.",
      du: "Du wachst nachts auf und kommst nicht mehr weg von den Gedanken.",
      start: "ruhe", satz: "Erst eine Minute zum Umschalten, dann die Hilfe für die Nacht.",
      weiter: { nach: "ruhe", href: "/nacht", knopf: "Die Hilfe für die Nacht",
                text: "Du hast angetippt, dass du nachts wach wirst. Dafür gibt es eine eigene Seite, mit einer Sache, die du im Bett machen kannst." } },
    { id: "laut", frage: "Ich werde zu Hause schnell laut.",
      du: "Du wirst zu Hause schnell laut.",
      start: "gefuehle", satz: "Finde das Wort unter dem Ärger." },
    { id: "fokus", frage: "Ich komme bei der Arbeit nicht in den Fokus.",
      du: "Du kommst bei der Arbeit nicht in den Fokus.",
      start: "alarm", satz: "Schau, was dich rausreißt." },
    { id: "puls", frage: "Vor wichtigen Gesprächen geht mein Puls hoch.",
      du: "Vor wichtigen Gesprächen geht dein Puls hoch.",
      start: "alarm", satz: "Eine Minute, bevor du antwortest.",
      weiter: { nach: "alarm", href: "/termin", knopf: "Die Minute vor dem Termin",
                text: "Du hast angetippt, dass vor wichtigen Gesprächen dein Puls hochgeht. Dafür gibt es eine eigene Seite, genau für die Minute davor." } },
    { id: "handy", frage: "Ich greife ständig zum Handy.",
      du: "Du greifst ständig zum Handy.",
      start: "verhalten", satz: "Finde die Stelle, an der es kippt." },
    { id: "vorsatz", frage: "Mein Vorsatz hält nie die Woche.",
      du: "Dein Vorsatz hält nie die Woche.",
      start: "verhalten", satz: "Finde die Stelle, an der es kippt." },
    { id: "aufhoeren", frage: "Ich kann nicht aufhören zu arbeiten.",
      du: "Du kannst nicht aufhören zu arbeiten.",
      start: "satz", satz: "Drei Sätze. Schau, ob du einen kennst." }
  ];

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
  /* Nach 7 geht es wieder bei 1 weiter. */
  function naechsteStufe(slug) {
    var i = indexVon(slug);
    return STUFEN[(i + 1) % STUFEN.length];
  }

  /* ------------------------------------------------------------------ Der Stand */

  var KEY = "smh_kreis_v2";

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

  /* ------------------------------------------------------- Der rote Faden oben */

  function fadenText(slug, o) {
    var stufe = stufeVon(slug);
    var p = o.problem ? problemVon(o.problem) : null;
    var letzte = o.start && naechsteStufe(slug).slug === o.start;
    var ende = letzte
      ? "Danach bist du einmal rum."
      : "Danach gehen wir eine Ebene tiefer.";
    if (!stufe) return "";
    return (p ? p.du + " " : "") + stufe.faden + " " + ende;
  }

  function initFaden(slug) {
    var ziel = el("[data-kfaden]");
    if (!ziel) return;
    var o = stand();
    if (!o.problem) { ziel.hidden = true; return; }
    ziel.hidden = false;
    ziel.textContent = fadenText(slug, o);
  }

  /* --------------------------------------------- Die Leiste mit den 7 Ebenen */

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
      a.title = (i + 1) + ". " + s.titel + (s.slug === o.start ? " (dein Start)" : "");
      li.appendChild(a);
      ziel.appendChild(li);
    });
    var hinweis = el("[data-kleiter-text]");
    if (hinweis) {
      var nr = indexVon(slug) + 1;
      var startNr = o.start ? indexVon(o.start) + 1 : 0;
      hinweis.textContent = startNr && startNr !== nr
        ? "Ebene " + nr + " von 7. Angefangen hast du bei " + startNr + "."
        : "Ebene " + nr + " von 7.";
    }
  }

  /* -------------------------------------------- Die Schritte einer Stufe ---- */

  /* Nur das Raster der Frage zaehlt. Die Raster in der Uebung haben kein
     data-kpick, damit sie die Antworten nicht ueberschreiben. */
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

  /* Werte aus den Uebungsfeldern: Eingabefelder und Ein-Klick-Raster. */
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

  /* --------------------------------------------------------- Uebung: Uhr ---- */

  function initUhren(fertigGemeldet) {
    alle('[data-kuebung="timer"]').forEach(function (box) {
      var gesamt = 60;
      var anzeige = el("[data-kue-zeit]", box);
      var knopf = el("[data-kue-start]", box);
      var danach = el("[data-kue-fertig]", box);
      var laeuft = false, ende = 0, tick = null;
      var startLabel = knopf ? knopf.textContent : "";

      function stopp() { laeuft = false; if (tick) clearInterval(tick); tick = null; }

      function fertig() {
        stopp();
        anzeige.textContent = "0";
        knopf.textContent = "Noch einmal";
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
        tick = setInterval(function () {
          var rest = Math.max(0, Math.ceil((ende - Date.now()) / 1000));
          anzeige.textContent = String(rest);
          if (rest <= 0) fertig();
        }, 200);
      });
    });
  }

  /* ------------------------------------------------------ Schritte schalten -- */

  function initStufe(slug) {
    var schritte = alle(".kstep[data-kstep]");
    if (!schritte.length) return;

    var maxSchritt = schritte.reduce(function (m, s) { return Math.max(m, Number(s.dataset.kstep)); }, 0);
    var balken = alle(".kprogress li");
    var aktuell = 1;
    var uhrFertig = false;

    initUhren(function () { uhrFertig = true; pruefeUebung(); });

    function pruefeUebung() {
      var knopf = el('.kstep[data-kstep="3"] [data-knext-step]');
      if (!knopf) return;
      var brauchtUhr = !!el('.kstep[data-kstep="3"] [data-kuebung="timer"]');
      var pflicht = alle('.kstep[data-kstep="3"] [data-kpflicht]');
      var werte = felder();
      var allesDa = pflicht.every(function (f) { return !!werte[f.getAttribute("data-kfeld")]; });
      var offen = (brauchtUhr && !uhrFertig) || !allesDa;
      knopf.classList.toggle("btn--inactive", offen);
      knopf.setAttribute("aria-disabled", offen ? "true" : "false");
      var hinweis = el('.kstep[data-kstep="3"] [data-kue-hinweis]');
      if (hinweis) hinweis.hidden = !offen;
    }

    function zeigeSchritt(n, scrollen) {
      aktuell = n;
      schritte.forEach(function (s) { s.classList.toggle("is-active", Number(s.dataset.kstep) === n); });
      balken.forEach(function (li, i) { li.classList.toggle("is-on", i < n); });
      if (scrollen) {
        var kopf = el("[data-ktop]") || document.body;
        kopf.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (n === 3) pruefeUebung();
      if (n === maxSchritt) {
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
          if (hinweis) { hinweis.hidden = false; hinweis.textContent = mindestens === 1 ? "Tipp mindestens eins an." : "Tipp mindestens " + mindestens + " an."; }
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
        zeigeSchritt(Math.min(aktuell + 1, maxSchritt), true);
        return;
      }
      var zurueck = e.target.closest("[data-kprev-step]");
      if (zurueck) { e.preventDefault(); zeigeSchritt(Math.max(aktuell - 1, 1), true); }
    });

    document.addEventListener("change", function (e) {
      if (e.target.closest(".kgrid[data-kpick]")) {
        var hinweis = el("[data-khint]");
        if (hinweis) hinweis.hidden = true;
        var zaehler = el("[data-kpicked]");
        if (zaehler) zaehler.textContent = String(auswahl().length);
      }
      if (e.target.closest("[data-kfeld]") || e.target.hasAttribute("data-kfeld")) pruefeUebung();
    });
    document.addEventListener("input", function (e) {
      if (e.target.hasAttribute("data-kfeld")) pruefeUebung();
    });

    zeigeSchritt(1, false);
  }

  /* ------------------------------------- Der Abschluss unter dem Mitnehmen -- */

  function zeigeAbschluss(slug) {
    var o = stand();
    var naechste = naechsteStufe(slug);
    var rum = o.start && naechste.slug === o.start;

    /* Der Weg nach /nacht oder /termin, wenn sein Problem danach verlangt. */
    var p = o.problem ? problemVon(o.problem) : null;
    var seiten = el("[data-kseite]");
    if (seiten && p && p.weiter && p.weiter.nach === slug) {
      seiten.hidden = false;
      var t = el("[data-kseite-text]", seiten);
      var k = el("[data-kseite-knopf]", seiten);
      if (t) t.textContent = p.weiter.text;
      if (k) { k.href = p.weiter.href; k.textContent = p.weiter.knopf; }
    }

    /* Stufe 1 wird erst ab der Ebene "Innere Ruhe" ueberhaupt erwaehnt. */
    var programm = el("[data-kprogramm]");
    if (programm) programm.hidden = indexVon(slug) < indexVon("ruhe");

    var weiter = el("[data-knaechste]");
    if (!weiter) return;
    if (rum) {
      weiter.hidden = true;
      var schluss = el("[data-krum]");
      if (schluss) schluss.hidden = false;
      return;
    }
    var nr = el("[data-knaechste-nr]", weiter);
    var titel = el("[data-knaechste-titel]", weiter);
    var kurz = el("[data-knaechste-kurz]", weiter);
    var knopf = el("[data-knaechste-knopf]", weiter);
    if (nr) nr.textContent = "Ebene " + (indexVon(naechste.slug) + 1) + " von 7";
    if (titel) titel.textContent = naechste.titel;
    if (kurz) kurz.textContent = naechste.kurz;
    if (knopf) { knopf.href = "/kreis/" + naechste.slug; knopf.textContent = "Weiter zu " + naechste.titel; }
  }

  /* ---------------------------------------- Was in der Aufloesung erscheint */

  var AUFLOESUNG = {};
  var UEBUNG = {};

  AUFLOESUNG.gefuehle = function (picks) {
    var gesamt = alle(".kgrid[data-kpick] input").length;
    var laut = picks.filter(function (p) { return p.gruppe === "laut"; });
    var leise = picks.filter(function (p) { return p.gruppe === "leise"; });
    var gut = picks.filter(function (p) { return p.gruppe === "gut"; });

    setze("anzahl", String(picks.length));
    setze("gesamt", String(gesamt));
    setze("meine", liste(picks.map(function (p) { return p.wert; }), "kwords--mine"));

    zeige("vieleLaut", laut.length >= leise.length && laut.length > 0);
    zeige("schonFein", leise.length > laut.length && leise.length > 0);

    setze("offeneLeise", liste(mischen(nichtGewaehlt("leise"), 6)));
    setze("offeneGut", liste(mischen(nichtGewaehlt("gut"), 6)));
    setze("offeneGutText", aufzaehlung(mischen(nichtGewaehlt("gut"), 3)));
  };

  /* Fuer die Uebung: seine eigenen Woerter als Ein-Klick-Raster anbieten. */
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

  /* ------------------------------------------------- Die Uebersicht /kreis -- */

  function initEinstieg() {
    var kasten = el("[data-keinstieg]");
    if (!kasten) return;
    var o = stand();

    var antwort = el("[data-kantwort]");
    var satz = el("[data-kantwort-satz]");
    var knopf = el("[data-kantwort-knopf]");

    function waehle(id, scrollen) {
      var p = problemVon(id);
      if (!p) return;
      var stufe = stufeVon(p.start);
      merken(function (s) { s.problem = id; s.start = p.start; });
      alle("[data-kproblem]", kasten).forEach(function (b) {
        b.classList.toggle("is-gewaehlt", b.getAttribute("data-kproblem") === id);
      });
      if (satz) satz.textContent = p.satz;
      if (knopf) {
        knopf.href = "/kreis/" + p.start;
        knopf.textContent = "Los geht es bei " + stufe.titel;
      }
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
    alle(".klist li").forEach(function (li) {
      var e = o.stufen[li.getAttribute("data-slug")];
      li.classList.toggle("is-done", !!(e && e.fertig));
    });

    var hubStand = el("[data-khub-stand]");
    var hubText = el("[data-khub-text]");
    var hubBtn = el("[data-khub-btn]");
    if (hubStand) hubStand.textContent = fertig.length > 0 ? fertig.length + " von 7" : "Sieben Schritte";
    if (hubText) hubText.textContent = ziel.titel;
    if (hubBtn) { hubBtn.href = "/kreis/" + ziel.slug; hubBtn.textContent = fertig.length > 0 ? "Weiter" : "Anfangen"; }
    alle("[data-kweiter]").forEach(function (a) {
      a.href = "/kreis/" + ziel.slug;
      if (a.getAttribute("data-kweiter") === "lang") {
        a.textContent = (fertig.length > 0 ? "Weiter bei: " : "Anfangen bei: ") + ziel.titel;
      }
    });

    /* Was er schon mitgenommen hat. */
    var mit = el("[data-kmitnahmen]");
    if (mit) {
      var zeilen = STUFEN.filter(function (s) {
        var e = o.stufen[s.slug];
        return e && e.mitnehmen;
      });
      if (!zeilen.length) { mit.hidden = true; }
      else {
        mit.hidden = false;
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
      if (!vorname) return abbruch("Bitte deinen Vornamen eingeben.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return abbruch("Bitte eine gültige E-Mail eingeben.");
      if (!el("#k-c-start").checked) return abbruch("Bitte stimme der Datenverarbeitung zu, damit ich dir den nächsten Schritt schicken darf.");
      if (!el("#k-c-eigen").checked) return abbruch("Bitte bestätige noch den Hinweis zur Eigenverantwortung.");

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
              { frage: "Wo drückt es", antwort: p ? p.frage : "nicht angetippt" },
              { frage: "Ebene", antwort: (indexVon(slug) + 1) + ". " + stufeVon(slug).titel },
              { frage: "Mitgenommen", antwort: onboarding.kreis_mitnehmen || "nichts" },
              { frage: "Wohin", antwort: kanal }
            ]
          });
        }

        merken(function (s) { s.lead = true; s.letzte = slug; });

        var titelEl = el("#k-done-title");
        if (titelEl) titelEl.textContent = "Danke, " + vorname + ". Dein Stand ist gespeichert.";
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
        console.error("Kreis speichern:", e);
        abbruch("Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.");
      }
    });
  }

  /* --------------------------------------------------------------------- Start */

  function start() {
    var slug = document.body.getAttribute("data-kreis");
    initEinstieg();
    initRad();
    if (slug) {
      initFaden(slug);
      initLeiter(slug);
      initStufe(slug);
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
