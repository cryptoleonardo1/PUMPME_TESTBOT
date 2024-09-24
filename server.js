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

// Leaderboard endpoint remains the same

app.post('/api/saveUserData', async (req, res) => {
  try {
    const { userId, username, gains, level, activeBoosts } = req.body;
    console.log('Saving user data:', { userId, username, gains, level, activeBoosts });

    // Convert activeBoosts to JSON string
    const activeBoostsString = JSON.stringify(activeBoosts || []);

    // Save user data
    await redis.hset(`user:${userId}`, 'username', username, 'gains', gains, 'level', level, 'activeBoosts', activeBoostsString);
    await redis.zadd('leaderboard', gains, userId);

    console.log('User data saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', util.inspect(error, { depth: null }));
    res.status(500).json({ success: false, error: 'Error saving user data', details: error.message });
  }
});

app.get('/api/leaderboard', require('./api/leaderboard'));

app.get('/api/getUserData', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('Getting user data for userId:', userId);
    const userData = await redis.hgetall(`user:${userId}`);
    console.log('Raw user data:', userData);

    if (Object.keys(userData).length === 0) {
      console.log('No user data found, returning default values');
      res.json({ gains: 0, level: 1, activeBoosts: [] });
    } else {
      console.log('User data found, returning:', userData);

      // Parse activeBoosts
      let activeBoosts = [];
      if (userData.activeBoosts) {
        try {
          activeBoosts = JSON.parse(userData.activeBoosts);
        } catch (parseError) {
          console.error('Error parsing activeBoosts:', parseError);
        }
      }

      res.json({
        gains: parseInt(userData.gains) || 0,
        level: parseInt(userData.level) || 1,
        activeBoosts: activeBoosts
      });
    }
  } catch (error) {
    console.error('Error getting user data:', util.inspect(error, { depth: null }));
    res.status(500).json({ success: false, error: 'Error getting user data', details: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Express error:', util.inspect(err, { depth: null }));
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error', 
    details: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Test Redis connection
redis.ping().then(() => {
  console.log('Redis connection successful');
}).catch((error) => {
  console.error('Redis connection failed:', error);
});