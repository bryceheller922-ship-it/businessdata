# FeedbackPalace

FeedbackPalace monitors tracked competitors for public, high-frustration social mentions and turns them into an actionable lead feed.

## Stack

Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Stripe Checkout, and Vercel Cron.

## Local setup

1. Install Node.js 20+ and run `npm install`.
2. Create a Supabase project. In its SQL editor, run `supabase/migrations/202610240001_feedbackpalace.sql` (or apply it with the Supabase CLI).
3. Copy `.env.example` to `.env.local` and fill in Supabase project URL, anon key, service-role key, and strong random values for `INGEST_API_SECRET` and `CRON_SECRET`. Keep service role, Stripe, and webhook keys server-only.
4. In Supabase Auth settings set the site URL to your app origin and allow `/auth/callback` as a redirect if using email-confirmation flows. Email/password auth is implemented.
5. Run `npm run dev`; production uses `npm run build` and `npm start`.

The ingestion API uses an OpenAI structured-JSON classifier when `OPENAI_API_KEY` is configured. It has a local lightweight keyword scorer fallback so development ingestion works without an LLM. Send an authenticated POST to `/api/ingest-leads` with `Authorization: Bearer $INGEST_API_SECRET` and a JSON array, e.g. `[ {"competitor":"Acme","platform":"x","handle":"@public_handle","url":"https://x.com/example/status/1","text":"The app is down again and support still has not responded."} ]`. Each mention must map to a competitor name monitored by a user. Publicly available posts only; comply with platform terms and privacy requirements.

The cron handler at `/api/cron/match-alert` requires `Authorization: Bearer $CRON_SECRET`. Vercel supplies `CRON_SECRET` as the authorization bearer automatically for configured crons. It flags qualifying new leads in `lead_alerts` and returns user/email/count details; it does not send an email (wire an email provider before representing alerts as email delivery).

For paid unlocks, configure `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` (a recurring price), `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_APP_URL`. Register a Stripe webhook pointing to `/api/stripe/webhook` and subscribe to `checkout.session.completed` and `customer.subscription.deleted`. Checkout creates a subscription; successful webhook delivery creates per-user `lead_unlocks` and subscription records. The service-role key is only used in server routes.

## Security and data model

The migration defines profile, competitor, lead, subscription, lead-alert, and per-user lead-unlock tables with FK constraints and indexes. RLS isolates user-owned competitors, profiles, subscriptions, alert rows, and unlock rows. The `get_leads()` RPC masks handle and URL at the database layer unless the lead is individually unlocked or the user has a valid premium subscription. The lead source fields must not be selected directly in browser-facing queries; use that RPC. Ingestion and billing writes use the server-only Supabase service key.

## Deployment

Import the repository into Vercel, configure the environment variables listed in `.env.example`, deploy, and set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin. Vercel Cron is declared in `vercel.json`. Apply the SQL migration to the linked Supabase project before enabling production traffic. Configure Stripe webhook delivery and test signup, RLS, checkout, and webhook flows in Stripe test mode before going live.
