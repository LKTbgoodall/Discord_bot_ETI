const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'store.json');

function readData() {
    if (!fs.existsSync(dataPath)) {
        return { channelId: null, messageId: null, gestionChannelId: null, rappels: [], groupes: [] };
    }
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
}

function writeData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
    readData,
    writeData
};
