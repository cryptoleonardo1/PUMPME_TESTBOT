require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const redis = require('./redis-client');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

const bot = new TelegramBot(token, {polling: true});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

async function sendWelcomeMessage(chatId, userId) {
  try {
    await redis.incr('user_count');
    const userCount = await redis.get('user_count');

    const welcomeImage = 'https://i.imgur.com/ZDWfcal.jpg'; // Replace with your actual image URL
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

    await redis.set(`user:${userId}:welcomed`, 'true');
  } catch (error) {
    console.error('Error in sendWelcomeMessage:', error);
    await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
  }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  await sendWelcomeMessage(chatId, userId);
});

bot.on('message', async (msg) => {
  if (msg.text !== '/start') {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const isWelcomed = await redis.get(`user:${userId}:welcomed`);
    if (!isWelcomed) {
      await sendWelcomeMessage(chatId, userId);
    }
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;

  if (callbackQuery.data === 'start_pumping') {
    try {
      await redis.hsetnx(`user:${userId}`, 'pumpCount', 0);
      await bot.answerCallbackQuery(callbackQuery.id);
      await bot.sendMessage(chatId, "Game started! Use the /pump command to pump.");
    } catch (error) {
      console.error('Error in start_pumping callback:', error);
      await bot.sendMessage(chatId, "Oops! Something went wrong. Please try again later.");
    }
  }
});

bot.onText(/\/pump/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const pumpCount = await redis.hincrby(`user:${userId}`, 'pumpCount', 1);
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