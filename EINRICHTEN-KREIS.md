# Was du noch einrichten musst, damit der Kreis läuft

Stand 22.10.2026. Gehört zu den neuen Seiten unter `/kreis`.

**An Make, an Supabase und an bestehenden Seiten wurde nichts geändert.** Die Kreis-Seiten
sind neu, liegen alle im Ordner `kreis/` und sind von keiner anderen Seite aus verlinkt.
Niemand kommt da zufällig hin, solange du keinen Link setzt.

---

## Das Wichtigste zuerst

In `kreis/kreis.js` steht ganz oben:

```js
var KREIS_FLOW = "kreis_flow";
var KREIS_FLOW_AKTIV = false;   // auf true stellen, wenn Flow und Make stehen
```

Solange das auf `false` steht, passiert bei einer Anmeldung Folgendes:

* Der Lead landet über `register_tripwire_lead` in Supabase, mit Vorname, E-Mail, Kanal,
  Zugangscode und allem, was er im Kreis angetippt hat.
* Du bekommst die Hinweis-Mail über die bestehende Edge Function `notify-form`.
* Es wird **kein** Ablauf angelegt. Also kann auch kein Make-Szenario über einen Flow
  stolpern, den es noch nicht gibt.

Erst wenn Punkt 1 und 2 unten erledigt sind, stellst du den Schalter auf `true`. Dann
ruft die Seite zusätzlich `register_lead` mit `p_flow_name = "kreis_flow"` auf, genau wie
der 3-Tage-Starter es tut.

---

## 1. Supabase: die Inhalte für `kreis_flow`

Es braucht sieben Nachrichten in `flow_content`, eine pro Stufe. Die Texte schreibst du
oder ich, das ist noch nichts gebaut. Aufbau wie bei den bestehenden Flows:

| day_number | Inhalt |
|---|---|
| 1 | Verhalten: der Wenn-Dann-Satz, plus Link auf `/kreis/gefuehle` |
| 2 | Gefühle: die zwei Wörter, plus Link auf `/kreis/alarm` |
| 3 | Alarm und Planer: Hände flach, ein Wort, eine Uhrzeit, plus Link auf `/kreis/ruhe` |
| 4 | Innere Ruhe: der Zettel vor der Haustür, plus Link auf `/kreis/satz` |
| 5 | Der Satz: Zettel in der Hosentasche, plus Link auf `/kreis/werte` |
| 6 | Werte: such die Rechnung, plus Link auf `/kreis/wofuer` |
| 7 | Wofür: zwanzig Minuten im Kalender, plus Link auf `/kreis` |

**Wichtig für die Links in den Nachrichten:** Der Weiter-Link ist
`https://www.shiftmyhorizon.com/kreis?weiter=<stufe>`. Die Seite schickt den Mann dann
direkt zu der Stufe, die bei ihm dran ist. Die Stufen heißen
`verhalten`, `gefuehle`, `alarm`, `ruhe`, `satz`, `werte`, `wofuer`.

Die Seite legt den passenden Link selbst schon an und schickt ihn mit, siehe Punkt 3.

## 2. Make: den Flow ausliefern

Das bestehende Versand-Szenario kennt `kreis_flow` noch nicht. Du brauchst:

* `kreis_flow` in der Flow-Zuordnung (dort, wo `sleep_flow`, `stress_flow` und
  `morning_flow` stehen).
* Eine WhatsApp-Vorlage für die Kreis-Nachrichten, von Meta freigegeben. Die bestehende
  Starter-Vorlage passt nicht, weil darin von drei Tagen die Rede ist.
* Telegram braucht nichts Neues. Der Bot `shift_my_horizon_bot` bekommt dieselbe
  vorbereitete Nachricht mit dem Zugangscode wie beim Starter.
* E-Mail läuft über denselben Weg wie der Starter, inklusive Double-Opt-in.

**Bitte prüf das mit einer eigenen Testanmeldung,** bevor du den Schalter umlegst. Lieber
einmal selbst durchklicken als beim ersten echten Mann merken, dass nichts ankommt.

## 3. Was in Supabase ankommt

Ein neues Feld in der Datenbank war nicht nötig. Alles liegt in `onboarding_data`, so wie
es der Starter auch macht. Eine Anmeldung aus dem Kreis sieht so aus:

```json
{
  "kreis_stufe": "gefuehle",
  "kreis_stufe_nr": 2,
  "kreis_erledigt": ["verhalten", "gefuehle"],
  "kreis_antworten": ["genervt", "unter Druck", "wütend", "gereizt"],
  "kreis_weiter_link": "https://www.shiftmyhorizon.com/kreis?weiter=alarm",
  "flow": "kreis_flow",
  "access_code": "AB12-CD34",
  "utm_source": null, "utm_medium": null, "utm_campaign": null, "via": null,
  "referrer": null,
  "landed_at": "2026-10-22T11:51:02.158Z",
  "eigenverantwortung_bestaetigt": true
}
```

`p_source` ist `kreis_flow`. Daran erkennst du die Leute aus dem Kreis.

Falls du später danach filtern willst, ohne jedes Mal ins JSON zu greifen, reicht ein
Index. Das ist optional und eilt nicht:

```sql
create index if not exists leads_kreis_stufe_idx
  on leads ((onboarding_data->>'kreis_stufe'))
  where onboarding_data->>'kreis_stufe' is not null;
```

## 4. Datenschutzerklärung

In `datenschutz.html` fehlt der Kreis noch. Es gilt dasselbe wie beim Starter: Vorname,
E-Mail, gewählter Kanal, dazu die angetippten Antworten und die Stufe. WhatsApp und
Telegram stehen schon drin. Der Satz auf den Seiten verweist bereits auf die
Datenschutzerklärung, der Absatz dort muss nur nachgezogen werden.

## 5. Das Video auf `/kreis`

Im Hero von `kreis/index.html` steht ein Platzhalter für das Intro-Video. Das Skript dafür
liegt im Drive unter `02-SKRIPTE/00-DREHFERTIG/TELEPROMPTER/LP05 Landingpage Kreis TELEPROMPTER v1.docx`.
Wenn die Datei fertig ist, trägst du sie hier ein:

```html
<div class="vsl vsl--vertical" data-src="media/kreis-intro.mp4" data-poster="media/kreis-intro.jpg">
```

Solange `data-src` leer ist, blendet die Seite den Platzhalter von selbst aus. Es sieht
also auch ohne Video fertig aus.

## 6. Wenn der Kreis nach außen gehen soll

Die Seiten stehen auf `noindex,nofollow`, genau wie `/fokus` und `/nacht`. Das ist Absicht,
solange du sie nur aus Videos und aus der Bio heraus verlinkst. Wenn der Kreis über Google
gefunden werden soll, muss die Zeile raus.

Was du dann noch setzt:

* Bio-Link und angepinnter Kommentar auf `https://www.shiftmyhorizon.com/kreis`.
* In jeder Videobeschreibung die Stufe, um die es im Video geht, also zum Beispiel
  `https://www.shiftmyhorizon.com/kreis/gefuehle`. Jede Stufe steht für sich, man muss
  nicht vorne anfangen.
* Falls du Kurzlinks willst wie bei `/ig` und `/yt`: eine Zeile in `vercel.json`, nach
  demselben Muster wie die bestehenden.

---

## Was ich bewusst nicht gemacht habe

* **Kein bestehendes Make-Szenario angefasst**, auch keins dupliziert.
* **Kein Schema in Supabase geändert**, keine Spalte, keine RPC.
* **Keine bestehende Seite geändert.** Weder `index.html` noch `fokus.html`,
  `abschalten.html`, `nacht.html`, `termin.html` oder `session.html`. `tokens.css` und
  `components.css` sind unverändert; der Kreis bringt sein eigenes `kreis/kreis.css` mit.
* **Keine Preise, keine Potenzialsession** auf den Kreis-Seiten. Die beiden Programme
  kommen nur am Ende von `/kreis/wofuer` vor, als Hinweis, ohne Preis.
