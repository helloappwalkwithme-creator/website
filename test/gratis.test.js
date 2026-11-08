"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var pruefung = require("../gratis-pruefung");

var fixture = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/gratis-anmeldung.json"), "utf8"));
var ergebnis = pruefung.pruefeGratis(fixture);
assert.strictEqual(ergebnis.ok, true);
assert.ok(ergebnis.body.p_email.endsWith("@example.com"));
assert.strictEqual(ergebnis.rpc, "register_tripwire_lead");
assert.throws(function () { pruefung.pruefeGratis(Object.assign({}, fixture, { netzwerk: true })); });
assert.strictEqual(pruefung.pruefeGratis(Object.assign({}, fixture, { email: "" })).fehler, "email");

var quelle = fs.readFileSync(path.join(__dirname, "../gratis-pruefung.js"), "utf8");
assert.strictEqual(quelle.indexOf("fetch("), -1);
assert.strictEqual(quelle.indexOf("supabase"), -1);

var starter = fs.readFileSync(path.join(__dirname, "../starter.js"), "utf8");
assert.ok(starter.indexOf("btn.addEventListener('click'") !== -1);
assert.ok(starter.indexOf("register_tripwire_lead") > starter.indexOf("btn.addEventListener('click'"));
