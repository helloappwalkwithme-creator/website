// Hourly caller (Make inserts email_morning_runs, which posts here).
// Sends the morning flow_content text to email-channel leads whose local hour is 7.
// From: RESEND_FROM, or "Shift My Horizon <hello@shiftmyhorizon.com>".
// Secret: RESEND_API_KEY, the same Supabase secret notify-form already uses.
// The caller must send header x-cron-secret matching vault secret email_morning_cron.
// The body is ignored. Recipients come only from claim_email_morning_batch.

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const COPY: Record<string, { hello: string; task: string; why: string; luck: string; subject: string; stop: string }> = {
  de: {
    hello: "Guten Morgen",
    task: "Deine Aufgabe für heute:",
    why: "Warum das wirkt:",
    luck: "Viel Erfolg!",
    subject: "Deine Morgennachricht",
    stop: "Zum Abbestellen: STOP",
  },
  en: {
    hello: "Good morning",
    task: "Your task for today:",
    why: "Why it works:",
    luck: "Good luck!",
    subject: "Your morning message",
    stop: "To stop these emails: STOP",
  },
  es: {
    hello: "Buenos días",
    task: "Tu tarea de hoy:",
    why: "Por qué funciona:",
    luck: "¡Mucho éxito!",
    subject: "Tu mensaje de la mañana",
    stop: "Para dejar de recibirlos: STOP",
  },
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraph(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

async function rpc(name: string, args: Record<string, unknown>) {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("missing_service_role");
  const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${name} ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method" });

  const secret = req.headers.get("x-cron-secret") || "";
  let allowed = false;
  try {
    allowed = (await rpc("email_cron_authorized", { p_secret: secret })) === true;
  } catch (error) {
    console.error(error);
    return json(500, { error: "auth_check_failed" });
  }
  if (!allowed) return json(401, { error: "unauthorized" });

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return json(500, { error: "missing_secret", secret: "RESEND_API_KEY" });

  const from = Deno.env.get("RESEND_FROM") || "Shift My Horizon <hello@shiftmyhorizon.com>";

  let claimed: Array<Record<string, unknown>> = [];
  try {
    const rows = await rpc("claim_email_morning_batch", { p_limit: 40, p_only_email: null });
    claimed = Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error(error);
    return json(500, { error: "claim_failed" });
  }

  let sent = 0;
  let failed = 0;

  for (const row of claimed) {
    const lang = String(row.language || "en");
    const copy = COPY[lang] || COPY.en;
    const name = String(row.first_name || "").trim();
    const title = String(row.title || "");
    const body = String(row.text || "");
    const how = String(row.how || "");
    const why = String(row.why || "");
    const token = String(row.stop_token || "");
    const stopUrl = `https://www.shiftmyhorizon.com/unsubscribe?t=${encodeURIComponent(token)}`;
    const hello = name ? `${copy.hello} ${name},` : `${copy.hello},`;
    const lines = [hello, "", title ? `📌 ${title}` : "", "", body];
    if (how) lines.push("", copy.task, how);
    if (why) lines.push("", copy.why, why);
    lines.push("", copy.luck, "", `${copy.stop}`, stopUrl);
    const text = lines.filter((line, index, all) => !(line === "" && all[index - 1] === "")).join("\n");
    const htmlParts = [`<p>${paragraph(hello)}</p>`];
    if (title) htmlParts.push(`<p><strong>${paragraph(title)}</strong></p>`);
    if (body) htmlParts.push(`<p>${paragraph(body)}</p>`);
    if (how) htmlParts.push(`<p><strong>${paragraph(copy.task)}</strong><br>${paragraph(how)}</p>`);
    if (why) htmlParts.push(`<p><strong>${paragraph(copy.why)}</strong><br>${paragraph(why)}</p>`);
    htmlParts.push(`<p>${paragraph(copy.luck)}</p>`);
    htmlParts.push(`<p><a href="${escapeHtml(stopUrl)}">${paragraph(copy.stop)}</a></p>`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from,
        to: [String(row.email || "")],
        subject: title || copy.subject,
        text,
        html: htmlParts.join(""),
        headers: {
          "List-Unsubscribe": `<${stopUrl}>`,
        },
      }),
    });

    if (res.ok) {
      sent += 1;
      continue;
    }

    failed += 1;
    console.error("Resend", res.status, (await res.text()).slice(0, 300));
    try {
      await rpc("release_email_morning", {
        p_lead_id: row.lead_id,
        p_previous_day: row.previous_day,
        p_previous_last_sent: row.previous_last_sent,
        p_previous_sent_on: row.previous_sent_on,
      });
    } catch (error) {
      console.error("release", error);
    }
  }

  return json(200, { ok: true, claimed: claimed.length, sent, failed });
});
