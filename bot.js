// bot.js

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const redisClient = require('./redis-client');
const util = require('util');

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('BOT_TOKEN is not set in environment variables');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
    console.error('Polling error:', util.inspect(error, { depth: null }));
});

// --- Start Command Handler ---
bot.onText(/\/start\s?(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const startPayload = match[1]; // Extract the parameter after /start

    console.log('Received /start command');
    console.log('Message text:', msg.text);
    console.log('Extracted startPayload:', startPayload);

    try {
        const newUserId = msg.from.id.toString();
        const newUserName = msg.from.username || msg.from.first_name || '';

        if (startPayload && startPayload.startsWith('ref_')) {
            // Referral link used
            const referrerId = startPayload.replace('ref_', '');
            console.log(`New user ${newUserId} referred by ${referrerId}`);

            // Check if the user already exists
            const userExists = await redisClient.exists(`user:${newUserId}`);

            if (!userExists) {
                // Save the referral in Redis
                await saveReferral(referrerId, newUserId, newUserName);

                // Send a welcome message
                await sendWelcomeMessage(chatId);

                // Notify the referrer
                await notifyReferrer(referrerId, newUserId, newUserName);
            } else {
                console.log(`User ${newUserId} already exists. Not processing referral.`);
                // Send a welcome message without processing referral
                await sendWelcomeMessage(chatId);
            }
        } else {
            // Standard /start command
            console.log(`User ${newUserId} started the bot without referral`);

            // Check if the user already exists
            const userExists = await redisClient.exists(`user:${newUserId}`);

            if (!userExists) {
                // Save the new user's data
                await redisClient.hset(`user:${newUserId}`, {
                    userId: newUserId,
                    username: newUserName || '',
                    gains: '0',
                    level: '1',
                    boostsData: '{}',
                    tasksData: '{}',
                });
                console.log(`New user ${newUserId} data saved.`);
            } else {
                console.log(`User ${newUserId} already exists.`);
            }

            // Send a welcome message
            await sendWelcomeMessage(chatId);
        }
    } catch (error) {
        console.error('Error handling /start command:', error);
        bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
    }
});

// --- Function to Save Referral ---
async function saveReferral(referrerId, newUserId, newUserName) {
    try {
        console.log(`Saving referral data: referrerId=${referrerId}, newUserId=${newUserId}, newUserName=${newUserName}`);

/*
        // Convert IDs to strings
        referrerId = referrerId.toString();
        newUserId = newUserId.toString();
*/


        // Save the new user's data
        await redisClient.hset(`user:${newUserId}`, {
            userId: newUserId,
            username: newUserName || '',
            referrerId: referrerId,
            gains: '0',
            level: '1',
            boostsData: '{}',
            tasksData: '{}',
        });

        // Add the new user to the referrer's friend list
        await redisClient.sadd(`friendList:${referrerId}`, newUserId);

        console.log(`Referral saved: ${newUserId} referred by ${referrerId}`);
    } catch (error) {
        console.error('Error saving referral:', error);
    }
}

// --- Function to Notify Referrer ---
async function notifyReferrer(referrerId, newUserId, newUserName) {
    try {
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
        const welcomeImage = 'https://i.imgur.com/ZDMfcal.jpg'; // Replace with your welcome image URL
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

/*
// --- Referral Command Handler ---
bot.onText(/\/ref(\s+)?(\d+)?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const referrerId = match[2];

    console.log('Received /ref command');
    console.log('Message text:', msg.text);
    console.log('Extracted referrerId:', referrerId);

    try {
        if (referrerId) {
            const newUserId = msg.from.id.toString();
            const newUserName = msg.from.username || msg.from.first_name || '';

            console.log(`New user ${newUserId} referred by ${referrerId}`);

            // Save the referral in Redis
            await saveReferral(referrerId, newUserId, newUserName);

            // Send a welcome message
            await sendWelcomeMessage(chatId);

            // Notify the referrer (optional)
            await notifyReferrer(referrerId, newUserId, newUserName);
        } else {
            console.log('No referrerId provided in /ref command');
            await bot.sendMessage(chatId, 'Invalid referral link.');
        }
    } catch (error) {
        console.error('Error handling /ref command:', error);
        bot.sendMessage(chatId, 'Sorry, there was an error processing your referral.');
    }
});
*/



// --- Handle All Messages (For Debugging) ---
bot.on('message', (msg) => {
    // Ignore messages that are commands (start with '/')
    if (msg.text && msg.text.startsWith('/')) {
        // Commands are handled separately
        return;
    }

    console.log('Received message:', msg);

    const chatId = msg.chat.id;

    // Optionally, you can send a default response
    // bot.sendMessage(chatId, "Hi there! Use /start to begin.");
});

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
