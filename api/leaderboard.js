import redis from '../lib/redis';

const redis = require('../lib/redis');

module.exports = async function(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('Fetching leaderboard data from Redis...');
      const leaderboardData = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
      console.log('Raw leaderboard data:', leaderboardData);
      
      const leaderboard = [];
      for (let i = 0; i < leaderboardData.length; i += 2) {
        const userId = leaderboardData[i];
        const score = parseInt(leaderboardData[i + 1], 10);
        const username = await redis.hget(`user:${userId}`, 'username') || 'Anonymous';
        leaderboard.push({ userId, username, gains: score });
      }
      
      console.log('Processed leaderboard:', leaderboard);
      res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Error fetching leaderboard', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}