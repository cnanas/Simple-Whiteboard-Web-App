# Whiteboard

An open-space whiteboard in the browser: sticky notes, notepads, task lists, calendar, stickers. Pan/zoom canvas, optional widget lock (encrypted), list view, export to TXT/PDF, PWA support.

**Runs fully in the browser** — data is stored in localStorage by default. Optional **Sign in with GitHub** or **Sign in with Apple** plus cloud save (Neon Postgres) is implemented; see [DEPLOY.md](./DEPLOY.md) for env vars and setup.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

1. Push this repo to GitHub (public or private).
2. In [Vercel](https://vercel.com), **Add New Project** → import the repo → **Deploy**.
3. No environment variables or database are required for the default app.

For optional **login + cloud save**, see [DEPLOY.md](./DEPLOY.md).
# Simple-Whiteboard-Web-App
