# Was du noch einrichten musst, damit Clear State läuft

Stand 24.10.2026. Öffentlicher Name: Clear State. Tagline: Im Job im Flow. Abends wirklich aus.
Die Seiten liegen in `clear-state/`. Skripte und CSS bleiben in `kreis/`. Die öffentliche Adresse ist `/clear-state`. `/kreis` leitet dorthin um.
`KREIS_FLOW_AKTIV` ist `true`, damit die Seiten sichtbar sind. `CHECK_MAIL_AKTIV` bleibt `false`: keine Mail-Sperre.

**An Make und an Supabase wurde nichts geändert.** Die Seiten liegen im Ordner `kreis/`.
Öffentlich heißen sie Clear State und sind über `/clear-state` erreichbar. Von der Startseite führt ein Link hin.

---

## Die zwei Schalter in kreis.js

Ganz oben in `kreis/kreis.js`:

```js
var KREIS_FLOW = "kreis_flow";
var KREIS_FLOW_AKTIV = true;    // Seiten sichtbar
var CHECK_MAIL_AKTIV = false;   // keine Mail-Sperre
var BEWERBUNG_AKTIV = false;    // auf true, wenn die Bewerbung offen ist
var MAGNET = "kreis";
```

**KREIS_FLOW_AKTIV steht auf true.** Die Seiten sind sichtbar. Bei einer freiwilligen Eintragung
läuft zusätzlich `register_lead` für `kreis_flow`. `CHECK_MAIL_AKTIV` bleibt false. Es gibt keine Mail-Sperre vor den Schritten.

**BEWERBUNG_AKTIV auf false** heißt: Der Hinweis auf die Bewerbung bleibt ausgeblendet.
Er steht nur im Abschluss „Alle sieben durch“ und nennt weder Preis noch Plätze noch
Datum. Auf `true` erst, wenn du die Bewerbung wirklich aufmachst.

---

## 1. Supabase: die Inhalte für `kreis_flow`

Sieben Nachrichten in `flow_content`, eine pro Schritt. Die Texte schreibst du oder ich,
das ist noch nichts gebaut. Aufbau wie bei den bestehenden Flows:

| Schritt | Inhalt der Nachricht |
|---|---|
| 1 Verhalten | seine Wenn-Dann-Regel aufgreifen |
| 2 Gefühle | seine zwei Wörter |
| 3 Alarm und Planer | Hände flach, ein Wort, eine Uhrzeit |
| 4 Innere Ruhe | die Minute runterfahren und der Zettel |
| 5 Der Satz | sein Satz |
| 6 Werte | sein Wert und was er gekostet hat |
| 7 Für wen | sein Termin für die Woche |

**Die Reihenfolge ist nicht fest.** Er fängt da an, wo es ihn nervt, und läuft von dort
der Reihe nach weiter. Nach Schritt 7 geht es wieder bei 1 los. Wer bei 4 anfängt,
bekommt also 4, 5, 6, 7, 1, 2, 3. Die Nachricht darf deshalb nicht „Tag 1 von 7“ sagen,
sondern muss sich auf den Schritt beziehen, der in `kreis_stufe` steht.

**Der Weiter-Link gehört in jede Nachricht.** Er steht fertig in
`onboarding_data.kreis_weiter_link` und sieht so aus:
`https://www.shiftmyhorizon.com/kreis?weiter=<schritt>`. Die Schritte heißen
`verhalten`, `gefuehle`, `alarm`, `ruhe`, `satz`, `werte`, `wofuer`.

## 2. Make: ein eigenes Szenario für den Kreis

Wer über den Kreis kommt, darf **keine** Mails aus den Feierabend-Vorlagen bekommen.
Dafür steht in `onboarding_data` das Feld `magnet` auf `kreis`, und `p_source` ist
`kreis_flow`. Beides kannst du im Filter verwenden.

* Ein eigenes Szenario für `magnet = kreis`.
* In den bestehenden Szenarien einen Filter ergänzen, der `magnet = kreis` ausschließt.
* Eine eigene WhatsApp-Vorlage, von Meta freigegeben. Die Starter-Vorlage passt nicht,
  weil darin von drei Tagen die Rede ist.
* Telegram braucht nichts Neues, der Bot bekommt dieselbe vorbereitete Nachricht.
* E-Mail läuft über denselben Weg wie der Starter, inklusive Double-Opt-in.

**Bitte prüf das mit einer eigenen Testanmeldung,** bevor du den Schalter umlegst.

## 3. Was in Supabase ankommt

Kein neues Feld in der Datenbank nötig. Alles liegt in `onboarding_data`:

```json
{
  "magnet": "kreis",
  "kreis_problem": "nachts",
  "kreis_start": "ruhe",
  "kreis_stufe": "ruhe",
  "kreis_stufe_nr": 4,
  "kreis_erledigt": ["ruhe"],
  "kreis_antworten": ["An das Meeting morgen früh"],
  "kreis_mitnehmen": "Offen: Angebot für Meier. Dran: morgen um 9.",
  "kreis_weiter_link": "https://www.shiftmyhorizon.com/kreis?weiter=satz",
  "flow": "kreis_flow",
  "access_code": "AB12-CD34",
  "utm_source": null, "utm_medium": null, "utm_campaign": null, "via": null,
  "referrer": null,
  "landed_at": "2026-10-23T12:51:02.158Z",
  "eigenverantwortung_bestaetigt": true
}
```

`kreis_problem` ist einer von acht Werten: `abends`, `nachts`, `laut`, `fokus`, `puls`,
`handy`, `vorsatz`, `aufhoeren`. Daran siehst du, womit die Leute reinkommen und welche
der acht Türen sich lohnt.

`kreis_mitnehmen` ist der Satz, den er sich selbst geschrieben hat. Den kannst du in der
Nachricht zitieren, das ist der stärkste Aufhänger, den du hast.

Optionaler Index, falls du später danach filtern willst:

```sql
create index if not exists leads_kreis_idx
  on leads ((onboarding_data->>'magnet'), (onboarding_data->>'kreis_stufe'))
  where onboarding_data->>'magnet' = 'kreis';
```

## 4. Datenschutzerklärung

In `datenschutz.html` fehlt der Kreis noch. Es gilt dasselbe wie beim Starter, plus zwei
Sachen: die angetippten Antworten und der Satz, den er sich in der Übung selbst
geschrieben hat. Beides wird mitgespeichert, sobald er sich einträgt. Vorher liegt alles
nur in seinem Browser.

## 5. Links auf die anderen kostenlosen Seiten

Nach dem Mitnehmen erscheint höchstens ein Hinweis, und nur, wenn er zu dem passt, was er
oben angetippt hat. Alle vier Ziele sind geprüft und live:

| Angetippt | Nach Schritt | Seite |
|---|---|---|
| Ich wach nachts auf und denk an die Arbeit | 4 Innere Ruhe | `/nacht` |
| Vor wichtigen Terminen bin ich total angespannt | 3 Alarm und Planer | `/termin` |
| Ich krieg mich bei der Arbeit nicht konzentriert | 3 Alarm und Planer | `/fokus` |
| Abends geht mein Kopf nicht aus | 4 Innere Ruhe | `/abschalten` |
| Ich hör abends einfach nicht auf zu arbeiten | 5 Der Satz | `/abschalten` |

## 6. Das Video für /kreis

Das Skript im Drive (`02-SKRIPTE/00-DREHFERTIG/TELEPROMPTER/LP05 Landingpage Kreis
TELEPROMPTER v1.docx`) beschreibt noch die alte Fassung, in der man vorne anfängt. Vor
dem Dreh muss es auf den neuen Einstieg umgeschrieben werden: nicht „fang beim ersten
Schritt an“, sondern „tipp an, was dich gerade am meisten nervt“.

Auf der Seite ist gerade kein Videokasten eingebaut, weil der Einstieg ganz oben stehen
soll. Wenn du einen willst, sag Bescheid, dann setze ich ihn unter den Einstieg.

## 7. Wenn der Kreis nach außen gehen soll

Die Seiten stehen auf `noindex,nofollow`, genau wie `/fokus` und `/nacht`. Wenn der Kreis
über Google gefunden werden soll, muss die Zeile raus.

* Bio-Link und angepinnter Kommentar auf `https://www.shiftmyhorizon.com/kreis`.
* In jeder Videobeschreibung der Schritt, um den es im Video geht, zum Beispiel
  `https://www.shiftmyhorizon.com/kreis/gefuehle`. Wer direkt dort einsteigt, bekommt den
  Schritt automatisch als seinen Startpunkt.
* Falls du Kurzlinks willst wie `/ig` und `/yt`: eine Zeile in `vercel.json`.

---

## Was ich bewusst nicht gemacht habe

* **Kein bestehendes Make-Szenario angefasst**, auch keins dupliziert.
* **Kein Schema in Supabase geändert**, keine Spalte, keine RPC, kein Formular-Verhalten.
* **Keine bestehende Seite geändert.** `tokens.css` und `components.css` sind unverändert,
  der Kreis bringt sein eigenes `kreis/kreis.css` mit. Auf `/nacht`, `/termin`, `/fokus`
  und `/abschalten` wird nur verlinkt.
* **Keine Preise, keine Potenzialsession, kein FOKUS-Codewort.** „Fahr dich runter“ wird
  in einem Satz erwähnt, erst ab Schritt 4, ohne Preis und ohne Button.
* **Keine Zahl ohne geprüfte Quelle.** Bei HRV steht keine eigene Messung von dir, nur
  das, was die Übersichtsarbeiten hergeben.
