const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionResponseFlags } = require('discord.js');
const UserData = require('../database/userSchema');
const generateDataId = require('../utils/generateDataId');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assignall')
        .setDescription('Tạo dataId cho tất cả người dùng non-bot trong server (bỏ qua nếu đã có dataId)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Chỉ admin có thể dùng lệnh
        .setDMPermission(false), // Không dùng trong DM
    async execute(interaction) {
        await interaction.deferReply(); // Defer để xử lý lâu

        try {
            const guild = interaction.guild;
            // Lấy tất cả members trong server
            const members = await guild.members.fetch().catch(err => {
                console.error('Lỗi khi lấy danh sách members:', err);
                throw new Error('Không thể lấy danh sách thành viên server');
            });

            let assignedCount = 0;
            let skippedCount = 0;
            let failedCount = 0;
            const failedUsers = [];

            // Lặp qua tất cả members
            for (const member of members.values()) {
                // Bỏ qua bot
                if (member.user.bot) {
                    skippedCount++;
                    continue;
                }

                try {
                    // Kiểm tra xem user đã có trong database chưa
                    let userData = await UserData.findOne({ userId: member.id });

                    if (userData) {
                        // Nếu đã có dataId, bỏ qua
                        if (userData.dataId) {
                            skippedCount++;
                            continue;
                        }
                    } else {
                        // Tạo user mới với dataId
                        const dataId = await generateDataId();
                        userData = new UserData({
                            userId: member.id,
                            username: member.user.tag,
                            dataId
                        });
                        await userData.save();
                        console.log(`Đã tạo dataId ${dataId} cho ${member.user.tag}`);
                        assignedCount++;
                    }
                } catch (error) {
                    console.error(`Lỗi khi xử lý user ${member.user.tag}:`, error);
                    failedCount++;
                    failedUsers.push(member.user.tag);
                }
            }

            // Tạo embed phản hồi
            const embed = new EmbedBuilder()
                .setTitle('Kết quả gán Data ID')
                .setDescription('Đã hoàn thành việc gán dataId cho người dùng trong server.')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Đã gán', value: `${assignedCount} người dùng`, inline: true },
                    { name: 'Đã bỏ qua', value: `${skippedCount} người dùng (bot hoặc đã có dataId)`, inline: true },
                    { name: 'Thất bại', value: `${failedCount} người dùng`, inline: true }
                )
                .setTimestamp();

            // Nếu có user thất bại, thêm chi tiết
            if (failedCount > 0) {
                embed.addFields({
                    name: 'Người dùng thất bại',
                    value: failedUsers.join(', ') || 'Không có chi tiết',
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Lỗi trong lệnh assignall:', error);
            const errorEmbed = new EmbedBuilder()
                .setDescription('Đã có lỗi xảy ra khi gán dataId!')
                .setColor('#FF0000');
            await interaction.editReply({ embeds: [errorEmbed], flags: InteractionResponseFlags.Ephemeral });
        }
    }
};