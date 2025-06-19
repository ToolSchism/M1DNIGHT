const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const UserData = require('../database/userSchema');
const ExcelJS = require('exceljs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export')
        .setDescription('Export all user data to Excel file (admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Defer response as file export may take time
        await interaction.deferReply({ ephemeral: true });

        try {
            // Get all documents from UserData collection
            const users = await UserData.find({}).lean();

            if (users.length === 0) {
                const embed = new EmbedBuilder()
                    .setDescription('No data to export!')
                    .setColor('#FF0000');
                return await interaction.editReply({ embeds: [embed], ephemeral: true });
            }

            // Create workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'YourBot';
            workbook.created = new Date();
            const worksheet = workbook.addWorksheet('UserData');

            // Define columns
            worksheet.columns = [
                { header: 'UserID', key: 'userId', width: 20 },
                { header: 'Username', key: 'username', width: 30 },
                { header: 'DataID', key: 'dataId', width: 15 }
            ];

            // Add data to worksheet
            users.forEach(user => {
                worksheet.addRow({
                    userId: user.userId,
                    username: user.username,
                    dataId: user.dataId
                });
            });

            // Format header
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            // Save Excel file to buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Create attachment
            const attachment = new AttachmentBuilder(buffer, { name: `UserData_${new Date().toISOString().split('T')[0]}.xlsx` });

            // Create notification embed
            const embed = new EmbedBuilder()
                .setDescription('✅ User data has been exported successfully!')
                .setColor('#121416');

            // Send file and embed
            await interaction.editReply({ embeds: [embed], files: [attachment], ephemeral: true });
        } catch (error) {
            console.error('Error exporting Excel file:', error);
            const embed = new EmbedBuilder()
                .setDescription('❌ Error exporting data. Please try again later!')
                .setColor('#FF0000');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
};