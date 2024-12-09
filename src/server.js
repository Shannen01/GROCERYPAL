const express = require('express');
const cors = require('cors');
const app = express();

// Add cors middleware first
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Then add other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Then your routes
app.use('/api/auth', authRoutes);
// ... other routes ...