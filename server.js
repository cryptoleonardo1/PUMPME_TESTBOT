const express = require('express');
const path = require('path');
const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN; // Make sure to set this in Vercel environment variables

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://telegram.org 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.telegram.org;"
  );
  next();
});

app.use(express.json());

// In-memory storage for user scores
const userScores = {};

app.post('/api/score', (req, res) => {
  const { userId, score } = req.body;
  userScores[userId] = (userScores[userId] || 0) + score;
  res.json({ success: true, totalScore: userScores[userId] });
});

app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Object.entries(userScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([userId, score]) => ({ userId, score }));
  res.json(leaderboard);
});

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});