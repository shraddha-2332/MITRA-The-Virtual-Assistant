import test from 'node:test';
import assert from 'node:assert/strict';
import { rejectionMetrics, verifierCases, evaluateVerifiers } from '../evaluation/verifier-diagnostics.js';
import { seedKnowledge } from '../src/seed.js';

test('error-detection confusion matrix distinguishes missed errors from false alarms and empty denominators', () => {
  const result = rejectionMetrics([
    { expectedReject: true, rejected: true },
    { expectedReject: true, rejected: false },
    { expectedReject: true, rejected: false },
    { expectedReject: false, rejected: true },
    { expectedReject: false, rejected: false },
  ]);
  assert.deepEqual(result, { tp: 1, fp: 1, tn: 1, fn: 2, total: 5, errorDetectionRecall: 1 / 3, falseAlarmRate: 0.5, decisionAgreement: 0.4 });
  assert.equal(rejectionMetrics([]).errorDetectionRecall, null);
  assert.equal(rejectionMetrics([]).falseAlarmRate, null);
  assert.equal(rejectionMetrics([]).decisionAgreement, null);
  assert.throws(() => rejectionMetrics([{ expectedReject: null, rejected: false }]), /Boolean/);
});

test('diagnostics preserve input corpus, include scope and mixed-row probes, and validate judgments', () => {
  const corpus = structuredClone(seedKnowledge.filter(record => record.status === 'Published'));
  const before = JSON.stringify(corpus);
  const cases = verifierCases(corpus);
  const result = evaluateVerifiers(cases, corpus);
  assert.equal(JSON.stringify(corpus), before);
  for (const family of ['mixed-wrong-row', 'wrong-year', 'missing-slot', 'comparison', 'wrong-code']) {
    assert.ok(cases.some(row => row.family === family));
  }
  assert.ok(cases.some(row => row.expectedReject));
  assert.ok(cases.some(row => !row.expectedReject));
  for (const method of Object.values(result.summary)) assert.equal(method.tp + method.fp + method.tn + method.fn, cases.length);
  assert.throws(() => evaluateVerifiers([...cases, cases[0]], corpus), /Invalid diagnostic/);
  assert.throws(() => evaluateVerifiers([{ ...cases[0], evidenceIds: ['MISSING'] }], corpus), /Invalid diagnostic/);
});

test('year mismatch, unresolved concession gender and competing programme code are rejected', () => {
  const corpus = structuredClone(seedKnowledge.filter(record => record.status === 'Published'));
  const { rows } = evaluateVerifiers(verifierCases(corpus), corpus);
  for (const id of ['VD-06', 'VD-07', 'VD-13']) {
    assert.equal(rows.find(row => row.id === id).methods.slot.rejected, true, id);
  }
  for (const id of ['VD-01', 'VD-04', 'VD-08', 'VD-11']) {
    assert.equal(rows.find(row => row.id === id).methods.slot.rejected, false, id);
  }
});
