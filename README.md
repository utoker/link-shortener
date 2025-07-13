# Reqq .cc — Next 15 + Supabase link‑shortener

[![LinkedIn][linkedin-shield]](https://www.linkedin.com/in/utoker/)

---

## ✨ About

> **Reqq .cc** is a privacy‑minded, open‑source URL shortener built with the ~~latest~~ bleeding‑edge Next JS 15 **Server Actions**, **Edge Middleware**, and **Supabase Postgres**.
>
> I rebuilt the original Prisma + PlanetScale version from scratch to learn the new App Router paradigm (React 19 & `useActionState`) and to dog‑food Supabase’s all‑in‑one stack in production.

### Why another refactor?

| v1 (2023)                        | **v2 / current** (2025)              |
| -------------------------------- | ------------------------------------ |
| Next 13 Pages Router             | **Next 15 App Router** + React 19    |
| Prisma ORM + PlanetScale (MySQL) | **Supabase Postgres** + RLS          |
| API routes                       | **Server Actions** + Edge Middleware |
| Tailwind v3                      | **Tailwind v4** (CSS‑at‑config)      |
| No auth                          | **Supabase Auth**                    |

---

## 🚀 Features

- 🔗 **Anonymous or authenticated short‑links** – logged‑in users own their links; anonymous links still work.
- 📈 **Atomic click counter** via Postgres `increment_click` function (no race conditions).
- 🌍 **Ultra‑low latency redirects** – Edge middleware resolves slugs in \~20–40 ms.
- 🛂 **Row‑level security** – every request goes through Supabase RLS policies; the client only gets its own data.
- ⚡ **Live revalidate** – new links appear instantly without client‑side cache busting.
- 🧩 **Composable architecture** – backend actions live in `src/lib/actions/**`, UI components in `src/components/**`.

---

## 🏗️ Tech stack

| Layer      | Library / service                            |
| ---------- | -------------------------------------------- |
| Front‑end  | **React 19**, **Next JS 15**, **TypeScript** |
| Styling    | **Tailwind CSS v4**                          |
| Components | **Radix UI** primitives                      |
| Data       | **Supabase Postgres** (`links` table)        |
| Auth       | **Supabase Auth** (JWT)                      |
| Validation | **Zod** schemas                              |
| State mgmt | **useActionState** (no client stores)        |

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

### Environment variables

| Variable                        | Example                   | Description                       |
| ------------------------------- | ------------------------- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xyz.supabase.co` | Your Supabase URL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...`           | Public anon key                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | _(server only)_           | Used in privileged Server Actions |

---

## 📂 Project structure (abridged)

```text
src/
  app/
    (routes & server actions)
  lib/
    actions/          # server‑action files (createLink.ts, deleteLink.ts …)
    supabase/         # tiny wrappers for client / server helpers
  components/         # Radix‑based UI
  styles/
    globals.css
  middleware.ts       # Edge runtime slug resolver
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/amazing-thing`
3. Commit your changes: `git commit -m "feat: amazing thing"`
4. Push to the branch: `git push origin feat/amazing-thing`
5. Open a pull request 🚀

---

## 📧 Contact

Umut Toker – [utoker@gmail.com](mailto:utoker@gmail.com) – [LinkedIn](https://www.linkedin.com/in/utoker/)

[Back to top](#top)

<!-- MARKDOWN LINKS -->

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
