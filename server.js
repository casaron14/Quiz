// Simple Express server for local development
// This mimics Vercel serverless functions locally

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// In-memory storage (shared across all API endpoints)
global.quizState = {
    state: 'inactive', // inactive, live, ended
    leaderboard: [],
    winnerCount: 0
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const MAX_WINNERS = 7;

// Helper to simulate Vercel request/response
function createVercelHandler(handler) {
    return async (req, res) => {
        try {
            // Create Vercel-like request object
            const vercelReq = {
                method: req.method,
                headers: req.headers,
                body: req.body,
                query: req.query
            };

            // Create Vercel-like response object
            const vercelRes = {
                status: (code) => {
                    res.status(code);
                    return vercelRes;
                },
                json: (data) => {
                    res.json(data);
                    return vercelRes;
                },
                end: () => {
                    res.end();
                    return vercelRes;
                },
                setHeader: (key, value) => {
                    res.setHeader(key, value);
                    return vercelRes;
                }
            };

            await handler(vercelReq, vercelRes);
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}

// ==================== API: Quiz State ====================
app.all('/api/quiz-state', createVercelHandler(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET: Return current quiz state
    if (req.method === 'GET') {
        return res.status(200).json({
            state: global.quizState.state,
            winnerCount: global.quizState.winnerCount
        });
    }

    // POST: Change quiz state (admin only)
    if (req.method === 'POST') {
        const authHeader = req.headers.authorization;

        if (authHeader !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { action } = req.body;

        switch (action) {
            case 'start':
                if (global.quizState.state === 'inactive') {
                    global.quizState.state = 'live';
                    return res.status(200).json({
                        state: global.quizState.state,
                        message: 'Quiz started'
                    });
                }
                return res.status(400).json({ message: 'Quiz is not inactive' });

            case 'end':
                if (global.quizState.state === 'live') {
                    global.quizState.state = 'ended';
                    return res.status(200).json({
                        state: global.quizState.state,
                        message: 'Quiz ended'
                    });
                }
                return res.status(400).json({ message: 'Quiz is not live' });

            case 'reset':
                global.quizState = {
                    state: 'inactive',
                    leaderboard: [],
                    winnerCount: 0
                };
                return res.status(200).json({
                    state: global.quizState.state,
                    message: 'Quiz reset successfully'
                });

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}));

// ==================== API: Questions ====================
app.all('/api/questions', createVercelHandler(async (req, res) => {
    const questions = require('./data/questions.json');

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Get 10 random questions from the pool
    const shuffledQuestions = shuffleArray(questions.questions);
    const selectedQuestions = shuffledQuestions.slice(0, 10);

    // Don't send correct answers to client
    const questionsForClient = selectedQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
    }));

    return res.status(200).json({
        questions: questionsForClient,
        count: questionsForClient.length
    });
}));

// ==================== API: Submit ====================
app.all('/api/submit', createVercelHandler(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, answers, correctCount } = req.body;

    // Validation
    if (!userId || !userId.trim()) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    if (correctCount !== 10) {
        return res.status(400).json({ message: 'Must answer all 10 questions correctly' });
    }

    // Check quiz state
    if (global.quizState.state !== 'live') {
        return res.status(400).json({ message: 'Quiz has ended' });
    }

    // Check winner limit
    if (global.quizState.winnerCount >= MAX_WINNERS) {
        global.quizState.state = 'ended';
        return res.status(400).json({ message: 'Quiz has ended' });
    }

    // Create submission entry
    const submission = {
        userId: userId.trim(),
        timestamp: new Date().toISOString(),
        correctCount: 10
    };

    // Add to leaderboard
    global.quizState.leaderboard.push(submission);
    global.quizState.winnerCount++;

    // Sort by timestamp (earliest first)
    global.quizState.leaderboard.sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Auto-end if we reached max winners
    if (global.quizState.winnerCount >= MAX_WINNERS) {
        global.quizState.state = 'ended';
    }

    return res.status(200).json({
        message: 'Submission successful',
        rank: global.quizState.leaderboard.findIndex(s => s.timestamp === submission.timestamp) + 1,
        winnerCount: global.quizState.winnerCount,
        quizEnded: global.quizState.state === 'ended'
    });
}));

// ==================== API: Leaderboard ====================
app.all('/api/leaderboard', createVercelHandler(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    return res.status(200).json({
        leaderboard: global.quizState.leaderboard,
        winnerCount: global.quizState.winnerCount,
        quizState: global.quizState.state
    });
}));

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Quiz Platform Server Running!`);
    console.log(`\n📍 Local URLs:`);
    console.log(`   Quiz Page:  http://localhost:${PORT}`);
    console.log(`   Admin Page: http://localhost:${PORT}/admin.html`);
    console.log(`\n🔐 Admin Password: ${ADMIN_PASSWORD}`);
    console.log(`\n⚡ Press Ctrl+C to stop\n`);
});
