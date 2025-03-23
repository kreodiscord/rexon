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
    name: 'channelCreate',
    async execute(channel) {
        if (!channel.guild) return;

        console.log(`Channel created: ${channel.name} (ID: ${channel.id})`);

        // Check if channel is in the required category
        if (channel.parentId !== '1343295403008987310') return;
        console.log('Channel is inside the correct category.');

        // Check if channel name starts with "proof-"
        if (!channel.name.startsWith('proof-')) return;
        console.log('Channel name starts with "proof-".');

        // Ensure the channel topic exists and is a valid numeric Discord ID
        if (!channel.topic || !/^\d{17,19}$/.test(channel.topic)) {
            console.log(`Invalid or missing channel topic: ${channel.topic}`);
            return;
        }

        const authorId = channel.topic.trim();
        console.log(`Extracted Author ID: ${authorId}`);

        // Wait for 3 seconds before sending the response
        await new Promise(resolve => setTimeout(resolve, 3000));

        const vouchesDB = loadDatabase();

        // Get all "manual" vouches for this user
        const userVouches = vouchesDB.filter(vouch => vouch.recipientId === authorId && vouch.status === 'manual');

        if (!channel.permissionsFor(channel.guild.members.me)?.has('SendMessages')) {
            console.log('Bot lacks permission to send messages in this channel.');
            return;
        }

        if (userVouches.length > 0) {
            const embeds = userVouches.map(vouch => {
                return new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle(`Manual Verification Vouch #${vouch.id}`)
                    .setDescription(
                        `**Recipient Tag:** ${vouch.recipientTag}\n**Recipient ID:** ${vouch.recipientId}\n\n` +
                        `**Giver Tag:** ${vouch.authorTag}\n**Giver ID:** ${vouch.authorId}\n\n` +
                        `**Vouch Type:** Positive\n**When:** <t:${Math.floor(vouch.timestamp / 1000)}:F> (<t:${Math.floor(vouch.timestamp / 1000)}:R>)\n\n` +
                        `**Comment:** ${vouch.dealDetails}\n**Status:** 🔍 Manual Verification`
                    )
                    .setFooter({ text: 'Automated Vouch Sending System | .gg/FraudAlert' });
            });

            for (const embed of embeds) {
                await channel.send({ embeds: [embed] });
            }

            console.log('Sent all manual verification vouches for the user.');
        } else {
            channel.send('No manual verification vouches found for this user. Please close this ticket.');
            console.log('Sent no manual vouches found message.');
        }
    }
};
