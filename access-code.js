/* Access codes for register_lead. A collision on leads_access_code_upper_unique
   gets a new code, up to 5 tries. The code is returned only after a save. */
(function () {
  "use strict";
  var ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function part(length) {
    var out = "";
    var bytes = new Uint8Array(16);
    while (out.length < length) {
      crypto.getRandomValues(bytes);
      var i;
      for (i = 0; i < bytes.length && out.length < length; i++) {
        if (bytes[i] < 252) out += ALPHABET[bytes[i] % 36];
      }
    }
    return out;
  }

  function newCode() {
    return part(4) + "-" + part(4);
  }

  function blob(error) {
    if (!error) return "";
    return [error.code, error.message, error.details, error.hint].join(" ").toLowerCase();
  }

  function isDuplicate(error) {
    var text = blob(error);
    return text.indexOf("23505") !== -1 || text.indexOf("duplicate") !== -1 || text.indexOf("unique") !== -1;
  }

  function withCode(fields, code) {
    var body = {};
    var key;
    for (key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) body[key] = fields[key];
    }
    body.p_access_code = code;
    if (body.p_onboarding_data && typeof body.p_onboarding_data === "object") {
      var data = {};
      var src = body.p_onboarding_data;
      for (key in src) {
        if (Object.prototype.hasOwnProperty.call(src, key)) data[key] = src[key];
      }
      data.access_code = code;
      body.p_onboarding_data = data;
    }
    return body;
  }

  async function registerLead(invoke, fields) {
    var last = null;
    var n;
    for (n = 0; n < 5; n++) {
      var code = newCode();
      var body = withCode(fields, code);
      try {
        if (invoke && typeof invoke.rpc === "function") {
          var result = await invoke.rpc("register_lead", body);
          if (result && result.error) {
            last = result.error;
            if (!isDuplicate(result.error)) throw result.error;
            continue;
          }
          return code;
        }
        await invoke("register_lead", body);
        return code;
      } catch (error) {
        last = error;
        if (!isDuplicate(error)) throw error;
      }
    }
    throw last;
  }

  window.smhNewAccessCode = newCode;
  window.smhRegisterLead = registerLead;
})();
