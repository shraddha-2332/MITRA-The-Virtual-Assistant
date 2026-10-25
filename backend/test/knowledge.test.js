import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateFacts, validateKnowledgeFields, renderFactText, buildMaintainedAnswer, extractPublicFacts } from '../src/knowledge.js';
import { createSeedData } from '../src/seed.js';

test('structured facts reject invalid numbers, year ranges, duplicate programmes and unknown keys', () => {
  const fee = createSeedData().knowledge.find((item) => item.id === 'KB-2').facts;
  for (const invalid of [-1, 1.2, null, '105000', Infinity]) {
    const facts = structuredClone(fee); facts.firstYear.open = invalid;
    assert.throws(() => validateFacts(facts), (error) => error.status === 400);
  }
  assert.throws(() => validateFacts({ ...fee, academicYear: '2026-29' }), /academic year/);
  assert.throws(() => validateFacts({ ...fee, unexpected: true }), /fields/);
  const programs = createSeedData().knowledge.find((item) => item.id === 'KB-10').facts;
  assert.throws(() => validateFacts({ ...programs, programs: [programs.programs[0], programs.programs[0]] }), /unique/);
});

test('structured edits regenerate text and prevent conflicting prose or changing a reserved fact type', () => {
  const original = createSeedData().knowledge.find((item) => item.id === 'KB-2');
  const facts = structuredClone(original.facts); facts.firstYear.open = 111111;
  const updated = validateKnowledgeFields({ facts, expectedRevision: 0 }, original);
  assert.match(updated.text, /1,11,111/);
  assert.doesNotMatch(updated.text, /1,05,000/);
  assert.equal(original.facts.firstYear.open, 105000);
  assert.throws(() => validateKnowledgeFields({ text: 'Conflicting fee' }, original), /generated/);
  assert.throws(() => validateKnowledgeFields({ facts: createSeedData().knowledge.find((item) => item.id === 'KB-3').facts }, original), /designated/);
});

test('maintenance validation rejects unsafe links, arbitrary fields and publication states', () => {
  const original = createSeedData().knowledge.find((item) => item.id === 'KB-17');
  for (const sourceUrl of ['javascript:alert(1)', 'data:text/html,test', 'https://user:pass@example.com']) {
    assert.throws(() => validateKnowledgeFields({ sourceUrl }, original), (error) => error.status === 400);
  }
  assert.throws(() => validateKnowledgeFields({ id: 'KB-OTHER' }, original), /fields/);
  assert.throws(() => validateKnowledgeFields({ status: 'Approved' }, original), /status/);
  assert.throws(() => validateKnowledgeFields({ expectedRevision: 0 }, original), /at least one/);
});

test('maintained answers pin their source and decline unavailable years or retired canonical records', () => {
  const knowledge = createSeedData().knowledge;
  const record = knowledge.find((item) => item.id === 'KB-2');
  record.facts.firstYear.open = 111111;
  record.source = 'Revised circular';
  record.text = renderFactText(record.facts);
  const answer = buildMaintainedAnswer('First year open fee 2026-27', 'first year open fee 2026-27', knowledge);
  assert.match(answer.answer, /1,11,111/);
  assert.equal(answer.source, 'Revised circular');
  assert.deepEqual(answer.evidence.map((item) => item.id), ['KB-2']);
  assert.deepEqual(buildMaintainedAnswer('First year fee 2030-31', 'first year fee 2030-31', knowledge).evidence, []);
  record.status = 'Retired';
  assert.deepEqual(buildMaintainedAnswer('First year fee', 'first year fee', knowledge).evidence, []);
});

test('legacy plain text is used directly without silently reinstating seeded figures', () => {
  const record = { id: 'KB-2', text: 'Reviewed fee for AY 2026-27 is INR 12,345.', source: 'Updated circular', status: 'Published' };
  const answer = buildMaintainedAnswer('First year fee', 'first year fee', [record]);
  assert.equal(answer.answer, record.text);
});

test('public facts exclude retired, conflicting and invalid canonical records without reviving alternatives', () => {
  const knowledge = createSeedData().knowledge;
  const fee = knowledge.find(record => record.id === 'KB-2');
  fee.status = 'Retired';
  assert.equal(extractPublicFacts(knowledge).academicFees, null);
  assert.equal(extractPublicFacts(knowledge).academicYear, null);
  fee.status = 'Published';
  const conflicting = structuredClone(fee);
  conflicting.id = 'KB-CONFLICT';
  conflicting.facts.firstYear.open = 123456;
  assert.equal(extractPublicFacts([...knowledge, conflicting]).academicFees, null);
  fee.facts.firstYear.open = -1;
  assert.equal(extractPublicFacts(knowledge).academicFees, null);
});
