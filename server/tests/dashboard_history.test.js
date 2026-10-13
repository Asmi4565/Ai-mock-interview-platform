// Automated Test Suite for Phase 6 (Dashboard, History & Progress Tracking)
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
  console.log('🧪 Starting Phase 6 Automated Verification Tests (Dashboard Stats & History API)...\n');
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
    // 1. Unauthenticated request to /api/dashboard/stats -> 401
    const dashNoAuth = await makeRequest('GET', '/api/dashboard/stats');
    assert(dashNoAuth.status === 401, 'Get dashboard stats without token returns 401 Unauthorized', JSON.stringify(dashNoAuth.body));

    // 2. Unauthenticated request to /api/sessions -> 401
    const histNoAuth = await makeRequest('GET', '/api/sessions');
    assert(histNoAuth.status === 401, 'Get sessions history without token returns 401 Unauthorized', JSON.stringify(histNoAuth.body));

    // 3. Unauthenticated request to delete session -> 401
    const delNoAuth = await makeRequest('DELETE', '/api/sessions/64e83c271014a60123456789');
    assert(delNoAuth.status === 401, 'Delete session without token returns 401 Unauthorized', JSON.stringify(delNoAuth.body));

    // 4. Invalid token request to dashboard stats -> 401
    const dashBadToken = await makeRequest('GET', '/api/dashboard/stats', null, 'malformed-jwt-token');
    assert(dashBadToken.status === 401, 'Get dashboard stats with malformed token returns 401 Unauthorized', JSON.stringify(dashBadToken.body));

    console.log(`\n📊 Test Results: ${passed}/${total} assertions passed.\n`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
};

runTests();
