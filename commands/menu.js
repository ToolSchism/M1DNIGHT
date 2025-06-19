const { SlashCommandBuilder, EmbedBuilder, InteractionResponseFlags } = require('discord.js');
// Import schema or necessary modules
const UserData = require('../database/userSchema');

module.exports = {
    // Define command metadata
    data: new SlashCommandBuilder()
        .setName('help') // Command name
        .setDescription('Display command information'), // Brief description

    // Command execution function
    async execute(interaction) {
        try {
            // Command processing logic

            // Create embed for response
            const embed = new EmbedBuilder()
                .setTitle('Command List Summary')
                .setDescription("`/menu`: View all commands\n`/profile [user] [id]`: View your information or someone else's\n`/assignall`: Assign DataID to all members (**DO NOT RUN**)\n`/forceassign`: Force assign DataID to members (**DO NOT RUN**)\n`/genrandom`: Random select from all data\n`/backup`: Export database .txt file (**RUN ON WEEKENDS**)\n`/debuginfo`: Export count of members with/without DataID ")
                .setColor('#121416') // Embed color
                

            // Reply to interaction
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            // Error handling
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setDescription('An error occurred!')
                .setColor('#FF0000');
            await interaction.reply({ embeds: [errorEmbed], flags: InteractionResponseFlags.Ephemeral });
        }
    },
};