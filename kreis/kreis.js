/* kreis.js - Lernreise "Der Kreis". Eine Datei fuer die Uebersicht und alle
   sieben Stufen. Keine Fremdbibliothek.

   Was hier passiert:
   1. Schritte innerhalb einer Stufe zeigen und verstecken (Frage, Aufloesung, Aufgabe).
   2. Die Antippen-Antworten einsammeln und daraus die Aufloesung fuellen.
   3. Den Stand im Browser merken, damit der Mann da weitermacht, wo er war.
   4. Die Anmeldung, die dieselben Supabase-Aufrufe nutzt wie starter.js.

   WICHTIG vor dem Live-Schalten: siehe EINRICHTEN-KREIS.md im Repo-Wurzelordner.
   Solange kein kreis_flow in Supabase liegt und kein Make-Szenario ihn
   ausliefert, bleibt KREIS_FLOW_AKTIV auf false. Dann wird der Lead nur
   gespeichert und Janosch bekommt die Hinweis-Mail; es wartet niemand auf eine
   Nachricht, die kein Szenario verschickt. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- Anbindung */

  var SUPABASE_URL = "https://jztwnumtwihomgxwlwor.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yWcwDruITLbaok1rBl4Fiw_Ddjn9xZe";

  var KREIS_FLOW = "kreis_flow";
  var KREIS_FLOW_AKTIV = false;   /* auf true stellen, wenn Flow und Make stehen */

  var waNumber = "491632225456";
  var tgBotName = "shift_my_horizon_bot";
  var botMessage = "Hallo, ich mache den Kreis. Bitte schick mir den nächsten Schritt.";
  var accessLabel = "Mein Zugangscode:";

  /* ------------------------------------------------------------ Die Reihenfolge */

  var STUFEN = [
    { slug: "verhalten", titel: "Verhalten",                   kurz: "Was du tust, und warum es an derselben Stelle kippt." },
    { slug: "gefuehle",  titel: "Gefühle",                     kurz: "Was du oft spürst, und was darunter liegt." },
    { slug: "alarm",     titel: "Alarm und Planer",            kurz: "Warum dein Kopf schneller ist als du." },
    { slug: "ruhe",      titel: "Innere Ruhe",                 kurz: "Warum der Abend nicht von selbst ruhig wird." },
    { slug: "satz",      titel: "Der Satz hinter dem Antrieb", kurz: "Der Satz, der dich weit gebracht hat." },
    { slug: "werte",     titel: "Werte",                       kurz: "Was davon wirklich deins ist." },
    { slug: "wofuer",    titel: "Wofür",                       kurz: "Für wen oder was du das alles machst." }
  ];

  function indexVon(slug) {
    for (var i = 0; i < STUFEN.length; i++) if (STUFEN[i].slug === slug) return i;
    return -1;
  }

  /* ------------------------------------------------------------------ Der Stand */

  var KEY = "smh_kreis_v1";

  function stand() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var o = raw ? JSON.parse(raw) : null;
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

  function erledigt(o) {
    return STUFEN.filter(function (s) { return o.stufen[s.slug] && o.stufen[s.slug].fertig; });
  }

  function naechsteOffene(o) {
    for (var i = 0; i < STUFEN.length; i++) {
      var e = o.stufen[STUFEN[i].slug];
      if (!e || !e.fertig) return STUFEN[i];
    }
    return STUFEN[0];
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
    if (woerter.length === 0) return "";
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

  /* -------------------------------------------------- Die Schritte einer Stufe */

  function auswahl() {
    return alle(".kgrid input:checked").map(function (i) {
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
    return alle('.kgrid input[data-g="' + gruppe + '"]')
      .filter(function (i) { return !i.checked; })
      .map(function (i) { return i.value; });
  }

  function initStufe(slug) {
    var schritte = alle(".kstep[data-kstep]");
    if (!schritte.length) return;

    var maxSchritt = schritte.reduce(function (m, s) { return Math.max(m, Number(s.dataset.kstep)); }, 0);
    var balken = alle(".kprogress li");
    var aktuell = 1;

    function zeigeSchritt(n, scrollen) {
      aktuell = n;
      schritte.forEach(function (s) { s.classList.toggle("is-active", Number(s.dataset.kstep) === n); });
      balken.forEach(function (li, i) { li.classList.toggle("is-on", i < n); });
      if (scrollen) {
        var kopf = el("[data-ktop]") || document.body;
        kopf.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (n === maxSchritt) {
        merken(function (o) {
          o.stufen[slug] = o.stufen[slug] || {};
          o.stufen[slug].fertig = true;
          o.stufen[slug].am = new Date().toISOString();
          o.letzte = slug;
        });
      }
    }

    document.addEventListener("click", function (e) {
      var vor = e.target.closest("[data-knext-step]");
      if (vor) {
        e.preventDefault();
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
        zeigeSchritt(Math.min(aktuell + 1, maxSchritt), true);
        return;
      }
      var zurueck = e.target.closest("[data-kprev-step]");
      if (zurueck) { e.preventDefault(); zeigeSchritt(Math.max(aktuell - 1, 1), true); }
    });

    document.addEventListener("change", function (e) {
      if (!e.target.closest(".kgrid")) return;
      var hinweis = el("[data-khint]");
      if (hinweis) hinweis.hidden = true;
      var zaehler = el("[data-kpicked]");
      if (zaehler) zaehler.textContent = String(auswahl().length);
    });

    zeigeSchritt(1, false);
  }

  /* ---------------------------------------- Was in der Aufloesung erscheint */

  var AUFLOESUNG = {};

  AUFLOESUNG.gefuehle = function (picks) {
    var gesamt = alle(".kgrid input").length;
    var laut = picks.filter(function (p) { return p.gruppe === "laut"; });
    var leise = picks.filter(function (p) { return p.gruppe === "leise"; });
    var gut = picks.filter(function (p) { return p.gruppe === "gut"; });

    setze("anzahl", String(picks.length));
    setze("gesamt", String(gesamt));
    setze("meine", liste(picks.map(function (p) { return p.wert; }), "kwords--mine"));

    zeige("vieleLaut", laut.length >= leise.length && laut.length > 0);
    zeige("schonFein", leise.length > laut.length && leise.length > 0);
    zeige("keinGutes", gut.length === 0);

    setze("offeneLeise", liste(mischen(nichtGewaehlt("leise"), 6)));
    setze("offeneGut", liste(mischen(nichtGewaehlt("gut"), 6)));
    setze("offeneGutText", aufzaehlung(mischen(nichtGewaehlt("gut"), 3)));
  };

  AUFLOESUNG.werte = function (picks) {
    var kasten = el('[data-kfill="werteliste"]');
    if (!kasten) return;
    kasten.innerHTML = "";
    var ul = document.createElement("ul");
    ul.className = "kpairs";
    picks.forEach(function (p) {
      var li = document.createElement("li");
      var b = document.createElement("b");
      b.textContent = p.wert;
      var span = document.createElement("span");
      span.textContent = p.frage;
      li.appendChild(b); li.appendChild(span);
      ul.appendChild(li);
    });
    kasten.appendChild(ul);

    var echte = picks.filter(function (p) { return p.gruppe === "wert"; });
    zeige("nurMittel", echte.length === 0 && picks.length > 0);
    setze("anzahl", String(picks.length));
  };

  AUFLOESUNG.verhalten = function (picks) {
    setze("meinVorsatz", picks.length ? picks[0].text : "");
    setze("anzahl", String(picks.length));
  };

  AUFLOESUNG.alarm = function (picks) {
    setze("meineSzene", picks.length ? picks[0].text : "");
    setze("anzahl", String(picks.length));
  };

  AUFLOESUNG.ruhe = function (picks) {
    setze("anzahl", String(picks.length));
    setze("meineMomente", liste(picks.map(function (p) { return p.wert; }), "kwords--mine"));
  };

  AUFLOESUNG.satz = function (picks) {
    setze("meinSatz", picks.length ? picks[0].text : "");
  };

  AUFLOESUNG.wofuer = function (picks) {
    setze("meinWofuer", picks.length ? picks[0].text : "");
    setze("anzahl", String(picks.length));
  };

  /* ------------------------------------------------------- Die Uebersicht /kreis */

  function initUebersicht() {
    var rad = el(".wheel");
    var listeEl = el(".klist");
    if (!rad && !listeEl) return;

    var o = stand();
    var fertig = erledigt(o);
    var weiterParam = new URLSearchParams(location.search).get("weiter");
    var ziel = indexVon(weiterParam || "") >= 0
      ? STUFEN[indexVon(weiterParam)]
      : naechsteOffene(o);

    alle(".wheel__node").forEach(function (a) {
      var slug = a.getAttribute("data-slug");
      var e = o.stufen[slug];
      a.classList.toggle("is-done", !!(e && e.fertig));
      a.classList.toggle("is-next", slug === ziel.slug);
    });
    alle(".klist li").forEach(function (li) {
      var slug = li.getAttribute("data-slug");
      var e = o.stufen[slug];
      li.classList.toggle("is-done", !!(e && e.fertig));
    });

    var hubStand = el("[data-khub-stand]");
    var hubText = el("[data-khub-text]");
    var hubBtn = el("[data-khub-btn]");
    if (hubStand) hubStand.textContent = fertig.length > 0 ? fertig.length + " von 7" : "Sieben Schritte";
    if (hubText) hubText.textContent = ziel.titel;
    if (hubBtn) {
      hubBtn.href = "/kreis/" + ziel.slug;
      hubBtn.textContent = fertig.length > 0 ? "Weiter" : "Anfangen";
    }
    alle("[data-kweiter]").forEach(function (a) {
      a.href = "/kreis/" + ziel.slug;
      var label = a.getAttribute("data-kweiter");
      if (label === "lang") a.textContent = (fertig.length > 0 ? "Weiter bei: " : "Anfangen bei: ") + ziel.titel;
    });
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

    var o = stand();
    if (o.lead && schonDa) {
      /* Wer sich schon eingetragen hat, sieht hier keine zweite Abfrage. */
      if (live) live.hidden = true;
      schonDa.hidden = false;
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
      var jetzt = stand();
      var code = zugangscode();
      var onboarding = {
        kreis_stufe: slug,
        kreis_stufe_nr: indexVon(slug) + 1,
        kreis_erledigt: erledigt(jetzt).map(function (s) { return s.slug; }),
        kreis_antworten: (jetzt.stufen[slug] && jetzt.stufen[slug].picks) || [],
        kreis_weiter_link: "https://www.shiftmyhorizon.com/kreis?weiter=" + naechsteOffene(jetzt).slug,
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
            p_chosen_path: KREIS_FLOW,
            p_flow_name: KREIS_FLOW
          });
        }

        if (window.smhNotify) {
          await window.smhNotify({
            kind: "kreis",
            name: vorname,
            email: email,
            phone: "",
            page: "kreis/" + slug,
            route: "Der Kreis",
            answers: [
              { frage: "Stufe", antwort: (indexVon(slug) + 1) + ". " + (STUFEN[indexVon(slug)] || {}).titel },
              { frage: "Angetippt", antwort: onboarding.kreis_antworten.join(", ") || "nichts" },
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
    initUebersicht();
    if (slug) {
      initStufe(slug);
      initAnmeldung(slug);
      merken(function (o) { o.letzte = slug; });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
