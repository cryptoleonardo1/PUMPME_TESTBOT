// Assuming you're using Express.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Replace with your actual Telegram Bot Token and Chat ID
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID';

router.post('/checkTelegramMembership', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Use the Telegram Bot API to get chat member info
        const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`, {
            params: {
                chat_id: TELEGRAM_CHAT_ID,
                user_id: userId
            }
        });

        const { status } = response.data.result;

        // Check if the user is a member or has joined recently
        const isMember = ['member', 'creator', 'administrator'].includes(status);

        res.json({ joined: isMember });
    } catch (error) {
        console.error('Error checking Telegram membership:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to check membership status' });
    }
});

module.exports = router;
