
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

// Check MongoDB connection string format
const mongoURI = process.env.MONGODB_URI?.trim();

if (!mongoURI) {
  console.error('MONGODB_URI is missing in environment variables');
} else {
  console.log(
    'MongoDB URI scheme:',
    mongoURI.split(':')[0]
  );

  if (
    !mongoURI.startsWith('mongodb://') &&
    !mongoURI.startsWith('mongodb+srv://')
  ) {
    console.error(
      'Invalid MongoDB URI. Check Render Environment settings.'
    );
  } else {
    mongoose
      .connect(mongoURI)
      .then(() => {
        console.log('MongoDB connected successfully');
      })
      .catch((err) => {
        console.error(
          'MongoDB connection error:',
          err.message
        );
      });
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foodlogs', foodLogRoutes);
app.use('/api/profiles', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Health-o-Meter Backend is running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

