const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserData = require('../database/userSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listall')
    .setDescription('List username and DataID of all users in database')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('sort')
        .setDescription('Sort list by')
        .setRequired(true)
        .addChoices(
          { name: 'A-Z', value: 'a-z' },
          { name: 'Z-A', value: 'z-a' },
          { name: 'DataID long to short', value: 'dataid-length-desc' },
          { name: 'DataID short to long', value: 'dataid-length-asc' }
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Get guild
      const guild = interaction.guild || interaction.client.guilds.cache.get(process.env.GUILD_ID);
      if (!guild) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('Server not found!')
          .setTimestamp();
        return interaction.editReply({ embeds: [errorEmbed] });
      }

      // Get sort option
      const sortOption = interaction.options.getString('sort');

      // Get all documents from UserData
      const users = await UserData.find({});
      if (users.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('No users found in database!')
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }

      // Sort users by option
      let sortedUsers = [...users];
      switch (sortOption) {
        case 'a-z':
          sortedUsers.sort((a, b) => a.username.localeCompare(b.username));
          break;
        case 'z-a':
          sortedUsers.sort((a, b) => b.username.localeCompare(a.username));
          break;
        case 'dataid-length-desc':
          sortedUsers.sort((a, b) => b.dataId.length - a.dataId.length || a.username.localeCompare(b.username));
          break;
        case 'dataid-length-asc':
          sortedUsers.sort((a, b) => a.dataId.length - b.dataId.length || a.username.localeCompare(b.username));
          break;
      }

      // Fetch members to get displayName
      const members = await guild.members.fetch().catch(err => {
        console.error(`[${new Date().toISOString()}] Error fetching members:`, err);
        return new Map();
      });
      const memberMap = new Map(members.map(m => [m.id, m]));

      // Pagination: Maximum 25 fields per page
      const itemsPerPage = 25;
      const totalPages = Math.ceil(users.length / itemsPerPage);
      let currentPage = 0;

      // Function to generate embed for current page
      const generateEmbed = (page) => {
        const start = page * itemsPerPage;
        const end = Math.min(start + itemsPerPage, sortedUsers.length);
        const embed = new EmbedBuilder()
          .setColor('#121416')
          .setTitle(`User List (Page ${page + 1}/${totalPages})`)
          .setDescription(`Sort: ${sortOption === 'a-z' ? 'A-Z' : sortOption === 'z-a' ? 'Z-A' : sortOption === 'dataid-length-desc' ? 'DataID long to short' : 'DataID short to long'}`)
          .setFooter({ text: `Total: ${users.length} users` })
          .setTimestamp();

        const fields = sortedUsers.slice(start, end).map(user => {
          const member = memberMap.get(user.userId);
          return {
            name: `@${user.username}`,
            value: `DataID: ${user.dataId}`,
            inline: true
          };
        });
        embed.addFields(fields);

        return embed;
      };

      // Create buttons for pagination
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev_page')
          .setLabel('⬅ Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId('next_page')
          .setLabel('Next ➡')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages - 1)
      );

      // Send first embed
      await interaction.editReply({
        embeds: [generateEmbed(currentPage)],
        components: totalPages > 1 ? [row] : []
      });

      // Handle button interactions
      const filter = i => i.user.id === interaction.user.id && ['prev_page', 'next_page'].includes(i.customId);
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        try {
          if (i.customId === 'prev_page' && currentPage > 0) {
            currentPage--;
          } else if (i.customId === 'next_page' && currentPage < totalPages - 1) {
            currentPage++;
          }

          row.components[0].setDisabled(currentPage === 0);
          row.components[1].setDisabled(currentPage === totalPages - 1);

          await i.update({
            embeds: [generateEmbed(currentPage)],
            components: [row]
          });
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error handling button in /listall:`, error);
        }
      });

      collector.on('end', () => {
        row.components.forEach(button => button.setDisabled(true));
        interaction.editReply({ components: [row] }).catch(() => {});
        console.log(`[${new Date().toISOString()}] Collector ended for /listall command`);
      });

      console.log(`[${new Date().toISOString()}] Completed /listall command by ${interaction.user.tag}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in /listall:`, error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#121416')
        .setDescription('An error occurred while listing users!')
        .setTimestamp();
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};