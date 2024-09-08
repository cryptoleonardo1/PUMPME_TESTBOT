const redis = require('../redis-client');

module.exports = async (req, res) => {
  try {
    console.log('Fetching leaderboard data from Redis...');
    const leaderboardData = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    console.log('Raw leaderboard data:', leaderboardData);
    
    const leaderboard = [];
    for (let i = 0; i < leaderboardData.length; i += 2) {
      const userId = leaderboardData[i];
      const score = parseInt(leaderboardData[i + 1], 10);
      const userData = await redis.hgetall(`user:${userId}`);
      leaderboard.push({
        rank: Math.floor(i / 2) + 1,
        username: userData.username || 'Anonymous',
        gains: score
      });
    }
    
    console.log('Processed leaderboard:', leaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
};