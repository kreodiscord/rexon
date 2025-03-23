const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/vouches.json');
const blacklistedPath = path.join(__dirname, '../database/blacklisted.json'); 
const dwcPath = path.join(__dirname, '../database/dwc.json');
const staffNotesPath = path.join(__dirname, '../database/staffnotes.json');


function loadDatabase(dbPath) {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading database:', err);
        return [];
    }
}

function saveDatabase(dbPath, data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving database:', err);
    }
}

const reasonMappings = {
    format: "Please specify more details about what you're vouching for, such as by specifying the price or including more details about your product, then revouch.",
    duplicate: "This appears to be a duplicate vouch. Please include all products you bought from the buyer in one vouch. Multiple vouches are considered duplicates, and hence will be denied.",
    manual: "You took too long to verify. If this happens more regularly, you will be blacklisted from our vouch system.",
    minamount: "This vouch is invalid, as the minimum vouch amount is $1.",
    bot: "Your payment method does not fall under Rexon standards as we don't accept bot/game currency.",
    fake: "This seems to be a fake vouch, please join the support server for more info.",
    discordtos: "This vouch is ineligible for acceptance as it includes items that violate Discord's Terms of Service. Please revise and resubmit in compliance with Discord guidelines.",
    troll: "This vouch is rejected as it appears to be a troll submission. Submitting vouches for amusement may lead to blacklisting from our vouch system. Please refrain from such actions for continued participation.",
    giveaway: "This vouch is not accepted as it pertains to giveaway or event details, which are not permitted in Rexon. Please ensure your vouch adheres to the guidelines and resubmit accordingly."

};



module.exports = {
    name: 'deny',
    aliases: ['d'],
    description: 'Deny a vouch for a user',
    async execute(message, args) {
        const vouchesDB = loadDatabase(dbPath);
        const blacklistedDB = loadDatabase(blacklistedPath); 
         const dwcDB = loadDatabase(dwcPath);
        const staffNotesDB = loadDatabase(staffNotesPath);

        if (!message.member.roles.cache.has('1335556994781679617')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to deny vouches.'),
                ],
            });
        }

        const vouchId = args[0];
        let reason = args.slice(1).join(' ');

        if (!vouchId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a valid Vouch ID.'),
                ],
            });
        }

        if (!reason) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a reason for denying the vouch.\nAvailable variables:\n\n\`format, duplicate, manual, minamount, bot, fake, troll, discordtos, giveaway\`.'),
                ],
            });
        }

        const normalizedReason = reason.toLowerCase();
        if (!reasonMappings[normalizedReason]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(
                            '⚠️ Invalid reason provided. You must use one of the following reasons:\n' +
                            '`format, duplicate, manual, minamount, bot, fake, troll, discordtos, giveaway`.'
                        ),
                ],
            });
        }
        
        reason = reasonMappings[normalizedReason];

        const vouch = vouchesDB.find((v) => v.id === parseInt(vouchId, 10));
        if (!vouch) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ No vouch found with ID: ${vouchId}`),
                ],
            });
        }

        if (vouch.status === 'denied') {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ This vouch has already been denied.`),
                ],
            });
        }
        
        if (!["pending", "manual"].includes(vouch.status)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ This vouch cannot be denied because its already accepted.`),
                ],
            });
        }

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

        message.react('✅');

        vouch.status = 'denied';
        vouch.reviewer = vouch.reviewer || message.author.username; 
        vouch.reviewerId = vouch.reviewerId || message.author.id;
        vouch.reason = reason;

        saveDatabase(dbPath, vouchesDB);

        if (recipient) {
            recipient
                .send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x2b2d30)
                            .setTitle("Vouch Notification System")
                            .setFooter({ text: "Created by Kreo | Fraud Alert | .gg/FraudAlert" })
                            .setDescription(`Your vouch with ID: \`#${vouchId}\` was denied because \`${reason}\`.`),
                    ],
                })
                .catch((err) => {
                    console.error('Error sending DM to recipient:', err);
                });
        }

     
        const manualDenialsCount = vouchesDB.filter(
            (v) => v.recipientId === vouch.recipientId && v.status === 'denied' && v.reason === reasonMappings.manual
        ).length;

       
        if (manualDenialsCount >= 7) {

            const guild = message.client.guilds.cache.get("1333156680623591586");
            if (guild) {
                const channel = guild.channels.cache.get("1343289418961780768");
                if (channel) {
                    const count = dwcDB.length + 1; 
                    const sentMessage = await channel.send(
                        `${count}. @${recipientTag} : ${vouch.recipientId} (Vouch Manipulation)`
                    );

                    const dwcEntry = {
                        userId: vouch.recipientId,
                        username: recipientTag,
                        reason: "Vouch Manipulation",
                        markedBy: message.author.tag,
                        timestamp: Date.now(),
                        messageId: sentMessage.id 
                    };

                    dwcDB.push(dwcEntry);
                    saveDatabase(dwcPath, dwcDB);
                }
            }
            
            const blacklistEntry = {
                id: vouch.recipientId,
                tag: recipientTag,
                reason: 'Automated Vouch Proof-Action System',
                timestamp: Date.now(),
            };
            blacklistedDB.push(blacklistEntry);
            saveDatabase(blacklistedPath, blacklistedDB);
            
            staffNotesDB[vouch.recipientId] = {
                userId: vouch.recipientId,
                username: recipientTag,
                note: "Automated Vouch-Proof System",
                notedBy: message.author.tag,
                timestamp: Date.now(),
            };
            saveDatabase(staffNotesPath, staffNotesDB);

            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(
                            `⚠️ | ${recipientTag} has been blacklisted due to repeated denials.`
                        ),
                ],
            });

            
            recipient
                .send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('You have been blacklisted from the vouch system')
                            .setColor(0xff0000)
                            .setDescription(
                                'You have been blacklisted due to repeatedly failing to verify manual vouch requests. ' +
                                'This action is part of our Automated Vouch Proof-Action System. Contact the [support server](https://discord.gg/FraudAlert) for more details.'
                            ),
                    ],
                })
                .catch(console.error);
        }

        const targetGuildId = '1333156680623591586';
        const targetChannelId = '1343296595105546340';

        const targetGuild = message.client.guilds.cache.get(targetGuildId);

        if (!targetGuild) {
            return console.error(`Error: Bot is not a member of the target guild (ID: ${targetGuildId}).`);
        }

        try {
            const targetChannel = await targetGuild.channels.fetch(targetChannelId);

            if (!targetChannel || !targetChannel.isTextBased()) {
                return console.error('Error: Target channel not found or is not a text-based channel.');
            }

            const channelEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Vouch Denied')
                .addFields(
                    { name: 'Vouch ID', value: `${vouchId}`, inline: true },
                    { name: 'Recipient', value: `${recipientTag} (ID: ${vouch.recipientId})`, inline: true },
                    { name: 'Denied By', value: `${authorTag} (ID: ${message.author.id})`, inline: true },
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Comment', value: vouch.dealDetails || 'Couldn’t fetch.', inline: false }
                )
                .setFooter({ text: `Vouch denied at ${new Date(timestamp).toLocaleString()}` });

            await targetChannel.send({ embeds: [channelEmbed] });
        } catch (error) {
            console.error('Error sending message to the target channel:', error);
        }
    },
};
