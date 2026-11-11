/* Clear State. Vier Fragen zum Abend, ein Grund, ein Schritt für heute.
   Lead wie bisher: register_tripwire_lead und register_lead.
   Flow-Name clearstate_flow. Dieselben Felder in p_onboarding_data.
   Make liest daraus huerde_text, tag1_wenn, stopp_text, regel_wenn,
   regel_dann, regel, identitaet, engpass, plan_text und consents.
   Die neuen Antworten werden in diese Felder geschrieben. */
(function () {
  "use strict";

  var SUPABASE_URL = "https://jztwnumtwihomgxwlwor.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yWcwDruITLbaok1rBl4Fiw_Ddjn9xZe";
  var FLOW = "clearstate_flow";
  var WA_NUMBER = "491632225456";
  var BOT_MESSAGE = "Hallo, ich möchte meinen Clear-State-Plan starten. Bitte aktiviere meinen Zugang.";
  var ACCESS_LABEL = "Mein Zugangscode:";
  var STORE = "smh_clearstate_v4";

  var MAIL_TEXT = "Schick mir meinen Plan per Mail. Die Datenschutzerklärung hab ich gelesen. Ich kann mich jederzeit abmelden.";
  var WA_TEXT = "Schick mir zusätzlich 3 Tage lang eine Aufgabe pro Tag per WhatsApp. Danach noch eine Nachricht mit einem Angebot für ein Gespräch. Mit STOP höre ich jederzeit auf.";
  var EIGEN_TEXT = "Ich mache die Übungen auf eigene Verantwortung. Sie ersetzen keinen Arzt.";

  var FRAGEN = [
    {
      key: "ankunft",
      h: "Wann bist du an einem normalen Arbeitstag abends zu Hause?",
      sub: "Gemeint ist der Moment, in dem du die Wohnungstür zumachst.",
      options: [
        { id: "frueh", label: "Vor 18 Uhr" },
        { id: "normal", label: "Zwischen 18 und 20 Uhr" },
        { id: "spaet", label: "Nach 20 Uhr" },
        { id: "nie", label: "Gar nicht richtig. Der Laptop bleibt auf." }
      ]
    },
    {
      key: "kopf",
      h: "Was läuft dir abends noch durch den Kopf, wenn du schon zu Hause bist?",
      sub: "Eine Sache, die nach Feierabend noch da ist.",
      options: [
        { id: "mail", label: "Die Mail, die noch offen ist" },
        { id: "genug", label: "Ob ich heute genug geschafft habe" },
        { id: "gespraech", label: "Das Gespräch, das nicht gut lief" },
        { id: "alles", label: "Alles auf einmal, ohne Ende" }
      ]
    },
    {
      key: "tun",
      h: "Was machst du abends wirklich, solange der Kopf noch im Job ist?",
      sub: "Was du tust, nicht was du dir vornimmst.",
      options: [
        { id: "mails", label: "Ich check noch kurz die Mails" },
        { id: "handy", label: "Ich greife zum Handy" },
        { id: "gruebel", label: "Ich grübel weiter" },
        { id: "bier", label: "Bier oder Netflix nebenbei. Der Kopf läuft trotzdem." }
      ]
    },
    {
      key: "zug",
      h: "Was zieht dich abends wieder an den Job, obwohl du zu Hause bist?",
      sub: "Was den Job wieder anschiebt.",
      options: [
        { id: "nachricht", label: "Eine Nachricht, die noch reinkommt" },
        { id: "laptop", label: "Der Laptop, der offen auf dem Tisch liegt" },
        { id: "ende", label: "Ich will noch eine Sache zu Ende bringen" },
        { id: "einfach", label: "Es passiert einfach. Ich merk es erst hinterher." }
      ]
    }
  ];

  var KOPF = {
    mail: "die Mail, die noch offen ist",
    genug: "die Frage, ob du heute genug geschafft hast",
    gespraech: "das Gespräch, das nicht gut lief",
    alles: "alles auf einmal"
  };
  var TUN_SATZ = {
    mails: "Du checkst noch die Mails.",
    handy: "Du greifst zum Handy.",
    gruebel: "Du grübelst weiter.",
    bier: "Bier oder Netflix läuft nebenbei, der Kopf bleibt aber an."
  };
  var TUN_DANN = {
    mails: "check ich noch die Mails",
    handy: "greif ich zum Handy",
    gruebel: "grübel ich weiter",
    bier: "läuft Bier oder Netflix nebenbei"
  };
  var ZUG_SATZ = {
    nachricht: "Eine Nachricht zieht dich wieder rein.",
    laptop: "Der offene Laptop zieht dich wieder rein.",
    ende: "Du willst noch eine Sache zu Ende bringen.",
    einfach: "Du merkst es erst hinterher."
  };
  var AN_SATZ = {
    frueh: "Du bist vor 18 Uhr zu Hause.",
    normal: "Du bist zwischen 18 und 20 Uhr zu Hause.",
    spaet: "Du bist erst nach 20 Uhr zu Hause.",
    nie: "Richtig zu Hause bist du kaum. Der Laptop bleibt auf."
  };

  /* Welcher Grund gewinnt. Erste Zeile, die passt.
     zug "einfach" zuerst, weil ein Schritt im Moment zu spät kommt.
     Danach, was er wirklich tut. Kopf und der Auslöser füllen nur den Satz. */
  var GRUENDE = {
    spaet: {
      huerde: "Laptop direkt an der Tür zuklappen und in den Flur stellen",
      stopp: "An der Tür den Laptop zuklappen und in den Flur stellen",
      tag: "wenn du heute die Wohnungstür zumachst",
      ident: "Ich bin einer, der an der Tür den Laptop zuklappt.",
      engpass: "erkennen",
      engpass_name: "Du merkst es erst hinterher",
      step: "Direkt nach der Tür: Klapp den Laptop zu und stell ihn in den Flur. Erst danach hinsetzen."
    },
    nebenbei: {
      huerde: "Laptop zuklappen, bevor Bier oder Netflix angeht",
      stopp: "Laut sagen: Für heute ist Schluss. Dann den Laptop zuklappen",
      tag: "wenn du heute zu Bier oder Netflix greifst",
      ident: "Ich bin einer, der erst Schluss macht und dann erst Bier oder Netflix anmacht.",
      engpass: "unterbrechen",
      engpass_name: "Der Abend hat keinen Schluss",
      step: "Bevor Bier oder Netflix angeht: Sag laut, für heute ist Schluss, und klapp den Laptop zu."
    },
    kreis: {
      huerde: "Zettel und Stift auf den Tisch legen",
      stopp: "Den Gedanken in einem Satz aufschreiben und den Zettel weglegen",
      tag: "wenn du heute abends weitergrübelst",
      ident: "Ich bin einer, der den Gedanken aufschreibt und dann aufhört.",
      engpass: "unterbrechen",
      engpass_name: "Der Kopf dreht weiter",
      step: "Schreib den Gedanken, der kreist, in einem Satz auf einen Zettel. Leg den Zettel weg. Mehr nicht."
    },
    handy: {
      huerde: "Handy abends in die Küche legen",
      stopp: "Das Handy in die Küche legen und den Laptop zuklappen",
      tag: "wenn du heute zum Handy greifst",
      ident: "Ich bin einer, der das Handy weglegt, wenn der Job noch ruft.",
      engpass: "unterbrechen",
      engpass_name: "Das Handy holt den Job zurück",
      step: "Leg das Handy in die Küche und klapp den Laptop zu, bevor du dich hinsetzt."
    },
    offen: {
      huerde: "Zettel und Stift neben den Laptop legen",
      stopp: "Die offene Sache in einem Satz notieren und den Laptop zuklappen",
      tag: "wenn du heute abends noch eine Mail checken willst",
      ident: "Ich bin einer, der den Arbeitstag aufschreibt und dann zumacht.",
      engpass: "unterbrechen",
      engpass_name: "Der Arbeitstag ist nicht zu",
      step: "Schreib die offene Sache in einem Satz auf und die Uhrzeit, wann du morgen rangehst. Dann klapp den Laptop zu."
    }
  };

  var STEPS = [
    { id: "ankunft", type: "q", q: 0 },
    { id: "kopf", type: "q", q: 1 },
    { id: "tun", type: "q", q: 2 },
    { id: "zug", type: "q", q: 3 },
    { id: "warum", type: "warum" },
    { id: "jetzt", type: "jetzt" },
    { id: "signup", type: "signup" },
    { id: "danke", type: "danke" }
  ];

  var state = blank();
  var stepIndex = 0;
  var advanceTimer = null;
  var params = new URLSearchParams(location.search);

  function blank() {
    return {
      ankunft: null, kopf: null, tun: null, zug: null,
      regel: "", regelWenn: "", regelDann: "", satzEdited: false,
      vorname: "", whatsapp: false, waHref: "",
      landed_at: null
    };
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function el(id) { return document.getElementById(id); }

  function frage(key) {
    for (var i = 0; i < FRAGEN.length; i++) if (FRAGEN[i].key === key) return FRAGEN[i];
    return null;
  }

  function optionLabel(key, id) {
    var f = frage(key);
    if (!f) return "";
    for (var i = 0; i < f.options.length; i++) if (f.options[i].id === id) return f.options[i].label;
    return "";
  }

  function mechanism(a) {
    if (a.zug === "einfach") return "spaet";
    if (a.tun === "bier") return "nebenbei";
    if (a.tun === "gruebel") return "kreis";
    if (a.tun === "handy") return "handy";
    return "offen";
  }

  function wennDann(a, mech) {
    if (mech === "spaet") {
      return {
        wenn: "ich die Wohnungstür zumache",
        dann: "klappe ich als Erstes den Laptop zu und stelle ihn in den Flur"
      };
    }
    if (mech === "nebenbei") {
      return {
        wenn: {
          nachricht: "abends noch eine Job-Nachricht kommt",
          laptop: "der Laptop noch offen auf dem Tisch liegt",
          ende: "ich abends noch eine Sache zu Ende bringen will",
          einfach: "ich zu Hause bin und der Kopf noch im Job ist"
        }[a.zug] || "ich zu Bier oder Netflix greife",
        dann: "klappe ich den Laptop zu, sage laut, für heute ist Schluss, und mache erst danach Bier oder Netflix an"
      };
    }
    if (mech === "kreis") {
      var dann = "schreibe ich den Gedanken in einem Satz auf einen Zettel und lege den Zettel weg";
      if (a.ankunft === "nie") dann += " und klappe danach den Laptop zu";
      return {
        wenn: {
          nachricht: "eine Job-Nachricht kommt und der Kopf wieder loslegt",
          laptop: "der Laptop offen daliegt und der Kopf wieder loslegt",
          ende: "ich noch eine Sache zu Ende bringen will und stattdessen weitergrüble",
          einfach: "ich merke, dass ich weitergrüble"
        }[a.zug] || "der Kopf wieder loslegt",
        dann: dann
      };
    }
    if (mech === "handy") {
      return {
        wenn: {
          nachricht: "abends eine Job-Nachricht kommt",
          laptop: "ich zum Handy greife und der Laptop noch offen ist",
          ende: "ich noch eine Sache zu Ende bringen will und zum Handy greife",
          einfach: "ich zum Handy greife und der Kopf noch im Job ist"
        }[a.zug] || "ich zum Handy greife",
        dann: "lege ich das Handy in die Küche und klappe den Laptop zu"
      };
    }
    return {
      wenn: {
        ende: "ich abends noch eine Sache zu Ende bringen will",
        nachricht: "abends noch eine Job-Mail reinkommt",
        laptop: "ich den offenen Laptop sehe und noch eine Mail checken will",
        einfach: "ich abends noch eine Mail checken will"
      }[a.zug] || "ich abends noch eine Mail checken will",
      dann: "schreibe ich in einem Satz, was morgen dran ist, und klappe den Laptop zu"
    };
  }

  function insightParts(a, mech) {
    var lage = AN_SATZ[a.ankunft] + " Im Kopf bleibt " + KOPF[a.kopf] + ". " + TUN_SATZ[a.tun] + " " + ZUG_SATZ[a.zug];
    if (mech === "spaet") {
      return [
        lage,
        "Du merkst erst hinterher, dass du wieder im Job bist. Ein Schritt in dem Moment kommt dann zu spät. Der Schluss muss früher sitzen, direkt an der Tür.",
        "Ein festgelegter Wenn-dann-Satz wird im Schnitt öfter umgesetzt als ein guter Vorsatz allein (Gollwitzer und Sheeran, 2006). Das ist eine Metaanalyse über viele Studien, kein Versprechen für deinen Abend."
      ];
    }
    if (mech === "offen") {
      return [
        lage,
        "Dein Kopf läuft weiter, weil der Arbeitstag nicht abgeschlossen ist. Offene Aufgaben bleiben im Kopf aktiv, solange sie kein morgen haben.",
        "Das zeigt die Forschung zu unerledigten Zielen (Masicampo und Baumeister, 2011). Die Versuche liefen mit Laboraufgaben, nicht an deinem Küchentisch. Ein aufgeschriebener nächster Schritt nimmt der Sache oft den Platz im Kopf. Oft heißt nicht immer."
      ];
    }
    if (mech === "kreis") {
      return [
        lage,
        "Dein Kopf dreht dieselbe Sache weiter, weil sie nirgends abgelegt ist. Weiterdenken kommt dir vor wie Arbeit. Es macht den Abend aber nicht zu.",
        "Wer für ein unerledigtes Ziel einen konkreten nächsten Schritt festlegt, wird davon weniger abgelenkt (Masicampo und Baumeister, 2011). Das sind Experimente, kein Befund über deinen Job."
      ];
    }
    if (mech === "nebenbei") {
      return [
        lage,
        "Bier oder Netflix füllt den Abend. Der Job im Kopf ist damit nicht zu Ende. Beides läuft nebeneinander, solange der Tag keinen Schluss hat.",
        "Der Schluss ist ein Wenn-dann-Satz an der Stelle, an der du sonst weitermachst. Solche Sätze werden im Schnitt öfter umgesetzt als ein guter Vorsatz allein (Gollwitzer und Sheeran, 2006). Die Metaanalyse sagt öfter, nicht immer, und sie hat nicht Bier und Netflix gemessen."
      ];
    }
    if (mech === "handy") {
      return [
        lage,
        "Das Handy holt den Job zurück in die Hand. Solange es neben dir liegt, ist der Arbeitstag nicht zu.",
        "Der Schluss ist ein Wenn-dann-Satz an genau dieser Stelle. Solche Sätze werden im Schnitt öfter umgesetzt als ein guter Vorsatz allein (Gollwitzer und Sheeran, 2006). Das ist ein Durchschnitt aus vielen Studien, keine Garantie für dein Handy."
      ];
    }
    return [
      lage,
      "Der Job hat abends keinen klaren Schluss. Deshalb bleibt der Kopf im gleichen Gang.",
      "Ein festgelegter Wenn-dann-Satz wird im Schnitt öfter umgesetzt als ein guter Vorsatz allein (Gollwitzer und Sheeran, 2006). Öfter heißt nicht immer."
    ];
  }

  function sentenceOf(wenn, dann) {
    var d = String(dann || "").replace(/\.+$/, "");
    return "Wenn " + wenn + ", dann " + d + ".";
  }

  function derive(a) {
    var mech = mechanism(a);
    var pack = GRUENDE[mech] || GRUENDE.offen;
    var wd = wennDann(a, mech);
    var step = pack.step;
    if (mech === "kreis" && a.ankunft === "nie") {
      step = "Schreib den Gedanken, der kreist, in einem Satz auf einen Zettel. Dann klapp den Laptop zu und stell ihn in den Flur.";
    }
    return {
      mechanism: mech,
      insight: insightParts(a, mech),
      step: step,
      wenn: wd.wenn,
      dann: wd.dann,
      sentence: sentenceOf(wd.wenn, wd.dann),
      huerde: pack.huerde,
      stopp: pack.stopp,
      tag: pack.tag,
      ident: pack.ident,
      engpass: pack.engpass,
      engpass_name: pack.engpass_name
    };
  }

  function splitSentence(text) {
    var t = String(text || "").trim().replace(/\s+/g, " ");
    if (!t) return { wenn: "", dann: "", regel: "" };
    var m = t.match(/^Wenn\s+(.+?),\s+dann\s+(.+?)\.?$/i);
    if (!m) return { wenn: "", dann: "", regel: t };
    var wenn = m[1].trim();
    var dann = m[2].trim().replace(/\.+$/, "");
    return { wenn: wenn, dann: dann, regel: sentenceOf(wenn, dann) };
  }

  function view() {
    var d = derive(state);
    if (state.satzEdited && state.regel) {
      var parts = splitSentence(state.regel);
      d.sentence = parts.regel;
      d.wenn = parts.wenn;
      d.dann = parts.dann;
    }
    return d;
  }

  function save() {
    try {
      sessionStorage.setItem(STORE, JSON.stringify({ step: STEPS[stepIndex].id, state: state }));
    } catch (e) { /* privates Fenster */ }
  }

  function load() {
    try {
      var raw = sessionStorage.getItem(STORE);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.state) return false;
      state = data.state;
      if (!state.ankunft && !state.kopf && !state.tun && !state.zug && data.step === "ankunft") return false;
      var idx = 0;
      STEPS.forEach(function (s, i) { if (s.id === data.step) idx = i; });
      stepIndex = idx;
      return true;
    } catch (e) { return false; }
  }

  function planPlain(d) {
    var tun = optionLabel("tun", state.tun);
    var kopf = optionLabel("kopf", state.kopf);
    var lines = [
      "DEIN PLAN",
      "",
      "Muster: " + tun + (kopf ? " Im Kopf: " + kopf + "." : ""),
      "Stopp: " + d.stopp,
      "Ersatz: " + d.step,
      "Regel: " + d.sentence,
      "Satz: " + d.ident,
      "",
      "So benutzt du ihn",
      "Heute: " + d.step,
      "Wenn es passiert: " + d.sentence,
      "Abends: Einmal kurz den Satz sagen. " + d.ident,
      "Wenn es nicht klappt: Denselben Schritt noch einmal, nur kleiner.",
      "",
      d.insight.join(" "),
      "",
      "Das ist ein Selbsttest. Er ersetzt keinen Arzt."
    ];
    return lines.join("\n");
  }

  function downloadText(d) {
    return [
      "DEIN ABEND",
      "",
      d.step,
      "",
      d.sentence,
      "",
      d.insight.join("\n\n"),
      "",
      "Das ist ein Selbsttest. Er ersetzt keinen Arzt."
    ].join("\n");
  }

  function go(delta) {
    clearTimeout(advanceTimer);
    var next = stepIndex + delta;
    if (next < 0) {
      closeBuilder();
      return;
    }
    if (next >= STEPS.length) return;
    stepIndex = next;
    save();
    render();
    focusStep();
  }

  function focusStep() {
    window.requestAnimationFrame(function () {
      var q = document.querySelector("#cs-step h2");
      if (!q) return;
      if (q.tabIndex < 0) q.tabIndex = -1;
      var rect = q.getBoundingClientRect();
      var top = 96;
      if (rect.top < top || rect.top > window.innerHeight - 160) {
        window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - top), behavior: "smooth" });
      }
    });
  }

  function render() {
    var host = el("cs-step");
    var step = STEPS[stepIndex];
    if (!host || !step) return;
    host.innerHTML = bodyOf(step);
    bind(step);
  }

  function progressHtml(n) {
    var pct = Math.round((n / FRAGEN.length) * 100);
    return '<div class="cs-progress-wrap">' +
      '<div class="progress" role="progressbar" aria-valuemin="1" aria-valuemax="' + FRAGEN.length + '" aria-valuenow="' + n + '" aria-valuetext="Frage ' + n + ' von ' + FRAGEN.length + '">' +
      '<div class="progress__bar" style="width:' + pct + '%"></div></div>' +
      '<p class="cs-progress">Frage ' + n + ' von ' + FRAGEN.length + "</p></div>";
  }

  function bodyOf(step) {
    if (step.type === "q") return questionBody(step);
    if (step.type === "warum") return warumBody();
    if (step.type === "jetzt") return jetztBody();
    if (step.type === "signup") return signupBody();
    if (step.type === "danke") return dankeBody();
    return "";
  }

  function nav(primary) {
    return '<div class="cs-nav">' +
      '<button class="btn btn--ghost" type="button" data-cs="back">Zurück</button>' +
      (primary ? '<button class="btn btn--primary" type="button" data-cs="next">' + primary + "</button>" : "") +
      "</div>";
  }

  function choiceHtml(opt, pressed) {
    return '<button type="button" class="choicecard cs-choice" data-id="' + esc(opt.id) + '" aria-pressed="' + (pressed ? "true" : "false") + '">' +
      '<span class="choicecard__mark"></span>' +
      '<span class="choicecard__text"><strong>' + esc(opt.label) + "</strong>" +
      (opt.note ? "<small>" + esc(opt.note) + "</small>" : "") +
      "</span></button>";
  }

  function questionBody(step) {
    var f = FRAGEN[step.q];
    var html = '<div class="cs-step">';
    html += progressHtml(step.q + 1);
    html += "<h2>" + esc(f.h) + "</h2>";
    if (f.sub) html += '<p class="cs-sub">' + esc(f.sub) + "</p>";
    html += '<div class="cs-choices" role="group" aria-label="' + esc(f.h) + '">';
    f.options.forEach(function (opt) {
      html += choiceHtml(opt, state[f.key] === opt.id);
    });
    html += "</div>";
    html += '<p class="err" id="cs-error" role="alert"></p>';
    html += nav("");
    html += "</div>";
    return html;
  }

  function warumBody() {
    var d = derive(state);
    var html = '<div class="cs-step">';
    html += '<p class="cs-progress">Warum das so läuft</p>';
    html += "<h2>Warum der Kopf weiterläuft</h2>";
    d.insight.forEach(function (p) { html += "<p>" + esc(p) + "</p>"; });
    html += '<p class="err" id="cs-error" role="alert"></p>';
    html += nav("Das machst du heute Abend");
    html += "</div>";
    return html;
  }

  function jetztBody() {
    var d = view();
    if (!state.satzEdited) {
      state.regel = d.sentence;
      state.regelWenn = d.wenn;
      state.regelDann = d.dann;
    }
    var html = '<div class="cs-step">';
    html += '<p class="cs-progress">Heute Abend</p>';
    html += "<h2>Das machst du heute Abend.</h2>";
    html += '<p class="cs-callout">' + esc(d.step) + "</p>";
    html += "<h3>Dein Satz, wenn es wieder losgeht</h3>";
    html += '<p class="cs-sub">Gebaut aus deinen Antworten. Ein Satz: wenn das passiert, dann machst du das. Änder ihn, wenn er nicht nach dir klingt.</p>';
    html += '<textarea class="input" id="cs-satz" rows="4" maxlength="500">' + esc(state.regel || d.sentence) + "</textarea>";
    html += '<p class="err" id="cs-error" role="alert"></p>';
    html += nav("Plan behalten");
    html += "</div>";
    return html;
  }

  function signupBody() {
    return '<div class="cs-step"><p class="cs-progress">Plan behalten</p>' +
      "<h2>Wenn du den Plan behalten willst, schick ich ihn dir.</h2>" +
      '<p class="cs-sub">Den Plan hast du schon gesehen. Die Mail kommt, sobald du deine Adresse über den Link im Postfach bestätigst.</p>' +
      '<form id="cs-form" novalidate>' +
      '<div class="field"><label for="cs-vorname">Vorname</label><input class="input" id="cs-vorname" name="vorname" autocomplete="given-name" maxlength="80" required value="' + esc(state.vorname || "") + '"></div>' +
      '<div class="field"><label for="cs-email">E-Mail</label><input class="input" id="cs-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="200" required></div>' +
      '<div class="consent"><input type="checkbox" id="cs-mail"><label for="cs-mail">' + esc(MAIL_TEXT).replace("Datenschutzerklärung", '<a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a>') + "</label></div>" +
      '<div class="consent"><input type="checkbox" id="cs-wa"><label for="cs-wa">' + esc(WA_TEXT) + "</label></div>" +
      '<div class="consent"><input type="checkbox" id="cs-eigen"><label for="cs-eigen">' + esc(EIGEN_TEXT) + "</label></div>" +
      '<p class="err" id="cs-error" role="alert"></p>' +
      '<button class="btn btn--primary btn--block" type="submit" id="cs-send">Schick mir den Plan</button>' +
      '<p class="hint">Ich nutze deine Daten nur für deinen Plan und diese Nachrichten und gebe sie nicht weiter. WhatsApp gehört zu Meta mit Sitz in den USA. Wenn du WhatsApp wählst, laufen die Nachrichten über deren Server. Details in der <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a>. Du kannst deine Einwilligung jederzeit widerrufen: STOP in WhatsApp oder der Link in jeder Mail. Die Mail kommt erst, wenn du deine Adresse über den Link im Postfach bestätigst.</p>' +
      "</form>" +
      nav("") +
      "</div>";
  }

  function dankeBody() {
    var d = view();
    var html = '<div class="cs-step">';
    html += "<h2>" + esc(state.vorname ? "Danke, " + state.vorname + "." : "Danke.") + "</h2>";
    html += '<p class="cs-callout">' + esc(d.step) + "</p>";
    html += "<p><strong>" + esc(d.sentence) + "</strong></p>";
    html += "<p>Schau in dein Postfach und bestätige deine Adresse. Dann kommt derselbe Plan auch per Mail.</p>";
    if (state.whatsapp) {
      html += "<p>Tipp hier und schick die fertige Nachricht ab. Dann kommt morgen früh die erste Aufgabe.</p>";
      html += '<a class="btn btn--primary btn--block" id="cs-wa-link" href="#">WhatsApp öffnen</a>';
    }
    html += '<div class="cs-actions"><button class="btn btn--ghost btn--block" type="button" data-cs="download">Plan speichern</button></div>';
    html += '<div class="cs-soft"><p>Wenn du den Abend mal mit jemandem durchgehen willst, mach ich das gern mit dir. 30 Minuten, kostenlos, ohne Verkaufsgespräch.</p><a class="textlink" href="' + sessionHref() + '">Potenzialanalyse anschauen</a></div>';
    html += "</div>";
    return html;
  }

  function sessionHref() {
    return "/session?via=clearstate&utm_source=clearstate&utm_medium=builder&utm_campaign=clearstate_flow";
  }

  function fail(msg) {
    var box = el("cs-error");
    if (!box) return;
    box.textContent = msg;
    box.classList.add("is-visible");
  }

  function growSatz(node) {
    if (!node) return;
    node.style.height = "auto";
    node.style.height = Math.max(120, node.scrollHeight + 2) + "px";
  }

  function bind(step) {
    var host = el("cs-step");
    var back = host.querySelector("[data-cs=back]");
    if (back) back.addEventListener("click", function () { go(-1); });

    if (step.type === "q") {
      var f = FRAGEN[step.q];
      host.querySelectorAll(".cs-choice").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state[f.key] = btn.getAttribute("data-id");
          state.satzEdited = false;
          state.regel = "";
          save();
          clearTimeout(advanceTimer);
          advanceTimer = setTimeout(function () { go(1); }, 160);
        });
      });
    }

    if (step.type === "warum") {
      host.querySelector("[data-cs=next]").addEventListener("click", function () { go(1); });
    }

    if (step.type === "jetzt") {
      var area = el("cs-satz");
      growSatz(area);
      area.addEventListener("input", function () {
        state.satzEdited = true;
        state.regel = area.value;
        var parts = splitSentence(area.value);
        state.regelWenn = parts.wenn;
        state.regelDann = parts.dann;
        growSatz(area);
        save();
      });
      host.querySelector("[data-cs=next]").addEventListener("click", function () {
        state.regel = area.value.trim();
        var parts = splitSentence(state.regel);
        state.regelWenn = parts.wenn;
        state.regelDann = parts.dann;
        state.regel = parts.regel;
        if (!state.regel) return fail("Schreib noch deinen Satz. Ein Satz reicht.");
        state.satzEdited = true;
        go(1);
      });
    }

    if (step.type === "signup") {
      el("cs-form").addEventListener("submit", function (e) {
        e.preventDefault();
        submit();
      });
    }

    if (step.type === "danke") {
      var link = el("cs-wa-link");
      if (link && state.waHref) link.href = state.waHref;
      var dl = host.querySelector("[data-cs=download]");
      if (dl) dl.addEventListener("click", function () { download(view()); });
    }
  }

  function download(d) {
    var blob = new Blob([downloadText(d)], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "clear-state-plan.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  function accessCode() {
    return window.smhNewAccessCode();
  }

  async function callRpc(name, body) {
    var r = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(name + ": " + r.status + " " + (await r.text()));
    return r;
  }

  async function submit() {
    var vorname = el("cs-vorname").value.trim();
    var email = el("cs-email").value.trim().toLowerCase();
    var mail = el("cs-mail").checked;
    var wa = el("cs-wa").checked;
    var eigen = el("cs-eigen").checked;
    var err = el("cs-error");
    if (err) err.classList.remove("is-visible");
    if (!vorname) return fail("Bitte deinen Vornamen eingeben.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Bitte eine gültige E-Mail eingeben.");
    if (!mail) return fail("Setz noch den Haken bei der Mail, sonst darf ich dir den Plan nicht schicken.");
    if (!eigen) return fail("Setz noch den Haken bei der Eigenverantwortung.");

    var btn = el("cs-send");
    btn.disabled = true;
    btn.textContent = "…";
    var now = new Date().toISOString();
    var code = accessCode();
    var d = view();
    var phasen = { erkennen: 0, unterbrechen: 0, neu: 0, verankern: 0 };
    phasen[d.engpass] = 1;
    var onboarding = {
      magnet: "clearstate",
      flow: FLOW,
      access_code: code,
      muster: state.tun,
      muster_text: optionLabel("tun", state.tun),
      muster_dann: TUN_DANN[state.tun] || "",
      tag1_wenn: d.tag,
      oft: state.ankunft,
      seit: null,
      versucht: null,
      ausloeser: state.zug ? [state.zug] : [],
      ausloeser_text: optionLabel("zug", state.zug),
      koerper: state.kopf,
      koerper_text: optionLabel("kopf", state.kopf),
      koerper_typ: "",
      beduerfnis: d.mechanism,
      beduerfnis_satz: d.insight[1] || "",
      preis: "",
      preis_text: "",
      atem_wirkung: "",
      stopp: d.mechanism,
      stopp_text: d.stopp,
      ersatz: d.mechanism,
      ersatz_text: d.step,
      dauer: "",
      dauer_text: "",
      huerde: d.mechanism,
      huerde_text: d.huerde,
      regel_wenn: d.wenn,
      regel_dann: d.dann,
      regel: d.sentence,
      identitaet: d.ident,
      engpass: d.engpass,
      engpass_name: d.engpass_name,
      phasen: phasen,
      phasen_antworten: [0, 0, 0, 0, 0, 0, 0, 0],
      plan_text: planPlain(d),
      consents: {
        mail: { given: true, text: MAIL_TEXT, at: now },
        whatsapp: { given: wa, text: WA_TEXT, at: wa ? now : null },
        eigenverantwortung: { given: true, text: EIGEN_TEXT, at: now }
      },
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      via: params.get("via"),
      referrer: document.referrer || null,
      landed_at: state.landed_at || now
    };

    try {
      await callRpc("register_tripwire_lead", {
        p_email: email, p_first_name: vorname, p_delivery_channel: "email",
        p_source: FLOW, p_language: "de",
        p_onboarding_data: onboarding, p_access_code: code
      });
      code = await window.smhRegisterLead(callRpc, {
        p_email: email, p_first_name: vorname, p_delivery_channel: "email",
        p_source: FLOW, p_language: "de",
        p_onboarding_data: onboarding,
        p_chosen_path: FLOW, p_flow_name: FLOW
      });
      if (window.smhNotify) {
        await window.smhNotify({
          kind: "clearstate",
          name: vorname,
          email: email,
          phone: "",
          page: "clear-state",
          route: "Clear State",
          answers: [
            { frage: "Zu Hause", antwort: optionLabel("ankunft", state.ankunft) },
            { frage: "Im Kopf", antwort: optionLabel("kopf", state.kopf) },
            { frage: "Was du tust", antwort: optionLabel("tun", state.tun) },
            { frage: "Was dich zurückzieht", antwort: optionLabel("zug", state.zug) },
            { frage: "WhatsApp", antwort: wa ? "ja" : "nein" }
          ]
        });
      }
      state.vorname = vorname;
      state.whatsapp = wa;
      var text = encodeURIComponent(BOT_MESSAGE + "\n\n" + ACCESS_LABEL + " " + code);
      state.waHref = "https://wa.me/" + WA_NUMBER + "?text=" + text;
      save();
      go(1);
    } catch (e) {
      console.error("Clear State speichern:", e);
      btn.disabled = false;
      btn.textContent = "Schick mir den Plan";
      fail("Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.");
    }
  }

  function openBuilder() {
    var bauer = el("bauer");
    if (bauer) bauer.hidden = false;
    document.body.classList.add("cs-on");
    if (!state.landed_at) state.landed_at = new Date().toISOString();
    render();
    focusStep();
  }

  function closeBuilder() {
    document.body.classList.remove("cs-on");
    var bauer = el("bauer");
    if (bauer) bauer.hidden = true;
    stepIndex = 0;
    save();
    var start = el("start");
    if (start) start.scrollIntoView();
  }

  function start() {
    var weiter = params.get("weiter");
    var stufen = { verhalten: 1, gefuehle: 1, alarm: 1, ruhe: 1, satz: 1, werte: 1, wofuer: 1 };
    if (weiter && stufen[weiter]) {
      location.replace("/clear-state/" + weiter);
      return;
    }
    var los = el("cs-los");
    if (los) los.addEventListener("click", function () {
      stepIndex = 0;
      openBuilder();
    });
    if (load()) openBuilder();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
