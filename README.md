# Gemini Chatbot API

Simple Node.js + Express frontend (static) and serverless API for Google Gemini.

This repository serves a static frontend in `public/` and exposes an API at `/api/chat` that calls Google Gemini and returns JSON `{ result: "..." }`.

## Files of interest

- `index.js` — an Express server used for local development (serves `public/` and exposes `/api/chat`).
- `api/chat.js` — Vercel serverless handler for `/api/chat` (used when deployed to Vercel).
- `public/` — static frontend (HTML, `script.js`, `style.css`).
- `vercel.json` — Vercel config included for static + function routing.

## Environment variables

You must set the Gemini API key before running or deploying:

- `GEMINI_API_KEY` — your Google Gemini API key (string)

When deploying to Vercel, add `GEMINI_API_KEY` in the Project Settings → Environment Variables (for Production/Preview/Development as needed).

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create a local `.env` file in the project root with:

```
GEMINI_API_KEY=your_real_gemini_api_key_here
```

3. Run the app locally (uses `index.js` Express server):

```bash
npm run dev
# or
npm start
```

4. Open http://localhost:3000 in your browser.

Notes:

- `index.js` is convenient for local testing (it uses Express and serves `public/`).
- The project `type` is `module`, so Node should be recent (v14+ with ES module support; Node 18+ recommended).

## Deploying to Vercel

This repo is prepared for Vercel. Steps:

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In the Vercel dashboard, create a new Project and import your repo.
3. In Project Settings → Environment Variables, add `GEMINI_API_KEY` with your key.
4. Deploy. Vercel will use `vercel.json`:
   - Static files from `public/` are served.
   - Serverless API endpoint at `/api/chat` is provided by `api/chat.js`.

Notes and suggestions:

- The repo contains both `index.js` (Express) and `api/chat.js` (serverless). On Vercel, the serverless `api/chat.js` will handle `/api/chat`. `index.js` is primarily for local development. If you prefer, remove `api/chat.js` and configure Vercel to run `index.js` as a Node server, but serverless functions are the recommended pattern on Vercel.
- Make sure the `GEMINI_API_KEY` environment variable is set in Vercel for the correct environment (Production vs Preview).

## Troubleshooting

- 500 errors: check Vercel function logs (Vercel Dashboard → Functions → Logs) and verify `GEMINI_API_KEY` is set.
- CORS: frontend and serverless are served from the same origin on Vercel; for local dev, `index.js` includes `cors()` for convenience.
- Node version: If you need a specific Node version on Vercel, set it in `package.json` engines or in Vercel project settings.

## Optional: Quick deploy via Vercel CLI

If you prefer the CLI:

```bash
npm install -g vercel
vercel login
vercel --prod
```

During CLI deploy, you'll be prompted to set environment variables or you can set them in the dashboard.

---

If you want, I can also:

- Add a short `docs/` page with screenshots and verification steps.
- Remove `index.js` and convert everything to serverless if you prefer an exclusively serverless architecture.
