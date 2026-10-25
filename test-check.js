/* Rechnung des Umschalt-Checks. Aufruf: node test-check.js */
var api = require("./check.js");

function eq(name, got, want) {
  if (got !== want) {
    console.error("FAIL", name, "got", got, "want", want);
    process.exitCode = 1;
  } else {
    console.log("ok", name, got);
  }
}

var cases = [
  { p: [3, 3, 3, 3, 3, 3, 3, 1, 1, 3], profil: "schlaf" },
  { p: [3, 3, 3, 3, 3, 2, 0, 3, 3, 3], profil: "abschalten" },
  { p: [3, 3, 3, 3, 3, 0, 2, 3, 3, 3], profil: "abschalten" },
  { p: [3, 3, 2, 2, 0, 3, 3, 3, 3, 3], profil: "termine" },
  { p: [3, 3, 0, 1, 2, 3, 3, 3, 3, 3], profil: "termine" },
  { p: [0, 1, 3, 3, 3, 3, 3, 3, 3, 3], profil: "fokus" },
  { p: [0, 3, 3, 3, 3, 3, 3, 3, 3, 0], profil: "dranbleiben" },
  { p: [3, 3, 3, 3, 3, 3, 3, 3, 3, 1], profil: "dranbleiben" },
  { p: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], profil: "gut" },
  { p: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], profil: "schlaf" }
];

cases.forEach(function (c, i) {
  var r = api.bewerten(c.p);
  eq("fall " + (i + 1), r.profil, c.profil);
});

var tie = api.bewerten([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
eq("alle 35 fokus", tie.werte.fokus, 35);
eq("alle 35 termine", tie.werte.termine, 35);
eq("alle 35 gesamt", tie.gesamt, 35);

var fokus = api.bewerten([0, 3, 3, 3, 3, 3, 3, 3, 3, 0]);
eq("fokus 50", fokus.werte.fokus, 50);
eq("dranbleiben 0", fokus.werte.dranbleiben, 0);

var hoch = api.bewerten([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
eq("gesamt 100", hoch.gesamt, 100);
eq("band hoch", api.band(80), "hoch");
eq("band mittel", api.band(45), "mittel");
eq("band niedrig", api.band(44), "niedrig");

if (!process.exitCode) console.log("alle faelle ok");
