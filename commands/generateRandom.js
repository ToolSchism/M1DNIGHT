const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionResponseFlags } = require('discord.js');
const UserData = require('../database/userSchema'); // Path to UserData model

module.exports = {
  data: new SlashCommandBuilder()
    .setName('genrandom')
    .setDescription('Randomly select a user from database')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Only admin can use
  async execute(interaction) {
    try {
      // Get all users from database
      const users = await UserData.find({});

      if (users.length === 0) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('No users found in database!')
          .setTimestamp();
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      // Randomly select a user
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#121416')
        .setTitle('Randomly Selected User')
        .addFields(
          { name: 'Username', value: randomUser.username, inline: true },
          { name: 'UserID', value: randomUser.userId, inline: true },
          { name: 'DataID', value: randomUser.dataId, inline: true }
        )
        .setTimestamp();

      // Return embed
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Error executing genrandom:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#121416')
        .setDescription('An error occurred while selecting user!')
        .setTimestamp();
      await interaction.reply({ embeds: [errorEmbed], flags: InteractionResponseFlags.Ephemeral });
    }
  },
};