const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');


const badgesPath = path.join(__dirname, '../database/badges.json');


function loadBadgesDatabase() {
    if (fs.existsSync(badgesPath)) {
        try {
            return JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
        } catch (error) {
            console.error('Error loading badges database:', error);
            return {};
        }
    }
    return {};
}


function saveBadgesDatabase(data) {
    try {
        fs.writeFileSync(badgesPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('Badges database updated successfully!');
    } catch (error) {
        console.error('Error saving badges database:', error);
    }
}

module.exports = {
    name: 'addbadge',
    description: 'Assigns a badge to a user.',
    async execute(message, args) {
        try {
            
            if (!message.member.roles.cache.has('1335556900410101840')) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ You do not have permission to assign badges.'),
                    ],
                });
            }

            
            let targetUser = null;

            
            if (message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            }
         
            else if (args[0] && args[0].match(/^(\d{17,19})$/)) {
                targetUser = message.client.users.cache.get(args[0]) || await message.client.users.fetch(args[0]);
            }

            if (!targetUser) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ Please mention a user or provide their valid ID.'),
                    ],
                });
            }

            const badgeOptions = {
                'Owner': '<:DiscordOwner:1335566753736163348>',
                'Developer': '<:dev:1335554755782643732>',
                'Bughunter': '<:BugHunterLevel1:1335638342158520391>',
                'Staff': '<:staff3:1335565559420555264>',
                'Supporter': '<:EarlySupporter:1335566767115735103>',
                'Donator': '<:DonatorRoleIcon2:1335564805586817075>',
                'Booster': '<:booster:1335554573259243582>',
                'Admin': '<:Admin:1338576363443060908>'
            };
            const badgeName = args[1];

            if (!badgeName || !badgeOptions[badgeName]) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ Invalid badge name. Available options: ' + Object.keys(badgeOptions).join(', ') + '.'),
                    ],
                });
            }

            
            const badgesDB = loadBadgesDatabase();

           
            if (!badgesDB[targetUser.id]) {
                badgesDB[targetUser.id] = [];
            }

            
            const badgeWithEmoji = `${badgeOptions[badgeName]} ${badgeName}`;
            if (badgesDB[targetUser.id].includes(badgeWithEmoji)) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription(`⚠️ ${targetUser.tag} already has the ${badgeWithEmoji} badge.`),
                    ],
                });
            }

            
            badgesDB[targetUser.id].push(badgeWithEmoji);

           
            saveBadgesDatabase(badgesDB);

            
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setDescription(`✅ Successfully assigned the ${badgeWithEmoji} badge to ${targetUser.tag}.`),
                ],
            });
        } catch (error) {
            console.error('Error executing addbadges command:', error);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ There was an error while executing this command. Please try again later.'),
                ],
            });
        }
    },
};
