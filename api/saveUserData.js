import redis from '../lib/redis';

const redis = require('../lib/redis');

module.exports = async function(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, username, gains, level } = req.body;
      console.log('Saving user data:', { userId, username, gains, level });
      await redis.hset(`user:${userId}`, 'username', username, 'gains', gains, 'level', level);
      await redis.zadd('leaderboard', gains, userId);
      console.log('User data saved successfully');
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving user data:', error);
      res.status(500).json({ success: false, error: 'Error saving user data', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}