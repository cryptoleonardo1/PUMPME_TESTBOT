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

const bot = new TelegramBot(token, {polling: true});
const redis = new Redis(redisUrl);

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.getMe().then((botInfo) => {
  console.log('Bot initialized successfully:', botInfo.username);
}).catch((error) => {
  console.error('Error initializing bot:', error);
});

const welcomeImageUrl = 'https://i.imgur.com/ZDWfcal.png';

function sendWelcomeMessage(chatId) {
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

// Example of using Redis
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  console.log('Received /start command from chat ID:', chatId);
  
  // Increment user count in Redis
  await redis.incr('user_count');
  
  sendWelcomeMessage(chatId);
});

bot.on('message', (msg) => {
  console.log('Received message:', msg.text, 'from chat ID:', msg.chat.id);
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    sendWelcomeMessage(chatId);
  }
});

console.log('Bot is running...');