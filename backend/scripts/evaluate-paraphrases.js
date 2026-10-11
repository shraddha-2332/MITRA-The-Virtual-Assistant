import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.js';
import { createSeedData } from '../src/seed.js';
import { resetDbForTests } from '../src/store.js';
import { createServer, resetRuntimeStateForTests, retrieveKnowledge, normalizeIntentText } from '../src/server.js';
import { createBm25 } from '../src/bm25.js';
import { checkParaphrase } from '../evaluation/paraphrase-checks.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const dataset = JSON.parse(fs.readFileSync(path.join(root, 'evaluation/heldout-candidates.json')));
const snapshot = JSON.parse(fs.readFileSync(path.join(root, '../docs/retrieval-review/corpus.json')));
if (sha(JSON.stringify(snapshot.records)) !== dataset.corpusSha256) throw new Error('Corpus mismatch');
const ledgerFile = path.join(root, 'evaluation/paraphrase-exposure.json');
const ledger = { version: 1, datasetSha256: sha(JSON.stringify(dataset)), corpusSha256: dataset.corpusSha256,
  status: 'exposed-development-diagnostics', reason: 'User requested completing candidate tests; questions are now used for diagnostics and must not be claimed as untouched held-out evaluation.',
  cases: dataset.records.map(item => ({ id: item.id, questionSha256: sha(item.question) })) };
// Record exposure before running so even a failed run cannot retain an unexposed claim.
fs.writeFileSync(ledgerFile, `${JSON.stringify(ledger, null, 2)}\n`);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mitra-paraphrase-'));
function cleanup() {
  if (path.dirname(temporary) !== path.resolve(os.tmpdir()) || !path.basename(temporary).startsWith('mitra-paraphrase-')) throw new Error('Unsafe cleanup');
  fs.rmSync(temporary, { recursive: true, force: true });
}
const seed = createSeedData(); seed.knowledge = structuredClone(snapshot.records);
config.databaseFile = path.join(temporary, 'test.sqlite'); config.geminiApiKey = '';
resetDbForTests(seed);
const server = createServer();
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const bm25 = createBm25(snapshot.records);
  const rows = [];
  for (const item of dataset.records) {
    resetRuntimeStateForTests();
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/public-assistant/ask`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: item.question, language: item.language }), signal: AbortSignal.timeout(20_000),
    });
    const payload = await response.json();
    const data = payload.data;
    const errors = [];
    if (response.status !== 200) errors.push('http_status');
    if (!data || typeof data.answer !== 'string' || !data.answer.trim() || !Array.isArray(data.evidence)) errors.push('response_contract');
    if (data?.requestedLanguage !== item.language) errors.push('language_preference');
    if (item.language !== 'en' && !/[\u0900-\u097f]/u.test(data?.answer || '')) errors.push('native_notice_or_answer');
    const diagnosticFailures = checkParaphrase(item.id, data, snapshot.records);
    rows.push({ ...item, split: 'development', contractPassed: errors.length === 0, errors, diagnosticFailures, diagnosticPassed: diagnosticFailures.length === 0,
      rankings: { keyword: retrieveKnowledge(item.question).map(r => r.id), bm25Raw: bm25(item.question).map(r => r.id), bm25Normalized: bm25(normalizeIntentText(item.question)).map(r => r.id) },
      status: response.status, response: payload, semanticReviewStatus: 'unreviewed' });
  }
  const hashes = Object.fromEntries(fs.readdirSync(path.join(root, 'src')).filter(file => file.endsWith('.js')).map(file => [file, sha(fs.readFileSync(path.join(root, 'src', file)))]));
  const report = { generatedAt: new Date().toISOString(), split: 'development', reviewStatus: 'unreviewed', corpusSha256: dataset.corpusSha256, sourceHashes: hashes, modelCalls: 0,
    limitations: ['Contract checks only; no answer accuracy or retrieval relevance score without reviewed judgments.', 'These exposed questions are retired as held-out candidates.', 'Native script does not establish fluency.'],
    summary: { cases: rows.length, contractPassed: rows.filter(r => r.contractPassed).length, developerDiagnosticPassed: rows.filter(r => r.diagnosticPassed).length, semanticReviewed: 0 }, rows };
  fs.mkdirSync(path.join(root, 'evaluation/reports'), { recursive: true });
  fs.writeFileSync(path.join(root, 'evaluation/reports/paraphrases-latest.json'), `${JSON.stringify(report, null, 2)}\n`);
  const markdown = ['# Completed paraphrase diagnostics — review required', '', 'These 24 cases are now development diagnostics, not held-out questions. Contract checks do not establish factual correctness. Fill in reviewer meaning, completeness, uncertainty and citation judgments before reporting answer accuracy.', '', ...rows.flatMap(row => [`## ${row.id} (${row.language}): ${row.question}`, '', `HTTP contract: ${row.contractPassed ? 'passed' : row.errors.join(', ')}`, '', row.response.data?.answer || JSON.stringify(row.response.error), '', `Evidence IDs: ${(row.response.data?.evidence || []).map(r => r.id).join(', ') || 'none'}`, '', 'Correct / incomplete / incorrect / appropriate refusal: __________', '', 'Reviewer / date / corrections: __________', ''])].join('\n');
  fs.writeFileSync(path.join(root, '../docs/retrieval-review/PARAPHRASE_RESULTS.md'), `${markdown}\n`);
  console.log(JSON.stringify(report.summary));
  if (rows.some(row => !row.contractPassed || !row.diagnosticPassed)) {
    console.log(JSON.stringify(rows.filter(row => !row.diagnosticPassed).map(row => ({ id: row.id, failures: row.diagnosticFailures }))));
    process.exitCode = 1;
  }
} finally {
  if (server.listening) await new Promise(resolve => server.close(resolve));
  resetDbForTests({}); cleanup();
}
