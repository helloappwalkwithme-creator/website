"use strict";

var preise = require("./preise");
var checkout = require("./checkout");
var webhook = require("./webhook");
var storeMod = require("./store");

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function originVon(req) {
  var header = req.headers.origin || "";
  if (header) return header;
  var host = req.headers["x-forwarded-host"] || req.headers.host;
  var proto = req.headers["x-forwarded-proto"] || "https";
  if (!host) return "";
  return proto + "://" + host;
}

async function liesJson(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  var text = await rohtext(req);
  if (!text) return {};
  if (text.length > 20000) {
    var err = new Error("zu_gross");
    err.code = "zu_gross";
    throw err;
  }
  return JSON.parse(text);
}

function rohtext(req) {
  if (typeof req.rawBody === "string") return Promise.resolve(req.rawBody);
  if (Buffer.isBuffer(req.rawBody)) return Promise.resolve(req.rawBody.toString("utf8"));
  if (typeof req.body === "string") return Promise.resolve(req.body);
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body.toString("utf8"));
  if (req.body && typeof req.body === "object") return Promise.resolve(null);
  return new Promise(function (resolve, reject) {
    var chunks = [];
    var size = 0;
    req.on("data", function (chunk) {
      size += chunk.length;
      if (size > 200000) {
        reject(Object.assign(new Error("zu_gross"), { code: "zu_gross" }));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", function () { resolve(Buffer.concat(chunks).toString("utf8")); });
    req.on("error", reject);
  });
}

function deps(env, extra) {
  return {
    env: env,
    store: (extra && extra.store) || storeMod.storeFromEnv(env),
    stripe: (extra && extra.stripe) || null
  };
}

function stripeOder(env, extra) {
  if (extra && extra.stripe) return extra.stripe;
  return checkout.stripeClient(env);
}

async function kaufbar(req, res, env) {
  if (req.method !== "GET") return send(res, 405, { code: "methode" });
  send(res, 200, { angebote: preise.kaufbarListe(env) });
}

async function checkoutPost(req, res, env, extra) {
  if (req.method !== "POST") return send(res, 405, { code: "methode" });
  var body;
  try {
    body = await liesJson(req);
  } catch (e) {
    return send(res, 400, { code: "json" });
  }
  var stripe;
  try {
    stripe = stripeOder(env, extra);
  } catch (e) {
    return send(res, 503, { code: e.code || "stripe_fehlt" });
  }
  var result = await checkout.createCheckout({
    env: env,
    stripe: stripe,
    store: deps(env, extra).store,
    angebotId: body.angebotId,
    thema: body.thema,
    email: body.email,
    anfrageId: body.anfrageId,
    utm: body.utm,
    origin: originVon(req)
  });
  if (!result.ok) return send(res, result.status, { code: result.code });
  send(res, 200, { url: result.url, bestellungId: result.bestellungId });
}

async function statusGet(req, res, env, extra) {
  if (req.method !== "GET") return send(res, 405, { code: "methode" });
  var store = deps(env, extra).store;
  if (!store) return send(res, 503, { code: "speicher_fehlt" });
  var url = new URL(req.url, "https://www.shiftmyhorizon.com");
  var id = url.searchParams.get("bestellung") || "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return send(res, 400, { code: "bestellung" });
  var order = await store.getOrder(id);
  var result = checkout.statusAntwort(order, Date.now());
  if (!result.ok) return send(res, result.status, { code: result.code });
  send(res, 200, {
    bestellungId: result.bestellungId,
    angebotId: result.angebotId,
    zahlstatus: result.zahlstatus,
    zugang: result.zugang,
    accessCode: result.accessCode,
    accessUntil: result.accessUntil
  });
}

async function portalPost(req, res, env, extra) {
  if (req.method !== "POST") return send(res, 405, { code: "methode" });
  var body;
  try {
    body = await liesJson(req);
  } catch (e) {
    return send(res, 400, { code: "json" });
  }
  var stripe;
  try {
    stripe = stripeOder(env, extra);
  } catch (e) {
    return send(res, 503, { code: e.code || "stripe_fehlt" });
  }
  var result = await checkout.portalSession({
    env: env,
    stripe: stripe,
    store: deps(env, extra).store,
    email: body.email,
    code: body.code,
    origin: originVon(req)
  });
  if (!result.ok) return send(res, result.status, { code: result.code });
  send(res, 200, { url: result.url });
}

async function webhookPost(req, res, env, extra) {
  if (req.method !== "POST") return send(res, 405, { code: "methode" });
  var secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return send(res, 503, { code: "webhook_geheimnis_fehlt" });
  var store = deps(env, extra).store;
  if (!store) return send(res, 503, { code: "speicher_fehlt" });
  var raw = await rohtext(req);
  if (raw == null) return send(res, 400, { code: "rohdaten_fehlen" });
  var stripe;
  try {
    stripe = stripeOder(env, extra);
  } catch (e) {
    return send(res, 503, { code: e.code || "stripe_fehlt" });
  }
  var event;
  try {
    event = stripe.webhooks.constructEvent(raw, req.headers["stripe-signature"] || "", secret);
  } catch (e) {
    return send(res, 400, { code: "signatur" });
  }
  try {
    var result = await webhook.verarbeite(event, { store: store, stripe: stripe });
    send(res, result.status, { code: result.code });
  } catch (e) {
    send(res, 500, { code: "verarbeitung" });
  }
}

module.exports = {
  kaufbar: kaufbar,
  checkoutPost: checkoutPost,
  statusGet: statusGet,
  portalPost: portalPost,
  webhookPost: webhookPost,
  rohtext: rohtext
};
