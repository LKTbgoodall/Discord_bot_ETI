const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { writeData, readData } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_gestion')
        .setDescription('Définit ce salon comme le panneau de gestion des events.'),
    async execute(interaction) {
        const data = readData();
        data.gestionChannelId = interaction.channelId;
        writeData(data);

        await interaction.reply({ content: '✅ Ce salon a été défini comme le panneau de gestion des events.', ephemeral: true });
    },
};
