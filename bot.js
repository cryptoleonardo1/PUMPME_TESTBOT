require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Redis = require('ioredis');
const util = require('util');

// Bot token from environment variable
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

// Redis setup
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    console.log(`Retrying Redis connection, attempt ${times}`);
    return delay;
  },
  reconnectOnError(err) {
    console.error('Redis reconnectOnError:', util.inspect(err, { depth: null }));
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
};

const redisClient = new Redis(process.env.REDIS_URL, redisOptions);

redisClient.on('error', (err) => {
  console.error('Redis Error:', util.inspect(err, { depth: null }));
});

redisClient.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redisClient.on('ready', () => {
  console.log('Redis client is ready');
});

redisClient.on('close', () => {
  console.log('Redis connection closed');
});

// Create a bot instance
const bot = new TelegramBot(token, {polling: true});

// Handle errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', util.inspect(error, { depth: null }));
});

async function retryRedisOperation(operation) {
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Redis operation failed (attempt ${attempt}/${maxRetries}):`, util.inspect(error, { depth: null }));
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function sendWelcomeMessage(chatId, userId) {
  try {
    const userCount = await retryRedisOperation(async () => {
      await redisClient.incr('user_count');
      return await redisClient.get('user_count');
    });

    const welcomeImage = 'https://i.imgur.com/ZDWfcal.jpg';
    const welcomeText = `Welcome to PUMPME.APP! You are user number ${userCount}. Let's get pumped!`;

    const keyboard = {
      inline_keyboard: [
        [{ text: 'START PUMPING', callback_data: 'start_pumping' }]
      ]
    };

    await bot.sendPhoto(chatId, welcomeImage, {
      caption: welcomeText,
      reply_markup: JSON.stringify(keyboard)
    });

    await retryRedisOperation(() => redisClient.set(`user:${userId}:welcomed`, 'true'));
  } catch (error) {
    console.error('Error in sendWelcomeMessage:', util.inspect(error, { depth: null }));
    await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
  }
}

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  console.log('Received /start command');
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await sendWelcomeMessage(chatId, userId);
});

// Handle first-time users
bot.on('message', async (msg) => {
  if (msg.text !== '/start') {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const isWelcomed = await retryRedisOperation(() => redisClient.get(`user:${userId}:welcomed`));
    if (!isWelcomed) {
      await sendWelcomeMessage(chatId, userId);
    }
  }
});

// Handle button press
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;

  if (callbackQuery.data === 'start_pumping') {
    try {
      await retryRedisOperation(() => redisClient.hsetnx(`user:${userId}`, 'pumpCount', 0));
      await bot.answerCallbackQuery(callbackQuery.id);
      
      const keyboard = {
        keyboard: [
          [{text: '/pump'}],
          [{text: '/stats'}]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      };
      
      await bot.sendMessage(chatId, "Game started! Tap the /pump button to start pumping!", {
        reply_markup: JSON.stringify(keyboard)
      });
    } catch (error) {
      console.error('Error in start_pumping callback:', util.inspect(error, { depth: null }));
      await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
    }
  }
});

// Handle user's pump action
bot.onText(/\/pump/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const pumpCount = await retryRedisOperation(() => redisClient.hincrby(`user:${userId}`, 'pumpCount', 1));
    let message = `You've pumped ${pumpCount} times! 💪`;
    
    if (pumpCount === 10) {
      message += "\nCongratulations! You've reached 10 pumps!";
    } else if (pumpCount === 100) {
      message += "\nWow! 100 pumps! You're on fire! 🔥";
    }
    
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error in /pump command:', util.inspect(error, { depth: null }));
    await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
  }
});

// Get user stats
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const pumpCount = await retryRedisOperation(() => redisClient.hget(`user:${userId}`, 'pumpCount')) || 0;
    const message = `Your Stats:\nTotal Pumps: ${pumpCount}`;
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error in /stats command:', util.inspect(error, { depth: null }));
    await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
  }
});

console.log('Bot is running...');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', util.inspect(reason, { depth: null }));
});

process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
  redisClient.quit();
});