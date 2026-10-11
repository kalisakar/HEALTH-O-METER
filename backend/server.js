
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import foodLogRoutes from './routes/foodLogs.js';
import profileRoutes from './routes/profiles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI?.trim();

if (!mongoURI) {
  console.error('MONGODB_URI is missing in environment variables');
} else if (
  !mongoURI.startsWith('mongodb://') &&
  !mongoURI.startsWith('mongodb+srv://')
) {
  console.error('Invalid MongoDB URI format');
} else {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error.message);
    });
}

// Existing API routes
app.use('/api/auth', authRoutes);
app.use('/api/foodlogs', foodLogRoutes);
app.use('/api/profiles', profileRoutes);

// Backend health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Health-o-Meter Backend is running',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

// AI route reachability check only
app.get('/api/ai/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI API route is reachable',
    note: 'This checks the backend route, not the AI model connection.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

