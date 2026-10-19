// Benachrichtigung bei jeder Formular-Anmeldung.
// Empfänger ist fest coaching@shiftmyhorizon.com.
//
// Geheimnis (Supabase Edge Function Secret, nie im Code):
//   RESEND_API_KEY   Pflicht. Derselbe Schlüssel wie bei notify-admin.
//   RESEND_FROM      Optional. Absender einer bei Resend verifizierten Domain,
//                    z. B. "Shift My Horizon <hello@shiftmyhorizon.com>".
//                    Ohne dieses Secret nimmt die Funktion hello@shiftmyhorizon.com.
//                    Resend liefert an coaching@ erst, wenn die Domain dort verifiziert ist.
//
// verify_jwt ist aus, weil die Seite den öffentlichen Publishable Key schickt
// und keinen Nutzer-Login hat. Die Funktion nimmt nur ein festes Format an
// und schickt die Mail ausschließlich an die eine Adresse oben.

const TO = "coaching@shiftmyhorizon.com";
const MAX = 2000;

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

function clip(value: unknown, max = MAX): string {
  if (value == null) return "";
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max) : text;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "method" });

  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return json(500, { error: "missing_secret", secret: "RESEND_API_KEY" });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "json" });
  }

  const name = clip(body.name, 200);
  const email = clip(body.email, 200);
  const phone = clip(body.phone, 80);
  const page = clip(body.page, 40);
  const route = clip(body.route, 80);
  const kind = clip(body.kind, 40);
  if (!name || !email || !route) return json(400, { error: "fields" });

  const rawAnswers = Array.isArray(body.answers) ? body.answers.slice(0, 20) : [];
  const answers = rawAnswers.map((item) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return { frage: clip(row.frage, 300), antwort: clip(row.antwort, MAX) };
  }).filter((row) => row.frage || row.antwort);

  const when = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const lines = [
    `Name: ${name}`,
    `E-Mail: ${email}`,
    phone ? `Telefon: ${phone}` : "Telefon: (keins)",
    `Seite: ${page || kind || "(unbekannt)"}`,
    `Zeitpunkt: ${when} (Europe/Berlin)`,
    `Weiterleitung: ${route}`,
    "",
    "Antworten:",
    ...answers.map((row) => `${row.frage}: ${row.antwort || "(leer)"}`),
  ];
  const text = lines.join("\n");
  const html = `<pre style="font:16px/1.5 sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
  const from = Deno.env.get("RESEND_FROM") || "Shift My Horizon <hello@shiftmyhorizon.com>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from,
      to: [TO],
      subject: `Neue Anfrage: ${name} (${route})`,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Resend", res.status, detail);
    return json(502, { error: "email_failed", status: res.status });
  }

  const data = await res.json();
  return json(200, { ok: true, id: data.id });
});
