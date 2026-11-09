"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var files = ["finden.html", "maenner.html", "frauen.html", "angebot.html", "kaufen.html", "kauf-status.html", "abo.html"];

files.forEach(function (file) {
  var text = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(text.indexOf("tokens.css") !== -1, file);
  assert.ok(text.indexOf("components.css") !== -1, file);
  assert.strictEqual(text.indexOf("checkout-ds24"), -1, file);
  assert.strictEqual(text.indexOf("price_1UZCoh"), -1, file);
  assert.strictEqual(/\b19\s*€/.test(text), false, file + " 19");
  assert.strictEqual(/\b49\s*€/.test(text), false, file + " 49");
  assert.strictEqual(/\b9\s*€/.test(text), false, file + " 9");
  assert.strictEqual(text.indexOf("payment_method_types"), -1, file);
});

var server = fs.readFileSync(path.join(root, "server/checkout.js"), "utf8");
assert.strictEqual(server.indexOf("payment_method_types"), -1);
assert.strictEqual(server.indexOf("automatic_tax"), -1);
assert.ok(server.indexOf("integration_identifier") !== -1);
assert.ok(server.indexOf("2026-10-28.endive") !== -1);

["flow-go.html", "sales-de.html", "morning.html", "empfehlung.html", "empfehlung-woman.html", "empfehlung-couple.html"].forEach(function (file) {
  var text = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(text.indexOf("PAID_MODE = false") !== -1, file);
});
var flow = fs.readFileSync(path.join(root, "flow-go.html"), "utf8");
assert.ok(flow.indexOf("integrated_man_flow:'688460'") !== -1);
assert.ok(flow.indexOf("loving_woman_flow:'688575'") !== -1);
var bericht = fs.readFileSync(path.join(root, "abschalten-test/config.js"), "utf8");
assert.ok(bericht.indexOf("buy.stripe.com/fZu9AT9EM8xz4A5dmycIE00") !== -1);
assert.ok(bericht.indexOf("buy.stripe.com/28E6oH7wEeVXfeJciucIE01") !== -1);
var kaufseite = fs.readFileSync(path.join(root, "kaufen.html"), "utf8");
assert.ok(kaufseite.indexOf("hidden") !== -1);
assert.ok(kaufseite.indexOf("keine Testphase bei Stripe") !== -1);
