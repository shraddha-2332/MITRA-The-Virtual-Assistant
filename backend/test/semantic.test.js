import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cosineSimilarity,
  computeConceptScore,
  computeContentHash,
  loadVectorIndex,
  getSemanticVectorScores,
} from '../src/semantic.js';
import { retrieveKnowledge } from '../src/server.js';
import { loadDb, saveStoredVector, getStoredVectors } from '../src/store.js';

test('cosineSimilarity computes normalized vector angles correctly', () => {
  // Identical vectors = 1
  assert.equal(Math.round(cosineSimilarity([1, 2, 3], [1, 2, 3]) * 1000) / 1000, 1);
  // Orthogonal vectors = 0
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  // Opposite vectors = -1
  assert.equal(Math.round(cosineSimilarity([1, 1], [-1, -1]) * 1000) / 1000, -1);
  // Empty or invalid = 0
  assert.equal(cosineSimilarity([], []), 0);
  assert.equal(cosineSimilarity([1, 2], [1]), 0);
});

test('computeContentHash generates consistent 32-character sha256 hashes', () => {
  const hash1 = computeContentHash('MITCORER Computer Engineering');
  const hash2 = computeContentHash('MITCORER Computer Engineering');
  const hash3 = computeContentHash('Different text');
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 32);
  assert.notEqual(hash1, hash3);
});

test('SQLite vector storage saves and retrieves dense embedding vectors', () => {
  const mockVector = [0.12, 0.45, -0.67, 0.89];
  const testId = 'KB-TEST-VEC';
  const testHash = computeContentHash('Test content for vector persistence');

  saveStoredVector(testId, testHash, mockVector);
  const stored = getStoredVectors();
  assert.ok(stored.has(testId));
  const retrieved = stored.get(testId);
  assert.equal(retrieved.hash, testHash);
  assert.deepEqual(retrieved.vector, mockVector);
});

test('computeConceptScore resolves colloquial paraphrasing to canonical records', () => {
  const hostelRecord = { id: 'KB-23', title: 'Hostel and Mess Facilities', text: 'On campus accommodation with food services', tags: ['hostel', 'mess'] };
  const feeRecord = { id: 'KB-3', title: 'Accommodation and Mess Fees', text: 'Annual charges for hostel lodging and dining facilities', tags: ['fees'] };

  // 1. "where do female scholars stay" -> boosts hostel
  const hostelScore = computeConceptScore('where do female scholars stay on campus', hostelRecord);
  assert.ok(hostelScore >= 15, `Expected hostel score >= 15, got ${hostelScore}`);

  // 2. "dining expenses" -> boosts accommodation & mess fees
  const diningScore = computeConceptScore('what are the dining expenses and food costs', feeRecord);
  assert.ok(diningScore >= 15, `Expected dining score >= 15, got ${diningScore}`);
});

test('retrieveKnowledge retrieves relevant records for natural paraphrased queries', () => {
  loadDb();
  // Query with zero exact keyword overlap with standard institutional titles:
  // "where do female scholars stay on campus and what does dining cost"
  const results = retrieveKnowledge('where do female scholars stay on campus and what does dining cost');
  assert.ok(results.length > 0, 'Expected semantic retrieval to return matches');
  const matchedIds = results.map((r) => r.id);
  assert.ok(matchedIds.includes('KB-3') || matchedIds.includes('KB-23'), 'Expected hostel/mess records to be retrieved');
});
