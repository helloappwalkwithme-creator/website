/* Verhalten der neuen Angebotsseiten. Keine Preise, keine Zahlungsdaten im Browser. */
(function () {
  "use strict";
  var katalog = window.SMHKatalog;
  if (!katalog) return;

  var kaufbar = {};

  function track() {
    try {
      var params = new URLSearchParams(location.search);
      var stored = {};
      try { stored = JSON.parse(sessionStorage.getItem("smh_track") || "{}"); } catch (e) { stored = {}; }
      katalog.TRACK_KEYS.forEach(function (key) {
        var value = params.get(key);
        if (value) stored[key] = value.slice(0, 120);
      });
      sessionStorage.setItem("smh_track", JSON.stringify(stored));
    } catch (e) { /* Tracking bleibt aus, die Seite funktioniert weiter. */ }
  }

  function utm() {
    try { return JSON.parse(sessionStorage.getItem("smh_track") || "{}"); } catch (e) { return {}; }
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, function (c) {
      var n = Number(c);
      return (n ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))).toString(16);
    });
  }

  function ladeKaufbar() {
    return fetch("/api/kaufbar", { headers: { Accept: "application/json" } })
      .then(function (res) { if (!res.ok) throw new Error("status"); return res.json(); })
      .then(function (data) {
        (data.angebote || []).forEach(function (row) { kaufbar[row.id] = !!row.kaufbar; });
        return kaufbar;
      });
  }

  function setHinweis(text) {
    document.querySelectorAll("[data-kauf-hinweis]").forEach(function (el) { el.textContent = text; });
  }

  function bindKaufLinks() {
    document.querySelectorAll("[data-kauf]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = link.getAttribute("data-kauf");
        if (kaufbar[id]) return;
        event.preventDefault();
        setHinweis("Für dieses Angebot ist noch kein Stripe-Preis hinterlegt. Ein Kauf ist hier nicht möglich.");
        var box = document.getElementById("kauf-hinweis");
        if (box) box.focus();
      });
    });
  }

  function renderAngebot() {
    var root = document.getElementById("angebot-root");
    if (!root) return;
    var id = new URLSearchParams(location.search).get("id");
    var offer = katalog.angebot(id);
    if (!offer) {
      root.innerHTML = "<h1>Dieses Angebot gibt es hier nicht.</h1><p><a class=\"textlink\" href=\"/finden\">Zurück zur Auswahl</a></p>";
      return;
    }
    document.title = offer.name;
    var themen = offer.themen.map(function (thema) {
      return "<li><a href=\"" + thema.href + "\">" + thema.satz + "</a></li>";
    }).join("");
    root.innerHTML =
      "<span class=\"eyebrow\">Texte, 90 Tage</span>" +
      "<h1>" + offer.name + "</h1>" +
      "<p class=\"lead\">" + offer.dauer + ", " + offer.kanal + ". Die ersten " + offer.gratisTage + " Tage sind der bestehende kostenlose Einstieg, ohne Zahlung.</p>" +
      "<p>" + offer.komposition + "</p>" +
      "<ul class=\"plainfacts\">" +
      "<li><b>Dauer</b>" + offer.dauer + "</li>" +
      "<li><b>Zustellung</b>" + offer.kanal + "</li>" +
      "<li><b>Kostenlos</b>" + offer.gratisTage + " Tage über den bestehenden Einstieg</li>" +
      "<li><b>Nicht enthalten</b>Die zwölf Wochen mit Live-Calls</li>" +
      "</ul>" +
      "<h2>Welcher Satz trifft dich?</h2>" +
      "<ul class=\"needlist\">" + themen + "</ul>" +
      "<div class=\"pricebox\" id=\"kauf-hinweis\" tabindex=\"-1\">" +
      "<p data-kauf-hinweis>Ob ein Kauf offen ist, steht erst fest, wenn ein Stripe-Preis für genau dieses Angebot hinterlegt ist. Solange das fehlt, gibt es hier keinen Betrag.</p>" +
      "<div class=\"btn-row\">" +
      "<a class=\"btn btn--primary\" data-kauf=\"" + offer.id + "\" href=\"/kaufen?id=" + encodeURIComponent(offer.id) + "\">Zum Kauf</a>" +
      "<a class=\"btn btn--ghost\" href=\"" + offer.gratisHref + "\">Kostenlosen Einstieg öffnen</a>" +
      "</div></div>" +
      "<p><a class=\"textlink\" href=\"/abo\">Abo verwalten</a></p>";
  }

  function renderFinden() {
    var box = document.getElementById("finden-liste");
    if (!box) return;
    var gruppen = [];
    katalog.BEDARFE.forEach(function (row) {
      var last = gruppen[gruppen.length - 1];
      if (!last || last.name !== row.gruppe) {
        last = { name: row.gruppe, rows: [] };
        gruppen.push(last);
      }
      last.rows.push(row);
    });
    box.innerHTML = gruppen.map(function (gruppe) {
      var items = gruppe.rows.map(function (row) {
        return "<li><a href=\"/finden?thema=" + encodeURIComponent(row.id) + "#thema-" + row.id + "\">" + row.satz + "</a></li>";
      }).join("");
      return "<h2>" + gruppe.name + "</h2><ul class=\"needlist\">" + items + "</ul>";
    }).join("");
    var thema = new URLSearchParams(location.search).get("thema");
    var detail = document.getElementById("finden-detail");
    if (!thema || !detail) return;
    var hit = katalog.empfehlung(thema);
    if (!hit) {
      detail.innerHTML = "<p>Diesen Satz gibt es in der Liste nicht.</p>";
      return;
    }
    var frei = hit.gratisHref ? "<p><a class=\"btn btn--primary\" href=\"" + hit.gratisHref + "\">Kostenlosen Einstieg öffnen</a></p>" : "";
    var test = hit.bedarf.test ? "<p><a class=\"textlink\" href=\"" + hit.bedarf.test.href + "\">" + hit.bedarf.test.label + "</a></p>" : "";
    var coaching = hit.coaching ? "<p>Das zwölf-Wochen-Training mit acht Live-Calls ist persönliche Begleitung, kein Textabo. Dafür gibt es die kostenlose Session. Einen öffentlichen Preis hat das auf dieser Seite nicht. <a class=\"textlink\" href=\"/session\">Session anfragen</a></p>" : "";
    var paid = "";
    if (hit.angebot) {
      paid = "<p>" + hit.angebot.name + ". " + hit.angebot.dauer + ", " + hit.angebot.kanal + ". " + hit.angebot.komposition + "</p>" +
        "<p data-kauf-hinweis>Ein Betrag steht hier nicht, solange kein Stripe-Preis hinterlegt ist.</p>" +
        "<p><a class=\"btn btn--ghost\" data-kauf=\"" + hit.angebot.id + "\" href=\"/angebot?id=" + encodeURIComponent(hit.angebot.id) + "\">Zum Angebot</a></p>";
    }
    detail.innerHTML = "<h2 id=\"thema-" + hit.bedarf.id + "\">" + hit.bedarf.satz + "</h2>" + frei + test + coaching + paid;
    var target = document.getElementById("thema-" + hit.bedarf.id);
    if (target) target.scrollIntoView();
  }

  function bindKaufen() {
    var form = document.getElementById("kauf-form");
    if (!form) return;
    var id = new URLSearchParams(location.search).get("id");
    var offer = katalog.angebot(id);
    var error = document.getElementById("kauf-error");
    var submit = document.getElementById("kauf-submit");
    if (!offer) {
      error.textContent = "Dieses Angebot gibt es hier nicht.";
      return;
    }
    document.getElementById("kauf-name").textContent = offer.name;
    document.getElementById("kauf-komposition").textContent = offer.komposition + " " + offer.dauer + ", " + offer.kanal + ".";
    var select = document.getElementById("kauf-thema");
    var vorwahl = new URLSearchParams(location.search).get("thema");
    offer.themen.forEach(function (thema, index) {
      var label = document.createElement("label");
      label.className = "choicecard";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "thema";
      input.value = thema.id;
      input.required = index === 0;
      if (vorwahl ? thema.id === vorwahl : index === 0) input.checked = true;
      var mark = document.createElement("span");
      mark.className = "choicecard__mark";
      var text = document.createElement("span");
      text.className = "choicecard__text";
      text.textContent = thema.satz;
      label.appendChild(input);
      label.appendChild(mark);
      label.appendChild(text);
      select.appendChild(label);
    });
    var info = document.getElementById("kauf-info");
    function meldung(text, istFehler) {
      error.textContent = istFehler ? text : "";
      error.classList.toggle("is-visible", !!istFehler);
      if (info) info.textContent = istFehler ? "" : text;
    }
    submit.disabled = true;
    ladeKaufbar().then(function () {
      if (!kaufbar[offer.id]) {
        meldung("Für dieses Angebot ist noch kein Stripe-Preis hinterlegt. Ein Kauf ist hier nicht möglich.", true);
        return;
      }
      submit.disabled = false;
      meldung("Betrag und ob es einmalig oder monatlich läuft, stehen auf der Checkout-Seite von Stripe. Hier wird nichts zusätzlich angehakt.", false);
    }).catch(function () {
      meldung("Der Kaufstatus ist gerade nicht erreichbar. Es wird nichts berechnet.", true);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      meldung("", false);
      if (!kaufbar[offer.id]) {
        meldung("Für dieses Angebot ist noch kein Stripe-Preis hinterlegt. Ein Kauf ist hier nicht möglich.", true);
        return;
      }
      var gewaehlt = form.querySelector('input[name="thema"]:checked');
      if (!gewaehlt) {
        meldung("Wähl einen Satz.", true);
        return;
      }
      var email = document.getElementById("kauf-email").value.trim();
      if (!email) {
        meldung("Trag eine E-Mail ein. Daran erkennst du später dein Abo.", true);
        document.getElementById("kauf-email").focus();
        return;
      }
      submit.disabled = true;
      var key = "smh_anfrage_" + offer.id;
      var anfrageId = sessionStorage.getItem(key) || uuid();
      sessionStorage.setItem(key, anfrageId);
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          angebotId: offer.id,
          thema: gewaehlt.value,
          email: email,
          anfrageId: anfrageId,
          utm: utm()
        })
      }).then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (result) {
          if (!result.ok || !result.body.url) {
            submit.disabled = false;
            meldung(result.body && result.body.code === "preis_fehlt"
              ? "Für dieses Angebot ist noch kein Stripe-Preis hinterlegt. Ein Kauf ist hier nicht möglich."
              : "Der Checkout ist gerade nicht erreichbar. Es wurde nichts berechnet.", true);
            return;
          }
          var ziel = new URL(result.body.url);
          if (ziel.protocol !== "https:" || ziel.hostname !== "checkout.stripe.com") {
            submit.disabled = false;
            meldung("Die Antwort war kein Stripe-Checkout. Es wurde nichts geöffnet.", true);
            return;
          }
          location.href = ziel.href;
        })
        .catch(function () {
          submit.disabled = false;
          meldung("Der Checkout ist gerade nicht erreichbar. Es wurde nichts berechnet.", true);
        });
    });
  }

  function bindStatus() {
    var box = document.getElementById("status-box");
    if (!box) return;
    var id = new URLSearchParams(location.search).get("bestellung");
    if (!id) {
      box.textContent = "In dieser Adresse fehlt die Bestellung. Ein Zugang wird hier nicht vergeben.";
      return;
    }
    var versuche = 0;
    function poll() {
      versuche += 1;
      fetch("/api/kauf-status?bestellung=" + encodeURIComponent(id), { headers: { Accept: "application/json" } })
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (result) {
          if (!result.ok) {
            box.textContent = "Diese Bestellung ist nicht bestätigt. Ein Zugang wird hier nicht vergeben.";
            return;
          }
          if (!result.body.zugang) {
            box.textContent = versuche > 8
              ? "Die Zahlung ist noch nicht bestätigt. Diese Seite schaltet nichts frei. Wenn du gerade gezahlt hast, lade sie in ein paar Minuten neu."
              : "Die Zahlung wird geprüft. Diese Seite allein schaltet nichts frei.";
            if (versuche <= 8) setTimeout(poll, 3000);
            return;
          }
          box.innerHTML = "<p>Der Zugang ist bestätigt.</p><p>Dein Code: <strong id=\"zugang-code\"></strong></p><p>Damit meldest du dich beim bestehenden Messenger. Diese Seite hat den Code erst gezeigt, nachdem die Zahlung serverseitig bestätigt war.</p><p><a class=\"textlink\" href=\"/abo\">Abo verwalten</a></p>";
          document.getElementById("zugang-code").textContent = result.body.accessCode;
        })
        .catch(function () {
          box.textContent = "Der Status ist gerade nicht erreichbar. Es wird nichts freigeschaltet.";
        });
    }
    poll();
  }

  function bindPortal() {
    var form = document.getElementById("portal-form");
    if (!form) return;
    var error = document.getElementById("portal-error");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      error.textContent = "";
      error.classList.remove("is-visible");
      var submit = document.getElementById("portal-submit");
      submit.disabled = true;
      fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: document.getElementById("portal-email").value.trim(),
          code: document.getElementById("portal-code").value.trim()
        })
      }).then(function (res) { return res.json().then(function (body) { return { ok: res.ok, status: res.status, body: body }; }); })
        .then(function (result) {
          submit.disabled = false;
          if (!result.ok || !result.body.url) {
            error.textContent = result.status === 403
              ? "E-Mail und Code passen nicht zusammen."
              : "Das Abo-Portal ist für diesen Zugang gerade nicht erreichbar.";
            error.classList.add("is-visible");
            return;
          }
          var ziel = new URL(result.body.url);
          if (ziel.protocol !== "https:" || ziel.hostname !== "billing.stripe.com") {
            error.textContent = "Die Antwort war kein Stripe-Portal.";
            error.classList.add("is-visible");
            return;
          }
          location.href = ziel.href;
        })
        .catch(function () {
          submit.disabled = false;
          error.textContent = "Das Abo-Portal ist gerade nicht erreichbar.";
          error.classList.add("is-visible");
        });
    });
  }

  track();
  renderAngebot();
  renderFinden();
  bindKaufen();
  bindStatus();
  bindPortal();
  if (document.querySelector("[data-kauf]")) {
    ladeKaufbar().then(bindKaufLinks).catch(function () {
      setHinweis("Der Kaufstatus ist gerade nicht erreichbar. Es wird nichts berechnet.");
      bindKaufLinks();
    });
  }
})();
