# Was du noch einrichten musst, damit der Kreis läuft

Stand 22.10.2026. Gehört zu den Seiten unter `/kreis`.

**An Make, an Supabase und an bestehenden Seiten wurde nichts geändert.** Die Kreis-Seiten
sind neu, liegen alle im Ordner `kreis/` und sind von keiner anderen Seite aus verlinkt.
Niemand kommt da zufällig hin, solange du keinen Link setzt.

---

## Das Wichtigste zuerst

In `kreis/kreis.js` steht ganz oben:

```js
var KREIS_FLOW = "kreis_flow";
var KREIS_FLOW_AKTIV = false;   // auf true stellen, wenn Flow und Make stehen
var MAGNET = "kreis";
```

Solange `KREIS_FLOW_AKTIV` auf `false` steht, passiert bei einer Anmeldung Folgendes:

* Der Lead landet über `register_tripwire_lead` in Supabase, mit Vorname, E-Mail, Kanal,
  Zugangscode, seinem angetippten Problem, der Ebene und dem, was er sich dort notiert hat.
* Du bekommst die Hinweis-Mail über die bestehende Edge Function `notify-form`.
* Es wird **kein** Ablauf angelegt. Also kann auch kein Make-Szenario über einen Flow
  stolpern, den es noch nicht gibt.

Erst wenn Punkt 1 und 2 unten erledigt sind, stellst du den Schalter auf `true`.

---

## 1. Supabase: die Inhalte für `kreis_flow`

Es braucht sieben Nachrichten in `flow_content`, eine pro Ebene. Die Texte schreibst du
oder ich, das ist noch nichts gebaut. Aufbau wie bei den bestehenden Flows:

| Ebene | Inhalt der Nachricht |
|---|---|
| 1 Verhalten | seine Wenn-Dann-Regel aufgreifen, Link auf die nächste Ebene |
| 2 Gefühle | die zwei Wörter aufgreifen |
| 3 Alarm und Planer | Hände flach, ein Wort, eine Uhrzeit |
| 4 Innere Ruhe | die Minute zum Umschalten und der Zettel |
| 5 Der Satz, der dich nicht aufhören lässt | sein Satz |
| 6 Werte | sein Wert und die Rechnung dazu |
| 7 Für wen | sein Termin für die Woche |

**Achtung, die Reihenfolge ist nicht fest.** Er fängt da an, wo es bei ihm drückt, und
läuft von dort der Reihe nach weiter. Nach Ebene 7 geht es wieder bei 1 los. Wer bei
4 anfängt, bekommt also 4, 5, 6, 7, 1, 2, 3. Die Nachricht darf deshalb nicht „Tag 1 von 7“
sagen, sondern muss sich auf die Ebene beziehen, die in `kreis_stufe` steht.

**Der Weiter-Link gehört in jede Nachricht.** Er steht fertig in
`onboarding_data.kreis_weiter_link` und sieht so aus:
`https://www.shiftmyhorizon.com/kreis?weiter=<ebene>`. Die Übersicht schickt ihn dann
direkt zu der Ebene, die bei ihm dran ist. Die Ebenen heißen
`verhalten`, `gefuehle`, `alarm`, `ruhe`, `satz`, `werte`, `wofuer`.

## 2. Make: ein eigenes Szenario für den Kreis

Wer über den Kreis kommt, darf **keine** Mails aus den Feierabend-Vorlagen bekommen.
Dafür steht in `onboarding_data` das Feld `magnet` auf `kreis`, und `p_source` ist
`kreis_flow`. Beides kannst du im Filter verwenden.

Was zu bauen ist:

* Ein eigenes Szenario für `magnet = kreis`. Es darf die bestehenden Feierabend-Szenarien
  nicht mitbenutzen.
* In den bestehenden Szenarien einen Filter ergänzen, der `magnet = kreis` ausschließt,
  damit niemand doppelt beschickt wird.
* Eine eigene WhatsApp-Vorlage für die Kreis-Nachrichten, von Meta freigegeben. Die
  Starter-Vorlage passt nicht, weil darin von drei Tagen die Rede ist.
* Telegram braucht nichts Neues. Der Bot `shift_my_horizon_bot` bekommt dieselbe
  vorbereitete Nachricht mit dem Zugangscode wie beim Starter.
* E-Mail läuft über denselben Weg wie der Starter, inklusive Double-Opt-in.

**Bitte prüf das mit einer eigenen Testanmeldung,** bevor du den Schalter umlegst.

## 3. Was in Supabase ankommt

Ein neues Feld in der Datenbank war nicht nötig. Alles liegt in `onboarding_data`, so wie
es der Starter auch macht. Eine Anmeldung aus dem Kreis sieht so aus:

```json
{
  "magnet": "kreis",
  "kreis_problem": "nachts",
  "kreis_start": "ruhe",
  "kreis_stufe": "ruhe",
  "kreis_stufe_nr": 4,
  "kreis_erledigt": ["ruhe"],
  "kreis_antworten": ["Auf dem Weg nach Hause spielst du ein Gespräch nochmal durch"],
  "kreis_mitnehmen": "Offen: Angebot für Meier. Dran: morgen um 9.",
  "kreis_weiter_link": "https://www.shiftmyhorizon.com/kreis?weiter=satz",
  "flow": "kreis_flow",
  "access_code": "AB12-CD34",
  "utm_source": null, "utm_medium": null, "utm_campaign": null, "via": null,
  "referrer": null,
  "landed_at": "2026-10-22T12:51:02.158Z",
  "eigenverantwortung_bestaetigt": true
}
```

`kreis_problem` ist einer von acht Werten: `abends`, `nachts`, `laut`, `fokus`, `puls`,
`handy`, `vorsatz`, `aufhoeren`. Daran siehst du, womit die Leute reinkommen, und welche
der acht Türen sich lohnt.

`kreis_mitnehmen` ist der Satz, den er sich selbst geschrieben hat. Den kannst du in der
Nachricht zitieren, das ist der stärkste Aufhänger, den du hast.

Falls du später filtern willst, ohne ins JSON zu greifen, reicht ein Index. Optional:

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

## 5. Das Video auf `/kreis`

Für `/kreis` liegt ein Skript im Drive unter
`02-SKRIPTE/00-DREHFERTIG/TELEPROMPTER/LP05 Landingpage Kreis TELEPROMPTER v1.docx`.
Es beschreibt noch die alte Fassung, in der man vorne anfängt. Wenn du es drehst, muss der
Text auf den neuen Einstieg umgeschrieben werden: nicht „fang beim ersten Schritt an“,
sondern „tipp an, wo es bei dir drückt“.

Auf der Seite ist gerade kein Videokasten eingebaut. Wenn du einen willst, sag Bescheid,
dann setze ich ihn über den Einstieg, so wie auf `/fokus`.

## 6. Wenn der Kreis nach außen gehen soll

Die Seiten stehen auf `noindex,nofollow`, genau wie `/fokus` und `/nacht`. Das ist Absicht,
solange du sie nur aus Videos und aus der Bio heraus verlinkst. Wenn der Kreis über Google
gefunden werden soll, muss die Zeile raus.

Was du dann noch setzt:

* Bio-Link und angepinnter Kommentar auf `https://www.shiftmyhorizon.com/kreis`.
* In jeder Videobeschreibung die Ebene, um die es im Video geht, also zum Beispiel
  `https://www.shiftmyhorizon.com/kreis/gefuehle`. Jede Ebene steht für sich. Wer direkt
  dort einsteigt, bekommt sie automatisch als seinen Startpunkt gesetzt.
* Falls du Kurzlinks willst wie bei `/ig` und `/yt`: eine Zeile in `vercel.json`, nach
  demselben Muster wie die bestehenden.

---

## Was ich bewusst nicht gemacht habe

* **Kein bestehendes Make-Szenario angefasst**, auch keins dupliziert.
* **Kein Schema in Supabase geändert**, keine Spalte, keine RPC.
* **Keine bestehende Seite geändert.** Weder `index.html` noch `fokus.html`,
  `abschalten.html`, `nacht.html`, `termin.html` oder `session.html`. `tokens.css` und
  `components.css` sind unverändert; der Kreis bringt sein eigenes `kreis/kreis.css` mit.
  Auf `/nacht` und `/termin` wird nur verlinkt, dort ist nichts verändert.
* **Keine Preise, keine Potenzialsession** auf den Kreis-Seiten. Stufe 1 „Fahr dich runter“
  wird in einem Satz erwähnt, und zwar erst ab der Ebene „Innere Ruhe“, ohne Preis.
* **Keine Zahl ohne geprüfte Quelle.** Die TK-Zahlen stehen nur im Quellenblock, im Text
  steht die Aussage ohne Zahl, so wie im Auftrag beschrieben.
