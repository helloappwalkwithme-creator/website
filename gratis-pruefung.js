"use strict";

/* Prüft eine Gratis-Anmeldung, ohne Netz, Mail oder Supabase. */
function pruefeGratis(input) {
  var email = String((input && input.email) || "").trim().toLowerCase();
  if (!input || !String(input.vorname || "").trim()) return { ok: false, fehler: "vorname" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, fehler: "email" };
  if (!input.start) return { ok: false, fehler: "start" };
  if (!input.daten) return { ok: false, fehler: "daten" };
  if (!input.eigen) return { ok: false, fehler: "eigen" };
  if (input.netzwerk === true) {
    var verboten = new Error("netz_verboten");
    verboten.code = "netz_verboten";
    throw verboten;
  }
  return {
    ok: true,
    rpc: "register_tripwire_lead",
    body: {
      p_email: email,
      p_first_name: String(input.vorname).trim(),
      p_delivery_channel: input.kanal || "email",
      p_source: "abschalten_flow",
      p_language: "de",
      p_onboarding_data: { starter: input.start, flow: input.start + "_flow" }
    }
  };
}

module.exports = { pruefeGratis: pruefeGratis };
