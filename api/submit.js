// Import shared quiz state
const quizStateModule = require('./quiz-state.js');

module.exports = async (req, res) => {
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

    const { userId, correctCount } = req.body;

    // Validation
    if (!userId || !userId.trim()) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    if (correctCount !== 10) {
        return res.status(400).json({ message: 'Must answer all 10 questions correctly' });
    }

    // Check quiz state
    const quizState = quizStateModule.quizState;

    if (quizState.state !== 'live') {
        return res.status(400).json({ message: 'Quiz has ended' });
    }

    // Check winner limit
    if (quizState.winnerCount >= quizStateModule.MAX_WINNERS) {
        quizState.state = 'ended';
        return res.status(400).json({ message: 'Quiz has ended' });
    }

    // Create submission entry
    const submission = {
        userId: userId.trim(),
        timestamp: new Date().toISOString(),
        correctCount: correctCount
    };

    // Add to leaderboard
    quizState.leaderboard.push(submission);
    quizState.winnerCount++;

    // Sort by timestamp (earliest first)
    quizState.leaderboard.sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Auto-end if we reached max winners
    if (quizState.winnerCount >= quizStateModule.MAX_WINNERS) {
        quizState.state = 'ended';
    }

    return res.status(200).json({
        message: 'Submission successful',
        rank: quizState.leaderboard.findIndex(s => s.timestamp === submission.timestamp) + 1,
        winnerCount: quizState.winnerCount,
        quizEnded: quizState.state === 'ended'
    });
};
