import test from 'node:test';
import assert from 'node:assert/strict';
import { createRefreshSession } from '../src/refresh-session.mjs';

test('concurrent session restorations share one rotation and later calls get a fresh request', async () => {
  let calls = 0;
  let complete;
  const refresh = createRefreshSession(() => { calls++; return new Promise(resolve => { complete = resolve; }); });
  const first = refresh(); const second = refresh();
  assert.equal(first, second);
  await Promise.resolve();
  assert.equal(calls, 1);
  complete({ token: 'fixture-first' });
  assert.deepEqual(await first, { token: 'fixture-first' });
  const later = refresh();
  await Promise.resolve();
  assert.equal(calls, 2);
  complete({ token: 'fixture-second' });
  assert.deepEqual(await later, { token: 'fixture-second' });
});

test('failed rotation is cleared so a later login can restore its own session', async () => {
  let calls = 0;
  const refresh = createRefreshSession(() => { if (++calls === 1) throw new Error('expired session'); return { token: 'new-fixture-session' }; });
  await assert.rejects(refresh(), /expired session/);
  assert.deepEqual(await refresh(), { token: 'new-fixture-session' });
  assert.equal(calls, 2);
});
