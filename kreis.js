/* Der Kreis. Fortschritt im Browser, Opt-in über register_magnet_lead.
   Make richtet Janosch selbst ein. Bestehende Szenarien nicht umbauen.

   Gespeichert wird eine Zeile in magnet_leads, magnet = kreis.
   messenger_status bleibt pending, deshalb verschickt der bestehende
   Feierabend-Versand diese Zeile nicht.
   result_typ      = Slug des Schritts, den er gerade abschließt
   erstes_nein     = Slug des nächsten Schritts (bei kreis KEINE Test-Stelle)
   result_abstand_min = Nummer 1 bis 7
   via             = kreis
   Zugangscode     = FT + 8 Zeichen, nur bei WhatsApp und Telegram

   Bevor das E-Mail-Szenario 8080063 (v_magnet_email_to_brevo, Brevo Liste 8,
   Vorlage 47) aktiv wird: Filter magnet = feierabend_test. Sonst bekommt
   ein Kreis-Lead die Feierabend-Mail. Die Sicht filtert magnet heute nicht.

   Neues Szenario, nicht das alte umbauen:
   magnet_leads lesen, wo magnet = kreis.
   WhatsApp-Vorlage neu anlegen, nicht daily_lesson_trigger_de wiederverwenden.
   Textvorschlag: "Dein nächster Schritt im Kreis: {{name}}. Hier machst du
   weiter: https://www.shiftmyhorizon.com/kreis?weiter={{slug}}"
   slug = erstes_nein. Den Link nicht über magnet_stelle bauen, der kennt
   nur die Buchstaben A bis F vom Feierabend-Test.
   Wenn eine FT-Nachricht reinkommt: Zeile mit diesem access_code suchen.
   Nur wenn magnet = kreis, Telefon speichern und messenger_status auf active,
   und erst dann, wenn die Vorlage für magnet kreis, step 1, status approved
   in magnet_messenger_templates steht. send_after_days = 0. */
(function () {
  "use strict";

  var SUPABASE_URL = "https://jztwnumtwihomgxwlwor.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yWcwDruITLbaok1rBl4Fiw_Ddjn9xZe";
  var WA_NUMBER = "491632225456";
  var TG_BOT = "shift_my_horizon_bot";
  var KEY = "smh-kreis-v1";
  var ORIGIN = "https://www.shiftmyhorizon.com";

  var STEPS = [
    { slug: "verhalten", name: "Verhalten", n: 1 },
    { slug: "gefuehle", name: "Gefühle", n: 2 },
    { slug: "alarm", name: "Alarm und Planer", n: 3 },
    { slug: "ruhe", name: "Innere Ruhe", n: 4 },
    { slug: "satz", name: "Der Satz hinter dem Antrieb", n: 5 },
    { slug: "werte", name: "Werte", n: 6 },
    { slug: "wofuer", name: "Wofür", n: 7 }
  ];

  var BEHIND = {
    frust: "Hinter Frust steckt oft, dass du übergangen wurdest. Du willst mitreden.",
    wut: "Hinter Wut steckt oft eine Grenze. Du willst Fairness, und dass der Ton stimmt.",
    stress: "Hinter Stress steckt oft eine Aufgabe ohne klares Ende. Du willst Klarheit.",
    genervt: "Genervt ist meist Wut in leise. Darunter liegt oft: so nicht.",
    gereizt: "Gereizt kommt schnell, wenn der Alarm schon an ist. Darunter liegt oft Druck, oder dass du nicht gehört wirst.",
    angespannt: "Angespannt heißt oft: der Körper ist noch im Betriebsmodus. Du brauchst ein Ende.",
    ungeduldig: "Ungeduldig heißt oft: es ist nicht klar, was als Nächstes dran ist.",
    leer: "Leer heißt oft: du warst den Tag über bei der Arbeit und abends bei niemandem wirklich da.",
    uebergangen: "Übergangen ist schon das genauere Wort. Du willst mitreden und gesehen werden.",
    enttaeuscht: "Enttäuscht heißt oft: du hast mit etwas gerechnet, und es kam anders. Du willst Verlässlichkeit.",
    allein: "Allein heißt oft: du bist im Raum, aber nicht im Kontakt. Du willst abends wirklich da sein.",
    unsicher: "Unsicher heißt oft: dir fehlt ein fester nächster Schritt, oder ein Platz, an dem du dich auskennst.",
    traurig: "Traurig ist leiser als Wut. Oft fehlt Verbindung, oder etwas ist zu Ende, das dir etwas bedeutet hat.",
    beschaemt: "Beschämt heißt oft: du glaubst, die anderen haben einen Fehler an dir gesehen. Darunter liegt, in der Sache können zu wollen.",
    ratlos: "Ratlos heißt: der Planer hat gerade keinen nächsten Schritt. Ein kleiner reicht.",
    druck: "Unter Druck ist schon genauer als Stress. Du willst ein Ende und Luft im Kalender.",
    unruhig: "Unruhig heißt oft: der Alarm ist an, obwohl die Aufgabe zu ist.",
    nichtgesehen: "Nicht gesehen ist der Kern unter vielen Frust-Momenten. Du willst, dass dein Anteil zählt.",
    muede: "Müde kommt vom Tag im Betriebsmodus.",
    missverstanden: "Missverstanden heißt: du hast etwas gesagt, und es kam anders an. Du willst Klarheit.",
    abgehaengt: "Abgehängt heißt oft: die anderen waren weiter, und du warst nicht im Bild. Du willst mitreden.",
    ungerecht: "Ungerecht ist schon eine Bewertung. Das Gefühl darunter ist oft übergangen. Du willst Fairness."
  };

  function stepBy(slug) {
    for (var i = 0; i < STEPS.length; i++) if (STEPS[i].slug === slug) return STEPS[i];
    return null;
  }
  function nextOf(slug) {
    var i = 0;
    for (; i < STEPS.length; i++) if (STEPS[i].slug === slug) break;
    return STEPS[(i + 1) % STEPS.length];
  }

  function load() {
    var empty = { v: 1, last: "", done: [], answers: {}, name: "", code: "" };
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return empty;
      var data = JSON.parse(raw);
      if (!data || data.v !== 1) return empty;
      data.done = Array.isArray(data.done) ? data.done : [];
      data.answers = data.answers || {};
      return data;
    } catch (e) {
      return empty;
    }
  }
  function persist(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* voll oder privat */ }
  }

  function knownSlug(slug) { return !!stepBy(slug); }

  function mergeQuery(state) {
    var params = new URLSearchParams(location.search);
    var fertig = (params.get("fertig") || "").split(",");
    fertig.forEach(function (slug) {
      if (knownSlug(slug) && state.done.indexOf(slug) < 0) state.done.push(slug);
    });
    var weiter = params.get("weiter");
    if (knownSlug(weiter)) state.last = weiter;
    persist(state);
    return { weiter: knownSlug(weiter) ? weiter : "" };
  }

  function resumeUrl(nextSlug, done) {
    var list = done.filter(knownSlug);
    var q = "weiter=" + encodeURIComponent(nextSlug);
    if (list.length) q += "&fertig=" + encodeURIComponent(list.join(","));
    return ORIGIN + "/kreis?" + q;
  }

  function accessCode(state) {
    if (state.code && /^FT[A-Z0-9]{8}$/.test(state.code)) return state.code;
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var out = "FT";
    for (var i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    state.code = out;
    persist(state);
    return out;
  }

  function mark(state) {
    document.querySelectorAll("[data-slug]").forEach(function (el) {
      var slug = el.getAttribute("data-slug");
      el.classList.toggle("is-done", state.done.indexOf(slug) >= 0);
      el.classList.toggle("is-now", state.last === slug);
    });
    var hub = document.querySelector("[data-hub]");
    if (hub && state.last && stepBy(state.last)) hub.textContent = stepBy(state.last).name;
  }

  function bootOverview() {
    var state = load();
    var q = mergeQuery(state);
    mark(state);
    var box = document.querySelector("[data-resume]");
    if (!box || !q.weiter) return;
    var step = stepBy(q.weiter);
    box.hidden = false;
    box.querySelector("[data-resume-text]").textContent = "Du machst weiter bei " + step.name + ".";
    var link = box.querySelector("[data-resume-link]");
    link.href = "/kreis/" + step.slug;
    link.textContent = "Weiter zu " + step.name;
  }

  function groupRoot(name) {
    return document.querySelector('[data-pick="' + name + '"]');
  }
  function selection(name) {
    var root = groupRoot(name);
    if (!root) return [];
    var radios = root.querySelectorAll('input[type="radio"]');
    if (radios.length) {
      var checked = root.querySelector("input:checked");
      if (!checked) return [];
      var card = checked.closest(".choicecard");
      var text = card ? card.querySelector(".choicecard__text").textContent.replace(/\s+/g, " ").trim() : checked.value;
      return [{ id: checked.value, label: text }];
    }
    return Array.prototype.map.call(root.querySelectorAll('[aria-pressed="true"]'), function (btn) {
      return {
        id: btn.getAttribute("data-id"),
        label: btn.textContent.replace(/\s+/g, " ").trim(),
        kind: btn.getAttribute("data-kind") || "",
        behind: btn.getAttribute("data-behind") || "",
        ask: btn.getAttribute("data-ask") || "",
        cost: btn.getAttribute("data-cost") || ""
      };
    });
  }
  function ids(name) { return selection(name).map(function (item) { return item.id; }); }

  function savedId(item) { return typeof item === "string" ? item : item && item.id; }
  function restoreGroup(name, saved) {
    var root = groupRoot(name);
    if (!root || !saved) return;
    var want = saved.map(savedId);
    root.querySelectorAll("[data-id]").forEach(function (btn) {
      var on = want.indexOf(btn.getAttribute("data-id")) >= 0;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    root.querySelectorAll('input[type="radio"]').forEach(function (input) {
      input.checked = want.indexOf(input.value) >= 0;
    });
    applyMax(root);
  }

  function applyMax(root) {
    var max = Number(root.getAttribute("data-max") || 0);
    if (!max) return;
    var on = root.querySelectorAll('[aria-pressed="true"]').length;
    var full = on >= max;
    root.querySelectorAll("[data-id]").forEach(function (btn) {
      var pressed = btn.getAttribute("aria-pressed") === "true";
      btn.disabled = full && !pressed;
    });
    var count = document.querySelector("[data-count]");
    if (count && root.getAttribute("data-pick") === "werte") count.textContent = on + " von " + max;
  }

  function wireChips(root) {
    root.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn || !root.contains(btn)) return;
      if (btn.disabled) return;
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      applyMax(root);
    });
  }

  function showErr(panel, msg) {
    var err = panel.querySelector("[data-err]");
    if (!err) return;
    err.textContent = msg || "";
    err.classList.toggle("is-visible", !!msg);
  }

  function panelOk(panel) {
    var pick = panel.querySelector("[data-pick]");
    if (!pick) return true;
    var min = Number(pick.getAttribute("data-min") || 0);
    var max = Number(pick.getAttribute("data-max") || 0);
    var n = selection(pick.getAttribute("data-pick")).length;
    if (min && n < min) {
      var left = min - n;
      showErr(panel, max ? (left === 1 ? "Es fehlt noch eins." : "Es fehlen noch " + left + ".") : "Tipp eine Antwort an.");
      return false;
    }
    showErr(panel, "");
    return true;
  }

  function setHtml(sel, html) {
    var el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderGefuehle(panelId, state) {
    var feel = selection("feel");
    var feelIds = feel.map(function (x) { return x.id; });
    if (panelId === "same") {
      var surface = feel.filter(function (x) { return x.kind === "surface"; }).length;
      var line = surface >= feel.length - surface
        ? "Du hast vor allem die schnellen Wörter genommen. Frust, Wut und Stress sind meist zuerst da."
        : "Du hast schon genauere Wörter dabei. Die schnellen, also Frust, Wut und Stress, sind bei den meisten zuerst da.";
      setHtml("[data-slot='same']", "<p>" + esc(line) + "</p>");
    }
    if (panelId === "quiet") {
      var host = document.querySelector("[data-slot='quiet']");
      if (!host) return;
      host.innerHTML = "";
      document.querySelectorAll('[data-pick="feel"] .chip').forEach(function (btn) {
        if (feelIds.indexOf(btn.getAttribute("data-id")) >= 0) return;
        var clone = btn.cloneNode(true);
        clone.setAttribute("aria-pressed", "false");
        clone.disabled = false;
        host.appendChild(clone);
      });
      if (!host.childElementCount) {
        var note = document.createElement("p");
        note.textContent = "Du hast schon alle Wörter angetippt. Dann geh direkt weiter.";
        host.appendChild(note);
      }
      var box = document.querySelector('[data-pick="auch"]');
      if (box) {
        if (!box.dataset.wired) { box.dataset.wired = "1"; wireChips(box); }
        restoreGroup("auch", (state.answers.gefuehle || {}).auch || []);
      }
    }
    if (panelId === "behind") {
      var auch = selection("auch");
      var ordered = auch.concat(feel);
      var lines = [];
      ordered.forEach(function (item) {
        var text = BEHIND[item.id];
        if (text && lines.indexOf(text) < 0) lines.push(text);
      });
      setHtml("[data-slot='behind']", lines.slice(0, 3).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join(""));
      var sample = (auch[0] || feel.filter(function (x) { return x.kind !== "surface"; })[0] || { label: "übergangen" }).label;
      var slot = document.querySelector("[data-slot='beispiel']");
      if (slot) slot.textContent = sample.toLowerCase();
    }
  }

  function renderAlarm(panelId) {
    if (panelId !== "ergebnis") return;
    var scenes = ["s1", "s2", "s3", "s4", "s5"];
    var alarm = 0;
    scenes.forEach(function (name) {
      var hit = selection(name)[0];
      if (hit && hit.id !== "ruhig") alarm += 1;
    });
    var text = "Bei " + alarm + " von 5 Szenen hat der Alarm das Steuer gehabt.";
    if (alarm <= 1) text += " Der Planer ist bei dir oft noch dabei. Die Übung ist für die Szene, in der der Alarm doch übernimmt.";
    else if (alarm <= 3) text += " Der Planer wird in diesen Momenten leiser. Die Antwort kommt dir oft erst danach.";
    else text += " Der Planer kommt bei dir später dran, oft erst auf dem Sofa oder auf dem Weg nach Hause.";
    setHtml("[data-slot='alarm']", "<p>" + esc(text) + "</p>");
  }

  function renderVerhalten(panelId) {
    if (panelId !== "ergebnis") return;
    var neu = selection("neu")[0];
    var kipp = selection("kipp")[0];
    var was = selection("was")[0];
    var satz = selection("satz")[0];
    if (!neu || !kipp || !was || !satz) return;
    var text = "Dein Neustart sitzt hier: " + neu.label + ". Er kippt " + kipp.label.charAt(0).toLowerCase() + kipp.label.slice(1) + ". Dann passiert das: " + was.label + ". Dazu der Satz „" + satz.label.replace(/\.$/, "") + "“.";
    setHtml("[data-slot='muster']", "<p class=\"kquote\">" + esc(text) + "</p><p>Der Bruch liegt eine Ebene tiefer, an derselben Stelle in der Woche.</p>");
  }

  function renderRuhe(panelId) {
    if (panelId !== "ergebnis") return;
    var hit = selection("ruhe")[0];
    var extra = "Der Körper bleibt oft im Betriebsmodus, auch wenn die Aufgabe zu ist. Umschalten ist ein Vorgang, den du üben kannst.";
    if (hit && hit.id === "da") extra = "Wenn du wirklich da bist, klappt das Umschalten bei dir oft. Die Übung ist für den Abend, an dem der Kopf doch noch im Meeting sitzt.";
    setHtml("[data-slot='ruhe']", "<p>" + esc(extra) + "</p>");
  }

  function renderSatz(panelId) {
    if (panelId !== "ergebnis") return;
    var n = selection("saetze").length;
    var text = n
      ? "Du kennst " + (n === 1 ? "einen" : n === 2 ? "zwei" : "alle drei") + " davon. Solche Sätze treiben die Extra-Stunde an und machen das Abschalten schwer."
      : "Keiner von den dreien. Deiner kann anders lauten.";
    text += " Ich sag das aus der Erfahrung, nicht aus einer Studie. Die Arbeit an so einem Satz passiert in Stufe 2, Dein eigener Kern, und erst wenn das Runterschalten sitzt. Hier bleibt es beim Wiedererkennen.";
    setHtml("[data-slot='satz']", "<p>" + esc(text) + "</p>");
  }

  function renderWerte(panelId) {
    if (panelId !== "ergebnis") return;
    var all = selection("werte");
    var groups = { mittel: [], wunsch: [], wert: [] };
    all.forEach(function (item) { if (groups[item.kind]) groups[item.kind].push(item); });
    var html = "";
    groups.mittel.forEach(function (item) {
      html += "<div class=\"kline\"><strong>" + esc(item.label) + " ist ein Mittel oder ein Ziel.</strong><p>Dahinter liegt oft: " + esc(item.behind) + " " + esc(item.ask) + "</p></div>";
    });
    groups.wunsch.forEach(function (item) {
      html += "<div class=\"kline\"><strong>" + esc(item.label) + " klingt gut.</strong><p>" + esc(item.behind) + "</p></div>";
    });
    groups.wert.forEach(function (item) {
      html += "<div class=\"kline\"><strong>" + esc(item.label) + " ist ein Wert, der eine Entscheidung kostet.</strong><p>" + esc(item.cost) + "</p></div>";
    });
    var real = groups.wert.slice(0, 2);
    var close;
    if (real.length) {
      close = "Mitnehmen: " + real.map(function (x) { return x.label; }).join(" und ") + ". Ein Wert kostet etwas, weil eine Entscheidung etwas kostet. Er zeigt sich daran, wofür du Nein sagst.";
    } else if (groups.mittel[0]) {
      close = "In den fünf Wörtern steckt noch kein Wert, der ein Nein kostet. Hinter " + groups.mittel[0].label + " liegt oft: " + groups.mittel[0].behind + " Nimm das mit in den Kalender.";
    } else {
      close = "Die Wörter klingen gut. Ein Wert wird es, wenn du diese Woche irgendwo Nein sagst.";
    }
    html += "<p>" + esc(close) + "</p>";
    html += "<p>Schwartz beschreibt 2012, dass Werte in Spannung zueinander stehen. Du kannst nicht alle gleichzeitig nach oben drehen.</p>";
    setHtml("[data-slot='werte']", html);
  }

  var WOFUER = {
    leute: "meine Leute zu Hause",
    arbeit: "die Arbeit, die ich gut machen will",
    jemand: "jemanden, der auf mich zählt",
    mich: "mich, damit ich wieder klar bin"
  };
var WOFUER_WAS = {
  kopf: "den klaren Kopf im nächsten Termin",
  da: "den Abend zu Hause",
  ende: "eine Sache, die fertig wird",
  luft: "Luft im Kalender"
};
  var WOFUER_WENN = {
    laptop: "Wenn der Abend da ist, dann bleibt der Laptop zu.",
    gespraech: "Wenn jemand mit mir redet, dann höre ich den Satz zu Ende.",
    aufgabe: "Wenn eine Aufgabe offen ist, dann mache ich sie fertig, bevor die nächste kommt.",
    stunde: "Wenn die Woche startet, dann setze ich eine Stunde, die mir gehört."
  };

  function wofuerSentence() {
    var wer = selection("wer")[0];
    var was = selection("wasfuer")[0];
    var wann = selection("woran")[0];
    if (!wer || !was || !wann) return "";
    return WOFUER_WENN[wann.id] + " Das ist für " + WOFUER[wer.id] + ". Es geht um " + WOFUER_WAS[was.id] + ".";
  }

  function renderWofuer(panelId, state) {
    if (panelId !== "ergebnis") return;
    var sentence = wofuerSentence();
    var area = document.querySelector("[data-sentence]");
    if (area && !area.value) area.value = sentence;
    state.answers.wofuer = state.answers.wofuer || {};
    state.answers.wofuer.satz = area ? area.value : sentence;
    persist(state);
    var muster = state.answers.verhalten;
    var back = document.querySelector("[data-slot='kreis']");
    var kipp = muster && muster.kipp && muster.kipp[0];
    var where = kipp && (kipp.label || "");
    if (back && where) {
      back.textContent = "Dein Bruch saß hier: " + where + ". Die Handlung diese Woche setzt an genau der Stelle an. Damit bist du wieder bei Schritt 1.";
    }
  }

  var RENDER = {
    gefuehle: renderGefuehle,
    alarm: renderAlarm,
    verhalten: renderVerhalten,
    ruhe: renderRuhe,
    satz: renderSatz,
    werte: renderWerte,
    wofuer: renderWofuer
  };

  function summary(slug, state) {
    var bag = state.answers[slug] || {};
    try { return JSON.stringify(bag).slice(0, 700); } catch (e) { return ""; }
  }

  function optinHtml() {
    return (
      '<form id="kreis-form" novalidate>' +
        '<div class="field"><label for="vorname">Vorname</label><input class="input" type="text" id="vorname" autocomplete="given-name" required></div>' +
        '<div class="field"><label for="email">E-Mail</label><input class="input" type="email" id="email" autocomplete="email" inputmode="email" required>' +
        '<p class="hint">Über deine E-Mail ordne ich die Nachricht zu. Sie kommt auf dem Weg, den du unten wählst.</p></div>' +
        '<fieldset class="field choicecards"><legend class="field__label">Wohin soll der nächste Schritt?</legend>' +
          '<label class="choicecard"><input type="radio" name="kanal" value="whatsapp"><span class="choicecard__mark"></span><span class="choicecard__text">WhatsApp</span></label>' +
          '<label class="choicecard"><input type="radio" name="kanal" value="telegram"><span class="choicecard__mark"></span><span class="choicecard__text">Telegram</span></label>' +
          '<label class="choicecard"><input type="radio" name="kanal" value="email"><span class="choicecard__mark"></span><span class="choicecard__text">E-Mail</span></label>' +
        '</fieldset>' +
        '<div class="consent"><input type="checkbox" id="c-kreis"><label for="c-kreis">Ich möchte den nächsten Schritt im Kreis bekommen und habe die <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a> gelesen. Abmeldung jederzeit.</label></div>' +
        '<div class="consent"><input type="checkbox" id="c-eigen"><label for="c-eigen">Ich handle eigenverantwortlich. Die Übungen sind Anregungen, keine Behandlung. Wenn es mir körperlich oder psychisch nicht gut geht, kläre ich vorher ärztlich ab.</label></div>' +
        '<button class="btn btn--primary btn--block" type="button" id="kreis-send">Nächsten Schritt schicken</button>' +
        '<p class="err" id="kreis-error" role="alert"></p>' +
        '<p class="hint">Deine Daten nutze ich nur, um dir diesen nächsten Schritt zu schicken. WhatsApp und Telegram sind Dienste mit Sitz außerhalb der EU. Details stehen in der <a href="/datenschutz">Datenschutzerklärung</a>. Abmelden kannst du mit STOP oder über den Link in der E-Mail.</p>' +
      '</form>' +
      '<div id="kreis-done" hidden><h3 id="kreis-done-title">Geschafft.</h3><div id="kreis-messenger" hidden><p>Tipp auf den Button und schick die Nachricht ab. Darin steht dein Link. Die Antwort kommt auf demselben Weg.</p><a class="btn btn--primary btn--block" id="kreis-wa" href="#">WhatsApp öffnen</a></div><div id="kreis-mail" hidden><p>Denselben Link schicke ich dir per E-Mail. Schau im Postfach und im Spam nach.</p></div><p>Dein Link, damit du auch ohne die Nachricht weiterkommst:</p><p><a id="kreis-url" href="/kreis"></a></p></div>'
    );
  }

  function failForm(msg) {
    var err = document.getElementById("kreis-error");
    var btn = document.getElementById("kreis-send");
    if (err) { err.textContent = msg; err.classList.add("is-visible"); }
    if (btn) { btn.disabled = false; btn.textContent = "Nächsten Schritt schicken"; }
  }

  function wireOptin(flow, state) {
    document.querySelectorAll("[data-optin]").forEach(function (host) {
      if (!host.childElementCount) host.innerHTML = optinHtml();
    });
    var btn = document.getElementById("kreis-send");
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = "1";
    var nameInput = document.getElementById("vorname");
    if (nameInput && state.name) nameInput.value = state.name;
    btn.addEventListener("click", function () { sendOptin(flow, state); });
  }

  async function sendOptin(flow, state) {
    var btn = document.getElementById("kreis-send");
    var vorname = document.getElementById("vorname").value.trim();
    var email = document.getElementById("email").value.trim().toLowerCase();
    var kanalEl = document.querySelector('#kreis-form input[name="kanal"]:checked');
    var kanal = kanalEl ? kanalEl.value : "";
    var err = document.getElementById("kreis-error");
    err.classList.remove("is-visible");
    if (!vorname) return failForm("Bitte deinen Vornamen eingeben.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return failForm("Bitte eine gültige E-Mail eingeben.");
    if (!kanal) return failForm("Wohin soll die Nachricht?");
    if (!document.getElementById("c-kreis").checked) return failForm("Bitte stimme zu, damit ich dir den nächsten Schritt schicken darf.");
    if (!document.getElementById("c-eigen").checked) return failForm("Bitte bestätige noch den Hinweis zur Eigenverantwortung.");
    btn.disabled = true;
    btn.textContent = "…";
    state.name = vorname;
    var step = stepBy(flow.slug);
    var next = nextOf(flow.slug);
    if (state.done.indexOf(flow.slug) < 0) state.done.push(flow.slug);
    state.last = next.slug;
    persist(state);
    var url = resumeUrl(next.slug, state.done);
    var code = accessCode(state);
    var params = new URLSearchParams(location.search);
    var body = {
      p_email: email,
      p_magnet: "kreis",
      p_result_typ: flow.slug,
      p_result_abstand_min: step.n,
      p_erstes_nein: next.slug,
      p_via: "kreis",
      p_utm_source: params.get("utm_source"),
      p_utm_medium: params.get("utm_medium"),
      p_utm_campaign: params.get("utm_campaign"),
      p_referrer: document.referrer || null,
      p_consent: true,
      p_consent_text_version: "kreis-2026-10",
      p_delivery_channel: kanal,
      p_access_code: kanal === "email" ? null : code
    };
    try {
      var res = await fetch(SUPABASE_URL + "/rest/v1/rpc/register_magnet_lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("register_magnet_lead " + res.status);
      if (window.smhNotify) {
        await window.smhNotify({
          kind: "kreis",
          name: vorname,
          email: email,
          phone: "",
          page: "kreis-" + flow.slug,
          route: "Kreis: " + next.name,
          answers: [
            { frage: "Schritt", antwort: step.name },
            { frage: "Nächster Schritt", antwort: next.name },
            { frage: "Link", antwort: url },
            { frage: "Kanal", antwort: kanal },
            { frage: "Ergebnis", antwort: summary(flow.slug, state) }
          ]
        });
      }
      showDone(vorname, kanal, code, url, next);
    } catch (e) {
      console.error(e);
      failForm("Speichern hat nicht geklappt. Dein Link steht trotzdem unten. Heb ihn dir auf.");
      var fallback = document.getElementById("kreis-url");
      if (fallback) {
        document.getElementById("kreis-done").hidden = false;
        document.getElementById("kreis-messenger").hidden = true;
        document.getElementById("kreis-mail").hidden = true;
        fallback.href = url;
        fallback.textContent = url;
      }
    }
  }

  function showDone(vorname, kanal, code, url, next) {
    document.getElementById("kreis-form").hidden = true;
    document.getElementById("kreis-done").hidden = false;
    document.getElementById("kreis-done-title").textContent = "Danke, " + vorname + ".";
    var link = document.getElementById("kreis-url");
    link.href = url;
    link.textContent = url;
    var text = "Hallo, ich mache im Kreis weiter.\n\nNächster Schritt: " + next.name + "\nLink: " + url + "\n\nMein Zugangscode: " + code;
    var go = document.getElementById("kreis-wa");
    if (kanal === "email") {
      document.getElementById("kreis-mail").hidden = false;
    } else {
      document.getElementById("kreis-messenger").hidden = false;
      if (kanal === "telegram") {
        go.href = "https://t.me/" + TG_BOT + "?text=" + encodeURIComponent(text);
        go.textContent = "Telegram öffnen";
      } else {
        go.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
        go.textContent = "WhatsApp öffnen";
      }
    }
  }

  function remember(state, slug) {
    var bag = state.answers[slug] || {};
    document.querySelectorAll("[data-pick]").forEach(function (root) {
      var name = root.getAttribute("data-pick");
      var items = selection(name);
      if (!items.length && bag[name]) return;
      bag[name] = items.map(function (item) { return { id: item.id, label: item.label }; });
    });
    if (slug === "wofuer") {
      var area = document.querySelector("[data-sentence]");
      if (area && area.value) bag.satz = area.value;
    }
    state.answers[slug] = bag;
    persist(state);
  }

  function bootFlow() {
    var flow = document.querySelector("[data-kreis-flow]");
    if (!flow) return;
    var slug = flow.getAttribute("data-slug");
    var state = load();
    var q = mergeQuery(state);
    var panels = Array.prototype.slice.call(flow.querySelectorAll("[data-panel]"));
    var index = 0;
    document.querySelectorAll("[data-pick]").forEach(wireChips);
    var saved = state.answers[slug] || {};
    Object.keys(saved).forEach(function (name) { if (Array.isArray(saved[name])) restoreGroup(name, saved[name]); });
    var areaBoot = document.querySelector("[data-sentence]");
    if (areaBoot && saved.satz) areaBoot.value = saved.satz;
    var progBoot = document.querySelector("[data-part]");
    if (progBoot) progBoot.textContent = "Teil 1 von " + panels.length;
    if (saved.feel || saved.werte || saved.neu) {
      var note = document.querySelector("[data-back]");
      if (note) note.hidden = false;
    }
    if (q.weiter && q.weiter !== slug) {
      var foreign = document.querySelector("[data-foreign]");
      var target = stepBy(q.weiter);
      if (foreign && target) {
        foreign.hidden = false;
        foreign.querySelector("a").href = "/kreis/" + target.slug;
        foreign.querySelector("a").textContent = "Weiter zu " + target.name;
      }
    }
    wireOptin(flow, state);
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(i) {
      index = i;
      var panel = panels[i];
      var id = panel.getAttribute("data-panel");
      if (RENDER[slug]) RENDER[slug](id, state);
      panels.forEach(function (el, n) {
        var on = n === i;
        el.classList.toggle("is-on", on);
        el.hidden = !on;
      });
      var live = document.querySelector("[data-live]");
      var title = panel.querySelector("h1, h2");
      if (live && title) live.textContent = title.textContent;
      var prog = document.querySelector("[data-part]");
      if (prog) prog.textContent = "Teil " + (i + 1) + " von " + panels.length;
      if (title) {
        if (!title.hasAttribute("tabindex")) title.setAttribute("tabindex", "-1");
        title.focus({ preventScroll: true });
      }
      var top = flow.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
      if (i === panels.length - 1) {
        if (state.done.indexOf(slug) < 0) state.done.push(slug);
        state.last = nextOf(slug).slug;
        persist(state);
      }
    }

    flow.addEventListener("click", function (e) {
      var go = e.target.closest("[data-go]");
      if (!go || !flow.contains(go)) return;
      var panel = go.closest("[data-panel]");
      if (!panelOk(panel)) return;
      remember(state, slug);
      var dest = go.getAttribute("data-go");
      if (dest) {
        var found = panels.findIndex(function (el) { return el.getAttribute("data-panel") === dest; });
        if (found >= 0) show(found);
        return;
      }
      if (index < panels.length - 1) show(index + 1);
    });

    document.querySelectorAll("[data-minute]").forEach(wireMinute);
    var area = document.querySelector("[data-sentence]");
    if (area) {
      area.addEventListener("input", function () {
        state.answers.wofuer = state.answers.wofuer || {};
        state.answers.wofuer.satz = area.value;
        persist(state);
      });
    }
  }

  function wireMinute(box) {
    var total = Number(box.getAttribute("data-minute")) || 60;
    var phase = box.querySelector("[data-phase]");
    var time = box.querySelector("[data-time]");
    var btn = box.querySelector("[data-minute-btn]");
    var kind = box.getAttribute("data-minute-kind") || "ruhe";
    var steps = kind === "alarm"
      ? [["Merk den Alarm. Ein Wort reicht.", 15000], ["Der Ausatem ist länger als der Einatem.", 20000], ["Sag innerlich den Satz, den du im Raum haben willst.", 25000]]
      : [["Durch die Nase herein", 4000], ["Aus, länger als herein", 6000]];
    var running = false, t0 = 0, timers = [], tick = null;
    function clear() { timers.forEach(clearTimeout); timers = []; if (tick) clearInterval(tick); }
    function finish() {
      running = false; clear();
      phase.textContent = "Fertig. Weiter ganz normal.";
      time.textContent = "0";
      btn.textContent = "Noch einmal";
    }
    function cycle(i) {
      if (!running) return;
      var left = total * 1000 - (Date.now() - t0);
      if (left <= 300) { finish(); return; }
      var idx = kind === "alarm" ? Math.min(i, steps.length - 1) : (i % steps.length);
      var st = steps[idx];
      phase.textContent = st[0];
      timers.push(setTimeout(function () { cycle(i + 1); }, Math.min(st[1], left)));
    }
    btn.addEventListener("click", function () {
      if (running) {
        running = false; clear();
        phase.textContent = "Angehalten.";
        time.textContent = String(total);
        btn.textContent = "Eine Minute starten";
        return;
      }
      running = true; t0 = Date.now();
      btn.textContent = "Stopp";
      time.textContent = String(total);
      tick = setInterval(function () {
        time.textContent = String(Math.max(0, total - Math.floor((Date.now() - t0) / 1000)));
      }, 250);
      cycle(0);
    });
  }

  function boot() {
    if (document.querySelector("[data-kreis-overview]")) bootOverview();
    if (document.querySelector("[data-kreis-flow]")) bootFlow();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
