require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;

console.log('BOT_TOKEN:', token); // For debugging

if (!token) {
  console.error('BOT_TOKEN is not set. Please set the environment variable.');
  process.exit(1);
}

const bot = new TelegramBot(token, {polling: true});

const welcomeImageUrl = 'https://imgur.com/ZDWfcal';

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
    console.log('Welcome message sent successfully');
  }).catch((error) => {
    console.error('Error sending welcome message:', error);
  });
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sendWelcomeMessage(chatId);
});

bot.on('message', (msg) => {
  console.log('Received message:', msg.text);
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    sendWelcomeMessage(chatId);
  }
});

bot.on('polling_error', (error) => {
  console.log('Polling error:', error);
});

console.log('Bot is running...');