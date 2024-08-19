const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// Store user states
const userStates = {};

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

  bot.sendMessage(chatId, "Welcome to the Pump Me Test Bot! Tap the button below to start the game.", {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "Start Game",
          web_app: {url: 'https://pumpme-testbot.vercel.app'}
        }
      ]]
    },
    parse_mode: 'HTML'
  });
}

console.log('Bot is running...');