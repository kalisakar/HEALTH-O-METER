
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected'
  });
});

// AI route reachability check
app.get('/api/ai/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI API route is reachable',
    note: 'This checks the backend route, not the AI model connection.'
  });
});

// AI health advice
app.post('/api/ai/health-advice', async (req, res) => {
  try {
    const { query } = req.body;

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        error: 'Please provide a health question.'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI service is not configured on the server.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Give safe, general health and wellness information.
Do not diagnose illnesses or prescribe medicines.
Do not prescribe medicines.
Encourage professional medical care for concerning symptoms.

User question: ${query.trim()}`
    });

    const answer = response.text;

    if (!answer) {
      return res.status(502).json({
        error: 'The AI returned an empty response.'
      });
    }

    return res.json({ text: answer });
  } catch (error) {
    console.error('AI generation failed:', error.message);

    return res.status(502).json({
      error: 'AI response could not be generated. Please try again.'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
