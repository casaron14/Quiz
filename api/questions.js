const questions = require('../data/questions.json');

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

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

    // Get 10 random questions from the pool
    const shuffledQuestions = shuffleArray(questions.questions);
    const selectedQuestions = shuffledQuestions.slice(0, 10);

    // Don't send correct answers to client
    const questionsForClient = selectedQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer // Will be validated server-side on submission
    }));

    return res.status(200).json({
        questions: questionsForClient,
        count: questionsForClient.length
    });
};
