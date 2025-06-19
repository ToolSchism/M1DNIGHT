const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserData = require('../database/userSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manualdel')
    .setDescription('Delete database documents of users who are no longer in the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Only admin can use
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Defer to avoid deprecation

    try {
      // Get guild from interaction or GUILD_ID
      const guild = interaction.guild || interaction.client.guilds.cache.get(process.env.GUILD_ID);
      if (!guild) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('Server not found!')
          .setTimestamp();
        return interaction.editReply({ embeds: [errorEmbed] });
      }

      // Fetch all members to ensure complete cache
      console.log(`[${new Date().toISOString()}] Fetching members for guild ${guild.name}...`);
      const members = await guild.members.fetch();
      const memberIds = new Set(members.map(member => member.id));
      console.log(`[${new Date().toISOString()}] Found ${memberIds.size} members in guild`);

      // Get all documents from UserData
      const users = await UserData.find({});
      if (users.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('No documents found in database!')
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }
      console.log(`[${new Date().toISOString()}] Found ${users.length} documents in UserData`);

      // Find and delete documents with userId not in server
      let deletedCount = 0;
      const deletedUsers = [];
      for (const user of users) {
        if (!memberIds.has(user.userId)) {
          await UserData.findOneAndDelete({ userId: user.userId });
          deletedUsers.push({ username: user.username, userId: user.userId, dataId: user.dataId });
          deletedCount++;
          console.log(`[${new Date().toISOString()}] Deleted document for ${user.username} (userId: ${user.userId})`);
        }
      }

      // Create result embed
      const embed = new EmbedBuilder()
        .setColor('#121416')
        .setTitle('Document Deletion Results')
        .setTimestamp();

      if (deletedCount === 0) {
        embed.setDescription('No documents needed to be deleted (all userIds belong to server members).');
      } else {
        embed.setDescription(`Deleted **${deletedCount}** documents of users no longer in server.`);
        // Only add maximum 25 fields to avoid error
        const fields = deletedUsers.slice(0, 25).map(user => ({
          name: `User: ${user.username}`,
          value: `UserID: ${user.userId}\nDataID: ${user.dataId}`,
          inline: true
        }));
        if (deletedUsers.length > 25) {
          fields.push({
            name: 'Note',
            value: `${deletedUsers.length - 25} other documents were deleted (embed limit). Check logs for details.`,
            inline: false
          });
        }
        embed.addFields(fields);
      }

      await interaction.editReply({ embeds: [embed] });
      console.log(`[${new Date().toISOString()}] Completed manualdel command by ${interaction.user.tag}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in manualdel:`, error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#121416')
        .setDescription('An error occurred while deleting documents!')
        .setTimestamp();
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};