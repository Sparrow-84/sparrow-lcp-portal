# Deploy & Launch Guide — Sparrow LifeChange Portal (System 1)

Takes the participant app live on Cloudflare Pages. The repo is already on GitHub
(`github.com/hansons/sparrow-lcp-portal`), so this is Git-connected Pages — every push
to `main` auto-deploys. Nothing here is public-facing until step 5 (the website "Log in"
button stays "Coming soon" until you flip it), so steps 1–4 are safe to do anytime.

> **Prereqs (already done):** repo pushed; the shared Supabase project has `0005_lcp.sql`
> + `seed_lcp.sql` loaded; the Email auth provider is enabled. You'll need that project's
> **Project URL** and **anon public key** (Supabase → Settings → API) for step 3.

---

## 1. Connect Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick the **`sparrow-lcp-portal`** repo.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variable:** `NODE_VERSION = 20`
4. **Add the Supabase env vars now** (step 2) so the first build is wired — Vite bakes
   them into the bundle at build time, so a build without them produces a non-working app.
5. **Save and Deploy.** You'll get a URL like `sparrow-lcp-portal.pages.dev`.

## 2. Environment variables (Pages → Settings → Variables and Secrets)

Use the **same Supabase project as the Staff Portal** — the LifeChange tables live there.

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the project's anon public key |

The anon key is safe in the browser — Row-Level Security gates all data. After changing
any variable, **trigger a redeploy** (Deployments → Retry deployment) so it takes effect.

## 3. Point Supabase at the deployed URL (auth)

Families sign in with **email + password**. So Supabase knows where to send confirmation
/ password-reset links, add the app's URLs in **Supabase → Authentication → URL
Configuration**:

- **Site URL:** the production URL (`https://portal.sparrowinc.org` once the domain is
  set up, or the `*.pages.dev` URL until then).
- **Redirect URLs (allow-list):** add both `http://localhost:5173` (dev) and the
  `*.pages.dev` URL (and the custom domain later).

**Email confirmation:** for the smallest-friction launch with ~3 families, you can leave
"Confirm email" **off** (Shelly provisions the family by adding `login_email`; the family
sets a password and is straight in). If you turn it **on**, the Site URL above must be
correct so the confirmation link returns to the app.

## 4. Custom domain — `portal.sparrowinc.org`

Do this once `sparrowinc.org` is a zone in Cloudflare (see the website's `DEPLOY.md`
step 6 — the `portal` subdomain is reserved there):

1. Pages project → **Custom domains** → **Set up a domain** → `portal.sparrowinc.org`.
2. Cloudflare adds the CNAME automatically. Wait for it to go green.
3. Update **Site URL / Redirect URLs** in Supabase (step 3) to the custom domain.

## 5. Go live on the public website

In `sparrow-website/src/consts.ts`, the `PORTALS` "participant" entry is already wired to
this app and set `live: false`. To turn the public **"Participant Portal → Log in"** button
on:

1. Set its `url` to the real host (the `*.pages.dev` URL, or `https://portal.sparrowinc.org`).
2. Flip **`live: true`**.
3. Commit + push `sparrow-website` — Cloudflare redeploys the site and the button goes live.

## 6. Verify

1. Open the Pages URL → you should see the LifeChange sign-in screen (not the "not
   connected" notice — if you see that, the env vars from step 2 didn't bake in; redeploy).
2. Point one `families.login_email` (in `seed_lcp.sql`) at an address you control, then use
   **"First time? Create your password."**
3. Sign in → you should land on the family dashboard (progress, This-Week homework,
   messages, rewards). Mark a homework item complete to confirm writes work.

> **Smoke test before sharing with real families:** confirm a participant can ONLY see their
> own family's data — Row-Level Security enforces it, but verify once with two test families.
