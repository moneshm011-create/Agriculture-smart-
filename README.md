# Smart Crop Price Forecasting and Best-Market Advisor for Farmers

An AI-powered agricultural analytics and market decision platform designed to help Indian farmers (starting with Tamil Nadu agricultural markets and expandable across India) predict crop prices, compare mandi net profits, monitor weather risks, and set target-price selling alerts.

## Key Features

- **Dashboard Overview**: KPI cards for Total Crops Tracked, Average Price, 7-Day Predicted Price, Best Market Recommendation, Expected Profit per Quintal, and Market Price Change %.
- **Crop Selection & Multi-State Support**: 13 crops (`Paddy`, `Rice`, `Wheat`, `Maize`, `Tomato`, `Onion`, `Potato`, `Cotton`, `Sugarcane`, `Groundnut`, `Banana`, `Turmeric`, `Chilli`), varieties, quantities, and Indian states/districts.
- **AI Crop Price Forecasting**: 30-day historical trend + 7-day & 30-day price forecasts with confidence intervals, min/max/avg prices, and trend indicators (`Increasing`, `Decreasing`, `Stable`).
- **Best Market Advisor & Map**: Evaluates markets using `Net Profit = (Crop Price × Quantity) − Transportation Cost − Other Expenses` and recommends the highest net-profit market (with interactive Map view).
- **Market Comparison Charts**: Bar charts, line charts, and cost/profit breakdown pie charts using Recharts.
- **Weather & Agricultural Insights**: Temperature, rainfall, humidity, 5-day forecast, and price impact advisory.
- **Farmer Input & Personalized Advice**: Validated farmer submission form comparing preferred market against optimal net-profit market.
- **Price Alerts & Notifications**: Target price alert tracker for price spikes, drops, and best selling windows.
- **Multilingual UI**: English, Tamil (`தமிழ்`), and Hindi (`हिन्दी`).

> **Note on Demonstration Data**: Built-in agricultural prices and weather baselines are clearly labeled sample datasets for project demonstration. Connect a live Agmarknet/OpenWeather API or local Python ML service (`PYTHON_ML_URL`) for production feeds.

## Project Structure

- `server.ts` — Full-stack Express + Vite server (port 3000) serving the React app and `/api/*` endpoints
- `src/` — React + TypeScript + Tailwind CSS + Recharts frontend
- `backend/server.js`, `backend/routes.js` — Standalone Node.js Express API reference module
- `ml-service/` — Python FastAPI + Scikit-learn Random Forest / XGBoost forecasting service (`app.py`, `train_model.py`, `forecast.py`)
- `modules/java/CropPriceAnalyzer.java` — Java crop price trend & volatility analyzer
- `modules/c/crop_profit.c` — C crop net profit calculator
- `modules/cpp/market_optimizer.cpp` — C++ multi-market net-profit optimizer
- `database/schema.sql`, `database/mongodb_collections.js` — MySQL & MongoDB database schemas
- `data/sample_crop_prices.csv` — Sample Tamil Nadu agricultural price dataset

## Installation & Running

### 1. Web Application (React + Node.js Express)
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 2. Python ML Forecasting Microservice (Optional)
```bash
cd ml-service
pip install -r requirements.txt
python train_model.py
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
Set `PYTHON_ML_URL=http://localhost:8000` in `.env` to route `/api/forecast` to the Python ML service.

### 3. Java Trend Analyzer
```bash
javac modules/java/CropPriceAnalyzer.java
java -cp modules/java CropPriceAnalyzer
```

### 4. C Profit Calculator
```bash
gcc modules/c/crop_profit.c -o crop_profit
./crop_profit
```

### 5. C++ Market Optimizer
```bash
g++ -std=c++17 modules/cpp/market_optimizer.cpp -o market_optimizer
./market_optimizer
```

## API Documentation

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/crops` | List all supported crops, varieties, states, and districts |
| `GET` | `/api/markets` | List agricultural markets with coordinates and arrival volumes |
| `GET` | `/api/prices` | Current prices and summary KPIs for a crop & district |
| `POST` | `/api/forecast` | Predict 7-day or 30-day crop prices (`{ crop, market, days }`) |
| `POST` | `/api/market-advisor` | Rank markets by Net Profit (`{ crop, state, district, quantity }`) |
| `GET` | `/api/weather` | District weather metrics and crop price impact notes |
| `POST` | `/api/farmer-input` | Submit farmer harvest details for personalized recommendation |
| `GET` / `POST` / `DELETE` | `/api/alerts` | Create, evaluate, and manage farmer target-price alerts |
