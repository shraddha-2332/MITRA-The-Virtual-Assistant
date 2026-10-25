import fs from 'node:fs';
import path from 'node:path';
import { config } from '../src/config.js';
import { resetDbForTests, closeDb } from '../src/store.js';
import { createServer } from '../src/server.js';
config.databaseFile = ':memory:';
config.geminiApiKey = '';
config.publicAssistantRateLimitMax = 10000;
resetDbForTests();
const server = createServer();
const questions = ['What are first year Open fees?', 'What is the current CSE intake?', 'What are hostel and mess fees?', 'What is the weather today?'];
const total = 100, concurrency = 5;
let next = 0;
const results = [];
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const started = performance.now();
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < total) {
      const index = next++;
      const begin = performance.now();
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/public-assistant/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: questions[index % questions.length] }) });
      const payload = await response.json();
      results.push({ status: response.status, validAnswer: typeof payload.data?.answer === 'string' && payload.data.answer.length > 0, ms: performance.now() - begin });
    }
  }));
  const durationMs = performance.now() - started;
  const timings = results.map(item => item.ms).sort((a, b) => a - b);
  const report = { version: 1, generatedAt: new Date().toISOString(), node: process.version, platform: process.platform,
    scope: 'Local seeded in-memory HTTP smoke only; Gemini disabled, limiter raised, independent browser sessions, no disk/network/cloud/production capacity claim.',
    total, concurrency, passed: results.filter(item => item.status === 200 && item.validAnswer).length,
    durationMs, requestsPerSecond: total / (durationMs / 1000), p50Ms: timings[Math.ceil(total * .5) - 1], p95Ms: timings[Math.ceil(total * .95) - 1] };
  fs.mkdirSync('evaluation/reports', { recursive: true });
  fs.writeFileSync(path.join('evaluation/reports', 'local-load-latest.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (report.passed !== total) process.exitCode = 1;
} finally { if (server.listening) await new Promise(resolve => server.close(resolve)); closeDb(); }
