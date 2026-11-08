"use strict";

var crypto = require("crypto");
var katalog = require("../katalog");
var preise = require("./preise");

var API_VERSION = "2026-10-28.endive";
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function fehler(status, code) {
  return { ok: false, status: status, code: code };
}

function buchstaben(n) {
  var alphabet = "abcdefghijklmnopqrstuvwxyz";
  var bytes = crypto.randomBytes(n);
  var out = "";
  var i;
  for (i = 0; i < n; i++) out += alphabet[bytes[i] % 26];
  return out;
}

function zugangscode() {
  var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function part() {
    var bytes = crypto.randomBytes(8);
    var out = "";
    var i = 0;
    while (out.length < 4) {
      if (i >= bytes.length) {
        bytes = crypto.randomBytes(8);
        i = 0;
      }
      if (bytes[i] < 252) out += alphabet[bytes[i] % 36];
      i += 1;
    }
    return out;
  }
  return part() + "-" + part();
}

function utmAus(roh) {
  var out = {};
  if (!roh || typeof roh !== "object") return out;
  katalog.TRACK_KEYS.forEach(function (key) {
    var value = roh[key];
    if (typeof value !== "string") return;
    var clean = value.replace(/[\r\n]/g, "").trim().slice(0, 120);
    if (clean) out[key] = clean;
  });
  return out;
}

function originErlaubt(origin, env) {
  var list = String((env && env.SITE_ORIGINS) || "https://www.shiftmyhorizon.com")
    .split(",")
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
  if (origin && list.indexOf(origin) !== -1) return origin;
  return list[0];
}

function checkoutIstStripe(url) {
  try {
    var parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "checkout.stripe.com";
  } catch (e) {
    return false;
  }
}

function portalIstStripe(url) {
  try {
    var parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "billing.stripe.com";
  } catch (e) {
    return false;
  }
}

async function createCheckout(input) {
  var env = input.env || {};
  var offer = katalog.angebot(input.angebotId);
  if (!offer) return fehler(404, "angebot_unbekannt");
  var thema = null;
  if (input.thema) {
    thema = katalog.themaVon(offer, input.thema);
    if (!thema) return fehler(400, "thema_unbekannt");
  }
  var email = typeof input.email === "string" ? input.email.trim() : "";
  if (email && (email.length > 200 || !EMAIL.test(email))) return fehler(400, "email");
  if (!UUID.test(String(input.anfrageId || ""))) return fehler(400, "anfrage");
  var gefunden = preise.preisId(offer.id, env);
  if (!gefunden.id) return fehler(409, gefunden.code || "preis_fehlt");
  if (!input.store) return fehler(503, "speicher_fehlt");
  if (!input.stripe) return fehler(503, "stripe_fehlt");

  var existing = await input.store.findByAnfrage(input.anfrageId);
  if (existing) {
    if (existing.angebotId !== offer.id) return fehler(409, "anfrage_belegt");
    if (existing.sessionUrl && checkoutIstStripe(existing.sessionUrl)) {
      return { ok: true, status: 200, url: existing.sessionUrl, bestellungId: existing.id };
    }
  }

  var price;
  try {
    price = await input.stripe.prices.retrieve(gefunden.id);
  } catch (e) {
    return fehler(502, "preis_lesen");
  }
  if (!price || price.id !== gefunden.id || price.active === false) return fehler(409, "preis_inaktiv");
  var mode = price.recurring ? "subscription" : "payment";
  var origin = originErlaubt(input.origin, env);
  var order = existing;
  if (!order) {
    order = await input.store.createOrder({
      anfrageId: input.anfrageId,
      angebotId: offer.id,
      thema: thema ? thema.id : null,
      email: email || null,
      preisId: gefunden.id,
      utm: utmAus(input.utm)
    });
  }
  order.modus = mode;
  order.preisId = gefunden.id;
  order.thema = thema ? thema.id : order.thema;
  if (email) order.email = email;

  var metadata = { angebot_id: offer.id, bestellung_id: order.id };
  if (thema) metadata.thema = thema.id;
  var params = {
    mode: mode,
    line_items: [{ price: gefunden.id, quantity: 1 }],
    success_url: origin + "/kauf-status?bestellung=" + encodeURIComponent(order.id),
    cancel_url: origin + "/angebot?id=" + encodeURIComponent(offer.id),
    client_reference_id: order.id,
    metadata: metadata,
    integration_identifier: "smh_hosted_" + buchstaben(8)
  };
  if (email) params.customer_email = email;
  if (mode === "subscription") params.subscription_data = { metadata: metadata };
  else params.payment_intent_data = { metadata: metadata };

  var session;
  try {
    session = await input.stripe.checkout.sessions.create(params, {
      idempotencyKey: "smh_checkout_" + input.anfrageId
    });
  } catch (e) {
    return fehler(502, "checkout");
  }
  if (!session || !checkoutIstStripe(session.url)) return fehler(502, "checkout_url");
  order.sessionId = session.id;
  order.sessionUrl = session.url;
  await input.store.saveOrder(order);
  return { ok: true, status: 200, url: session.url, bestellungId: order.id, modus: mode };
}

function hatZugang(order, now) {
  if (!order || !order.zugang) return false;
  if (order.status === "gesperrt" || order.status === "beendet" || order.status === "fehlgeschlagen") return false;
  if (order.accessUntil && Date.parse(order.accessUntil) <= now) return false;
  return order.status === "aktiv" || order.status === "zahlung_offen" || order.status === "kuendigung_laeuft";
}

function statusAntwort(order, now) {
  if (!order) return { ok: false, status: 404, code: "unbekannt" };
  var offen = hatZugang(order, now || Date.now());
  return {
    ok: true,
    status: 200,
    bestellungId: order.id,
    angebotId: order.angebotId,
    zahlstatus: order.status,
    zugang: offen,
    accessCode: offen ? order.accessCode : null,
    accessUntil: offen ? order.accessUntil : null
  };
}

async function portalSession(input) {
  if (!input.store || !input.stripe) return fehler(503, "stripe_fehlt");
  var email = String(input.email || "").trim().toLowerCase();
  var code = String(input.code || "").trim().toUpperCase();
  if (!EMAIL.test(email) || !/^[0-9A-Z]{4}-[0-9A-Z]{4}$/.test(code)) return fehler(400, "angaben");
  var order = await input.store.findByCode(code);
  if (!order || !order.email || order.email.toLowerCase() !== email) return fehler(403, "nicht_berechtigt");
  if (!order.customerId || !order.subscriptionId) return fehler(409, "kein_abo");
  if (!hatZugang(order, input.now || Date.now()) && order.status !== "zahlung_offen") {
    return fehler(403, "kein_zugang");
  }
  var origin = originErlaubt(input.origin, input.env || {});
  var session;
  try {
    session = await input.stripe.billingPortal.sessions.create({
      customer: order.customerId,
      return_url: origin + "/angebot?id=" + encodeURIComponent(order.angebotId)
    });
  } catch (e) {
    return fehler(502, "portal");
  }
  if (!session || !portalIstStripe(session.url)) return fehler(502, "portal_url");
  return { ok: true, status: 200, url: session.url };
}

function stripeClient(env) {
  var key = String((env && env.STRIPE_RESTRICTED_KEY) || "");
  if (!key) {
    var missing = new Error("stripe_key_fehlt");
    missing.code = "stripe_key_fehlt";
    throw missing;
  }
  var live = /^(sk|rk)_live_/.test(key);
  if (live && env.STRIPE_ALLOW_LIVE !== "1") {
    var blocked = new Error("live_gesperrt");
    blocked.code = "live_gesperrt";
    throw blocked;
  }
  var Stripe = require("stripe");
  return new Stripe(key, { apiVersion: API_VERSION });
}

module.exports = {
  API_VERSION: API_VERSION,
  createCheckout: createCheckout,
  hatZugang: hatZugang,
  statusAntwort: statusAntwort,
  portalSession: portalSession,
  checkoutIstStripe: checkoutIstStripe,
  portalIstStripe: portalIstStripe,
  stripeClient: stripeClient,
  zugangscode: zugangscode,
  utmAus: utmAus
};
