# Deployment on Vercel

This project is a static frontend with serverless API endpoints under /api.

## What you need
- A Vercel account
- Vercel CLI (optional) or the Vercel web UI
- ADMIN_PASSWORD environment variable set in Vercel

## Required environment variables
- ADMIN_PASSWORD: admin password used by /api/quiz-state for admin actions

## Deploy with Vercel web UI
1) Push the repo to GitHub (or GitLab/Bitbucket).
2) Import the repo in Vercel.
3) Set the environment variable ADMIN_PASSWORD.
4) Deploy.

## Deploy with Vercel CLI
1) Install the CLI: npm i -g vercel
2) Login: vercel login
3) From the project folder: vercel
4) Set env var: vercel env add ADMIN_PASSWORD
5) Deploy to production: vercel --prod

## Verify after deploy
- Open the root site URL and check the quiz loads.
- Open /admin.html and log in with ADMIN_PASSWORD.
- Start the quiz from the admin panel and verify that users can submit.

## Notes
- In-memory state resets on cold starts or redeploys. For persistent state, replace it with Vercel KV or another datastore.
- The API routes must be deployed as serverless functions (Vercel does this automatically for /api/*.js with the provided vercel.json).

## File map (local vs production)
### Local-only
- `server.js` (Express dev server for local testing)
- `.env` (local secrets; not committed)
- `.env.example` (reference for local env vars)

### Production (Vercel)
- `vercel.json` (Vercel routing for serverless functions)
- `api/*.js` (serverless functions)
- `index.html`, `admin.html`, `styles.css`, `data/questions.json` (static assets)

### Shared
- `package.json` (scripts and dependencies)
- `.gitignore` (keeps local/private files out of git)
