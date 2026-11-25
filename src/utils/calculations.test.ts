import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CROPS,
  MARKETS,
} from '../data/agriData';
import {
  evaluateAlertStatus,
  evaluateMarketsForFarmer,
  forecastCropPrices,
  generateHistoricalSeries,
} from './calculations';

test('supports all 13 requested crops and 6 Tamil Nadu markets', () => {
  assert.equal(CROPS.length, 13);
  const tnMarkets = MARKETS.filter((m) => m.state === 'Tamil Nadu');
  assert.equal(tnMarkets.length, 6);
});

test('generateHistoricalSeries returns 30 days of positive prices deterministically', () => {
  const s1 = generateHistoricalSeries('Tomato', 'Koyambedu Market, Chennai');
  const s2 = generateHistoricalSeries('Tomato', 'Koyambedu Market, Chennai');
  assert.equal(s1.length, 30);
  assert.deepEqual(s1, s2);
  assert.ok(s1.every((pt) => pt.price > 0));
});

test('forecastCropPrices honors requested horizon (7 and 30 days) and outputs valid bounds', () => {
  const f7 = forecastCropPrices('Tomato', 'Chennai', 7);
  assert.equal(f7.forecast.length, 7);
  assert.ok(f7.confidence >= 0.7 && f7.confidence <= 0.99);
  assert.ok(['Increasing', 'Decreasing', 'Stable'].includes(f7.trend));
  assert.ok(f7.minPrice <= f7.avgPrice && f7.avgPrice <= f7.maxPrice);

  const f30 = forecastCropPrices('Onion', 'Oddanchatram Market', 30);
  assert.equal(f30.forecast.length, 30);
  assert.equal(f30.isSampleData, true);
});

test('evaluateMarketsForFarmer recommends highest net profit rather than highest raw price', () => {
  // Small quantity (5 quintals) from Thanjavur: transport to Chennai (335km) outweighs Chennai's price premium
  const advisor = evaluateMarketsForFarmer({
    crop: 'Paddy',
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    quantity: 5,
  });
  assert.equal(advisor.markets.length, 6);
  const best = advisor.bestMarket;
  assert.equal(best.isBestMarket, true);
  // Best market netProfit must equal or exceed every other market
  for (const m of advisor.markets) {
    assert.ok(best.netProfit >= m.netProfit);
    const expectedNet = m.cropPricePerQuintal * advisor.quantity - m.transportCost - m.otherExpenses;
    assert.equal(m.netProfit, expectedNet);
  }
  // Verify highest raw price market (Koyambedu) is not blindly chosen when transport makes local market more profitable
  assert.notEqual(best.marketId, 'koyambedu');
});

test('evaluateAlertStatus triggers when predicted price meets target', () => {
  const forecast = forecastCropPrices('Tomato', 'Koyambedu Market, Chennai', 7);
  const reached = evaluateAlertStatus(forecast.maxPrice - 10, 'above', forecast);
  assert.equal(reached.triggered, true);

  const notReached = evaluateAlertStatus(forecast.maxPrice + 5000, 'above', forecast);
  assert.equal(notReached.triggered, false);
});
