const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionResponseFlags } = require('discord.js');
const UserData = require('../database/userSchema'); // Đường dẫn tới model UserData

module.exports = {
  data: new SlashCommandBuilder()
    .setName('genrandom')
    .setDescription('Chọn ngẫu nhiên một người dùng từ database')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Chỉ admin dùng được
  async execute(interaction) {
    try {
      // Lấy tất cả người dùng từ database
      const users = await UserData.find({});

      if (users.length === 0) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('Không có người dùng nào trong database!')
          .setTimestamp();
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Chọn ngẫu nhiên một người dùng
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Tạo embed
      const embed = new EmbedBuilder()
        .setColor('#121416')
        .setTitle('Người dùng được chọn ngẫu nhiên')
        .addFields(
          { name: 'Username', value: randomUser.username, inline: true },
          { name: 'UserID', value: randomUser.userId, inline: true },
          { name: 'DataID', value: randomUser.dataId, inline: true }
        )
        .setTimestamp();

      // Trả về embed
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Lỗi khi thực hiện genrandom:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#121416')
        .setDescription('Có lỗi xảy ra khi chọn người dùng!')
        .setTimestamp();
      await interaction.reply({ embeds: [errorEmbed], flags: InteractionResponseFlags.Ephemeral });
    }
  },
};