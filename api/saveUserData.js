// saveUserData.js
const redis = require('../redis-client');

module.exports = (req, res) => {
  const { userId, username, gains, level, boostsData, tasksData } = req.body;
  console.log('Received data:', { userId, username, gains, level });

  // Convert data to strings for Redis
  const boostsDataString = JSON.stringify(boostsData || {});
  const tasksDataString = JSON.stringify(tasksData || {});
  const gainsString = gains.toString();
  const levelString = level.toString();

  // Save user data to Redis
  redis.hmset(
    `user:${userId}`,
    {
      userId: userId,
      username: username || '',
      gains: gainsString,
      level: levelString,
      boostsData: boostsDataString,
      tasksData: tasksDataString,
    },
    (err) => {
      if (err) {
        console.error('Error saving user data:', err);
        res.status(500).json({ success: false, error: 'Error saving user data', details: err.message });
        return;
      }

      // Update leaderboard
      redis.zadd('leaderboard', gains, userId, (err) => {
        if (err) {
          console.error('Error updating leaderboard:', err);
          res.status(500).json({ success: false, error: 'Error updating leaderboard', details: err.message });
          return;
        }

        console.log('User data saved successfully');
        res.json({ success: true });
      });
    }
  );
};
