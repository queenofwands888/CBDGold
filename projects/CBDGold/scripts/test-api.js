#!/usr/bin/env node
/* Simple integration smoke test for backend API */
import http from 'node:http';

const BASE = process.env.TEST_BASE || 'http://localhost:3001';

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(BASE + path, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(new Error('timeout')); });
  });
}

(async () => {
  const results = {};
  try {
    results.health = await get('/health');
    results.products = await get('/api/products');
    const ok = results.health.status === 200 && results.products.status === 200;
    console.log(JSON.stringify({
      ok, results: {
        healthStatus: results.health.status,
        productsStatus: results.products.status,
        productsSample: results.products.data?.slice(0, 180)
      }
    }, null, 2));
    process.exit(ok ? 0 : 1);
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: e.message }));
    process.exit(1);
  }
})();
