# Stripe-Kauf einrichten

Der Code für Hosted Checkout, Webhook und Zugang liegt im Repo. Ohne die Variablen unten bleibt der Kauf zu. Es wird kein Betrag angezeigt und kein Button „Weiter zu Stripe“ eingeblendet. Preise legt diese Datei nicht fest.

Die vier kostenlosen Tage sind der bestehende Einstieg auf den alten Seiten. Sie sind keine Stripe-Testphase. Ein Price mit `trial_period_days` wird abgelehnt.

## Variablen

Nur Namen. Werte gehören in den Secret-Speicher des Hosts, nicht ins Repo.

- `STRIPE_RESTRICTED_KEY` — Restricted Key, serverseitig. Live-Keys (`rk_live_` oder `sk_live_`) tun nichts, solange `STRIPE_ALLOW_LIVE` nicht `1` ist.
- `STRIPE_ALLOW_LIVE` — erst `1`, wenn wirklich live kassiert werden soll.
- `STRIPE_WEBHOOK_SECRET` — Signaturgeheimnis des Webhook-Endpunkts.
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — nur der Service-Role-Schlüssel. Damit schreibt der Server in `stripe_bestellungen` und `stripe_ereignisse`. Der anon-Schlüssel reicht nicht.
- `SITE_ORIGINS` — erlaubte Origins, kommagetrennt. Voreinstellung ist `https://www.shiftmyhorizon.com`.
- `STRIPE_PRICE_INTEGRATED_MAN`
- `STRIPE_PRICE_LOVING_WOMAN`
- `STRIPE_PRICE_CAREER_POWER`
- `STRIPE_PRICE_ELITE_CLOSER`
- `STRIPE_PRICE_LIGHTNESS`
- `STRIPE_PRICE_INTEGRATED_SOUL`
- `STRIPE_PRICE_PARENT_IN_PEACE`
- `STRIPE_PRICE_CONNECTED_COUPLES`

Jede Variable ist eine Stripe-Price-ID (`price_…`) für genau dieses Angebot. Die Price des Abschalt-Berichts (`price_1UZCohDtpOTBAOYvpXhJYOxU`) wird abgelehnt. Betrag, Währung und einmalig oder monatlich liest der Server von dieser Price. Der Browser kann sie nicht setzen.

## Datenbank

Migration `supabase/migrations/20261108170000_stripe_bestellungen.sql` anlegen, nicht gegen Produktion aus diesem Arbeitslauf. Sie ist wiederholbar (`if not exists`, `add column if not exists`). Row Level Security ist an. `public`, `anon` und `authenticated` haben keine Rechte. Schreiben kann der Service-Role-Schlüssel, weil der RLS umgeht. Leads, `has_paid` und Digistore bleiben unberührt.

## Webhook

Endpunkt: `https://www.shiftmyhorizon.com/api/stripe-webhook`

Der Handler liest den Rohbody und prüft `Stripe-Signature`. Ein Ereignis wird erst nach erfolgreicher Verarbeitung in `stripe_ereignisse` geschrieben. Schlägt die Verarbeitung fehl, bleibt das Ereignis offen und Stripe kann es wiederholen. Zwei gleiche Ereignisse ändern den Zugangscode nicht. Bestellungen mit derselben `anfrage_id` laufen über den Unique-Index.

Ereignisse: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`, `radar.early_fraud_warning.created`.

Zugang nur bei `payment_status` `paid` und wenn Modus, Währung, `amount_total` und Price zur gespeicherten Bestellung passen. `unpaid` gibt keinen Zugang. `trialing` gibt keinen Zugang. Eine offene Folgerechnung lässt bestehenden Zugang stehen, solange Stripe das Abo nicht beendet. Vollständige Erstattung, Streit und Betrugswarnung nehmen den Zugang. Die Erfolgsseite liest nur den gespeicherten Status.

Das Kundenportal braucht eine Portal-Konfiguration im Stripe-Dashboard. Ohne sie antwortet „Abo verwalten“ mit einem Fehler. Der Aufruf braucht die E-Mail und den Zugangscode derselben Bestellung.

## Was der Kauf nicht selbst tut

Er ruft `register_direct_buyer` nicht auf und setzt `has_paid` nicht. Damit geht keine Morgenmail raus und ein Digistore-Kunde wird nicht verändert. Der Zugangscode erscheint erst nach bestätigter Zahlung.
