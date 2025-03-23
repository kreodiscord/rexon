const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const profileDbPath = path.join(__dirname, '../database/profile.json');

function loadDatabase() {
    if (fs.existsSync(profileDbPath)) {
        try {
            return JSON.parse(fs.readFileSync(profileDbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading database:', error);
            return {};
        }
    }
    return {};
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(profileDbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

function ensureUserProfile(profileDB, userId) {
    if (!profileDB[userId]) {
        profileDB[userId] = {
            discord: null,
            products: null,
            forum: null,
            color: null,
        };
    }
}

module.exports = {
    name: 'discord',
    description: 'Set your Discord server invite link.',
    execute(message, args) {
        const profileDB = loadDatabase(); // Reload database every time
        const value = args.join(' ').trim();
        const userId = message.author.id;

        const discordInviteRegex = /https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9]+/;
        if (!value || !discordInviteRegex.test(value)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | Please provide a valid Discord server invite link (e.g., https://discord.gg/example).'),
                ],
            });
        }

        ensureUserProfile(profileDB, userId);

        profileDB[userId].discord = value;  // Only update the 'discord' field
        saveDatabase(profileDB);

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setDescription(`<:tickYes:1335562497268252682> | Your Discord server link has been set to: **${value}**.`),
            ],
        });
    },
};
