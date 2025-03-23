const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const importedPath = path.join(__dirname, '../database/imported.json');
const vouchesPath = path.join(__dirname, '../database/vouches.json');

function loadDatabase(filePath, defaultValue = {}) {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            return defaultValue;
        }
    }
    return defaultValue;
}

module.exports = {
    name: 'recoverimported',
    description: 'Lists users who have imported vouches.',
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

        const importedData = loadDatabase(importedPath, {});
        const vouchesData = loadDatabase(vouchesPath, []);

        if (Object.keys(importedData).length === 0 && vouchesData.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ No imported vouches or vouches found in the database.')
                ],
            });
        }

        // Store total vouch count for each user
        const userVouches = {};

        // Process imported vouches
        for (const [userId, importedVouches] of Object.entries(importedData)) {
            if (!userVouches[userId]) userVouches[userId] = { imported: 0, total: 0 };
            userVouches[userId].imported += importedVouches;
            userVouches[userId].total += importedVouches;
        }

        // Process vouches with `authorTag: imported`
        vouchesData.forEach((vouch) => {
            const recipientId = vouch.recipientId;
            if (vouch.authorTag === 'imported') {
                if (!userVouches[recipientId]) {
                    userVouches[recipientId] = { imported: 0, total: 0 };
                }
                userVouches[recipientId].imported += 1;
                userVouches[recipientId].total += 1;
            }
        });

        let index = 1; // Initialize numbering
        for (const [userId, vouchCount] of Object.entries(userVouches)) {
            const user = await message.client.users.fetch(userId).catch(() => null);
            const username = user ? user.username : 'Unknown User';

            await message.channel.send(`${index}. ${username} (${userId}) - ${vouchCount.total} Vouches.`);
            index++; // Increment numbering
        }

        return message.reply({ content: '✅ Finished listing imported vouches.' });
    },
};
