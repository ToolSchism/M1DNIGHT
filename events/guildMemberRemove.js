const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserData = require('../database/userSchema');

module.exports = {
  name: 'guildMemberRemove',
    once: false,
  async execute(member) {
    try {
      console.log(`[${new Date().toISOString()}] ${member.user.tag} (ID: ${member.id}) đã rời server ${member.guild.name}`);

      // Kiểm tra kênh
      const channelId = process.env.LEAVE_ID;
      const channel = member.guild.channels.cache.get(channelId);
      if (!channel) {
        console.error(`Kênh với ID ${channelId} không tìm thấy hoặc không hợp lệ!`);
        return;
      }

      // Kiểm tra quyền bot
      const botPermissions = channel.permissionsFor(member.guild.members.me);
      if (!botPermissions.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
        console.error(`Bot thiếu quyền ViewChannel hoặc SendMessages trong kênh ${channel.name} (ID: ${channelId})`);
        return;
      }

      // Tìm document trong database
      console.log(`Tìm document với userId: ${member.id}`);
      const user = await UserData.findOne({ userId: member.id });

      // Tạo embed thông báo
      const embed = new EmbedBuilder()
        .setColor('#121416')
        .setTitle('Thành viên rời server')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      if (user) {
        embed
          .setDescription(`👋 **${member.user.tag} đã rời server!**`)
          .addFields(
            { name: 'Username', value: user.username, inline: true },
            { name: 'UserID', value: user.userId, inline: true },
            { name: 'DataID', value: user.dataId, inline: true }
          );
      } else {
        embed.setDescription(`👋 **${member.user.tag} đã rời server!** (Không tìm thấy dữ liệu trong DB)`);
      }

      // Gửi embed
      await channel.send({ embeds: [embed] });
      console.log(`Đã gửi thông báo rời server cho ${member.user.tag} vào kênh ${channel.name}`);

      // Xóa document
      if (user) {
        console.log(`Thực hiện xóa document với userId: ${member.id}`);
        const deleted = await UserData.findOneAndDelete({ userId: member.id });
        if (deleted) {
          console.log(`Đã xóa document của ${member.user.tag} (userId: ${member.id}) khỏi database`);
        } else {
          console.error(`Không xóa được document của ${member.user.tag} (userId: ${member.id}) - Không tìm thấy document khớp`);
        }
      } else {
        console.log(`Không tìm thấy document của ${member.user.tag} (userId: ${member.id}) để xóa`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Lỗi trong guildMemberRemove (${member.user.tag}, ID: ${member.id}):`, error);
    }
  },
};