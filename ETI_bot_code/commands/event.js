const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { writeData, readData } = require('../utils/store');
const { updateRappelsMessage } = require('../utils/updateMessage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Ajoute un event sur le tableau centralisé.')
        .addStringOption(option =>
            option.setName('date')
                .setDescription('La date de l\'event (ex: "Aujourd\'hui", "Demain", "24/10")')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('heure')
                .setDescription('L\'heure de l\'event (ex: "21h30", "14:00")')
                .setRequired(true)),
    async execute(interaction) {
        const dateInput = interaction.options.getString('date');
        const heure = interaction.options.getString('heure');
        
        const { parseDateInput, formatDate } = require('../utils/dateParser');
        const timestamp = parseDateInput(dateInput);

        if (!timestamp) {
            return interaction.reply({ content: 'Format de date invalide. Essayez "Aujourd\'hui", "Demain", ou "JJ/MM" (ex: "21/10").', ephemeral: true });
        }
        
        const channelName = interaction.channel.name;
        const authorName = interaction.user.displayName || interaction.user.username;

        const data = readData();

        if (!data.channelId || !data.messageId) {
            return interaction.reply({ content: 'Le tableau des rappels n\'a pas encore été configuré. Un administrateur doit utiliser `/setup_rappels` en premier.', ephemeral: true });
        }

        const eventId = Date.now().toString();

        const newRappel = {
            id: eventId,
            timestamp: timestamp, // On sauvegarde le timestamp pour le tri et le filtre
            dateString: dateInput, // La chaine d'origine au cas où
            heure: heure,
            channelName: channelName,
            channelId: interaction.channelId,
            authorName: authorName,
            authorId: interaction.user.id,
            participants: [],
            status: 'active'
        };

        if (!data.rappels) data.rappels = [];
        data.rappels.push(newRappel);

        writeData(data);

        // Envoyer le bloc dans le salon de gestion
        if (data.gestionChannelId) {
            try {
                const gestionChannel = await interaction.client.channels.fetch(data.gestionChannelId);
                if (gestionChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle(`**${channelName.toUpperCase()}**`)
                        .setColor('#e67e22')
                        .addFields(
                            { name: 'Date\u2800\u2800\u2800\u2800', value: formatDate(timestamp), inline: true },
                            { name: 'Heure\u2800\u2800\u2800\u2800', value: heure, inline: true },
                            { name: 'Participants', value: `<@${interaction.user.id}>`, inline: true }
                        );

                    const buttonsRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`valider_${eventId}`)
                                .setLabel('Valider')
                                .setEmoji('✅')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(`editer_${eventId}`)
                                .setLabel('Éditer')
                                .setEmoji('✏️')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(`supprimer_${eventId}`)
                                .setLabel('Supprimer')
                                .setEmoji('🗑️')
                                .setStyle(ButtonStyle.Danger)
                        );

                    const selectMenuRow = new ActionRowBuilder()
                        .addComponents(
                            new UserSelectMenuBuilder()
                                .setCustomId(`participants_${eventId}`)
                                .setPlaceholder('Ajouter des participants')
                                .setMinValues(0)
                                .setMaxValues(10)
                        );

                    const gestionMsg = await gestionChannel.send({ embeds: [embed], components: [buttonsRow, selectMenuRow] });
                    
                    // On sauvegarde l'id du message pour pouvoir l'éditer plus tard
                    const eventIndex = data.rappels.findIndex(r => r.id === eventId);
                    if (eventIndex !== -1) {
                        data.rappels[eventIndex].gestionMessageId = gestionMsg.id;
                        writeData(data);
                    }
                }
            } catch (err) {
                console.error("Erreur lors de l'envoi au salon de gestion:", err);
            }
        }

        // Mettre à jour le message
        await updateRappelsMessage(interaction.client);

        await interaction.reply({ content: `✅ Votre event pour le **${formatDate(timestamp)}** à **${heure}** a bien été ajouté au tableau !`, ephemeral: true });
    },
};
