import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CloudRain, Droplets, Thermometer, Wind, Info, Sprout } from 'lucide-react';
import { WEATHER_SAMPLES } from '../data/agriData';
import type { TranslationStrings } from '../i18n/translations';

interface WeatherData {
  district: string;
  state: string;
  temperatureC: number;
  rainfallMm: number;
  humidityPct: number;
  windKmh: number;
  condition: string;
  forecast5Day: Array<{
    day: string;
    tempC: number;
    rainMm: number;
    humidityPct: number;
    condition: string;
  }>;
  priceImpactNote: string;
  advisoryAction: string;
  isSampleData: boolean;
  notice: string;
}

interface WeatherViewProps {
  selectedDistrict: string;
  weather: WeatherData;
  onDistrictChange: (district: string) => void;
  t: TranslationStrings;
}

export const WeatherView: React.FC<WeatherViewProps> = ({
  selectedDistrict,
  weather,
  onDistrictChange,
  t,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.nav.weather}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Regional rainfall, temperature, and humidity signals with expected impact on crop arrivals and prices
          </p>
        </div>

        <div className="w-full sm:w-56">
          <label htmlFor="weather-district-select" className="block text-xs font-medium text-slate-600 mb-1">
            {t.labels.district}
          </label>
          <select
            id="weather-district-select"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full h-10 px-3 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {WEATHER_SAMPLES.map((w) => (
              <option key={w.district} value={w.district}>
                {w.district}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clearly Marked Demonstration Weather Notice */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50/70 to-orange-50/50 border border-amber-200 text-amber-950 text-xs sm:text-sm">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>{weather.notice}</span>
      </div>

      {/* 4 Weather Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group animate-card-enter [animation-delay:0ms] relative overflow-hidden bg-gradient-to-br from-orange-50/90 via-white to-white border border-orange-200 rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:border-orange-300 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-900">Temperature</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white inline-flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
              <Thermometer className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-slate-900 tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.03]">
            {weather.temperatureC}°C
          </p>
          <p className="mt-1 text-xs text-slate-600">{weather.condition} in {weather.district}</p>
        </div>

        <div className="group animate-card-enter [animation-delay:55ms] relative overflow-hidden bg-gradient-to-br from-sky-50/90 via-white to-white border border-sky-200 rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:border-sky-300 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-900">24h Rainfall</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white inline-flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
              <CloudRain className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-slate-900 tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.03]">
            {weather.rainfallMm} mm
          </p>
          <p className="mt-1 text-xs text-slate-600">Precipitation intensity</p>
        </div>

        <div className="group animate-card-enter [animation-delay:110ms] relative overflow-hidden bg-gradient-to-br from-emerald-50/90 via-white to-white border border-emerald-200 rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:border-emerald-300 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">Relative Humidity</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white inline-flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
              <Droplets className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-slate-900 tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.03]">
            {weather.humidityPct}%
          </p>
          <p className="mt-1 text-xs text-slate-600">Affects grain drying & storage</p>
        </div>

        <div className="group animate-card-enter [animation-delay:165ms] relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-white to-white border border-amber-200 rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-lg hover:border-amber-300 active:scale-[0.99] transition-all duration-200">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 opacity-85 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">Wind Speed</span>
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white inline-flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
              <Wind className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-slate-900 tabular-nums transition-transform duration-200 origin-left group-hover:scale-[1.03]">
            {weather.windKmh} km/h
          </p>
          <p className="mt-1 text-xs text-slate-600">Surface breeze speed</p>
        </div>
      </div>

      {/* 5-Day Forecast Chart + Crop Price Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-sky-200/80 rounded-2xl p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">5-Day Rainfall & Temperature Outlook</h2>
          <p className="text-xs text-slate-500 mb-4">{weather.district}, {weather.state}</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weather.forecast5Day} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="rainMm" name="Rainfall (mm)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tempC" name="Temp (°C)" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-100">
            {weather.forecast5Day.map((d) => (
              <div key={d.day} className="text-center p-2.5 rounded-xl bg-gradient-to-b from-sky-50/80 to-white border border-sky-100">
                <p className="text-xs font-bold text-slate-800">{d.day}</p>
                <p className="text-xs font-mono font-semibold text-orange-700 mt-1 tabular-nums">{d.tempC}°C</p>
                <p className="text-[11px] font-medium text-sky-700 tabular-nums">{d.rainMm}mm</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 inline-flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">Possible Effect on Crop Prices</h2>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50/60 border border-sky-200">
              <p className="text-xs font-bold text-sky-900 mb-1">Market Supply Impact</p>
              <p className="text-sm text-slate-800 leading-relaxed">{weather.priceImpactNote}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200">
              <p className="text-xs font-bold text-emerald-900 mb-1">Recommended Farmer Action</p>
              <p className="text-sm text-slate-800 leading-relaxed">{weather.advisoryAction}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
