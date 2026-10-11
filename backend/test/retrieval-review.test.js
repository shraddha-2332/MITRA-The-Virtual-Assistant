import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateHeldoutCandidate, assertUnexposedCandidates } from '../evaluation/heldout-validation.js';
const read = relative => JSON.parse(fs.readFileSync(new URL(relative, import.meta.url), 'utf8'));
const dataset = read('../evaluation/heldout-candidates.json');
const corpus = read('../../docs/retrieval-review/corpus.json').records;
const development = [...read('../evaluation/public-development.json').records, ...read('../evaluation/retrieval-development.json').records].map(item => item.question);
test('archived 24 multilingual candidates are structurally distinct and tied to the frozen corpus', () => {
  assert.equal(validateHeldoutCandidate(dataset, corpus, development).records.length, 24);
  assert.equal(dataset.records.filter(item => item.language === 'mr').length, 6);
  assert.equal(dataset.records.filter(item => item.language === 'hi').length, 6);
});

test('exposure ledger prevents tested candidate questions from being reused as held-out cases', () => {
  const ledger = read('../evaluation/paraphrase-exposure.json');
  assert.throws(() => assertUnexposedCandidates(dataset, ledger), /Exposed questions/);
});
test('candidate validation rejects contamination, source drift and fabricated approval', () => {
  const copy = () => structuredClone(dataset);
  const duplicate = copy(); duplicate.records[1].question = duplicate.records[0].question;
  assert.throws(() => validateHeldoutCandidate(duplicate, corpus, development), /contaminated/);
  const contaminated = copy(); contaminated.records[0].question = development[0];
  assert.throws(() => validateHeldoutCandidate(contaminated, corpus, development), /contaminated/);
  assert.throws(() => validateHeldoutCandidate(dataset, corpus.slice(1), development), /frozen corpus/);
  const approved = copy(); approved.records[0].reviewed = true;
  assert.throws(() => validateHeldoutCandidate(approved, corpus, development), /prematurely approved/);
});
test('blinded review packet omits method ranks and identifies known passages', () => {
  const packet = read('../../docs/retrieval-review/development-review.json');
  assert.equal(packet.cases.length, 30);
  const known = new Set(corpus.map(record => record.id));
  assert.ok(packet.cases.every(item => !('methods' in item)
    && item.candidateJudgments.every(record => known.has(record.recordId) && !('score' in record) && !('rank' in record))));
});
