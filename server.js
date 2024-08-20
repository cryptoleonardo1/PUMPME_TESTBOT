const express = require('express');
const path = require('path');
const Redis = require('ioredis');
const app = express();

console.log('Starting server...');
console.log('REDIS_URL:', process.env.REDIS_URL ? 'Is set' : 'Is not set');

let redis;

function setupRedis() {
  redis = new Redis(process.env.REDIS_URL, {
    tls: {
      rejectUnauthorized: false
    },
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      console.log(`Retrying Redis connection, attempt ${times}`);
      return delay;
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    reconnectOnError: function (err) {
      console.log('Reconnect on error:', err);
      return true;
    }
  });

  redis.on('error', (error) => {
    console.error('Redis connection error:', error);
  });

  redis.on('connect', () => {
    console.log('Successfully connected to Redis');
  });

  redis.on('ready', () => {
    console.log('Redis is ready');
  });
}

setupRedis();

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/test', (req, res) => {
  console.log('Test API called');
  res.json({ message: 'API is working' });
});

app.get('/api/redis-test', async (req, res) => {
  try {
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    res.json({ success: true, value });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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
      leaderboard.push({ userId, score, pumping: "Various" });
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
  res.sendFile(path.join(__dirname, 'index.html'));
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