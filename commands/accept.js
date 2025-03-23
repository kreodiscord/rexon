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
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

module.exports = {
    name: 'accept',
    aliases: ['a'],
    description: 'Accept one or multiple vouches for a user',
    async execute(message, args) {
        let vouchesDB = loadDatabase();
        const isOwner = message.author.id === '1219880124351119373';

        if (!isOwner && !message.member.roles.cache.has('1335556994781679617')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to accept vouches.'),
                ],
            });
        }

        if (!args.length) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide at least one valid Vouch ID.'),
                ],
            });
        }

        let acceptedVouches = [];
        let failedVouches = [];

        for (const vouchId of args) {
            const vouchIdInt = parseInt(vouchId, 10);
            if (isNaN(vouchIdInt)) {
                failedVouches.push(`⚠️ **${vouchId}** - Invalid Vouch ID (not a number).`);
                continue;
            }

            const vouch = vouchesDB.find((v) => v.id === vouchIdInt);
            if (!vouch) {
                failedVouches.push(`⚠️ **#${vouchIdInt}** - No vouch found.`);
                continue;
            }

            if (!isOwner) {
                if (vouch.status === 'accepted') {
                    failedVouches.push(`⚠️ **#${vouchIdInt}** - Already accepted.`);
                    continue;
                }
                if (!['pending', 'manual'].includes(vouch.status)) {
                    failedVouches.push(`⚠️ **#${vouchIdInt}** - Cannot accept vouch with status \`${vouch.status}\`.`);
                    continue;
                }
            }

            vouch.status = 'accepted';
            vouch.reviewer = vouch.reviewer || message.author.username; 
            vouch.reviewerId = vouch.reviewerId || message.author.id;
            acceptedVouches.push(vouch);
        }

        if (!acceptedVouches.length) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(failedVouches.join('\n') || '⚠️ No valid vouches to accept.'),
                ],
            });
        }

        saveDatabase(vouchesDB);
        message.react('✅');

        const targetGuildId = '1333156680623591586';
        const targetChannelId = '1343296572326416425';
        const targetGuild = message.client.guilds.cache.get(targetGuildId);

        if (!targetGuild) {
            return console.error(`Error: Bot is not a member of the target guild (ID: ${targetGuildId}).`);
        }

        try {
            const targetChannel = await targetGuild.channels.fetch(targetChannelId);

            if (!targetChannel || !targetChannel.isTextBased()) {
                return console.error('Error: Target channel not found or is not a text-based channel.');
            }

            for (const vouch of acceptedVouches) {
                let recipient;
                for (let guild of message.client.guilds.cache.values()) {
                    const member = await guild.members.fetch(vouch.recipientId).catch(() => null);
                    if (member) {
                        recipient = member;
                        break;
                    }
                }

                const authorTag = message.author.tag;
                const recipientTag = recipient ? recipient.user.tag : 'Unknown';
                const timestamp = Date.now();

                if (recipient) {
                    recipient
                        .send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0x2b2d30)
                                    .setTitle("Vouch Notification System")
                                    .setFooter({ text: "Created by Kreo | Fraud Alert | .gg/FraudAlert" })
                                    .setDescription(`Your vouch with ID: \`#${vouch.id}\` was approved.`),
                            ],
                        })
                        .catch((err) => {
                            console.error(`Error sending DM to ${recipientTag}:`, err);
                        });
                }

                const channelEmbed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setTitle('Vouch Accepted')
                    .addFields(
                        { name: 'Vouch ID', value: `${vouch.id}`, inline: true },
                        { name: 'Recipient', value: `${recipientTag} (ID: ${vouch.recipientId})`, inline: true },
                        { name: 'Accepted By', value: `${authorTag} (ID: ${message.author.id})`, inline: true },
                        { name: 'Comment', value: vouch.dealDetails || 'Couldn’t fetch.', inline: false }
                    )
                    .setFooter({ text: `Vouch accepted at ${new Date(timestamp).toLocaleString()}` });

                await targetChannel.send({ embeds: [channelEmbed] });
            }
        } catch (error) {
            console.error('Error sending message to the target channel:', error);
        }

        if (failedVouches.length) {
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(failedVouches.join('\n')),
                ],
            });
        }
    },
};
