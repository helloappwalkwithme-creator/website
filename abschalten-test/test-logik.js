/* Rechnung und Seiten des Abschalten-Tests. Aufruf: node abschalten-test/test-logik.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var api = require("./test.js");
var berichte = require("./bericht-inhalt.js");
var config = require("./config.js");

function zeile(werte) {
  var a = [];
  var i;
  for (i = 0; i < 15; i++) a.push(0);
  Object.keys(werte).forEach(function (key) {
    var von = key === "dauer" ? 0 : key === "gruebel" ? 4 : key === "wach" ? 8 : 12;
    var bis = key === "erholung" ? 14 : von + 3;
    var rest = werte[key];
    var i2;
    for (i2 = von; i2 <= bis; i2++) {
      var n = Math.min(3, rest);
      a[i2] = n;
      rest -= n;
    }
    if (rest !== 0) throw new Error("punkte passen nicht auf die skala " + key);
  });
  return a;
}

function eq(name, got, want) {
  assert.strictEqual(got, want, name + " got " + got + " want " + want);
  console.log("ok", name);
}

assert.strictEqual(api.FRAGEN.length, 15);
var zaehlung = { dauer: 0, gruebel: 0, wach: 0, erholung: 0 };
api.FRAGEN.forEach(function (f) { zaehlung[f.skala] += 1; });
eq("vier dauer", zaehlung.dauer, 4);
eq("vier gruebel", zaehlung.gruebel, 4);
eq("vier wach", zaehlung.wach, 4);
eq("drei erholung", zaehlung.erholung, 3);

eq("alles hoch", api.werten(zeile({ dauer: 12, gruebel: 12, wach: 12, erholung: 9 })).typ, "erschoepft-wach");
eq("nur dauer", api.werten(zeile({ dauer: 12 })).typ, "dauerlaeufer");
eq("nur gruebel", api.werten(zeile({ gruebel: 12 })).typ, "gruebler");
eq("nur wach", api.werten(zeile({ wach: 12 })).typ, "erschoepft-wach");
eq("alles null", api.werten(zeile({})).typ, "reguliert");
eq("niedrig mit erholung", api.werten(zeile({ dauer: 4, gruebel: 4, wach: 4, erholung: 6 })).typ, "reguliert");
eq("niedrig ohne erholung", api.werten(zeile({ dauer: 4, gruebel: 4, wach: 4, erholung: 3 })).typ, "erschoepft-wach");
eq("grenze 5 mit erholung", api.werten(zeile({ dauer: 5, erholung: 6 })).typ, "reguliert");
eq("grenze 5 ohne erholung", api.werten(zeile({ dauer: 5, erholung: 5 })).typ, "dauerlaeufer");
eq("grenze 3", api.werten(zeile({ dauer: 3 })).typ, "reguliert");
eq("dauer knapp vor gruebel", api.werten(zeile({ dauer: 9, gruebel: 8, wach: 8, erholung: 9 })).typ, "dauerlaeufer");
eq("ungueltig kurz", api.werten([0, 0, 0]), null);
eq("ungueltig wert", api.summieren(zeile({ dauer: 4 }).map(function (n, i) { return i === 0 ? 4 : n; })), null);

var STRIPE = {
  dauerlaeufer: "https://buy.stripe.com/fZu9AT9EM8xz4A5dmycIE00",
  gruebler: "https://buy.stripe.com/28E6oH7wEeVXfeJciucIE01",
  "erschoepft-wach": "https://buy.stripe.com/14A4gz8AIaFH0jPaamcIE02",
  reguliert: "https://buy.stripe.com/eVq3cv9EMaFH3w182ecIE03"
};

config.CONFIG.TYPEN.forEach(function (typ) {
  var url = config.checkout(typ);
  eq("stripe " + typ, url, STRIPE[typ]);
  var zahl = berichte.wortzahl(typ);
  console.log("woerter", typ, zahl);
  assert.ok(zahl >= 800 && zahl <= 1500, typ + " wortzahl " + zahl);
  assert.ok(berichte.BERICHTE[typ].lassen && berichte.BERICHTE[typ].lassen.length > 0);
  assert.ok(berichte.BERICHTE[typ].plan.length >= 3);
  var html = fs.readFileSync(path.join(__dirname, "ergebnis", typ + ".html"), "utf8");
  assert.ok(html.indexOf("https://www.shiftmyhorizon.com/abschalten-test/ergebnis/" + typ) !== -1);
  assert.ok(html.indexOf('data-typ="' + typ + '"') !== -1);
  assert.ok(html.indexOf('data-test-typ="' + typ + '"') !== -1);
  assert.ok(html.indexOf('id="start-form"') !== -1);
  assert.ok(html.indexOf('value="whatsapp"') !== -1);
  assert.ok(html.indexOf('href="/fokus"') !== -1);
  assert.ok(html.indexOf("Sichere Zahlung über Stripe") !== -1);
  assert.ok(html.indexOf("Was im Körper passiert") !== -1);
  assert.ok(html.indexOf("Drei Übungen") !== -1);
  assert.ok(html.indexOf("Das lässt du") !== -1);
  assert.ok(html.indexOf(url) !== -1);
  assert.ok(html.indexOf("noindex") === -1);
  assert.ok(html.toLowerCase().indexOf("digi" + "store") === -1);
});

eq("zugang", config.CONFIG.BERICHT_ZUGANG, "hqZh2itDp4SPntzdri6bZb6yi00koImD");
assert.ok(!Object.prototype.hasOwnProperty.call(config.CONFIG, "VORSCHAU_SCHLUESSEL"));

eq("preis", config.CONFIG.PREIS_EURO, 9);
eq("preistext", config.preisText(), "9 \u20ac");

var start = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(start.indexOf('content="index,follow"') !== -1);
assert.ok(start.indexOf("abschalten nach der Arbeit") !== -1 || start.indexOf("Abschalten nach der Arbeit") !== -1);
assert.ok(start.indexOf("Stress-Test") !== -1);

var bericht = fs.readFileSync(path.join(__dirname, "bericht.html"), "utf8");
assert.ok(bericht.indexOf('content="noindex,nofollow"') !== -1);
assert.ok(bericht.indexOf("Den Raum wechseln") === -1, "bericht.html enthaelt keinen vollen report");

var seiten = ["index.html", "bericht.html"].concat(config.CONFIG.TYPEN.map(function (t) { return "ergebnis/" + t + ".html"; }));
seiten.forEach(function (rel) {
  var html = fs.readFileSync(path.join(__dirname, rel), "utf8");
  assert.ok(html.indexOf('href="/abschalten-test/bericht"') === -1, rel + " verlinkt den bericht nicht");
});

var abschalten = fs.readFileSync(path.join(__dirname, "..", "abschalten.html"), "utf8");
assert.ok(abschalten.indexOf("Du sitzt abends auf dem Sofa, und dein Kopf geht noch das Meeting durch.") !== -1);
assert.ok(abschalten.indexOf('id="start-form"') !== -1);
assert.ok(abschalten.indexOf('value="whatsapp"') !== -1);
assert.ok(abschalten.indexOf('value="telegram"') !== -1);
assert.ok(abschalten.indexOf('value="email"') !== -1);
assert.ok(abschalten.indexOf('src="starter.js"') !== -1);
assert.ok(abschalten.indexOf("kostenlosen Session") !== -1);
assert.ok(abschalten.indexOf("Albulescu") !== -1);
assert.ok(abschalten.indexOf("Du bist zu Hause, aber nicht richtig da.") !== -1);
assert.ok(abschalten.indexOf('href="/abschalten-test"') === -1, "die Landingpage hat nur den 3-Tage-Starter");
var versprechen = abschalten.indexOf("Wenn du abends abschaltest, schläfst du nachts durch und hast morgens wieder Kraft.");
var geschichte = abschalten.indexOf('id="lebensqualitaet"');
assert.ok(versprechen !== -1 && geschichte > versprechen, "die Geschichte steht unter dem Versprechen");
assert.ok(abschalten.indexOf("Blanchflower und Oswald 2008") !== -1);
assert.ok(abschalten.indexOf("Blanchflower 2021") !== -1);
assert.ok(abschalten.indexOf("kein Gesetz für dich") !== -1);
assert.ok(abschalten.indexOf("bringt mehr Geld sehr wohl mehr Lebensqualität") !== -1);
assert.ok(abschalten.indexOf("Genau da setze ich an.") !== -1);
assert.ok(abschalten.indexOf("Damit die Kurve bei dir nicht weiter nach unten geht, sondern wieder nach oben.") !== -1);
assert.ok(abschalten.indexOf("Daran habe ich bei mir gearbeitet, und daran arbeite ich mit Männern.") !== -1);
assert.ok(geschichte < abschalten.indexOf('id="anmeldung"'), "danach kommt der Starter");
assert.ok(abschalten.indexOf('id="anmeldung"') < abschalten.indexOf('id="die-drei-tage"'));
assert.ok(abschalten.indexOf("garantiert") === -1);
assert.ok(abschalten.indexOf("deutlich gesteigert") === -1);
assert.ok(abschalten.indexOf("schneller Alarm") === -1);
assert.ok(abschalten.indexOf("langsamer Planer") === -1);
assert.ok(abschalten.indexOf('href="/session"') === -1);
var starter = fs.readFileSync(path.join(__dirname, "..", "starter.js"), "utf8");
assert.ok(starter.indexOf('params.get("utm_source")') !== -1);
assert.ok(starter.indexOf('params.get("utm_medium")') !== -1);
assert.ok(starter.indexOf('params.get("utm_campaign")') !== -1);
assert.ok(starter.indexOf('params.get("via")') !== -1);

console.log("alle pruefungen gruen");
