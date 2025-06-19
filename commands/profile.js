const { SlashCommandBuilder, EmbedBuilder, InteractionResponseFlags } = require('discord.js');
const UserData = require('../database/userSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Hiển thị thông tin người dùng từ database')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Người dùng muốn xem thông tin (mặc định: bạn)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('dataid')
                .setDescription('Tìm user bằng Data ID (ví dụ: 432C)')
                .setRequired(false)
        ),
    async execute(interaction) {
        // Lấy user hoặc dataId từ option
        const targetUser = interaction.options.getUser('user');
        const dataId = interaction.options.getString('dataid');
        const defaultUser = interaction.user;

        let userData;
        if (dataId) {
            userData = await UserData.findOne({ dataId });
        } else if (targetUser) {
            userData = await UserData.findOne({ userId: targetUser.id });
        } else {
            userData = await UserData.findOne({ userId: defaultUser.id });
        }

        // Tạo embed để hiển thị thông tin
        const embed = new EmbedBuilder()
            .setTitle(`Thông tin người dùng${userData && targetUser ? `: ${targetUser.tag}` : dataId ? '' : `: ${defaultUser.tag}`}`)
            .setColor('#121416')
            .setThumbnail((targetUser || defaultUser).displayAvatarURL({ dynamic: true, size: 1024 }));

        if (userData) {
            embed.addFields(
                { name: 'User ID', value: userData.userId, inline: true },
                { name: 'Username', value: userData.username, inline: true },
                { name: 'Data ID', value: userData.dataId, inline: true }
            );
            // Phản hồi công khai khi tìm thấy dữ liệu
            await interaction.reply({ embeds: [embed] });
        } else {
            embed.setDescription('Không tìm thấy thông tin trong database!')
                 .setColor('#121416');
            // Phản hồi ephemeral khi không tìm thấy dữ liệu
            await interaction.reply({ embeds: [embed], flags: InteractionResponseFlags.Ephemeral });
        }
    }
};