import test from 'node:test';
import assert from 'node:assert/strict';
import { publicEvidence } from '../src/evidence.js';
const record = { id: 'KB-test', title: 'Library', category: 'Facilities', source: 'Official FAQ', status: 'Published', text: 'Library opening hours are not published.' };
test('evidence snapshots bind citations to record revision and actual text while omitting private fields', () => {
  const evidence = publicEvidence({ ...record, revision: 2, translations: { mr: { reviewedBy: 'private@example.com' } }, secret: 'private', facts: { academicYear: '2026-27' } });
  assert.equal(evidence.passage.text, record.text);
  assert.equal(evidence.revision, 2);
  assert.equal(evidence.academicYear, '2026-27');
  assert.equal(evidence.passage.sha256.length, 64);
  assert.ok(!JSON.stringify(evidence).includes('private'));
  assert.notEqual(evidence.citationId, publicEvidence({ ...record, revision: 2, text: 'Changed passage.' }).citationId);
});
test('evidence bounds excerpt size, marks truncation and never invents year or review dates', () => {
  const evidence = publicEvidence({ ...record, text: 'x'.repeat(3000) });
  assert.equal(evidence.passage.text.length, 2800);
  assert.equal(evidence.passage.truncated, true);
  assert.equal(evidence.academicYear, null);
  assert.equal(evidence.revision, 0);
  assert.ok(!('verifiedAt' in evidence));
  assert.throws(() => publicEvidence({ ...record, status: 'Retired' }));
  assert.throws(() => publicEvidence({ ...record, text: '' }));
});
