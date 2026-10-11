import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { config } from '../src/config.js';
import { createSeedData } from '../src/seed.js';
import { resetDbForTests, getDb } from '../src/store.js';
import { answerAdmissionQuestion, normalizeIntentText } from '../src/server.js';
import { localizeResponse } from '../src/language.js';
import { academicFeeSelection } from '../src/knowledge.js';
import { checkParaphrase } from '../evaluation/paraphrase-checks.js';

test('native fallback without a published supporting record never dereferences missing translations', () => {
  for (const language of ['mr', 'hi']) {
    const response = localizeResponse({ answer: 'Please ask about a course.', evidence: [], source: 'Guidance' }, language, '', [], academicFeeSelection);
    assert.equal(response.localizationStatus, 'fallback');
    assert.match(response.answer, /Please ask about a course/);
  }
});
test('24 promoted development paraphrases preserve maintained facts, uncertainty and clarification', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mitra-paraphrase-test-'));
  config.databaseFile = path.join(directory, 'test.sqlite'); config.geminiApiKey = '';
  const seed = createSeedData(); resetDbForTests(seed);
  const { records } = JSON.parse(fs.readFileSync(new URL('../evaluation/heldout-candidates.json', import.meta.url)));
  try {
    for (const item of records) {
      const data = await answerAdmissionQuestion({ question: item.question, language: item.language });
      assert.deepEqual(checkParaphrase(item.id, data, seed.knowledge), [], item.id);
    }
    getDb().knowledge.find(record => record.id === 'KB-20').status = 'Retired';
    const declined = await answerAdmissionQuestion({ question: 'Tell me about the library.', language: 'hi' });
    assert.deepEqual(declined.evidence, []);
    assert.equal(declined.source, 'No verified record');
  } finally {
    resetDbForTests({});
    assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('mitra-paraphrase-test-'));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
test('schedule wording, category terms and programme scope do not collide', () => {
  assert.match(normalizeIntentText('Scheduled Tribe category proofs'), /scheduled tribe.*document/);
  assert.match(normalizeIntentText('My diploma is complete. Does the fee schedule for joining year two differ from joining year one?'), /direct second year.*first year/);
});
