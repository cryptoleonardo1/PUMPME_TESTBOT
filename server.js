require('dotenv').config();
const express = require('express');
const path = require('path');
const redis = require('./redis-client');
const util = require('util');
const app = express();

console.log('Starting server...');
console.log('REDIS_URL:', process.env.REDIS_URL ? 'Is set' : 'Is not set');

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/redis-test', async (req, res) => {
  try {
    console.log('Redis test started');
    await redis.set('test-key', 'test-value', 'EX', 60);
    const value = await redis.get('test-key');
    console.log('Redis test completed, value:', value);
    res.json({ success: true, value });
  } catch (error) {
    console.error('Redis test error:', util.inspect(error, { depth: null }));
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  console.log('Leaderboard request received');
  try {
    const leaderboardData = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    console.log('Raw leaderboard data:', leaderboardData);
    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const userId = leaderboardData[i];
      const score = parseInt(leaderboardData[i + 1], 10);
      const username = await redis.hget(`user:${userId}`, 'username') || 'Anonymous';
      leaderboard.push({ 
        userId,
        username,
        gains: score,
        pumping: "Various"
      });
    }
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', util.inspect(error, { depth: null }));
    res.status(500).json({ success: false, error: 'Error fetching leaderboard' });
  }
});

app.post('/api/saveUserData', async (req, res) => {
  try {
    const { userId, username, gains, level } = req.body;
    console.log('Saving user data:', { userId, username, gains, level });
    await redis.hset(`user:${userId}`, 'username', username, 'gains', gains, 'level', level);
    await redis.zadd('leaderboard', gains, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', util.inspect(error, { depth: null }));
    res.status(500).json({ success: false, error: 'Error saving user data' });
  }
});

app.get('/api/getUserData', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('Getting user data for userId:', userId);
    const userData = await redis.hgetall(`user:${userId}`);
    if (Object.keys(userData).length === 0) {
      res.json({ gains: 0, level: 1 });
    } else {
      res.json({
        gains: parseInt(userData.gains) || 0,
        level: parseInt(userData.level) || 1
      });
    }
  } catch (error) {
    console.error('Error getting user data:', util.inspect(error, { depth: null }));
    res.status(500).json({ success: false, error: 'Error getting user data' });
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

module.exports = app;