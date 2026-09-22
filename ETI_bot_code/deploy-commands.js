const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] La commande au chemin ${filePath} n'a pas les propriétés requises "data" ou "execute".`);
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Début du rafraîchissement de ${commands.length} commandes d'application (/)`);

        let data;
        // Si GUILD_ID est fourni, on enregistre les commandes sur le serveur (plus rapide)
        // Sinon, on enregistre globalement (peut prendre jusqu'à 1 heure)
        if (process.env.GUILD_ID) {
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`Rechargement réussi de ${data.length} commandes d'application (/) pour le serveur de test.`);
        } else {
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`Rechargement réussi de ${data.length} commandes d'application (/) globales.`);
        }
    } catch (error) {
        console.error(error);
    }
})();
