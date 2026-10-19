/* Potenzialsession: vier Tipp-Fragen, dann Kontakt und ein freiwilliges Feld.
   Danach Kalender oder 3-Tage-Starter. Der Lead wird immer gespeichert. */
(function () {
  "use strict";

  var form = document.getElementById("fb-form");
  if (!form) return;

  var SUPABASE_URL = "https://jztwnumtwihomgxwlwor.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_yWcwDruITLbaok1rBl4Fiw_Ddjn9xZe";
  var CAL_BASE = "https://calendly.com/hello-shiftmyhorizon/30min";

  var HIGH = { jeden_tag: 1, familie: 1, nicht_weiter: 1 };
  var TOTAL_Q = 4;
  var step = 1;
  var params = new URLSearchParams(location.search);
  var bar = document.getElementById("fb-bar");
  var label = document.getElementById("fb-label");
  var back = document.getElementById("fb-back");
  var next = document.getElementById("fb-next");
  var err = document.getElementById("fb-error");

  function checked(name) {
    return form.querySelector('input[name="' + name + '"]:checked');
  }

  function labelOf(input) {
    if (!input) return "";
    var card = input.closest(".choicecard");
    var text = card ? card.querySelector(".choicecard__text") : null;
    return text ? text.textContent.replace(/\s+/g, " ").trim() : input.value;
  }

  function routeFor(burden, urgency) {
    if (urgency === "jetzt") return "kalender";
    if (urgency === "kein_thema") return "starter";
    if (urgency === "zeit") return HIGH[burden] ? "kalender" : "starter";
    return "starter";
  }

  function routeLabel(route) {
    return route === "kalender" ? "Kalender" : "3-Tage-Starter";
  }

  function show(n, scroll) {
    step = n;
    form.querySelectorAll(".formstep").forEach(function (el) {
      el.classList.toggle("is-active", Number(el.dataset.step) === n);
    });
    var width = n <= TOTAL_Q ? Math.round(n / TOTAL_Q * 100) : 100;
    if (bar) bar.style.width = width + "%";
    if (label) {
      label.textContent = n <= TOTAL_Q ? "Frage " + n + " von 4" : (n === 5 ? "Kontakt" : "Zum Schluss");
    }
    if (back) back.hidden = n === 1;
    if (next) {
      next.hidden = n < 5;
      if (n === 5) next.textContent = "Weiter";
      if (n === 6) {
        var burden = checked("burden");
        var urgency = checked("urgency");
        var route = routeFor(burden && burden.value, urgency && urgency.value);
        next.textContent = route === "kalender" ? "Weiter zum Termin" : "Absenden";
      }
    }
    if (err) err.classList.remove("is-visible");
    if (scroll) {
      var card = document.getElementById("fragebogen");
      if (card) card.scrollIntoView({ block: "nearest" });
    }
  }

  function fail(msg) {
    if (!err) return;
    err.textContent = msg;
    err.classList.add("is-visible");
  }

  function validContact() {
    if (!document.getElementById("k-vorname").value.trim()) {
      fail("Bitte deinen Vornamen eingeben.");
      return false;
    }
    var mail = document.getElementById("k-email").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      fail("Bitte eine gültige E-Mail eingeben.");
      return false;
    }
    if (!document.getElementById("k-ds").checked) {
      fail("Bitte bestätige, dass du die Datenschutzerklärung gelesen hast.");
      return false;
    }
    if (!document.getElementById("k-training").checked) {
      fail("Bitte bestätige noch den Hinweis zum Training.");
      return false;
    }
    return true;
  }

  form.addEventListener("click", function (e) {
    var card = e.target.closest(".choicecard");
    if (!card) return;
    var stepEl = card.closest(".formstep");
    if (!stepEl) return;
    var n = Number(stepEl.dataset.step);
    if (n < 1 || n > 4) return;
    var input = card.querySelector("input");
    if (input) input.checked = true;
    setTimeout(function () { show(n + 1, true); }, 160);
  });

  if (back) back.addEventListener("click", function () { if (step > 1) show(step - 1, true); });
  if (next) next.addEventListener("click", function () {
    if (step === 5) {
      if (!validContact()) return;
      show(6, true);
      return;
    }
    if (step === 6) send();
  });

  async function callRpc(name, body) {
    var r = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(name + ": " + r.status);
    return r;
  }

  function answers() {
    var moment = checked("moment");
    var burden = checked("burden");
    var job = checked("job");
    var urgency = checked("urgency");
    var note = document.getElementById("q-note").value.trim();
    var route = routeFor(burden && burden.value, urgency && urgency.value);
    return {
      moment: moment && moment.value,
      moment_label: labelOf(moment),
      burden: burden && burden.value,
      burden_label: labelOf(burden),
      job: job && job.value,
      job_label: labelOf(job),
      urgency: urgency && urgency.value,
      urgency_label: labelOf(urgency),
      note: note || null,
      route: route,
      email: document.getElementById("k-email").value.trim().toLowerCase(),
      datenschutz_gelesen: true,
      training_kein_behandlung_bestaetigt: true,
      page: form.getAttribute("data-page") || "session",
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      via: params.get("via"),
      referrer: document.referrer || null,
      landed_at: new Date().toISOString()
    };
  }

  function calendlyUrl(data, name) {
    var q = new URLSearchParams();
    q.set("name", name);
    q.set("email", data.email);
    q.set("a1", data.moment_label || "");
    q.set("a2", data.burden_label || "");
    var third = [data.job_label, data.urgency_label].filter(Boolean).join(", ");
    if (data.note) third = third ? third + ". " + data.note : data.note;
    q.set("a3", third);
    return CAL_BASE + "?" + q.toString();
  }

  function mountCalendly(url) {
    var slot = document.getElementById("calendly-slot");
    if (!slot) return;
    slot.hidden = false;
    slot.innerHTML = "";
    var widget = document.createElement("div");
    widget.className = "calendly-inline-widget";
    widget.setAttribute("data-url", url);
    widget.style.minWidth = "280px";
    widget.style.height = "740px";
    slot.appendChild(widget);
    var src = "https://assets.calendly.com/assets/external/widget.js";
    if (!document.querySelector('script[src="' + src + '"]')) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      document.body.appendChild(s);
    } else if (window.Calendly) {
      window.Calendly.initInlineWidget({ url: url, parentElement: widget });
    }
    var link = document.getElementById("calendly-link");
    if (link) link.href = url;
    setTimeout(function () {
      var fallback = document.getElementById("calendly-fallback");
      if (fallback && !slot.querySelector("iframe")) fallback.hidden = false;
    }, 8000);
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== "https://calendly.com") return;
    if (!e.data || e.data.event !== "calendly.event_scheduled") return;
    var slot = document.getElementById("calendly-slot");
    var head = document.getElementById("cal-head");
    var thanks = document.getElementById("booked-thanks");
    if (slot) slot.hidden = true;
    if (head) head.hidden = true;
    if (thanks) thanks.hidden = false;
  });

  async function send() {
    if (!checked("moment") || !checked("burden") || !checked("job") || !checked("urgency")) {
      fail("Bitte beantworte die vier Fragen.");
      return;
    }
    if (!validContact()) { show(5, true); return; }
    var data = answers();
    next.disabled = true;
    next.textContent = "…";
    var name = document.getElementById("k-vorname").value.trim();
    var phone = document.getElementById("k-phone").value.trim();
    try {
      await callRpc("register_potenzialanalyse", {
        p_name: name,
        p_phone: phone || null,
        p_pattern: data.route,
        p_blocker: data.burden,
        p_answers: data,
        p_source: "potenzialsession",
        p_language: "de"
      });
      if (window.smhNotify) {
        await window.smhNotify({
          kind: "session",
          name: name,
          email: data.email,
          phone: phone,
          page: data.page,
          route: routeLabel(data.route),
          answers: [
            { frage: "Wann merkst du am stärksten, dass dein Kopf nicht abschaltet?", antwort: data.moment_label },
            { frage: "Wie sehr belastet dich das gerade?", antwort: data.burden_label },
            { frage: "Was machst du beruflich?", antwort: data.job_label },
            { frage: "Wie dringend ist das für dich?", antwort: data.urgency_label },
            { frage: "Willst du mir vorher noch etwas sagen?", antwort: data.note || "" }
          ]
        });
      }
      document.getElementById("form-live").hidden = true;
      document.getElementById("form-done").hidden = false;
      var sticky = document.querySelector(".stickybar");
      if (sticky) sticky.remove();
      if (data.route === "kalender") {
        document.getElementById("route-calendar").hidden = false;
        var title = document.getElementById("thanks-title");
        if (title) title.textContent = "Danke, " + name + ". Dein Termin steht.";
        mountCalendly(calendlyUrl(data, name));
      } else {
        document.getElementById("route-starter").hidden = false;
      }
      document.getElementById("fragebogen").scrollIntoView({ block: "nearest" });
    } catch (e) {
      console.error(e);
      fail("Da ist etwas schiefgelaufen. Bitte versuch es gleich noch einmal.");
      next.disabled = false;
      next.textContent = "Weiter zum Termin";
    }
  }

  show(1, false);
})();
