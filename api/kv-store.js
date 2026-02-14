// Vercel KV storage helper
// This provides persistent state across serverless function invocations
const { kv } = require('@vercel/kv');

const MAX_WINNERS = 5;

// Initialize default state if not exists
async function getQuizState() {
    const state = await kv.get('quiz:state');
    const leaderboard = await kv.get('quiz:leaderboard');
    const winnerCount = await kv.get('quiz:winnerCount');

    return {
        state: state || 'inactive',
        leaderboard: leaderboard || [],
        winnerCount: winnerCount || 0
    };
}

async function setQuizState(state) {
    await kv.set('quiz:state', state);
}

async function getLeaderboard() {
    return await kv.get('quiz:leaderboard') || [];
}

async function setLeaderboard(leaderboard) {
    await kv.set('quiz:leaderboard', leaderboard);
}

async function getWinnerCount() {
    return await kv.get('quiz:winnerCount') || 0;
}

async function setWinnerCount(count) {
    await kv.set('quiz:winnerCount', count);
}

async function addWinner(submission) {
    // Get current data
    const leaderboard = await getLeaderboard();
    const winnerCount = await getWinnerCount();

    // Add submission
    leaderboard.push(submission);
    const newCount = winnerCount + 1;

    // Sort by timestamp
    leaderboard.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Update storage
    await setLeaderboard(leaderboard);
    await setWinnerCount(newCount);

    return {
        rank: leaderboard.findIndex(s => s.timestamp === submission.timestamp) + 1,
        winnerCount: newCount
    };
}

async function resetQuiz() {
    await kv.set('quiz:state', 'inactive');
    await kv.set('quiz:leaderboard', []);
    await kv.set('quiz:winnerCount', 0);
}

module.exports = {
    MAX_WINNERS,
    getQuizState,
    setQuizState,
    getLeaderboard,
    setLeaderboard,
    getWinnerCount,
    setWinnerCount,
    addWinner,
    resetQuiz
};
