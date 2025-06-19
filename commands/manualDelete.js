const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const UserData = require('../database/userSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manualdel')
    .setDescription('Delete database documents of users who are no longer in the server') // Xóa các document trong DB của những người không còn trong server
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Only admin can use / Chỉ admin dùng được
    .setContexts([InteractionContextType.Guild]), // Cannot be used in DM / Không dùng trong DM
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Defer to avoid deprecation / Defer để tránh deprecated

    try {
      // Get guild from interaction or GUILD_ID / Lấy guild từ interaction hoặc GUILD_ID
      const guild = interaction.guild || interaction.client.guilds.cache.get(process.env.GUILD_ID);
      if (!guild) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('Server not found!') // Không tìm thấy server!
          .setTimestamp();
        return interaction.editReply({ embeds: [errorEmbed] });
      }

      // Fetch all members to ensure complete cache / Fetch tất cả thành viên để đảm bảo cache đầy đủ
      console.log(`[${new Date().toISOString()}] Fetching members for guild ${guild.name}...`);
      const members = await guild.members.fetch();
      const memberIds = new Set(members.map(member => member.id));
      console.log(`[${new Date().toISOString()}] Found ${memberIds.size} members in guild`);

      // Get all documents from UserData / Lấy tất cả document từ UserData
      const users = await UserData.find({});
      if (users.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('No documents found in database!') // Không có document nào trong database!
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }
      console.log(`[${new Date().toISOString()}] Found ${users.length} documents in UserData`);

      // Find and delete documents with userId not in server / Tìm và xóa các document có userId không nằm trong server
      let deletedCount = 0;
      const deletedUsers = [];
      for (const user of users) {
        if (!memberIds.has(user.userId)) {
          await UserData.findOneAndDelete({ userId: user.userId });
          deletedUsers.push({ username: user.username, userId: user.userId, dataId: user.dataId });
          deletedCount++;
          console.log(`[${new Date().toISOString()}] Deleted document for ${user.username} (userId: ${user.userId})`); // Đã xóa document của
        }
      }

      // Create result embed / Tạo embed kết quả
      const embed = new EmbedBuilder()
        .setColor('#121416')
        .setTitle('Document Deletion Results') // Kết quả xóa document
        .setTimestamp();

      if (deletedCount === 0) {
        embed.setDescription('No documents needed to be deleted (all userIds belong to server members).'); // Không có document nào cần xóa (tất cả userId đều thuộc thành viên server)
      } else {
        embed.setDescription(`Deleted **${deletedCount}** documents of users no longer in server.`); // Đã xóa **${deletedCount}** document của những người không còn trong server
        // Only add maximum 25 fields to avoid error / Chỉ thêm tối đa 25 field để tránh lỗi
        const fields = deletedUsers.slice(0, 25).map(user => ({
          name: `User: ${user.username}`,
          value: `UserID: ${user.userId}\nDataID: ${user.dataId}`,
          inline: true
        }));
        if (deletedUsers.length > 25) {
          fields.push({
            name: 'Note', // Lưu ý
            value: `${deletedUsers.length - 25} other documents were deleted (embed limit). Check logs for details.`, // document khác đã xóa (giới hạn embed). Kiểm tra log để xem chi tiết
            inline: false
          });
        }
        embed.addFields(fields);
      }

      await interaction.editReply({ embeds: [embed] });
      console.log(`[${new Date().toISOString()}] Completed manualdel command by ${interaction.user.tag}`); // Đã hoàn thành lệnh manualdel bởi
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in manualdel:`, error); // Lỗi trong manualdel
      const errorEmbed = new EmbedBuilder()
        .setColor('#121416')
        .setDescription('An error occurred while deleting documents!') // Có lỗi xảy ra khi xóa document!
        .setTimestamp();
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};