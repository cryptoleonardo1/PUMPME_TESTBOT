// server.js

require('dotenv').config();
const express = require('express');
const path = require('path');
const redis = require('./redis-client');
const util = require('util');
const app = express();

console.log('Starting server...');
console.log('REDIS_URL:', process.env.REDIS_URL ? 'Is set' : 'Is not set');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Corrected paths to route handlers (since they're in the 'api' folder)
const leaderboardHandler = require('./API/leaderboard');
const saveUserDataHandler = require('./API/saveUserData');
const getUserDataHandler = require('./API/getUserData');

// Leaderboard endpoint
app.get('/API/leaderboard', leaderboardHandler);

// Save User Data endpoint
app.post('/API/saveUserData', saveUserDataHandler);

// Get User Data endpoint
app.get('/API/getUserData', getUserDataHandler);

app.use((err, req, res, next) => {
  console.error('Express error:', util.inspect(err, { depth: null }));
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Test Redis connection
redis
  .ping()
  .then(() => {
    console.log('Redis connection successful');
  })
  .catch((error) => {
    console.error('Redis connection failed:', error);
  });
