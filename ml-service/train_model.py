"""
Smart Crop Price Forecasting - ML Model Training Module (ml-service/train_model.py)

Trains a Random Forest Regressor (and optional XGBoost Regressor if installed)
using historical crop prices, rolling averages, day-of-year seasonality, and lag features.

Run Instructions:
  cd ml-service
  pip install -r requirements.txt
  python train_model.py
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sample_crop_prices.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_price_model.pkl")


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(["crop", "market", "date"]).reset_index(drop=True)

    df["day_of_year"] = df["date"].dt.dayofyear
    df["day_of_week"] = df["date"].dt.dayofweek
    df["crop_code"] = df["crop"].astype("category").cat.codes
    df["market_code"] = df["market"].astype("category").cat.codes

    df["lag_1"] = df.groupby(["crop", "market"])["price_per_quintal"].shift(1).bfill()
    df["lag_3"] = df.groupby(["crop", "market"])["price_per_quintal"].shift(3).bfill()
    df["rolling_7"] = (
        df.groupby(["crop", "market"])["price_per_quintal"]
        .transform(lambda s: s.rolling(7, min_periods=1).mean())
    )
    return df


def train_and_save():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Sample dataset not found at {DATA_PATH}")

    raw_df = pd.read_csv(DATA_PATH)
    df = prepare_features(raw_df)

    feature_cols = [
        "crop_code",
        "market_code",
        "day_of_year",
        "day_of_week",
        "arrival_quintals",
        "rainfall_mm",
        "lag_1",
        "lag_3",
        "rolling_7",
    ]
    X = df[feature_cols]
    y = df["price_per_quintal"]

    rf_model = RandomForestRegressor(n_estimators=120, max_depth=10, random_state=42)
    rf_model.fit(X, y)
    preds = rf_model.predict(X)
    mae = mean_absolute_error(y, preds)
    r2 = r2_score(y, preds)

    xgb_model = None
    if HAS_XGBOOST:
        xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.08, max_depth=5, random_state=42)
        xgb_model.fit(X, y)

    crop_categories = dict(enumerate(df["crop"].astype("category").cat.categories))
    market_categories = dict(enumerate(df["market"].astype("category").cat.categories))

    artifact = {
        "rf_model": rf_model,
        "xgb_model": xgb_model,
        "feature_cols": feature_cols,
        "crop_categories": crop_categories,
        "market_categories": market_categories,
        "metrics": {"mae": round(float(mae), 2), "r2": round(float(r2), 4)},
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(artifact, f)

    print(f"Model trained successfully -> MAE: {mae:.2f} INR/quintal | R2: {r2:.4f}")
    print(f"Saved model artifact to {MODEL_PATH}")


if __name__ == "__main__":
    train_and_save()
