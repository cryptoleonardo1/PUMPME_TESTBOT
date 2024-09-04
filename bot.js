require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const redis = require('ioredis');

// Bot token from environment variable
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

// Redis setup
const redisClient = new redis(process.env.REDIS_URL);

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

// Create a bot instance
const bot = new TelegramBot(token, {polling: true});

// Handle errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

async function sendWelcomeMessage(chatId, userId) {
  try {
    await redisClient.incr('user_count');
    const userCount = await redisClient.get('user_count');

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

    await redisClient.set(`user:${userId}:welcomed`, 'true');
  } catch (error) {
    console.error('Error in sendWelcomeMessage:', error);
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
    const isWelcomed = await redisClient.get(`user:${userId}:welcomed`);
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
      await redisClient.hsetnx(`user:${userId}`, 'pumpCount', 0);
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
      console.error('Error in start_pumping callback:', error);
      await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
    }
  }
});

// Handle user's pump action
bot.onText(/\/pump/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const pumpCount = await redisClient.hincrby(`user:${userId}`, 'pumpCount', 1);
    let message = `You've pumped ${pumpCount} times! 💪`;
    
    if (pumpCount === 10) {
      message += "\nCongratulations! You've reached 10 pumps!";
    } else if (pumpCount === 100) {
      message += "\nWow! 100 pumps! You're on fire! 🔥";
    }
    
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error in /pump command:', error);
    await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
  }
});

// Get user stats
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const pumpCount = await redisClient.hget(`user:${userId}`, 'pumpCount') || 0;
    const message = `Your Stats:\nTotal Pumps: ${pumpCount}`;
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error in /stats command:', error);
    await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
  }
});

console.log('Bot is running...');