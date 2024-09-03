const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL;
console.log('Redis URL exists:', !!REDIS_URL);

if (!REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not set');
}

const redis = new Redis(REDIS_URL, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    console.log(`Retrying Redis connection, attempt ${times}`);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      console.log('Reconnecting due to READONLY error');
      return true;
    }
    return false;
  }
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

module.exports = redis;