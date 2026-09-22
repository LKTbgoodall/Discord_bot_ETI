const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { writeData, readData } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scan')
        .setDescription('Enregistre tous les salons de cette catégorie (sauf celui-ci).'),
    async execute(interaction) {
        const channel = interaction.channel;

        if (!channel.parentId) {
            return interaction.reply({ content: 'Ce salon n\'appartient à aucune catégorie.', ephemeral: true });
        }

        // Récupère la catégorie
        const category = interaction.guild.channels.cache.get(channel.parentId);
        if (!category) {
            return interaction.reply({ content: 'Impossible de trouver la catégorie parente.', ephemeral: true });
        }

        // Filtre les enfants de la catégorie (salons textuels) et exclut le salon actuel
        const siblings = interaction.guild.channels.cache.filter(c => 
            c.parentId === category.id && 
            c.id !== channel.id &&
            (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildAnnouncement)
        );

        const channelNames = siblings.map(c => c.name);

        const data = readData();
        if (!data.groupes) data.groupes = [];

        // Vérifie si la catégorie existe déjà pour la mettre à jour
        const existingIndex = data.groupes.findIndex(g => g.categoryName === category.name);
        
        if (existingIndex !== -1) {
            data.groupes[existingIndex].channels = channelNames;
        } else {
            data.groupes.push({
                categoryName: category.name,
                channels: channelNames
            });
        }

        writeData(data);

        await interaction.reply({ 
            content: `✅ La catégorie **${category.name}** a été scannée avec succès. ${channelNames.length} salons enregistrés.`, 
            ephemeral: true 
        });
    },
};
