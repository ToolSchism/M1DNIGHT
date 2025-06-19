const { SlashCommandBuilder, EmbedBuilder, InteractionResponseFlags, InteractionContextType } = require('discord.js');
const UserData = require('../database/userSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display user information from database') // Hiển thị thông tin người dùng từ database
        .setContexts([InteractionContextType.Guild]) // Cannot be used in DM / Không dùng trong DM
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to view information (default: you)') // Người dùng muốn xem thông tin (mặc định: bạn)
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('dataid')
                .setDescription('Find user by Data ID (example: 432C)') // Tìm user bằng Data ID (ví dụ: 432C)
                .setRequired(false)
        ),
    async execute(interaction) {
        // Get user or dataId from options / Lấy user hoặc dataId từ option
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

        // Create embed to display information / Tạo embed để hiển thị thông tin
        const embed = new EmbedBuilder()
            .setTitle(`User Information${userData && targetUser ? `: ${targetUser.tag}` : dataId ? '' : `: ${defaultUser.tag}`}`) // Thông tin người dùng
            .setColor('#121416')
            .setThumbnail((targetUser || defaultUser).displayAvatarURL({ dynamic: true, size: 1024 }));

        if (userData) {
            embed.addFields(
                { name: 'User ID', value: userData.userId, inline: true },
                { name: 'Username', value: userData.username, inline: true },
                { name: 'Data ID', value: userData.dataId, inline: true }
            );
            // Public response when data is found / Phản hồi công khai khi tìm thấy dữ liệu
            await interaction.reply({ embeds: [embed] });
        } else {
            embed.setDescription('No information found in database!') // Không tìm thấy thông tin trong database!
                 .setColor('#121416');
            // Ephemeral response when data is not found / Phản hồi ephemeral khi không tìm thấy dữ liệu
            await interaction.reply({ embeds: [embed], flags: InteractionResponseFlags.Ephemeral });
        }
    }
};