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
    name: 'vouchinfo',
    aliases: ['get', 'vi'],
    description: 'Get details about a vouch by ID or multiple IDs',
    async execute(message, args) {

        if (!message.member.roles.cache.has('1335556994781679617')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You need the required role to use this command.')
                ],
            });
        }

       
        if (!args.length) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide at least one vouch ID.')
                ],
            });
        }

        const vouchesDB = loadDatabase();
        const invalidIds = [];
        const embeds = [];

      
        for (const id of args) {
            const vouchIdInt = parseInt(id, 10);

            if (isNaN(vouchIdInt)) {
                invalidIds.push(id);
                continue;
            }

            const vouch = vouchesDB.find(v => v.id === vouchIdInt);

            if (!vouch) {
                invalidIds.push(id);
                continue;
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

            embeds.push(vouchEmbed);
        }

        if (embeds.length) {
            await message.reply({ embeds });
        }
        if (invalidIds.length) {
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(
                            `⚠️ The following IDs were invalid or not found: ${invalidIds.join(', ')}`
                        ),
                ],
            });
        }
    },
};

