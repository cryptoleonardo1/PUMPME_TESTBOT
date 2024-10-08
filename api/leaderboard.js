const redis = require('../redis-client');

module.exports = async (req, res) => {
  try {
    console.log('Fetching leaderboard data from Redis...');
    const leaderboardData = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    console.log('Raw leaderboard data:', leaderboardData);

    if (!leaderboardData || leaderboardData.length === 0) {
      console.log('No data found in leaderboard.');
      return res.json([]); // Return an empty array if no data
    }

    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const userId = leaderboardData[i];
      const score = parseInt(leaderboardData[i + 1], 10);

      const userData = await redis.hgetall(`user:${userId}`);
      console.log(`User data for userId ${userId}:`, userData);

      // Determine the display name
      const displayName =
        userData.username && userData.username !== ''
          ? userData.username
          : `User ID: ${userId}`;

      leaderboard.push({
        rank: Math.floor(i / 2) + 1, // Calculate the rank
        username: displayName,
        gains: score,
      });
    }

    console.log('Processed leaderboard:', leaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Error fetching leaderboard', details: error.message });
  }
};
