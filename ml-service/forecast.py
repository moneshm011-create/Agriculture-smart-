"""
Smart Crop Price Forecasting - Prediction Module (ml-service/forecast.py)

Loads the trained Random Forest / XGBoost artifact (or trains on-the-fly from
data/sample_crop_prices.csv) and generates iterative multi-day price forecasts.

Sample Input:
  predict_crop_prices(crop="Tomato", market="Koyambedu Market, Chennai", days=7)

Sample Output:
  {
    "crop": "Tomato",
    "market": "Koyambedu Market, Chennai",
    "forecast": [{"date": "2026-11-26", "price": 2910}, ...],
    "trend": "Increasing",
    "confidence": 0.85,
    "isSampleData": True
  }
"""

import os
import pickle
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from train_model import DATA_PATH, MODEL_PATH, prepare_features, train_and_save


def _load_artifact():
    if not os.path.exists(MODEL_PATH):
        train_and_save()
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def predict_crop_prices(crop: str, market: str, days: int = 7) -> dict:
    artifact = _load_artifact()
    rf_model = artifact["rf_model"]
    xgb_model = artifact.get("xgb_model")
    raw_df = pd.read_csv(DATA_PATH)
    df = prepare_features(raw_df)

    subset = df[
        (df["crop"].str.lower() == crop.lower())
        & (df["market"].str.lower().str.contains(market.split(",")[0].strip().lower()))
    ]
    if subset.empty:
        subset = df[df["crop"].str.lower() == crop.lower()]
    if subset.empty:
        subset = df.head(15)

    recent = subset.sort_values("date").tail(14).copy()
    last_row = recent.iloc[-1]
    prices_window = list(recent["price_per_quintal"].astype(float))
    base_date = pd.to_datetime(last_row["date"]).to_pydatetime()

    forecast_points = []
    for step in range(1, max(1, min(30, days)) + 1):
        target_date = base_date + timedelta(days=step)
        lag_1 = prices_window[-1]
        lag_3 = prices_window[-3] if len(prices_window) >= 3 else lag_1
        rolling_7 = float(np.mean(prices_window[-7:]))

        features = pd.DataFrame([{
            "crop_code": last_row["crop_code"],
            "market_code": last_row["market_code"],
            "day_of_year": target_date.timetuple().tm_yday,
            "day_of_week": target_date.weekday(),
            "arrival_quintals": last_row["arrival_quintals"],
            "rainfall_mm": last_row["rainfall_mm"],
            "lag_1": lag_1,
            "lag_3": lag_3,
            "rolling_7": rolling_7,
        }])

        rf_pred = float(rf_model.predict(features)[0])
        if xgb_model is not None:
            xgb_pred = float(xgb_model.predict(features)[0])
            blended = 0.6 * rf_pred + 0.4 * xgb_pred
        else:
            blended = rf_pred

        predicted_price = max(100, round(blended))
        prices_window.append(predicted_price)
        forecast_points.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day": step,
            "price": predicted_price,
        })

    start_price = float(last_row["price_per_quintal"])
    end_price = float(forecast_points[-1]["price"])
    pct_change = ((end_price - start_price) / max(1.0, start_price)) * 100.0

    if pct_change > 1.2:
        trend = "Increasing"
    elif pct_change < -1.2:
        trend = "Decreasing"
    else:
        trend = "Stable"

    r2 = artifact.get("metrics", {}).get("r2", 0.85)
    confidence = round(max(0.72, min(0.94, float(r2))), 2)

    return {
        "crop": crop,
        "market": market,
        "days": days,
        "currentPrice": round(start_price),
        "forecast": forecast_points,
        "trend": trend,
        "confidence": confidence,
        "isSampleData": True,
        "notice": "Demonstration forecast trained on sample agricultural price dataset.",
    }


if __name__ == "__main__":
    print(predict_crop_prices("Tomato", "Koyambedu Market, Chennai", 7))
