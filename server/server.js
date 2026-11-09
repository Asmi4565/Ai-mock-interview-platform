import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import answerRoutes from './routes/answerRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server directory regardless of where node was executed
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback to root .env if present

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (usually port 5173) and production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : (mongoose.connection.readyState === 2 ? 'connecting' : 'disconnected');
  res.status(200).json({
    success: true,
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Root API info
app.get('/api', (req, res) => {
  res.json({
    message: 'AI Mock Interview Platform API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// DB connectivity check middleware for data-dependent routes
app.use('/api', async (req, res, next) => {
  if (req.path === '/health' || req.path === '/' || req.path === '') {
    return next();
  }

  // If in the middle of connecting (readyState === 2), give it up to 3 seconds to finish
  if (mongoose.connection.readyState === 2) {
    let waitCount = 0;
    while (mongoose.connection.readyState === 2 && waitCount < 30) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitCount++;
    }
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is currently disconnected. Please start your local MongoDB service or configure a valid MONGODB_URI in server/.env.',
    });
  }
  next();
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', sessionRoutes);
app.use('/api', answerRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

// Connect to DB first, then listen on port
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
};

startServer();

