// Import shared quiz state
const quizStateModule = require('./quiz-state.js');

module.exports = async (req, res) => {
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

    const quizState = quizStateModule.quizState;

    return res.status(200).json({
        leaderboard: quizState.leaderboard,
        winnerCount: quizState.winnerCount,
        quizState: quizState.state
    });
};
