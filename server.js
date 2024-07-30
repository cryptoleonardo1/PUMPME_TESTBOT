const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; // Replace with your actual bot token

app.use(express.static('public', {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));
app.use(express.json());

// Telegram authentication middleware
function telegramAuth(req, res, next) {
  const { hash, ...data } = req.body;
  
  const secret = crypto.createHash('sha256')
    .update(BOT_TOKEN)
    .digest();

  const checkString = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n');

  const hmac = crypto.createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');

  if (hmac === hash) {
    next();
  } else {
    res.status(403).send('Authentication failed');
  }
}

// Use telegramAuth middleware for score updates
app.post('/api/score', telegramAuth, (req, res) => {
  const { user, score } = req.body;
  const userId = user.id.toString();
  userScores[userId] = (userScores[userId] || 0) + score;
  res.json({ success: true, totalScore: userScores[userId] });
});

// ... rest of your server code ...

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});