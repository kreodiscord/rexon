const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const importedVouchesPath = path.join(__dirname, '../database/imported.json');
const logChannelId = '1343296615540199634'; // Channel where vouches will be logged

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
    name: 'importvouches',
    description: 'Imports a specified number of vouches for a user.',
    async execute(message, args) {
        try {
            if (!message.member.roles.cache.has('1335557082740690975')) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ You do not have permission to import vouches.'),
                    ],
                });
            }

            let targetUser = null;
            if (message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            } else if (args[0] && args[0].match(/^(\d{17,19})$/)) {
                targetUser = await message.client.users.fetch(args[0]).catch(() => null);
            }

            if (!targetUser) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ Please mention a valid user or provide their ID.'),
                    ],
                });
            }

            const vouchesToAdd = parseInt(args[1], 10);
            if (isNaN(vouchesToAdd) || vouchesToAdd <= 0) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ Please provide a valid number of vouches to import.'),
                    ],
                });
            }

            const importedVouchesDB = loadImportedVouchesDatabase();

            const userId = targetUser.id;
            if (importedVouchesDB[userId]) {
                importedVouchesDB[userId] += vouchesToAdd;
            } else {
                importedVouchesDB[userId] = vouchesToAdd;
            }

            saveImportedVouchesDatabase(importedVouchesDB);

            // Send a confirmation message
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setDescription(`✅ Successfully imported ${vouchesToAdd} vouches for ${targetUser.tag}.`),
                ],
            });

            // Fetch the logging channel
            const logChannel = message.client.channels.cache.get(logChannelId);
            if (!logChannel) {
                console.error(`Error: Log channel (${logChannelId}) not found.`);
                return;
            }

            // Fetch last 100 messages to determine count
            const messages = await logChannel.messages.fetch({ limit: 100 });
            const count = messages.size + 1; // Determine count dynamically

            // Send log message in the specified channel
            logChannel.send(`${count}. ${targetUser.username} (${userId}) - ${importedVouchesDB[userId]} Vouches.`);
        } catch (error) {
            console.error('Error executing importvouches command:', error);
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
