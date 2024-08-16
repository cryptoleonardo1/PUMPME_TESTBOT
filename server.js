const express = require('express');
const Redis = require('ioredis');
const path = require('path');
const app = express();

console.log('Starting server...');

// Redis client setup
const redis = new Redis({
  host: 'master-marlin-55875.upstash.io',
  port: 6379,
  password: 'AdpDAAIjcDEwNDMxMWY2NTQwYjQ0MWE2YmE5YzE2NmRkZTIzZmJlMXAxMA',
  tls: {}
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/test', (req, res) => {
  console.log('Test API called');
  res.json({ message: 'API is working' });
});

app.post('/api/score', async (req, res) => {
  console.log('Score update request received:', req.body);
  try {
    const { userId, score, username } = req.body;
    await redis.zincrby('leaderboard', score, userId);
    const totalScore = await redis.zscore('leaderboard', userId);
    console.log(`Updated score for user ${userId}: ${totalScore}`);
    res.json({ success: true, totalScore });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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
    console.log('Processed leaderboard:', leaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

module.exports = app;