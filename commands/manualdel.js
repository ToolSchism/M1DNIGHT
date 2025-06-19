const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserData = require('../database/userSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manualdel')
    .setDescription('Xóa các document trong DB của những người không còn trong server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Chỉ admin dùng được
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Defer để tránh deprecated

    try {
      // Lấy guild từ interaction hoặc GUILD_ID
      const guild = interaction.guild || interaction.client.guilds.cache.get(process.env.GUILD_ID);
      if (!guild) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('Không tìm thấy server!')
          .setTimestamp();
        return interaction.editReply({ embeds: [errorEmbed] });
      }

      // Fetch tất cả thành viên để đảm bảo cache đầy đủ
      console.log(`[${new Date().toISOString()}] Fetching members for guild ${guild.name}...`);
      const members = await guild.members.fetch();
      const memberIds = new Set(members.map(member => member.id));
      console.log(`[${new Date().toISOString()}] Found ${memberIds.size} members in guild`);

      // Lấy tất cả document từ UserData
      const users = await UserData.find({});
      if (users.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('Không có document nào trong database!')
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }
      console.log(`[${new Date().toISOString()}] Found ${users.length} documents in UserData`);

      // Tìm và xóa các document có userId không nằm trong server
      let deletedCount = 0;
      const deletedUsers = [];
      for (const user of users) {
        if (!memberIds.has(user.userId)) {
          await UserData.findOneAndDelete({ userId: user.userId });
          deletedUsers.push({ username: user.username, userId: user.userId, dataId: user.dataId });
          deletedCount++;
          console.log(`[${new Date().toISOString()}] Đã xóa document của ${user.username} (userId: ${user.userId})`);
        }
      }

      // Tạo embed kết quả
      const embed = new EmbedBuilder()
        .setColor('#121416')
        .setTitle('Kết quả xóa document')
        .setTimestamp();

      if (deletedCount === 0) {
        embed.setDescription('Không có document nào cần xóa (tất cả userId đều thuộc thành viên server).');
      } else {
        embed.setDescription(`Đã xóa **${deletedCount}** document của những người không còn trong server.`);
        // Chỉ thêm tối đa 25 field để tránh lỗi
        const fields = deletedUsers.slice(0, 25).map(user => ({
          name: `User: ${user.username}`,
          value: `UserID: ${user.userId}\nDataID: ${user.dataId}`,
          inline: true
        }));
        if (deletedUsers.length > 25) {
          fields.push({
            name: 'Lưu ý',
            value: `Có ${deletedUsers.length - 25} document khác đã xóa (giới hạn embed). Kiểm tra log để xem chi tiết.`,
            inline: false
          });
        }
        embed.addFields(fields);
      }

      await interaction.editReply({ embeds: [embed] });
      console.log(`[${new Date().toISOString()}] Đã hoàn thành lệnh manualdel bởi ${interaction.user.tag}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Lỗi trong manualdel:`, error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#121416')
        .setDescription('Có lỗi xảy ra khi xóa document!')
        .setTimestamp();
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};