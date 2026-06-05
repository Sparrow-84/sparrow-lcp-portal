# Sparrow LifeChange Portal (System 1 — participant-facing)

The app **LifeChange program families** log in to: their curriculum progress, this-week
homework (gamified completion), upcoming events, messages from staff, and vouchers /
housing savings. Phone-first. **Static React (Vite) SPA + Supabase**, hosted as static
files on **Cloudflare Pages**. Destined for `portal.sparrowinc.org`.

> **Shared backend.** This app talks to the **same Supabase project as the Staff Portal**
> (`sparrow-staff-portal`). The LifeChange tables, RLS, and the participant sign-in
> allowlist all live in that project's migrations (`0005_lcp.sql`). Row-Level Security is
> the only thing standing between one family and another's data — there is no Node server.

> **Two identity worlds, one project:**
> - **Staff** sign in with Google (allowlisted by `profiles`) — that's the Staff Portal.
> - **Families** sign in with **email + password** (allowlisted by `families.login_email`).
>
> The `handle_new_user()` trigger links whichever matches and rejects everyone else.

## What a family gets (Phase 1)

- **Home** — "Building Your House" progress (current phase/unit, % of 48 sessions),
  housing savings, **This Week** homework with satisfying grey→green completion, and
  **Upcoming** events (required vs. RSVP).
- **Messages** — one thread with the LCP staff team (replaces Signal for participant comms).
- **Rewards** — voucher count, "3 vouchers = a $25 gift card" redemption (request → Shelly
  fulfills), redemption history, and the housing-savings bar.

A quiet, daily-rotating mission/verse line sits at the bottom of each screen.

## One-time setup

### 1. Install
```bash
npm install
```

### 2. Point at the SAME Supabase project as the Staff Portal
```bash
cp .env.example .env.local
# paste the project URL + anon key (Settings → API) — the same values the staff portal uses
```

### 3. Make sure the LifeChange schema + seed are loaded
In the staff portal's `supabase/` folder, in the Supabase SQL editor, run **in order**
(0001–0004 are the staff portal's existing migrations):

```
migrations/0005_lcp.sql      # LifeChange tables, RLS, family allowlist + trigger
seed.sql                     # staff (needed first — sets LCP staff access tiers)
seed_lcp.sql                 # curriculum (48 sessions) + 3 synthetic families + demo data
```

### 4. Enable email/password sign-in
In Supabase → **Authentication → Providers → Email**: enable it. For dev, turn **off
"Confirm email"** so a family can sign up and land straight in (or click the confirm link).

### 5. Provision a test family + sign in
`families.login_email` is the allowlist. In `seed_lcp.sql` the three families use
`@example.com` placeholders. Change **one** to an email you control (SQL editor), then in
the app choose **"First time? Create your password"** to register that email.

```bash
npm run dev          # http://localhost:5173
```

## Deploy to Cloudflare Pages
```bash
npm run build        # static site → dist/
```
- Connect the repo in Cloudflare Pages (**build:** `npm run build`, **output:** `dist`).
- Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in the Pages project.
- `public/_redirects` handles SPA routing.
- Point `portal.sparrowinc.org` at the Pages project when ready.

### Go-live on the public site
In `sparrow-website/src/consts.ts`, the `PORTALS` "participant" entry is wired to this
app's Pages URL with `live: false`. After the first deploy, flip **`live: true`** — the
website's "Participant Portal → Log in" button then goes live. (One line; nothing else.)

## Security model
- A family only ever sees its own family's rows — enforced by Postgres RLS, not app code.
- Staff notes and other families' data are unreachable from this app's anon key.
- Push notifications, "submit homework online", and Goals/FST are **Phase 2/3** (see the
  architect brief). Phase 1 keeps the participant surface small and warm.
