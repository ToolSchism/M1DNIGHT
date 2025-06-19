const { SlashCommandBuilder, EmbedBuilder, InteractionResponseFlags } = require('discord.js');
// Import schema hoặc các module cần thiết
const UserData = require('../database/userSchema');

module.exports = {
    // Định nghĩa metadata của lệnh
    data: new SlashCommandBuilder()
        .setName('help') // Tên lệnh
        .setDescription('Mô tả lệnh'), // Mô tả ngắn gọn

    // Hàm xử lý lệnh
    async execute(interaction) {
        try {
            // Logic xử lý lệnh

            // Tạo embed để trả lời
            const embed = new EmbedBuilder()
                .setTitle('Tổng Hợp List Lệnh')
                .setDescription("`/menu`: Xem tổng lệnh\n`/profile [user] [id]`: Xem thông tin của mình hoặc người khác\n`/assignall`: Gán DataID cho toàn bộ member (**CẤM CHẠY**)\n`/forceassign`: Bắt buộc gán DataID cho member (**CẤM CHẠY**)\n`/genrandom`: Random toàn bộ dữ liệu\n`/backup`: Xuất file .txt database (**CHẠY CUỐI TUẦN**)\n`/debuginfo`: Xuất số lượng member có DataID/ không có DataID ")
                .setColor('#121416') // Màu embed
                

            // Trả lời interaction
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            // Xử lý lỗi
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setDescription('Đã có lỗi xảy ra!')
                .setColor('#FF0000');
            await interaction.reply({ embeds: [errorEmbed], flags: InteractionResponseFlags.Ephemeral });
        }
    },
};