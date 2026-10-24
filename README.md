# Vouch.School

Anonymous campus compliment/superlative brackets — built with Next.js 14 (App Router), Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), and Vercel.

Students pick their campus, vote in daily anonymous brackets, receive compliments, and unlock anonymous hints about who voted for them by sharing to their Instagram Story.

## Repository structure

```
supabase/schema.sql      # Full PostgreSQL schema + RLS + RPC functions
app/                     # Next.js App Router pages & API routes
components/              # UI primitives, voting, inbox, viral share
lib/supabase/            # Browser + server Supabase clients
middleware.ts            # Auth session middleware
next.config.js           # Asset caching headers
vercel.json              # Vercel deployment config
.env.example             # Copy to .env.local and fill in
```

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and paste the entire contents of `supabase/schema.sql`. Run it.
   - Creates `schools`, `profiles`, `polls`, `votes`, `reveals`, `shares`
   - Seeds 4 demo schools and 4 active polls per school
   - Enables **Row Level Security** on every table
   - `votes` has **no SELECT policy** — raw ballots are never readable by any role. Votes are cast and aggregated only through the `cast_vote` security-definer RPC.
   - `create_share`, `unlock_hint`, `get_my_compliments` RPCs power the viral loop.
3. Go to **Authentication > Providers** and enable **Email** (you can add Instagram OAuth later via Custom OAuth).
4. Copy **Project Settings > API** values:

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL
```

## 2. Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Sign up with a school email, pick a campus, and start voting.

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel (framework preset: Next.js).
3. Add the environment variables from `.env.example` in **Project Settings > Environment Variables**.
4. Deploy. In **Settings > Domains**, add your custom domain (e.g. `vouch.school`).
5. In Supabase, add your Vercel domain to **Authentication > URL Configuration > Site URL** and **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`

`vercel.json` already configures cache headers for `_next/static`, the `/api/og` edge route, and share pages.

## 4. How the viral loop works

1. User receives a compliment in **Inbox** with a lock icon: "Reveal a hint about who voted".
2. Tapping it opens the share modal → "Generate share link" calls the `create_share` RPC, which mints a `share_token`.
3. The modal renders `https://app/share/<token>` plus a link to `/api/og/poll?token=...`, which generates a high-contrast personalized OG image (question, school, sender) via `@vercel/og`.
4. User posts to Instagram Story (native share or copy link).
5. Tapping "I shared it — unlock hint" calls `unlock_hint`, which verifies a share row exists, derives an anonymous hint from one voter's profile (gender / grade / initial of handle), writes it to `reveals`, and returns it — without ever exposing voter identity.

## 5. Anonymous voting guarantees

- `votes` has **no SELECT RLS policy** — neither authenticated users nor the public can read `voter_id`.
- `cast_vote` runs `security definer`, validates that voter and nominee share the same `school_id` and that the poll is active, inserts one ballot per voter per poll, and returns **only** the nominee's aggregate vote count.
- Compliments in the inbox come from `get_my_compliments`, which returns vote counts + unlocked hints only.

## Tech versions

- Next.js 14.2 (App Router)
- React 18
- `@supabase/ssr` + `@supabase/supabase-js`
- Tailwind CSS 3.4
- `@vercel/og` for dynamic OG images
- TypeScript strict
