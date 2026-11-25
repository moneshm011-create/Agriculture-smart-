import React, { useState } from 'react';
import { Code2, Database, Cpu, Layers } from 'lucide-react';
import type { TranslationStrings } from '../i18n/translations';

interface AboutProjectViewProps {
  t: TranslationStrings;
}

const MODULE_SNIPPETS: Record<string, { title: string; path: string; runCmd: string; code: string }> = {
  python: {
    title: 'Python ML Forecasting Service (FastAPI + Scikit-learn + XGBoost)',
    path: 'ml-service/app.py · train_model.py · forecast.py',
    runCmd: 'cd ml-service && pip install -r requirements.txt && python train_model.py && uvicorn app:app --port 8000',
    code: `@app.post("/api/forecast")
def forecast_endpoint(req: ForecastRequest):
    return predict_crop_prices(crop=req.crop, market=req.market, days=req.days)`,
  },
  nodejs: {
    title: 'Node.js & Express REST API Backend',
    path: 'server.ts · backend/server.js · backend/routes.js',
    runCmd: 'npm install && npm run dev',
    code: `app.post('/api/market-advisor', (req, res) => {
  const result = evaluateMarketsForFarmer(req.body);
  res.json(result);
});`,
  },
  java: {
    title: 'Java Crop Price Trend Analyzer',
    path: 'modules/java/CropPriceAnalyzer.java',
    runCmd: 'javac modules/java/CropPriceAnalyzer.java && java -cp modules/java CropPriceAnalyzer',
    code: `TrendReport report = CropPriceAnalyzer.analyzePrices("Tomato", samplePrices);
System.out.printf("Trend: %s (%+.2f INR/day)%n", report.trendLabel, report.dailySlope);`,
  },
  c: {
    title: 'C Crop Profit Calculation Module',
    path: 'modules/c/crop_profit.c',
    runCmd: 'gcc modules/c/crop_profit.c -o crop_profit && ./crop_profit',
    code: `result.gross_revenue = price_per_quintal * quantity_quintals;
result.transport_cost = distance_km * transport_rate_per_km;
result.net_profit = result.gross_revenue - result.transport_cost - other_expenses;`,
  },
  cpp: {
    title: 'C++ Best Market Optimizer',
    path: 'modules/cpp/market_optimizer.cpp',
    runCmd: 'g++ -std=c++17 modules/cpp/market_optimizer.cpp -o market_optimizer && ./market_optimizer',
    code: `std::sort(markets.begin(), markets.end(), [](const MarketOption& a, const MarketOption& b) {
  return a.netProfit > b.netProfit;
});`,
  },
  sql: {
    title: 'MySQL & MongoDB Database Schema + Sample CSV',
    path: 'database/schema.sql · database/mongodb_collections.js · data/sample_crop_prices.csv',
    runCmd: 'mysql -u root -p < database/schema.sql',
    code: `CREATE TABLE crop_prices (
  price_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  crop_id INT NOT NULL,
  market_id INT NOT NULL,
  price_date DATE NOT NULL,
  modal_price DECIMAL(10, 2) NOT NULL
);`,
  },
};

export const AboutProjectView: React.FC<AboutProjectViewProps> = ({ t }) => {
  const [activeTab, setActiveTab] = useState<string>('python');
  const [produceImgErr, setProduceImgErr] = useState(false);
  const [farmerImgErr, setFarmerImgErr] = useState(false);

  const currentModule = MODULE_SNIPPETS[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.nav.about}</h1>
        <p className="text-sm text-slate-600 mt-1">
          Full-stack architecture, multi-language analytical modules, database schemas, and REST API documentation
        </p>
      </div>

      {/* Editorial Showcase Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-emerald-200/80 rounded-2xl p-6 shadow-xs items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              Built for Indian Farmers & Agricultural Markets
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Smart Crop Price Forecasting and Best-Market Advisor helps farmers evaluate not just where the highest mandi bid is, but which market leaves the highest net profit in hand after accounting for truck distance, fuel/transport costs, and mandi handling charges.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200">
                <Cpu className="w-4 h-4 text-emerald-700 mb-1.5" />
                <p className="text-xs font-bold text-slate-900">ML Forecasting</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Python Random Forest & XGBoost time-series</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50/70 border border-sky-200">
                <Layers className="w-4 h-4 text-sky-700 mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Full-Stack Web</p>
                <p className="text-[11px] text-slate-600 mt-0.5">React, Tailwind CSS, Recharts & Express.js</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200">
                <Database className="w-4 h-4 text-orange-700 mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Multi-Language Core</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Java, C, C++, MySQL & MongoDB modules</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            {!farmerImgErr ? (
              <img
                src="/src/assets/images/farmer_advisor_portrait_1795597328457.jpg"
                alt="South Indian farmer holding fresh produce basket"
                referrerPolicy="no-referrer"
                onError={() => setFarmerImgErr(true)}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-100 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900">Farmer-First Net Profit Methodology</p>
              <p className="text-xs text-slate-500">
                Initially calibrated for Tamil Nadu markets with multi-state expansion across India
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[220px]">
          {!produceImgErr ? (
            <img
              src="/src/assets/images/crop_produce_harvest_1795597328032.jpg"
              alt="Fresh Tamil Nadu crops including tomatoes, onions, paddy, turmeric, and green chillies"
              referrerPolicy="no-referrer"
              onError={() => setProduceImgErr(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-500 p-6">
              Tamil Nadu Agricultural Harvest Showcase
            </div>
          )}
        </div>
      </section>

      {/* Multi-Language Module Explorer */}
      <section className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Supporting Programming Language Modules</h2>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-emerald-50/80 border border-emerald-200/70 p-1 rounded-xl">
            {[
              { id: 'python', label: 'Python ML' },
              { id: 'nodejs', label: 'Node.js' },
              { id: 'java', label: 'Java' },
              { id: 'c', label: 'C' },
              { id: 'cpp', label: 'C++' },
              { id: 'sql', label: 'SQL / CSV' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:text-emerald-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-900/20 bg-slate-950 text-slate-100 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-emerald-400">{currentModule.title}</span>
            <span className="font-mono text-slate-400">{currentModule.path}</span>
          </div>
          <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            <code>{currentModule.code}</code>
          </pre>
          <div className="pt-2 border-t border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto">
            Run: {currentModule.runCmd}
          </div>
        </div>
      </section>

      {/* API Endpoints Reference */}
      <section className="bg-white border border-emerald-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50/70 via-sky-50/50 to-amber-50/50 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Backend REST API Endpoints</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Endpoint</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['GET', '/api/crops', 'Fetch all 13 supported crops, varieties, states, and districts'],
                ['GET', '/api/markets', 'Fetch agricultural market locations, coordinates, and daily arrivals'],
                ['GET', '/api/prices', 'Fetch current prices, average rate, and 7-day outlook'],
                ['POST', '/api/forecast', 'Generate 7-day or 30-day crop price forecast with trend & confidence'],
                ['POST', '/api/market-advisor', 'Rank markets by Net Profit = (Price × Qty) − Transport − Expenses'],
                ['GET', '/api/weather', 'Retrieve district weather data and agricultural price impact insights'],
                ['POST', '/api/farmer-input', 'Validate farmer harvest details and compute personalized recommendation'],
                ['GET / POST', '/api/alerts', 'Manage target price alerts and evaluate against 7-day predictions'],
              ].map(([method, path, desc]) => (
                <tr key={path} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-emerald-700 whitespace-nowrap">
                    {method}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-900 whitespace-nowrap">{path}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
