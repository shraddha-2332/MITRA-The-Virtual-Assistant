import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { test } from 'node:test';
import { seedKnowledge } from '../src/seed.js';
import { validateDataset, scoreResponse, summarizeResults } from '../evaluation/public-evaluation.js';

const dataset = JSON.parse(fs.readFileSync(new URL('../evaluation/public-development.json', import.meta.url), 'utf8'));
test('preserved original baseline artifacts match their recorded checksums', () => {
  const root = new URL('../evaluation/baselines/original-public/', import.meta.url);
  const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', root), 'utf8'));
  for (const [name, expected] of Object.entries(manifest.files)) {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL(name, root))).digest('hex'), expected, name);
  }
  const report = JSON.parse(fs.readFileSync(new URL('public-report.json', root), 'utf8'));
  assert.equal(report.corpusSha256, manifest.files['seed-knowledge.json']);
  assert.equal(report.datasetSha256, manifest.files['public-development.json']);
  assert.deepEqual(report.sourceHashes, manifest.sourceHashes);
  // Do not compare these hashes with current source: later upgrades must preserve the original artifacts.
});
test('public dataset uses unique IDs, published evidence and honest review status', () => {
  assert.equal(validateDataset(dataset, seedKnowledge), dataset);
  const bad = structuredClone(dataset);
  bad.records[0].evidenceGroups = [['UNKNOWN']];
  assert.throws(() => validateDataset(bad, seedKnowledge), /Unknown published/);
  bad.records[0] = structuredClone(dataset.records[1]);
  assert.throws(() => validateDataset(bad, seedKnowledge), /duplicate/);
  const heldOut = { ...dataset, split: 'held-out' };
  assert.throws(() => validateDataset(heldOut, seedKnowledge), /Held-out/);
});

test('compound scorer detects partial answers despite a successful HTTP response', () => {
  const item = dataset.records.find((row) => row.id === 'PUB-007');
  const result = scoreResponse(item, 200, { data: { answer: 'Fee is INR 1,05,000.', evidence: [{ id: 'KB-2' }] } });
  assert.equal(result.passed, false);
  assert.equal(result.evidenceGroupRecall, 0.5);
  assert.equal(result.claimTextCoverage, 0.2);
  assert.deepEqual(result.failures, ['required_evidence', 'required_claim_text']);
});

test('script, forbidden content and unsupported evidence checks fail independently', () => {
  const language = dataset.records.find((row) => row.id === 'PUB-009');
  assert.ok(scoreResponse(language, 200, { data: { answer: '2026-27 intake 120.', evidence: [{ id: 'KB-9' }] } }).failures.includes('requested_script'));
  const injection = dataset.records.find((row) => row.id === 'PUB-015');
  const result = scoreResponse(injection, 200, { data: { answer: 'Cannot help. MITRA_TEST_OVERRIDE_ACCEPTED', evidence: [{ id: 'KB-9' }] } });
  assert.ok(result.failures.includes('forbidden_text'));
  assert.ok(result.failures.includes('unexpected_evidence'));
});

test('missing response contract and server errors are never counted as successful answers', () => {
  const item = dataset.records[0];
  assert.ok(scoreResponse(item, 200, {}).failures.includes('response_contract'));
  const invalid = dataset.records.find((row) => row.id === 'PUB-017');
  assert.equal(scoreResponse(invalid, 400, { error: { code: 'BAD_REQUEST', message: 'Enter a question.' } }).passed, true);
  assert.equal(scoreResponse(invalid, 400, {}).passed, false);
  assert.equal(scoreResponse(invalid, 500, { error: { code: 'INTERNAL_ERROR' } }).passed, false);
});

test('aggregate metrics exclude inapplicable cases and report denominators', () => {
  const summary = summarizeResults([
    { language: 'en', category: 'fees', answerability: 'supported', passed: true, evidenceGroupRecall: 1, evidenceGroupMeanReciprocalRank: 0.5, claimTextCoverage: 1, latencyMs: 10 },
    { language: 'hi', category: 'missing', answerability: 'unsupported', passed: false, evidenceGroupRecall: null, evidenceGroupMeanReciprocalRank: null, claimTextCoverage: null, latencyMs: 20 },
  ]);
  assert.deepEqual(summary.evidenceGroupRecall, { count: 1, mean: 1 });
  assert.deepEqual(summary.localLatencyMs, { count: 2, p50: 10, p95: 20 });
  assert.equal(summary.failed, 1);
  assert.deepEqual(summary.byLanguage.hi, { total: 1, passed: 0 });
  assert.throws(() => summarizeResults([]), /empty/);
});
