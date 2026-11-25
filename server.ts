import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { CROPS, MARKETS, STATE_DISTRICTS, INITIAL_SAMPLE_ALERTS } from './src/data/agriData.ts';
import {
  evaluateAlertStatus,
  evaluateMarketsForFarmer,
  forecastCropPrices,
  generateHistoricalSeries,
  getWeatherForDistrict,
} from './src/utils/calculations.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FarmerSubmission {
  id: string;
  farmerName: string;
  crop: string;
  quantity: number;
  district: string;
  preferredMarket: string;
  transportCost: number;
  expectedSellingDate: string;
  submittedAt: string;
  recommendedMarket: string;
  recommendedNetProfit: number;
  preferredNetProfit: number;
}

interface PriceAlertItem {
  id: string;
  crop: string;
  market: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
}

const farmerSubmissions: FarmerSubmission[] = [];
let activeAlerts: PriceAlertItem[] = [...INITIAL_SAMPLE_ALERTS];

async function createApp() {
  const app = express();
  app.use(express.json());

  // 1. GET /api/crops
  app.get('/api/crops', (_req, res) => {
    res.json({
      crops: CROPS,
      states: STATE_DISTRICTS,
      isSampleData: true,
    });
  });

  // 2. GET /api/markets
  app.get('/api/markets', (req, res) => {
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const filtered = state ? MARKETS.filter((m) => m.state.toLowerCase() === state.toLowerCase()) : MARKETS;
    res.json({
      markets: filtered,
      allMarketsCount: MARKETS.length,
      isSampleData: true,
    });
  });

  // 3. GET /api/prices
  app.get('/api/prices', (req, res) => {
    const crop = typeof req.query.crop === 'string' && req.query.crop ? req.query.crop : 'Tomato';
    const district = typeof req.query.district === 'string' && req.query.district ? req.query.district : 'Thanjavur';
    const state = typeof req.query.state === 'string' && req.query.state ? req.query.state : 'Tamil Nadu';

    const advisor = evaluateMarketsForFarmer({ crop, state, district, quantity: 10 });
    const avgPrice = Math.round(
      advisor.markets.reduce((sum, m) => sum + m.cropPricePerQuintal, 0) / Math.max(1, advisor.markets.length)
    );
    const forecastBest = forecastCropPrices(crop, advisor.bestMarket.marketName, 7);

    res.json({
      crop,
      state,
      district,
      totalCropsTracked: CROPS.length,
      averageCurrentPrice: avgPrice,
      predicted7DayPrice: forecastBest.forecast[forecastBest.forecast.length - 1].price,
      changePct: forecastBest.changePct,
      trend: forecastBest.trend,
      bestMarket: advisor.bestMarket,
      marketPrices: advisor.markets,
      isSampleData: true,
      notice: 'Sample agricultural market price dataset for demonstration.',
    });
  });

  // 4. POST /api/forecast
  app.post('/api/forecast', async (req, res) => {
    const { crop, market, days } = req.body ?? {};
    if (!crop || typeof crop !== 'string') {
      return res.status(400).json({ error: 'Valid "crop" name is required.' });
    }
    const targetMarket = typeof market === 'string' && market.trim() ? market.trim() : 'Koyambedu Market, Chennai';
    const horizon = Number(days) === 30 ? 30 : Number(days) > 0 ? Math.min(30, Number(days)) : 7;

    // Optional external Python FastAPI/Flask ML microservice bridge when configured
    const pythonMlUrl = process.env.PYTHON_ML_URL;
    if (pythonMlUrl) {
      try {
        const mlRes = await fetch(`${pythonMlUrl.replace(/\/$/, '')}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crop, market: targetMarket, days: horizon }),
        });
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          return res.json({ ...mlData, source: 'python-ml-service' });
        }
      } catch {
        // Fallback to deterministic built-in model if Python service is not running locally
      }
    }

    const result = forecastCropPrices(crop, targetMarket, horizon);
    return res.json({
      ...result,
      source: 'deterministic-timeseries-engine',
    });
  });

  // 5. POST /api/market-advisor
  app.post('/api/market-advisor', (req, res) => {
    const { crop, state, district, quantity, transportRatePerKm, customTransportCost, otherExpensePerQuintal } =
      req.body ?? {};
    if (!crop || typeof crop !== 'string') {
      return res.status(400).json({ error: 'Crop selection is required.' });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0 || qty > 10000) {
      return res.status(400).json({ error: 'Quantity must be a positive number between 1 and 10,000 quintals.' });
    }

    const result = evaluateMarketsForFarmer({
      crop,
      state: typeof state === 'string' && state ? state : 'Tamil Nadu',
      district: typeof district === 'string' && district ? district : 'Thanjavur',
      quantity: qty,
      transportRatePerKm: Number(transportRatePerKm) > 0 ? Number(transportRatePerKm) : 18,
      customTransportCost: Number(customTransportCost) > 0 ? Number(customTransportCost) : undefined,
      otherExpensePerQuintal: Number(otherExpensePerQuintal) >= 0 ? Number(otherExpensePerQuintal) : undefined,
    });

    return res.json(result);
  });

  // 6. GET /api/weather
  app.get('/api/weather', (req, res) => {
    const district = typeof req.query.district === 'string' && req.query.district ? req.query.district : 'Thanjavur';
    const weather = getWeatherForDistrict(district);
    res.json(weather);
  });

  // 7. POST /api/farmer-input & GET /api/farmer-input
  app.get('/api/farmer-input', (_req, res) => {
    res.json({ submissions: farmerSubmissions });
  });

  app.post('/api/farmer-input', (req, res) => {
    const { farmerName, crop, quantity, district, preferredMarket, transportCost, expectedSellingDate } =
      req.body ?? {};

    if (!farmerName || typeof farmerName !== 'string' || farmerName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid farmer name (at least 2 characters).' });
    }
    if (!crop || typeof crop !== 'string') {
      return res.status(400).json({ error: 'Please select a crop.' });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Crop quantity must be greater than 0 quintals.' });
    }
    if (!district || typeof district !== 'string') {
      return res.status(400).json({ error: 'Please select your district.' });
    }
    if (!preferredMarket || typeof preferredMarket !== 'string') {
      return res.status(400).json({ error: 'Please select your preferred market.' });
    }
    const tCost = Number(transportCost);
    if (!Number.isFinite(tCost) || tCost < 0) {
      return res.status(400).json({ error: 'Transportation cost must be 0 or higher.' });
    }
    if (!expectedSellingDate || typeof expectedSellingDate !== 'string') {
      return res.status(400).json({ error: 'Please choose an expected selling date.' });
    }

    const advisor = evaluateMarketsForFarmer({
      crop,
      state: 'Tamil Nadu',
      district,
      quantity: qty,
      customTransportCost: tCost,
    });

    // Calculate net profit specifically for farmer's preferred market using their entered transport cost
    const preferredRow =
      advisor.markets.find(
        (m) =>
          m.marketName.toLowerCase() === preferredMarket.toLowerCase() ||
          m.shortName.toLowerCase() === preferredMarket.toLowerCase()
      ) || advisor.markets[0];

    const preferredGross = preferredRow.cropPricePerQuintal * qty;
    const preferredNetProfit = preferredGross - tCost - preferredRow.otherExpenses;
    const best = advisor.bestMarket;
    const profitGain = best.netProfit - preferredNetProfit;

    const submission: FarmerSubmission = {
      id: `sub-${Date.now()}`,
      farmerName: farmerName.trim(),
      crop,
      quantity: qty,
      district,
      preferredMarket: preferredRow.marketName,
      transportCost: tCost,
      expectedSellingDate,
      submittedAt: new Date().toISOString(),
      recommendedMarket: best.marketName,
      recommendedNetProfit: best.netProfit,
      preferredNetProfit,
    };
    farmerSubmissions.unshift(submission);
    if (farmerSubmissions.length > 20) farmerSubmissions.pop();

    const forecastBest = forecastCropPrices(crop, best.marketName, 7);

    return res.status(201).json({
      submission,
      preferredAnalysis: {
        marketName: preferredRow.marketName,
        cropPricePerQuintal: preferredRow.cropPricePerQuintal,
        grossRevenue: preferredGross,
        transportCost: tCost,
        otherExpenses: preferredRow.otherExpenses,
        netProfit: preferredNetProfit,
      },
      bestAnalysis: best,
      profitGain,
      adviceMessage:
        profitGain > 500
          ? `Selling at ${best.marketName} instead of ${preferredRow.marketName} yields an estimated ₹${profitGain.toLocaleString('en-IN')} higher net profit after transport and mandi charges.`
          : `Your preferred market (${preferredRow.marketName}) is already optimal or within ₹${Math.max(0, profitGain).toLocaleString('en-IN')} of the top net-profit option.`,
      forecastTrend: forecastBest.trend,
      isSampleData: true,
    });
  });

  // 8. Alerts endpoints
  app.get('/api/alerts', (_req, res) => {
    const evaluated = activeAlerts.map((alert) => {
      const forecast = forecastCropPrices(alert.crop, alert.market, 7);
      const status = evaluateAlertStatus(alert.targetPrice, alert.condition, forecast);
      return {
        ...alert,
        currentPrice: forecast.currentPrice,
        predictedMax: forecast.maxPrice,
        predictedMin: forecast.minPrice,
        trend: forecast.trend,
        ...status,
      };
    });
    res.json({ alerts: evaluated });
  });

  app.post('/api/alerts', (req, res) => {
    const { crop, market, targetPrice, condition } = req.body ?? {};
    const priceNum = Number(targetPrice);
    if (!crop || !market || !Number.isFinite(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Crop, market, and a positive target price are required.' });
    }
    const cond = condition === 'below' ? 'below' : 'above';
    const newAlert: PriceAlertItem = {
      id: `alert-${Date.now()}`,
      crop,
      market,
      targetPrice: Math.round(priceNum),
      condition: cond,
      createdAt: new Date().toISOString(),
    };
    activeAlerts.unshift(newAlert);
    const forecast = forecastCropPrices(newAlert.crop, newAlert.market, 7);
    const status = evaluateAlertStatus(newAlert.targetPrice, newAlert.condition, forecast);
    return res.status(201).json({
      alert: {
        ...newAlert,
        currentPrice: forecast.currentPrice,
        predictedMax: forecast.maxPrice,
        predictedMin: forecast.minPrice,
        trend: forecast.trend,
        ...status,
      },
    });
  });

  app.delete('/api/alerts/:id', (req, res) => {
    const { id } = req.params;
    activeAlerts = activeAlerts.filter((a) => a.id !== id);
    res.json({ deleted: true, id });
  });

  // Historical endpoint helper
  app.get('/api/history', (req, res) => {
    const crop = typeof req.query.crop === 'string' ? req.query.crop : 'Tomato';
    const market = typeof req.query.market === 'string' ? req.query.market : 'Koyambedu Market, Chennai';
    res.json({
      crop,
      market,
      history: generateHistoricalSeries(crop, market),
      isSampleData: true,
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Smart Crop Advisor server running at http://0.0.0.0:${port}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
