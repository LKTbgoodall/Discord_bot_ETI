function parseDateInput(input) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let targetDate = new Date(today);
    
    const str = input.trim().toLowerCase();

    if (str === "aujourd'hui" || str === "aujourdhui" || str === "auj") {
        return targetDate.getTime();
    }
    
    if (str === "demain") {
        targetDate.setDate(targetDate.getDate() + 1);
        return targetDate.getTime();
    }
    
    // Format JJ/MM ou JJ/MM/AAAA
    const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?$/);
    if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Mois de 0 à 11
        let year = match[3] ? parseInt(match[3], 10) : today.getFullYear();
        
        targetDate.setFullYear(year, month, day);
        
        // Si la date (sans année) est déjà passée, on suppose que c'est pour l'année prochaine
        if (!match[3] && targetDate.getTime() < today.getTime()) {
            targetDate.setFullYear(year + 1);
        }
        
        return targetDate.getTime();
    }
    
    // Si on ne comprend pas le format, on retourne null
    return null;
}

// Vérifie si une date correspond à aujourd'hui
function isToday(timestamp) {
    const today = new Date();
    const date = new Date(timestamp);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Vérifie si une date correspond à demain
function isTomorrow(timestamp) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = new Date(timestamp);
    return date.getDate() === tomorrow.getDate() &&
           date.getMonth() === tomorrow.getMonth() &&
           date.getFullYear() === tomorrow.getFullYear();
}

// Renvoie une date formattée (ex: 24/10/2026)
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR');
}

module.exports = { parseDateInput, isToday, isTomorrow, formatDate };
