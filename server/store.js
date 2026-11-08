"use strict";

var crypto = require("crypto");

function memoryStore() {
  var orders = new Map();
  var events = new Set();
  var bySession = new Map();
  var byCode = new Map();
  var bySubscription = new Map();
  var byPaymentIntent = new Map();
  var byAnfrage = new Map();
  var ketten = new Map();

  function remember(order) {
    orders.set(order.id, order);
    if (order.anfrageId) byAnfrage.set(order.anfrageId, order.id);
    if (order.sessionId) bySession.set(order.sessionId, order.id);
    if (order.accessCode) byCode.set(String(order.accessCode).toUpperCase(), order.id);
    if (order.subscriptionId) bySubscription.set(order.subscriptionId, order.id);
    if (order.paymentIntentId) byPaymentIntent.set(order.paymentIntentId, order.id);
  }

  return {
    kind: "memory",
    async createOrder(row) {
      var id = crypto.randomUUID();
      var order = {
        id: id,
        anfrageId: row.anfrageId,
        angebotId: row.angebotId,
        thema: row.thema || null,
        email: row.email || null,
        preisId: row.preisId || null,
        betrag: row.betrag == null ? null : row.betrag,
        waehrung: row.waehrung || null,
        modus: row.modus || null,
        status: "offen",
        sessionId: null,
        sessionUrl: null,
        customerId: null,
        subscriptionId: null,
        paymentIntentId: null,
        accessCode: null,
        zugang: false,
        accessUntil: null,
        utm: row.utm || {},
        aktualisiertAm: new Date().toISOString()
      };
      if (row.anfrageId && byAnfrage.has(row.anfrageId)) {
        var belegt = new Error("belegt");
        belegt.code = "belegt";
        throw belegt;
      }
      remember(order);
      return order;
    },
    async eventErledigt(eventId) {
      return events.has(eventId);
    },
    async mutate(id, fn) {
      var vorher = ketten.get(id) || Promise.resolve();
      var lauf = vorher.then(async function () {
        var order = orders.get(id);
        if (!order) return null;
        var next = await fn(order);
        if (next) {
          next.aktualisiertAm = new Date().toISOString();
          remember(next);
        }
        return orders.get(id);
      });
      ketten.set(id, lauf.then(function () { return null; }, function () { return null; }));
      return lauf;
    },
    async getOrder(id) {
      return orders.get(id) || null;
    },
    async findByAnfrage(anfrageId) {
      var id = byAnfrage.get(anfrageId);
      return id ? orders.get(id) : null;
    },
    async findBySession(sessionId) {
      var id = bySession.get(sessionId);
      return id ? orders.get(id) : null;
    },
    async findByCode(code) {
      var id = byCode.get(String(code || "").toUpperCase());
      return id ? orders.get(id) : null;
    },
    async findBySubscription(subscriptionId) {
      var id = bySubscription.get(subscriptionId);
      return id ? orders.get(id) : null;
    },
    async findByPaymentIntent(paymentIntentId) {
      var id = byPaymentIntent.get(paymentIntentId);
      return id ? orders.get(id) : null;
    },
    async claimEvent(eventId) {
      if (events.has(eventId)) return false;
      events.add(eventId);
      return true;
    },
    async saveOrder(order) {
      order.aktualisiertAm = new Date().toISOString();
      remember(order);
      return order;
    }
  };
}

function supabaseStore(env) {
  var base = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  var key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;

  async function rest(method, path, body, prefer) {
    var headers = {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json"
    };
    if (prefer) headers.Prefer = prefer;
    var res = await fetch(base + "/rest/v1/" + path, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    });
    var text = await res.text();
    var data = text ? JSON.parse(text) : null;
    return { ok: res.ok, status: res.status, data: data };
  }

  function fromRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      anfrageId: row.anfrage_id,
      angebotId: row.angebot_id,
      thema: row.thema,
      email: row.email,
      preisId: row.preis_id,
      betrag: row.betrag == null ? null : row.betrag,
      waehrung: row.waehrung,
      modus: row.modus,
      status: row.status,
      sessionId: row.session_id,
      sessionUrl: row.session_url,
      customerId: row.customer_id,
      subscriptionId: row.subscription_id,
      paymentIntentId: row.payment_intent_id,
      accessCode: row.access_code,
      zugang: !!row.zugang,
      accessUntil: row.access_until,
      utm: row.utm || {},
      aktualisiertAm: row.aktualisiert_am
    };
  }

  function toRow(order) {
    return {
      id: order.id,
      anfrage_id: order.anfrageId,
      angebot_id: order.angebotId,
      thema: order.thema,
      email: order.email,
      preis_id: order.preisId,
      betrag: order.betrag == null ? null : order.betrag,
      waehrung: order.waehrung,
      modus: order.modus,
      status: order.status,
      session_id: order.sessionId,
      session_url: order.sessionUrl,
      customer_id: order.customerId,
      subscription_id: order.subscriptionId,
      payment_intent_id: order.paymentIntentId,
      access_code: order.accessCode,
      zugang: !!order.zugang,
      access_until: order.accessUntil,
      utm: order.utm || {},
      aktualisiert_am: new Date().toISOString()
    };
  }

  async function one(path) {
    var res = await rest("GET", path);
    if (!res.ok) throw new Error("speicher");
    return fromRow(Array.isArray(res.data) ? res.data[0] : res.data);
  }

  return {
    kind: "supabase",
    async createOrder(row) {
      var order = {
        id: crypto.randomUUID(),
        anfrageId: row.anfrageId,
        angebotId: row.angebotId,
        thema: row.thema || null,
        email: row.email || null,
        preisId: row.preisId || null,
        betrag: row.betrag == null ? null : row.betrag,
        waehrung: row.waehrung || null,
        modus: null,
        status: "offen",
        sessionId: null,
        sessionUrl: null,
        customerId: null,
        subscriptionId: null,
        paymentIntentId: null,
        accessCode: null,
        zugang: false,
        accessUntil: null,
        utm: row.utm || {}
      };
      var res = await rest("POST", "stripe_bestellungen", toRow(order), "return=representation");
      if (res.status === 409) {
        var belegt = new Error("belegt");
        belegt.code = "belegt";
        throw belegt;
      }
      if (!res.ok) throw new Error("speicher");
      return fromRow(Array.isArray(res.data) ? res.data[0] : res.data);
    },
    async eventErledigt(eventId) {
      var vorhanden = await one("stripe_ereignisse?event_id=eq." + encodeURIComponent(eventId) + "&select=event_id");
      return !!vorhanden;
    },
    async mutate(id, fn) {
      var versuch;
      for (versuch = 0; versuch < 5; versuch++) {
        var aktuell = await one("stripe_bestellungen?id=eq." + encodeURIComponent(id) + "&select=*");
        if (!aktuell) return null;
        var stempel = aktuell.aktualisiertAm;
        var entwurf = Object.assign({}, aktuell);
        var next = await fn(entwurf);
        if (!next) return aktuell;
        var res = await rest(
          "PATCH",
          "stripe_bestellungen?id=eq." + encodeURIComponent(id) + "&aktualisiert_am=eq." + encodeURIComponent(stempel),
          toRow(next),
          "return=representation"
        );
        if (!res.ok) throw new Error("speicher");
        var zeile = Array.isArray(res.data) ? res.data[0] : res.data;
        if (zeile) return fromRow(zeile);
      }
      throw new Error("konflikt");
    },
    async getOrder(id) {
      return one("stripe_bestellungen?id=eq." + encodeURIComponent(id) + "&select=*");
    },
    async findByAnfrage(anfrageId) {
      return one("stripe_bestellungen?anfrage_id=eq." + encodeURIComponent(anfrageId) + "&select=*");
    },
    async findBySession(sessionId) {
      return one("stripe_bestellungen?session_id=eq." + encodeURIComponent(sessionId) + "&select=*");
    },
    async findByCode(code) {
      return one("stripe_bestellungen?access_code=eq." + encodeURIComponent(String(code || "").toUpperCase()) + "&select=*");
    },
    async findBySubscription(subscriptionId) {
      return one("stripe_bestellungen?subscription_id=eq." + encodeURIComponent(subscriptionId) + "&select=*");
    },
    async findByPaymentIntent(paymentIntentId) {
      return one("stripe_bestellungen?payment_intent_id=eq." + encodeURIComponent(paymentIntentId) + "&select=*");
    },
    async claimEvent(eventId, typ) {
      var res = await rest("POST", "stripe_ereignisse", { event_id: eventId, typ: typ || "" }, "return=minimal");
      if (res.status === 409 || res.status === 23505) return false;
      if (!res.ok && res.data && String(JSON.stringify(res.data)).indexOf("23505") !== -1) return false;
      if (!res.ok) throw new Error("speicher");
      return true;
    },
    async saveOrder(order) {
      var res = await rest(
        "PATCH",
        "stripe_bestellungen?id=eq." + encodeURIComponent(order.id),
        toRow(order),
        "return=representation"
      );
      if (!res.ok) throw new Error("speicher");
      return fromRow(Array.isArray(res.data) ? res.data[0] : res.data) || order;
    }
  };
}

function storeFromEnv(env) {
  if (env && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) return supabaseStore(env);
  return null;
}

module.exports = {
  memoryStore: memoryStore,
  supabaseStore: supabaseStore,
  storeFromEnv: storeFromEnv
};
