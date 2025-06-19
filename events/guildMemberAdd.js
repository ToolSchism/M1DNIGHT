const UserData = require('../database/userSchema');
const generateDataId = require('../utils/generateDataId');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        console.log(`${member.user.tag} joined the server`);

        try {
            // Check if user already exists
            let userData = await UserData.findOne({ userId: member.id });

            if (!userData) {
                // Create new user with dataId
                const dataId = await generateDataId();
                userData = new UserData({
                    userId: member.id,
                    username: member.user.tag,
                    dataId // Generate dataId before saving
                });
                console.log('Creating new user:', { userId: member.id, username: member.user.tag, dataId });
                await userData.save();
                console.log(`Created new user with dataId: ${userData.dataId}`);
            } else {
                console.log(`User already exists: ${userData.dataId}`);
            }

            // Send message to specific channel
            const channel = member.guild.channels.cache.get(process.env.WELCOME_ID);
            if (channel) {
                await channel.send(
                    `🎉 **${member.user.tag} joined the server!**\n` +
                    `🔹 **User ID**: ${userData.userId}\n` +
                    `🔹 **Username**: ${userData.username}\n` +
                    `🔹 **Data ID**: ${userData.dataId}`
                );
            } else {
                console.error(`Channel not found: ${process.env.WELCOME_ID}`);
            }
        } catch (error) {
            console.error(`Error processing guildMemberAdd for ${member.user.tag}:`, error);
        }
    }
};