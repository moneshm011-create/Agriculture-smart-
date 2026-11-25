import React from 'react';
import { MapPin, Navigation, X, ExternalLink } from 'lucide-react';
import type { MarketRecommendationRow } from '../utils/calculations';

interface MarketMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMarket: MarketRecommendationRow | null;
  allMarkets: MarketRecommendationRow[];
  farmerDistrict: string;
}

// Map lat/lng bounds covering Tamil Nadu + neighboring South India hubs
const MIN_LAT = 8.2;
const MAX_LAT = 16.8;
const MIN_LNG = 76.2;
const MAX_LNG = 81.2;

function projectPoint(lat: number, lng: number) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 460 + 30;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 340 + 20;
  return { x, y };
}

export const MarketMapModal: React.FC<MarketMapModalProps> = ({
  isOpen,
  onClose,
  selectedMarket,
  allMarkets,
  farmerDistrict,
}) => {
  if (!isOpen || !selectedMarket) return null;

  const osmLink = `https://www.openstreetmap.org/?mlat=${selectedMarket.lat}&mlon=${selectedMarket.lng}#map=12/${selectedMarket.lat}/${selectedMarket.lng}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="market-map-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 id="market-map-title" className="text-lg font-semibold text-slate-900">
              {selectedMarket.marketName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {selectedMarket.district}, {selectedMarket.state} · {selectedMarket.lat.toFixed(4)}°N,{' '}
              {selectedMarket.lng.toFixed(4)}°E · {selectedMarket.distanceKm} km from {farmerDistrict}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close market map"
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-5">
          <div className="md:col-span-3 bg-sky-50/70 border border-slate-200 rounded-xl p-3">
            <svg
              viewBox="0 0 520 380"
              className="w-full h-72 rounded-lg bg-gradient-to-b from-sky-50 to-emerald-50"
              role="img"
              aria-label="Regional Agricultural Markets Coordinate Map"
            >
              {/* Subtle latitude/longitude grid */}
              {[80, 150, 220, 290].map((y) => (
                <line key={y} x1="20" y1={y} x2="500" y2={y} stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="0.8" />
              ))}
              {[100, 200, 300, 400].map((x) => (
                <line key={x} x1={x} y1="20" x2={x} y2="360" stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="0.8" />
              ))}

              {/* Simplified Tamil Nadu / South India coastline silhouette */}
              <path
                d="M 110 350 L 90 295 L 70 230 L 95 160 L 145 110 L 230 80 L 340 45 L 430 65 L 405 145 L 365 205 L 330 275 L 250 340 L 155 360 Z"
                fill="#ecfdf5"
                stroke="#6ee7b7"
                strokeWidth="2"
              />

              {/* Plot all markets */}
              {allMarkets.map((m) => {
                const pos = projectPoint(m.lat, m.lng);
                const isSelected = m.marketId === selectedMarket.marketId;
                return (
                  <g key={m.marketId}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 11 : 6}
                      fill={isSelected ? '#16a34a' : m.isBestMarket ? '#eab308' : '#0284c7'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x + (m.marketId === 'thanjavur' ? -8 : 11)}
                      y={pos.y + (m.marketId === 'thanjavur' ? 16 : 4)}
                      fontSize={isSelected ? '11' : '10'}
                      fontWeight={isSelected ? '700' : '600'}
                      fill="#0f172a"
                      stroke="#ffffff"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {m.shortName}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1 text-xs text-slate-600">
              <span>Selected: {selectedMarket.shortName}</span>
              <span>Best Net Profit: {allMarkets.find((m) => m.isBestMarket)?.shortName}</span>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Market Economics</span>
                </div>
                <dl className="grid grid-cols-2 gap-y-2 text-xs">
                  <dt className="text-slate-500">Modal Price</dt>
                  <dd className="text-right font-mono font-semibold text-slate-900 tabular-nums">
                    ₹{selectedMarket.cropPricePerQuintal.toLocaleString('en-IN')}/qtl
                  </dd>
                  <dt className="text-slate-500">Transport Cost</dt>
                  <dd className="text-right font-mono text-orange-700 tabular-nums">
                    ₹{selectedMarket.transportCost.toLocaleString('en-IN')}
                  </dd>
                  <dt className="text-slate-500">Mandi Expenses</dt>
                  <dd className="text-right font-mono text-slate-700 tabular-nums">
                    ₹{selectedMarket.otherExpenses.toLocaleString('en-IN')}
                  </dd>
                  <dt className="text-slate-500 font-medium">Estimated Net Profit</dt>
                  <dd className="text-right font-mono font-bold text-emerald-700 tabular-nums">
                    ₹{selectedMarket.netProfit.toLocaleString('en-IN')}
                  </dd>
                </dl>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Navigation className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Daily Arrivals & Demand</span>
                </div>
                <p className="text-xs text-slate-600 tabular-nums">
                  {selectedMarket.arrivalQuintalsPerDay.toLocaleString('en-IN')} quintals/day · {selectedMarket.demandLevel} buyer demand
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={osmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Open Coordinates in OpenStreetMap</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 px-4 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
