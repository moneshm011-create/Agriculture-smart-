import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Store,
  BarChart3,
  CloudSun,
  ClipboardList,
  Bell,
  BookOpen,
  Menu,
  X,
  Sprout,
  Globe,
} from 'lucide-react';
import { TRANSLATIONS, type LanguageCode } from './i18n/translations';
import { CropSelectorBar, type GlobalSelection } from './components/CropSelectorBar';
import { DashboardView } from './components/DashboardView';
import { ForecastView } from './components/ForecastView';
import { MarketAdvisorView } from './components/MarketAdvisorView';
import { MarketComparisonView } from './components/MarketComparisonView';
import { WeatherView } from './components/WeatherView';
import { FarmerInputView } from './components/FarmerInputView';
import { AlertsView, type EvaluatedAlert } from './components/AlertsView';
import { AboutProjectView } from './components/AboutProjectView';
import {
  evaluateMarketsForFarmer,
  forecastCropPrices,
  getWeatherForDistrict,
  type ForecastResult,
  type MarketAdvisorResult,
} from './utils/calculations';
import { CROPS, MARKETS } from './data/agriData';

type PageId =
  | 'dashboard'
  | 'forecast'
  | 'advisor'
  | 'comparison'
  | 'weather'
  | 'farmerInput'
  | 'alerts'
  | 'about';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>('en');

  const [selection, setSelection] = useState<GlobalSelection>({
    crop: 'Tomato',
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    variety: 'PKM 1',
    quantity: 20,
    sellingDate: '2026-11-30',
  });

  const [forecastMarket, setForecastMarket] = useState<string>(MARKETS[0].name);
  const [forecastDays, setForecastDays] = useState<7 | 30>(7);
  const [transportRatePerKm, setTransportRatePerKm] = useState<number>(18);

  // Initialize synchronously from deterministic engine for instant first paint, then hydrate via API
  const [forecastData, setForecastData] = useState<ForecastResult>(() =>
    forecastCropPrices('Tomato', MARKETS[0].name, 7)
  );
  const [advisorData, setAdvisorData] = useState<MarketAdvisorResult>(() =>
    evaluateMarketsForFarmer({ crop: 'Tomato', state: 'Tamil Nadu', district: 'Thanjavur', quantity: 20 })
  );
  const [priceSummary, setPriceSummary] = useState(() => ({
    totalCropsTracked: CROPS.length,
    averageCurrentPrice: 2890,
    predicted7DayPrice: 3150,
    changePct: 4.2,
    trend: 'Increasing' as 'Increasing' | 'Decreasing' | 'Stable',
  }));
  const [weatherData, setWeatherData] = useState(() => getWeatherForDistrict('Thanjavur'));
  const [alerts, setAlerts] = useState<EvaluatedAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const t = TRANSLATIONS[language];

  const loadDashboardAndAdvisor = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const [pricesRes, advisorRes] = await Promise.all([
        fetch(
          `/api/prices?crop=${encodeURIComponent(selection.crop)}&state=${encodeURIComponent(
            selection.state
          )}&district=${encodeURIComponent(selection.district)}`
        ),
        fetch('/api/market-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crop: selection.crop,
            state: selection.state,
            district: selection.district,
            quantity: selection.quantity,
            transportRatePerKm,
          }),
        }),
      ]);

      if (pricesRes.ok) {
        const pData = await pricesRes.json();
        setPriceSummary({
          totalCropsTracked: pData.totalCropsTracked,
          averageCurrentPrice: pData.averageCurrentPrice,
          predicted7DayPrice: pData.predicted7DayPrice,
          changePct: pData.changePct,
          trend: pData.trend,
        });
      }
      if (advisorRes.ok) {
        const aData = await advisorRes.json();
        setAdvisorData(aData);
      }
    } catch {
      setApiError('Unable to reach backend API; showing cached local agricultural baseline.');
    } finally {
      setLoading(false);
    }
  }, [selection.crop, selection.state, selection.district, selection.quantity, transportRatePerKm]);

  const loadForecast = useCallback(async () => {
    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: selection.crop,
          market: forecastMarket,
          days: forecastDays,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setForecastData(data);
      }
    } catch {
      setForecastData(forecastCropPrices(selection.crop, forecastMarket, forecastDays));
    }
  }, [selection.crop, forecastMarket, forecastDays]);

  const loadWeather = useCallback(async () => {
    try {
      const res = await fetch(`/api/weather?district=${encodeURIComponent(selection.district)}`);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
      }
    } catch {
      setWeatherData(getWeatherForDistrict(selection.district));
    }
  }, [selection.district]);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch {
      // ignore initial offline error
    }
  }, []);

  useEffect(() => {
    loadDashboardAndAdvisor();
  }, [loadDashboardAndAdvisor]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleCreateAlert = async (payload: {
    crop: string;
    market: string;
    targetPrice: number;
    condition: 'above' | 'below';
  }) => {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Failed to create alert');
    }
    await loadAlerts();
  };

  const handleDeleteAlert = async (id: string) => {
    await fetch(`/api/alerts/${encodeURIComponent(id)}`, { method: 'DELETE' });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const navItems: Array<{ id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'forecast', label: t.nav.forecast, icon: TrendingUp },
    { id: 'advisor', label: t.nav.advisor, icon: Store },
    { id: 'comparison', label: t.nav.comparison, icon: BarChart3 },
    { id: 'weather', label: t.nav.weather, icon: CloudSun },
    { id: 'farmerInput', label: t.nav.farmerInput, icon: ClipboardList },
    { id: 'alerts', label: t.nav.alerts, icon: Bell },
    { id: 'about', label: t.nav.about, icon: BookOpen },
  ];

  const triggeredAlertCount = alerts.filter((a) => a.triggered).length;

  const handleNavigate = (page: string) => {
    setActivePage(page as PageId);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-emerald-50 border-r border-emerald-800/70 z-30 shadow-lg">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-emerald-800/70">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-emerald-950 inline-flex items-center justify-center shrink-0 shadow-sm">
            <Sprout className="w-5 h-5" />
          </span>
          <span className="font-display font-bold text-base text-white tracking-tight truncate">
            {t.appName}
          </span>
        </div>

        <nav aria-label="Primary Navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full h-10 px-3 flex items-center justify-between gap-2.5 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/20 text-white font-semibold ring-1 ring-amber-400/45 shadow-xs'
                    : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-emerald-300/80'}`} />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'alerts' && triggeredAlertCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-emerald-950 text-[11px] font-mono font-bold tabular-nums">
                    {triggeredAlertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="m-3 p-3.5 rounded-xl bg-emerald-900/70 border border-emerald-700/60 text-xs text-emerald-100/80">
          <p className="font-semibold text-amber-300">Tamil Nadu Mandi Focus</p>
          <p className="mt-0.5 text-emerald-100/75">Expandable across Indian states</p>
        </div>
      </aside>

      {/* Mobile Slide-Over Navigation */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[80vw] bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-emerald-50 h-full border-r border-emerald-800 flex flex-col z-10">
            <div className="h-14 px-4 flex items-center justify-between border-b border-emerald-800/70">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-emerald-950 inline-flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </span>
                <span className="font-display font-bold text-sm text-white">{t.appName}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-emerald-200 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav aria-label="Mobile Navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full h-11 px-3 flex items-center justify-between rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold ring-1 ring-amber-400/40'
                        : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`} />
                      <span>{item.label}</span>
                    </span>
                    {item.id === 'alerts' && triggeredAlertCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-emerald-950 text-xs font-mono font-bold">
                        {triggeredAlertCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-2xs">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-amber-400 via-sky-500 to-orange-500" />
          <div className="h-14 lg:h-15 px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg text-emerald-800 hover:bg-emerald-50 shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {navItems.find((n) => n.id === activePage)?.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-600 hidden sm:block shrink-0" />
                <label htmlFor="language-selector" className="sr-only">
                  {t.labels.language}
                </label>
                <select
                  id="language-selector"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  className="h-9 px-2.5 text-xs font-semibold text-slate-800 bg-sky-50/80 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ்</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleNavigate('alerts')}
                aria-label={`View price alerts (${triggeredAlertCount} triggered)`}
                className={`h-9 px-3 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  triggeredAlertCount > 0
                    ? 'text-orange-900 bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 border-orange-300'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${triggeredAlertCount > 0 ? 'text-orange-600' : 'text-emerald-600'}`} />
                <span className="tabular-nums">{triggeredAlertCount} Alerts</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {apiError && (
            <div className="px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              {apiError}
            </div>
          )}

          {/* Global Crop & Market Selection on Dashboard and Advisor */}
          {(activePage === 'dashboard' || activePage === 'advisor') && (
            <CropSelectorBar selection={selection} onChange={setSelection} t={t} />
          )}

          {activePage === 'dashboard' && (
            <DashboardView
              selection={selection}
              priceSummary={priceSummary}
              forecast={forecastData}
              advisor={advisorData}
              loading={loading}
              t={t}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'forecast' && (
            <ForecastView
              selectedCrop={selection.crop}
              selectedMarket={forecastMarket}
              forecastDays={forecastDays}
              forecast={forecastData}
              loading={loading}
              onCropChange={(crop) => {
                const matched = CROPS.find((c) => c.name === crop) || CROPS[0];
                setSelection((prev) => ({ ...prev, crop: matched.name, variety: matched.varieties[0] }));
              }}
              onMarketChange={setForecastMarket}
              onDaysChange={setForecastDays}
              t={t}
            />
          )}

          {activePage === 'advisor' && (
            <MarketAdvisorView
              selection={selection}
              advisor={advisorData}
              transportRatePerKm={transportRatePerKm}
              onTransportRateChange={setTransportRatePerKm}
              onQuantityChange={(qty) => setSelection((prev) => ({ ...prev, quantity: qty }))}
              t={t}
            />
          )}

          {activePage === 'comparison' && (
            <MarketComparisonView
              selection={selection}
              advisor={advisorData}
              forecast={forecastData}
              onCropChange={(crop) => {
                const matched = CROPS.find((c) => c.name === crop) || CROPS[0];
                setSelection((prev) => ({ ...prev, crop: matched.name, variety: matched.varieties[0] }));
              }}
              t={t}
            />
          )}

          {activePage === 'weather' && (
            <WeatherView
              selectedDistrict={selection.district}
              weather={weatherData}
              onDistrictChange={(district) => setSelection((prev) => ({ ...prev, district }))}
              t={t}
            />
          )}

          {activePage === 'farmerInput' && (
            <FarmerInputView
              defaultCrop={selection.crop}
              defaultDistrict={selection.district}
              defaultQuantity={selection.quantity}
              defaultDate={selection.sellingDate}
              t={t}
            />
          )}

          {activePage === 'alerts' && (
            <AlertsView
              alerts={alerts}
              defaultCrop={selection.crop}
              onCreateAlert={handleCreateAlert}
              onDeleteAlert={handleDeleteAlert}
              t={t}
            />
          )}

          {activePage === 'about' && <AboutProjectView t={t} />}
        </main>
      </div>
    </div>
  );
}
