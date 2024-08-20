const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;

console.log('BOT_TOKEN:', token); // Check if token is defined

if (!token) {
  console.error('BOT_TOKEN is not set. Please set the environment variable.');
  process.exit(1);
}

const bot = new TelegramBot(token, {polling: true});

// Replace with your actual Google Drive image URL
const welcomeImageUrl = 'https://drive.google.com/uc?export=view&id=1mN_L_utUNkfF5FvMKG7-56Epcf3kg8m9';

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sendWelcomeMessage(chatId);
});

bot.on('message', (msg) => {
  console.log('Received message:', msg.text);
  const chatId = msg.chat.id;
  sendWelcomeMessage(chatId);
});

function sendWelcomeMessage(chatId) {
  console.log('Sending welcome message to:', chatId);
  
  bot.sendPhoto(chatId, welcomeImageUrl, {
    caption: 'PUMP ME is live!',
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

bot.on('polling_error', (error) => {
  console.log('Polling error:', error);
});

console.log('Bot is running...');