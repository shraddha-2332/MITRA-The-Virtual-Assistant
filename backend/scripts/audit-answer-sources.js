import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { config } from '../src/config.js';
import { createSeedData } from '../src/seed.js';
import { resetDbForTests, closeDb } from '../src/store.js';
import { answerAdmissionQuestion, resetRuntimeStateForTests } from '../src/server.js';
import { resolveSourceUrl } from '../src/source-links.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'docs/answer-audit');
fs.mkdirSync(output, { recursive: true });
const originalDatabase = config.databaseFile;
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mitra-answer-audit-'));
config.databaseFile = path.join(temporary, 'audit.sqlite');
config.geminiApiKey = '';
const questions = [...new Set([
  'Which B.Tech programmes are available at MITCORER?', 'What is the current CSE intake?',
  'Which Polytechnic courses are available?', 'Which Direct Second Year programmes are available?',
  'What is the fee structure?', 'What are the first-year B.Tech fees?', 'What are DSE fees?',
  'What are first-year Open category fees?', 'What are the fees for OBC girls?', 'What are SC ST fees?',
  'What are hostel and mess fees?', 'What are hostel fees?', 'What are mess fees?',
  'Are fees semester-wise?', 'Can I pay in installments?', 'What documents are required for admission?',
  'What documents are needed for SC students?', 'What documents are needed for OBC students?',
  'What is B.Tech eligibility?', 'Which entrance exams are accepted?', 'How does the CAP process work?',
  'How do I apply for institute-level admission?', 'What is the last admission date?',
  'What is the historical 2024 CSE cutoff?', 'What is the historical 2025 CSE cutoff?',
  'Show the 2024 seat matrix.', 'What scholarships are available?', 'What is the Pragati scholarship?',
  'Can a non-CAP student get a scholarship?', 'Tell me about MITCORER.', 'Why choose MITCORER?',
  'What are the placement highlights?', 'Who are the recruiters?', 'Is internship assistance available?',
  'What campus facilities are available?', 'Tell me about the library.', 'Is Wi-Fi available?',
  'Are laboratories and workshops available?', 'Are hostels available?', 'Is there a mess?',
  'Are sports and gym facilities available?', 'What is the railway model room?', 'Is a cafeteria available?',
  'Is a computer center available?', 'Are seminar halls available?', 'Are classrooms available?',
  'What bus routes and fees are available?', 'What is the attendance requirement?',
  'Is biometric attendance required?', 'How do I contact the college?', 'How do I reach the college?',
  'What are fees and hostel fees?', 'List B.Tech programmes and fees.',
  'Tell me about the library and bus facility.', 'What is its intake?', 'What is the weather today?',
  'What are fees for AY 2030-31?', 'What are Polytechnic fees?',
  'What are DSE fees for AY 2030-31?', 'What are Polytechnic fees for AY 2025-26?',
  ...[...fs.readFileSync(path.join(root, 'frontend/src/App.jsx'), 'utf8').split('const quickReplies = [')[1].split('const endRef')[0].matchAll(/question: '([^']+)'/g)].map(match => match[1]),
])];
const report = { checkedAt: new Date().toISOString(), questions, corpora: {}, links: [] };
const corpora = { seeded: createSeedData() };
if (fs.existsSync(originalDatabase)) {
  const db = new DatabaseSync(originalDatabase, { readOnly: true });
  try {
    const columns = db.prepare('PRAGMA table_info(collections)').all();
    const rows = db.prepare('SELECT * FROM collections').all();
    const nameKey = columns.find(column => ['name', 'collection', 'key'].includes(column.name))?.name;
    const valueKey = columns.find(column => ['data', 'value', 'json', 'payload'].includes(column.name))?.name;
    if (!nameKey || !valueKey) throw new Error('Unrecognised database snapshot schema');
    const snapshots = Object.fromEntries(rows.map(row => [row[nameKey], JSON.parse(row[valueKey])]));
    corpora.maintained = snapshots.app || snapshots;
  } finally { db.close(); }
}
try {
  for (const [name, corpus] of Object.entries(corpora)) {
    resetDbForTests(corpus);
    report.corpora[name] = [];
    for (const language of ['en', 'mr', 'hi']) for (const question of questions) {
      resetRuntimeStateForTests();
      const answer = await answerAdmissionQuestion({ question, language }, null);
      report.corpora[name].push({ question, language, ...answer });
    }
  }
  const urls = new Set();
  for (const corpus of Object.values(corpora)) {
    for (const record of [...(corpus.knowledge || []), ...(corpus.officialSources || [])]) if (record.sourceUrl) urls.add(record.sourceUrl);
  }
  for (const cases of Object.values(report.corpora)) for (const answer of cases) {
    if (answer.sourceUrl) urls.add(answer.sourceUrl);
    for (const link of answer.officialLinks || []) urls.add(link.url);
  }
  for (const file of ['backend/src/server.js', 'frontend/src/App.jsx']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/https:\/\/[^'"\s<>`)}]+/g)) if (!match[0].includes('${') && !match[0].includes('googleapis.com')) urls.add(match[0]);
  }
  const pending = [...urls];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (pending.length) {
      const url = pending.shift();
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 MitraSourceAudit' } });
        const contentType = response.headers.get('content-type') || '';
        const bytes = await response.arrayBuffer();
        const html = /html|text/.test(contentType) ? new TextDecoder().decode(bytes) : '';
        const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
        const softError = /404|page not found|access denied|just a moment|captcha/i.test(title);
        report.links.push({ url, finalUrl: response.url, status: response.status, contentType, bytes: bytes.byteLength, title, statusLabel: response.ok && !softError ? 'reachable' : 'unverified-or-failed' });
        const cache = path.join(root, 'frontend/tmp/source-audit');
        fs.mkdirSync(cache, { recursive: true });
        if (html) fs.writeFileSync(path.join(cache, `page-${Buffer.from(url).toString('base64url')}.txt`), html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
      } catch (error) { report.links.push({ url, statusLabel: 'unverified-or-failed', error: error.cause?.code || error.message }); }
    }
  }));
  report.links.sort((a, b) => a.url.localeCompare(b.url));
  const emitted = new Set(Object.values(report.corpora).flatMap(cases => cases.flatMap(answer => [answer.sourceUrl, ...(answer.officialLinks || []).map(link => link.url)]).filter(Boolean)));
  for (const link of report.links) {
    link.emittedByAssistant = emitted.has(link.url);
    if (resolveSourceUrl(link.url) !== link.url) link.replacementUrl = resolveSourceUrl(link.url);
  }
  fs.writeFileSync(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ cases: Object.fromEntries(Object.entries(report.corpora).map(([name, cases]) => [name, cases.length])), links: report.links.length, failed: report.links.filter(link => link.statusLabel !== 'reachable') }, null, 2));
} finally {
  closeDb();
  if (path.dirname(temporary) !== path.resolve(os.tmpdir()) || !path.basename(temporary).startsWith('mitra-answer-audit-')) throw new Error('Unsafe cleanup path');
  fs.rmSync(temporary, { recursive: true, force: true });
}
