// saveUserData.js
const redis = require('../redis-client');

module.exports = async (req, res) => {
  try {
    const { userId, username, gains, level, boostsData, tasksData } = req.body;
    console.log('Received data:', { userId, username, gains, level });

    // Convert data to strings for Redis
    const boostsDataString = JSON.stringify(boostsData || {});
    const tasksDataString = JSON.stringify(tasksData || {});
    const gainsString = gains.toString();
    const levelString = level.toString();

    // Save user data to Redis, including userId
    await redis.hSet(`user:${userId}`, {
      userId: userId, // Store userId explicitly
      username: username || '',
      gains: gainsString,
      level: levelString,
      boostsData: boostsDataString,
      tasksData: tasksDataString,
    });

    // Update leaderboard
    await redis.zAdd('leaderboard', [{ score: gains, value: userId }]);

    console.log('User data saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ success: false, error: 'Error saving user data', details: error.message });
  }
};
