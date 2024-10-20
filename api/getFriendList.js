const redis = require('../redis-client');

module.exports = async (req, res) => {
    try {
        const referrerId = req.query.userId;

        if (!referrerId) {
            console.log('No userId provided in request');
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        console.log(`Fetching friend list for referrerId: ${referrerId}`);

        // Get the list of friend IDs
        const friendIds = await redis.smembers(`friendList:${referrerId}`);

        console.log(`Friend IDs:`, friendIds);

        if (!friendIds || friendIds.length === 0) {
            // No friends found
            console.log('No friends found for this referrer');
            return res.json([]);
        }

        const friendsData = [];
        for (const friendId of friendIds) {
            // Get user data for each friend
            const userData = await redis.hgetall(`user:${friendId}`);
            console.log(`User data for friendId ${friendId}:`, userData);

            // Get gains (assuming gains are stored in user data)
            const gains = userData.gains ? parseInt(userData.gains, 10) : 0;

            // Determine the display name
            const displayName = userData.username && userData.username !== '' ? userData.username : `User ID: ${friendId}`;

            friendsData.push({
                userId: friendId,
                username: displayName,
                gains: gains,
            });
        }

        // Sort friends by gains in descending order
        friendsData.sort((a, b) => b.gains - a.gains);

        // Add rank to each friend
        friendsData.forEach((friend, index) => {
            friend.rank = index + 1;
        });

        console.log('Final friends data:', friendsData);

        res.json(friendsData);
    } catch (error) {
        console.error('Error fetching friend list:', error);
        res.status(500).json({ error: 'Error fetching friend list', details: error.message });
    }
};
