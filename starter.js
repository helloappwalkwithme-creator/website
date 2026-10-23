/* starter.js - Anmeldung 3-Tage-Starter. Anbindung, Funktionen und Werte
   unveraendert aus der Fassung vom 10.10.2026; genutzt von abschalten.html
   und fokus.html (dort als Abschnitt auf der Seite). */
(function () {
  "use strict";

  var SUPABASE_URL = 'https://jztwnumtwihomgxwlwor.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_yWcwDruITLbaok1rBl4Fiw_Ddjn9xZe';

  var waNumber = "491632225456";
  var tgBotName = "shift_my_horizon_bot";
  var botMessage = "Hallo, ich möchte meinen kostenlosen 3-Tage-Starter starten. Bitte aktiviere meinen Zugang.";
  var accessLabel = "Mein Zugangscode:";

  var FLOWS = { sleep: "sleep_flow", stress: "stress_flow", morning: "morning_flow" };

  var params = new URLSearchParams(location.search);
  var btn = document.getElementById('btn-start');
  var err = document.getElementById('form-error');
  var btnLabel = btn ? btn.textContent : '';

  function fail(msg) {
    err.textContent = msg; err.classList.add('is-visible');
    btn.disabled = false; btn.textContent = btnLabel;
  }

  function radio(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function accessCode() {
    var p = function () { return Math.random().toString(36).substring(2, 6).toUpperCase(); };
    return p() + '-' + p();
  }

  async function callRpc(name, body) {
    var r = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(name + ': ' + r.status + ' ' + (await r.text()));
    return r;
  }

  var form = document.getElementById('start-form');
  if (form && form.hasAttribute('data-wizard')) {
    var steps = Array.prototype.slice.call(form.querySelectorAll('.formstep'));
    var back = document.getElementById('starter-back');
    var startAt = Number(form.getAttribute('data-start-step') || '1');
    var current = startAt;
    function showStep(n) {
      current = n;
      steps.forEach(function (el) {
        el.classList.toggle('is-active', Number(el.dataset.step) === n);
      });
      if (back) back.hidden = n <= startAt;
    }
    form.addEventListener('click', function (e) {
      var card = e.target.closest('.choicecard');
      if (!card || !card.closest('.formstep')) return;
      var n = Number(card.closest('.formstep').dataset.step);
      var input = card.querySelector('input');
      if (input) input.checked = true;
      var last = steps.reduce(function (max, el) { return Math.max(max, Number(el.dataset.step)); }, 0);
      if (n < last) setTimeout(function () { showStep(n + 1); }, 160);
    });
    if (back) back.addEventListener('click', function () { if (current > startAt) showStep(current - 1); });
    showStep(startAt);
  }

  btn.addEventListener('click', async function () {
    var vorname = document.getElementById('vorname').value.trim();
    var email = document.getElementById('email').value.trim().toLowerCase();
    var kanal = radio('kanal');
    var start = radio('start');
    var woechentlich = document.getElementById('c-woechentlich');

    err.classList.remove('is-visible');

    if (!vorname) return fail("Bitte deinen Vornamen eingeben.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Bitte eine gültige E-Mail eingeben.");
    if (!start) return fail("Bitte wähle, wo du anfangen willst.");
    if (!document.getElementById('c-starter').checked) return fail("Bitte stimme der Datenverarbeitung zu, damit ich dir den Starter schicken darf.");
    if (!document.getElementById('c-eigen').checked) return fail("Bitte bestätige noch den Hinweis zur Eigenverantwortung.");

    btn.disabled = true; btn.textContent = "…";

    var code = accessCode();
    var flow = FLOWS[start];
    var onboarding = {
      starter: start,
      flow: flow,
      access_code: code,
      utm_source: params.get("utm_source"), utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      /* Steht kein via in der URL, nimmt die Seite ihren eigenen Standard
         (data-via-standard im body). So braucht /nacht keine Weiterleitung mehr
         und antwortet direkt mit 200. */
      via: params.get("via") || document.body.getAttribute("data-via-standard") || null,
      referrer: document.referrer || null,
      landed_at: new Date().toISOString(),
      eigenverantwortung_bestaetigt: true,
      wochenvideo_optin: !!(woechentlich && woechentlich.checked)
    };

    try {
      /* Zwei Aufrufe, bewusst getrennt: (1) setzt den Starttag, (2) legt den Ablauf an. Die Auslieferung braucht beides. */
      await callRpc('register_tripwire_lead', {
        p_email: email, p_first_name: vorname, p_delivery_channel: kanal,
        p_source: 'abschalten_flow', p_language: 'de',
        p_onboarding_data: onboarding, p_access_code: code
      });

      await callRpc('register_lead', {
        p_email: email, p_first_name: vorname, p_delivery_channel: kanal,
        p_source: 'abschalten_flow', p_language: 'de',
        p_onboarding_data: onboarding, p_access_code: code,
        p_chosen_path: flow,
        /* Der Server nutzt diesen Wert fuer den Ablauf. */
        p_flow_name: flow
      });

      if (window.smhNotify) {
        var startEl = document.querySelector('input[name="start"]:checked');
        var kanalEl = document.querySelector('input[name="kanal"]:checked');
        var startText = startEl && startEl.closest('.choicecard') ? startEl.closest('.choicecard').textContent.replace(/\s+/g, ' ').trim() : (document.body.getAttribute('data-page') === 'nacht' ? 'Nachts, wenn ich wach liege' : (startEl ? startEl.value : ''));
        var kanalText = kanalEl && kanalEl.closest('.choicecard') ? kanalEl.closest('.choicecard').textContent.replace(/\s+/g, ' ').trim() : (kanalEl ? kanalEl.value : '');
        await window.smhNotify({
          kind: 'starter',
          name: vorname,
          email: email,
          phone: '',
          page: document.body.getAttribute('data-page') || 'abschalten',
          route: '3-Tage-Starter',
          answers: [
            { frage: 'Was nervt dich gerade am meisten?', antwort: startText },
            { frage: 'Wohin sollen die Übungen kommen?', antwort: kanalText }
          ]
        });
      }

      var text = encodeURIComponent(botMessage + "\n\n" + accessLabel + " " + code);
      var link = document.getElementById('done-link');

      document.getElementById('done-title').textContent = "Danke, " + vorname + ". Dein 3-Tage-Starter ist bereit.";
      if (kanal === 'email') {
        document.getElementById('done-email').hidden = false;
      } else {
        document.getElementById('done-messenger').hidden = false;
        if (kanal === 'telegram') { link.href = "https://t.me/" + tgBotName + "?text=" + text; link.textContent = "Telegram öffnen"; }
        else { link.href = "https://wa.me/" + waNumber + "?text=" + text; link.textContent = "WhatsApp öffnen"; }
      }

      document.getElementById('form-live').hidden = true;
      document.getElementById('form-done').hidden = false;
      var sticky = document.querySelector('.stickybar'); if (sticky) sticky.remove();
      document.getElementById('start-form').closest('section').scrollIntoView();

    } catch (e) {
      console.error("Fehler beim Speichern:", e);
      fail("Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.");
    }
  });
})();
