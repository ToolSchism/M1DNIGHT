const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UserData = require('../database/userSchema');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listall')
    .setDescription('Liệt kê username và DataID của tất cả người dùng trong database')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('sort')
        .setDescription('Sắp xếp danh sách theo')
        .setRequired(true)
        .addChoices(
          { name: 'A-Z', value: 'a-z' },
          { name: 'Z-A', value: 'z-a' },
          { name: 'DataID dài đến ngắn', value: 'dataid-length-desc' },
          { name: 'DataID ngắn đến dài', value: 'dataid-length-asc' }
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Lấy guild
      const guild = interaction.guild || interaction.client.guilds.cache.get(process.env.GUILD_ID);
      if (!guild) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('Không tìm thấy server!')
          .setTimestamp();
        return interaction.editReply({ embeds: [errorEmbed] });
      }

      // Lấy option sort
      const sortOption = interaction.options.getString('sort');

      // Lấy tất cả document từ UserData
      const users = await UserData.find({});
      if (users.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#121416')
          .setDescription('Không có người dùng nào trong database!')
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }

      // Sắp xếp users theo option
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


      // Fetch thành viên để lấy displayName
      const members = await guild.members.fetch().catch(err => {
        console.error(`[${new Date().toISOString()}] Lỗi khi fetch members:`, err);
        return new Map();
      });
      const memberMap = new Map(members.map(m => [m.id, m]));

      // Phân trang: Mỗi trang tối đa 25 field
      const itemsPerPage = 25;
      const totalPages = Math.ceil(users.length / itemsPerPage);
      let currentPage = 0;

      // Hàm tạo embed cho trang hiện tại
      const generateEmbed = (page) => {
        const start = page * itemsPerPage;
        const end = Math.min(start + itemsPerPage, sortedUsers.length);
        const embed = new EmbedBuilder()
          .setColor('#121416')
          .setTitle(`Danh sách người dùng (Trang ${page + 1}/${totalPages})`)
          .setDescription(`Sắp xếp: ${sortOption === 'a-z' ? 'A-Z' : sortOption === 'z-a' ? 'Z-A' : sortOption === 'dataid-length-desc' ? 'DataID dài đến ngắn' : 'DataID ngắn đến dài'}`)
          .setFooter({ text: `Tổng cộng: ${users.length} người dùng` })
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

      // Tạo buttons cho phân trang
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

      // Gửi embed đầu tiên
      await interaction.editReply({
        embeds: [generateEmbed(currentPage)],
        components: totalPages > 1 ? [row] : []
      });

      // Xử lý tương tác button
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
          console.error(`[${new Date().toISOString()}] Lỗi khi xử lý button trong /list:`, error);
        }
      });

      collector.on('end', () => {
        row.components.forEach(button => button.setDisabled(true));
        interaction.editReply({ components: [row] }).catch(() => {});
        console.log(`[${new Date().toISOString()}] Collector ended for /list command`);
      });

      console.log(`[${new Date().toISOString()}] Đã hoàn thành lệnh /list bởi ${interaction.user.tag}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Lỗi trong /list:`, error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#121416')
        .setDescription('Có lỗi xảy ra khi liệt kê người dùng!')
        .setTimestamp();
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};