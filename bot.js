const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome to the Pump Me Test Bot! Tap the button below to start the game.", {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "Start Game",
          web_app: {url: 'https://pumpme-testbot.vercel.app'}
        }
      ]]
    }
  });
});

console.log('Bot is running...');