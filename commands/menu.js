const { SlashCommandBuilder, EmbedBuilder, InteractionResponseFlags, InteractionContextType } = require('discord.js');
// Import schema or necessary modules / Import schema hoặc các module cần thiết
const UserData = require('../database/userSchema');

module.exports = {
    // Define command metadata / Định nghĩa metadata của lệnh
    data: new SlashCommandBuilder()
        .setName('help') // Command name / Tên lệnh
        .setDescription('Display command information') // Brief description / Mô tả ngắn gọn
        .setContexts([InteractionContextType.Guild]), // Cannot be used in DM / Không dùng trong DM

    // Command execution function / Hàm xử lý lệnh
    async execute(interaction) {
        try {
            // Command processing logic / Logic xử lý lệnh

            // Create embed for response / Tạo embed để trả lời
            const embed = new EmbedBuilder()
                .setTitle('Command List Summary') // Tổng Hợp List Lệnh
                .setDescription("`/help`: View all commands\n`/userinfo [user] [dataid]`: View your information or someone else's\n`/assignall`: Assign DataID to all members (**DO NOT RUN**)\n`/export`: Export database Excel file\n`/genrandom`: Random select from all data\n`/listall`: List all users with DataID\n`/manualdel`: Delete documents of users no longer in server") // Xem tất cả lệnh / Xem thông tin của mình hoặc người khác / Gán DataID cho toàn bộ member (**CẤM CHẠY**) / Xuất file Excel database / Random toàn bộ dữ liệu / Liệt kê tất cả người dùng có DataID / Xóa document của người không còn trong server
                .setColor('#121416') // Embed color / Màu embed
                

            // Reply to interaction / Trả lời interaction
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            // Error handling / Xử lý lỗi
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setDescription('An error occurred!') // Đã có lỗi xảy ra!
                .setColor('#FF0000');
            await interaction.reply({ embeds: [errorEmbed], flags: InteractionResponseFlags.Ephemeral });
        }
    },
};