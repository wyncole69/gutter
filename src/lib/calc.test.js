import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quote, hoursFromRate, MARKETS } from './calc.js';

const US_MIN = MARKETS.US.jobMinimum;
const UK_MIN = MARKETS.UK.jobMinimum;

test('US driveway 1,000 sq ft, normal', () => {
  const q = quote({ market: 'US', surfaceId: 'driveway', area: 1000, minimum: US_MIN });
  assert.equal(q.price, 250);
  assert.equal(q.low, 150);
  assert.equal(q.high, 350);
});

test('job minimum applies to small jobs', () => {
  const q = quote({ market: 'US', surfaceId: 'sidewalk', area: 200, minimum: US_MIN });
  assert.equal(q.price, 125); // 200 x 0.22 = 44 -> minimum
});

test('US 2,000 sq ft house, 2 storeys, heavy', () => {
  const q = quote({ market: 'US', surfaceId: 'house', area: 2000, condition: 'heavy', storeys: 2, minimum: US_MIN });
  assert.equal(q.price, 912.6); // 2000 x 0.26 x 1.35 x 1.30
});

test('3+ storeys must be priced manually', () => {
  const q = quote({ market: 'US', surfaceId: 'roof', area: 2000, storeys: 3, minimum: US_MIN });
  assert.equal(q.price, null);
});

test('storeys ignored for flatwork', () => {
  const q = quote({ market: 'UK', surfaceId: 'patio', area: 50, storeys: 2, minimum: UK_MIN });
  assert.equal(q.price, 150);
});

test('UK decking uses +/-25% range', () => {
  const q = quote({ market: 'UK', surfaceId: 'decking', area: 40, minimum: UK_MIN });
  assert.equal(q.price, 180);
  assert.equal(q.low, 135);
  assert.equal(q.high, 225);
});

test('implied hourly, target and traffic light', () => {
  const q = quote({ market: 'US', surfaceId: 'driveway', area: 3000, minimum: US_MIN, hours: 2, setupHours: 1, target: 300 });
  assert.equal(q.price, 750);
  assert.equal(q.implied, 250);
  assert.equal(q.needed, 900);
  assert.equal(q.status, 'red'); // 250 < 255 (85% of 300)
  assert.equal(quote({ market: 'US', surfaceId: 'driveway', area: 3000, minimum: US_MIN, hours: 2, setupHours: 1, target: 290 }).status, 'amber');
  assert.equal(quote({ market: 'US', surfaceId: 'driveway', area: 3000, minimum: US_MIN, hours: 2, setupHours: 1, target: 250 }).status, 'green');
});

test('area-per-hour helper', () => {
  assert.equal(hoursFromRate(3000, 1500), 2);
  assert.equal(hoursFromRate(100, 140), 0.71);
});
