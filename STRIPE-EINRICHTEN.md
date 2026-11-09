# Stripe-Kauf einrichten

Der Code für Hosted Checkout, Webhook und Zugang liegt im Repo. Die Price-IDs unten sind öffentlich und gelten, wenn die Umgebungsvariable leer ist. Der Kauf bleibt trotzdem zu, bis Restricted Key, Webhook-Geheimnis und eine Live-Abfrage der Price zusammen passen. Ohne das gibt es keinen Betrag und keinen Button „Weiter zu Stripe“.

Jedes Programm kostet 19 € pro Monat, monatlich kündbar. Der Server zeigt diesen Satz und öffnet den Checkout nur, wenn die Price genau so ist: Währung `eur`, `unit_amount` 1900, `recurring.interval` `month`, `interval_count` 1, kein `trial_period_days`, `active`. Alles andere bleibt zu.

Die vier kostenlosen Tage sind der bestehende Einstieg. Sie sind keine Stripe-Testphase.

Kündigen geht über das Stripe-Kundenportal. Der Aufruf prüft E-Mail und Zugangscode und öffnet die Kündigung dieses Abos. Im Portal muss die Kündigung auf das Periodenende gestellt sein, nicht sofort. Der Webhook setzt `cancel_at_period_end` und beendet den Zugang zu `current_period_end`.

## Variablen

Nur Namen. Werte gehören in den Secret-Speicher des Hosts, nicht ins Repo.

- `STRIPE_RESTRICTED_KEY` — Restricted Key, serverseitig. Live-Keys (`rk_live_` oder `sk_live_`) tun nichts, solange `STRIPE_ALLOW_LIVE` nicht `1` ist.
- `STRIPE_ALLOW_LIVE` — erst `1`, wenn wirklich live kassiert werden soll.
- `STRIPE_WEBHOOK_SECRET` — Signaturgeheimnis des Webhook-Endpunkts.
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — nur der Service-Role-Schlüssel. Damit schreibt der Server in `stripe_bestellungen` und `stripe_ereignisse`. Der anon-Schlüssel reicht nicht.
- `SITE_ORIGINS` — erlaubte Origins, kommagetrennt. Voreinstellung ist `https://www.shiftmyhorizon.com`.
Live-Price-IDs, Konto `acct_1TAGbfDtpOTBAOYv`. Lookup-Keys sind nicht gesetzt und werden nicht benutzt. `gender` ist `maenner`, `frauen`, `eltern` oder `paare`.

- `STRIPE_PRICE_PORN_RECOVERY` = `price_1UZw2NDtpOTBAOYv8RVT67E9`
- `STRIPE_PRICE_GETTINGGIRLS` = `price_1UZw2TDtpOTBAOYvtVfXUWnt`
- `STRIPE_PRICE_MENS_RELATIONSHIP` = `price_1UZw2YDtpOTBAOYvCFBgq3jC`
- `STRIPE_PRICE_CAREER` = `price_1UZw2aDtpOTBAOYv3l6udwEM`
- `STRIPE_PRICE_SALES` = `price_1UZw2eDtpOTBAOYvptYhaSSC`
- `STRIPE_PRICE_MAIN_CHARACTER` = `price_1UZw2fDtpOTBAOYvT837qXfq`
- `STRIPE_PRICE_HIGH_VALUE_DATING` = `price_1UZw2hDtpOTBAOYv1Ljo9eIK`
- `STRIPE_PRICE_HEARTBREAK` = `price_1UZw2jDtpOTBAOYvEFmBrw2N`
- `STRIPE_PRICE_LEICHTIGKEIT` = `price_1UZw2mDtpOTBAOYvZLpYmvN2`
- `STRIPE_PRICE_SECULAR` = `price_1UZw2oDtpOTBAOYvXHxSSeDx`
- `STRIPE_PRICE_PARENTING_LOOP` = `price_1UZw2qDtpOTBAOYvkIsklqW8`
- `STRIPE_PRICE_PARENTAL_BURNOUT` = `price_1UZw2sDtpOTBAOYvUQTPNt5m`
- `STRIPE_PRICE_CONFLICT_TO_CONNECTION` = `price_1UZw2vDtpOTBAOYvKc2P30Oh`
- `STRIPE_PRICE_FAIRPLAY` = `price_1UZw2xDtpOTBAOYvNit0BTtm`

Eine gesetzte Variable ersetzt die Vorgabe. Die Price des Abschalt-Berichts wird abgelehnt. Der Browser kann Betrag und Rhythmus nicht setzen.

## Datenbank

Migration `supabase/migrations/20261108170000_stripe_bestellungen.sql` anlegen, nicht gegen Produktion aus diesem Arbeitslauf. Sie ist wiederholbar (`if not exists`, `add column if not exists`). Row Level Security ist an. `public`, `anon` und `authenticated` haben keine Rechte. Schreiben kann der Service-Role-Schlüssel, weil der RLS umgeht. Leads, `has_paid` und Digistore bleiben unberührt.

## Webhook

Endpunkt: `https://www.shiftmyhorizon.com/api/stripe-webhook`

Der Handler liest den Rohbody und prüft `Stripe-Signature`. Ein Ereignis wird erst nach erfolgreicher Verarbeitung in `stripe_ereignisse` geschrieben. Schlägt die Verarbeitung fehl, bleibt das Ereignis offen und Stripe kann es wiederholen. Zwei gleiche Ereignisse ändern den Zugangscode nicht. Bestellungen mit derselben `anfrage_id` laufen über den Unique-Index.

Ereignisse: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`, `radar.early_fraud_warning.created`.

Zugang nur bei `payment_status` `paid` und wenn Modus, Währung, `amount_total` und Price zur gespeicherten Bestellung passen. `unpaid` gibt keinen Zugang. `trialing` gibt keinen Zugang. Eine offene Folgerechnung lässt bestehenden Zugang stehen, solange Stripe das Abo nicht beendet. Vollständige Erstattung, Streit und Betrugswarnung nehmen den Zugang. Die Erfolgsseite liest nur den gespeicherten Status.

Das Kundenportal braucht eine Portal-Konfiguration im Stripe-Dashboard. Ohne sie antwortet „Abo verwalten“ mit einem Fehler. Der Aufruf braucht die E-Mail und den Zugangscode derselben Bestellung.

## Was noch fehlt

1. Restricted Key im Stripe-Dashboard anlegen, nur für diesen Server. Der Code ruft auf: Prices lesen, Checkout Sessions anlegen und lesen, Customers anlegen (macht die Session), Subscriptions lesen, Invoices lesen, Charges lesen, Portal-Session anlegen. Live-Key (`rk_live_`) bleibt wirkungslos, bis `STRIPE_ALLOW_LIVE` = `1` ist.
2. Webhook anlegen auf `https://www.shiftmyhorizon.com/api/stripe-webhook`. Ereignisse: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`, `radar.early_fraud_warning.created`. Das Signaturgeheimnis ist `STRIPE_WEBHOOK_SECRET`.
3. In Vercel eintragen: `STRIPE_RESTRICTED_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_ALLOW_LIVE`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_ORIGINS`. Die Price-IDs dürfen leer bleiben, der Code kennt die Vorgabe.
4. Migration `supabase/migrations/20261108170000_stripe_bestellungen.sql` auf das Projekt anwenden.
5. Im Stripe-Kundenportal die Kündigung auf das Periodenende stellen, nicht auf sofort.

Ein Agent mit Stripe- und Supabase-Zugang kann Schritt 2, 4 und 5 machen, sobald er darf. Den Restricted Key und die Vercel-Variablen trägt Janosch ein. Dieser Lauf hat Stripe nicht angefasst und die Migration nicht angewendet.

## Was der Kauf nicht selbst tut

Er ruft `register_direct_buyer` nicht auf und setzt `has_paid` nicht. Damit geht keine Morgenmail raus und ein Digistore-Kunde wird nicht verändert. Der Zugangscode erscheint erst nach bestätigter Zahlung.
