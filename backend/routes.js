/**
 * Smart Crop Price Forecasting & Best-Market Advisor
 * Express API Routes (backend/routes.js)
 */

import express from 'express';

const router = express.Router();

const SAMPLE_CROPS = [
  'Paddy', 'Rice', 'Wheat', 'Maize', 'Tomato', 'Onion', 'Potato',
  'Cotton', 'Sugarcane', 'Groundnut', 'Banana', 'Turmeric', 'Chilli'
];

const TAMIL_NADU_MARKETS = [
  { id: 'koyambedu', name: 'Koyambedu Market, Chennai', district: 'Chennai', baseMultiplier: 1.09, handlingPerQtl: 85 },
  { id: 'oddanchatram', name: 'Oddanchatram Market', district: 'Dindigul', baseMultiplier: 1.05, handlingPerQtl: 55 },
  { id: 'coimbatore', name: 'Coimbatore Agricultural Market', district: 'Coimbatore', baseMultiplier: 1.04, handlingPerQtl: 65 },
  { id: 'thanjavur', name: 'Thanjavur Agricultural Market', district: 'Thanjavur', baseMultiplier: 0.98, handlingPerQtl: 45 },
  { id: 'madurai', name: 'Madurai Agricultural Market', district: 'Madurai', baseMultiplier: 1.02, handlingPerQtl: 58 },
  { id: 'salem', name: 'Salem Agricultural Market', district: 'Salem', baseMultiplier: 1.00, handlingPerQtl: 50 }
];

const BASE_PRICES = {
  Paddy: 2320, Rice: 4850, Wheat: 2680, Maize: 2240,
  Tomato: 2850, Onion: 3420, Potato: 2490, Cotton: 7280,
  Sugarcane: 365, Groundnut: 6650, Banana: 2950, Turmeric: 13400, Chilli: 16200
};

router.get('/crops', (_req, res) => {
  res.json({ crops: SAMPLE_CROPS, isSampleData: true });
});

router.get('/markets', (_req, res) => {
  res.json({ markets: TAMIL_NADU_MARKETS, isSampleData: true });
});

router.get('/prices', (req, res) => {
  const crop = req.query.crop || 'Tomato';
  const base = BASE_PRICES[crop] || 2500;
  const prices = TAMIL_NADU_MARKETS.map((m) => ({
    market: m.name,
    pricePerQuintal: Math.round(base * m.baseMultiplier),
  }));
  res.json({ crop, prices, isSampleData: true });
});

router.post('/forecast', async (req, res) => {
  const { crop = 'Tomato', market = 'Chennai', days = 7 } = req.body || {};
  const pythonUrl = process.env.PYTHON_ML_URL || 'http://localhost:8000';
  try {
    const mlRes = await fetch(`${pythonUrl}/api/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop, market, days }),
    });
    if (mlRes.ok) {
      return res.json(await mlRes.json());
    }
  } catch {
    // Fallback deterministic linear projection if Python service is offline
  }

  const base = BASE_PRICES[crop] || 2850;
  const forecast = Array.from({ length: Number(days) || 7 }, (_, idx) => ({
    day: idx + 1,
    predictedPrice: Math.round(base + (idx + 1) * 18),
  }));
  return res.json({
    crop,
    market,
    forecast,
    trend: 'Increasing',
    confidence: 0.85,
    isSampleData: true,
    notice: 'Demonstration forecast generated because live Python ML service is not running.',
  });
});

router.post('/market-advisor', (req, res) => {
  const { crop = 'Tomato', quantity = 10, distanceKm = 120, ratePerKm = 18 } = req.body || {};
  const base = BASE_PRICES[crop] || 2850;
  const results = TAMIL_NADU_MARKETS.map((m) => {
    const price = Math.round(base * m.baseMultiplier);
    const transportCost = Math.round(distanceKm * ratePerKm);
    const otherExpenses = m.handlingPerQtl * quantity;
    const netProfit = price * quantity - transportCost - otherExpenses;
    return { marketName: m.name, price, transportCost, otherExpenses, netProfit };
  }).sort((a, b) => b.netProfit - a.netProfit);

  res.json({ crop, quantity, bestMarket: results[0], markets: results, isSampleData: true });
});

router.get('/weather', (req, res) => {
  const district = req.query.district || 'Thanjavur';
  res.json({
    district,
    temperatureC: 31,
    rainfallMm: 12.4,
    humidityPct: 76,
    isSampleData: true,
    notice: 'Sample weather insight for agricultural planning.',
  });
});

router.post('/farmer-input', (req, res) => {
  const { farmerName, crop, quantity, district, preferredMarket, transportCost, expectedSellingDate } = req.body || {};
  if (!farmerName || !crop || !quantity || !district) {
    return res.status(400).json({ error: 'Missing required farmer input fields.' });
  }
  return res.status(201).json({
    message: 'Farmer input recorded',
    data: { farmerName, crop, quantity, district, preferredMarket, transportCost, expectedSellingDate },
  });
});

export default router;
