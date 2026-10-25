import test from 'node:test';
import assert from 'node:assert/strict';
import { requestGeneration } from '../src/generation-client.js';
const options = { apiKey: 'test-key', primaryModel: 'primary', fallbackModel: 'fallback', body: {}, sleep: async () => {}, random: () => 0 };

test('generation retries transient failures once then identifies the actual fallback model', async () => {
  const calls = [];
  const result = await requestGeneration({ ...options, fetchImpl: async url => {
    calls.push(url);
    return calls.length < 3 ? { ok: false, status: 503 } : { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: 'Evidence-grounded draft' }] } }] }) };
  } });
  assert.equal(calls.length, 3);
  assert.ok(calls[0].includes('/primary:'));
  assert.ok(calls[1].includes('/primary:'));
  assert.ok(calls[2].includes('/fallback:'));
  assert.deepEqual(result, { text: 'Evidence-grounded draft', model: 'fallback', attempts: 3 });
});

test('bad credentials, billing, safety and insufficient evidence do not cascade', async () => {
  for (const status of [400, 401, 402, 403, 404]) {
    let calls = 0;
    assert.equal(await requestGeneration({ ...options, fetchImpl: async () => { calls++; return { ok: false, status }; } }), null);
    assert.equal(calls, 1);
  }
  for (const payload of [{ promptFeedback: { blockReason: 'SAFETY' } }, { candidates: [{ content: { parts: [{ text: 'INSUFFICIENT_EVIDENCE' }] } }] }]) {
    let calls = 0;
    assert.equal(await requestGeneration({ ...options, fetchImpl: async () => { calls++; return { ok: true, json: async () => payload }; } }), null);
    assert.equal(calls, 1);
  }
});

test('total deadline and abort signals bound repeated timeouts', async () => {
  const start = Date.now();
  const result = await requestGeneration({ ...options, timeoutMs: 30, fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })) });
  assert.equal(result, null);
  assert.ok(Date.now() - start < 1000);
});
