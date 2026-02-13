# Deploying & Optional Cloud Save

## Deploy to Vercel (no database required)

The app works **fully offline** today: all data is stored in your browser (localStorage). You can deploy it to Vercel and use it personally—or share the public URL—without any database or login.

### Steps

1. **Push to GitHub**
   - Create a new **public** repo on GitHub.
   - Run:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
     git branch -M main
     git push -u origin main
     ```
   - Your `.gitignore` already excludes `.env*` and `.vercel`, so secrets and local Vercel config stay off the repo.

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in (GitHub is easiest).
   - **Add New Project** → **Import** your GitHub repo.
   - Leave **Root Directory** and **Build Command** as default (Next.js is auto-detected).
   - Click **Deploy**. No environment variables are needed for the current version.

3. **Use it**
   - Your board is stored only in the browser. Each device has its own board unless you add cloud save (below).

---

## Optional: Login + Cloud Save

If you want **“sign in to save my board to the cloud”** (and load it on another device), you add:

| Piece | Role |
|-------|------|
| **Auth** | Identify the user (e.g. “Sign in with GitHub”). |
| **Database** | Store one (or more) boards per user. |
| **API** | Endpoints to save and load board JSON. |

You do **not** need a database or login for the app to run on Vercel; they’re only for optional cloud save.

### Implemented in this repo

- **Auth:** [NextAuth.js](https://nextauth.js.org/) v4 with **email/password**, **GitHub**, and **Sign in with Apple**. Session is JWT (no DB required for sessions). Email/password users are stored in the `users` table; OAuth users are identified by provider id.
- **Database:** [Neon](https://neon.tech) (serverless Postgres). Tables: `users` (for email/password sign-up), `boards` (board JSON per user).
- **API:** `GET /api/board` (load), `POST /api/board` (save). Require sign-in.
- **UI:** Toolbar (desktop) and mobile header show **Sign in**; when signed in, account menu with **Save to cloud**, **Load from cloud**, **Sign out**.

### Data model (conceptual)

- **Users:** From auth (e.g. NextAuth `session.user.id`).
- **Boards:** One row per user (or per “board” if you add multiple later), e.g.:
  - `user_id` (or `board_id`), `data` (JSON: `{ widgets, viewport }`), `updated_at`.

### User flow

- **No login:** App works as today (localStorage only).
- **Login:** User clicks “Sign in” (e.g. GitHub). After sign-in, show “Save to cloud” and “Load from cloud.”
- **Save to cloud:** POST current `widgets` + `viewport` to an API route; API writes to DB for that user.
- **Load from cloud:** GET from API; replace or merge with current localStorage (e.g. “Load from cloud” button or auto-load on login).

No need to force login; keep the app usable without an account.

### Env vars and one-time DB setup

1. **Environment variables**  
   See `.env.example`. Set these in **Vercel → Project → Settings → Environment Variables** (and in `.env.local` for local dev):

   - `NEXTAUTH_URL` = your app URL (e.g. `https://your-app.vercel.app`; must be HTTPS for Apple).
   - `NEXTAUTH_SECRET` = run `openssl rand -base64 32`.
   - `GITHUB_ID` and `GITHUB_SECRET` from [GitHub OAuth Apps](https://github.com/settings/developers).
   - **Sign in with Apple (optional):** Create a Services ID and a Sign in with Apple key in [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId). Generate the client secret JWT (e.g. with [bal.so/apple-gen-secret](https://bal.so/apple-gen-secret)) and set `APPLE_ID` (Services ID) and `APPLE_SECRET` (the JWT). Apple requires HTTPS; localhost is not allowed for Apple.
   - `DATABASE_URL` = from [Neon](https://neon.tech) (or another Postgres). In Neon dashboard: create a project, copy the connection string.

2. **Create the `users` and `boards` tables**  
   Run the SQL in `scripts/init-db.sql` once in your database (Neon SQL Editor or Vercel Postgres console). This creates both tables needed for email/password and cloud save.

---

## Summary

| Goal | What to do |
|------|------------|
| Public repo + use personally | Push to GitHub, deploy on Vercel. No DB or login required. |
| Same board on multiple devices | Add NextAuth + a database (e.g. Vercel Postgres) and API routes to save/load board. |
| “Sign in to save” | Implement optional login and “Save to cloud” / “Load from cloud” in the UI. |

If you want, the next step is to implement optional **NextAuth (GitHub)** + **Vercel Postgres** and the save/load API + UI in this repo.
