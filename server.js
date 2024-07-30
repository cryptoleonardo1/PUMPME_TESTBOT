const express = require('express');
const path = require('path');
const app = express();
const port = 3000; // Hardcoded port

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.static('public'));
app.use(express.json());

// In-memory storage for user scores
const userScores = {};

app.post('/api/score', (req, res) => {
  console.log('Received score update:', req.body);
  const { userId, score } = req.body;
  userScores[userId] = (userScores[userId] || 0) + score;
  console.log('Updated scores:', userScores);
  res.json({ success: true, totalScore: userScores[userId] });
});

app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Object.entries(userScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([userId, score]) => ({ userId, score }));
  console.log('Sending leaderboard:', leaderboard);
  res.json(leaderboard);
});

app.get('*', (req, res) => {
  console.log('Serving index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});