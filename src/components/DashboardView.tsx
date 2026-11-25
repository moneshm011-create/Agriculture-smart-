import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Sprout,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Store,
  Wallet,
  ArrowRight,
  Info,
} from 'lucide-react';
import type { ForecastResult, MarketAdvisorResult } from '../utils/calculations';
import type { TranslationStrings } from '../i18n/translations';
import type { GlobalSelection } from './CropSelectorBar';

interface DashboardViewProps {
  selection: GlobalSelection;
  priceSummary: {
    totalCropsTracked: number;
    averageCurrentPrice: number;
    predicted7DayPrice: number;
    changePct: number;
    trend: 'Increasing' | 'Decreasing' | 'Stable';
  };
  forecast: ForecastResult;
  advisor: MarketAdvisorResult;
  loading: boolean;
  t: TranslationStrings;
  onNavigate: (page: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selection,
  priceSummary,
  forecast,
  advisor,
  loading,
  t,
  onNavigate,
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const chartData = [
    ...forecast.history.slice(-10).map((pt) => ({
      date: pt.date.slice(5),
      actual: pt.price,
      predicted: null as number | null,
    })),
    ...forecast.forecast.slice(0, 7).map((pt) => ({
      date: pt.date.slice(5),
      actual: null as number | null,
      predicted: pt.price,
    })),
  ];

  // Bridge last actual point into predicted series for smooth continuity
  if (chartData.length > 10 && chartData[9].actual !== null) {
    chartData[9].predicted = chartData[9].actual;
  }

  const bestMarket = advisor.bestMarket;
  const isPositive = priceSummary.changePct >= 0;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <section className="animate-fade-up relative overflow-hidden rounded-2xl border border-emerald-300/60 bg-emerald-950 min-h-[215px] flex items-end shadow-sm">
        {!heroImgFailed ? (
          <img
            src="/src/assets/images/hero_smart_farming_1795597327875.jpg"
            alt="Sunlit green Tamil Nadu paddy fields with agricultural monitoring sensors"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-teal-800 to-amber-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-teal-950/70 to-amber-950/40" />

        <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold text-amber-300 tracking-wide">
              {selection.state} · {selection.district} · {selection.crop} ({selection.variety})
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight [text-wrap:balance]">
              {t.welcomeTitle}
            </h1>
            <p className="text-sm sm:text-base text-emerald-50/90 max-w-xl">
              {t.welcomeSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('advisor')}
              className="group h-10 px-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-xl shadow-sm hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.nav.advisor}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('forecast')}
              className="h-10 px-4 inline-flex items-center gap-2 text-sm font-semibold text-white bg-sky-500/25 hover:bg-sky-500/35 border border-sky-300/45 rounded-xl backdrop-blur-xs hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.nav.forecast}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Demonstration Data Notice */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-50 via-cyan-50/60 to-emerald-50/50 border border-sky-200/90 text-sky-950 text-xs sm:text-sm">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <span>{t.demoNotice}</span>
      </div>

      {/* 6 Colorful KPI Statistic Cards */}
      <section aria-label="Key Market Indicators" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* 1. Total Crops Tracked (Green) */}
        <div className="group animate-card-enter [animation-delay:0ms] relative overflow-hidden bg-gradient-to-br from-emerald-50/90 via-white to-white border border-emerald-200/90 rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:border-emerald-300 active:translate-y-0 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">{t.labels.totalCropsTracked}</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white inline-flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
              <Sprout className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.02]">
            {priceSummary.totalCropsTracked}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Grains, vegetables, spices & cash crops
          </p>
        </div>

        {/* 2. Current Average Crop Price (Blue) */}
        <div className="group animate-card-enter [animation-delay:55ms] relative overflow-hidden bg-gradient-to-br from-sky-50/90 via-white to-white border border-sky-200/90 rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:border-sky-300 active:translate-y-0 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">{t.labels.currentAvgPrice}</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white inline-flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
              <IndianRupee className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 font-mono tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.02]">
            {loading ? '...' : `₹${priceSummary.averageCurrentPrice.toLocaleString('en-IN')}`}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1">{t.labels.perQuintal}</span>
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {selection.crop} average across regional mandis
          </p>
        </div>

        {/* 3. Predicted Price for Next 7 Days (Yellow/Amber) */}
        <div className="group animate-card-enter [animation-delay:110ms] relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-white to-white border border-amber-200/90 rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:border-amber-300 active:translate-y-0 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">{t.labels.predicted7DayPrice}</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white inline-flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 font-mono tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.02]">
            {loading ? '...' : `₹${priceSummary.predicted7DayPrice.toLocaleString('en-IN')}`}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1">{t.labels.perQuintal}</span>
          </p>
          <p className="mt-1 text-xs text-slate-600 tabular-nums">
            Confidence {(forecast.confidence * 100).toFixed(0)}% · {bestMarket.shortName}
          </p>
        </div>

        {/* 4. Best Market Recommendation (Vibrant Emerald Feature Card) */}
        <div className="group animate-card-enter [animation-delay:165ms] relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white border border-emerald-500 rounded-2xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-yellow-300 to-emerald-200 opacity-90 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-200">{t.labels.bestMarketRec}</span>
            <span className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 text-amber-300 inline-flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
              <Store className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-lg font-bold text-white truncate transition-transform duration-200 origin-left group-hover:translate-x-0.5" title={bestMarket.marketName}>
            {bestMarket.marketName}
          </p>
          <p className="mt-1 text-xs text-emerald-50 tabular-nums">
            Est. Net Profit ₹{bestMarket.netProfit.toLocaleString('en-IN')} for {selection.quantity} {t.labels.quintals}
          </p>
        </div>

        {/* 5. Expected Profit per Quintal (Orange) */}
        <div className="group animate-card-enter [animation-delay:220ms] relative overflow-hidden bg-gradient-to-br from-orange-50/90 via-white to-white border border-orange-200/90 rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:border-orange-300 active:translate-y-0 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-900">{t.labels.expectedProfitPerQtl}</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white inline-flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 font-mono tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.02]">
            ₹{bestMarket.profitPerQuintal.toLocaleString('en-IN')}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1">{t.labels.perQuintal}</span>
          </p>
          <p className="mt-1 text-xs text-slate-600 tabular-nums">
            After ₹{bestMarket.transportCost.toLocaleString('en-IN')} transport & mandi fees
          </p>
        </div>

        {/* 6. Market Price Increase or Decrease Percentage */}
        <div
          className={`group animate-card-enter [animation-delay:275ms] relative overflow-hidden border rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.99] transition-all duration-200 ${
            isPositive
              ? 'bg-gradient-to-br from-teal-50/90 via-white to-white border-teal-200/90 hover:border-teal-300'
              : 'bg-gradient-to-br from-orange-50/90 via-white to-white border-orange-200/90 hover:border-orange-300'
          }`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-85 group-hover:opacity-100 transition-opacity duration-200 ${
              isPositive ? 'from-teal-500 to-emerald-500' : 'from-orange-500 to-rose-500'
            }`}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isPositive ? 'text-teal-900' : 'text-orange-900'}`}>
              {t.labels.marketPriceChange}
            </span>
            <span
              className={`w-10 h-10 rounded-xl inline-flex items-center justify-center text-white shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3 ${
                isPositive
                  ? 'bg-gradient-to-br from-teal-500 to-emerald-600'
                  : 'bg-gradient-to-br from-orange-500 to-rose-600'
              }`}
            >
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </span>
          </div>
          <p
            className={`mt-3 text-2xl font-bold font-mono tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.02] ${
              isPositive ? 'text-emerald-700' : 'text-orange-700'
            }`}
          >
            {isPositive ? '+' : ''}
            {priceSummary.changePct.toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {priceSummary.trend} outlook over next 7 days
          </p>
        </div>
      </section>

      {/* Main Split: 7-Day Forecast Preview + Top Markets Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-sky-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {selection.crop} Price Trajectory — {bestMarket.shortName}
              </h2>
              <p className="text-xs text-slate-500">
                Last 10 days actual baseline vs next 7 days predicted trajectory (INR/quintal)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('forecast')}
              className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs font-semibold text-sky-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Open Full Forecast →
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="predFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(value: unknown) => [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, 'Price / Qtl']}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Recent History"
                  stroke="#0284c7"
                  strokeWidth={2.4}
                  fill="url(#actualFill)"
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  name="7-Day Forecast"
                  stroke="#16a34a"
                  strokeWidth={2.8}
                  strokeDasharray="5 4"
                  fill="url(#predFill)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Top Profitable Markets</h2>
                <p className="text-xs text-slate-500">
                  Ranked by net profit from {selection.district} ({selection.quantity} qtl)
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('advisor')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                Compare All →
              </button>
            </div>

            <div className="space-y-2.5">
              {advisor.markets.slice(0, 4).map((m, idx) => {
                const rankBadgeColors = [
                  'bg-emerald-600 text-white',
                  'bg-sky-600 text-white',
                  'bg-amber-500 text-white',
                  'bg-orange-500 text-white',
                ];
                return (
                  <div
                    key={m.marketId}
                    className={`group p-3 rounded-xl flex items-center justify-between gap-3 border hover:translate-x-0.5 transition-all duration-150 ${
                      m.isBestMarket
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50/70 border-emerald-200 hover:border-emerald-300'
                        : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold inline-flex items-center justify-center shrink-0 tabular-nums transition-transform duration-150 group-hover:scale-105 ${
                          rankBadgeColors[idx] || 'bg-slate-600 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{m.marketName}</p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          ₹{m.cropPricePerQuintal.toLocaleString('en-IN')}/qtl · {m.distanceKm} km · Transport ₹
                          {m.transportCost.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-mono font-bold tabular-nums ${
                          m.isBestMarket ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        ₹{m.netProfit.toLocaleString('en-IN')}
                      </p>
                      <p className={`text-[11px] font-medium ${m.isBestMarket ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {m.isBestMarket ? 'Recommended' : m.recommendationLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Formula: (Price × Qty) − Transport − Mandi Fees</span>
          </div>
        </section>
      </div>
    </div>
  );
};
