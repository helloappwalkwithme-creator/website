/* Hinweis-Mail an coaching@shiftmyhorizon.com über die Edge Function notify-form.
   Die Funktion braucht das Supabase-Secret RESEND_API_KEY.
   Optional: RESEND_FROM, wenn onboarding@resend.dev nicht an die Domain liefern darf.
   Ein Fehler hier stoppt die Anmeldung nicht. Der Lead liegt dann schon in Supabase. */
(function () {
  "use strict";
  var SUPABASE_URL = "https://jztwnumtwihomgxwlwor.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yWcwDruITLbaok1rBl4Fiw_Ddjn9xZe";

  window.smhNotify = function (payload) {
    var call = fetch(SUPABASE_URL + "/functions/v1/notify-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) console.error("Hinweis-Mail", r.status);
      return r;
    }).catch(function (e) {
      console.error("Hinweis-Mail", e);
    });
    return Promise.race([
      call,
      new Promise(function (resolve) { setTimeout(resolve, 4000); })
    ]);
  };
})();
