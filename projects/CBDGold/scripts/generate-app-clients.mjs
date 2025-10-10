#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

if (process.env.SKIP_CLIENT_GEN === '1') {
  console.log('[generate:app-clients] SKIP_CLIENT_GEN=1, skipping Algokit project linking.');
  process.exit(0);
}

const result = spawnSync('algokit', ['project', 'link', '--all'], {
  stdio: 'inherit',
  shell: true,
});

if (result.error) {
  if (result.error.code === 'ENOENT') {
    console.warn('[generate:app-clients] Algokit CLI not found; skipping client generation.');
    console.warn('Set SKIP_CLIENT_GEN=1 to silence this warning in environments without Algokit.');
    process.exit(0);
  }
  console.error('[generate:app-clients] Failed to invoke Algokit CLI:', result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  console.error('[generate:app-clients] Algokit CLI exited with status', result.status);
  process.exit(result.status ?? 1);
}
