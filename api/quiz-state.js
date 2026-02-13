// In-memory storage (will reset on deployment)
// For production, replace with Vercel KV or similar
const quizState = {
    state: 'inactive', // inactive, live, ended
    leaderboard: [],
    winnerCount: 0
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const MAX_WINNERS = 5;

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET: Return current quiz state
    if (req.method === 'GET') {
        const isAdminRequest = req.query && req.query.admin === '1';
        const authHeader = req.headers.authorization;

        if (isAdminRequest && authHeader !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return res.status(200).json({
            state: quizState.state,
            winnerCount: quizState.winnerCount
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
                if (quizState.state === 'inactive') {
                    quizState.state = 'live';
                    return res.status(200).json({
                        state: quizState.state,
                        message: 'Quiz started'
                    });
                }
                return res.status(400).json({ message: 'Quiz is not inactive' });

            case 'end':
                if (quizState.state === 'live') {
                    quizState.state = 'ended';
                    return res.status(200).json({
                        state: quizState.state,
                        message: 'Quiz ended'
                    });
                }
                return res.status(400).json({ message: 'Quiz is not live' });

            case 'reset':
                quizState.state = 'inactive';
                quizState.leaderboard = [];
                quizState.winnerCount = 0;
                return res.status(200).json({
                    state: quizState.state,
                    message: 'Quiz reset successfully'
                });

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
};

// Export quizState for access from other API endpoints
module.exports.quizState = quizState;
module.exports.MAX_WINNERS = MAX_WINNERS;
