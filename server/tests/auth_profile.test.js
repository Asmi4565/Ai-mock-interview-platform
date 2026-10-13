// Automated Test Suite for Authentication & Profile Management
import http from 'http';

const BASE_URL = 'http://localhost:5000';

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
  console.log('🧪 Starting Phase 3 Automated Verification Tests...\n');
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
    // 1. Health check
    const health = await makeRequest('GET', '/api/health');
    assert(health.status === 200 && health.body.success, 'Health check responds 200 OK');

    // 2. Register: Missing name
    const regNoName = await makeRequest('POST', '/api/auth/register', {
      email: 'test@college.edu',
      password: 'password123',
    });
    assert(regNoName.status === 400, 'Register fails when name is missing', JSON.stringify(regNoName.body));

    // 3. Register: Invalid email
    const regBadEmail = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Student',
      email: 'invalid-email',
      password: 'password123',
    });
    assert(regBadEmail.status === 400, 'Register fails with malformed email', JSON.stringify(regBadEmail.body));

    // 4. Register: Short password
    const regShortPass = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Student',
      email: 'test@college.edu',
      password: '123',
    });
    assert(regShortPass.status === 400, 'Register fails with password < 6 chars', JSON.stringify(regShortPass.body));

    // 5. Login: Missing fields
    const loginEmpty = await makeRequest('POST', '/api/auth/login', {});
    assert(loginEmpty.status === 400, 'Login fails with empty payload', JSON.stringify(loginEmpty.body));

    // 6. Protected Route: Profile without token
    const profNoToken = await makeRequest('GET', '/api/profile');
    assert(profNoToken.status === 401, 'Accessing /api/profile without token returns 401 Unauthorized', JSON.stringify(profNoToken.body));

    // 7. Protected Route: Profile with invalid fake token
    const profBadToken = await makeRequest('GET', '/api/profile', null, 'fake-token-xyz');
    assert(profBadToken.status === 401, 'Accessing /api/profile with invalid token returns 401', JSON.stringify(profBadToken.body));

    // 8. Protected Route: Auth /me without token
    const meNoToken = await makeRequest('GET', '/api/auth/me');
    assert(meNoToken.status === 401, 'Accessing /api/auth/me without token returns 401', JSON.stringify(meNoToken.body));

    console.log(`\n📊 Test Results: ${passed}/${total} assertions passed.\n`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
};

runTests();
