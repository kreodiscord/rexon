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
    name: 'products',
    description: 'Set your products information.',
    execute(message, args) {
        const profileDB = loadDatabase(); // Load database every time a command runs
        const value = args.join(' ').trim();
        const userId = message.author.id;

        if (!value) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | Please provide a valid text value.'),
                ],
            });
        }

        if (value.length > 200) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | The text exceeds the maximum limit of 200 characters.'),
                ],
            });
        }

        ensureUserProfile(profileDB, userId);

        profileDB[userId].products = value;  // Only update the 'products' field
        saveDatabase(profileDB);

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setDescription(`<:tickYes:1335562497268252682> | Your products information has been set to: **${value}**`),
            ],
        });
    },
};
