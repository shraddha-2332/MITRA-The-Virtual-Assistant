import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { config } from '../src/config.js';
import { resetDbForTests, closeDb } from '../src/store.js';
import { createSeedData } from '../src/seed.js';
import { answerAdmissionQuestion, normalizeIntentText, resetRuntimeStateForTests } from '../src/server.js';
import { understandQuery, splitQueryClauses, matchesIntent } from '../src/query-understanding.js';
import { academicFeeSelection } from '../src/knowledge.js';

test('qualification, numbers and negation survive normalization', () => {
  const query = normalizeIntentText('I am in class 12, not first year. My score is 61.2790648, code 0690124210.');
  assert.match(query, /class 12/);
  assert.match(query, /not first year/);
  assert.match(query, /61\.2790648/);
  assert.match(query, /0690124210/);
  assert.doesNotMatch(normalizeIntentText('Do you sell coffee?'), /\bfee\b/);
  assert.match(normalizeIntentText('CSE seats and intake kya hai?'), /seat matrix/);
  assert.match(normalizeIntentText('CAP फेरी प्रक्रिया सांगा.'), /cap round/);
  assert.match(normalizeIntentText('CAP राउंड प्रक्रिया बताओ.'), /cap round/);
});

test('extracted fields preserve scope, negation, academic years and protected names', () => {
  const query = understandQuery('I passed class 12. DSE fees for OBC girls in AY 2026/27, not first year.');
  assert.equal(query.admissionRoute, 'directSecondYear');
  assert.deepEqual(query.route.excluded, ['firstYear']);
  assert.deepEqual(query.academicYears, ['2026-27']);
  assert.deepEqual(query.gender.positive, ['girl']);
  assert.deepEqual(understandQuery('Deadline 2026-12-24').invalidYears, []);
  assert.deepEqual(understandQuery('Fees AY 2026-2027').academicYears, ['2026-27']);
  assert.deepEqual(understandQuery('Fees AY 2026-29').invalidYears, ['2026-29']);
  assert.deepEqual(understandQuery('Not only CSE, all branches').branch.excluded, []);
  assert.equal(academicFeeSelection('Open EBC boys first-year fees').key, 'concessionBoy');
  assert.equal(academicFeeSelection('Not OBC, Open first-year fees').key, 'open');
  assert.equal(matchesIntent('coffee or fellowship', 'fee'), false);
  assert.equal(normalizeIntentText('Eligible coffee costs 0690124210. hostle and lbrary.'), 'eligible coffee cost 0690124210. hostel and library.');
  assert.deepEqual(splitQueryClauses(normalizeIntentText('Artificial Intelligence and Data Science courses and hostel fees')), ['artificial intelligence and data science course', 'hostel fee']);
});

test('public queries interpret plurals, paraphrases, typos, native conjunctions and ambiguity', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mitra-query-test-'));
  config.databaseFile = path.join(directory, 'test.sqlite');
  config.geminiApiKey = '';
  resetDbForTests(createSeedData());
  const ask = async question => { resetRuntimeStateForTests(); return answerAdmissionQuestion({ question, language: 'en' }, null); };
  try {
    const girl = await ask('What are the first-year fees for OBC girls?');
    assert.match(girl.answer, /17,217/);
    assert.doesNotMatch(girl.answer, /61,109|98,000/);
    const boy = await ask('What is the first-year price for OBC boys?');
    assert.match(boy.answer, /61,109/);
    assert.doesNotMatch(boy.answer, /1,05,000/);
    for (const question of ['Tell me about the lbrary.', 'Where can students borrow books?', 'What reading resources are available?']) {
      assert.equal((await ask(question)).evidence[0]?.id, 'KB-20', question);
    }
    assert.equal((await ask('What scholrships are available?')).evidence[0]?.id, 'KB-18');
    const hindi = await ask('प्रथम वर्ष की फीस तथा छात्रावास की फीस बताइए।');
    assert.deepEqual(new Set(hindi.sections?.map(section => section.topic)), new Set(['academicFees', 'accommodationFees']));
    const marathi = await ask('प्रथम वर्ष शुल्क तसेच वसतिगृह शुल्क सांगा.');
    assert.deepEqual(new Set(marathi.sections?.map(section => section.topic)), new Set(['academicFees', 'accommodationFees']));
    const qualified = await ask('I passed class 12. What are Direct Second Year fees?');
    assert.match(qualified.answer, /98,000/);
    assert.doesNotMatch(qualified.answer, /1,05,000/);
    const ambiguous = await ask('I am an OBC student. What are first-year fees?');
    assert.equal(ambiguous.clarification, true);
    assert.equal(ambiguous.evidence.length, 0);
    const excluded = await ask('What is the intake, not CSE?');
    assert.equal(excluded.clarification, true);
    const negativeCategory = await ask('I am not OBC. What are first-year fees?');
    assert.equal(negativeCategory.clarification, true);
    assert.deepEqual(negativeCategory.evidence, []);
    const coffee = await ask('Do you sell coffee?');
    assert.deepEqual(coffee.evidence, []);
    assert.doesNotMatch(coffee.answer, /1,05,000|fee planner/);
    for (const language of ['mr', 'hi']) {
      const clarified = await answerAdmissionQuestion({ question: 'First-year OBC fees?', language }, null);
      assert.equal(clarified.clarification, true);
      assert.match(clarified.answer, language === 'mr' ? /मुलगा की मुलगी/ : /लड़का या लड़की/);
      const civil = await answerAdmissionQuestion({ question: 'Civil Engineering intake?', language }, null);
      assert.equal(civil.localizationStatus, 'template');
      assert.match(civil.answer, /Civil Engineering/);
      assert.doesNotMatch(civil.answer, /Computer Science and Engineering/);
    }
    const invalidYear = await ask('First-year fees in AY 2026-29?');
    assert.equal(invalidYear.clarification, true);
    const futureYear = await ask('First-year fees in AY 2030/31?');
    assert.deepEqual(futureYear.evidence, []);
    const academicOnly = await ask('What are first-year academic fees, not hostel?');
    assert.equal(academicOnly.evidence[0]?.id, 'KB-2');
    assert.doesNotMatch(academicOnly.answer, /35,000/);
    const scopedCompound = await ask('I am not OBC. What are academic fees and hostel fees?');
    assert.equal(scopedCompound.sections[0].status, 'clarification');
    assert.equal(scopedCompound.sections[1].status, 'supported');
    assert.match(scopedCompound.answer, /35,000/);
    for (const language of ['mr', 'hi']) {
      const messOnly = await answerAdmissionQuestion({ question: 'Mess fees, not hostel?', language }, null);
      assert.equal(messOnly.localizationStatus, 'template');
      assert.match(messOnly.answer, /42,000/);
      assert.doesNotMatch(messOnly.answer, /35,000/);
    }
  } finally {
    closeDb();
    if (path.dirname(directory) !== path.resolve(os.tmpdir()) || !path.basename(directory).startsWith('mitra-query-test-')) throw new Error('Unsafe cleanup path');
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
