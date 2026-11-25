import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { CROPS, MARKETS, STATE_DISTRICTS } from '../data/agriData';
import type { MarketRecommendationRow } from '../utils/calculations';
import type { TranslationStrings } from '../i18n/translations';

interface FarmerAdviceResponse {
  submission: {
    id: string;
    farmerName: string;
    crop: string;
    quantity: number;
    district: string;
    preferredMarket: string;
    transportCost: number;
    expectedSellingDate: string;
  };
  preferredAnalysis: {
    marketName: string;
    cropPricePerQuintal: number;
    grossRevenue: number;
    transportCost: number;
    otherExpenses: number;
    netProfit: number;
  };
  bestAnalysis: MarketRecommendationRow;
  profitGain: number;
  adviceMessage: string;
  forecastTrend: string;
}

interface FarmerInputViewProps {
  defaultCrop: string;
  defaultDistrict: string;
  defaultQuantity: number;
  defaultDate: string;
  t: TranslationStrings;
}

export const FarmerInputView: React.FC<FarmerInputViewProps> = ({
  defaultCrop,
  defaultDistrict,
  defaultQuantity,
  defaultDate,
  t,
}) => {
  const allDistricts = STATE_DISTRICTS.flatMap((s) => s.districts);

  const [farmerName, setFarmerName] = useState('');
  const [crop, setCrop] = useState(defaultCrop);
  const [quantity, setQuantity] = useState(String(defaultQuantity));
  const [district, setDistrict] = useState(defaultDistrict);
  const [preferredMarket, setPreferredMarket] = useState(MARKETS[0].name);
  const [transportCost, setTransportCost] = useState('2500');
  const [expectedSellingDate, setExpectedSellingDate] = useState(defaultDate);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FarmerAdviceResponse | null>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!farmerName.trim() || farmerName.trim().length < 2) {
      next.farmerName = 'Please enter farmer name (at least 2 characters).';
    }
    const qtyNum = Number(quantity);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      next.quantity = 'Enter a positive quantity in quintals.';
    }
    const tCostNum = Number(transportCost);
    if (!Number.isFinite(tCostNum) || tCostNum < 0 || transportCost.trim() === '') {
      next.transportCost = 'Enter a valid transportation cost (0 or higher).';
    }
    if (!expectedSellingDate) {
      next.expectedSellingDate = 'Please pick an expected selling date.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/farmer-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName: farmerName.trim(),
          crop,
          quantity: Number(quantity),
          district,
          preferredMarket,
          transportCost: Number(transportCost),
          expectedSellingDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Could not submit farmer details.');
      } else {
        setResult(data);
      }
    } catch {
      setServerError('Network error while connecting to advisor backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.nav.farmerInput}</h1>
        <p className="text-sm text-slate-600 mt-1">
          Enter your harvest details to compare your preferred market against our highest net-profit recommendation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-6 relative overflow-hidden bg-white border border-emerald-200/80 rounded-2xl p-6 shadow-xs space-y-4"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-400" />
          <div>
            <label htmlFor="farmer-name-input" className="block text-xs font-medium text-slate-700 mb-1">
              Farmer Name
            </label>
            <input
              id="farmer-name-input"
              type="text"
              placeholder="e.g. Muruganathan K"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full h-10 px-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {errors.farmerName && <p className="mt-1 text-xs text-red-600">{errors.farmerName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="farmer-crop-select" className="block text-xs font-medium text-slate-700 mb-1">
                {t.labels.crop}
              </label>
              <select
                id="farmer-crop-select"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full h-10 px-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {CROPS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="farmer-qty-input" className="block text-xs font-medium text-slate-700 mb-1">
                Crop Quantity (Quintals)
              </label>
              <input
                id="farmer-qty-input"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono tabular-nums text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="farmer-district-select" className="block text-xs font-medium text-slate-700 mb-1">
                {t.labels.district}
              </label>
              <select
                id="farmer-district-select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-10 px-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {allDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="farmer-market-select" className="block text-xs font-medium text-slate-700 mb-1">
                Preferred Market
              </label>
              <select
                id="farmer-market-select"
                value={preferredMarket}
                onChange={(e) => setPreferredMarket(e.target.value)}
                className="w-full h-10 px-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {MARKETS.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="farmer-transport-input" className="block text-xs font-medium text-slate-700 mb-1">
                Estimated Transport Cost (₹)
              </label>
              <input
                id="farmer-transport-input"
                type="number"
                min={0}
                value={transportCost}
                onChange={(e) => setTransportCost(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono tabular-nums text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {errors.transportCost && <p className="mt-1 text-xs text-red-600">{errors.transportCost}</p>}
            </div>

            <div>
              <label htmlFor="farmer-date-input" className="block text-xs font-medium text-slate-700 mb-1">
                {t.labels.sellingDate}
              </label>
              <input
                id="farmer-date-input"
                type="date"
                value={expectedSellingDate}
                onChange={(e) => setExpectedSellingDate(e.target.value)}
                className="w-full h-10 px-3 text-sm tabular-nums text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {errors.expectedSellingDate && <p className="mt-1 text-xs text-red-600">{errors.expectedSellingDate}</p>}
            </div>
          </div>

          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 inline-flex items-center justify-center gap-2 px-5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Calculating Recommendation...' : t.labels.submitAdvice}</span>
          </button>
        </form>

        {/* Personalized Output */}
        <section className="lg:col-span-6 relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-sky-50/40 border border-sky-200/80 rounded-2xl p-6 shadow-xs">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500" />
          {!result ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-base font-bold text-slate-800">Personalized Market Report</p>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Fill in your crop quantity, district, and transport cost on the left to receive a net-profit breakdown comparing your preferred market with the best regional mandi.
              </p>
            </div>
          ) : (
            <div className="space-y-5" data-testid="farmer-recommendation-card">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-emerald-700">
                    Personalized Recommendation for {result.submission.farmerName}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    Sell at {result.bestAnalysis.marketName}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{result.adviceMessage}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500">Your Preferred Market</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{result.preferredAnalysis.marketName}</p>
                  <p className="mt-2 text-xl font-bold font-mono text-slate-800 tabular-nums">
                    ₹{result.preferredAnalysis.netProfit.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    Price ₹{result.preferredAnalysis.cropPricePerQuintal.toLocaleString('en-IN')}/qtl · Transport ₹
                    {result.preferredAnalysis.transportCost.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-800">Best Net-Profit Market</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{result.bestAnalysis.marketName}</p>
                  <p className="mt-2 text-xl font-bold font-mono text-emerald-700 tabular-nums">
                    ₹{result.bestAnalysis.netProfit.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5 tabular-nums">
                    Price ₹{result.bestAnalysis.cropPricePerQuintal.toLocaleString('en-IN')}/qtl · Transport ₹
                    {result.bestAnalysis.transportCost.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 tabular-nums">
                Selling Date: {result.submission.expectedSellingDate} · 7-Day Price Trend: {result.forecastTrend}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
