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
    name: 'compare',
    description: 'Compares the vouches of two users (total, accepted, imported).',
    async execute(message) {
        const vouchesDB = loadDatabase();
        const importedDB = loadImportedDatabase();

        const getVouchesCount = (userId, db) => {
            return db[userId] || 0;
        };

        const args = message.content.split(' ').slice(1); // Get the arguments after the command
        const user1 = message.mentions.users.first() || message.client.users.cache.get(args[0]);
        const user2 = message.mentions.users.last() || message.client.users.cache.get(args[1]);

        if (!user1 || !user2) {
            return message.reply("⚠️ Please mention or provide the IDs of two users to compare.");
        }

        // Ensure both users are distinct
        if (user1.id === user2.id) {
            return message.reply("⚠️ You can't compare the same user to themselves. Please mention two different users.");
        }

        let user1Accepted = 0;
        let user1Imported = 0;

        for (const vouch of vouchesDB) {
            if (vouch.recipientId === user1.id && vouch.status === 'accepted') {
                user1Accepted++;
            }
        }

        user1Imported = getVouchesCount(user1.id, importedDB);

        let user2Accepted = 0;
        let user2Imported = 0;

        for (const vouch of vouchesDB) {
            if (vouch.recipientId === user2.id && vouch.status === 'accepted') {
                user2Accepted++;
            }
        }

        user2Imported = getVouchesCount(user2.id, importedDB);

        const user1TotalVouches = user1Accepted + user1Imported;
        const user2TotalVouches = user2Accepted + user2Imported;
        const conclusion = user1TotalVouches > user2TotalVouches
            ? `**${user1.tag}** has more vouches than **${user2.tag}**.`
            : user1TotalVouches < user2TotalVouches
                ? `**${user2.tag}** has more vouches than **${user1.tag}**.`
                : `**${user1.tag}** and **${user2.tag}** have an equal number of vouches.`;

        const compareEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Vouch Comparison')
            .setDescription(
                `**Overall Vouches Comparison**\n\n` +
                `**${user1.tag}**\n` +
                `🟢 **Accepted:** \`${user1Accepted}\`\n` +
                `🟡 **Imported:** \`${user1Imported}\`\n\n` +
                `**${user2.tag}**\n` +
                `🟢 **Accepted:** \`${user2Accepted}\`\n` +
                `🟡 **Imported:** \`${user2Imported}\`\n\n` +
                `**Conclusion:**\n` +
                `${conclusion}`
            )
            .setFooter({ 
                text: `Requested by ${message.author.tag}`,
                iconURL: message.client.user.displayAvatarURL() 
            });

        message.reply({ embeds: [compareEmbed] });
    },
};
