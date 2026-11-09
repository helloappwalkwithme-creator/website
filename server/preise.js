"use strict";

var katalog = require("../katalog");

var BERICHT_PREIS = "price_1UZCohDtpOTBAOYvpXhJYOxU";
var PREIS_SATZ = "19 € pro Monat, monatlich kündbar";

var ENV_NACH_ANGEBOT = {};
katalog.ANGEBOTE.forEach(function (angebot) {
  ENV_NACH_ANGEBOT[angebot.id] = angebot.preisEnv;
});

/* Public Price IDs from the live account. Not secrets. Env overrides them. */
var STANDARD_PREIS = {
  "porn-recovery": "price_1UZw2NDtpOTBAOYv8RVT67E9",
  gettinggirls: "price_1UZw2TDtpOTBAOYvtVfXUWnt",
  "mens-relationship": "price_1UZw2YDtpOTBAOYvCFBgq3jC",
  career: "price_1UZw2aDtpOTBAOYv3l6udwEM",
  sales: "price_1UZw2eDtpOTBAOYvptYhaSSC",
  "main-character": "price_1UZw2fDtpOTBAOYvT837qXfq",
  "high-value-dating": "price_1UZw2hDtpOTBAOYv1Ljo9eIK",
  heartbreak: "price_1UZw2jDtpOTBAOYvEFmBrw2N",
  leichtigkeit: "price_1UZw2mDtpOTBAOYvZLpYmvN2",
  secular: "price_1UZw2oDtpOTBAOYvXHxSSeDx",
  "parenting-loop": "price_1UZw2qDtpOTBAOYvkIsklqW8",
  "parental-burnout": "price_1UZw2sDtpOTBAOYvUQTPNt5m",
  "conflict-to-connection": "price_1UZw2vDtpOTBAOYvKc2P30Oh",
  fairplay: "price_1UZw2xDtpOTBAOYvNit0BTtm"
};

function laufzeitFehlt(env) {
  if (!String((env && env.STRIPE_WEBHOOK_SECRET) || "").trim()) return "webhook_geheimnis_fehlt";
  var key = String((env && env.STRIPE_RESTRICTED_KEY) || "").trim();
  if (!key) return "stripe_key_fehlt";
  if (/^(sk|rk)_live_/.test(key) && env.STRIPE_ALLOW_LIVE !== "1") return "live_gesperrt";
  return null;
}

function preisId(angebotId, env) {
  var key = ENV_NACH_ANGEBOT[angebotId];
  if (!key) return { id: null, code: "unbekannt" };
  var value = String((env && env[key]) || "").trim();
  if (!value) value = STANDARD_PREIS[angebotId] || "";
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
  var gesperrt = !!laufzeitFehlt(env);
  var i;
  for (i = 0; i < katalog.ANGEBOTE.length; i++) {
    var offer = katalog.ANGEBOTE[i];
    var gefunden = preisId(offer.id, env);
    var eintrag = { id: offer.id, kaufbar: false };
    if (!gesperrt && gefunden.id && stripe && stripe.prices && stripe.prices.retrieve) {
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
  STANDARD_PREIS: STANDARD_PREIS,
  laufzeitFehlt: laufzeitFehlt,
  preisId: preisId,
  preisBedingungen: preisBedingungen,
  kaufbarListe: kaufbarListe
};
