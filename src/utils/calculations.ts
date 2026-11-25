import { CROPS, MARKETS, WEATHER_SAMPLES, type CropInfo, type MarketInfo, type DistrictWeatherSample } from '../data/agriData.ts';

export interface PricePoint {
  date: string;
  dayIndex: number;
  price: number;
  lowerBound?: number;
  upperBound?: number;
  type: 'history' | 'forecast';
}

export interface ForecastResult {
  crop: string;
  market: string;
  days: number;
  currentPrice: number;
  history: PricePoint[];
  forecast: PricePoint[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  changePct: number;
  trend: 'Increasing' | 'Decreasing' | 'Stable';
  confidence: number;
  isSampleData: boolean;
  notice: string;
}

export interface MarketRecommendationRow {
  marketId: string;
  marketName: string;
  shortName: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  demandLevel: 'High' | 'Medium' | 'Moderate';
  arrivalQuintalsPerDay: number;
  cropPricePerQuintal: number;
  predicted7DayPrice: number;
  distanceKm: number;
  transportCost: number;
  otherExpenses: number;
  grossRevenue: number;
  netProfit: number;
  profitPerQuintal: number;
  isBestMarket: boolean;
  recommendationLabel: string;
}

export interface MarketAdvisorResult {
  crop: string;
  state: string;
  district: string;
  quantity: number;
  bestMarket: MarketRecommendationRow;
  highestPriceMarket: MarketRecommendationRow;
  markets: MarketRecommendationRow[];
  isSampleData: boolean;
  notice: string;
}

export function getCropByName(cropName: string): CropInfo {
  const normalized = cropName.trim().toLowerCase();
  return CROPS.find((c) => c.name.toLowerCase() === normalized || c.id === normalized) || CROPS[0];
}

export function getMarketByName(marketName: string): MarketInfo {
  const normalized = marketName.trim().toLowerCase();
  return (
    MARKETS.find(
      (m) =>
        m.name.toLowerCase() === normalized ||
        m.shortName.toLowerCase() === normalized ||
        m.id === normalized ||
        m.district.toLowerCase() === normalized
    ) || MARKETS[0]
  );
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function formatDateOffset(baseDate: Date, offsetDays: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Generates a deterministic 30-day historical price series grounded in the crop's
 * base price, market multiplier, and seasonal curve.
 */
export function generateHistoricalSeries(
  cropName: string,
  marketName: string,
  referenceDate = new Date('2026-11-25T00:00:00Z')
): PricePoint[] {
  const crop = getCropByName(cropName);
  const market = getMarketByName(marketName);
  const seed = hashSeed(`${crop.id}:${market.id}`);
  const phase = (seed % 360) * (Math.PI / 180);

  const history: PricePoint[] = [];
  for (let i = -29; i <= 0; i++) {
    const dayPos = i + 29; // 0..29
    const harmonic =
      Math.sin(dayPos * 0.34 + phase) * (crop.volatility * 0.55) +
      Math.cos(dayPos * 0.17 + phase * 0.5) * (crop.volatility * 0.35);
    const drift = (dayPos - 15) * crop.seasonalSlope * 0.65;
    const rawPrice = (crop.basePricePerQuintal + drift + harmonic) * market.priceMultiplier;
    const rounded = Math.max(100, Math.round(rawPrice));
    history.push({
      date: formatDateOffset(referenceDate, i),
      dayIndex: i,
      price: rounded,
      type: 'history',
    });
  }
  return history;
}

/**
 * Deterministic linear regression + exponential smoothing forecast over the 30-day history.
 * Mirrors the Python scikit-learn / time-series service contract.
 */
export function forecastCropPrices(
  cropName: string,
  marketName: string,
  days = 7,
  referenceDate = new Date('2026-11-25T00:00:00Z')
): ForecastResult {
  const clampedDays = Math.max(1, Math.min(30, Math.round(days)));
  const crop = getCropByName(cropName);
  const market = getMarketByName(marketName);
  const history = generateHistoricalSeries(crop.name, market.name, referenceDate);

  // Ordinary Least Squares slope & intercept over last 30 days
  const n = history.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += history[i].price;
    sumXY += i * history[i].price;
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const currentPrice = history[n - 1].price;

  // Recent 7-day average for momentum damping
  const recentAvg = history.slice(-7).reduce((acc, p) => acc + p.price, 0) / 7;
  const momentum = (currentPrice - recentAvg) * 0.25;
  const seed = hashSeed(`${crop.id}:${market.id}:forecast`);
  const phase = (seed % 180) * (Math.PI / 180);

  const forecast: PricePoint[] = [];
  for (let d = 1; d <= clampedDays; d++) {
    const dampedSlope = slope * 0.85 + crop.seasonalSlope * 0.25;
    const cyclical = Math.sin((n + d) * 0.31 + phase) * (crop.volatility * 0.22);
    const projected = currentPrice + dampedSlope * d + momentum * Math.exp(-d / 6) + cyclical;
    const price = Math.max(100, Math.round(projected));
    const uncertainty = Math.round((crop.volatility * 0.35 + currentPrice * 0.012) * Math.sqrt(d / 3));
    forecast.push({
      date: formatDateOffset(referenceDate, d),
      dayIndex: d,
      price,
      lowerBound: Math.max(100, price - uncertainty),
      upperBound: price + uncertainty,
      type: 'forecast',
    });
  }

  const forecastPrices = forecast.map((f) => f.price);
  const minPrice = Math.min(...forecastPrices);
  const maxPrice = Math.max(...forecastPrices);
  const avgPrice = Math.round(forecastPrices.reduce((a, b) => a + b, 0) / forecastPrices.length);
  const endPrice = forecast[forecast.length - 1].price;
  const changePct = Number((((endPrice - currentPrice) / currentPrice) * 100).toFixed(2));

  let trend: 'Increasing' | 'Decreasing' | 'Stable' = 'Stable';
  if (changePct > 1.2) trend = 'Increasing';
  else if (changePct < -1.2) trend = 'Decreasing';

  // Confidence slightly decreases for longer horizons and high-volatility vegetables
  const volatilityRatio = Math.min(0.18, crop.volatility / crop.basePricePerQuintal);
  const horizonPenalty = (clampedDays / 30) * 0.07;
  const confidence = Number(Math.max(0.72, Math.min(0.94, 0.92 - volatilityRatio - horizonPenalty)).toFixed(2));

  return {
    crop: crop.name,
    market: market.name,
    days: clampedDays,
    currentPrice,
    history,
    forecast,
    minPrice,
    maxPrice,
    avgPrice,
    changePct,
    trend,
    confidence,
    isSampleData: true,
    notice:
      'Demonstration ML Forecast: Computed from sample historical Tamil Nadu & regional agricultural market data. Connect a live Agmarknet / state mandi feed for production trading.',
  };
}

export function estimateDistanceKm(market: MarketInfo, district: string): number {
  if (market.baseDistancesKm[district] !== undefined) {
    return market.baseDistancesKm[district];
  }
  if (market.district.toLowerCase() === district.toLowerCase()) {
    return 14;
  }
  // Deterministic fallback distance based on district + market hash
  return 120 + (hashSeed(`${market.id}:${district}`) % 280);
}

/**
 * Calculates Net Profit = (Crop Price * Quantity) - Transportation Cost - Other Expenses
 * and recommends the market with the highest estimated net profit.
 */
export function evaluateMarketsForFarmer(params: {
  crop: string;
  state?: string;
  district: string;
  quantity: number;
  transportRatePerKm?: number;
  customTransportCost?: number;
  otherExpensePerQuintal?: number;
}): MarketAdvisorResult {
  const crop = getCropByName(params.crop);
  const state = params.state || 'Tamil Nadu';
  const district = params.district || 'Thanjavur';
  const quantity = Math.max(1, Number(params.quantity) || 1);
  const ratePerKm = params.transportRatePerKm ?? 18; // INR per km per mini-truck load (up to 25 quintals)
  const truckLoads = Math.max(1, Math.ceil(quantity / 25));

  // Filter markets prioritizing selected state + Tamil Nadu core markets
  const candidateMarkets =
    state === 'Tamil Nadu'
      ? MARKETS.filter((m) => m.state === 'Tamil Nadu')
      : MARKETS.filter((m) => m.state === state || m.state === 'Tamil Nadu').slice(0, 7);

  const rows: MarketRecommendationRow[] = candidateMarkets.map((market) => {
    const forecastRes = forecastCropPrices(crop.name, market.name, 7);
    const cropPrice = forecastRes.currentPrice;
    const predicted7DayPrice = forecastRes.forecast[forecastRes.forecast.length - 1].price;
    const distanceKm = estimateDistanceKm(market, district);
    const calculatedTransport = Math.round(distanceKm * ratePerKm * truckLoads);
    const transportCost =
      params.customTransportCost && params.customTransportCost > 0 && market.district === district
        ? Math.round(params.customTransportCost)
        : calculatedTransport;
    const feePerQ = params.otherExpensePerQuintal ?? market.handlingFeePerQuintal;
    const otherExpenses = Math.round(feePerQ * quantity);
    const grossRevenue = Math.round(cropPrice * quantity);
    const netProfit = grossRevenue - transportCost - otherExpenses;
    const profitPerQuintal = Math.round(netProfit / quantity);

    return {
      marketId: market.id,
      marketName: market.name,
      shortName: market.shortName,
      state: market.state,
      district: market.district,
      lat: market.lat,
      lng: market.lng,
      demandLevel: market.demandLevel,
      arrivalQuintalsPerDay: market.arrivalQuintalsPerDay,
      cropPricePerQuintal: cropPrice,
      predicted7DayPrice,
      distanceKm,
      transportCost,
      otherExpenses,
      grossRevenue,
      netProfit,
      profitPerQuintal,
      isBestMarket: false,
      recommendationLabel: 'Alternative Market',
    };
  });

  // Sort by highest Net Profit descending
  rows.sort((a, b) => b.netProfit - a.netProfit);
  if (rows.length > 0) {
    rows[0].isBestMarket = true;
    rows[0].recommendationLabel = 'Best Net Profit';
    for (let i = 1; i < rows.length; i++) {
      const diff = rows[0].netProfit - rows[i].netProfit;
      rows[i].recommendationLabel = diff < 1500 ? 'Close Runner-Up' : `₹${diff.toLocaleString('en-IN')} less profit`;
    }
  }

  const highestPriceMarket = [...rows].sort((a, b) => b.cropPricePerQuintal - a.cropPricePerQuintal)[0];

  return {
    crop: crop.name,
    state,
    district,
    quantity,
    bestMarket: rows[0],
    highestPriceMarket,
    markets: rows,
    isSampleData: true,
    notice:
      'Net Profit = (Crop Price × Quantity) − Transportation Cost − Other Mandi Expenses. Calculations use demonstration mandi price baselines.',
  };
}

export function getWeatherForDistrict(district: string): DistrictWeatherSample & { isSampleData: boolean; notice: string } {
  const match =
    WEATHER_SAMPLES.find((w) => w.district.toLowerCase() === district.toLowerCase()) || WEATHER_SAMPLES[0];
  return {
    ...match,
    isSampleData: true,
    notice: 'Demonstration Weather Data: Live meteorological API is not connected; showing representative seasonal weather for agricultural planning.',
  };
}

export function evaluateAlertStatus(
  targetPrice: number,
  condition: 'above' | 'below',
  forecast: ForecastResult
): { triggered: boolean; matchedPrice: number; matchedDate: string; message: string } {
  if (condition === 'above') {
    const hit = forecast.forecast.find((p) => p.price >= targetPrice);
    if (hit) {
      return {
        triggered: true,
        matchedPrice: hit.price,
        matchedDate: hit.date,
        message: `Target reached! Predicted price hits ₹${hit.price.toLocaleString('en-IN')}/qtl on ${hit.date}.`,
      };
    }
    return {
      triggered: false,
      matchedPrice: forecast.maxPrice,
      matchedDate: forecast.forecast[forecast.forecast.length - 1].date,
      message: `Monitoring: 7-day peak forecast is ₹${forecast.maxPrice.toLocaleString('en-IN')}/qtl (below ₹${targetPrice.toLocaleString('en-IN')}).`,
    };
  } else {
    const hit = forecast.forecast.find((p) => p.price <= targetPrice);
    if (hit) {
      return {
        triggered: true,
        matchedPrice: hit.price,
        matchedDate: hit.date,
        message: `Drop alert! Predicted price dips to ₹${hit.price.toLocaleString('en-IN')}/qtl on ${hit.date}.`,
      };
    }
    return {
      triggered: false,
      matchedPrice: forecast.minPrice,
      matchedDate: forecast.forecast[forecast.forecast.length - 1].date,
      message: `Monitoring: 7-day minimum forecast stays at ₹${forecast.minPrice.toLocaleString('en-IN')}/qtl.`,
    };
  }
}
