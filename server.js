const express = require('express');
const path = require('path');
const Redis = require('ioredis');
const app = express();

const REDIS_URL = process.env.REDIS_URL;
console.log('Redis URL:', REDIS_URL); // Log Redis URL (make sure to redact this in production)

const redis = new Redis(REDIS_URL);

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/score', async (req, res) => {
  const { userId, score, username } = req.body;
  console.log('Received score update:', { userId, score, username });
  
  try {
    await redis.hincrby(`user:${userId}`, 'score', score);
    if (username) {
      await redis.hset(`user:${userId}`, 'username', username);
    }
    const totalScore = await redis.hget(`user:${userId}`, 'score');
    console.log('Updated score:', { userId, totalScore });
    res.json({ success: true, totalScore: parseInt(totalScore) });
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await redis.keys('user:*');
    console.log('Found users:', users);
    const leaderboard = await Promise.all(users.map(async (userKey) => {
      const userData = await redis.hgetall(userKey);
      return {
        userId: userData.username || userKey.split(':')[1],
        score: parseInt(userData.score) || 0
      };
    }));

    leaderboard.sort((a, b) => b.score - a.score);
    console.log('Leaderboard:', leaderboard);
    res.json(leaderboard.slice(0, 10));
  } catch (error) {
    console.error('Redis error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});