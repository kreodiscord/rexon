const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const vouchesPath = path.join(__dirname, '../database/vouches.json');
const profilePath = path.join(__dirname, '../database/profile.json');
const blacklistedPath = path.join(__dirname, '../database/blacklisted.json');
const dwcPath = path.join(__dirname, '../database/dwc.json');
const scammersPath = path.join(__dirname, '../database/scammers.json');
const badgesPath = path.join(__dirname, '../database/badges.json'); 
const importedPath = path.join(__dirname, '../database/imported.json'); 
const shopPath = path.join(__dirname, '../database/shop.json');
const paymentsDbPath = path.join(__dirname, '../database/payments.json'); 
const staffnote = path.join(__dirname, '../database/staffnotes.json'); 
const premiumPath = path.join(__dirname, '../database/premium.json');
 const gifPath = path.join(__dirname, '../database/gif.json');
const buttonsPath = path.join(__dirname, '../database/buttons.json');


function loadPremiumData() {
    if (fs.existsSync(premiumPath)) {
        try {
            return JSON.parse(fs.readFileSync(premiumPath, 'utf8'));
        } catch (error) {
            console.error('Error loading premium database:', error);
            return {};
        }
    }
    return {};
}


function loadDatabase(dbPath) {
    if (fs.existsSync(dbPath)) {
        try {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (error) {
            console.error(`Error loading database (${dbPath}):`, error);
            return {};
        }
    }
    return {};
}

module.exports = {
    name: 'profile',
    aliases: ['p'],
    description: 'Shows the user profile including vouch info, comments, and additional details',
    async execute(message, args) {

const gifDB = loadDatabase(gifPath);
const buttonsDB = loadDatabase(buttonsPath);        
        let user =
    message.mentions.users.first() ||
    (args[0]
        ? await message.client.users.fetch(args[0]).catch(() => null) ||
          message.client.users.cache.find(
              (u) => u.username.toLowerCase() === args[0].toLowerCase()
          )
        : null) ||
    message.author;
        
        if (!user) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a valid user ID or mention a user.'),
                ],
            });
        }

       
        const vouchesDB = loadDatabase(vouchesPath);
        const profileDB = loadDatabase(profilePath);
        const blacklistedDB = loadDatabase(blacklistedPath);
        const dwcDB = loadDatabase(dwcPath);
        const scammersDB = loadDatabase(scammersPath);
        const badgesDB = loadDatabase(badgesPath); 
        const importedDB = loadDatabase(importedPath);
        const shopDB = loadDatabase(shopPath);
        const paymentsDB = loadDatabase(paymentsDbPath);
        const staffDB = loadDatabase(staffnote);
        const premiumDB = loadPremiumData();

       
       const scammerEntry = scammersDB.find((entry) => entry.userId === user.id);
if (scammerEntry) {
    return message.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0xff0000)
                .setAuthor({ 
                    name: `${user.username} is a Scammer!`, 
                    iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) 
                })
                .setDescription(
                    `This User Was Marked For: **__${scammerEntry.reason}__**`
                )
                .setImage('attachment://scammer.png')
                .setFooter({ 
                    text: `Requested by ${message.author.tag}`, 
                    iconURL: message.author.displayAvatarURL({ dynamic: true, size: 1024 }) 
                }),
        ],
        files: [{ attachment: 'assets/scammer.png', name: 'scammer.png' }]
    }).then(msg => setTimeout(() => msg.delete(), 30000));
}

            
        
        const vouchInfo = await getVouchInfo(user.id, vouchesDB);
        const pastComments = await getPastComments(user.id, vouchesDB);
        const userProfile = profileDB[user.id] || {};
        const discordLink = userProfile.discord || 'Not Set!';
        const forumInfo = userProfile.forum || 'Not Set!';
        const productsInfo = userProfile.products || 'Not Set!';
        const embedColor = userProfile.color || '#2b2d30';
        const shopLink = shopDB[user.id]?.shop || 'Not Set!';
      const gifUrl = gifDB[user.id]?.url || null;
        let badges = [];
        const importedVouches = importedDB[user.id] || 0;
        let overallVouches = vouchInfo.positiveCount + importedVouches;
        const staffNote = staffDB[user.id]?.note || 'N/A';
       const highestDeal = await getHighestDeal(user.id, vouchesDB);
const highestDealEuro = await getHighestDealEuro(user.id, vouchesDB);

if (overallVouches >= 500) {
    badges.push('<:500:1335922291191578635> 500+ Vouches');
} else if (overallVouches >= 250) {
    badges.push('<:250:1335922165022982186> 250+ Vouches');
} else if (overallVouches >= 100) {
    badges.push('<:100vouch:1335921958319296592> 100+ Vouches');
} else if (overallVouches >= 50) {
    badges.push('<:50:1335922087197409280> 50+ Vouches');
}

const mainGuild = await message.client.guilds.fetch('1333156680623591586').catch(() => null);
if (mainGuild) {
    const member = await mainGuild.members.fetch(user.id).catch(() => null);
    if (member) {
        // Staff Badge
        if (member.roles.cache.has('1335633435460501617')) {
            badges.push('<:staff3:1335565559420555264> Staff');
        }
        // Donator Badge
        if (member.roles.cache.has('1335887986969149504')) {
            badges.push('<:DonatorRoleIcon2:1335564805586817075> Donator');
        }
    }
}

const overallVouchCounts = vouchesDB
    .filter((v) => v.status === 'accepted')
    .reduce((acc, v) => {
        acc[v.recipientId] = (acc[v.recipientId] || 0) + 1;
        return acc;
    }, {});

Object.keys(importedDB).forEach((id) => {
    overallVouchCounts[id] = (overallVouchCounts[id] || 0) + importedDB[id];
});

const sortedOverallVouchCounts = Object.entries(overallVouchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

if (sortedOverallVouchCounts.some(([userId]) => userId === user.id)) {
    badges.push('<:top10:1335922012274692108> Top-10 Vouches');
}
        
if (premiumDB[user.id] && premiumDB[user.id].expiresAt > Date.now()) {
    badges.push('<:prem:1343625123390816348> Premium');
}
        
        const guildId = '1333156680623591586';
const guild = message.client.guilds.cache.get(guildId);

if (guild) {
    const member = guild.members.cache.get(user.id);
    if (member) {
        badges.push('<:members:1335554439041257482> Member');
        if (member.premiumSince) {
            badges.push('<:booster:1335554573259243582> Booster');
        }
    }
}
        
        
        if (badgesDB[user.id]) {
            badges = [...badges, ...badgesDB[user.id]];
        }
        
        const blacklistEntry = blacklistedDB.find((entry) => entry.id === user.id);
                const dwcEntry = dwcDB.find((entry) => entry.userId === user.id);

if (dwcEntry && blacklistEntry) {
    return message.reply({
        embeds: [
            new EmbedBuilder()
                .setAuthor({ name: `${user.tag}'s Profile`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setColor(0xE5544B)
                .setDescription(
                    `⚠️ **__DEAL WITH CAUTION__** ⚠️\n⚠️ **__BLACKLISTED FROM VOUCHING__** ⚠️\n**ID:** ${user.id}\n**Registration Date:** <t:${Math.floor(
                        user.createdTimestamp / 1000
                    )}:D>\n**Display Name:** ${user.username}\n**Mention:** <@${user.id}>\n**Staff Note:** ${staffNote}\n` +
                    `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
                    `**__Vouch Information__**\n` +
                    `**Positive:** ${vouchInfo.positiveCount}\n**Negative:** 0\n` +
                    `**Imported:** ${importedVouches}\n` +
                    `**Overall:** ${vouchInfo.positiveCount + importedVouches}\n\n` +
                    `**__Badges__**\n` +
                    (badges.length ? badges.join('\n') : 'No badges yet') +
                    `\n\n**__Services and Products__**\n` +
                    `**Discord:** ${discordLink}\n**Shop:** ${shopLink}\n**Forum:** ${forumInfo}\n**Products:** ${productsInfo}\n` +
                    `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
                    `**__Past 5 Comments__**\n` +
                    (pastComments.length
                        ? pastComments
                              .map((comment, index) => `**${index + 1})** ${comment}`)
                              .join('\n')
                        : 'No comments available')
                )
                .setFooter({ text: 'Created by Kreo' }),
        ],
    });
}
        

        if (dwcEntry) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `${user.tag}'s Profile`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                        .setColor(0xE5544B)
                        .setDescription(
                `⚠️**__DEAL WITH CAUTION__**⚠️\n**ID:** ${user.id}\n**Registration Date:** <t:${Math.floor(
                    user.createdTimestamp / 1000
                )}:D>\n**Display Name:** ${user.username}\n**Mention:** <@${user.id}>\n**Staff Note**: ${staffNote}\n` +
                `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
                `**__Vouch Information__**\n` +
                `**Positive:** ${vouchInfo.positiveCount}\n**Negative:** 0\n` +
                `**Imported:** ${importedVouches}\n` +
                `**Overall:** ${vouchInfo.positiveCount + importedVouches}\n\n` +
                `**__Badges__**\n` +
                (badges.length ? badges.join('\n') : 'No badges yet') +
                `\n\n**__Services and Products__**\n` +
                `**Discord:** ${discordLink}\n**Shop**: ${shopLink}\n**Forum:** ${forumInfo}\n**Products:** ${productsInfo}\n` +
                `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` + 
                `**__Past 5 Comments__**\n` +
                (pastComments.length
                    ? pastComments
                          .map((comment, index) => `**${index + 1})** ${comment}`)
                          .join('\n')
                    : 'No comments available')
            )
                        .setFooter({ text: 'Created by Kreo' }),
                ],
            }).then(msg => setTimeout(() => msg.delete(), 30000));
        }
        
        if (blacklistedDB.some((entry) => entry.id === user.id)) {
    const blacklistEntry = blacklistedDB.find((entry) => entry.id === user.id);
             return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `${user.tag}'s Profile`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                        .setColor(0xE5544B)
                        .setDescription(
                `⚠️**__BLACKLISTED FROM VOUCHING__**⚠️\n**ID:** ${user.id}\n**Registration Date:** <t:${Math.floor(
                    user.createdTimestamp / 1000
                )}:D>\n**Display Name:** ${user.username}\n**Mention:** <@${user.id}>\n**Staff Note**: ${staffNote}\n` +
                `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
                `**__Badges__**\n` +
                (badges.length ? badges.join('\n') : 'No badges yet')
            )
                        .setFooter({ text: 'Created by Kreo' }),
        ],
    }).then(msg => setTimeout(() => msg.delete(), 30000));
        }
        

const profileEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`${user.tag}'s Profile`)
            .setDescription(
                `**ID:** ${user.id}\n**Registration Date:** <t:${Math.floor(
                    user.createdTimestamp / 1000
                )}:D>\n**Display Name:** ${user.username}\n**Mention:** <@${user.id}>\n` +
                `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
                `**__Vouch Information__**\n` +
                `**Positive:** ${vouchInfo.positiveCount}\n**Negative:** 0\n` +
                `**Imported:** ${importedVouches}\n` +
                `**Overall:** ${vouchInfo.positiveCount + importedVouches}\n\n` +
                `**__Badges__**\n` +
                (badges.length ? badges.join('\n') : 'No badges yet') +
                `\n\n**__Services and Products__**\n` +
                `**Discord:** ${discordLink}\n**Shop**: ${shopLink}\n**Forum:** ${forumInfo}\n**Products:** ${productsInfo}\n` +
                `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` + 
                `**__Past 5 Comments__**\n` +
                (pastComments.length
                    ? pastComments
                          .map((comment, index) => `**${index + 1})** ${comment}`)
                          .join('\n')
                    : 'No comments available') 
                
            )
            .setFooter({ 
        text: 'Created by Kreo | Fraud Alert | .gg/FraudAlert', 
        iconURL: message.client.user.displayAvatarURL() }) 
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }));
        if (gifUrl) {
    profileEmbed.setImage(gifUrl);
}
       const buttons = [];

        // Highest Deal Button
        const viewHighestDealButton = new ButtonBuilder()
            .setCustomId('view_highest_deal')
            .setLabel('Highest Deal')
            .setStyle(ButtonStyle.Secondary);

        buttons.push(viewHighestDealButton);

        // Fetch user's saved buttons from the database
        if (buttonsDB[user.id]) {
            buttonsDB[user.id].forEach(button => {
                if (button.name && button.link) {
                    const linkButton = new ButtonBuilder()
                        .setLabel(button.name)
                        .setURL(button.link)
                        .setStyle(ButtonStyle.Link);
                    buttons.push(linkButton);
                }
            });
        }

        // Create button row(s)
        const buttonRows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            buttonRows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }

        // Send the profile embed with buttons
        const sentMessage = await message.reply({ embeds: [profileEmbed], components: buttonRows });
        
        const collector = sentMessage.createMessageComponentCollector({ time: 3600000 });

collector.on('collect', async (interaction) => {
    if (interaction.customId === 'view_highest_deal') {
        const highestDeal = await getHighestDeal(user.id, vouchesDB);
        const highestDealEuro = await getHighestDealEuro(user.id, vouchesDB);

        const dealMessage = new EmbedBuilder()
            .setColor('Blurple')
            .setTitle('Highest Deals')
            .setDescription(
                `**Highest Deal [$]**\n` +
                (highestDeal ? `**-** ${highestDeal.dealDetails}` : 'No highest deal found.') +
                `\n\n**Highest Deal [€]**\n` +
                (highestDealEuro ? `**-** ${highestDealEuro.dealDetails}` : 'No highest deal found.')
            )
            .setFooter({ text: 'This data is fetched in real-time.' });

        await interaction.reply({ embeds: [dealMessage], ephemeral: true });
    }
});


collector.on('end', () => {
    const disabledRow = new ActionRowBuilder().addComponents(
        viewHighestDealButton.setDisabled(true)
    );
    sentMessage.edit({ components: [disabledRow] }).catch(console.error);
});

        
        setTimeout(() => {
            sentMessage.delete().catch(err => console.error('Failed to delete the profile message:', err));
        }, 30000);
    },
};
async function getVouchInfo(userId, vouchesDB) {
    const positiveCount = vouchesDB.filter(
        (v) => v.recipientId === userId && v.status === 'accepted'
    ).length;

    return { positiveCount };
}

async function getPastComments(userId, vouchesDB) {
    const comments = vouchesDB
        .filter((v) => v.recipientId === userId && v.status === 'accepted')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) 
        .slice(0, 5)
        .map((v) => v.dealDetails);
    return comments;
}

async function getHighestDeal(userId, vouchesDB) {
    const acceptedVouches = vouchesDB.filter(
        (v) => v.recipientId === userId && v.status === 'accepted'
    );

    const highestDeal = acceptedVouches.reduce((maxDeal, currentDeal) => {
        // Updated regex to capture amount with or without dollar sign before or after the number
        const match = currentDeal.dealDetails.match(/(\d+([.,]\d+)?)\s?\$|\$\s?(\d+([.,]\d+)?)/);

        if (match) {
            // Extract amount from both possible positions of the dollar sign and handle both dot and comma as decimal separator
            const amount = match[1] ? parseFloat(match[1].replace(',', '.')) : parseFloat(match[3].replace(',', '.'));

            if (amount > maxDeal.amount) {
                return { amount, deal: currentDeal };
            }
        }

        return maxDeal;
    }, { amount: -Infinity, deal: null });

    return highestDeal.deal;
}

async function getHighestDealEuro(userId, vouchesDB) {
    const acceptedVouches = vouchesDB.filter(
        (v) => v.recipientId === userId && v.status === 'accepted'
    );

    const highestDeal = acceptedVouches.reduce((maxDeal, currentDeal) => {
        // Updated regex to capture amount with euro sign (€) before or after the number
        const match = currentDeal.dealDetails.match(/(\d+(?:[.,]\d+)?)\s?€|€\s?(\d+(?:[.,]\d+)?)/);

        if (match) {
            // Extract amount from either position and handle both dot and comma as decimal separator
            const amount = match[1] ? parseFloat(match[1].replace(',', '.')) : parseFloat(match[2].replace(',', '.'));

            if (amount > maxDeal.amount) {
                return { amount, deal: currentDeal };
            }
        }

        return maxDeal;
    }, { amount: -Infinity, deal: null });

    return highestDeal.deal;
}









