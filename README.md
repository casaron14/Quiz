# Seminar Quiz Platform

A lightweight, time-bound quiz platform for live seminars with real-time leaderboard functionality.

## Features

- ⚡ **100-second timed quiz** with 10 random questions
- 🎯 **Immediate feedback** on answers (green/red)
- 🏆 **Live leaderboard** with automatic updates
- 👑 **Automatic end** when 7 winners are reached
- 🔐 **Admin panel** for quiz lifecycle management
- 📱 **Responsive design** for mobile and desktop
- 🚀 **Serverless deployment** on Vercel

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and set your admin password.

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Quiz page: http://localhost:3000
   - Admin panel: http://localhost:3000/admin.html

### System Test Script

Run a quick end-to-end check against a running server:

```bash
npm run test:system
```

You can also point the script at another URL:

```bash
set QUIZ_BASE_URL=http://localhost:3000
npm run test:system
```

Simulate load (example: 200 users spread across 20 seconds):

```bash
set LOAD_USERS=200
set LOAD_MAX_DELAY_MS=20000
set LOAD_CORRECT_RATE=0.4
npm run test:system
```

### Deployment to Vercel

1. **Install Vercel CLI (if not already installed):**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   
   For production deployment:
   ```bash
   npm run deploy
   ```

3. **Set environment variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add `ADMIN_PASSWORD` with your desired password

## Usage

### For Participants

1. Scan QR code or navigate to the quiz URL
2. Click "Start Quiz"
3. Answer 10 multiple-choice questions within 100 seconds
4. Get all answers correct to submit your name
5. Appear on the leaderboard!

### For Admins

1. Navigate to `/admin.html`
2. Login with the admin password
3. **Start Quiz** - Opens quiz for participants
4. **End Quiz** - Stops all submissions
5. **Reset** - Clears all data for next seminar

The quiz automatically ends when 7 winners are reached.

## Customization

### Questions

Edit `data/questions.json` to customize the 20-question pool. Each question should have:

```json
{
  "question": "Your question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0
}
```

The `correctAnswer` is the zero-based index of the correct option.

### Styling

All styles are in `styles.css`. Key customization points:

- **Colors**: Modify CSS custom properties in `:root`
- **Timer duration**: Change the starting value in `index.html` (search for `timeRemaining: 100`)
- **Winner limit**: Change `MAX_WINNERS` in `api/quiz-state.js`

## Technical Details

### Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Backend**: Vercel Serverless Functions (Node.js)
- **Storage**: In-memory (resets on deployment)
- **Updates**: Polling every 5 seconds for leaderboard

### Data Persistence Note

⚠️ **Important**: The current implementation uses **in-memory storage** which resets on each deployment. For production use with persistent data:

1. Set up Vercel KV (Redis)
2. Update API functions to use KV instead of in-memory variables
3. See Vercel KV documentation: https://vercel.com/docs/storage/vercel-kv

### API Endpoints

- `GET /api/quiz-state` - Get current quiz state
- `POST /api/quiz-state` - Change quiz state (admin only)
- `GET /api/questions` - Get 10 random questions
- `POST /api/submit` - Submit quiz answers
- `GET /api/leaderboard` - Get leaderboard data

## File Structure

```
Quiz1/
├── index.html              # Main quiz page
├── admin.html              # Admin control panel
├── styles.css              # Unified styling
├── package.json            # Dependencies
├── vercel.json             # Vercel config
├── .env.example            # Environment template
├── api/
│   ├── quiz-state.js       # Quiz lifecycle management
│   ├── questions.js        # Question delivery
│   ├── submit.js           # Answer submission
│   └── leaderboard.js      # Leaderboard retrieval
└── data/
    └── questions.json      # Question pool (20 questions)
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Support

For issues or questions, please contact your system administrator.
