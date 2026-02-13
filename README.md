# Seminar Quiz Platform

Static frontend with serverless API endpoints under `/api`.

## Local run
1) Copy `.env.example` to `.env` and set `ADMIN_PASSWORD`.
2) Install deps: `npm install`
3) Start: `npm run dev`
4) Open: `http://localhost:3000`

## Deploy (Vercel)
1) Push the repo to GitHub (or GitLab/Bitbucket).
2) Import the repo in Vercel.
3) Set `ADMIN_PASSWORD` in the Vercel environment variables.
4) Deploy.

## Files that matter for deployment
- `vercel.json` (serverless function routing)
- `api/*.js` (Vercel functions)
- `index.html`, `admin.html`, `styles.css`, `data/questions.json`
- `.env.example` (reference for required env vars)
