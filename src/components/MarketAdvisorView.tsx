import React, { useState } from 'react';
import { Award, MapPin, Truck, Calculator } from 'lucide-react';
import type { MarketAdvisorResult, MarketRecommendationRow } from '../utils/calculations';
import type { TranslationStrings } from '../i18n/translations';
import type { GlobalSelection } from './CropSelectorBar';
import { MarketMapModal } from './MarketMapModal';

interface MarketAdvisorViewProps {
  selection: GlobalSelection;
  advisor: MarketAdvisorResult;
  transportRatePerKm: number;
  onTransportRateChange: (rate: number) => void;
  onQuantityChange: (qty: number) => void;
  t: TranslationStrings;
}

export const MarketAdvisorView: React.FC<MarketAdvisorViewProps> = ({
  selection,
  advisor,
  transportRatePerKm,
  onTransportRateChange,
  onQuantityChange,
  t,
}) => {
  const [mapMarket, setMapMarket] = useState<MarketRecommendationRow | null>(null);
  const best = advisor.bestMarket;
  const highestRaw = advisor.highestPriceMarket;
  const highestPriceDiffers = best.marketId !== highestRaw.marketId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.nav.advisor}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Compares agricultural mandis by Net Profit = (Crop Price × Quantity) − Transport Cost − Mandi Expenses
          </p>
        </div>
      </div>

      {/* Parameter Tuning Bar */}
      <section className="bg-gradient-to-r from-white via-emerald-50/40 to-amber-50/40 border border-emerald-200/80 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="advisor-qty" className="block text-xs font-semibold text-emerald-800 mb-1">
            {t.labels.quantity}
          </label>
          <input
            id="advisor-qty"
            type="number"
            min={1}
            max={5000}
            value={selection.quantity}
            onChange={(e) => onQuantityChange(Math.max(1, Number(e.target.value) || 1))}
            className="w-full h-10 px-3 text-sm font-mono tabular-nums text-slate-900 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="advisor-rate" className="block text-xs font-semibold text-orange-800 mb-1">
            Transport Cost Rate (₹ / km / truck load)
          </label>
          <input
            id="advisor-rate"
            type="number"
            min={5}
            max={100}
            value={transportRatePerKm}
            onChange={(e) => onTransportRateChange(Math.max(5, Number(e.target.value) || 18))}
            className="w-full h-10 px-3 text-sm font-mono tabular-nums text-slate-900 bg-white border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex items-end">
          <div className="w-full h-10 px-3 flex items-center gap-2 text-xs font-medium text-sky-900 bg-sky-50/80 border border-sky-200 rounded-lg">
            <Calculator className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate">
              Origin: {selection.district} · {selection.crop}
            </span>
          </div>
        </div>
      </section>

      {/* Best Market Winner Summary */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white border border-emerald-500 rounded-2xl p-6 shadow-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-yellow-300 to-sky-300" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Recommended Highest Net-Profit Market</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{best.marketName}</h2>
            <p className="text-sm text-emerald-50 max-w-2xl">
              {highestPriceDiffers
                ? `Although ${highestRaw.shortName} posts a higher raw mandi rate (₹${highestRaw.cropPricePerQuintal.toLocaleString('en-IN')}/qtl), lower transport cost makes ${best.shortName} ₹${(best.netProfit - highestRaw.netProfit).toLocaleString('en-IN')} more profitable overall.`
                : `${best.shortName} delivers both strong mandi demand (${best.demandLevel}) and the highest estimated net return of ₹${best.netProfit.toLocaleString('en-IN')}.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="bg-white border border-emerald-200 rounded-xl px-4 py-3 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Estimated {t.labels.netProfit}</p>
              <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                ₹{best.netProfit.toLocaleString('en-IN')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMapMarket(best)}
              className="h-11 px-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.labels.viewOnMap}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Market Comparison Table */}
      <section className="bg-white border border-emerald-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50/70 via-sky-50/50 to-amber-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Market Profitability Comparison ({selection.crop})
            </h2>
            <p className="text-xs text-slate-600">
              Sorted by Net Profit descending · {selection.quantity} {t.labels.quintals} from {selection.district}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-orange-800">
            <Truck className="w-4 h-4 text-orange-600" />
            <span>Includes mandi handling & weighing fees</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">{t.labels.marketName}</th>
                <th className="py-3 px-4 text-right">{t.labels.cropPrice}</th>
                <th className="py-3 px-4 text-right">{t.labels.transportCost}</th>
                <th className="py-3 px-4 text-right">{t.labels.distance}</th>
                <th className="py-3 px-4 text-right">{t.labels.netProfit}</th>
                <th className="py-3 px-4">{t.labels.recommendation}</th>
                <th className="py-3 px-4 text-right">Map</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {advisor.markets.map((m) => (
                <tr
                  key={m.marketId}
                  className={m.isBestMarket ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{m.marketName}</div>
                    <div className="text-xs text-slate-500">
                      {m.district} · Demand: {m.demandLevel} · Arrivals: {m.arrivalQuintalsPerDay.toLocaleString('en-IN')} qtl/d
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    ₹{m.cropPricePerQuintal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-orange-700 tabular-nums">
                    ₹{m.transportCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                    {m.distanceKm} km
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-bold tabular-nums ${
                      m.isBestMarket ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    ₹{m.netProfit.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    {m.isBestMarket ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white whitespace-nowrap">
                        Best Market
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600 whitespace-nowrap">{m.recommendationLabel}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setMapMarket(m)}
                      aria-label={`View ${m.marketName} on Map`}
                      className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.labels.viewOnMap}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <MarketMapModal
        isOpen={Boolean(mapMarket)}
        onClose={() => setMapMarket(null)}
        selectedMarket={mapMarket}
        allMarkets={advisor.markets}
        farmerDistrict={selection.district}
      />
    </div>
  );
};
