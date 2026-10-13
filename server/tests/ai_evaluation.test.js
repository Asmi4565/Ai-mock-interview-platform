// Automated Test Suite for AI Evaluation & Retry Service (Phase 5)
import http from 'http';
import jwt from 'jsonwebtoken';
import { evaluateAnswerWithAI, MissingCredentialsError } from '../services/aiService.js';

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = 'super_secret_dev_jwt_key_2026_fsd';

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting Phase 5 Automated Verification Tests (AI Evaluation & Missing Key Detection)...\n');
  let passed = 0;
  let total = 0;

  const assert = (condition, name, details = '') => {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} -> ${details}`);
    }
  };

  try {
    const fakeSessionId = '64e83c271014a60123456789';

    // 1. Unauthenticated evaluation request -> 401
    const evalNoAuth = await makeRequest('POST', `/api/sessions/${fakeSessionId}/answers/0/evaluate`);
    assert(evalNoAuth.status === 401, 'Evaluate answer without token returns 401 Unauthorized', JSON.stringify(evalNoAuth.body));

    // 2. Unauthenticated retry request -> 401
    const retryNoAuth = await makeRequest('POST', `/api/sessions/${fakeSessionId}/answers/0/retry`, {
      revisedAnswerText: 'Revised answer',
    });
    assert(retryNoAuth.status === 401, 'Retry answer without token returns 401 Unauthorized', JSON.stringify(retryNoAuth.body));

    // 3. Unauthenticated feedback get request -> 401
    const feedNoAuth = await makeRequest('GET', `/api/sessions/${fakeSessionId}/feedback`);
    assert(feedNoAuth.status === 401, 'Get feedback without token returns 401 Unauthorized', JSON.stringify(feedNoAuth.body));

    // 4. Missing Credentials Detection: Directly verify aiService detects empty/missing key
    const originalKey = process.env.AI_API_KEY;
    process.env.AI_API_KEY = ''; // Simulate missing key

    let threwExpectedError = false;
    try {
      await evaluateAnswerWithAI({
        role: 'Full Stack Developer',
        interviewType: 'Technical Fundamentals',
        difficulty: 'Beginner',
        questionPrompt: 'What is an event loop?',
        studentAnswer: 'The event loop handles asynchronous callbacks.',
      });
    } catch (err) {
      if (err instanceof MissingCredentialsError) {
        threwExpectedError = true;
      }
    }
    process.env.AI_API_KEY = originalKey; // Restore

    assert(threwExpectedError, 'aiService throws MissingCredentialsError when AI_API_KEY is not configured instead of returning fake feedback');

    console.log(`\n📊 Test Results: ${passed}/${total} assertions passed.\n`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
};

runTests();
