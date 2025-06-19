const UserData = require('../database/userSchema');
const generateDataId = require('../utils/generateDataId');

module.exports = {
    name: 'guildMemberAdd',
        once: false,
    async execute(member, client) {
        console.log(`${member.user.tag} đã tham gia server`);

        try {
            // Kiểm tra xem user đã tồn tại chưa
            let userData = await UserData.findOne({ userId: member.id });

            if (!userData) {
                // Tạo user mới với dataId
                const dataId = await generateDataId();
                userData = new UserData({
                    userId: member.id,
                    username: member.user.tag,
                    dataId // Tạo dataId trước khi lưu
                });
                console.log('Creating new user:', { userId: member.id, username: member.user.tag, dataId });
                await userData.save();
                console.log(`Đã tạo user mới với dataId: ${userData.dataId}`);
            } else {
                console.log(`User đã tồn tại: ${userData.dataId}`);
            }

            // Gửi tin nhắn vào kênh cụ thể
            const channel = member.guild.channels.cache.get(process.env.WELCOME_ID);
            if (channel) {
                await channel.send(
                    `🎉 **${member.user.tag} đã tham gia server!**\n` +
                    `🔹 **User ID**: ${userData.userId}\n` +
                    `🔹 **Username**: ${userData.username}\n` +
                    `🔹 **Data ID**: ${userData.dataId}`
                );
            } else {
                console.error(`Kênh không tìm thấy: ${process.env.WELCOME_ID}`);
            }
        } catch (error) {
            console.error(`Lỗi khi xử lý guildMemberAdd cho ${member.user.tag}:`, error);
        }
    }
};