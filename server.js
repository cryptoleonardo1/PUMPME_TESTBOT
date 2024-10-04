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

// Leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  try {
    console.log('Fetching leaderboard data from Redis...');
    const leaderboardData = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    console.log('Raw leaderboard data:', leaderboardData);

    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const userId = leaderboardData[i];
      const score = parseInt(leaderboardData[i + 1], 10);
      const userData = await redis.hgetall(`user:${userId}`);
      console.log(`User data for userId ${userId}:`, userData);

      // Determine the display name
      const displayName = userData.username && userData.username !== '' ? userData.username : userId;

      leaderboard.push({
        rank: Math.floor(i / 2) + 1,
        username: displayName,
        gains: score,
      });
    }

    console.log('Processed leaderboard:', leaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});

app.post('/api/saveUserData', async (req, res) => {
  try {
    const { userId, username, gains, level, boostsData, tasksData } = req.body;
    console.log('Saving user data:', { userId, username, gains, level });

    // Convert data to strings
    const boostsDataString = JSON.stringify(boostsData || {});
    const tasksDataString = JSON.stringify(tasksData || []);
    const gainsString = gains.toString();
    const levelString = level.toString();

// In app.post('/api/saveUserData', ...)
await redis.hset(`user:${userId}`,
  'userId', userId,
  'username', username || '',
  'gains', gainsString,
  'level', levelString,
  'boostsData', boostsDataString,
  'tasksData', tasksDataString,
  'totalReps', totalReps.toString(),
  'totalBoostsPurchased', totalBoostsPurchased.toString(),
  'totalReferrals', totalReferrals.toString()
);

    // Update leaderboard
    await redis.zadd('leaderboard', gainsString, userId);

    console.log('User data saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({
      success: false,
      error: 'Error saving user data',
      details: error.message
    });
  }
});

app.get('/api/getUserData', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('Getting user data for userId:', userId);
    const userData = await redis.hgetall(`user:${userId}`);
    console.log('Raw user data:', userData);

    if (!userData || Object.keys(userData).length === 0) {
      console.log('No user data found, returning default values');
      res.json({
        gains: 0,
        level: 1,
        totalReps: parseInt(userData.totalReps) || 0,
        totalBoostsPurchased: parseInt(userData.totalBoostsPurchased) || 0,
        totalReferrals: parseInt(userData.totalReferrals) || 0,
        boostsData: {},
        tasksData: [],
        username: '',
        userId: userId
      });
    } else {
      console.log('User data found, returning:', userData);

      // Parse boostsData
      let boostsData = {};
      if (userData.boostsData) {
        try {
          boostsData = JSON.parse(userData.boostsData);
        } catch (parseError) {
          console.error('Error parsing boostsData:', parseError);
        }
      }

      // Parse tasksData
      let tasksData = [];
      if (userData.tasksData) {
        try {
          tasksData = JSON.parse(userData.tasksData);
        } catch (parseError) {
          console.error('Error parsing tasksData:', parseError);
        }
      }

      res.json({
        gains: parseInt(userData.gains) || 0,
        level: parseInt(userData.level) || 1,
        boostsData: boostsData,
        tasksData: tasksData,
        username: userData.username || '',
        userId: userData.userId || userId,
      });
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting user data',
      details: error.message
    });
  }
});

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
  .catch(error => {
    console.error('Redis connection failed:', error);
  });