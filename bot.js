require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const redisClient = require('./redis-client');
const util = require('util');

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('BOT_TOKEN is not set in environment variables');
    process.exit(1);
}

console.log('redis client details:', {
    options: redisClient.options,
    status: redisClient.status,
    mode: redisClient.mode
});

const bot = new TelegramBot(token, {polling: true});

bot.on('polling_error', (error) => {
    console.error('Polling error:', util.inspect(error, { depth: null }));
});

async function sendWelcomeMessage(chatId) {
    try {
        const welcomeImage = 'https://i.imgur.com/ZDMfcal.jpg';
        const welcomeText = 'Welcome to PUMP ME! Tap the button below to start the game.';
        const keyboard = {
            inline_keyboard: [[{ text: 'Start Game', web_app: { url: 'https://pumpme-testbot.vercel.app' } }]]
        };

        await bot.sendPhoto(chatId, welcomeImage, {
            caption: welcomeText,
            reply_markup: JSON.stringify(keyboard)
        });
    } catch (error) {
        console.error('Error in sendWelcomeMessage:', util.inspect(error, { depth: null }));
    }
}

async function testRedis() {
    try {
        console.log('Starting Redis test');
        await redisClient.set('test', 'working');
        console.log('Set operation completed');
        const result = await redisClient.get('test');
        console.log('Get operation completed');
        console.log('Redis test result:', result);
    } catch (error) {
        console.error('Redis test error:', error);
        console.error('Error stack:', error.stack);
    }
}

bot.onText(/\/somecommand/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const result = await redisClient.get('some-key');
        // Process result...
    } catch (error) {
        console.error('Redis operation error:', error);
        bot.sendMessage(chatId, "Sorry, there was an error processing your request.");
    }
});

bot.on('message', (msg) => {
    // Handle incoming messages
});

async function testRedis() {
    try {
        await redisClient.set('test', 'working');
        const result = await redisClient.get('test');
        console.log('Redis test result:', result);
    } catch (error) {
        console.error('Redis test error:', error);
    }
}

testRedis();

console.log('Bot is running...');

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at: ', promise, 'reason:', util.inspect(reason, { depth: null }));
});

process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
    redisClient.quit();
});