"use strict";

var assert = require("assert");
var crypto = require("crypto");
var checkout = require("../server/checkout");
var webhook = require("../server/webhook");
var storeMod = require("../server/store");
var http = require("../server/http");

function orderOffen(store) {
  return store.createOrder({
    anfrageId: crypto.randomUUID(),
    angebotId: "integrated-man",
    thema: "porn",
    email: "ada@example.com"
  });
}

async function main() {
  var store = storeMod.memoryStore();
  var order = await orderOffen(store);
  order.betrag = 1900;
  order.waehrung = "eur";
  order.modus = "subscription";
  order.preisId = "price_test";
  await store.saveOrder(order);
  var session = {
    id: "cs_test_1",
    client_reference_id: order.id,
    payment_status: "unpaid",
    mode: "subscription",
    currency: "eur",
    amount_total: 1900,
    metadata: { bestellung_id: order.id, angebot_id: "integrated-man" },
    line_items: { data: [{ price: { id: "price_test" } }] }
  };
  var waiting = await webhook.verarbeite({
    id: "evt_wait",
    type: "checkout.session.completed",
    data: { object: session }
  }, { store: store });
  assert.strictEqual(waiting.code, "unpaid");
  var afterWait = await store.getOrder(order.id);
  assert.strictEqual(afterWait.zugang, false);
  assert.strictEqual(afterWait.accessCode, null);

  session.payment_status = "paid";
  session.customer = "cus_1";
  session.subscription = "sub_1";
  session.mode = "subscription";
  var granted = await webhook.verarbeite({
    id: "evt_paid",
    type: "checkout.session.async_payment_succeeded",
    data: { object: session }
  }, { store: store });
  assert.strictEqual(granted.code, "zugang");
  var live = await store.getOrder(order.id);
  assert.strictEqual(live.zugang, true);
  assert.ok(live.accessCode);
  var code = live.accessCode;

  var dup = await webhook.verarbeite({
    id: "evt_paid",
    type: "checkout.session.async_payment_succeeded",
    data: { object: session }
  }, { store: store });
  assert.strictEqual(dup.code, "duplikat");
  assert.strictEqual((await store.getOrder(order.id)).accessCode, code);

  var fremd = await webhook.verarbeite({
    id: "evt_report",
    type: "checkout.session.completed",
    data: { object: { id: "cs_report", payment_status: "paid", metadata: {} } }
  }, { store: store });
  assert.strictEqual(fremd.code, "fremd");

  var renewed = await webhook.verarbeite({
    id: "evt_inv",
    type: "invoice.paid",
    data: {
      object: {
        customer: "cus_1",
        subscription: "sub_1",
        currency: "eur",
        amount_paid: 1900,
        lines: { data: [{ period: { end: 1893456000 } }] }
      }
    }
  }, { store: store });
  assert.strictEqual(renewed.code, "rechnung");
  assert.strictEqual((await store.getOrder(order.id)).accessUntil, new Date(1893456000 * 1000).toISOString());

  var failed = await webhook.verarbeite({
    id: "evt_fail",
    type: "invoice.payment_failed",
    data: { object: { subscription: "sub_1" } }
  }, { store: store });
  assert.strictEqual(failed.code, "rechnung_offen");
  assert.strictEqual((await store.getOrder(order.id)).zugang, true);
  assert.strictEqual((await store.getOrder(order.id)).status, "zahlung_offen");

  var ended = await webhook.verarbeite({
    id: "evt_end",
    type: "customer.subscription.deleted",
    data: { object: { id: "sub_1", status: "canceled" } }
  }, { store: store });
  assert.strictEqual(ended.code, "abo");
  assert.strictEqual(checkout.hatZugang(await store.getOrder(order.id), Date.now()), false);

  var onceStore = storeMod.memoryStore();
  var once = await orderOffen(onceStore);
  once.betrag = 1900;
  once.waehrung = "eur";
  once.modus = "payment";
  once.preisId = "price_once";
  await onceStore.saveOrder(once);
  await webhook.verarbeite({
    id: "evt_once",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_once",
        client_reference_id: once.id,
        payment_status: "paid",
        mode: "payment",
        currency: "eur",
        amount_total: 1900,
        customer: "cus_2",
        payment_intent: "pi_2",
        metadata: { angebot_id: "integrated-man" },
        line_items: { data: [{ price: { id: "price_once" } }] }
      }
    }
  }, { store: onceStore });
  var onceOrder = await onceStore.getOrder(once.id);
  assert.strictEqual(onceOrder.accessUntil, null);
  assert.strictEqual(onceOrder.zugang, true);

  var dispute = await webhook.verarbeite({
    id: "evt_disp",
    type: "charge.dispute.created",
    data: { object: { charge: "ch_2" } }
  }, {
    store: onceStore,
    stripe: {
      charges: {
        retrieve: async function () {
          return { id: "ch_2", payment_intent: "pi_2", invoice: null };
        }
      }
    }
  });
  assert.strictEqual(dispute.code, "risiko");
  assert.strictEqual((await onceStore.getOrder(once.id)).status, "gesperrt");

  var portal = await checkout.portalSession({
    env: { SITE_ORIGINS: "https://www.shiftmyhorizon.com" },
    store: store,
    stripe: {
      billingPortal: {
        sessions: {
          create: async function (params) {
            assert.strictEqual(params.customer, "cus_1");
            assert.strictEqual(Object.prototype.hasOwnProperty.call(params, "payment_method_types"), false);
            return { url: "https://billing.stripe.com/p/session/test" };
          }
        }
      }
    },
    email: "ada@example.com",
    code: code
  });
  assert.strictEqual(portal.code, "kein_zugang");

  live = await store.getOrder(order.id);
  live.status = "aktiv";
  live.zugang = true;
  live.accessUntil = new Date(Date.now() + 86400000).toISOString();
  live.customerId = "cus_1";
  live.subscriptionId = "sub_1";
  await store.saveOrder(live);
  var portalOk = await checkout.portalSession({
    env: { SITE_ORIGINS: "https://www.shiftmyhorizon.com" },
    store: store,
    stripe: {
      billingPortal: {
        sessions: {
          create: async function (params) {
            assert.strictEqual(params.flow_data.type, "subscription_cancel");
            assert.strictEqual(params.flow_data.subscription_cancel.subscription, "sub_1");
            assert.strictEqual(Object.prototype.hasOwnProperty.call(params, "payment_method_types"), false);
            return { url: "https://billing.stripe.com/p/session/test" };
          }
        }
      }
    },
    email: "ADA@example.com",
    code: code.toLowerCase()
  });
  assert.strictEqual(portalOk.ok, true);

  var stranger = await checkout.portalSession({
    env: {},
    store: store,
    stripe: { billingPortal: { sessions: { create: async function () { throw new Error("nein"); } } } },
    email: "other@example.com",
    code: code
  });
  assert.strictEqual(stranger.status, 403);

  var Stripe = require("stripe");
  var stripe = new Stripe("rk_test_placeholder", { apiVersion: checkout.API_VERSION });
  var payload = JSON.stringify({ id: "evt_sig", type: "checkout.session.completed", data: { object: { id: "cs_x" } } });
  var secret = "whsec_" + Buffer.from("testsecret").toString("hex");
  var header = stripe.webhooks.generateTestHeaderString({ payload: payload, secret: secret });
  var verified = stripe.webhooks.constructEvent(payload, header, secret);
  assert.strictEqual(verified.id, "evt_sig");
  assert.throws(function () {
    stripe.webhooks.constructEvent(payload, header, "whsec_other");
  });

  var calls = [];
  var handlerStripe = {
    webhooks: {
      constructEvent: function (raw, sig, given) {
        calls.push({ raw: raw, sig: sig, given: given });
        if (sig !== "gut") throw new Error("bad");
        return JSON.parse(raw);
      }
    }
  };
  var resBody = null;
  var res = {
    setHeader: function () {},
    end: function (body) { resBody = JSON.parse(body); }
  };
  await http.webhookPost({
    method: "POST",
    headers: { "stripe-signature": "schlecht" },
    rawBody: payload
  }, res, { STRIPE_WEBHOOK_SECRET: secret, STRIPE_RESTRICTED_KEY: "rk_test_placeholder" }, {
    store: storeMod.memoryStore(),
    stripe: handlerStripe
  });
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(resBody.code, "signatur");
  assert.strictEqual(calls[0].raw, payload);

  var parallel = storeMod.memoryStore();
  var zusammen = await orderOffen(parallel);
  zusammen.betrag = 1900;
  zusammen.waehrung = "eur";
  zusammen.modus = "payment";
  zusammen.preisId = "price_test";
  await parallel.saveOrder(zusammen);
  var ereignis = {
    id: "evt_parallel",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_parallel",
        client_reference_id: zusammen.id,
        payment_status: "paid",
        mode: "payment",
        currency: "eur",
        amount_total: 1900,
        metadata: { angebot_id: "integrated-man" },
        line_items: { data: [{ price: { id: "price_test" } }] }
      }
    }
  };
  await Promise.all([
    webhook.verarbeite(ereignis, { store: parallel }),
    webhook.verarbeite(JSON.parse(JSON.stringify(ereignis)), { store: parallel })
  ]);
  var danach = await parallel.getOrder(zusammen.id);
  assert.ok(danach.accessCode);
  assert.strictEqual(danach.zugang, true);

  var bruch = storeMod.memoryStore();
  var ziel = await orderOffen(bruch);
  ziel.betrag = 1900;
  ziel.waehrung = "eur";
  ziel.modus = "payment";
  ziel.preisId = "price_test";
  await bruch.saveOrder(ziel);
  var original = bruch.mutate.bind(bruch);
  var versuche = 0;
  bruch.mutate = function (id, fn) {
    versuche += 1;
    if (versuche === 1) return Promise.reject(new Error("weg"));
    return original(id, fn);
  };
  var kaputt = {
    id: "evt_retry",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_retry",
        client_reference_id: ziel.id,
        payment_status: "paid",
        mode: "payment",
        currency: "eur",
        amount_total: 1900,
        metadata: { angebot_id: "integrated-man" },
        line_items: { data: [{ price: { id: "price_test" } }] }
      }
    }
  };
  var erster = await webhook.verarbeite(kaputt, { store: bruch });
  assert.strictEqual(erster.status, 500);
  assert.strictEqual(await bruch.eventErledigt("evt_retry"), false);
  var zweiter = await webhook.verarbeite(kaputt, { store: bruch });
  assert.strictEqual(zweiter.code, "zugang");
  assert.strictEqual((await bruch.getOrder(ziel.id)).zugang, true);

  var trialOrder = await orderOffen(store);
  trialOrder.subscriptionId = "sub_trial";
  await store.saveOrder(trialOrder);
  var trial = await webhook.verarbeite({
    id: "evt_trial",
    type: "customer.subscription.updated",
    data: { object: { id: "sub_trial", status: "trialing", customer: "cus_trial" } }
  }, { store: store });
  assert.strictEqual(trial.code, "abo");
  assert.strictEqual((await store.getOrder(trialOrder.id)).zugang, false);
  assert.strictEqual((await store.getOrder(trialOrder.id)).status, "keine_testphase");

  var falsch = await orderOffen(store);
  falsch.betrag = 1900;
  falsch.waehrung = "eur";
  falsch.modus = "payment";
  falsch.preisId = "price_test";
  await store.saveOrder(falsch);
  var abweichung = await webhook.verarbeite({
    id: "evt_falsch",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_falsch",
        client_reference_id: falsch.id,
        payment_status: "paid",
        mode: "payment",
        currency: "usd",
        amount_total: 100,
        metadata: { angebot_id: "integrated-man" }
      }
    }
  }, { store: store });
  assert.strictEqual(abweichung.code, "betrag");
  assert.strictEqual((await store.getOrder(falsch.id)).zugang, false);

  var kuendigung = await orderOffen(store);
  kuendigung.subscriptionId = "sub_end";
  kuendigung.customerId = "cus_end";
  kuendigung.zugang = true;
  kuendigung.status = "aktiv";
  kuendigung.accessCode = "ZZ99-ZZ99";
  await store.saveOrder(kuendigung);
  var ende = Math.floor(Date.now() / 1000) + 86400 * 10;
  var kuend = await webhook.verarbeite({
    id: "evt_kuend",
    type: "customer.subscription.updated",
    data: { object: { id: "sub_end", status: "active", cancel_at_period_end: true, current_period_end: ende, customer: "cus_end" } }
  }, { store: store });
  assert.strictEqual(kuend.code, "abo");
  var laufend = await store.getOrder(kuendigung.id);
  assert.strictEqual(laufend.status, "kuendigung_laeuft");
  assert.strictEqual(checkout.hatZugang(laufend, Date.now()), true);
  assert.strictEqual(checkout.hatZugang(laufend, (ende + 5) * 1000), false);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
