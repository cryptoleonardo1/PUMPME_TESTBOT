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

app.get('/api/leaderboard', async (req, res) => {
  console.log('Leaderboard request received');
  try {
    console.log('Fetching leaderboard data from Redis...');
    const leaderboardData = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    console.log('Raw leaderboard data:', leaderboardData);
    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const userId = leaderboardData[i];
      const score = parseInt(leaderboardData[i + 1], 10);
      console.log(`Fetching username for userId: ${userId}`);
      const username = await redis.hget(`user:${userId}`, 'username') || 'Anonymous';
      leaderboard.push({ 
        userId,
        username,
        gains: score
      });
    }
    console.log('Processed leaderboard:', leaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', util.inspect(error, { depth: null }));
    res.status(500).json({ success: false, error: 'Error fetching leaderboard', details: error.message });
  }
});

app.post('/api/saveUserData', async (req, res) => {
  try {
    const { userId, username, gains, level } = req.body;
    console.log('Saving user data:', { userId, username, gains, level });
    await redis.hset(`user:${userId}`, 'username', username, 'gains', gains, 'level', level);
    await redis.zadd('leaderboard', gains, userId);
    console.log('User data saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', util.inspect(error, { depth: null }));
    res.status(500).json({ success: false, error: 'Error saving user data', details: error.message });
  }
});

app.get('/api/getUserData', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('Getting user data for userId:', userId);
    const userData = await redis.hgetall(`user:${userId}`);
    console.log('Raw user data:', userData);
    if (Object.keys(userData).length === 0) {
      console.log('No user data found, returning default values');
      res.json({ gains: 0, level: 1 });
    } else {
      console.log('User data found, returning:', userData);
      res.json({
        gains: parseInt(userData.gains) || 0,
        level: parseInt(userData.level) || 1
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