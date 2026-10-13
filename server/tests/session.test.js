// Automated Test Suite for Interview Setup & Session Flow (Phase 4)
import http from 'http';
import jwt from 'jsonwebtoken';

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
  console.log('🧪 Starting Phase 4 Automated Verification Tests (Interview Session API)...\n');
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
    // 1. /api/interview-options without token -> 401
    const optNoToken = await makeRequest('GET', '/api/interview-options');
    assert(optNoToken.status === 401, 'Interview options without auth returns 401 Unauthorized', JSON.stringify(optNoToken.body));

    // Generate a valid JWT token signed with JWT_SECRET for testing route behavior
    const testUserId = '64e83c271014a60123456789';
    const otherUserId = '64e83c271014a60123456799';
    const testToken = jwt.sign({ id: testUserId }, JWT_SECRET, { expiresIn: '1h' });

    // 2. /api/sessions without token -> 401
    const sessNoToken = await makeRequest('POST', '/api/sessions', {});
    assert(sessNoToken.status === 401, 'Creating session without token returns 401 Unauthorized', JSON.stringify(sessNoToken.body));

    // 3. /api/sessions list without token -> 401
    const listNoToken = await makeRequest('GET', '/api/sessions');
    assert(listNoToken.status === 401, 'Listing sessions without token returns 401 Unauthorized', JSON.stringify(listNoToken.body));

    // 4. Submit answer without token -> 401
    const ansNoToken = await makeRequest('POST', `/api/sessions/64e83c271014a60123456789/answers`, {
      questionIndex: 0,
      answerText: 'My answer',
    });
    assert(ansNoToken.status === 401, 'Submitting answer without token returns 401 Unauthorized', JSON.stringify(ansNoToken.body));

    // 5. Complete session without token -> 401
    const compNoToken = await makeRequest('POST', `/api/sessions/64e83c271014a60123456789/complete`);
    assert(compNoToken.status === 401, 'Completing session without token returns 401 Unauthorized', JSON.stringify(compNoToken.body));

    // 6. Delete session without token -> 401
    const delNoToken = await makeRequest('DELETE', `/api/sessions/64e83c271014a60123456789`);
    assert(delNoToken.status === 401, 'Deleting session without token returns 401 Unauthorized', JSON.stringify(delNoToken.body));

    // 7. Invalid answer submission payload validation (empty answer text) -> returns 401 without auth or 400 with invalid payload
    const ansBadPayload = await makeRequest('POST', `/api/sessions/64e83c271014a60123456789/answers`, {
      questionIndex: 'not-a-number',
    }, testToken);
    // Even if user not found in DB or invalid payload, should cleanly reject without crashing
    assert(ansBadPayload.status === 400 || ansBadPayload.status === 401, 'Rejects invalid answer payload or missing user cleanly', JSON.stringify(ansBadPayload.body));

    console.log(`\n📊 Test Results: ${passed}/${total} assertions passed.\n`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
};

runTests();
