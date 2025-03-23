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

module.exports = {
    name: 'vouches',
    description: 'Shows all received vouches for a given user.',
    async execute(message, args) {
        if (!message.member.roles.cache.has('1335557082740690975')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to view vouches.')
                ],
            });
        }

        let userId;
        let user = message.mentions.users.first();
        
        if (user) {
            userId = user.id;
        } else if (args[0] && /^\d+$/.test(args[0])) {
            userId = args[0];
        } else {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please mention a valid user or provide a user ID.')
                ],
            });
        }

        const vouchesDB = loadDatabase();
        const userVouches = vouchesDB.filter((v) => v.recipientId === userId);

        if (userVouches.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ No vouches found for <@${userId}>.`)
                ],
            });
        }

        let vouchesText = '';
        userVouches.forEach((vouch) => {
            vouchesText += `Vouch ID: ${vouch.id}\n`;
            vouchesText += `Author: ${vouch.authorTag} (${vouch.authorId})\n`;
            vouchesText += `Comment: ${vouch.dealDetails}\n`;
            vouchesText += `Status: ${vouch.status}\n`;
            vouchesText += `------------\n`;
        });

        const filePath = path.join(__dirname, `../${userId}.txt`);
        fs.writeFileSync(filePath, vouchesText, 'utf8');

        message.reply({
            content: `Here are the vouches received by <@${userId}>:`,
            files: [filePath]
        }).then(() => {
            fs.unlinkSync(filePath);
        }).catch((err) => {
            console.error('Error sending vouches file:', err);
        });
    },
};
