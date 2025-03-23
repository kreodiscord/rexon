const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const scammersPath = path.join(__dirname, '../database/scammers.json');

function loadDatabase(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            return [];
        }
    }
    return [];
}

module.exports = {
    name: 'recoverscammers',
    description: 'Reloads the Scammers list and sends logs in the same channel.',
    async execute(message) {
        if (message.author.id !== '1219880124351119373') {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have permission to use this command.')
                ],
            });
        }

        const scammersDB = loadDatabase(scammersPath);

        if (scammersDB.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ No users found in the Scammers database.')
                ],
            });
        }

        for (const [index, entry] of scammersDB.entries()) {
            message.channel.send(`${index + 1}. ${entry.username} : ${entry.userId} (${entry.reason})`);
        }
    },
};

