"use strict";

var checkout = require("./checkout");

function idVon(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id || null;
}

function subscriptionVonInvoice(invoice) {
  var direct = idVon(invoice && invoice.subscription);
  if (direct) return direct;
  var parent = invoice && invoice.parent;
  var details = parent && parent.subscription_details;
  return idVon(details && details.subscription);
}

function periodEnde(invoice) {
  var lines = invoice && invoice.lines && invoice.lines.data;
  var line = lines && lines[0];
  if (line && line.period && line.period.end) return new Date(line.period.end * 1000).toISOString();
  return null;
}

function applySubscription(order, sub, nowIso) {
  order.subscriptionId = sub.id;
  order.customerId = idVon(sub.customer) || order.customerId;
  var ende = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
  if (sub.status === "trialing") {
    order.status = "keine_testphase";
    order.zugang = false;
    return;
  }
  if (sub.status === "active") {
    order.status = sub.cancel_at_period_end ? "kuendigung_laeuft" : "aktiv";
    order.zugang = true;
    if (ende) order.accessUntil = ende;
    if (!order.accessCode) order.accessCode = checkout.zugangscode();
    return;
  }
  if (sub.status === "past_due") {
    order.status = "zahlung_offen";
    if (order.accessCode) {
      order.zugang = true;
      if (ende) order.accessUntil = ende;
    } else {
      order.zugang = false;
    }
    return;
  }
  if (sub.status === "incomplete") {
    order.status = "offen";
    order.zugang = false;
    return;
  }
  order.status = "beendet";
  order.zugang = false;
  order.accessUntil = nowIso;
}

async function bestellungFuerSession(store, session) {
  var byRef = session.client_reference_id ? await store.getOrder(session.client_reference_id) : null;
  if (byRef) return byRef;
  var metaId = session.metadata && session.metadata.bestellung_id;
  if (metaId) {
    var byMeta = await store.getOrder(metaId);
    if (byMeta) return byMeta;
  }
  if (session.id) return store.findBySession(session.id);
  return null;
}

async function bestellungFuerSubscription(store, stripe, subscriptionId) {
  if (!subscriptionId) return null;
  var found = await store.findBySubscription(subscriptionId);
  if (found) return found;
  if (!stripe || !stripe.subscriptions || !stripe.subscriptions.retrieve) return null;
  var sub = await stripe.subscriptions.retrieve(subscriptionId);
  var metaId = sub.metadata && sub.metadata.bestellung_id;
  if (!metaId) return null;
  var order = await store.getOrder(metaId);
  if (order) order.subscriptionId = sub.id;
  return order;
}

function preisAusSession(session) {
  var items = session && session.line_items && session.line_items.data;
  if (!items || !items.length) return null;
  var price = items[0].price;
  return typeof price === "string" ? price : (price && price.id);
}

function sessionGehoert(order, session) {
  if (!order || order.betrag == null || !order.waehrung || !order.modus || !order.preisId) return false;
  if (session.mode !== order.modus) return false;
  if (String(session.currency || "").toLowerCase() !== String(order.waehrung).toLowerCase()) return false;
  if (session.amount_total !== order.betrag) return false;
  if (order.sessionId && session.id && order.sessionId !== session.id) return false;
  if (session.metadata && session.metadata.angebot_id && session.metadata.angebot_id !== order.angebotId) return false;
  var linePrice = preisAusSession(session);
  if (linePrice && linePrice !== order.preisId) return false;
  return true;
}

function rechnungPasst(order, invoice) {
  if (!order || order.betrag == null || !order.waehrung) return false;
  if (String(invoice.currency || "").toLowerCase() !== String(order.waehrung).toLowerCase()) return false;
  return invoice.amount_paid === order.betrag;
}

function grantFromSession(order, session) {
  if (session.payment_status !== "paid") return false;
  if (!sessionGehoert(order, session)) return false;
  order.customerId = idVon(session.customer) || order.customerId;
  order.subscriptionId = idVon(session.subscription) || order.subscriptionId;
  order.paymentIntentId = idVon(session.payment_intent) || order.paymentIntentId;
  order.sessionId = session.id || order.sessionId;
  if (session.customer_details && session.customer_details.email && !order.email) {
    order.email = session.customer_details.email;
  }
  if (!order.accessCode) order.accessCode = checkout.zugangscode();
  order.zugang = true;
  order.status = "aktiv";
  return true;
}

async function schreib(store, order, fn) {
  if (!order) return null;
  if (store.mutate) return store.mutate(order.id, fn);
  var next = await fn(order);
  if (next) await store.saveOrder(next);
  return next;
}

async function verarbeite(event, deps) {
  var store = deps.store;
  if (!event || !event.id || !event.type) return { status: 400, code: "ereignis" };
  if (store.eventErledigt && await store.eventErledigt(event.id)) return { status: 200, code: "duplikat" };
  var result;
  try {
    result = await verarbeiteInnen(event, deps);
  } catch (e) {
    return { status: 500, code: "verarbeitung" };
  }
  if (!result || result.status === 500) return result || { status: 500, code: "verarbeitung" };
  await store.claimEvent(event.id, event.type);
  return result;
}

async function verarbeiteInnen(event, deps) {
  var store = deps.store;
  var stripe = deps.stripe;
  var nowIso = new Date(deps.now || Date.now()).toISOString();
  var object = event.data && event.data.object;
  if (!object) return { status: 200, code: "leer" };

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    var order = await bestellungFuerSession(store, object);
    if (!order) return { status: 200, code: "fremd" };
    var session = object;
    if (object.payment_status === "paid" && stripe && stripe.checkout && stripe.checkout.sessions && stripe.checkout.sessions.retrieve) {
      session = await stripe.checkout.sessions.retrieve(object.id, { expand: ["line_items"] });
    }
    if (object.payment_status === "paid") {
      var granted = false;
      await schreib(store, order, async function (aktuell) {
        granted = grantFromSession(aktuell, session);
        if (!granted) {
          aktuell.status = "abgewiesen";
          aktuell.zugang = false;
        }
        return aktuell;
      });
      return { status: 200, code: granted ? "zugang" : "betrag" };
    }
    if (event.type === "checkout.session.completed" && object.payment_status === "unpaid") {
      await schreib(store, order, async function (aktuell) {
        aktuell.sessionId = object.id || aktuell.sessionId;
        aktuell.status = aktuell.status === "aktiv" ? aktuell.status : "wartet";
        return aktuell;
      });
      return { status: 200, code: "unpaid" };
    }
    return { status: 200, code: "kein_paid" };
  }

  if (event.type === "checkout.session.async_payment_failed") {
    var failed = await bestellungFuerSession(store, object);
    if (!failed) return { status: 200, code: "fremd" };
    if (failed.status !== "aktiv") {
      await schreib(store, failed, async function (aktuell) {
        if (aktuell.status !== "aktiv") {
          aktuell.status = "fehlgeschlagen";
          aktuell.zugang = false;
        }
        return aktuell;
      });
    }
    return { status: 200, code: "fehlgeschlagen" };
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    var subId = subscriptionVonInvoice(object);
    var invoiceOrder = await bestellungFuerSubscription(store, stripe, subId);
    if (!invoiceOrder) return { status: 200, code: "fremd" };
    if (event.type === "invoice.paid") {
      if (!rechnungPasst(invoiceOrder, object)) return { status: 200, code: "betrag" };
      await schreib(store, invoiceOrder, async function (aktuell) {
        if (!aktuell.accessCode) aktuell.accessCode = checkout.zugangscode();
        aktuell.zugang = true;
        aktuell.status = "aktiv";
        aktuell.customerId = idVon(object.customer) || aktuell.customerId;
        aktuell.subscriptionId = subId || aktuell.subscriptionId;
        var ende = periodEnde(object);
        if (ende) aktuell.accessUntil = ende;
        return aktuell;
      });
      return { status: 200, code: "rechnung" };
    }
    await schreib(store, invoiceOrder, async function (aktuell) {
      aktuell.status = aktuell.zugang ? "zahlung_offen" : "fehlgeschlagen";
      return aktuell;
    });
    return { status: 200, code: "rechnung_offen" };
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    var subOrder = await bestellungFuerSubscription(store, stripe, object.id);
    if (!subOrder) return { status: 200, code: "fremd" };
    await schreib(store, subOrder, async function (aktuell) {
      if (event.type === "customer.subscription.deleted") {
        aktuell.status = "beendet";
        aktuell.zugang = false;
        aktuell.accessUntil = nowIso;
      } else {
        applySubscription(aktuell, object, nowIso);
      }
      return aktuell;
    });
    return { status: 200, code: "abo" };
  }

  if (event.type === "charge.refunded" || event.type === "charge.dispute.created" || event.type === "radar.early_fraud_warning.created") {
    var charge = object.charge && event.type !== "charge.refunded" ? null : object;
    if (event.type !== "charge.refunded") {
      if (object.charge && stripe && stripe.charges && stripe.charges.retrieve) {
        charge = await stripe.charges.retrieve(idVon(object.charge));
      } else if (object.charge) {
        charge = { id: idVon(object.charge), invoice: null, payment_intent: null };
      }
    }
    var payId = charge && idVon(charge.payment_intent);
    var riskOrder = payId ? await store.findByPaymentIntent(payId) : null;
    if (!riskOrder && charge && charge.invoice && stripe && stripe.invoices) {
      var invoice = await stripe.invoices.retrieve(idVon(charge.invoice));
      riskOrder = await bestellungFuerSubscription(store, stripe, subscriptionVonInvoice(invoice));
    }
    if (!riskOrder) return { status: 200, code: "fremd" };
    await schreib(store, riskOrder, async function (aktuell) {
      if (event.type === "charge.refunded") {
        var full = object.refunded === true || (object.amount && object.amount_refunded >= object.amount);
        if (full) {
          aktuell.status = "beendet";
          aktuell.zugang = false;
          aktuell.accessUntil = nowIso;
        } else if (aktuell.status !== "beendet") {
          aktuell.status = "teilerstattet";
        }
      } else {
        aktuell.status = "gesperrt";
        aktuell.zugang = false;
      }
      return aktuell;
    });
    return { status: 200, code: "risiko" };
  }

  return { status: 200, code: "ignoriert" };
}

module.exports = {
  verarbeite: verarbeite,
  subscriptionVonInvoice: subscriptionVonInvoice,
  applySubscription: applySubscription,
  sessionGehoert: sessionGehoert
};
