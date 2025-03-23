const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/vouches.json');
const blacklistedPath = path.join(__dirname, '../database/blacklisted.json');
const dwcPath = path.join(__dirname, '../database/dwc.json');
const scammersPath = path.join(__dirname, '../database/scammers.json');

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

function saveDatabase(dbPath, data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

module.exports = {
    name: 'vouch',
    description: 'Submit a vouch for another user',
    aliases: ['rep'],
    async execute(message, args) {
        let vouchesDB = loadDatabase(dbPath);
        let blacklistedDB = loadDatabase(blacklistedPath);
        let dwcDB = loadDatabase(dwcPath);
        let scammersDB = loadDatabase(scammersPath);

        let recipient;
        if (message.mentions.users.size > 0) {
            recipient = message.mentions.users.first();
        } else if (args[0] && !isNaN(args[0])) {
            recipient = await message.client.users.fetch(args[0]).catch(() => null);
        }

        if (!recipient) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | Please mention a valid user or provide a valid user ID.'),
                ],
            });
        }
        


        const dealDetails = args.slice(1).join(' ');
        try {
            if (blacklistedDB.includes(message.author.id) || blacklistedDB.includes(recipient.id)) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ | Either you or ${recipient.tag} is blacklisted and cannot vouch.`)
                    ],
                });
            }
        } catch (error) {
            console.error('Error checking blacklist:', error);
        }

        const dwcEntryAuthor = dwcDB.find(entry => entry.userId === message.author.id);
        if (dwcEntryAuthor) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | You are marked as DWC and cannot vouch for others.'),
                ],
            });
        }

        const dwcEntryRecipient = dwcDB.find(entry => entry.userId === recipient.id);
        if (dwcEntryRecipient) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ ${recipient.tag} cannot be vouched for because they are marked as DWC.`),
                ],
            });
        }

        const scammerEntryAuthor = scammersDB.find(entry => entry.userId === message.author.id);
        if (scammerEntryAuthor) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You are marked as a scammer and cannot vouch for others.'),
                ],
            });
        }

        const scammerEntryRecipient = scammersDB.find(entry => entry.userId === recipient.id);
        if (scammerEntryRecipient) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ ${recipient.tag} cannot be vouched because they are marked as a scammer.`),
                ],
            });
        }

        if (recipient.bot || recipient.id === message.author.id) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You cannot vouch for a bot or yourself.'),
                ],
            });
        }

        if (!dealDetails) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a comment.'),
                ],
            });
        }
        
        const currencyRegex = /(\₹|₿|\€|\$|\¥|₣|₤|₴|₡|₽|₩|₪|₮|₹|INR|RS|rupees|AFN|ALL|AMD|ANG|AOA|ARS|AUD|AWG|AZN|BAM|BBD|BDT|BGN|BIF|BMD|BND|BOB|BRL|BSD|BTN|BWP|BYN|BZD|CAD|CDF|CHF|CLP|CNY|COP|CRC|CUP|CVE|CZK|DJF|DKK|DOP|DZD|EGP|ERN|ETB|EUR|FJD|FKP|FOK|GBP|GEL|GGP|GHS|GIP|GMD|GNF|GTQ|GYD|HKD|HNL|HRK|HTG|HUF|IDR|ILS|INR|IQD|IRR|ISK|JMD|JOD|JPY|KES|KGS|KHR|KMF|KRW|KWD|KYD|KZT|LAK|LBP|LKR|LRD|LSL|LTL|LVL|LYD|MAD|MDL|MGA|MKD|MMK|MNT|MOP|MRO|MRU|MUR|MXN|MYR|MZN|NAD|NGN|NIO|NOK|NPR|NZD|OMR|PAB|PEN|PGK|PHP|PKR|PLN|PYG|QAR|RON|RUB|RWF|SAR|SBD|SCR|SEK|SGD|SHP|SLL|SOS|SRD|SSP|STN|SYP|SZL|THB|TJS|TMT|TND|TOP|TRY|TTD|TWD|TZS|UAH|UGX|UYU|UZS|VES|VND|VUV|WST|XAF|XCD|XOF|XPF|YER|ZAR|ZMW)/i;

if (!currencyRegex.test(dealDetails)) {
    return message.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("Vouch Denied")
                .setDescription('⚠️ Your vouch was automatically denied for not specifying the price of what you were vouching for, Make sure to include symbols or comments of the currency which you used to paid.'),
        ],
    });
}


        const timestamp = Date.now();
        const authorTag = message.author.tag;
       let recipientTag = 'Unknown User';
try {
    recipient = await message.client.users.fetch(recipient.id);
    recipientTag = recipient.tag;
} catch (error) {
    console.error('Error fetching recipient user:', error);
}

        const serverName = message.guild.name;
        const serverId = message.guild.id;


        const generateUniqueId = () => {
            let id;
            do {
                id = Math.floor(Math.random() * 1000000); 
            } while (vouchesDB.some(vouch => vouch.id === id));
            return id;
        };

        message.react("<:tick:1335642897156145202>")

        const vouchEntry = {
            id: generateUniqueId(),
            timestamp,
            authorId: message.author.id,
            authorTag,
            recipientId: recipient.id,
            recipientTag,
            dealDetails,
            status: 'pending',
            reason: 'N/A',
        };

        vouchesDB.push(vouchEntry);

        saveDatabase(dbPath, vouchesDB);

        try {
            const successEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle("Vouch Submitted!")
                .setDescription(`Your vouch for ${authorTag} has been submitted!\nPlease wait for it to be checked!`)
                .setFooter({ text: `Vouch ID: #${vouchEntry.id}` });

            const replyMessage = await message.reply({ embeds: [successEmbed] });

            setTimeout(() => {
                replyMessage.delete().catch(console.error);
            }, 30000);
        } catch (error) {
            console.error('Error sending vouch confirmation message:', error);
        }
       
        const targetGuildId = '1333156680623591586';
        const targetChannelId = '1343296542752374926';

        try {
            const targetGuild = message.client.guilds.cache.get(targetGuildId);

            if (!targetGuild) {
                console.error(`Error: Bot is not a member of the target guild (ID: ${targetGuildId}).`);
            } else {
                const targetChannel = await targetGuild.channels.fetch(targetChannelId);

                if (!targetChannel || !targetChannel.isTextBased()) {
                    console.error('Error: Target channel not found or is not a text-based channel.');
                } else {
                    const channelEmbed = new EmbedBuilder()
                        .setColor('Blurple')
                        .setTitle('New Vouch Submitted')
                        .addFields(
                            { name: 'Vouch ID', value: `${vouchEntry.id}`, inline: true },
                            { name: 'Recipient', value: `${recipientTag} (ID: ${recipient.id})`, inline: true },
                            { name: 'Vouched By', value: `${authorTag} (ID: ${message.author.id})`, inline: true },
                            { name: 'Server', value: `${serverName} (ID: ${serverId})`, inline: true },
                            { name: 'Comment', value: vouchEntry.dealDetails || 'Not fetchable.', inline: false }
                        )
                        .setFooter({ text: `Vouch submitted at ${new Date(timestamp).toLocaleString()}` });

                    await targetChannel.send({ embeds: [channelEmbed], content: `Vouch ID: ${vouchEntry.id}` });
                }
            }
        } catch (error) {
            console.error('Error sending vouch to the log channel:', error);
        }

        // Send DM to the recipient
        try {
            await recipient.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Vouch Notification System")
                        .setColor(0x5865F2)
                        .setFooter({ text: "Created by Kreo | Fraud Alert | .gg/FraudAlert" })
                        .setDescription(
                            `You have received a positive vouch from \`${authorTag}\`. The ID of this vouch is \`#${vouchEntry.id}\`.`
                        ),
                ],
            });
        } catch (error) {
            console.error('Error sending DM to recipient:', error);
        }
           
    },
};
