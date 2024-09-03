const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL;
console.log('Redis URL exists:', !!REDIS_URL);
console.log('Redis URL:', REDIS_URL ? REDIS_URL.replace(/\/\/.*@/, '//****@') : 'Not provided');

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
    console.error('Redis reconnectOnError:', err);
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('ready', () => {
  console.log('Redis client is ready');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

module.exports = redis;