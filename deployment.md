# Deployment on Vercel

This project is a static frontend with serverless API endpoints under /api.

**Important**: This project now uses Vercel KV (Redis storage) to persist quiz state across serverless function invocations. Without KV configured, the quiz will not work on Vercel.

## What you need
- A Vercel account
- Vercel CLI (optional) or the Vercel web UI
- ADMIN_PASSWORD environment variable set in Vercel
- **Vercel KV database (required for state persistence)**

## Step 1: Set up Vercel KV Storage

### Option A: Using Vercel Dashboard (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **KV (Redis)** or **Upstash Redis** from the marketplace
5. Follow the prompts to create a new KV store
6. Vercel will automatically add the required environment variables (KV_REST_API_URL, KV_REST_API_TOKEN, etc.)

### Option B: Using Vercel CLI
```bash
vercel link  # Link to your project
vercel storage create kv  # Create a new KV store
```

## Step 2: Required Environment Variables
## Step 2: Required Environment Variables
- **ADMIN_PASSWORD**: admin password used by /api/quiz-state for admin actions
- **KV_REST_API_URL**: Automatically set when you create a KV store
- **KV_REST_API_TOKEN**: Automatically set when you create a KV store
- **KV_REST_API_READ_ONLY_TOKEN**: Automatically set when you create a KV store

> **Note**: The KV environment variables are automatically configured when you create a KV store through Vercel. You only need to manually set ADMIN_PASSWORD.

## Step 3: Deploy with Vercel Web UI
1) Push the repo to GitHub (or GitLab/Bitbucket).
2) Import the repo in Vercel.
3) **Create a KV store** (see Step 1 above).
4) Set the environment variable **ADMIN_PASSWORD**.
5) Deploy.

## Step 3: Deploy with Vercel CLI
## Step 3: Deploy with Vercel CLI
1) Install the CLI: `npm i -g vercel`
2) Login: `vercel login`
3) Link to your project: `vercel link`
4) **Create KV store**: `vercel storage create kv`
5) Set env var: `vercel env add ADMIN_PASSWORD`
6) Deploy to production: `vercel --prod`

## Verify After Deploy
- Open the root site URL and check the quiz loads.
- Open /admin.html and log in with ADMIN_PASSWORD.
- Start the quiz from the admin panel and verify that users can submit.
- Check that the leaderboard persists across page refreshes.

## Troubleshooting

### "Quiz has ended" error when submitting
This usually means:
1. **KV store not configured**: Make sure you've created a KV store in Vercel and the environment variables are set.
2. **State not syncing**: Each serverless function must be able to read/write to the same KV store.

### Vercel KV deprecated warning
Vercel KV has been moved to Upstash Redis integration. If you see a deprecation warning:
1. Go to your Vercel project → **Integrations**
2. Look for **Upstash Redis** (your existing KV store should have migrated automatically)
3. Or install a new Redis integration from the Vercel Marketplace

## Notes
- **State is now persistent**: Quiz state, leaderboard, and winner count are stored in Vercel KV (Redis) and persist across cold starts and redeploys.
- The API routes are deployed as serverless functions (Vercel does this automatically for /api/*.js with the provided vercel.json).
- Local development still uses in-memory state via `server.js`, which is fine for testing.

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
