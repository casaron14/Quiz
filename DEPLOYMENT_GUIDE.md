# Deployment Guide (GitHub + Vercel)

This guide covers exactly what to upload to GitHub and how to deploy on Vercel.

## 1) Files to Upload to GitHub

Upload everything in the project **except** the items listed in the “Do Not Upload” section.

### Include these files/folders

- admin.html
- api/
- data/
- index.html
- styles.css
- server.js
- package.json
- package-lock.json
- vercel.json
- README.md
- LOCAL_SETUP.md
- seminar_quiz_platform_product_design_specification.md
- .env.example
- .gitignore

### Do Not Upload

These are already in .gitignore and should not be committed:

- node_modules/
- .vercel/
- .env
- *.log
- .DS_Store

## 2) Create the GitHub Repository

1. Create a new GitHub repo (empty).
2. In your project folder, run:

```bash
git init
```

3. Add files and commit:

```bash
git add .
git commit -m "Initial commit"
```

4. Link the repo and push (replace the URL with your repo):

```bash
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## 3) Configure Environment Variables

You must set the admin password on Vercel.

- Required: ADMIN_PASSWORD

Do **not** upload your local .env file to GitHub. Use .env.example for reference.

## 4) Deploy on Vercel (Recommended: GitHub Integration)

1. Log in to Vercel.
2. Click **New Project**.
3. Import your GitHub repo.
4. Framework preset: **Other**.
5. Build command: leave blank.
6. Output directory: leave blank.
7. Add environment variables:
   - ADMIN_PASSWORD = your_admin_password
8. Click **Deploy**.

Vercel will deploy:
- Static pages (index.html, admin.html, styles.css)
- Serverless API routes in api/

## 5) Deploy on Vercel (CLI Option)

1. Install Vercel CLI (once):

```bash
npm install -g vercel
```

2. Login:

```bash
vercel login
```

3. Deploy:

```bash
vercel
```

4. For production:

```bash
vercel --prod
```

5. Set environment variables in the Vercel Dashboard:
   - ADMIN_PASSWORD

## 6) Verify Deployment

After deployment:

- Open the live URL.
- Go to /admin.html and log in.
- Start the quiz.
- Open the main page and answer questions.
- Confirm the leaderboard updates.

## 7) Notes About Local vs Production

- Local development uses server.js (Express) and .env.
- Production on Vercel uses the api/ serverless functions.
- In-memory storage resets when the function instance restarts.

If you need persistent storage in production, add Vercel KV or another database.
