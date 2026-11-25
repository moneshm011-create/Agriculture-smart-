-- Smart Crop Price Forecasting & Best-Market Advisor
-- Relational Database Schema (MySQL 8.0+)

CREATE DATABASE IF NOT EXISTS smart_crop_advisor;
USE smart_crop_advisor;

CREATE TABLE IF NOT EXISTS crops (
  crop_id INT AUTO_INCREMENT PRIMARY KEY,
  crop_name VARCHAR(80) NOT NULL UNIQUE,
  category VARCHAR(40) NOT NULL,
  default_unit VARCHAR(30) NOT NULL DEFAULT 'Quintal',
  msp_reference DECIMAL(10, 2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS markets (
  market_id INT AUTO_INCREMENT PRIMARY KEY,
  market_name VARCHAR(120) NOT NULL UNIQUE,
  state VARCHAR(80) NOT NULL,
  district VARCHAR(80) NOT NULL,
  latitude DECIMAL(9, 6) NOT NULL,
  longitude DECIMAL(9, 6) NOT NULL,
  demand_level ENUM('High', 'Medium', 'Moderate') NOT NULL DEFAULT 'Medium',
  handling_fee_per_quintal DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_prices (
  price_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  crop_id INT NOT NULL,
  market_id INT NOT NULL,
  price_date DATE NOT NULL,
  modal_price DECIMAL(10, 2) NOT NULL,
  min_price DECIMAL(10, 2) NOT NULL,
  max_price DECIMAL(10, 2) NOT NULL,
  arrival_quintals INT NOT NULL DEFAULT 0,
  is_sample_data BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),
  FOREIGN KEY (market_id) REFERENCES markets(market_id),
  INDEX idx_crop_market_date (crop_id, market_id, price_date)
);

CREATE TABLE IF NOT EXISTS forecast_history (
  forecast_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  crop_id INT NOT NULL,
  market_id INT NOT NULL,
  horizon_days INT NOT NULL,
  predicted_avg_price DECIMAL(10, 2) NOT NULL,
  trend ENUM('Increasing', 'Decreasing', 'Stable') NOT NULL,
  confidence DECIMAL(4, 2) NOT NULL,
  model_name VARCHAR(80) NOT NULL DEFAULT 'RandomForestRegressor',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),
  FOREIGN KEY (market_id) REFERENCES markets(market_id)
);

CREATE TABLE IF NOT EXISTS farmer_submissions (
  submission_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  farmer_name VARCHAR(120) NOT NULL,
  crop_name VARCHAR(80) NOT NULL,
  quantity_quintals DECIMAL(10, 2) NOT NULL,
  district VARCHAR(80) NOT NULL,
  preferred_market VARCHAR(120) NOT NULL,
  transport_cost DECIMAL(10, 2) NOT NULL,
  expected_selling_date DATE NOT NULL,
  recommended_market VARCHAR(120) NOT NULL,
  estimated_net_profit DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_alerts (
  alert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  crop_name VARCHAR(80) NOT NULL,
  market_name VARCHAR(120) NOT NULL,
  target_price DECIMAL(10, 2) NOT NULL,
  trigger_condition ENUM('above', 'below') NOT NULL DEFAULT 'above',
  is_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
