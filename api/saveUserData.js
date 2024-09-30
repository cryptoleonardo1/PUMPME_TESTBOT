const redis = require('../redis-client');

module.exports = async (req, res) => {
  try {
    const { userId, username, gains, level, boostsData } = req.body;
    console.log('Saving user data:', { userId, username, gains, level });

    // Convert boostsData to JSON string
    const boostsDataString = JSON.stringify(boostsData || {});

    // Save user data
    await redis.hmset(`user:${userId}`, {
      username: username || 'Anonymous',
      gains: gains,
      level: level,
      boostsData: boostsDataString, // Use boostsData as the key
    });

    // Update leaderboard
    await redis.zadd('leaderboard', gains, userId);

    console.log('User data saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Error saving user data' });
  }
};