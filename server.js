const express = require('express');
const Redis = require('ioredis');
const app = express();

// Redis client setup
const redis = new Redis({
  host: 'master-marlin-55875.upstash.io',
  port: 6379,
  password: 'Your_Redis_Password_Here', // Replace with your actual password
  tls: {}
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World! The server is running.');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.post('/api/score', async (req, res) => {
  try {
    const { userId, score } = req.body;
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
    const leaderboardData = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const userId = leaderboardData[i];
      const score = parseInt(leaderboardData[i + 1]);
      leaderboard.push({ userId, score });
    }
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;