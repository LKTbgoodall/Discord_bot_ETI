const cron = require('node-cron');
const { updateRappelsMessage } = require('./updateMessage');

function startScheduler(client) {
    // S'exécute tous les jours à 00:00:01
    cron.schedule('1 0 0 * * *', async () => {
        console.log("Exécution de la tâche planifiée: Mise à jour du tableau des rappels...");
        await updateRappelsMessage(client);
    }, {
        scheduled: true,
        timezone: "Europe/Paris"
    });
    
    console.log("Scheduler initialisé: Le tableau sera actualisé tous les jours à minuit.");
}

module.exports = { startScheduler };
