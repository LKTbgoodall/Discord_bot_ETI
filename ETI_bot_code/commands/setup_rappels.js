const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { writeData, readData } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_rappels')
        .setDescription('Initialise le tableau des rappels dans ce salon.'),
    async execute(interaction) {
        // Optionnel: dire qu'on s'en occupe
        await interaction.deferReply({ ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('📅 Tableau des Rappels')
            .setColor('#2ecc71')
            .addFields({ name: 'Aucun event', value: 'Il n\'y a aucun event pour le moment.', inline: false })
            .setFooter({ text: 'Ajoutez un event avec /event' })
            .setTimestamp();

        // Envoyer le message dans le salon courant
        const message = await interaction.channel.send({ embeds: [embed] });

        // Sauvegarder dans le state
        const data = readData();
        data.channelId = interaction.channelId;
        data.messageId = message.id;
        // On garde les rappels existants s'il y en a (si on redéplace le message)
        if (!data.rappels) data.rappels = [];
        
        writeData(data);

        await interaction.editReply('Le tableau des rappels a bien été initialisé dans ce salon !');
    },
};
