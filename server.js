const express = require('express');
const path = require('path');
const Redis = require('ioredis');
const app = express();

console.log('Starting server...');

const REDIS_URL = process.env.REDIS_URL;
console.log('REDIS_URL exists:', !!REDIS_URL);
console.log('Redis connection string:', REDIS_URL.replace(/\/\/.*@/, '//****@')); // Logs URL with hidden password

let redis;
try {
  redis = new Redis(REDIS_URL);
  console.log('Redis client created');
} catch (error) {
  console.error('Error creating Redis client:', error);
}

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.post('/api/score', async (req, res) => {
  console.log('Received score update request:', req.body);
  // ... rest of the function
});

app.get('/api/leaderboard', async (req, res) => {
  console.log('Received leaderboard request');
  // ... rest of the function
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});