// api/saveUserData.js

const redis = require('../redis-client');

module.exports = async (req, res) => {
  try {
    const { userId, username, gains, level, boostsData, tasksData } = req.body;
    console.log('Received data:', { userId, username, gains, level, boostsData });

    // Convert data to strings for Redis
    const boostsDataString = JSON.stringify(boostsData || {});
    const tasksDataString = JSON.stringify(tasksData || {});
    const gainsString = gains.toString();
    const levelString = level.toString();

    // Get existing user data to preserve referrerId and other fields
    const existingUserData = await redis.hgetall(`user:${userId}`);

    // Prepare user data to save
    const userDataToSave = {
      userId: existingUserData.userId || userId,
      username: username || existingUserData.username || '',
      gains: gainsString || existingUserData.gains || '0',
      level: levelString || existingUserData.level || '1',
      boostsData: boostsDataString || existingUserData.boostsData || '{}',
      tasksData: tasksDataString || existingUserData.tasksData || '{}',
      referrerId: existingUserData.referrerId || '', // Preserve referrerId
    };

    // Save user data to Redis
    await redis.hset(`user:${userId}`, userDataToSave);

    // Update leaderboard
    await redis.zadd('leaderboard', gainsString, userId);

    console.log('User data saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({
      success: false,
      error: 'Error saving user data',
      details: error.message,
    });
  }
};