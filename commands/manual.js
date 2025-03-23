const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/vouches.json');

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

function saveDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 4), 'utf8');
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

module.exports = {
    name: 'manual',
    aliases: ['m', 'proof'],
    description: 'Set the vouch status to manual for verification',
    async execute(message, args) {
        const vouchesDB = loadDatabase(); 

        if (!message.member.roles.cache.has('1335556994781679617')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to set a vouch to manual.'),
                ],
            });
        }

        const vouchId = args[0];

        if (!vouchId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a valid Vouch ID.'),
                ],
            });
        }

        const vouch = vouchesDB.find((v) => v.id === parseInt(vouchId));
        if (!vouch) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ No vouch found with ID: ${vouchId}`),
                ],
            });
        }
        
         if (vouch.status === 'manual') {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ This vouch has already been sent to manual verification.`),
                ],
            });
        }
        
        if (!["pending"].includes(vouch.status)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ This vouch cannot be sent to manual as its Accepted/Denied.`),
                ],
            });
        }

        vouch.status = 'manual';
        vouch.reviewer = vouch.reviewer || message.author.username; 
        vouch.reviewerId = vouch.reviewerId || message.author.id;
        saveDatabase(vouchesDB);

        let recipient;
        for (let guild of message.client.guilds.cache.values()) {
            const member = await guild.members.fetch(vouch.recipientId).catch(() => null);
            if (member) {
                recipient = member;
                break;
            }
        }

        if (recipient) {
            recipient
                .send({
                    embeds: [
                        new EmbedBuilder()
                           .setColor(0x2b2d30)
                            .setTitle("Vouch Notification System")
                            .setFooter( {text: "Created by Kreo | Fraud Alert | .gg/FraudAlert"})
                            .setDescription(`Your vouch with ID: ${vouchId} needs manual verification by a staff member. Please join the [Rexon Support Server](https://discord.gg/FraudAlert) and open a support ticket to provide proof of the vouch.\nIf a ticket will not be opened within 2 days, This vouch will be denied.\nShould this happen more regularly, You may be blacklisted from our vouch-system.`),
                    ],
                })
                .catch((err) => {
                    console.error('Error sending DM to recipient:', err);
                });
        }

        const successEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setDescription(`Vouch ID: ${vouchId} has been set to manual verification.`);

        message.reply({ embeds: [successEmbed] });
    },
};
