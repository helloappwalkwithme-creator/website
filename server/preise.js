"use strict";

/* Allowlist only. No amounts. The 9-euro report price must never sell a bundle. */
var BERICHT_PREIS = "price_1UZCohDtpOTBAOYvpXhJYOxU";

var ENV_NACH_ANGEBOT = {
  "integrated-man": "STRIPE_PRICE_INTEGRATED_MAN",
  "loving-woman": "STRIPE_PRICE_LOVING_WOMAN",
  "career-power": "STRIPE_PRICE_CAREER_POWER",
  "elite-closer": "STRIPE_PRICE_ELITE_CLOSER",
  lightness: "STRIPE_PRICE_LIGHTNESS",
  "integrated-soul": "STRIPE_PRICE_INTEGRATED_SOUL",
  "parent-in-peace": "STRIPE_PRICE_PARENT_IN_PEACE",
  "connected-couples": "STRIPE_PRICE_CONNECTED_COUPLES"
};

function preisId(angebotId, env) {
  var key = ENV_NACH_ANGEBOT[angebotId];
  if (!key) return { id: null, code: "unbekannt" };
  var value = String((env && env[key]) || "").trim();
  if (!value) return { id: null, code: "preis_fehlt" };
  if (!/^price_[A-Za-z0-9]+$/.test(value)) return { id: null, code: "preis_ungueltig" };
  if (value === BERICHT_PREIS) return { id: null, code: "preis_ist_bericht" };
  return { id: value, code: null };
}

function kaufbarListe(env) {
  return Object.keys(ENV_NACH_ANGEBOT).map(function (id) {
    var gefunden = preisId(id, env);
    return { id: id, kaufbar: !!gefunden.id };
  });
}

module.exports = {
  BERICHT_PREIS: BERICHT_PREIS,
  ENV_NACH_ANGEBOT: ENV_NACH_ANGEBOT,
  preisId: preisId,
  kaufbarListe: kaufbarListe
};
