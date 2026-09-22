const { EmbedBuilder } = require('discord.js');
const { readData } = require('./store');

async function updateRappelsMessage(client) {
    const data = readData();
    if (!data.channelId || !data.messageId) return; // Pas encore setup

    try {
        const channel = await client.channels.fetch(data.channelId);
        if (!channel) return;

        const message = await channel.messages.fetch(data.messageId);
        if (!message) return;

        // Créer l'embed
        const embed = new EmbedBuilder()
            .setTitle('📅 Tableau des Events')
            .setColor('#2ecc71') // Vert stylé
            .setFooter({ text: 'Ajoutez un event avec /event' })
            .setTimestamp();

        const { isToday, isTomorrow, formatDate } = require('./dateParser');

        // Filtrer et trier
        const rappelsToday = [];
        const rappelsTomorrow = [];

        if (data.rappels && data.rappels.length > 0) {
            data.rappels.forEach(r => {
                if (r.status === 'validated') return; // Ignorer les terminés

                if (r.timestamp) {
                    if (isToday(r.timestamp)) {
                        rappelsToday.push(r);
                    } else if (isTomorrow(r.timestamp)) {
                        rappelsTomorrow.push(r);
                    }
                } else if (r.date) {
                    // Compatibilité avec les anciens rappels qui n'ont pas de timestamp
                    // On les affiche par défaut aujourd'hui pour ne pas les perdre
                    rappelsToday.push(r);
                }
            });
        }

        // Helper pour trier par heure (gère 21h30, 21:30, 21h)
        const parseHeure = (heureStr) => {
            const match = heureStr.match(/(\d{1,2})[hH:]?(\d{2})?/);
            if (match) {
                const h = parseInt(match[1], 10);
                const m = match[2] ? parseInt(match[2], 10) : 0;
                return h * 60 + m;
            }
            return 9999;
        };

        rappelsToday.sort((a, b) => parseHeure(a.heure) - parseHeure(b.heure));
        rappelsTomorrow.sort((a, b) => parseHeure(a.heure) - parseHeure(b.heure));

        if (rappelsToday.length > 0) {
            let fieldValue = '';
            rappelsToday.forEach(r => {
                let authorText = `**${r.authorName}**`;
                if (r.participants && r.participants.length > 0) {
                    authorText += ` (+ ${r.participants.length})`;
                }
                fieldValue += `> **[ ${r.channelName.toUpperCase()} ]** ➖ **${r.heure}** ➖ ${authorText}\n`;
            });
            embed.addFields({ name: '🔴 AUJOURD\'HUI', value: fieldValue, inline: false });
        }

        if (rappelsTomorrow.length > 0) {
            let fieldValue = '';
            rappelsTomorrow.forEach(r => {
                let authorText = `**${r.authorName}**`;
                if (r.participants && r.participants.length > 0) {
                    authorText += ` (+ ${r.participants.length})`;
                }
                fieldValue += `> **[ ${r.channelName.toUpperCase()} ]** ➖ **${r.heure}** ➖ ${authorText}\n`;
            });
            embed.addFields({ name: '🔵 DEMAIN', value: fieldValue, inline: false });
        }

        if (rappelsToday.length === 0 && rappelsTomorrow.length === 0) {
            embed.addFields({ name: 'Aucun event', value: 'Il n\'y a aucun event pour aujourd\'hui ni demain.', inline: false });
        }

        // Mettre à jour le message
        await message.edit({ embeds: [embed] });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du message de rappels:", error);
    }
}

module.exports = { updateRappelsMessage };
