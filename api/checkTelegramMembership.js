// /api/checkTelegramMembership.js

const axios = require('axios');

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Replace with your actual Telegram Bot Token and Chat ID
    const BOT_TOKEN = '7313414614:AAFXWYlBaKjWpoOpJDKidCLBIi67P7GU_8M';
    const TELEGRAM_CHAT_ID = '-1001234567890';

    if (!BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return res.status(500).json({ error: 'Server configuration error' });
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
}
