import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Download } from 'lucide-react';
import { CROPS } from '../data/agriData';
import type { ForecastResult, MarketAdvisorResult } from '../utils/calculations';
import type { TranslationStrings } from '../i18n/translations';
import type { GlobalSelection } from './CropSelectorBar';
import { buildCsvContent, sanitizeFilenameSegment, triggerCsvDownload } from '../utils/csvExport';

interface MarketComparisonViewProps {
  selection: GlobalSelection;
  advisor: MarketAdvisorResult;
  forecast: ForecastResult;
  onCropChange: (crop: string) => void;
  t: TranslationStrings;
}

const PIE_COLORS = ['#16a34a', '#f97316', '#eab308'];

export const MarketComparisonView: React.FC<MarketComparisonViewProps> = ({
  selection,
  advisor,
  forecast,
  onCropChange,
  t,
}) => {
  const barData = advisor.markets.map((m) => ({
    name: m.shortName,
    pricePerQtl: m.cropPricePerQuintal,
    predicted7d: m.predicted7DayPrice,
    transportCost: m.transportCost,
    netProfit: m.netProfit,
  }));

  const trendData = [
    ...forecast.history.slice(-14).map((h) => ({
      date: h.date.slice(5),
      historical: h.price,
      predicted: null as number | null,
    })),
    ...forecast.forecast.slice(0, 7).map((f) => ({
      date: f.date.slice(5),
      historical: null as number | null,
      predicted: f.price,
    })),
  ];
  if (trendData.length > 14) {
    trendData[13].predicted = trendData[13].historical;
  }

  const best = advisor.bestMarket;
  const pieData = [
    { name: 'Net Profit', value: Math.max(0, best.netProfit) },
    { name: 'Transport Cost', value: best.transportCost },
    { name: 'Mandi Fees', value: best.otherExpenses },
  ];

  const handleDownloadCsv = () => {
    const csv = buildCsvContent(advisor.markets, [
      { header: 'Market Name', accessor: (m) => m.marketName },
      { header: 'District', accessor: (m) => m.district },
      { header: 'State', accessor: (m) => m.state },
      { header: 'Demand', accessor: (m) => m.demandLevel },
      { header: 'Daily Arrivals (Qtl)', accessor: (m) => m.arrivalQuintalsPerDay },
      { header: 'Current Price (INR/Qtl)', accessor: (m) => m.cropPricePerQuintal },
      { header: 'Predicted 7-Day Price (INR/Qtl)', accessor: (m) => m.predicted7DayPrice },
      { header: 'Distance (km)', accessor: (m) => m.distanceKm },
      { header: 'Transport Cost (INR)', accessor: (m) => m.transportCost },
      { header: 'Mandi Fees (INR)', accessor: (m) => m.otherExpenses },
      { header: 'Gross Revenue (INR)', accessor: (m) => m.grossRevenue },
      { header: 'Net Profit (INR)', accessor: (m) => m.netProfit },
      { header: 'Recommendation', accessor: (m) => (m.isBestMarket ? 'Best Market' : m.recommendationLabel) },
    ]);
    const filename = `market-comparison-${sanitizeFilenameSegment(selection.crop)}-${sanitizeFilenameSegment(
      selection.district
    )}-${selection.quantity}qtl.csv`;
    triggerCsvDownload(filename, csv);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.nav.comparison}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Visual comparison of mandi prices, transport costs, historical vs predicted trends, and net profit
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-52">
            <label htmlFor="comparison-crop-select" className="block text-xs font-medium text-slate-600 mb-1">
              {t.labels.crop}
            </label>
            <select
              id="comparison-crop-select"
              value={selection.crop}
              onChange={(e) => onCropChange(e.target.value)}
              className="w-full h-10 px-3 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {CROPS.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Crop Price Comparison between Markets */}
        <section className="relative overflow-hidden bg-white border border-sky-200/80 rounded-2xl p-5 shadow-xs">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-500" />
          <h2 className="text-base font-bold text-slate-900">Current vs Predicted Price by Market</h2>
          <p className="text-xs text-slate-500 mb-4">{selection.crop} (INR per quintal)</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(v: unknown) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="pricePerQtl" name="Current Price" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted7d" name="7-Day Forecast" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 2. Historical & Predicted Price Trends */}
        <section className="relative overflow-hidden bg-white border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-amber-400" />
          <h2 className="text-base font-bold text-slate-900">Historical vs Predicted Price Trend</h2>
          <p className="text-xs text-slate-500 mb-4">{best.marketName}</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} />
                <Tooltip formatter={(v: unknown) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                <Legend />
                <Line type="monotone" dataKey="historical" name="Historical" stroke="#2563eb" strokeWidth={2.4} dot={false} />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted"
                  stroke="#eab308"
                  strokeWidth={2.6}
                  strokeDasharray="5 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. Expected Net Profit vs Transportation Cost */}
        <section className="relative overflow-hidden bg-white border border-orange-200/80 rounded-2xl p-5 shadow-xs">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-orange-500" />
          <h2 className="text-base font-bold text-slate-900">Expected Net Profit vs Transport Cost</h2>
          <p className="text-xs text-slate-500 mb-4">
            For {selection.quantity} quintals dispatched from {selection.district}
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(v: unknown) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="netProfit" name="Net Profit (₹)" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="transportCost" name="Transport Cost (₹)" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 4. Revenue Allocation Pie Chart for Best Market */}
        <section className="relative overflow-hidden bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-orange-500" />
          <h2 className="text-base font-bold text-slate-900">Revenue Split at Best Market</h2>
          <p className="text-xs text-slate-500 mb-4">
            {best.marketName} · Gross Revenue ₹{best.grossRevenue.toLocaleString('en-IN')}
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: unknown) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Market Comparison Data Table */}
      <section className="bg-white border border-emerald-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-50/70 via-sky-50/50 to-amber-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Market Comparison Breakdown ({selection.crop})
            </h2>
            <p className="text-xs text-slate-600">
              {advisor.markets.length} markets compared · {selection.quantity} {t.labels.quintals} from {selection.district}
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600">Sorted by net profit descending</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">{t.labels.marketName}</th>
                <th className="py-3 px-4 text-right">{t.labels.cropPrice}</th>
                <th className="py-3 px-4 text-right">7-Day Forecast</th>
                <th className="py-3 px-4 text-right">{t.labels.distance}</th>
                <th className="py-3 px-4 text-right">{t.labels.transportCost}</th>
                <th className="py-3 px-4 text-right">Mandi Fees</th>
                <th className="py-3 px-4 text-right">Gross Revenue</th>
                <th className="py-3 px-4 text-right">{t.labels.netProfit}</th>
                <th className="py-3 px-4">{t.labels.recommendation}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {advisor.markets.map((m) => (
                <tr
                  key={m.marketId}
                  className={m.isBestMarket ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'}
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{m.marketName}</div>
                    <div className="text-xs text-slate-500">
                      {m.district}, {m.state} · {m.demandLevel} Demand · {m.arrivalQuintalsPerDay.toLocaleString('en-IN')} qtl/d
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    ₹{m.cropPricePerQuintal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700 tabular-nums whitespace-nowrap">
                    ₹{m.predicted7DayPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                    {m.distanceKm} km
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-orange-700 tabular-nums whitespace-nowrap">
                    ₹{m.transportCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                    ₹{m.otherExpenses.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800 tabular-nums whitespace-nowrap">
                    ₹{m.grossRevenue.toLocaleString('en-IN')}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                      m.isBestMarket ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    ₹{m.netProfit.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    {m.isBestMarket ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white whitespace-nowrap">
                        Best Market
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600 whitespace-nowrap">{m.recommendationLabel}</span>
                    )}
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
