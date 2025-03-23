const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/vouches.json');

function loadDatabase(dbPath) {
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

module.exports = {
    name: 'mlist',
    aliases: ['manuallist'],
    description: 'Shows all manual vouches older than 2 days.',
    async execute(message) {
        try {
            if (!message.member.roles.cache.has('1335556994781679617')) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ You need the required role to use this command.')
                    ],
                });
            }

            const vouchesDB = loadDatabase(dbPath);

            const currentTime = Date.now();
            const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
            const manualVouches = vouchesDB.filter(vouch => 
                vouch.status === 'manual' && (currentTime - vouch.timestamp) > twoDaysInMs
            );

            if (manualVouches.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setTitle('Manual Vouches')
                    .setDescription('There are no manual vouches older than 2 days.')
                    .setFooter({ text: 'Created by Kreo | Fraud Alert | .gg/FraudAlert' });

                return message.reply({ embeds: [embed] });
            }

            const vouchIds = manualVouches.map(vouch => vouch.id).join(', ');

            const embed = new EmbedBuilder()
                .setColor('Blurple') 
                .setTitle('Manual Vouches')
                .setDescription(`Vouches with Manual Status (Older than 2 days):\n\`${vouchIds}\``)
                .setFooter({ text: 'Created by Kreo | Fraud Alert | .gg/FraudAlert' });

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in mlist command:', error);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ An error occurred while processing the command.'),
                ],
            });
        }
    },
};
