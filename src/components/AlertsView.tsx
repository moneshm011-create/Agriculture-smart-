import React, { useState } from 'react';
import { Bell, Plus, Trash2, TrendingUp, CloudRain, CheckCircle2 } from 'lucide-react';
import { CROPS, MARKETS } from '../data/agriData';
import type { TranslationStrings } from '../i18n/translations';

export interface EvaluatedAlert {
  id: string;
  crop: string;
  market: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  currentPrice: number;
  predictedMax: number;
  predictedMin: number;
  trend: string;
  triggered: boolean;
  matchedPrice: number;
  matchedDate: string;
  message: string;
}

interface AlertsViewProps {
  alerts: EvaluatedAlert[];
  defaultCrop: string;
  onCreateAlert: (payload: {
    crop: string;
    market: string;
    targetPrice: number;
    condition: 'above' | 'below';
  }) => Promise<void>;
  onDeleteAlert: (id: string) => Promise<void>;
  t: TranslationStrings;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  defaultCrop,
  onCreateAlert,
  onDeleteAlert,
  t,
}) => {
  const [crop, setCrop] = useState(defaultCrop);
  const [market, setMarket] = useState(MARKETS[0].name);
  const [targetPrice, setTargetPrice] = useState('3200');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const num = Number(targetPrice);
    if (!Number.isFinite(num) || num <= 0) {
      setError('Please enter a valid positive target price (INR/quintal).');
      return;
    }
    setSaving(true);
    try {
      await onCreateAlert({ crop, market, targetPrice: num, condition });
    } catch {
      setError('Could not save price alert.');
    } finally {
      setSaving(false);
    }
  };

  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.nav.alerts}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Set target selling prices and receive instant notifications when predicted mandi prices hit your target
          </p>
        </div>
        <div className="text-xs font-medium text-slate-600 tabular-nums">
          {triggeredCount} target alerts triggered · {alerts.length} total active
        </div>
      </div>

      {/* Create Target Price Alert Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-r from-white via-emerald-50/40 to-amber-50/40 border border-emerald-200/80 rounded-2xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label htmlFor="alert-crop-select" className="block text-xs font-medium text-slate-600 mb-1">
            {t.labels.crop}
          </label>
          <select
            id="alert-crop-select"
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
          <label htmlFor="alert-market-select" className="block text-xs font-medium text-slate-600 mb-1">
            {t.labels.market}
          </label>
          <select
            id="alert-market-select"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="w-full h-10 px-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {MARKETS.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="alert-condition-select" className="block text-xs font-medium text-slate-600 mb-1">
            Condition
          </label>
          <select
            id="alert-condition-select"
            value={condition}
            onChange={(e) => setCondition(e.target.value === 'below' ? 'below' : 'above')}
            className="w-full h-10 px-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="above">Price Rises Above (≥)</option>
            <option value="below">Price Drops Below (≤)</option>
          </select>
        </div>

        <div>
          <label htmlFor="alert-target-input" className="block text-xs font-medium text-slate-600 mb-1">
            Target Price (₹ / Quintal)
          </label>
          <input
            id="alert-target-input"
            type="number"
            min={100}
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full h-10 px-3 text-sm font-mono tabular-nums text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="h-10 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{saving ? 'Saving...' : t.labels.setAlert}</span>
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Active Target Alerts List */}
      <section className="bg-white border border-emerald-200/80 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50/70 via-sky-50/40 to-amber-50/40 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Target Price Alerts</h2>
          <span className="text-xs font-medium text-slate-600">Evaluated against 7-day forecast</span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No target price alerts set yet. Add a target price above to monitor market movements.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                alert.triggered ? 'bg-emerald-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-9 h-9 rounded-lg inline-flex items-center justify-center shrink-0 ${
                    alert.triggered ? 'bg-emerald-600 text-white' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {alert.triggered ? <CheckCircle2 className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{alert.crop}</span>
                    <span className="text-xs text-slate-500">· {alert.market}</span>
                    {alert.triggered && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-600 text-white rounded-md">
                        Target Reached
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 tabular-nums">
                    Target: {alert.condition === 'above' ? '≥' : '≤'} ₹{alert.targetPrice.toLocaleString('en-IN')}/qtl ·
                    Current: ₹{alert.currentPrice.toLocaleString('en-IN')}/qtl
                  </p>
                  <p
                    className={`text-xs mt-1 font-medium ${
                      alert.triggered ? 'text-emerald-800' : 'text-slate-700'
                    }`}
                  >
                    {alert.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteAlert(alert.id)}
                aria-label={`Delete alert for ${alert.crop} at ${alert.market}`}
                className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors self-start sm:self-center shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          ))
        )}
      </section>

      {/* Market & Weather Advisory Notifications Feed */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-white to-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Best Selling Window Insight</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Tomato and Onion bids in Oddanchatram and Koyambedu show upward momentum over the next 5–7 days due to tighter harvest arrivals.
          </p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-sky-50/80 via-white to-white border border-sky-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
          <div className="flex items-center gap-2 text-sm font-bold text-sky-900">
            <CloudRain className="w-4 h-4 text-sky-600" />
            <span>Weather-Related Agricultural Alert</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Coastal showers forecast for Thanjavur and Dindigul over the next 48 hours. Ensure dry tarpaulin cover for Paddy and Mesh bags for Onions before dispatch.
          </p>
        </div>
      </section>
    </div>
  );
};
