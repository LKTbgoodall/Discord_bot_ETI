const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readData } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('groupes')
        .setDescription('Affiche la liste des groupes (catégories) scannés.')
        .addStringOption(option =>
            option.setName('mois')
                .setDescription('Le mois à afficher (ex: "janvier")')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('annee')
                .setDescription('L\'année (ex: "2026")')
                .setRequired(false)),
    async execute(interaction) {
        const data = readData();

        if (!data.groupes || data.groupes.length === 0) {
            return interaction.reply({ content: 'Aucun groupe n\'a été scanné pour le moment. Utilisez `/scan` dans un salon.', ephemeral: true });
        }

        let mois = interaction.options.getString('mois');
        let annee = interaction.options.getString('annee');
        const now = new Date();
        
        if (!mois) {
            mois = now.toLocaleDateString('fr-FR', { month: 'long' });
        }
        if (!annee) {
            annee = now.getFullYear().toString();
        }

        const embed = new EmbedBuilder()
            .setTitle(`📁 Event de ${mois} ${annee}`)
            .setColor('#3498db')
            .setTimestamp();

        for (const groupe of data.groupes) {
            let channelList = '';
            groupe.channels.forEach(ch => {
                // Compter le nombre d'events pour ce salon dans ce mois et cette année
                const eventCount = data.rappels.filter(r => {
                    if (r.channelName !== ch) return false;
                    const eventDate = new Date(r.timestamp);
                    const eventMois = eventDate.toLocaleDateString('fr-FR', { month: 'long' }).toLowerCase();
                    const eventAnnee = eventDate.getFullYear().toString();
                    return eventMois === mois.toLowerCase() && eventAnnee === annee;
                }).length;

                const symbol = eventCount > 0 ? '✅'.repeat(eventCount) : '❌';
                const line = `- ${symbol} **${ch.toUpperCase()}**\n`;
                if ((channelList + line).length < 1000) {
                    channelList += line;
                }
            });

            if (channelList === '') {
                channelList = '*Aucun autre salon*';
            }

            embed.addFields({ name: groupe.categoryName, value: channelList, inline: false });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
