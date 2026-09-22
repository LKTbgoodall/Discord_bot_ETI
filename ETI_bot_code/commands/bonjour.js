const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bonjour')
        .setDescription('Répond avec "bonjour" !'),
    async execute(interaction) {
        await interaction.reply('Bonjour !');
    },
};
