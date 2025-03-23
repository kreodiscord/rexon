const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../database/tokens.json');
function loadDatabase() {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify({}, null, 2), 'utf8');
        }
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (error) {
        console.error('Error loading database:', error);
        return {};
    }
}

module.exports = {
    name: 'gettoken',
    description: 'Get details about a token.',
    async execute(message) {
        if (!['1219880124351119373', '1307136740904927312'].includes(message.author.id)) {
    return message.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription('⚠️ Only the developer can use this command.')
        ]
    });
}
        const args = message.content.split(' ');
        const token = args[1];

        if (!token) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a token.')
                ]
            });
        }

        const tokensDB = loadDatabase();
        let tokenData = null;

        for (const [userId, data] of Object.entries(tokensDB)) {
            if (data.token === token) {
                tokenData = data;
                break;
            }
        }

        if (!tokenData) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Token not found or invalid.')
                ]
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Profile Recovery Token Details')
            .setColor('Blurple')
            .addFields(
                { name: 'Token', value: token, inline: true },
                { name: 'User ID', value: tokenData.authorId, inline: true },
                { name: 'Username', value: tokenData.authorUsername, inline: true },
                { name: 'Created At', value: new Date(tokenData.createdAt).toLocaleString(), inline: true }
            )
        return message.reply({ embeds: [embed] });
    }
};