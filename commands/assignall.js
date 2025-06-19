const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionResponseFlags, InteractionContextType } = require('discord.js');
const UserData = require('../database/userSchema');
const generateDataId = require('../utils/generateDataId');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assignall')
        .setDescription('Create dataId for all non-bot users in server (skip if already has dataId)') // Tạo dataId cho tất cả người dùng non-bot trong server (bỏ qua nếu đã có dataId)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Only admin can use command / Chỉ admin có thể dùng lệnh
        .setContexts([InteractionContextType.Guild]), // Cannot be used in dm / Không dùng trong DM
    async execute(interaction) {
        await interaction.deferReply(); // Defer for long processing / Defer để xử lý lâu

        try {
            const guild = interaction.guild;
            // Get all members in server / Lấy tất cả members trong server
            const members = await guild.members.fetch().catch(err => {
                console.error('Error fetching members list:', err);
                throw new Error('Unable to get server member list');
            });

            let assignedCount = 0;
            let skippedCount = 0;
            let failedCount = 0;
            const failedUsers = [];

            // Loop through all members / Lặp qua tất cả members
            for (const member of members.values()) {
                // Skip bots / Bỏ qua bot
                if (member.user.bot) {
                    skippedCount++;
                    continue;
                }

                try {
                    // Check if user already exists in database / Kiểm tra xem user đã có trong database chưa
                    let userData = await UserData.findOne({ userId: member.id });

                    if (userData) {
                        // If already has dataId, skip / Nếu đã có dataId, bỏ qua
                        if (userData.dataId) {
                            skippedCount++;
                            continue;
                        }
                    } else {
                        // Create new user with dataId / Tạo user mới với dataId
                        const dataId = await generateDataId();
                        userData = new UserData({
                            userId: member.id,
                            username: member.user.tag,
                            dataId
                        });
                        await userData.save();
                        console.log(`Created dataId ${dataId} for ${member.user.tag}`);
                        assignedCount++;
                    }
                } catch (error) {
                    console.error(`Error processing user ${member.user.tag}:`, error);
                    failedCount++;
                    failedUsers.push(member.user.tag);
                }
            }

            // Create response embed / Tạo embed phản hồi
            const embed = new EmbedBuilder()
                .setTitle('Data ID Assignment Results')
                .setDescription('Completed assigning dataId to users in server.')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Assigned', value: `${assignedCount} users`, inline: true },
                    { name: 'Skipped', value: `${skippedCount} users (bots or already have dataId)`, inline: true },
                    { name: 'Failed', value: `${failedCount} users`, inline: true }
                )
                .setTimestamp();

            // If there are failed users, add details / Nếu có user thất bại, thêm chi tiết
            if (failedCount > 0) {
                embed.addFields({
                    name: 'Failed Users',
                    value: failedUsers.join(', ') || 'No details',
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in assignall command:', error);
            const errorEmbed = new EmbedBuilder()
                .setDescription('An error occurred while assigning dataId!')
                .setColor('#FF0000');
            await interaction.editReply({ embeds: [errorEmbed], flags: InteractionResponseFlags.Ephemeral });
        }
    }
};