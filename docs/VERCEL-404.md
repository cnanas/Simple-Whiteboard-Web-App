# Fixing 404 on Vercel

If you see **404: NOT_FOUND** when opening your deployed app:

## 1. Open the root URL

Use the **exact** deployment URL, with no path:

- ✅ `https://your-project-name.vercel.app/`
- ❌ `https://your-project-name.vercel.app/something` (unless that route exists)

## 2. Check Root Directory (most common cause)

In **Vercel** → your project → **Settings** → **General**:

- **Root Directory** must be **empty** (or `.`) if your Next.js app is at the **root** of the repo (same level as `package.json`, `app/`, `next.config.ts`).
- If your repo has the app inside a subfolder (e.g. `whiteboarding-app/`), set Root Directory to that folder name.

Then **redeploy**: Deployments → ⋮ on latest → **Redeploy**.

## 3. Check the latest deployment

- Go to **Deployments** and open the **latest** deployment.
- Confirm the **build** finished with **Ready** (green).
- If the build failed, fix the error in the build logs and push again (or redeploy).

## 4. Confirm env and framework

- **Settings** → **Environment Variables**: at least `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (and GitHub/Apple if you use them).
- **Settings** → **General**: **Framework Preset** should be **Next.js** (Vercel usually detects it from `package.json`).

After changing Root Directory or env vars, trigger a **Redeploy** so the new settings are used.
