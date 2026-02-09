const http = require('http');
const https = require('https');
const { URL } = require('url');

const baseUrl = process.env.QUIZ_BASE_URL || 'http://localhost:3000';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const simulatedUsers = Number.parseInt(process.env.LOAD_USERS || '0', 10);
const maxDelayMs = Number.parseInt(process.env.LOAD_MAX_DELAY_MS || '20000', 10);
const correctRate = Number.parseFloat(process.env.LOAD_CORRECT_RATE || '0.4');

function request(method, path, body, extraHeaders = {}) {
    const url = new URL(path, baseUrl);
    const isHttps = url.protocol === 'https:';
    const data = body ? JSON.stringify(body) : null;

    const headers = {
        ...extraHeaders
    };

    if (data) {
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(data);
    }

    const options = {
        method,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers
    };

    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
            let raw = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { raw += chunk; });
            res.on('end', () => {
                let json = null;
                try {
                    json = raw ? JSON.parse(raw) : null;
                } catch (error) {
                    json = null;
                }

                resolve({
                    status: res.statusCode,
                    json,
                    raw
                });
            });
        });

        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function fail(message) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
}

function pass(message) {
    console.log(`OK: ${message}`);
}

function warn(message) {
    console.warn(`WARN: ${message}`);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateUser(userIndex) {
    await sleep(randomInt(0, maxDelayMs));

    const questions = await request('GET', '/api/questions');
    if (questions.status !== 200 || !questions.json) {
        return { status: 'questions_failed' };
    }

    const shouldBeCorrect = Math.random() < correctRate;
    const answerKey = (questions.json.questions || []).map(q => q.correctAnswer);

    const submit = await request('POST', '/api/submit', {
        userId: `load-user-${userIndex}`,
        answers: shouldBeCorrect ? answerKey : [],
        correctCount: shouldBeCorrect ? 10 : 9
    });

    if (submit.status === 200) {
        return { status: 'accepted' };
    }

    if (submit.status === 400 && submit.json && submit.json.message === 'Quiz has ended') {
        return { status: 'quiz_ended' };
    }

    if (submit.status === 400 && submit.json && submit.json.message === 'Must answer all 10 questions correctly') {
        return { status: 'rejected' };
    }

    return { status: 'unexpected' };
}

async function runLoadSimulation() {
    if (!Number.isFinite(simulatedUsers) || simulatedUsers <= 0) {
        return;
    }

    console.log(`Simulating ${simulatedUsers} users over ~${maxDelayMs}ms (correctRate=${correctRate})`);

    const results = await Promise.all(
        Array.from({ length: simulatedUsers }, (_, index) => simulateUser(index + 1))
    );

    const summary = results.reduce((acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1;
        return acc;
    }, {});

    console.log('Load simulation results:', summary);
}

async function run() {
    console.log(`Running system checks against ${baseUrl}`);

    // Reset
    const reset = await request('POST', '/api/quiz-state', { action: 'reset' }, {
        Authorization: adminPassword
    });
    if (reset.status !== 200) {
        fail(`Reset failed (${reset.status})`);
        return;
    }
    pass('Reset quiz state');

    // Start
    const start = await request('POST', '/api/quiz-state', { action: 'start' }, {
        Authorization: adminPassword
    });
    if (start.status !== 200 || !start.json || start.json.state !== 'live') {
        fail('Start quiz failed');
        return;
    }
    pass('Started quiz');

    // State
    const state = await request('GET', '/api/quiz-state');
    if (state.status !== 200 || !state.json || state.json.state !== 'live') {
        fail('Quiz state not live');
        return;
    }
    pass('Quiz state is live');

    // Questions
    const questions = await request('GET', '/api/questions');
    if (questions.status !== 200 || !questions.json) {
        fail('Questions request failed');
        return;
    }

    const firstSet = questions.json.questions || [];
    if (firstSet.length !== 10) {
        fail(`Expected 10 questions, got ${firstSet.length}`);
        return;
    }

    const allHaveOptions = firstSet.every(q => Array.isArray(q.options) && q.options.length >= 2);
    if (!allHaveOptions) {
        fail('One or more questions are missing options');
        return;
    }
    pass('Received 10 valid questions');

    // Randomization check (non-fatal)
    const questionsTwo = await request('GET', '/api/questions');
    const secondSet = (questionsTwo.json && questionsTwo.json.questions) || [];
    const firstKeys = new Set(firstSet.map(q => q.question));
    const secondKeys = new Set(secondSet.map(q => q.question));
    const overlap = [...firstKeys].filter(q => secondKeys.has(q)).length;

    if (overlap === firstSet.length) {
        warn('Two consecutive question sets are identical (possible but unlikely)');
    } else {
        pass('Question set appears randomized');
    }

    // Submit with incorrect count
    const badSubmit = await request('POST', '/api/submit', {
        userId: 'system-test-user',
        answers: [],
        correctCount: 9
    });

    if (badSubmit.status !== 400) {
        fail(`Expected 400 for bad submit, got ${badSubmit.status}`);
        return;
    }
    pass('Rejected incorrect submission');

    // Submit with correct count
    const answerKey = firstSet.map(q => q.correctAnswer);
    const goodSubmit = await request('POST', '/api/submit', {
        userId: 'system-test-user',
        answers: answerKey,
        correctCount: 10
    });

    if (goodSubmit.status !== 200) {
        fail(`Expected 200 for good submit, got ${goodSubmit.status}`);
        return;
    }
    pass('Accepted correct submission');

    // Leaderboard
    const leaderboard = await request('GET', '/api/leaderboard');
    const entries = (leaderboard.json && leaderboard.json.leaderboard) || [];
    if (leaderboard.status !== 200 || entries.length < 1) {
        fail('Leaderboard did not update');
        return;
    }
    pass('Leaderboard updated');

    await runLoadSimulation();

    console.log('System checks complete');
}

run().catch((error) => {
    fail(`Unhandled error: ${error.message}`);
});
