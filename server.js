const express = require('express');
const path = require('path');
const Redis = require('ioredis');
const app = express();

console.log('Starting server...');

// Redis client setup
const redis = new Redis({
  host: 'master-marlin-55875.upstash.io',
  port: 6379,
  password: 'Your_Redis_Password_Here', // Replace with your actual password
  tls: {}
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Content Security Policy middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.telegram.org;"
  );
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Telegram Bot Server is running');
});

app.post('/api/score', async (req, res) => {
  try {
    const { userId, score, username } = req.body;
    await redis.zincrby('leaderboard', score, userId);
    const totalScore = await redis.zscore('leaderboard', userId);
    res.json({ success: true, totalScore });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    console.log('Received leaderboard request');
    const leaderboardData = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    console.log('Raw leaderboard data:', leaderboardData);
    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const userId = leaderboardData[i];
      const score = parseInt(leaderboardData[i + 1]);
      let pumping;
      switch (i / 2) {
        case 0: pumping = "Chest"; break;
        case 1: pumping = "Biceps"; break;
        case 2: pumping = "Triceps"; break;
        case 3: pumping = "Ass"; break;
        case 4: pumping = "Abs"; break;
        default: pumping = "Belly fat";
      }
      leaderboard.push({ userId, score, pumping });
    }
    console.log('Sending leaderboard:', leaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
  }
});

app.get('/api/test-redis', async (req, res) => {
  try {
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    res.json({ success: true, value });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({ success: false, error: 'Redis connection failed', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// For Vercel deployment
module.exports = app;