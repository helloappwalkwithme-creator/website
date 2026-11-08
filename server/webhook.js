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
  if (sub.status === "active" || sub.status === "trialing") {
    order.status = sub.cancel_at_period_end ? "kuendigung_laeuft" : "aktiv";
    order.zugang = true;
    if (ende) order.accessUntil = ende;
    if (!order.accessCode) order.accessCode = checkout.zugangscode();
    return;
  }
  if (sub.status === "past_due") {
    order.status = "zahlung_offen";
    order.zugang = true;
    if (ende) order.accessUntil = ende;
    if (!order.accessCode) order.accessCode = checkout.zugangscode();
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

function grantFromSession(order, session) {
  if (session.payment_status !== "paid") return false;
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
  if (session.mode === "payment") {
    var until = new Date();
    until.setUTCDate(until.getUTCDate() + 90);
    order.accessUntil = until.toISOString();
  }
  return true;
}

async function verarbeite(event, deps) {
  var store = deps.store;
  var stripe = deps.stripe;
  var nowIso = new Date(deps.now || Date.now()).toISOString();
  if (!event || !event.id || !event.type) return { status: 400, code: "ereignis" };
  var claimed = await store.claimEvent(event.id, event.type);
  if (!claimed) return { status: 200, code: "duplikat" };
  var object = event.data && event.data.object;
  if (!object) return { status: 200, code: "leer" };

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    var order = await bestellungFuerSession(store, object);
    if (!order) return { status: 200, code: "fremd" };
    if (object.payment_status === "paid") {
      grantFromSession(order, object);
      await store.saveOrder(order);
      return { status: 200, code: "zugang" };
    }
    if (event.type === "checkout.session.completed" && object.payment_status === "unpaid") {
      order.sessionId = object.id || order.sessionId;
      order.status = order.status === "aktiv" ? order.status : "wartet";
      await store.saveOrder(order);
      return { status: 200, code: "unpaid" };
    }
    return { status: 200, code: "kein_paid" };
  }

  if (event.type === "checkout.session.async_payment_failed") {
    var failed = await bestellungFuerSession(store, object);
    if (!failed) return { status: 200, code: "fremd" };
    if (failed.status !== "aktiv") {
      failed.status = "fehlgeschlagen";
      failed.zugang = false;
      await store.saveOrder(failed);
    }
    return { status: 200, code: "fehlgeschlagen" };
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    var subId = subscriptionVonInvoice(object);
    var invoiceOrder = await bestellungFuerSubscription(store, stripe, subId);
    if (!invoiceOrder) return { status: 200, code: "fremd" };
    if (event.type === "invoice.paid") {
      if (!invoiceOrder.accessCode) invoiceOrder.accessCode = checkout.zugangscode();
      invoiceOrder.zugang = true;
      invoiceOrder.status = "aktiv";
      invoiceOrder.customerId = idVon(object.customer) || invoiceOrder.customerId;
      invoiceOrder.subscriptionId = subId || invoiceOrder.subscriptionId;
      var ende = periodEnde(object);
      if (ende) invoiceOrder.accessUntil = ende;
      await store.saveOrder(invoiceOrder);
      return { status: 200, code: "rechnung" };
    }
    invoiceOrder.status = "zahlung_offen";
    invoiceOrder.zugang = true;
    await store.saveOrder(invoiceOrder);
    return { status: 200, code: "rechnung_offen" };
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    var subOrder = await bestellungFuerSubscription(store, stripe, object.id);
    if (!subOrder) return { status: 200, code: "fremd" };
    if (event.type === "customer.subscription.deleted") {
      subOrder.status = "beendet";
      subOrder.zugang = false;
      subOrder.accessUntil = nowIso;
    } else {
      applySubscription(subOrder, object, nowIso);
    }
    await store.saveOrder(subOrder);
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
    if (event.type === "charge.refunded") {
      var full = object.refunded === true || (object.amount && object.amount_refunded >= object.amount);
      if (full) {
        riskOrder.status = "beendet";
        riskOrder.zugang = false;
        riskOrder.accessUntil = nowIso;
      } else {
        riskOrder.status = riskOrder.status === "beendet" ? riskOrder.status : "teilerstattet";
      }
    } else {
      riskOrder.status = "gesperrt";
      riskOrder.zugang = false;
    }
    await store.saveOrder(riskOrder);
    return { status: 200, code: "risiko" };
  }

  return { status: 200, code: "ignoriert" };
}

module.exports = {
  verarbeite: verarbeite,
  subscriptionVonInvoice: subscriptionVonInvoice,
  applySubscription: applySubscription
};
