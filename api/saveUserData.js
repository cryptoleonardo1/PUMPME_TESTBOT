const redis = require('../redis-client');

module.exports = async (req, res) => {
  try {
    const { userId, username, gains, level, activeBoosts } = req.body;
    console.log('Saving user data:', { userId, username, gains, level, activeBoosts });

    // Convert activeBoosts to JSON string
    const activeBoostsString = JSON.stringify(activeBoosts || []);

    // Save user data
    await redis.hmset(`user:${userId}`, {
      username: username || 'Anonymous',
      gains: gains,
      level: level,
      activeBoosts: activeBoostsString
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