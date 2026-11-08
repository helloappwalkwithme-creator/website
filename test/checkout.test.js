"use strict";

var assert = require("assert");
var preise = require("../server/preise");
var checkout = require("../server/checkout");
var storeMod = require("../server/store");

var ANFRAGE = "11111111-1111-4111-8111-111111111111";

function envMit(id) {
  return { STRIPE_PRICE_INTEGRATED_MAN: id, SITE_ORIGINS: "https://www.shiftmyhorizon.com" };
}

assert.strictEqual(preise.preisId("integrated-man", {}).code, "preis_fehlt");
assert.strictEqual(preise.preisId("integrated-man", envMit(preise.BERICHT_PREIS)).code, "preis_ist_bericht");
assert.strictEqual(preise.preisId("integrated-man", envMit("not-a-price")).code, "preis_ungueltig");
assert.strictEqual(preise.preisId("nope", envMit("price_abc")).code, "unbekannt");
assert.strictEqual(preise.kaufbarListe({}).filter(function (row) { return row.kaufbar; }).length, 0);
assert.strictEqual(preise.kaufbarListe(envMit("price_bundleMen")).filter(function (row) { return row.kaufbar; }).length, 1);

function fakeStripe(price) {
  if (price.unit_amount == null) price.unit_amount = 1900;
  if (!price.currency) price.currency = "eur";
  var created = [];
  return {
    created: created,
    prices: {
      retrieve: async function (id) {
        assert.strictEqual(id, price.id);
        return price;
      }
    },
    checkout: {
      sessions: {
        create: async function (params, options) {
          created.push({ params: params, options: options });
          return { id: "cs_test_1", url: "https://checkout.stripe.com/c/pay/cs_test_1" };
        }
      }
    }
  };
}

async function main() {
  var missing = await checkout.createCheckout({
    env: {},
    stripe: fakeStripe({ id: "price_x", active: true }),
    store: storeMod.memoryStore(),
    angebotId: "integrated-man",
    anfrageId: ANFRAGE
  });
  assert.strictEqual(missing.code, "preis_fehlt");

  var blocked = await checkout.createCheckout({
    env: envMit(preise.BERICHT_PREIS),
    stripe: fakeStripe({ id: preise.BERICHT_PREIS, active: true }),
    store: storeMod.memoryStore(),
    angebotId: "integrated-man",
    anfrageId: ANFRAGE
  });
  assert.strictEqual(blocked.code, "preis_ist_bericht");

  var store = storeMod.memoryStore();
  var stripe = fakeStripe({ id: "price_man", active: true, recurring: { interval: "month" } });
  var ok = await checkout.createCheckout({
    env: envMit("price_man"),
    stripe: stripe,
    store: store,
    angebotId: "integrated-man",
    thema: "gettinggirls",
    email: "ada@example.com",
    anfrageId: ANFRAGE,
    utm: { utm_source: "youtube", antwort: "geheim" },
    origin: "https://evil.example"
  });
  assert.strictEqual(ok.ok, true);
  assert.strictEqual(ok.modus, "subscription");
  var gespeichert = await store.getOrder(ok.bestellungId);
  assert.strictEqual(gespeichert.betrag, 1900);
  assert.strictEqual(gespeichert.waehrung, "eur");
  assert.strictEqual(gespeichert.preisId, "price_man");
  var params = stripe.created[0].params;
  assert.strictEqual(params.mode, "subscription");
  assert.strictEqual(params.line_items[0].price, "price_man");
  assert.strictEqual(params.line_items[0].quantity, 1);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(params, "payment_method_types"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(params, "automatic_tax"), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(params.subscription_data, "trial_period_days"), false);
  assert.ok(/^smh_hosted_[a-z]{8}$/.test(params.integration_identifier));
  assert.strictEqual(params.metadata.thema, "gettinggirls");
  assert.strictEqual(params.metadata.antwort, undefined);
  assert.ok(params.success_url.indexOf("https://www.shiftmyhorizon.com/kauf-status?bestellung=") === 0);
  assert.strictEqual(params.success_url.indexOf("evil.example"), -1);
  var order = await store.getOrder(ok.bestellungId);
  assert.deepStrictEqual(order.utm, { utm_source: "youtube" });

  var again = await checkout.createCheckout({
    env: envMit("price_man"),
    stripe: stripe,
    store: store,
    angebotId: "integrated-man",
    anfrageId: ANFRAGE
  });
  assert.strictEqual(again.url, ok.url);
  assert.strictEqual(stripe.created.length, 1);

  var once = fakeStripe({ id: "price_once", active: true, recurring: null });
  var paid = await checkout.createCheckout({
    env: { STRIPE_PRICE_LOVING_WOMAN: "price_once", SITE_ORIGINS: "https://www.shiftmyhorizon.com" },
    stripe: once,
    store: storeMod.memoryStore(),
    angebotId: "loving-woman",
    anfrageId: "22222222-2222-4222-8222-222222222222"
  });
  var probe = fakeStripe({ id: "price_man", active: true, currency: "eur", unit_amount: 1900, recurring: { interval: "month", trial_period_days: 4 } });
  var trial = await checkout.createCheckout({
    env: envMit("price_man"),
    stripe: probe,
    store: storeMod.memoryStore(),
    angebotId: "integrated-man",
    anfrageId: "33333333-3333-4333-8333-333333333333"
  });
  assert.strictEqual(trial.code, "preis_hat_testphase");
  assert.strictEqual(probe.created.length, 0);

  var fremdPreis = fakeStripe({ id: "price_man", active: true, currency: "eur", unit_amount: 1900, recurring: { interval: "month" } });
  var tamper = await checkout.createCheckout({
    env: envMit("price_man"),
    stripe: fremdPreis,
    store: storeMod.memoryStore(),
    angebotId: "integrated-man",
    anfrageId: "44444444-4444-4444-8444-444444444444",
    preisId: "price_boese",
    betrag: 1,
    waehrung: "usd"
  });
  assert.strictEqual(tamper.ok, true);
  assert.strictEqual(fremdPreis.created[0].params.line_items[0].price, "price_man");
  assert.strictEqual(Object.prototype.hasOwnProperty.call(fremdPreis.created[0].params, "payment_method_types"), false);

  assert.strictEqual(paid.modus, "payment");
  assert.strictEqual(once.created[0].params.mode, "payment");
  assert.ok(once.created[0].params.payment_intent_data.metadata.bestellung_id);

  var http = require("../server/http");
  var liveRes = { statusCode: 0, setHeader: function () {}, end: function (body) { this.body = JSON.parse(body); } };
  await http.checkoutPost({
    method: "POST",
    headers: {},
    body: { angebotId: "integrated-man", anfrageId: ANFRAGE, email: "ada@example.com" }
  }, liveRes, { STRIPE_RESTRICTED_KEY: "rk_live_nicht_verwenden", STRIPE_PRICE_INTEGRATED_MAN: "price_man" });
  assert.strictEqual(liveRes.statusCode, 503);
  assert.strictEqual(liveRes.body.code, "live_gesperrt");
  assert.strictEqual(JSON.stringify(liveRes.body).indexOf("rk_live"), -1);

  var badKey = new Error("no");
  try {
    checkout.stripeClient({ STRIPE_RESTRICTED_KEY: "rk_live_nicht_verwenden" });
    badKey = null;
  } catch (e) {
    badKey = e;
  }
  assert.strictEqual(badKey.code, "live_gesperrt");
  assert.strictEqual(String(badKey.message).indexOf("rk_live"), -1);

  var order2 = await store.getOrder(ok.bestellungId);
  order2.zugang = true;
  order2.status = "aktiv";
  order2.accessCode = "AB12-CD34";
  order2.accessUntil = new Date(Date.now() + 86400000).toISOString();
  var sichtbar = checkout.statusAntwort(order2, Date.now());
  assert.strictEqual(sichtbar.zugang, true);
  assert.strictEqual(sichtbar.accessCode, "AB12-CD34");
  order2.accessUntil = new Date(Date.now() - 1000).toISOString();
  assert.strictEqual(checkout.statusAntwort(order2, Date.now()).zugang, false);
  order2.status = "offen";
  order2.zugang = false;
  order2.accessCode = "AB12-CD34";
  order2.accessUntil = null;
  assert.strictEqual(checkout.statusAntwort(order2, Date.now()).accessCode, null);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
