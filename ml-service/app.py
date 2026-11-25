"""
Smart Crop Price Forecasting - FastAPI Service (ml-service/app.py)

Run Instructions:
  cd ml-service
  pip install -r requirements.txt
  python train_model.py
  uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI
from pydantic import BaseModel, Field
from forecast import predict_crop_prices

app = FastAPI(title="Smart Crop ML Forecasting Service", version="1.0.0")


class ForecastRequest(BaseModel):
    crop: str = Field(default="Tomato", description="Crop name e.g. Tomato, Paddy, Onion")
    market: str = Field(default="Chennai", description="Market or district name")
    days: int = Field(default=7, ge=1, le=30, description="Forecast horizon in days")


@app.get("/health")
def health():
    return {"status": "healthy", "engine": "RandomForest + XGBoost"}


@app.post("/api/forecast")
@app.post("/predict")
def forecast_endpoint(req: ForecastRequest):
    return predict_crop_prices(crop=req.crop, market=req.market, days=req.days)
