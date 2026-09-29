import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import ScalingEvent from '../src/models/ScalingEvent.js';
import app from '../src/app.js';

// Test-only data: never seeded or returned by the real application.
const fixture = { action: 'SCALE_OUT', node_id: 'N02', cluster_id: 'NCR', reason: 'Demo test record', predicted_demand_units_per_day: 440, available_capacity_units_per_day: 320, required_capacity_units_per_day: 550, source: 'demo' };

test('ScalingEvent validates supplied decisions without calculating them', async () => {
  const event = new ScalingEvent(fixture);
  await event.validate();
  assert.equal(event.status, 'RECORDED');
  assert.equal(event.expected_savings_inr, null);
  assert.equal(event.executed_at, null);
  await new ScalingEvent({ ...fixture, action: 'MAINTAIN', node_id: null }).validate();
  for (const invalid of [{ action: 'OTHER' }, { node_id: null }, { source: undefined }, { predicted_demand_units_per_day: -1 }, { required_capacity_units_per_day: Infinity }, { status: 'EXECUTED' }, { executed_at: new Date() }]) {
    await assert.rejects(new ScalingEvent({ ...fixture, ...invalid }).validate());
  }
  await new ScalingEvent({ ...fixture, status: 'EXECUTED', created_at: new Date('2026-09-19T00:00:00Z'), executed_at: new Date('2026-09-19T01:00:00Z') }).validate();
});

test('read-only scaling events route and error middleware', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}/api/scaling/events`;
  let rows = [];
  const find = t.mock.method(ScalingEvent, 'find', () => ({ sort: (order) => {
    assert.deepEqual(order, { created_at: -1, _id: -1 });
    return { lean: async () => rows };
  } }));
  assert.deepEqual(await (await fetch(url)).json(), { data: [] });
  rows = [{ ...fixture, _id: 'test-only', status: 'RECORDED' }];
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: rows });
  assert.equal((await fetch(url, { method: 'POST' })).status, 404);
  t.mock.method(console, 'error', () => {});
  find.mock.mockImplementation(() => { throw new Error('database failure'); });
  const failed = await fetch(url);
  assert.equal(failed.status, 500);
  assert.deepEqual(await failed.json(), { error: 'Internal server error' });
});
