import redis from '../lib/redis';

const redis = require('../lib/redis');

module.exports = async function(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      console.log('Getting user data for userId:', userId);
      const userData = await redis.hgetall(`user:${userId}`);
      console.log('Raw user data:', userData);
      if (Object.keys(userData).length === 0) {
        console.log('No user data found, returning default values');
        res.status(200).json({ gains: 0, level: 1 });
      } else {
        console.log('User data found, returning:', userData);
        res.status(200).json({
          gains: parseInt(userData.gains) || 0,
          level: parseInt(userData.level) || 1
        });
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      res.status(500).json({ success: false, error: 'Error getting user data', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}