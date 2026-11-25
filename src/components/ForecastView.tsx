import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Info, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { CROPS, MARKETS } from '../data/agriData';
import type { ForecastResult } from '../utils/calculations';
import type { TranslationStrings } from '../i18n/translations';
import { buildCsvContent, sanitizeFilenameSegment, triggerCsvDownload } from '../utils/csvExport';

interface ForecastViewProps {
  selectedCrop: string;
  selectedMarket: string;
  forecastDays: 7 | 30;
  forecast: ForecastResult;
  loading: boolean;
  onCropChange: (crop: string) => void;
  onMarketChange: (market: string) => void;
  onDaysChange: (days: 7 | 30) => void;
  t: TranslationStrings;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  selectedCrop,
  selectedMarket,
  forecastDays,
  forecast,
  loading,
  onCropChange,
  onMarketChange,
  onDaysChange,
  t,
}) => {
  const combinedData = [
    ...forecast.history.map((h) => ({
      date: h.date.slice(5),
      fullDate: h.date,
      historyPrice: h.price,
      forecastPrice: null as number | null,
      range: null as [number, number] | null,
    })),
    ...forecast.forecast.map((f) => ({
      date: f.date.slice(5),
      fullDate: f.date,
      historyPrice: null as number | null,
      forecastPrice: f.price,
      range: [f.lowerBound ?? f.price, f.upperBound ?? f.price] as [number, number],
    })),
  ];

  const dividerIndex = forecast.history.length - 1;
  if (combinedData[dividerIndex]) {
    combinedData[dividerIndex].forecastPrice = combinedData[dividerIndex].historyPrice;
  }
  const dividerDate = forecast.history[dividerIndex]?.date.slice(5);

  const TrendIcon =
    forecast.trend === 'Increasing' ? TrendingUp : forecast.trend === 'Decreasing' ? TrendingDown : Minus;

  const trendColor =
    forecast.trend === 'Increasing'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : forecast.trend === 'Decreasing'
      ? 'text-orange-700 bg-orange-50 border-orange-200'
      : 'text-sky-700 bg-sky-50 border-sky-200';

  const trendTranslated =
    forecast.trend === 'Increasing'
      ? t.labels.increasing
      : forecast.trend === 'Decreasing'
      ? t.labels.decreasing
      : t.labels.stable;

  const tableRows = [
    ...forecast.history.map((h) => ({
      date: h.date,
      period: 'Historical' as const,
      price: h.price,
      lowerBound: null as number | null,
      upperBound: null as number | null,
      crop: forecast.crop,
      market: forecast.market,
    })),
    ...forecast.forecast.map((f) => ({
      date: f.date,
      period: 'Forecast' as const,
      price: f.price,
      lowerBound: f.lowerBound ?? f.price,
      upperBound: f.upperBound ?? f.price,
      crop: forecast.crop,
      market: forecast.market,
    })),
  ];

  const handleDownloadCsv = () => {
    const csv = buildCsvContent(tableRows, [
      { header: 'Date', accessor: (row) => row.date },
      { header: 'Period', accessor: (row) => row.period },
      { header: 'Crop', accessor: (row) => row.crop },
      { header: 'Market', accessor: (row) => row.market },
      { header: 'Price (INR/Quintal)', accessor: (row) => row.price },
      { header: 'Lower Bound (INR/Quintal)', accessor: (row) => row.lowerBound ?? '' },
      { header: 'Upper Bound (INR/Quintal)', accessor: (row) => row.upperBound ?? '' },
    ]);
    const filename = `crop-forecast-${sanitizeFilenameSegment(forecast.crop)}-${sanitizeFilenameSegment(
      forecast.market
    )}-${forecastDays}d.csv`;
    triggerCsvDownload(filename, csv);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.nav.forecast}</h1>
          <p className="text-sm text-slate-600 mt-1">
            30-day market price history paired with {forecastDays}-day ML time-series price predictions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* 7 / 30 Day Horizon Segmented Control */}
          <div className="inline-flex items-center p-1 bg-emerald-50/90 border border-emerald-200 rounded-xl">
            <button
              type="button"
              onClick={() => onDaysChange(7)}
              className={`h-9 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                forecastDays === 7
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              {t.labels.days7}
            </button>
            <button
              type="button"
              onClick={() => onDaysChange(30)}
              className={`h-9 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                forecastDays === 30
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              {t.labels.days30}
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="h-10 px-4 inline-flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{t.labels.downloadCsv}</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-r from-white via-emerald-50/40 to-sky-50/40 border border-emerald-200/80 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="forecast-crop-select" className="block text-xs font-semibold text-emerald-800 mb-1">
            {t.labels.crop}
          </label>
          <select
            id="forecast-crop-select"
            value={selectedCrop}
            onChange={(e) => onCropChange(e.target.value)}
            className="w-full h-10 px-3 text-sm font-semibold text-slate-900 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CROPS.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="forecast-market-select" className="block text-xs font-semibold text-sky-800 mb-1">
            {t.labels.market}
          </label>
          <select
            id="forecast-market-select"
            value={selectedMarket}
            onChange={(e) => onMarketChange(e.target.value)}
            className="w-full h-10 px-3 text-sm font-semibold text-slate-900 bg-white border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {MARKETS.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name} ({m.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Demonstration Model Notice */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50/70 to-orange-50/50 border border-amber-200 text-amber-950 text-xs sm:text-sm">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>{forecast.notice}</span>
      </div>

      {/* Forecast KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="group animate-card-enter [animation-delay:0ms] relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-slate-300 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-600 to-slate-800 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <p className="text-xs font-semibold text-slate-600">Current Market Price</p>
          <p className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.03]">
            ₹{forecast.currentPrice.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Per quintal</p>
        </div>

        <div className="group animate-card-enter [animation-delay:55ms] relative overflow-hidden bg-gradient-to-br from-sky-50/90 via-white to-white border border-sky-200 rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-sky-300 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <p className="text-xs font-semibold text-sky-800">{t.labels.minExpected}</p>
          <p className="mt-2 text-xl font-bold font-mono text-sky-700 tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.03]">
            ₹{forecast.minPrice.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{forecastDays}-day low</p>
        </div>

        <div className="group animate-card-enter [animation-delay:110ms] relative overflow-hidden bg-gradient-to-br from-emerald-50/90 via-white to-white border border-emerald-200 rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <p className="text-xs font-semibold text-emerald-800">{t.labels.maxExpected}</p>
          <p className="mt-2 text-xl font-bold font-mono text-emerald-700 tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.03]">
            ₹{forecast.maxPrice.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{forecastDays}-day peak</p>
        </div>

        <div className="group animate-card-enter [animation-delay:165ms] relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-white to-white border border-amber-200 rounded-2xl p-4 shadow-xs hover:-translate-y-1 hover:shadow-md hover:border-amber-300 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <p className="text-xs font-semibold text-amber-900">{t.labels.avgPredicted}</p>
          <p className="mt-2 text-xl font-bold font-mono text-amber-700 tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.03]">
            ₹{forecast.avgPrice.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t.labels.confidence}: {(forecast.confidence * 100).toFixed(0)}%
          </p>
        </div>

        <div className={`group animate-card-enter [animation-delay:220ms] relative overflow-hidden border rounded-2xl p-4 shadow-xs col-span-2 lg:col-span-1 hover:-translate-y-1 hover:shadow-md active:scale-[0.99] transition-all duration-200 ${trendColor}`}>
          <div
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-85 group-hover:opacity-100 transition-opacity duration-200 ${
              forecast.trend === 'Increasing'
                ? 'from-emerald-500 to-teal-500'
                : forecast.trend === 'Decreasing'
                ? 'from-orange-500 to-rose-500'
                : 'from-sky-500 to-blue-500'
            }`}
          />
          <p className="text-xs font-semibold">{t.labels.priceTrend}</p>
          <div className="mt-2 flex items-center gap-2">
            <TrendIcon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6" />
            <span className="text-lg font-bold">{trendTranslated}</span>
          </div>
          <p className="text-[11px] mt-0.5 font-mono tabular-nums">
            {forecast.changePct >= 0 ? '+' : ''}
            {forecast.changePct.toFixed(2)}% in {forecastDays}d
          </p>
        </div>
      </div>

      {/* Main Interactive Forecast Line Chart */}
      <section className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {forecast.crop} — 30-Day History & {forecastDays}-Day Forecast
            </h2>
            <p className="text-xs text-slate-500">{forecast.market}</p>
          </div>
          {loading && <span className="text-xs text-slate-500">Updating forecast...</span>}
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData} margin={{ top: 28, right: 20, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={18} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} />
              <Tooltip
                formatter={(value: unknown, name: unknown) => {
                  if (Array.isArray(value)) {
                    return [
                      `₹${Number(value[0]).toLocaleString('en-IN')} – ₹${Number(value[1]).toLocaleString('en-IN')}`,
                      'Confidence Band',
                    ];
                  }
                  return [`₹${Number(value ?? 0).toLocaleString('en-IN')}`, String(name ?? 'Price')];
                }}
              />
              <Legend />
              {dividerDate && (
                <ReferenceLine
                  x={dividerDate}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{ value: 'Today', position: 'top', dy: -6, fill: '#475569', fontSize: 11, fontWeight: 600 }}
                />
              )}
              <Area
                type="monotone"
                dataKey="range"
                name="Confidence Band"
                stroke="none"
                fill="#bbf7d0"
                fillOpacity={0.5}
              />
              <Line
                type="monotone"
                dataKey="historyPrice"
                name="Previous 30 Days"
                stroke="#0284c7"
                strokeWidth={2.3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forecastPrice"
                name={`Predicted (${forecastDays} Days)`}
                stroke="#16a34a"
                strokeWidth={2.8}
                strokeDasharray="6 4"
                dot={{ r: 3, fill: '#16a34a' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Historical & Predicted Price Data Table */}
      <section className="bg-white border border-emerald-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-50/70 via-sky-50/50 to-amber-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {forecast.crop} Price Series Data ({forecast.market})
            </h2>
            <p className="text-xs text-slate-600">
              {forecast.history.length} historical days & {forecast.forecast.length} forecast days ({tableRows.length} rows)
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600">Currency: INR (₹) per quintal</span>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Price (₹/Qtl)</th>
                <th className="py-3 px-4 text-right">Lower Bound</th>
                <th className="py-3 px-4 text-right">Upper Bound</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tableRows.map((row) => (
                <tr
                  key={`${row.period}-${row.date}`}
                  className={row.period === 'Forecast' ? 'bg-emerald-50/30 hover:bg-emerald-50/60' : 'hover:bg-slate-50'}
                >
                  <td className="py-2.5 px-4 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-xs font-semibold ${
                        row.period === 'Forecast' ? 'text-emerald-700' : 'text-sky-700'
                      }`}
                    >
                      {row.period}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    ₹{row.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                    {row.lowerBound !== null ? `₹${row.lowerBound.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                    {row.upperBound !== null ? `₹${row.upperBound.toLocaleString('en-IN')}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
