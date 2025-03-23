const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const shopDbPath = path.join(__dirname, '../database/shop.json');

function loadDatabase() {
    if (fs.existsSync(shopDbPath)) {
        try {
            return JSON.parse(fs.readFileSync(shopDbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading database:', error);
            return {};
        }
    }
    return {};
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(shopDbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}



module.exports = {
    name: 'shop',
    description: 'Set your shop link.',
    execute(message, args) {
        const shopDB = loadDatabase();
        const value = args.join(' ').trim();
        const userId = message.author.id;

        const shopLinkRegex = /https?:\/\/[^\s]+/;

        if (!value || !shopLinkRegex.test(value)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | Please provide a valid shop link (e.g., https://example.com/shop).'),
                ],
            });
        }

        shopDB[userId] = { shop: value };
        saveDatabase(shopDB);

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setDescription(`⚠️ | Your shop link has been set to: **${value}**`),
            ],
        });
    },
};
