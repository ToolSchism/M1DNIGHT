const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder, InteractionContextType } = require('discord.js');
const UserData = require('../database/userSchema');
const ExcelJS = require('exceljs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export')
        .setDescription('Export all user data to Excel file (admin only)') // Xuất toàn bộ dữ liệu người dùng thành file Excel (chỉ admin)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts([InteractionContextType.Guild]), // Cannot be used in DM / Không dùng trong DM
    async execute(interaction) {
        // Defer response as file export may take time / Defer phản hồi vì quá trình xuất file có thể mất thời gian
        await interaction.deferReply({ ephemeral: true });

        try {
            // Get all documents from UserData collection / Lấy tất cả document từ collection UserData
            const users = await UserData.find({}).lean();

            if (users.length === 0) {
                const embed = new EmbedBuilder()
                    .setDescription('No data to export!') // Không có dữ liệu để xuất!
                    .setColor('#FF0000');
                return await interaction.editReply({ embeds: [embed], ephemeral: true });
            }

            // Create workbook and worksheet / Tạo workbook và worksheet
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'YourBot';
            workbook.created = new Date();
            const worksheet = workbook.addWorksheet('UserData');

            // Define columns / Định nghĩa cột
            worksheet.columns = [
                { header: 'UserID', key: 'userId', width: 20 },
                { header: 'Username', key: 'username', width: 30 },
                { header: 'DataID', key: 'dataId', width: 15 }
            ];

            // Add data to worksheet / Thêm dữ liệu vào worksheet
            users.forEach(user => {
                worksheet.addRow({
                    userId: user.userId,
                    username: user.username,
                    dataId: user.dataId
                });
            });

            // Format header / Định dạng header
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            // Save Excel file to buffer / Lưu file Excel vào buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Create attachment / Tạo attachment
            const attachment = new AttachmentBuilder(buffer, { name: `UserData_${new Date().toISOString().split('T')[0]}.xlsx` });

            // Create notification embed / Tạo embed thông báo
            const embed = new EmbedBuilder()
                .setDescription('✅ User data has been exported successfully!') // Dữ liệu người dùng đã được xuất thành công!
                .setColor('#121416');

            // Send file and embed / Gửi file và embed
            await interaction.editReply({ embeds: [embed], files: [attachment], ephemeral: true });
        } catch (error) {
            console.error('Error exporting Excel file:', error); // Lỗi khi xuất file Excel
            const embed = new EmbedBuilder()
                .setDescription('❌ Error exporting data. Please try again later!') // Lỗi khi xuất dữ liệu. Vui lòng thử lại sau!
                .setColor('#FF0000');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
};