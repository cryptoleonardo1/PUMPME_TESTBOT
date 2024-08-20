require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Redis = require('ioredis');

const token = process.env.BOT_TOKEN;
const redisUrl = process.env.REDIS_URL;

console.log('BOT_TOKEN:', token ? 'Is set' : 'Is not set');
console.log('REDIS_URL:', redisUrl ? 'Is set' : 'Is not set');

if (!token || !redisUrl) {
  console.error('BOT_TOKEN or REDIS_URL is not set. Please set the environment variables.');
  process.exit(1);
}

const redis = new Redis(redisUrl, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    console.log(`Retrying Redis connection, attempt ${times}`);
    return delay;
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

const bot = new TelegramBot(token, {polling: true});

const welcomeImageUrl = 'https://i.imgur.com/ZDWfcal.png';

function sendWelcomeMessage(chatId) {
  console.log('Attempting to send welcome message to chat ID:', chatId);
  bot.sendPhoto(chatId, welcomeImageUrl, {
    caption: 'Welcome to PUMP ME! Tap the button below to start the game.',
    reply_markup: {
      inline_keyboard: [[
        {
          text: "Start Game",
          web_app: {url: 'https://pumpme-testbot.vercel.app'}
        }
      ]]
    }
  }).then(() => {
    console.log('Welcome message sent successfully to chat ID:', chatId);
  }).catch((error) => {
    console.error('Error sending welcome message to chat ID:', chatId, 'Error:', error);
  });
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  console.log('Received /start command from chat ID:', chatId);
  
  try {
    await redis.incr('user_count');
    console.log('Incremented user count');
  } catch (error) {
    console.error('Error incrementing user count:', error);
  }
  
  sendWelcomeMessage(chatId);
});

bot.on('message', (msg) => {
  console.log('Received message:', msg.text, 'from chat ID:', msg.chat.id);
  if (msg.text && !msg.text.startsWith('/')) {
    sendWelcomeMessage(msg.chat.id);
  }
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Bot is starting...');

bot.getMe().then((botInfo) => {
  console.log('Bot information:', botInfo);
  console.log('Bot is running and ready to receive messages');
}).catch((error) => {
  console.error('Error getting bot information:', error);
});