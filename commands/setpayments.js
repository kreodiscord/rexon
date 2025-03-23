const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const paymentsDbPath = path.join(__dirname, '../database/payments.json');

function loadDatabase() {
    if (fs.existsSync(paymentsDbPath)) {
        try {
            return JSON.parse(fs.readFileSync(paymentsDbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading database:', error);
            return {};
        }
    }
    return {};
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(paymentsDbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

module.exports = {
    name: 'setpayments',
    aliases: ['setpayment'],
    description: 'Set your payment methods.',
    execute(message, args) {
        const paymentsDB = loadDatabase();
        const value = args.join(' ').trim();
        const userId = message.author.id;

        if (!value) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | Please provide your payment methods (e.g., PayPal, Bitcoin, etc.).'),
                ],
            });
        }

        if (value.length > 400) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | Your payment methods exceed the maximum limit of 400 characters.'),
                ],
            });
        }

        paymentsDB[userId] = { payments: value };
        saveDatabase(paymentsDB);

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setDescription(`✅ | Your payment methods have been set to: **${value}**.`),
            ],
        });
    },
};
