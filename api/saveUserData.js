// saveUserData.js
const redis = require('../redis-client');

module.exports = async (req, res) => {
  try {
    const { userId, username, gains, level, boostsData, tasksData } = req.body;
    console.log('Saving user data:', { userId, username, gains, level });

    // Convert boostsData and tasksData to JSON strings
    const boostsDataString = JSON.stringify(boostsData || {});
    const tasksDataString = JSON.stringify(tasksData || {});

    // Save user data to Redis
    await redis.hmset(`user:${userId}`, {
      username: username || 'Anonymous',
      gains: gains,
      level: level,
      boostsData: boostsDataString,
      tasksData: tasksDataString,
    });

    // Update leaderboard
    await redis.zadd('leaderboard', gains, userId);

    console.log('User data saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ success: false, error: 'Error saving user data', details: error.message });
  }
};