const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL;

const redis = new Redis(REDIS_URL, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
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

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('ready', () => {
  console.log('Redis ready');
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

redis.on('reconnecting', (params) => {
  console.log('Redis reconnecting:', params);
});

module.exports = redis;