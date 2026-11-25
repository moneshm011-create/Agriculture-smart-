/**
 * Smart Crop Price Forecasting & Best-Market Advisor
 * Standalone Node.js + Express Backend Entry Point
 *
 * Run Instructions:
 *   npm install express cors dotenv
 *   node backend/server.js
 */

import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

app.use(express.json());
app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'smart-crop-advisor-node-api' });
});

app.listen(PORT, () => {
  console.log(`Smart Crop Node API listening on http://localhost:${PORT}`);
});
