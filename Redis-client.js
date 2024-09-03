require('dotenv').config();
const express = require('express');
const path = require('path');
const Redis = require('ioredis');
const util = require('util');
const app = express();

console.log('Starting server...');
console.log('REDIS_URL:', process.env.REDIS_URL ? 'Is set' : 'Is not set');

let redis;

function setupRedis() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('REDIS_URL is not set in environment variables');
    process.exit(1);
  }

  redis = new Redis(redisUrl, {
    tls: {
      rejectUnauthorized: false
    },
    connectTimeout: 20000,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      console.log(`Retrying Redis connection, attempt ${times}`);
      return delay;
    }
  });

  redis.on('error', (error) => {
    console.error('Redis connection error:', util.inspect(error, { depth: null }));
  });

  redis.on('connect', () => {
    console.log('Successfully connected to Redis');
  });
}

setupRedis();

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
      leaderboard.push({ 
        userId: leaderboardData[i], 
        score: parseInt(leaderboardData[i + 1]),
        pumping: "Various"
      });
    }
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', util.inspect(error, { depth: null }));
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.use((err, req, res, next) => {
  console.error('Express error:', util.inspect(err, { depth: null }));
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error', 
    details: err.message
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;