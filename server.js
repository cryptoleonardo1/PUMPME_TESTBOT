const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World! The server is running.');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;