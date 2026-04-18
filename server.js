import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import batchRoutes from './routes/batchRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from frontend directory
app.use(express.static('frontend'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Friendly Root Routes
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Simply Bhartiya API is running',
    appUrl: 'http://localhost:8000',
    health: '/api/health'
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API root is available',
    availableRoutes: [
      '/api/health',
      '/api/batches',
      '/api/batches/dashboard/analytics?range=weekly',
      '/api/batches/export/history.xlsx',
      '/api/batches/reports/dashboard.xlsx?range=monthly'
    ]
  });
});

// Routes
app.use('/api/batches', batchRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Oil Traceability API is running' });
});

// Catch-all handler: send back index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
