const { SlashCommandBuilder } = require('discord.js');
const { readData, writeData } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear_scan')
        .setDescription('Supprime tous les groupes (factions) enregistrés par la commande /scan.'),
    async execute(interaction) {
        const data = readData();

        if (!data.groupes || data.groupes.length === 0) {
            return interaction.reply({ content: 'Il n\'y a aucun groupe enregistré actuellement.', ephemeral: true });
        }

        const count = data.groupes.length;
        data.groupes = [];
        writeData(data);

        await interaction.reply({ content: `✅ ${count} groupe(s) supprimé(s) avec succès de la mémoire.`, ephemeral: true });
    },
};
