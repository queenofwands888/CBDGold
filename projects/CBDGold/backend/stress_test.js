#!/usr/bin/env node
// Automated stress test for CBDGold backend
// Usage: node stress_test.js

const axios = require('axios');
const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_TEXT = 'CBDGold stress test';
const NUM_REQUESTS = 120; // Exceeds default rate limit
const CONCURRENCY = 10;

async function runHealthCheck() {
  try {
    const res = await axios.get(`${API_URL}/health`);
    console.log('Health:', res.data);
  } catch (err) {
    console.error('Health check failed:', err.response?.data || err.message);
  }
}

async function runHuggingFaceFlood() {
  let success = 0, rateLimited = 0, errors = 0;
  const requests = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    requests.push(
      axios.post(`${API_URL}/api/huggingface/query`, { text: TEST_TEXT })
        .then(() => { success++; })
        .catch(err => {
          if (err.response?.status === 429) rateLimited++;
          else errors++;
        })
    );
    if (requests.length % CONCURRENCY === 0) await Promise.all(requests.splice(0, CONCURRENCY));
  }
  await Promise.all(requests);
  console.log(`HuggingFace Flood: Success=${success}, RateLimited=${rateLimited}, Errors=${errors}`);
}

async function runInvalidPayloadTest() {
  try {
    const res = await axios.post(`${API_URL}/api/huggingface/query`, { text: '<script>alert(1)</script>'.repeat(1000) });
    console.log('Invalid payload response:', res.data);
  } catch (err) {
    console.error('Invalid payload test:', err.response?.data || err.message);
  }
}

async function runCORSCheck() {
  // Manual: Use curl or browser from unauthorized origin
  console.log('CORS check: Please manually test from unauthorized origin.');
}

async function main() {
  console.log('--- CBDGold Backend Stress Test ---');
  await runHealthCheck();
  await runHuggingFaceFlood();
  await runInvalidPayloadTest();
  await runCORSCheck();
  console.log('--- Test Complete ---');
}

main();
