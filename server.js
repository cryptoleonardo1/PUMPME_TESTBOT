const express = require('express');
const path = require('path');
const app = express();

console.log('Starting server...');

// In-memory storage for user scores (temporary solution)
const userScores = {};

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

app.post('/api/score', (req, res) => {
  // Handle score update
  // For now, just send a dummy response
  res.json({ success: true, totalScore: 100 });
});

app.get('/api/leaderboard', (req, res) => {
  // This is a placeholder. Replace with actual data fetching logic.
  const dummyData = [
    { rank: 1, userId: '123456789', score: 100, reward: 'Gold Medal' },
    { rank: 2, userId: '987654321', score: 90, reward: 'Silver Medal' },
    // Add more dummy data as needed
  ];
  res.json(dummyData);
});

app.get('/api/leaderboard', (req, res) => {
  console.log('Received leaderboard request');
  const leaderboard = Object.entries(userScores)
    .map(([userId, score]) => ({ userId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((entry, index) => {
      let pumping;
      switch (index) {
        case 0: pumping = "Chest"; break;
        case 1: pumping = "Biceps"; break;
        case 2: pumping = "Triceps"; break;
        case 3: pumping = "Ass"; break;
        case 4: pumping = "Abs"; break;
        default: pumping = "Belly fat";
      }
      return { ...entry, pumping };
    });

  console.log('Sending leaderboard:', leaderboard);
  res.json(leaderboard);
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