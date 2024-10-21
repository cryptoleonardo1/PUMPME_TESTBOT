require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const redisClient = require('./redis-client');
const util = require('util');

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('BOT_TOKEN is not set in environment variables');
    process.exit(1);
}

console.log('Redis client details:', {
    options: redisClient.options,
    status: redisClient.status,
    mode: redisClient.mode
});

const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
    console.error('Polling error:', util.inspect(error, { depth: null }));
});

// --- Start Command Handler ---
bot.onText(/\/start\s*(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const startPayload = match[1] || ''; // Extract the parameter after /start

    console.log('Received /start command');
    console.log('Message text:', msg.text);
    console.log('Extracted startPayload:', startPayload);

    try {
        if (startPayload && startPayload.startsWith('webapp_')) {
            // Referral link used
            const referrerId = startPayload.replace('webapp_', '');
            const newUserId = msg.from.id;
            const newUserName = msg.from.username || msg.from.first_name || ''; // Get the username or first name

            console.log(`New user ${newUserId} referred by ${referrerId}`);

            // Save the referral in Redis
            await saveReferral(referrerId, newUserId, newUserName);

            // Send a welcome message
            await sendWelcomeMessage(chatId);

            // Notify the referrer (optional)
            await notifyReferrer(referrerId, newUserId, newUserName);
        } else {
            // No referral parameter, standard /start command
            console.log(`User ${msg.from.id} started the bot without referral`);
            await sendWelcomeMessage(chatId);
        }
    } catch (error) {
        console.error('Error handling /start command:', error);
        bot.sendMessage(chatId, "Sorry, there was an error processing your request.");
    }
});

// --- Function to Save Referral ---
async function saveReferral(referrerId, newUserId, newUserName) {
    try {
        console.log(`Saving referral data: referrerId=${referrerId}, newUserId=${newUserId}, newUserName=${newUserName}`);

        // Validate IDs
        referrerId = referrerId.toString();
        newUserId = newUserId.toString();

        // Check if the new user already exists
        const userExists = await redisClient.exists(`user:${newUserId}`);
        console.log(`User exists: ${userExists}`);

        if (!userExists) {
            // Save the new user's data
            await redisClient.hset(`user:${newUserId}`, {
                userId: newUserId,
                username: newUserName || '',
                referrerId: referrerId,
                gains: '0', // Initialize gains to 0
                level: '1', // Initialize level to 1 or appropriate value
                boostsData: '{}',
                tasksData: '{}',
            });

            // Add the new user to the referrer's friend list
            await redisClient.sadd(`friendList:${referrerId}`, newUserId);

            console.log(`Referral saved: ${newUserId} referred by ${referrerId}`);
        } else {
            console.log(`User ${newUserId} already exists. Not updating referral data.`);
        }
    } catch (error) {
        console.error('Error saving referral:', error);
    }
}

// --- Function to Notify Referrer ---
async function notifyReferrer(referrerId, newUserId, newUserName) {
    try {
        // Compose the notification message
        const newUserDisplayName = newUserName ? `@${newUserName}` : `User ID: ${newUserId}`;
        const message = `🎉 Great news! ${newUserDisplayName} has joined your Fitness Crew!`;

        // Send a message to the referrer
        await bot.sendMessage(referrerId, message);
    } catch (error) {
        console.error(`Error notifying referrer ${referrerId}:`, error);
    }
}

// --- Function to Send Welcome Message ---
async function sendWelcomeMessage(chatId) {
    try {
        const welcomeImage = 'https://i.imgur.com/ZDMfcal.jpg';
        const welcomeText = 'Welcome to PUMP ME! Tap the button below to start the game.';
        const keyboard = {
            inline_keyboard: [[{ text: 'Start Game', web_app: { url: 'https://pumpme-testbot.vercel.app' } }]]
        };

        await bot.sendPhoto(chatId, welcomeImage, {
            caption: welcomeText,
            reply_markup: keyboard
        });
    } catch (error) {
        console.error('Error in sendWelcomeMessage:', error);
    }
}

// --- Placeholder for Other Commands ---
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

// --- Handle Other Messages ---
bot.on('message', (msg) => {
    console.log('Received message:', msg);
    // Handle incoming messages
    // For now, we can ignore other messages or provide a default response
    const chatId = msg.chat.id;
    //bot.sendMessage(chatId, "Hi there! Use /start to begin.");
});

// --- Test Redis Connection ---
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

testRedis();

console.log('Bot is running...');

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at: ', promise, 'reason:', util.inspect(reason, { depth: null }));
});

process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
    redisClient.quit();
});
