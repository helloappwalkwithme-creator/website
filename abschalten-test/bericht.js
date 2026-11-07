/* Berichtsseite. Öffnet den Text nur mit Zugang, Vorschau-Schlüssel oder auf localhost. */
(function () {
  "use strict";

  function lokal() {
    var host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "";
  }

  function pruefen() {
    var q = new URLSearchParams(window.location.search);
    var typ = q.get("typ") || "";
    var cfg = window.ABSCHALTEN_TEST_CONFIG || {};
    var alle = window.ABSCHALTEN_BERICHTE && window.ABSCHALTEN_BERICHTE.BERICHTE;
    var bericht = alle ? alle[typ] : null;
    var schluessel = cfg.BERICHT_ZUGANG || "";
    var schluesselEcht = schluessel.indexOf("PLATZHALTER") === -1 && schluessel.length > 0;
    var vorschauSchluessel = cfg.VORSCHAU_SCHLUESSEL || "";
    var vorschauOk = vorschauSchluessel.length > 0 && q.get("vorschau") === vorschauSchluessel;
    if (!bericht) return { ok: false, grund: "typ" };
    if (schluesselEcht && q.get("zugang") === schluessel) return { ok: true, typ: typ, vorschau: false };
    if (vorschauOk || lokal()) return { ok: true, typ: typ, vorschau: true };
    return { ok: false, grund: "zu", name: bericht.name };
  }

  function absatz(text) {
    var p = document.createElement("p");
    p.textContent = text;
    return p;
  }

  function zeichnen(typ) {
    var bericht = window.ABSCHALTEN_BERICHTE.BERICHTE[typ];
    var wurzel = document.getElementById("bericht-artikel");
    document.getElementById("bericht-name").textContent = bericht.name;
    document.title = bericht.name + " · Ausführlicher Bericht";

    function block(titel, knoten) {
      var h = document.createElement("h2");
      h.textContent = titel;
      wurzel.appendChild(h);
      knoten.forEach(function (k) { wurzel.appendChild(k); });
    }

    block("Dein Muster", bericht.muster.map(absatz));

    var aus = bericht.ausloeser.map(absatz);
    var ul = document.createElement("ul");
    bericht.ausloeserListe.forEach(function (punkt) {
      var li = document.createElement("li");
      li.textContent = punkt;
      ul.appendChild(li);
    });
    aus.push(ul);
    block("Auslöser", aus);

    block("Was im Nervensystem passiert", bericht.nervensystem.map(absatz));

    var ol = document.createElement("ol");
    ol.className = "days";
    bericht.plan.forEach(function (tag) {
      var li = document.createElement("li");
      var b = document.createElement("b");
      b.textContent = tag.tag + " · " + tag.titel;
      li.appendChild(b);
      li.appendChild(document.createTextNode(tag.text));
      ol.appendChild(li);
    });
    block("Sieben Tage", [ol]);

    var schluss = bericht.naechster.map(absatz);
    var p = document.createElement("p");
    p.appendChild(document.createTextNode("Den Einstieg findest du auf der Seite "));
    var a = document.createElement("a");
    a.href = "/fokus";
    a.className = "textlink";
    a.textContent = "Fokus im Job";
    p.appendChild(a);
    p.appendChild(document.createTextNode(". Dort fängst du an. Das Programm läuft über 90 Tage, mit kurzen Übungen an festen Stellen im Tag."));
    schluss.push(p);
    block("Nächster Schritt", schluss);
  }

  var gate = pruefen();
  var zu = document.getElementById("bericht-zu");
  var offen = document.getElementById("bericht-offen");
  var banner = document.getElementById("bericht-vorschau");

  if (!gate.ok) {
    zu.hidden = false;
    offen.hidden = true;
    var text = document.getElementById("bericht-zu-text");
    if (gate.grund === "typ") {
      text.textContent = "Im Link fehlt der Typ. In der Bestellbestätigung steht die volle Adresse, mit typ und mit dem Zugang.";
    } else {
      document.getElementById("bericht-zu-name").textContent = gate.name;
      text.textContent = "Dies ist der Bericht zum Typ " + gate.name + ". Den Link, der ihn öffnet, schickt die Bestellbestätigung nach der Zahlung.";
    }
    return;
  }

  zu.hidden = true;
  offen.hidden = false;
  if (gate.vorschau && banner) banner.hidden = false;
  zeichnen(gate.typ);
  var druck = document.getElementById("bericht-druck");
  if (druck) druck.addEventListener("click", function () { window.print(); });
})();
