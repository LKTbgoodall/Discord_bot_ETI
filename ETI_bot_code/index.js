const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] La commande au chemin ${filePath} n'a pas les propriétés requises "data" ou "execute".`);
    }
}

const { startScheduler } = require('./utils/scheduler');

client.once(Events.ClientReady, readyClient => {
    console.log(`Prêt ! Connecté en tant que ${readyClient.user.tag}`);
    // Démarrer la tâche planifiée
    startScheduler(readyClient);
});

const { checkPermissions } = require('./utils/permissions');

client.on(Events.InteractionCreate, async interaction => {
    // Si c'est un composant (Bouton, SelectMenu) ou une Modal
    if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
        const hasPerm = await checkPermissions(interaction); // Boutons = niveau utilisateur
        if (!hasPerm) {
            return interaction.reply({ content: '🚫 Vous n\'avez pas la permission d\'interagir avec ceci.', ephemeral: true });
        }

        const { handleInteraction } = require('./utils/interactionHandler');
        try {
            await handleInteraction(interaction);
        } catch (error) {
            console.error(error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'interaction.', ephemeral: true });
            }
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const hasPerm = await checkPermissions(interaction, interaction.commandName);
    if (!hasPerm) {
        return interaction.reply({ content: '🚫 Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Aucune commande ne correspond à ${interaction.commandName}.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Il y a eu une erreur lors de l\'exécution de cette commande !', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Il y a eu une erreur lors de l\'exécution de cette commande !', ephemeral: true });
            }
        } catch (e) {
            console.error('Impossible de répondre à l\'interaction après une erreur:', e);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
