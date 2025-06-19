const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const UserData = require('../database/userSchema');
const ExcelJS = require('exceljs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export')
        .setDescription('Xuất toàn bộ dữ liệu người dùng thành file Excel (chỉ admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Defer phản hồi vì quá trình xuất file có thể mất thời gian
        await interaction.deferReply({ ephemeral: true });

        try {
            // Lấy tất cả document từ collection UserData
            const users = await UserData.find({}).lean();

            if (users.length === 0) {
                const embed = new EmbedBuilder()
                    .setDescription('Không có dữ liệu để xuất!')
                    .setColor('#FF0000');
                return await interaction.editReply({ embeds: [embed], ephemeral: true });
            }

            // Tạo workbook và worksheet
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'YourBot';
            workbook.created = new Date();
            const worksheet = workbook.addWorksheet('UserData');

            // Định nghĩa cột
            worksheet.columns = [
                { header: 'UserID', key: 'userId', width: 20 },
                { header: 'Username', key: 'username', width: 30 },
                { header: 'DataID', key: 'dataId', width: 15 }
            ];

            // Thêm dữ liệu vào worksheet
            users.forEach(user => {
                worksheet.addRow({
                    userId: user.userId,
                    username: user.username,
                    dataId: user.dataId
                });
            });

            // Định dạng header
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            // Lưu file Excel vào buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Tạo attachment
            const attachment = new AttachmentBuilder(buffer, { name: `UserData_${new Date().toISOString().split('T')[0]}.xlsx` });

            // Tạo embed thông báo
            const embed = new EmbedBuilder()
                .setDescription('✅ Dữ liệu người dùng đã được xuất thành công!')
                .setColor('#121416');

            // Gửi file và embed
            await interaction.editReply({ embeds: [embed], files: [attachment], ephemeral: true });
        } catch (error) {
            console.error('Lỗi khi xuất file Excel:', error);
            const embed = new EmbedBuilder()
                .setDescription('❌ Lỗi khi xuất dữ liệu. Vui lòng thử lại sau!')
                .setColor('#FF0000');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
};