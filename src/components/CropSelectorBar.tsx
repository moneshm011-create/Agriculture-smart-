import React from 'react';
import { CROPS, STATE_DISTRICTS } from '../data/agriData';
import type { TranslationStrings } from '../i18n/translations';

export interface GlobalSelection {
  crop: string;
  state: string;
  district: string;
  variety: string;
  quantity: number;
  sellingDate: string;
}

interface CropSelectorBarProps {
  selection: GlobalSelection;
  onChange: (next: GlobalSelection) => void;
  t: TranslationStrings;
}

export const CropSelectorBar: React.FC<CropSelectorBarProps> = ({ selection, onChange, t }) => {
  const currentCrop = CROPS.find((c) => c.name === selection.crop) || CROPS[0];
  const currentStateObj = STATE_DISTRICTS.find((s) => s.state === selection.state) || STATE_DISTRICTS[0];

  const handleCropChange = (newCropName: string) => {
    const matched = CROPS.find((c) => c.name === newCropName) || CROPS[0];
    onChange({
      ...selection,
      crop: matched.name,
      variety: matched.varieties[0],
    });
  };

  const handleStateChange = (newState: string) => {
    const matched = STATE_DISTRICTS.find((s) => s.state === newState) || STATE_DISTRICTS[0];
    onChange({
      ...selection,
      state: matched.state,
      district: matched.districts[0],
    });
  };

  return (
    <section
      aria-label="Crop and Location Selection"
      className="bg-gradient-to-r from-white via-emerald-50/45 to-sky-50/45 border border-emerald-200/80 rounded-2xl p-4 shadow-xs"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.7fr_1.1fr_1.15fr_0.95fr_1.15fr] gap-3">
        <div>
          <label htmlFor="global-crop-select" className="block text-xs font-semibold text-emerald-800 mb-1">
            {t.labels.crop}
          </label>
          <select
            id="global-crop-select"
            value={selection.crop}
            onChange={(e) => handleCropChange(e.target.value)}
            className="w-full h-10 px-3 text-sm font-semibold text-slate-900 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-emerald-300 transition-colors"
          >
            {CROPS.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="global-variety-select" className="block text-xs font-medium text-slate-600 mb-1">
            {t.labels.variety}
          </label>
          <select
            id="global-variety-select"
            value={selection.variety}
            onChange={(e) => onChange({ ...selection, variety: e.target.value })}
            className="w-full h-10 px-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {currentCrop.varieties.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="global-state-select" className="block text-xs font-medium text-slate-600 mb-1">
            {t.labels.state}
          </label>
          <select
            id="global-state-select"
            value={selection.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full h-10 px-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {STATE_DISTRICTS.map((s) => (
              <option key={s.state} value={s.state}>
                {s.state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="global-district-select" className="block text-xs font-medium text-slate-600 mb-1">
            {t.labels.district}
          </label>
          <select
            id="global-district-select"
            value={selection.district}
            onChange={(e) => onChange({ ...selection, district: e.target.value })}
            className="w-full h-10 px-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {currentStateObj.districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="global-quantity-input" className="block text-xs font-medium text-slate-600 mb-1">
            {t.labels.quantity}
          </label>
          <input
            id="global-quantity-input"
            type="number"
            min={1}
            max={5000}
            value={selection.quantity}
            onChange={(e) => {
              const val = Math.max(1, Number(e.target.value) || 1);
              onChange({ ...selection, quantity: val });
            }}
            className="w-full h-10 px-3 text-sm font-mono tabular-nums text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label htmlFor="global-date-input" className="block text-xs font-medium text-slate-600 mb-1">
            {t.labels.sellingDate}
          </label>
          <input
            id="global-date-input"
            type="date"
            value={selection.sellingDate}
            onChange={(e) => onChange({ ...selection, sellingDate: e.target.value })}
            className="w-full h-10 px-3 text-sm tabular-nums text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>
    </section>
  );
};
