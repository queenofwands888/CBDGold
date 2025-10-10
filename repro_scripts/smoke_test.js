// smoke_test.js
// Node.js script to run user-flow smoke tests against the deployed frontend/backend
// Usage: node smoke_test.js

const axios = require('axios');
const fs = require('fs');

async function main() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:5173';
  const endpoints = [
    '/',
    '/shop',
    '/staking',
    '/governance',
    '/api/health',
    '/api/assets',
    '/api/staking',
    '/api/governance',
  ];
  const results = [];
  for (const ep of endpoints) {
    try {
      const url = baseUrl + ep;
      const res = await axios.get(url);
      const msg = `[OK] ${url} - status ${res.status}`;
      console.log(msg);
      results.push(msg);
    } catch (e) {
      const msg = `[FAIL] ${baseUrl + ep}: ${e.message}`;
      console.error(msg);
      results.push(msg);
    }
  }
  // Write results to test_results.log
  fs.appendFileSync('../test_results.log', results.join('\n') + '\n');
}

main();
