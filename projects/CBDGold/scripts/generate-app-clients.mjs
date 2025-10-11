#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contractsDir = join(__dirname, '..', 'src', 'contracts');

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

if (result.status === 127) {
  console.warn('[generate:app-clients] Algokit CLI executable not found (exit 127); skipping client generation.');
  console.warn('Set SKIP_CLIENT_GEN=1 to silence this warning in environments without Algokit.');
  process.exit(0);
}

if (result.status !== 0) {
  console.error('[generate:app-clients] Algokit CLI exited with status', result.status);
  process.exit(result.status ?? 1);
}

applyBareCallTypePatch();

function applyBareCallTypePatch() {
  const targets = [
    'CBDGoldStaking.ts',
    'CBDGoldPrize.ts',
    'CBDGoldGovernance.ts',
  ];

  const helperBlock = `type BareCallOnComplete =
  | OnApplicationComplete.NoOpOC
  | OnApplicationComplete.OptInOC
  | OnApplicationComplete.CloseOutOC
  | OnApplicationComplete.ClearStateOC
  | OnApplicationComplete.DeleteApplicationOC

type BareCallParams = Expand<Omit<AppClientBareCallParams, 'onComplete'> & { onComplete?: BareCallOnComplete }>
type BareCallParamsWithCompilation = Expand<Omit<AppClientBareCallParams & AppClientCompilationParams, 'onComplete'> & { onComplete?: BareCallOnComplete }>
type BareCallParamsWithSend = Expand<Omit<AppClientBareCallParams & SendParams, 'onComplete'> & { onComplete?: BareCallOnComplete }>
type BareCallParamsWithSendAndCompilation = Expand<Omit<AppClientBareCallParams & AppClientCompilationParams & SendParams, 'onComplete'> & { onComplete?: BareCallOnComplete }>

`;

  targets.forEach((file) => {
    const path = join(contractsDir, file);
    if (!existsSync(path)) return;

    let content = readFileSync(path, 'utf8');

    if (!content.includes('type BareCallOnComplete')) {
      const expandIndex = content.indexOf('export type Expand<');
      if (expandIndex === -1) return;
      const insertIndex = content.indexOf('\n\n', expandIndex);
      const splitIndex = insertIndex === -1 ? expandIndex : insertIndex + 2;
      content = `${content.slice(0, splitIndex)}${helperBlock}${content.slice(splitIndex)}`;
    }

    content = content
      .replace(/Expand<AppClientBareCallParams & AppClientCompilationParams & SendParams\s*&\s*{onComplete\?:[^}]+}>/g, 'BareCallParamsWithSendAndCompilation')
      .replace(/Expand<AppClientBareCallParams & AppClientCompilationParams & SendParams>/g, 'BareCallParamsWithSendAndCompilation')
      .replace(/Expand<AppClientBareCallParams & AppClientCompilationParams\s*&\s*{onComplete\?:[^}]+}>/g, 'BareCallParamsWithCompilation')
      .replace(/Expand<AppClientBareCallParams & AppClientCompilationParams>/g, 'BareCallParamsWithCompilation')
      .replace(/Expand<AppClientBareCallParams & SendParams\s*&\s*{onComplete\?:[^}]+}>/g, 'BareCallParamsWithSend')
      .replace(/Expand<AppClientBareCallParams & SendParams>/g, 'BareCallParamsWithSend')
      .replace(/Expand<AppClientBareCallParams\s*&\s*{onComplete\?:[^}]+}>/g, 'BareCallParams')
      .replace(/Expand<AppClientBareCallParams>/g, 'BareCallParams')
      .replace(/AppClientBareCallParams & {onComplete\?:[^}]+}/g, 'BareCallParams');

    writeFileSync(path, content);
  });
}
