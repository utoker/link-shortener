# Reqq .cc — Next 16 + Supabase link‑shortener

[![LinkedIn][linkedin-shield]](https://www.linkedin.com/in/utoker/)

---

## ✨ About

> **Reqq .cc** is a privacy‑minded, open‑source URL shortener built with the ~~latest~~ bleeding‑edge Next JS 16 **Server Actions**, **Edge Middleware**, and **Supabase Postgres**.
>
> I rebuilt the original Prisma + PlanetScale version from scratch to learn the new App Router paradigm (React 19 & `useActionState`) and to dog‑food Supabase’s all‑in‑one stack in production.

### Why another refactor?

| v1 (2023)                        | **v2 / current** (2025)              |
| -------------------------------- | ------------------------------------ |
| Next 13 Pages Router             | **Next 16 App Router** + React 19    |
| Prisma ORM + PlanetScale (MySQL) | **Supabase Postgres** + RLS          |
| API routes                       | **Server Actions** + Edge Middleware |
| Tailwind v3                      | **Tailwind v4** (CSS‑at‑config)      |
| No auth                          | **Supabase Auth**                    |

---

## 🚀 Features

- 🔗 **Anonymous or authenticated short‑links** – logged‑in users own their links; anonymous links still work.
- 📈 **Atomic click counter** via the Postgres `record_click` function (no race conditions), with a stats page per link.
- 🛡️ **Safe Browsing checks** – new and edited links are checked with Google Safe Browsing, and every link is re-checked weekly.
- 🚦 **Rate limits** on redirects, link creation, editing and deletion, slug checks, the link checker and auth, per IP via Upstash Redis.
- 🧰 **Free tools** – a QR code generator (`/qr-code-generator`) and a UTM link builder (`/utm-builder`), both running in the browser, and a link checker (`/link-checker`) that follows a link's redirects and asks Google Safe Browsing about it.
- 🌍 **Ultra‑low latency redirects** – Edge middleware resolves slugs in \~20–40 ms.
- 🛂 **Row‑level security** – every request goes through Supabase RLS policies; the client only gets its own data.
- ⚡ **Live revalidate** – new links appear instantly without client‑side cache busting.
- 🧩 **Composable architecture** – backend actions live in `src/app/actions/**`, UI components in `src/components/**`.

---

## 🏗️ Tech stack

| Layer      | Library / service                            |
| ---------- | -------------------------------------------- |
| Front‑end  | **React 19**, **Next JS 16**, **TypeScript** |
| Styling    | **Tailwind CSS v4**                          |
| Components | **Radix UI** primitives                      |
| Data       | **Supabase Postgres** (`links` table)        |
| Auth       | **Supabase Auth** (JWT)                      |
| Validation | **Zod** schemas                              |
| State mgmt | **useActionState** (no client stores)        |
| Rate limit | **Upstash Redis**                            |
| Checks     | **ESLint**, **Vitest**, **GitHub Actions**   |
| Link check | **Google Safe Browsing**                     |
| Email      | **Resend**                                   |
| Hosting    | **Vercel** (+ Vercel Cron)                   |

---

## 🛠️ Local development

```bash
# 1. clone & install
pnpm install

# 2. copy env example and fill in your Supabase creds
cp .env.example .env.local

# 3. run dev server
pnpm dev
```

### Checks

| Command          | What it does                          |
| ---------------- | ------------------------------------- |
| `pnpm lint`      | ESLint with the Next.js rules         |
| `pnpm typecheck` | TypeScript, without writing any files |
| `pnpm test`      | Vitest in watch mode                  |
| `pnpm test:run`  | Vitest once                           |

GitHub Actions (`.github/workflows/ci.yml`) runs lint, the type check and the tests on every push to `main` and on every pull request.

### Database

`supabase/migrations/` holds the changes made to the schema over time. The `links` table itself and its policies are not in there yet, so the migrations alone don't set up a fresh database.

### Environment variables

`.env.example` lists them all with comments.

**Needed to run**

| Variable                        | Example                   | Description                                       |
| ------------------------------- | ------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xyz.supabase.co` | Your Supabase URL                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...`           | Public anon key                                   |
| `SUPABASE_SECRET_KEY`           | _(server only)_           | Secret key; the server saves links, counts clicks |
| `UPSTASH_REDIS_REST_URL`        | `https://xyz.upstash.io`  | Upstash Redis for rate limiting                   |
| `UPSTASH_REDIS_REST_TOKEN`      | _(server only)_           | Upstash Redis token                               |

**Optional**

| Variable                       | Example                      | Description                                                   |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | `https://reqq.cc`            | Fallback origin for sign-up and password-reset email links    |
| `GOOGLE_SAFE_BROWSING_API_KEY` | _(server only)_              | Safe Browsing check on new and edited links; skipped if unset |
| `CRON_SECRET`                  | _(server only)_              | Bearer token Vercel Cron sends to the weekly link check       |
| `RESEND_API_KEY`               | _(server only)_              | Sends owner and alert emails for the weekly link check        |
| `ALERT_EMAIL`                  | `you@example.com`            | Where a link-check run with problems is reported              |
| `HEALTHCHECK_URL`              | `https://hc-ping.com/<uuid>` | healthchecks.io ping URL for the weekly link check            |

### Weekly link check

`vercel.json` schedules `GET /api/cron/link-check` every Monday at 06:00 UTC. It re-checks every link with Google Safe Browsing, blocks links that turned unsafe, lifts blocks Google has cleared, and emails the owners of newly blocked links.

---

## 📂 Project structure (abridged)

```text
src/
  app/                # routes and pages
    actions/
      auth/           # sign-in, sign-up, password reset …
      data/           # createLink.ts, updateLink.ts, deleteLink.ts …
    api/cron/         # weekly link check endpoint
    auth/             # email-link callback and confirm routes
  lib/
    supabase/         # tiny wrappers for client / server / admin helpers
    schemas/          # Zod form schemas
    linkCheck.ts      # weekly Safe Browsing re-check
    safeBrowsing.ts   # Google Safe Browsing lookups
    rateLimit.ts      # Upstash rate limiters
    email.ts          # Resend emails
  components/         # Radix‑based UI
  styles/
    globals.css
  middleware.ts       # Edge runtime slug resolver
supabase/migrations/  # schema changes
eslint.config.mjs     # lint rules
.github/workflows/    # CI
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/amazing-thing`
3. Make sure `pnpm lint`, `pnpm typecheck` and `pnpm test:run` pass
4. Commit your changes: `git commit -m "feat: amazing thing"`
5. Push to the branch: `git push origin feat/amazing-thing`
6. Open a pull request 🚀

---

## 📧 Contact

Umut Toker – [utoker@gmail.com](mailto:utoker@gmail.com) – [LinkedIn](https://www.linkedin.com/in/utoker/)

[Back to top](#top)

<!-- MARKDOWN LINKS -->

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
