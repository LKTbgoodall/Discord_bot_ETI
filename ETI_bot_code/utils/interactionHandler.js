const { readData, writeData } = require('./store');
const { updateRappelsMessage } = require('./updateMessage');
const { parseDateInput, formatDate } = require('./dateParser');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

async function handleInteraction(interaction) {
    if (interaction.isButton()) {
        const [action, eventId] = interaction.customId.split('_');
        const data = readData();
        const eventIndex = data.rappels.findIndex(r => r.id === eventId);

        if (eventIndex === -1) {
            return interaction.reply({ content: 'Cet event n\'existe plus.', ephemeral: true });
        }

        const event = data.rappels[eventIndex];

        if (action === 'valider') {
            event.status = 'validated';
            writeData(data);
            
            // Griser le message dans le salon de gestion
            const embed = EmbedBuilder.from(interaction.message.embeds[0]);
            embed.setColor('#808080'); // Gris
            embed.setTitle(`**${event.channelName.toUpperCase()}**`);
            
            await interaction.update({ embeds: [embed], components: [] });
            await updateRappelsMessage(interaction.client);
        }
        else if (action === 'supprimer') {
            data.rappels.splice(eventIndex, 1);
            writeData(data);
            
            await interaction.message.delete();
            await interaction.reply({ content: 'L\'event a été supprimé avec succès.', ephemeral: true });
            await updateRappelsMessage(interaction.client);
        }
        else if (action === 'editer') {
            const modal = new ModalBuilder()
                .setCustomId(`modalEditer_${eventId}`)
                .setTitle('Modifier l\'Event');

            const dateInput = new TextInputBuilder()
                .setCustomId('newDate')
                .setLabel("Nouvelle Date (ex: Demain, 24/10)")
                .setStyle(TextInputStyle.Short)
                .setValue(event.dateString || '')
                .setRequired(true);

            const heureInput = new TextInputBuilder()
                .setCustomId('newHeure')
                .setLabel("Nouvelle Heure (ex: 21h30)")
                .setStyle(TextInputStyle.Short)
                .setValue(event.heure || '')
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(dateInput),
                new ActionRowBuilder().addComponents(heureInput)
            );

            await interaction.showModal(modal);
        }
    }
    else if (interaction.isUserSelectMenu()) {
        const [action, eventId] = interaction.customId.split('_');
        if (action === 'participants') {
            const data = readData();
            const eventIndex = data.rappels.findIndex(r => r.id === eventId);

            if (eventIndex === -1) {
                return interaction.reply({ content: 'Cet event n\'existe plus.', ephemeral: true });
            }

            const event = data.rappels[eventIndex];
            event.participants = interaction.values; // Liste des IDs d'utilisateurs
            writeData(data);

            // Mettre à jour l'embed du message
            const embed = EmbedBuilder.from(interaction.message.embeds[0]);
            const participantsText = `<@${event.authorId}>` + (event.participants.length > 0 
                ? ', ' + event.participants.map(id => `<@${id}>`).join(', ') 
                : '');
            
            // Trouver le bon champ et le mettre à jour
            const fieldIndex = embed.data.fields.findIndex(f => f.name === 'Participants');
            if (fieldIndex !== -1) {
                embed.data.fields[fieldIndex].value = participantsText;
            }

            await interaction.update({ embeds: [embed] });
            await updateRappelsMessage(interaction.client);
        }
    }
    else if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modalEditer_')) {
            const eventId = interaction.customId.split('_')[1];
            const data = readData();
            const eventIndex = data.rappels.findIndex(r => r.id === eventId);

            if (eventIndex === -1) {
                return interaction.reply({ content: 'Cet event n\'existe plus.', ephemeral: true });
            }

            const newDate = interaction.fields.getTextInputValue('newDate');
            const newHeure = interaction.fields.getTextInputValue('newHeure');

            const timestamp = parseDateInput(newDate);
            if (!timestamp) {
                return interaction.reply({ content: 'Format de date invalide. Modification annulée.', ephemeral: true });
            }

            const event = data.rappels[eventIndex];
            event.timestamp = timestamp;
            event.dateString = newDate;
            event.heure = newHeure;
            
            writeData(data);

            // Mettre à jour l'embed de gestion
            const embed = EmbedBuilder.from(interaction.message.embeds[0]);
            const dateFieldIndex = embed.data.fields.findIndex(f => f.name.startsWith('Date'));
            const heureFieldIndex = embed.data.fields.findIndex(f => f.name.startsWith('Heure'));
            
            if (dateFieldIndex !== -1) embed.data.fields[dateFieldIndex].value = formatDate(timestamp);
            if (heureFieldIndex !== -1) embed.data.fields[heureFieldIndex].value = newHeure;

            await interaction.update({ embeds: [embed] });
            await updateRappelsMessage(interaction.client);
        }
    }
}

module.exports = { handleInteraction };
