// api/myFitnessCrew.js
const redis = require('../redis-client');

module.exports = async (req, res) => {
    try {
        const referrerId = req.query.userId;

        if (!referrerId) {
            return res.status(400).json({ error: 'userId query parameter is required' });
        }

        // Retrieve the friend list
        const friendList = await redis.smembers(`friends:${referrerId}`);
        console.log(`FriendList for user ${referrerId}:`, friendList);

        // Include the referrer themselves
        const userIds = [referrerId, ...friendList];

        const pipeline = redis.pipeline();

        // For each userId, get their gains and username
        userIds.forEach((userId) => {
            pipeline.hgetall(`user:${userId}`);
        });

        const results = await pipeline.exec();

        const crewData = [];
        for (let i = 0; i < results.length; i++) {
            const [error, userData] = results[i];

            if (error) {
                console.error(`Error fetching data for userId ${userIds[i]}:`, error);
                continue;
            }

            const userId = userIds[i];
            const gains = userData.gains ? parseInt(userData.gains, 10) : 0;
            const username = userData.username || userId;

            crewData.push({
                userId,
                username,
                gains,
            });
        }

        // Sort the crewData by gains in descending order
        crewData.sort((a, b) => b.gains - a.gains);

        // Assign ranks
        crewData.forEach((member, index) => {
            member.rank = index + 1;
        });

        res.json(crewData);
    } catch (error) {
        console.error('Error fetching My Fitness Crew data:', error);
        res.status(500).json({ error: 'Error fetching My Fitness Crew data' });
    }
};
