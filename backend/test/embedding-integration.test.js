import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';
import { resetDbForTests, closeDb } from '../src/store.js';
import { resetVectorIndexForTests, syncKnowledgeVectorIndex, getSemanticVectorScores, fetchGeminiEmbedding } from '../src/semantic.js';
const originalFetch = globalThis.fetch;
const originalModel = config.geminiEmbeddingModel;
beforeEach(() => { config.databaseFile = ':memory:'; resetDbForTests(); resetVectorIndexForTests(); });
afterEach(() => { globalThis.fetch = originalFetch; config.geminiEmbeddingModel = originalModel; closeDb(); });

test('embeddings use the configured provider model, skip unpublished records, and ignore stale vectors', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ embedding: { values: [1, 0] } }) }; };
  const record = { id: 'KB-E', title: 'Library', category: 'facilities', text: 'Library resources', status: 'Published' };
  assert.equal(await syncKnowledgeVectorIndex([record, { ...record, id: 'DRAFT', status: 'Review' }], 'test-key'), 1);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.endsWith(`${config.geminiEmbeddingModel}:embedContent`));
  assert.ok(!calls[0].url.includes('test-key'));
  assert.equal(calls[0].options.headers['x-goog-api-key'], 'test-key');
  assert.equal((await getSemanticVectorScores('reading', [record], 'test-key')).has('KB-E'), true);
  assert.equal((await getSemanticVectorScores('reading', [{ ...record, text: 'Changed content' }], 'test-key')).size, 0);
  assert.equal((await getSemanticVectorScores('reading', [{ ...record, status: 'Retired' }], 'test-key')).size, 0);
  config.geminiEmbeddingModel = 'different-model';
  assert.equal((await getSemanticVectorScores('reading', [record], 'test-key')).size, 0);
});

test('non-numeric embedding payloads do not enter the vector cache', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return { ok: true, json: async () => ({ embedding: { values: ['invalid'] } }) }; };
  assert.equal(await fetchGeminiEmbedding('test', 'test-key'), null);
  assert.equal(await fetchGeminiEmbedding('test', 'test-key'), null);
  assert.equal(calls, 2);
});
