import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { config } from '../src/config.js';
import { createSeedData, seedKnowledge } from '../src/seed.js';
import { resetDbForTests } from '../src/store.js';
import { createServer, resetRuntimeStateForTests } from '../src/server.js';
import { validateDataset, scoreResponse, summarizeResults } from '../evaluation/public-evaluation.js';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const options = process.argv.slice(2);
if (options.some((option) => option !== '--strict')) throw new Error('Usage: npm run evaluate:public -- [--strict]');
const datasetBytes = fs.readFileSync(path.join(backendRoot, 'evaluation/public-development.json'));
const dataset = validateDataset(JSON.parse(datasetBytes.toString('utf8')), seedKnowledge);
const corpus = JSON.stringify(seedKnowledge);
const sourceHashes = Object.fromEntries(fs.readdirSync(path.join(backendRoot, 'src')).filter((name) => name.endsWith('.js')).sort()
  .map((name) => [`src/${name}`, sha256(fs.readFileSync(path.join(backendRoot, 'src', name)))]));
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'mitra-public-evaluation-'));
config.databaseFile = path.join(workspace, 'evaluation.sqlite');
// This evaluator never loads .env, calls Gemini, or opens the application's database.
config.geminiApiKey = '';
resetDbForTests(createSeedData());
const server = createServer();
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const url = `http://127.0.0.1:${server.address().port}/api/public-assistant/ask`;
  const results = [];
  for (const item of dataset.records) {
    // Offline cases represent independent clients. Production limits stay unchanged.
    // Rate-limit correctness remains the responsibility of separate API tests.
    resetRuntimeStateForTests();
    const started = performance.now();
    let status = null;
    let payload = null;
    let transportError = null;
    try {
      const response = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: item.question }), signal: AbortSignal.timeout(20_000),
      });
      status = response.status;
      payload = await response.json();
    } catch (error) { transportError = error.name; }
    const scored = scoreResponse(item, status, payload);
    if (transportError) {
      scored.passed = false;
      scored.failures.push('transport_error');
    }
    results.push({ id: item.id, language: item.language, category: item.category, answerability: item.answerability,
      question: item.question, expectedStatus: item.expectedStatus, status,
      latencyMs: performance.now() - started, transportError, ...scored,
      errorCode: payload?.error?.code || null, model: payload?.data?.model || null,
      // Full response enables later human citation review; no private runtime data is loaded.
      response: payload,
    });
  }
  const report = {
    version: 1, generatedAt: new Date().toISOString(), endpoint: '/api/public-assistant/ask',
    mode: 'deterministic', split: dataset.split, reviewStatus: dataset.reviewStatus,
    nodeVersion: process.version, platform: process.platform,
    datasetSha256: sha256(datasetBytes), corpusSha256: sha256(corpus), sourceHashes,
    methodology: 'Independent loopback HTTP requests; seeded corpus; rate-limit state reset per case; no warmup; sequential single run.',
    limitations: ['Developer-authored unreviewed development cases; not held-out accuracy.',
      'Text inclusion checks do not establish factual correctness, entailment or citation support.',
      'Devanagari presence does not establish Hindi/Marathi fluency.',
      'Evidence groups reflect returned IDs, not internal passage-level retrieval or canonical TREC judgments.',
      'Local latency includes audit writes; it is not a load test or production SLA.'],
    modelCalls: 0, summary: summarizeResults(results), results,
  };
  const reportDir = path.join(backendRoot, 'evaluation/reports');
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, 'public-latest.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report.summary, report: 'evaluation/reports/public-latest.json',
    failures: results.filter((row) => !row.passed).map((row) => ({ id: row.id, checks: row.failures })) }, null, 2));
  if (options.includes('--strict') && report.summary.failed) process.exitCode = 1;
} finally {
  if (server.listening) await new Promise((resolve) => server.close(resolve));
  resetDbForTests({}); // closes the temporary SQLite connection before cleanup on Windows
  if (path.dirname(workspace) !== path.resolve(os.tmpdir()) || !path.basename(workspace).startsWith('mitra-public-evaluation-')) {
    throw new Error('Refusing cleanup outside the evaluation temporary directory.');
  }
  fs.rmSync(workspace, { recursive: true, force: true });
}
