const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/vouches.json');

function loadDatabase() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading database:', err);
        return [];
    }
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving database:', err);
    }
}

module.exports = {
    name: 'status',
    description: 'Get details about a vouch by ID',
    async execute(message, args) {
        const vouchId = args[0];
        if (!vouchId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a vouch ID.')
                ],
            });
        }

        const vouchIdInt = parseInt(vouchId, 10);
        if (isNaN(vouchIdInt)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ The provided vouch ID is not a valid number.')
                ],
            });
        }

        const vouchesDB = loadDatabase();

        const vouch = vouchesDB.find(v => v.id === vouchIdInt);
        if (!vouch) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ No vouch found with ID: ${vouchIdInt}`)
                ],
            });
        }


        if (vouch.recipientId !== message.author.id) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You are not the recipient of this vouch, so you cannot view its details.')
                ],
            });
        }
        
         const statusDisplay = vouch.status === 'pending' 
    ? '\`⏰ Not Checked Yet!\`' 
    : vouch.status === 'denied' 
    ? '❌ Denied' 
    : vouch.status === 'accepted' 
    ? '<:tickYes:1335562497268252682> Approved' 
    : vouch.status;

        const vouchEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`Vouch #${vouchIdInt}`)
            .setDescription(`**Recipient Tag:** ${vouch.recipientTag}\n**Recipient ID:** ${vouch.recipientId}\n\n**Giver Tag:** ${vouch.authorTag}\n**Giver ID:** ${vouch.authorId}\n\n**Vouch Type:** Positive\n**When:** <t:${Math.floor(vouch.timestamp / 1000)}:F> (<t:${Math.floor(vouch.timestamp / 1000)}:R>)\n\n**Comment:** ${vouch.dealDetails}\n**Status:** ${statusDisplay}`)
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.reply({ embeds: [vouchEmbed] });
    },
};
