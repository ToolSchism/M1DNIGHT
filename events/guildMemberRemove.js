const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserData = require('../database/userSchema');

module.exports = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member) {
    try {
      console.log(`[${new Date().toISOString()}] ${member.user.tag} (ID: ${member.id}) left server ${member.guild.name}`);

      // Check channel
      const channelId = process.env.LEAVE_ID;
      const channel = member.guild.channels.cache.get(channelId);
      if (!channel) {
        console.error(`Channel with ID ${channelId} not found or invalid!`);
        return;
      }

      // Check bot permissions
      const botPermissions = channel.permissionsFor(member.guild.members.me);
      if (!botPermissions.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
        console.error(`Bot lacks ViewChannel or SendMessages permissions in channel ${channel.name} (ID: ${channelId})`);
        return;
      }

      // Find document in database
      console.log(`Finding document with userId: ${member.id}`);
      const user = await UserData.findOne({ userId: member.id });

      // Create notification embed
      const embed = new EmbedBuilder()
        .setColor('#121416')
        .setTitle('Member Left Server')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      if (user) {
        embed
          .setDescription(`👋 **${member.user.tag} left the server!**`)
          .addFields(
            { name: 'Username', value: user.username, inline: true },
            { name: 'UserID', value: user.userId, inline: true },
            { name: 'DataID', value: user.dataId, inline: true }
          );
      } else {
        embed.setDescription(`👋 **${member.user.tag} left the server!** (No data found in DB)`);
      }

      // Send embed
      await channel.send({ embeds: [embed] });
      console.log(`Sent leave notification for ${member.user.tag} to channel ${channel.name}`);

      // Delete document
      if (user) {
        console.log(`Deleting document with userId: ${member.id}`);
        const deleted = await UserData.findOneAndDelete({ userId: member.id });
        if (deleted) {
          console.log(`Deleted document for ${member.user.tag} (userId: ${member.id}) from database`);
        } else {
          console.error(`Could not delete document for ${member.user.tag} (userId: ${member.id}) - No matching document found`);
        }
      } else {
        console.log(`No document found for ${member.user.tag} (userId: ${member.id}) to delete`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in guildMemberRemove (${member.user.tag}, ID: ${member.id}):`, error);
    }
  },
};