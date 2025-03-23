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
    name: 'removebadges',
    description: 'Removes all badges from a user.',
    async execute(message, args) {
        try {
            
            if (!message.member.roles.cache.has('1335556900410101840')) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ You do not have permission to remove badges.'),
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

            
            const badgesDB = loadBadgesDatabase();

            
            if (!badgesDB[targetUser.id] || badgesDB[targetUser.id].length === 0) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription(`⚠️ ${targetUser.tag} has no badges to remove.`),
                    ],
                });
            }

            
            badgesDB[targetUser.id] = [];

           
            saveBadgesDatabase(badgesDB);

            
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setDescription(`✅ Successfully removed all badges from ${targetUser.tag}.`),
                ],
            });
        } catch (error) {
            console.error('Error executing removebadges command:', error);
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
