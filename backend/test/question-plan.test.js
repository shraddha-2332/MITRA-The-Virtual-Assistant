import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildClarificationAnswer, buildCompoundAnswer } from '../src/question-plan.js';
import { createSeedData } from '../src/seed.js';

const compound = (query, records = createSeedData().knowledge) => buildCompoundAnswer(query, query.toLowerCase(), records);
test('compound courses and fees cover both topics with separate evidence', () => {
  const result = compound('List the first-year B.Tech courses and the Open category academic fee for 2026-27.');
  assert.deepEqual(result.sections.map((section) => section.status), ['supported', 'supported']);
  assert.deepEqual(result.evidence.map((item) => item.id), ['KB-10', 'KB-2']);
  assert.match(result.answer, /Artificial Intelligence and Data Science/);
  assert.match(result.answer, /1,05,000/);
  assert.match(result.answer, /\[1\]/);
  assert.match(result.answer, /\[2\]/);
  assert.equal(result.officialLinks[0].url, result.evidence[0].sourceUrl);
  assert.match(result.source, /\[2\].*MITCORER fees/);
});
test('facility questions use independently published passages and preserve unsupported parts', () => {
  const result = compound('Explain hostel facilities and the college bus facility.');
  assert.deepEqual(result.evidence.map((item) => item.id), ['KB-23', 'KB-19']);
  const partial = compound("Tell me about the library and today's canteen lunch menu.");
  assert.deepEqual(partial.sections.map((section) => section.status), ['supported', 'unsupported']);
  assert.deepEqual(partial.evidence.map((item) => item.id), ['KB-20']);
  assert.match(partial.sections[1].answer, /could not find/);
});
test('programme names and hostel/mess charges are not split into unrelated questions', () => {
  assert.equal(compound('What is the fee for Computer Science and Engineering?'), null);
  assert.equal(compound('What are hostel and mess fees?'), null);
  assert.equal(compound('What is the intake for Electronics and Computer Engineering?'), null);
  assert.equal(compound('Tell me about the library and digital resources.'), null);
  assert.equal(compound('Does MITCORER have a bus facility and what are the routes?'), null);
  assert.equal(compound('What is CSE seat matrix and intake?'), null);
  assert.equal(compound('I am from SC category, I am a boy and want CSE admission. How much fee will I pay per semester?'), null);
});
test('bare references require clarification while explicit scope remains answerable', () => {
  assert.ok(buildClarificationAnswer('what is its intake?')?.clarification);
  assert.ok(buildClarificationAnswer('what is the intake?')?.clarification);
  assert.equal(buildClarificationAnswer('what is the cse intake?'), null);
  assert.equal(buildClarificationAnswer('list all b.tech programme intakes'), null);
  const result = compound('What is its intake and what is the first year Open fee?');
  assert.deepEqual(result.sections.map((section) => section.status), ['clarification', 'supported']);
  assert.deepEqual(result.sections[0].evidenceIds, []);
});
test('retired evidence cannot support compound answers and explicit per-clause years remain separate', () => {
  const records = createSeedData().knowledge;
  records.find((item) => item.id === 'KB-2').status = 'Retired';
  const result = compound('List first year B.Tech courses and academic fees for 2026-27.', records);
  assert.equal(result.sections[1].status, 'unsupported');
  assert.deepEqual(result.evidence.map((item) => item.id), ['KB-10']);
  const years = compound('List first year B.Tech courses for 2026-27 and academic fees for 2030-31.');
  assert.deepEqual(years.sections.map((section) => section.status), ['supported', 'unsupported']);
});
test('bounded planning requests fewer topics rather than silently truncating a question', () => {
  const result = compound('List courses and academic fees and hostel facilities and bus facility and library resources.');
  assert.ok(result.clarification);
  assert.deepEqual(result.evidence, []);
});

test('different fee routes and sentence-separated requests retain their independent scope', () => {
  const fees = compound('What is the first-year Open fee and the DSE Open fee?');
  assert.equal(fees.sections.length, 2);
  assert.match(fees.sections[0].answer, /1,05,000/);
  assert.match(fees.sections[1].answer, /98,000/);
  assert.doesNotMatch(fees.sections[0].answer, /98,000/);
  assert.doesNotMatch(fees.sections[1].answer, /1,05,000/);
  assert.deepEqual(fees.evidence.map((item) => item.id), ['KB-2']);
  assert.match(fees.answer, /\[1\]/);
  assert.equal(compound('List first year B.Tech courses. What is the Open fee?').sections.length, 2);
});
