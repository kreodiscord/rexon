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
    name: 'manuals',
    description: 'Shows all vouches with manual status for a given user.',
    async execute(message, args) {
        if (!message.member.roles.cache.has('1335557082740690975')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to view manual vouches.'),
                ],
            });
        }

        const userId =
            args[0]?.replace(/<@!?(\d+)>/, '$1') || 
            args[0]; 

        if (!userId || isNaN(userId)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please mention a valid user or provide a valid user ID.'),
                ],
            });
        }

        let user;
        try {
            user = await message.client.users.fetch(userId);
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Unable to find a user with the provided ID.'),
                ],
            });
        }

        const vouchesDB = loadDatabase();
        const manualVouches = vouchesDB.filter(
            (v) => v.recipientId === user.id && v.status === 'manual'
        );

        if (manualVouches.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ No manual vouches found for ${user.tag} (ID: ${user.id}).`),
                ],
            });
        }

        let vouchesText = '';
        manualVouches.forEach((vouch) => {
            vouchesText += `Vouch ID: ${vouch.id}\nComment: ${vouch.dealDetails}\nStatus: Manual\n---------\n`;
        });

        const filePath = path.join(__dirname, `../${user.id}_manuals.txt`);
        fs.writeFileSync(filePath, vouchesText, 'utf8');

        message.reply({
            content: `Here are the manual vouches received by ${user.tag}:`,
            files: [filePath],
        })
            .then(() => {
                fs.unlinkSync(filePath); 
            })
            .catch((err) => {
                console.error('Error sending manual vouches file:', err);
            });
    },
};
