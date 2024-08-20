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

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  console.log('Received /start command from chat ID:', chatId);
  
  await redis.incr('user_count');
  
  sendWelcomeMessage(chatId);
});

bot.on('message', (msg) => {
  console.log('Received message:', msg.text, 'from chat ID:', msg.chat.id);
  if (msg.text && !msg.text.startsWith('/')) {
    sendWelcomeMessage(msg.chat.id);
  }
});

console.log('Bot is running...');