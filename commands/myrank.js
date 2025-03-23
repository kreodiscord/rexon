const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/vouches.json');
const importedDbPath = path.join(__dirname, '../database/imported.json');

function loadDatabase() {
    if (fs.existsSync(dbPath)) {
        try {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading database:', error);
            return [];
        }
    }
    return [];
}

function loadImportedDatabase() {
    if (fs.existsSync(importedDbPath)) {
        try {
            return JSON.parse(fs.readFileSync(importedDbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading imported database:', error);
            return [];
        }
    }
    return [];
}

module.exports = {
    name: 'myrank',
    description: 'Shows your rank based on accepted vouches.',
    async execute(message) {
        const vouchesDB = loadDatabase();
        const importedDB = loadImportedDatabase();

        const userVouches = {};

       
        for (const vouch of vouchesDB) {
            if (vouch.status === 'accepted') {
                userVouches[vouch.recipientId] = (userVouches[vouch.recipientId] || 0) + 1;
            }
        }

       
        for (const [userId, count] of Object.entries(importedDB)) {
            userVouches[userId] = (userVouches[userId] || 0) + count;
        }

       
        const sortedUsers = Object.entries(userVouches)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a);

     
        const authorId = message.author.id;
        const rank = sortedUsers.findIndex(([userId]) => userId === authorId) + 1;
        const authorVouches = userVouches[authorId] || 0;

        const embed = new EmbedBuilder();

        if (rank > 0) {
            embed
                .setColor(0x5865F2)
                .setTitle('Your Rank')
                .setDescription(
                    `👤 **User:** \`${message.author.tag}\`\n` +
                    `🏆 **Rank:** \`${rank}\`\n` +
                    `📊 **Accepted Vouches:** \`${authorVouches}\``
                )
                .setFooter({ text: 'Rank based on vouches.' });
        } else {
            embed
                .setColor(0xff0000)
               
                .setDescription('You are not ranked yet. Start collecting vouches to climb the leaderboard!')
               
        }

        message.reply({ embeds: [embed] });
    },
};
