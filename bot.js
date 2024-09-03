require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const redis = require('./redis-client');

// Bot token from environment variable
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

// Create a bot instance
const bot = new TelegramBot(token, {polling: true});

// Handle errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Welcome message handler
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    // Check if this is the user's first interaction
    const isNewUser = await redis.get(`user:${userId}:welcomed`) === null;

    if (isNewUser) {
      // Increment user count in Redis
      await redis.incr('user_count');
      const userCount = await redis.get('user_count');

      // Send welcome message with image
      const welcomeImage = 'https://i.imgur.com/ZDWfcal.jpg'; // Replace with your image URL
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

      // Mark user as welcomed
      await redis.set(`user:${userId}:welcomed`, 'true');
    }
  } catch (error) {
    console.error('Error in welcome message:', error);
    await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
  }
});

// Handle button press
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;

  if (callbackQuery.data === 'start_pumping') {
    try {
      // Initialize user's pump count if not exists
      await redis.hsetnx(`user:${userId}`, 'pumpCount', 0);

      await bot.answerCallbackQuery(callbackQuery.id);
      await bot.sendMessage(chatId, "Let's start pumping! Use the /pump command to pump.");
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
    // Increment user's pump count
    const pumpCount = await redis.hincrby(`user:${userId}`, 'pumpCount', 1);
    
    let message = `You've pumped ${pumpCount} times! 💪`;
    
    // Check for milestones
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
    const pumpCount = await redis.hget(`user:${userId}`, 'pumpCount') || 0;
    const message = `Your Stats:\nTotal Pumps: ${pumpCount}`;
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error in /stats command:', error);
    await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
  }
});

console.log('Bot is running...');