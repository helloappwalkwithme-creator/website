"use strict";

var katalog = require("../katalog");

var BERICHT_PREIS = "price_1UZCohDtpOTBAOYvpXhJYOxU";
var PREIS_SATZ = "19 € pro Monat, monatlich kündbar";

var ENV_NACH_ANGEBOT = {};
katalog.ANGEBOTE.forEach(function (angebot) {
  ENV_NACH_ANGEBOT[angebot.id] = angebot.preisEnv;
});

function preisId(angebotId, env) {
  var key = ENV_NACH_ANGEBOT[angebotId];
  if (!key) return { id: null, code: "unbekannt" };
  var value = String((env && env[key]) || "").trim();
  if (!value) return { id: null, code: "preis_fehlt" };
  if (!/^price_[A-Za-z0-9]+$/.test(value)) return { id: null, code: "preis_ungueltig" };
  if (value === BERICHT_PREIS) return { id: null, code: "preis_ist_bericht" };
  return { id: value, code: null };
}

function preisBedingungen(price) {
  if (!price || price.active === false) return "preis_inaktiv";
  if (!price.recurring) return "preis_kein_abo";
  if (price.recurring.trial_period_days) return "preis_hat_testphase";
  if (price.recurring.interval !== "month") return "preis_intervall";
  var anzahl = price.recurring.interval_count == null ? 1 : price.recurring.interval_count;
  if (anzahl !== 1) return "preis_intervall";
  if (String(price.currency || "").toLowerCase() !== "eur") return "preis_waehrung";
  if (price.unit_amount !== 1900) return "preis_betrag";
  return null;
}

async function kaufbarListe(env, stripe) {
  var liste = [];
  var i;
  for (i = 0; i < katalog.ANGEBOTE.length; i++) {
    var offer = katalog.ANGEBOTE[i];
    var gefunden = preisId(offer.id, env);
    var eintrag = { id: offer.id, kaufbar: false };
    if (gefunden.id && stripe && stripe.prices && stripe.prices.retrieve) {
      try {
        var price = await stripe.prices.retrieve(gefunden.id);
        if (price && price.id === gefunden.id && !preisBedingungen(price)) {
          eintrag.kaufbar = true;
          eintrag.preis = PREIS_SATZ;
        }
      } catch (e) {
        eintrag.kaufbar = false;
      }
    }
    liste.push(eintrag);
  }
  return liste;
}

module.exports = {
  BERICHT_PREIS: BERICHT_PREIS,
  PREIS_SATZ: PREIS_SATZ,
  ENV_NACH_ANGEBOT: ENV_NACH_ANGEBOT,
  preisId: preisId,
  preisBedingungen: preisBedingungen,
  kaufbarListe: kaufbarListe
};
