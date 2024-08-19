const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// Store user states
const userStates = {};

// Replace this URL with the actual URL of your PUMP ME image
const welcomeImageUrl = 'https://drive.google.com/file/d/1mN_L_utUNkfF5FvMKG7-56Epcf3kg8m9/view';

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sendWelcomeMessage(chatId);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  // If it's not a /start command and we haven't sent a welcome message, send it
  if (!msg.text.startsWith('/start') && !userStates[chatId]) {
    sendWelcomeMessage(chatId);
  }
});

function sendWelcomeMessage(chatId) {
  userStates[chatId] = true; // Mark that we've sent the welcome message

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
  });
}

console.log('Bot is running...');