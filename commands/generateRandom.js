const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionResponseFlags, InteractionContextType } = require('discord.js');
const UserData = require('../database/userSchema'); // Path to UserData model / Đường dẫn tới model UserData

module.exports = {
  data: new SlashCommandBuilder()
    .setName('genrandom')
    .setDescription('Randomly select a user from database') // Chọn ngẫu nhiên một người dùng từ database
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Only admin can use / Chỉ admin dùng được
    .setContexts([InteractionContextType.Guild]), // Cannot be used in DM / Không dùng trong DM
  async execute(interaction) {
    try {
      // Get all users from database / Lấy tất cả người dùng từ database
      const users = await UserData.find({});

      if (users.length === 0) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('No users found in database!') // Không có người dùng nào trong database!
          .setTimestamp();
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Randomly select a user / Chọn ngẫu nhiên một người dùng
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Create embed / Tạo embed
      const embed = new EmbedBuilder()
        .setColor('#121416')
        .setTitle('Randomly Selected User') // Người dùng được chọn ngẫu nhiên
        .addFields(
          { name: 'Username', value: randomUser.username, inline: true },
          { name: 'UserID', value: randomUser.userId, inline: true },
          { name: 'DataID', value: randomUser.dataId, inline: true }
        )
        .setTimestamp();

      // Return embed / Trả về embed
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Error executing genrandom:', error); // Lỗi khi thực hiện genrandom
      const errorEmbed = new EmbedBuilder()
        .setColor('#121416')
        .setDescription('An error occurred while selecting user!') // Có lỗi xảy ra khi chọn người dùng!
        .setTimestamp();
      await interaction.reply({ embeds: [errorEmbed], flags: InteractionResponseFlags.Ephemeral });
    }
  },
};