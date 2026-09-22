const SUPER_USER_ID = '727770618090487808';
const ROLE_USER_ID = '1360409289382166699';
const ROLE_ADMIN_ID = '1327007554659946527';
const ADMIN_COMMANDS = ['clear', 'scan', 'setup_gestion', 'setup_rappels', 'clear_scan'];

async function checkPermissions(interaction, commandName = null) {
    if (interaction.user.id === SUPER_USER_ID) return true;

    const member = interaction.member;
    if (!member) return false; // Pas dans un serveur

    const highestPosition = member.roles.highest.position;
    const guild = interaction.guild;
    
    const userRole = guild.roles.cache.get(ROLE_USER_ID);
    const adminRole = guild.roles.cache.get(ROLE_ADMIN_ID);

    const isAdminCommand = commandName ? ADMIN_COMMANDS.includes(commandName) : false;

    if (isAdminCommand) {
        if (!adminRole) {
            console.warn(`Role Admin (${ROLE_ADMIN_ID}) introuvable.`);
            return false;
        }
        return highestPosition >= adminRole.position;
    } else {
        if (!userRole) {
            console.warn(`Role User (${ROLE_USER_ID}) introuvable.`);
            return false;
        }
        return highestPosition >= userRole.position;
    }
}

module.exports = { checkPermissions };
