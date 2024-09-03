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

// Welcome message
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    // Increment user count in Redis
    await redis.incr('user_count');
    const userCount = await redis.get('user_count');
    
    const message = `Welcome to PUMPME.APP! You are user number ${userCount}. Let's get pumped!`;
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error in /start command:', error);
    await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
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