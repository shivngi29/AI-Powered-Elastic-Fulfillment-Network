import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import app from '../src/app.js';

test('forecast endpoint exposes the labeled NCR demo contract', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/forecasts`);
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data.length, 1);
  const forecast = data[0];
  assert.equal(forecast.contractVersion, 1);
  assert.equal(forecast.regionId, 'NCR');
  assert.equal(forecast.source, 'mock');
  assert.match(forecast.sourceLabel, /not live predictions/);
  assert.equal(forecast.unit, 'units/day');
  assert.equal(forecast.horizonDays, 7);
  assert.equal(forecast.generatedAt, null);
  assert.deepEqual(forecast.points.map((point) => point.value), [327, 274, 269, 284, 319, 386, 413]);
  assert.deepEqual(forecast.points.map((point) => point.day), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(forecast.points.every((point) => point.date === null));
});
