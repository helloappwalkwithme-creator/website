"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var katalog = require("../katalog");

var root = path.join(__dirname, "..");

function exists(href) {
  var clean = href.split("?")[0];
  if (clean.endsWith("/")) clean += "index.html";
  var file = clean === "/" ? "index.html" : clean.replace(/^\//, "");
  if (!file.endsWith(".html")) file += ".html";
  if (file === "abschalten-test.html") file = "abschalten-test/index.html";
  if (file === "clear-state.html") file = "clear-state/index.html";
  return fs.existsSync(path.join(root, file));
}

katalog.BEDARFE.forEach(function (row) {
  var hit = katalog.empfehlung(row.id);
  assert.ok(hit, row.id);
  assert.strictEqual(hit.bedarf.satz, row.satz);
  if (row.frei) assert.ok(exists(row.frei.href), row.frei.href);
  if (row.test) assert.ok(exists(row.test.href), row.test.href);
  if (row.angebotId) {
    assert.ok(hit.angebot, row.id);
    assert.ok(hit.thema, row.id + " thema");
    assert.ok(exists(hit.thema.href), hit.thema.href);
    assert.strictEqual(hit.coaching, false);
  }
});

assert.strictEqual(katalog.empfehlung("gibt-es-nicht"), null);
assert.strictEqual(katalog.angebot("bible"), null);
assert.strictEqual(katalog.fuerPublikum("maenner").length, 3);
assert.strictEqual(katalog.fuerPublikum("frauen").length, 3);
assert.ok(katalog.angebot("connected-couples"));
assert.ok(katalog.angebot("parent-in-peace"));

var seen = {};
katalog.ANGEBOTE.forEach(function (offer) {
  assert.ok(!seen[offer.digistoreProdukt], offer.digistoreProdukt);
  seen[offer.digistoreProdukt] = true;
  assert.ok(offer.preisEnv.indexOf("STRIPE_PRICE_") === 0);
  assert.strictEqual(offer.gratisTage, 4);
  assert.ok(exists(offer.gratisHref), offer.gratisHref);
});

assert.strictEqual(katalog.empfehlung("abend").coaching, true);
assert.strictEqual(katalog.empfehlung("abend").angebot, null);
assert.strictEqual(katalog.empfehlung("ja-nein").angebot.id, "lightness");
assert.strictEqual(katalog.empfehlung("befoerderung").thema.id, "stagnation");
