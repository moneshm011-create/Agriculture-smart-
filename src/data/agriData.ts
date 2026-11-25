export type CropCategory = 'Grain' | 'Vegetable' | 'Cash Crop' | 'Spice' | 'Fruit';

export interface CropInfo {
  id: string;
  name: string;
  category: CropCategory;
  varieties: string[];
  unit: string;
  basePricePerQuintal: number; // INR per 100 kg
  seasonalSlope: number; // daily drift tendency in sample model
  volatility: number; // amplitude for deterministic seasonal curve
  harvestPeakMonth: string;
  mspReference?: number; // Minimum Support Price reference where applicable
}

export interface MarketInfo {
  id: string;
  name: string;
  shortName: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  demandLevel: 'High' | 'Medium' | 'Moderate';
  arrivalQuintalsPerDay: number;
  handlingFeePerQuintal: number; // Mandi cess, weighing, unloading per quintal
  priceMultiplier: number; // Relative market price index
  baseDistancesKm: Record<string, number>; // Distance from districts
}

export interface StateDistrictMap {
  state: string;
  districts: string[];
}

export interface DistrictWeatherSample {
  district: string;
  state: string;
  temperatureC: number;
  rainfallMm: number;
  humidityPct: number;
  windKmh: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Light Rain' | 'Heavy Showers' | 'Humid';
  forecast5Day: Array<{
    day: string;
    tempC: number;
    rainMm: number;
    humidityPct: number;
    condition: string;
  }>;
  priceImpactNote: string;
  advisoryAction: string;
}

export const CROPS: CropInfo[] = [
  {
    id: 'paddy',
    name: 'Paddy',
    category: 'Grain',
    varieties: ['ADT 43', 'BPT 5204 (Samba Masuri)', 'CR 1009', 'Ponni'],
    unit: 'Quintal',
    basePricePerQuintal: 2320,
    seasonalSlope: 4.5,
    volatility: 45,
    harvestPeakMonth: 'Jan - Feb',
    mspReference: 2300,
  },
  {
    id: 'rice',
    name: 'Rice',
    category: 'Grain',
    varieties: ['Ponni Boiled', 'Seeraga Samba', 'Sona Masoori', 'IR 20'],
    unit: 'Quintal',
    basePricePerQuintal: 4850,
    seasonalSlope: 6.2,
    volatility: 75,
    harvestPeakMonth: 'Feb - Apr',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    category: 'Grain',
    varieties: ['Sharbati', 'HD 2967', 'Lokwan', 'Samba Wheat'],
    unit: 'Quintal',
    basePricePerQuintal: 2680,
    seasonalSlope: 3.1,
    volatility: 50,
    harvestPeakMonth: 'Mar - Apr',
    mspReference: 2275,
  },
  {
    id: 'maize',
    name: 'Maize',
    category: 'Grain',
    varieties: ['NK 6240 Hybrid', 'COH(M) 8', 'DHM 117', 'Sweet Corn'],
    unit: 'Quintal',
    basePricePerQuintal: 2240,
    seasonalSlope: 3.8,
    volatility: 60,
    harvestPeakMonth: 'Dec - Feb',
    mspReference: 2225,
  },
  {
    id: 'tomato',
    name: 'Tomato',
    category: 'Vegetable',
    varieties: ['PKM 1', 'Nadu Tomato', 'Hybrid Shivam', 'Arka Rakshak'],
    unit: 'Quintal',
    basePricePerQuintal: 2850,
    seasonalSlope: 18.5,
    volatility: 260,
    harvestPeakMonth: 'Year-round',
  },
  {
    id: 'onion',
    name: 'Onion',
    category: 'Vegetable',
    varieties: ['Small Shallots (Sambar)', 'Bellary Red', 'CO(On) 5', 'Nashik Red'],
    unit: 'Quintal',
    basePricePerQuintal: 3420,
    seasonalSlope: 14.0,
    volatility: 210,
    harvestPeakMonth: 'Jan - Mar',
  },
  {
    id: 'potato',
    name: 'Potato',
    category: 'Vegetable',
    varieties: ['Kufri Jyoti', 'Kufri Pukhraj', 'Nilgiri Hill Potato'],
    unit: 'Quintal',
    basePricePerQuintal: 2490,
    seasonalSlope: -2.8,
    volatility: 95,
    harvestPeakMonth: 'Feb - May',
  },
  {
    id: 'cotton',
    name: 'Cotton',
    category: 'Cash Crop',
    varieties: ['MCU 5', 'Suraj', 'DCH 32', 'Bt Bunny'],
    unit: 'Quintal',
    basePricePerQuintal: 7280,
    seasonalSlope: 9.5,
    volatility: 140,
    harvestPeakMonth: 'Dec - Mar',
    mspReference: 7121,
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    category: 'Cash Crop',
    varieties: ['CO 86032', 'CO 0238', 'CO 99004'],
    unit: 'Quintal',
    basePricePerQuintal: 365,
    seasonalSlope: 0.9,
    volatility: 12,
    harvestPeakMonth: 'Dec - Apr',
    mspReference: 340,
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    category: 'Cash Crop',
    varieties: ['TMV 7', 'VRI 2', 'CO 7', 'Kadiri 6'],
    unit: 'Quintal',
    basePricePerQuintal: 6650,
    seasonalSlope: 7.4,
    volatility: 125,
    harvestPeakMonth: 'Jan - Mar',
    mspReference: 6783,
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'Fruit',
    varieties: ['Poovan', 'Robusta', 'Nendran', 'Rasthali', 'Yelakki'],
    unit: 'Quintal',
    basePricePerQuintal: 2950,
    seasonalSlope: 8.1,
    volatility: 130,
    harvestPeakMonth: 'Year-round',
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    category: 'Spice',
    varieties: ['Erode Finger', 'Salem Bold', 'BSR 2', 'Alleppey'],
    unit: 'Quintal',
    basePricePerQuintal: 13400,
    seasonalSlope: 22.0,
    volatility: 320,
    harvestPeakMonth: 'Feb - Apr',
  },
  {
    id: 'chilli',
    name: 'Chilli',
    category: 'Spice',
    varieties: ['Ramanathapuram Mundu', 'Guntur Sannam S4', 'K2', 'Teja'],
    unit: 'Quintal',
    basePricePerQuintal: 16200,
    seasonalSlope: -9.5,
    volatility: 410,
    harvestPeakMonth: 'Jan - Apr',
  },
];

export const STATE_DISTRICTS: StateDistrictMap[] = [
  {
    state: 'Tamil Nadu',
    districts: [
      'Thanjavur',
      'Chennai',
      'Coimbatore',
      'Madurai',
      'Salem',
      'Dindigul',
      'Erode',
      'Trichy',
      'Tirunelveli',
    ],
  },
  {
    state: 'Karnataka',
    districts: ['Bengaluru Rural', 'Mysuru', 'Kolar', 'Hubballi-Dharwad'],
  },
  {
    state: 'Andhra Pradesh',
    districts: ['Guntur', 'Chittoor', 'Kurnool', 'Vijayawada'],
  },
  {
    state: 'Maharashtra',
    districts: ['Nashik', 'Pune', 'Nagpur', 'Kolhapur'],
  },
  {
    state: 'Punjab',
    districts: ['Ludhiana', 'Amritsar', 'Patiala', 'Jalandhar'],
  },
];

export const MARKETS: MarketInfo[] = [
  {
    id: 'koyambedu',
    name: 'Koyambedu Market, Chennai',
    shortName: 'Koyambedu (Chennai)',
    state: 'Tamil Nadu',
    district: 'Chennai',
    lat: 13.0694,
    lng: 80.1948,
    demandLevel: 'High',
    arrivalQuintalsPerDay: 4250,
    handlingFeePerQuintal: 85,
    priceMultiplier: 1.09,
    baseDistancesKm: {
      Chennai: 15,
      Thanjavur: 335,
      Coimbatore: 505,
      Madurai: 460,
      Salem: 345,
      Dindigul: 425,
      Erode: 398,
      Trichy: 328,
      Tirunelveli: 620,
      'Bengaluru Rural': 340,
      Guntur: 455,
      Nashik: 1320,
      Ludhiana: 2390,
    },
  },
  {
    id: 'oddanchatram',
    name: 'Oddanchatram Market',
    shortName: 'Oddanchatram',
    state: 'Tamil Nadu',
    district: 'Dindigul',
    lat: 10.4847,
    lng: 77.7525,
    demandLevel: 'High',
    arrivalQuintalsPerDay: 3100,
    handlingFeePerQuintal: 55,
    priceMultiplier: 1.05,
    baseDistancesKm: {
      Chennai: 440,
      Thanjavur: 175,
      Coimbatore: 112,
      Madurai: 88,
      Salem: 172,
      Dindigul: 28,
      Erode: 108,
      Trichy: 122,
      Tirunelveli: 230,
      'Bengaluru Rural': 350,
      Guntur: 785,
      Nashik: 1410,
      Ludhiana: 2560,
    },
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore Agricultural Market',
    shortName: 'Coimbatore',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    lat: 11.0168,
    lng: 76.9558,
    demandLevel: 'High',
    arrivalQuintalsPerDay: 2850,
    handlingFeePerQuintal: 65,
    priceMultiplier: 1.04,
    baseDistancesKm: {
      Chennai: 505,
      Thanjavur: 265,
      Coimbatore: 12,
      Madurai: 210,
      Salem: 162,
      Dindigul: 145,
      Erode: 98,
      Trichy: 212,
      Tirunelveli: 345,
      'Bengaluru Rural': 362,
      Guntur: 840,
      Nashik: 1360,
      Ludhiana: 2510,
    },
  },
  {
    id: 'thanjavur',
    name: 'Thanjavur Agricultural Market',
    shortName: 'Thanjavur',
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    lat: 10.787,
    lng: 79.1378,
    demandLevel: 'Medium',
    arrivalQuintalsPerDay: 2400,
    handlingFeePerQuintal: 45,
    priceMultiplier: 0.98,
    baseDistancesKm: {
      Chennai: 335,
      Thanjavur: 10,
      Coimbatore: 265,
      Madurai: 192,
      Salem: 198,
      Dindigul: 155,
      Erode: 205,
      Trichy: 58,
      Tirunelveli: 330,
      'Bengaluru Rural': 415,
      Guntur: 730,
      Nashik: 1450,
      Ludhiana: 2590,
    },
  },
  {
    id: 'madurai',
    name: 'Madurai Agricultural Market',
    shortName: 'Madurai',
    state: 'Tamil Nadu',
    district: 'Madurai',
    lat: 9.9252,
    lng: 78.1198,
    demandLevel: 'High',
    arrivalQuintalsPerDay: 2950,
    handlingFeePerQuintal: 58,
    priceMultiplier: 1.02,
    baseDistancesKm: {
      Chennai: 460,
      Thanjavur: 192,
      Coimbatore: 210,
      Madurai: 12,
      Salem: 235,
      Dindigul: 64,
      Erode: 195,
      Trichy: 138,
      Tirunelveli: 158,
      'Bengaluru Rural': 435,
      Guntur: 810,
      Nashik: 1490,
      Ludhiana: 2640,
    },
  },
  {
    id: 'salem',
    name: 'Salem Agricultural Market',
    shortName: 'Salem',
    state: 'Tamil Nadu',
    district: 'Salem',
    lat: 11.6643,
    lng: 78.146,
    demandLevel: 'Medium',
    arrivalQuintalsPerDay: 2250,
    handlingFeePerQuintal: 50,
    priceMultiplier: 1.0,
    baseDistancesKm: {
      Chennai: 345,
      Thanjavur: 198,
      Coimbatore: 162,
      Madurai: 235,
      Salem: 10,
      Dindigul: 175,
      Erode: 66,
      Trichy: 142,
      Tirunelveli: 382,
      'Bengaluru Rural': 205,
      Guntur: 720,
      Nashik: 1280,
      Ludhiana: 2430,
    },
  },
  {
    id: 'bengaluru_apmc',
    name: 'Yeshwanthpur APMC, Bengaluru',
    shortName: 'Yeshwanthpur APMC',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    lat: 13.0285,
    lng: 77.5409,
    demandLevel: 'High',
    arrivalQuintalsPerDay: 3900,
    handlingFeePerQuintal: 75,
    priceMultiplier: 1.07,
    baseDistancesKm: {
      'Bengaluru Rural': 22,
      Mysuru: 148,
      Kolar: 72,
      'Hubballi-Dharwad': 410,
      Chennai: 345,
      Coimbatore: 362,
      Salem: 205,
      Thanjavur: 415,
    },
  },
  {
    id: 'guntur_yard',
    name: 'Guntur Mirchi & Agri Yard',
    shortName: 'Guntur Market Yard',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    lat: 16.3067,
    lng: 80.4365,
    demandLevel: 'High',
    arrivalQuintalsPerDay: 3400,
    handlingFeePerQuintal: 68,
    priceMultiplier: 1.06,
    baseDistancesKm: {
      Guntur: 14,
      Chittoor: 395,
      Kurnool: 340,
      Vijayawada: 36,
      Chennai: 455,
      Thanjavur: 730,
    },
  },
];

export const WEATHER_SAMPLES: DistrictWeatherSample[] = [
  {
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    temperatureC: 31,
    rainfallMm: 12.4,
    humidityPct: 76,
    windKmh: 14,
    condition: 'Partly Cloudy',
    forecast5Day: [
      { day: 'Thu', tempC: 31, rainMm: 12.4, humidityPct: 76, condition: 'Partly Cloudy' },
      { day: 'Fri', tempC: 30, rainMm: 18.0, humidityPct: 81, condition: 'Light Rain' },
      { day: 'Sat', tempC: 29, rainMm: 26.5, humidityPct: 85, condition: 'Light Rain' },
      { day: 'Sun', tempC: 31, rainMm: 6.0, humidityPct: 74, condition: 'Partly Cloudy' },
      { day: 'Mon', tempC: 32, rainMm: 2.0, humidityPct: 70, condition: 'Sunny' },
    ],
    priceImpactNote:
      'Moderate coastal showers expected over the weekend may slow paddy drying and tighten short-term mandi arrivals by 8-12%, giving slight upward support to grain and vegetable prices.',
    advisoryAction:
      'Harvest mature paddy before Saturday showers or use tarpaulin-covered storage; consider holding dry stocks 4-5 days.',
  },
  {
    district: 'Chennai',
    state: 'Tamil Nadu',
    temperatureC: 33,
    rainfallMm: 8.2,
    humidityPct: 78,
    windKmh: 18,
    condition: 'Humid',
    forecast5Day: [
      { day: 'Thu', tempC: 33, rainMm: 8.2, humidityPct: 78, condition: 'Humid' },
      { day: 'Fri', tempC: 32, rainMm: 14.5, humidityPct: 82, condition: 'Light Rain' },
      { day: 'Sat', tempC: 31, rainMm: 22.0, humidityPct: 84, condition: 'Light Rain' },
      { day: 'Sun', tempC: 32, rainMm: 5.0, humidityPct: 75, condition: 'Partly Cloudy' },
      { day: 'Mon', tempC: 33, rainMm: 1.5, humidityPct: 72, condition: 'Sunny' },
    ],
    priceImpactNote:
      'High coastal humidity accelerates perishability for Tomato and Banana shipments arriving at Koyambedu, creating a price premium for Grade-A cooled produce.',
    advisoryAction:
      'Dispatch perishable vegetables in early-morning slots to avoid midday heat spoilage deductions.',
  },
  {
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    temperatureC: 28,
    rainfallMm: 4.5,
    humidityPct: 64,
    windKmh: 16,
    condition: 'Sunny',
    forecast5Day: [
      { day: 'Thu', tempC: 28, rainMm: 4.5, humidityPct: 64, condition: 'Sunny' },
      { day: 'Fri', tempC: 29, rainMm: 2.0, humidityPct: 62, condition: 'Sunny' },
      { day: 'Sat', tempC: 27, rainMm: 9.0, humidityPct: 69, condition: 'Partly Cloudy' },
      { day: 'Sun', tempC: 28, rainMm: 3.5, humidityPct: 65, condition: 'Sunny' },
      { day: 'Mon', tempC: 29, rainMm: 1.0, humidityPct: 60, condition: 'Sunny' },
    ],
    priceImpactNote:
      'Dry Western Ghats breeze keeps transport corridors clear and supports smooth arrivals of Coconut, Banana, and Turmeric into Coimbatore and Oddanchatram.',
    advisoryAction:
      'Favorable sun-drying conditions for Turmeric and Maize; steady mandi arrivals indicate stable to mildly firm pricing.',
  },
  {
    district: 'Madurai',
    state: 'Tamil Nadu',
    temperatureC: 34,
    rainfallMm: 2.1,
    humidityPct: 58,
    windKmh: 12,
    condition: 'Sunny',
    forecast5Day: [
      { day: 'Thu', tempC: 34, rainMm: 2.1, humidityPct: 58, condition: 'Sunny' },
      { day: 'Fri', tempC: 35, rainMm: 0.0, humidityPct: 55, condition: 'Sunny' },
      { day: 'Sat', tempC: 34, rainMm: 4.0, humidityPct: 61, condition: 'Partly Cloudy' },
      { day: 'Sun', tempC: 33, rainMm: 6.5, humidityPct: 64, condition: 'Partly Cloudy' },
      { day: 'Mon', tempC: 34, rainMm: 1.0, humidityPct: 57, condition: 'Sunny' },
    ],
    priceImpactNote:
      'Warm dry weather benefits Chilli and Cotton quality retention, reducing moisture discounting at Madurai and southern yards.',
    advisoryAction:
      'Ideal window for grading and transporting dry Chilli and Cotton bales with minimal moisture penalty.',
  },
  {
    district: 'Dindigul',
    state: 'Tamil Nadu',
    temperatureC: 29,
    rainfallMm: 16.0,
    humidityPct: 72,
    windKmh: 13,
    condition: 'Light Rain',
    forecast5Day: [
      { day: 'Thu', tempC: 29, rainMm: 16.0, humidityPct: 72, condition: 'Light Rain' },
      { day: 'Fri', tempC: 28, rainMm: 24.0, humidityPct: 79, condition: 'Heavy Showers' },
      { day: 'Sat', tempC: 28, rainMm: 14.0, humidityPct: 76, condition: 'Light Rain' },
      { day: 'Sun', tempC: 30, rainMm: 4.0, humidityPct: 68, condition: 'Partly Cloudy' },
      { day: 'Mon', tempC: 31, rainMm: 1.5, humidityPct: 65, condition: 'Sunny' },
    ],
    priceImpactNote:
      'Passing rain bands near Oddanchatram vegetable belt typically constrain Tomato and Onion field harvesting, pushing wholesale bids up 5-9% over 4-6 days.',
    advisoryAction:
      'Pack Onions in ventilated mesh bags to prevent moisture rot; Oddanchatram buyers are bidding stronger for dry bulbs.',
  },
  {
    district: 'Salem',
    state: 'Tamil Nadu',
    temperatureC: 31,
    rainfallMm: 5.8,
    humidityPct: 66,
    windKmh: 11,
    condition: 'Partly Cloudy',
    forecast5Day: [
      { day: 'Thu', tempC: 31, rainMm: 5.8, humidityPct: 66, condition: 'Partly Cloudy' },
      { day: 'Fri', tempC: 32, rainMm: 3.0, humidityPct: 63, condition: 'Sunny' },
      { day: 'Sat', tempC: 31, rainMm: 7.5, humidityPct: 68, condition: 'Partly Cloudy' },
      { day: 'Sun', tempC: 30, rainMm: 10.0, humidityPct: 71, condition: 'Light Rain' },
      { day: 'Mon', tempC: 31, rainMm: 2.5, humidityPct: 64, condition: 'Sunny' },
    ],
    priceImpactNote:
      'Balanced weather around Salem and Erode supports steady Turmeric and Tapioca/Maize trading with normal logistics flow.',
    advisoryAction:
      'Compare Salem local yard against Oddanchatram or Erode depending on load size above 20 quintals.',
  },
];

export const INITIAL_SAMPLE_ALERTS = [
  {
    id: 'alert-1',
    crop: 'Tomato',
    market: 'Koyambedu Market, Chennai',
    targetPrice: 3100,
    condition: 'above' as const,
    createdAt: '2026-11-24T09:30:00Z',
  },
  {
    id: 'alert-2',
    crop: 'Onion',
    market: 'Oddanchatram Market',
    targetPrice: 3550,
    condition: 'above' as const,
    createdAt: '2026-11-24T11:15:00Z',
  },
  {
    id: 'alert-3',
    crop: 'Paddy',
    market: 'Thanjavur Agricultural Market',
    targetPrice: 2350,
    condition: 'above' as const,
    createdAt: '2026-11-24T14:00:00Z',
  },
];
