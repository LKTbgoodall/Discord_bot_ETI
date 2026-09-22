const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { writeData, readData } = require('../utils/store');
const { updateRappelsMessage } = require('../utils/updateMessage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime TOUS les rappels du tableau.'),
    async execute(interaction) {
        const data = readData();

        if (!data.channelId || !data.messageId) {
            return interaction.reply({ content: 'Le tableau des rappels n\'a pas encore été configuré.', ephemeral: true });
        }

        // Vider la liste des rappels
        data.rappels = [];
        writeData(data);

        // Mettre à jour le message
        await updateRappelsMessage(interaction.client);

        await interaction.reply({ content: '✅ Tous les events ont été supprimés avec succès.', ephemeral: true });
    },
};
