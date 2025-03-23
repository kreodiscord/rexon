const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const importedVouchesPath = path.join(__dirname, '../database/imported.json');

function loadImportedVouchesDatabase() {
    if (fs.existsSync(importedVouchesPath)) {
        try {
            return JSON.parse(fs.readFileSync(importedVouchesPath, 'utf8'));
        } catch (error) {
            console.error('Error loading imported vouches database:', error);
            return {};
        }
    }
    return {};
}

function saveImportedVouchesDatabase(data) {
    try {
        fs.writeFileSync(importedVouchesPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('Imported vouches database updated successfully!');
    } catch (error) {
        console.error('Error saving imported vouches database:', error);
    }
}

module.exports = {
    name: 'removeimported',
    description: 'Resets all imported vouches for a user.',
    async execute(message, args) {
        try {
            if (!message.member.roles.cache.has('1335557082740690975')) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ You do not have permission to remove imported vouches.'),
                    ],
                });
            }

            let targetUser = null;
            if (message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            } else if (args[0] && args[0].match(/^(\d{17,19})$/)) {
                targetUser = await message.client.users.fetch(args[0]).catch(() => null);
            } else {
                const users = await message.guild.members.fetch({ query: args[0], limit: 1 });
                if (users.size > 0) {
                    targetUser = users.first().user;
                }
            }

            if (!targetUser) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ Please mention a valid user, provide their ID, or type their username.'),
                    ],
                });
            }

            const importedVouchesDB = loadImportedVouchesDatabase();
            const userId = targetUser.id;

            if (!importedVouchesDB[userId] || importedVouchesDB[userId] <= 0) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription(`⚠️ ${targetUser.tag} does not have any imported vouches to reset.`),
                    ],
                });
            }

          
            delete importedVouchesDB[userId];

            saveImportedVouchesDatabase(importedVouchesDB);

            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setDescription(`✅ Successfully reset all imported vouches for ${targetUser.tag}.`),
                ],
            });
        } catch (error) {
            console.error('Error executing removeimported command:', error);
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
