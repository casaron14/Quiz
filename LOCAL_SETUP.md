# Local Development Setup

## Quick Start (No Vercel Required)

### 1. Install Dependencies

```bash
npm install
```

This will install:
- **Express** - Local web server
- **dotenv** - Environment variable management

### 2. Configure Environment Variables

The `.env` file has been created with default settings:

```
ADMIN_PASSWORD=admin123
PORT=3000
```

You can edit these values as needed.

### 3. Run the Local Server

```bash
npm start
```

Or:

```bash
npm run dev
```

### 4. Access the Application

Open your browser and navigate to:

- **Quiz Page**: http://localhost:3000
- **Admin Page**: http://localhost:3000/admin.html

**Default Admin Password**: `admin123`

## How It Works

The local setup uses a simple Express.js server (`server.js`) that:

1. Serves static files (HTML, CSS, images)
2. Provides API endpoints that mimic Vercel serverless functions
3. Uses in-memory storage (data resets when server restarts)
4. Loads environment variables from `.env` file

## Testing Locally

### User Flow Test

1. Open http://localhost:3000
2. Click "Start Quiz"
3. Answer 10 questions
4. Submit your name if you get all correct
5. Check the leaderboard

### Admin Flow Test

1. Open http://localhost:3000/admin.html
2. Login with password: `admin123`
3. Click "Start Quiz"
4. Open another tab with the quiz page and play
5. Watch the leaderboard update in admin panel
6. Test "End Quiz" and "Reset" buttons

### Multi-User Test

1. Open multiple browser tabs to http://localhost:3000
2. Start quiz in each tab
3. Submit from different tabs
4. Verify leaderboard shows all winners in correct order

## Important Notes

### ⚠️ Data Persistence

The local server uses **in-memory storage**. This means:
- Data is lost when you restart the server
- Perfect for development and testing
- Not suitable for production use

### 🔄 Hot Reload

The server does **not** automatically reload when you change files. To see changes:

1. **For HTML/CSS/JS changes**: Just refresh your browser
2. **For server.js or API changes**: Restart the server with `Ctrl+C` then `npm start`

### 🌐 Network Access

By default, the server only runs on `localhost`. To allow other devices on your network to access it:

1. Find your computer's IP address (e.g., `192.168.1.100`)
2. Others can access: `http://YOUR_IP:3000`

## Customization

### Change Admin Password

Edit `.env` file:
```
ADMIN_PASSWORD=your_secure_password
```

Restart the server for changes to take effect.

### Change Port

Edit `.env` file:
```
PORT=8080
```

Then access at http://localhost:8080

### Customize Questions

Edit `data/questions.json` with your own questions. No server restart needed - just refresh the browser.

## Moving to Production (Vercel)

When you're ready to deploy:

1. **Login to Vercel**:
   ```bash
   npx vercel login
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

3. **Set environment variables** in Vercel Dashboard

The same API code works for both local and Vercel deployment!

## Troubleshooting

### Port Already in Use

If you see "Port 3000 already in use":

1. **Option 1**: Kill the process using port 3000
2. **Option 2**: Change PORT in `.env` to a different number (e.g., 8080)

### Dependencies Not Installed

If you see module errors:
```bash
npm install
```

### Admin Password Not Working

1. Check `.env` file exists
2. Verify ADMIN_PASSWORD value
3. Restart the server after changing `.env`

## API Endpoints

All endpoints are available at `http://localhost:3000/api/`:

- `GET /api/quiz-state` - Get quiz state
- `POST /api/quiz-state` - Change quiz state (admin)
- `GET /api/questions` - Get random questions
- `POST /api/submit` - Submit answers
- `GET /api/leaderboard` - Get leaderboard

## File Structure for Local Development

```
Quiz1/
├── server.js              # Local Express server
├── .env                   # Environment variables (local)
├── package.json           # Updated with Express deps
├── index.html             # Quiz page
├── admin.html             # Admin page
├── styles.css             # Styles
├── data/
│   └── questions.json     # Questions
└── api/                   # (Used by Vercel only)
    ├── quiz-state.js
    ├── questions.js
    ├── submit.js
    └── leaderboard.js
```

**Note**: The `api/` folder is only used when deploying to Vercel. For local development, all API logic is in `server.js`.
