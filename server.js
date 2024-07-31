const express = require('express');
const path = require('path');
const redis = require('./redis-client'); // Import the Redis client
const app = express();

console.log('Starting server...');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.post('/api/score', async (req, res) => {
  console.log('Received score update request:', req.body);
  const { userId, score, username } = req.body;
  
  try {
    console.log('Attempting to update score in Redis');
    const incrResult = await redis.hincrby(`user:${userId}`, 'score', score);
    console.log('Increment result:', incrResult);
    
    if (username) {
      console.log('Attempting to set username in Redis');
      const hsetResult = await redis.hset(`user:${userId}`, 'username', username);
      console.log('Hset result:', hsetResult);
    }
    
    const totalScore = await redis.hget(`user:${userId}`, 'score');
    console.log('Retrieved total score from Redis:', totalScore);
    
    res.json({ success: true, totalScore: parseInt(totalScore) });
  } catch (error) {
    console.error('Redis operation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  console.log('Received leaderboard request');
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
    console.log('Sending leaderboard:', leaderboard);
    res.json(leaderboard.slice(0, 10));
  } catch (error) {
    console.error('Redis error:', error);
    res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});