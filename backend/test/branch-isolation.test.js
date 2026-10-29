import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { createServer, resetRuntimeStateForTests, answerAdmissionQuestion } from '../src/server.js';
import { askPublicWithHistory, resetPublicConversation } from '../src/conversations.js';
import { resetDbForTests } from '../src/store.js';
import { createSeedData } from '../src/seed.js';

beforeEach(() => {
  resetRuntimeStateForTests();
  resetDbForTests(createSeedData());
});

test('civil branch HOD query returns only Prof. Amit Shinde and never other departments', async () => {
  const result = await answerAdmissionQuestion({ question: 'who is the HOD of civil department' });
  const ans = result.answer;

  assert.match(ans, /Prof\. Amit Raosaheb Shinde/i);
  assert.match(ans, /Civil Engineering/i);
  assert.doesNotMatch(ans, /Mechanical/i);
  assert.doesNotMatch(ans, /Computer Science|CSE/i);
  assert.doesNotMatch(ans, /Sanjay Mane/i);
  assert.doesNotMatch(ans, /Somnath Mule/i);
});

test('mechanical branch HOD query returns only Dr. Sanjay Mane and never other departments', async () => {
  const result = await answerAdmissionQuestion({ question: 'who is the HOD of Mechanical department' });
  const ans = result.answer;

  assert.match(ans, /Dr\. Sanjay Pandurang Mane/i);
  assert.match(ans, /Mechanical/i);
  assert.doesNotMatch(ans, /Civil/i);
  assert.doesNotMatch(ans, /Computer Science|CSE/i);
  assert.doesNotMatch(ans, /Amit Shinde/i);
  assert.doesNotMatch(ans, /Somnath Mule/i);
});

test('civil engineering labs query returns civil laboratories and never other branches', async () => {
  const result = await answerAdmissionQuestion({ question: 'civil engineering labs' });
  const ans = result.answer;

  assert.match(ans, /Civil Engineering Laboratories/i);
  assert.match(ans, /Strength of Materials Lab/i);
  assert.match(ans, /Surveying Lab/i);
  assert.match(ans, /Concrete Technology Lab/i);
  assert.doesNotMatch(ans, /Mechanical/i);
  assert.doesNotMatch(ans, /Robotics Lab/i);
  assert.doesNotMatch(ans, /High-Performance Computing/i);
});

test('civil branch cutoff and intake queries isolate civil engineering details', async () => {
  const cutoff = await answerAdmissionQuestion({ question: 'what is the cutoff for civil branch' });
  assert.match(cutoff.answer, /Civil Engineering/i);
  assert.match(cutoff.answer, /0690119110/);
  assert.doesNotMatch(cutoff.answer, /Mechanical/i);
  assert.doesNotMatch(cutoff.answer, /Computer Science|CSE/i);

  const intake = await answerAdmissionQuestion({ question: 'civil engineering intake' });
  assert.match(intake.answer, /Civil Engineering/i);
  assert.match(intake.answer, /intake 60/i);
  assert.doesNotMatch(intake.answer, /Mechanical/i);
  assert.doesNotMatch(intake.answer, /120/);
});

test('principal inquiry returns only the Principal and nothing extra', async () => {
  const result = await answerAdmissionQuestion({ question: 'who is the principal' });
  assert.match(result.answer, /Dr\. Madhukar J\. Lengare/i);
  assert.doesNotMatch(result.answer, /DTE Institute Code/i);
  assert.doesNotMatch(result.answer, /Affiliation/i);
});

test('multi-turn conversation preserves civil branch context and never leaks other departments', async () => {
  const sessionToken = 'c'.repeat(64);
  const turn1 = await askPublicWithHistory(
    { question: 'tell me about civil branch' },
    answerAdmissionQuestion,
    sessionToken
  );
  assert.match(turn1.answer, /Prof\. Amit Raosaheb Shinde/i);
  assert.doesNotMatch(turn1.answer, /Mechanical/i);
  assert.doesNotMatch(turn1.answer, /Somnath Mule/i);

  const convId = turn1.conversationId;

  const turn2 = await askPublicWithHistory(
    { question: 'who is the HOD?', conversationId: convId },
    answerAdmissionQuestion,
    sessionToken
  );
  assert.match(turn2.answer, /Prof\. Amit Raosaheb Shinde/i);
  assert.doesNotMatch(turn2.answer, /Mechanical/i);
  assert.doesNotMatch(turn2.answer, /Sanjay Mane/i);
  assert.doesNotMatch(turn2.answer, /Somnath Mule/i);

  const turn3 = await askPublicWithHistory(
    { question: 'what are the labs?', conversationId: convId },
    answerAdmissionQuestion,
    sessionToken
  );
  assert.match(turn3.answer, /Civil Engineering Laboratories/i);
  assert.match(turn3.answer, /Strength of Materials/i);
  assert.doesNotMatch(turn3.answer, /Mechanical/i);
  assert.doesNotMatch(turn3.answer, /Robotics Lab/i);
});

