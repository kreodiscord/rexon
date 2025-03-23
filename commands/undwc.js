const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const dwcPath = path.join(__dirname, '../database/dwc.json');

function loadDatabase(dbPath) {
    if (fs.existsSync(dbPath)) {
        try {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (error) {
            console.error(`Error loading database (${dbPath}):`, error);
            return [];
        }
    }
    return [];
}

function saveDatabase(dbPath, data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error saving database (${dbPath}):`, error);
    }
}

module.exports = {
    name: 'undwc',
    description: 'Remove a user from the DWC list.',
    async execute(message, args) {
        if (!message.member.roles.cache.has("1335557128609599529")) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role.'),
                ],
            });
        }

        const user =
            message.mentions.users.first() ||
            (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);

        if (!user) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please mention a user or provide a valid user ID.'),
                ],
            });
        }

        const dwcDB = loadDatabase(dwcPath);

        const userIndex = dwcDB.findIndex((entry) => entry.userId === user.id);
        if (userIndex === -1) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ ${user.tag} is not on the DWC list.`),
                ],
            });
        }

        const userEntry = dwcDB[userIndex];

        dwcDB.splice(userIndex, 1);

        saveDatabase(dwcPath, dwcDB);

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                   
                    .setDescription(`<:tickYes:1335562497268252682> | Successfully removed dwc from ${user.tag} (ID: ${user.id}).`)
                    .setFooter({ text: `Removed at ${new Date().toLocaleString()}` }),
            ],
        });

        // Edit the DWC message to strike through
        const guild = message.client.guilds.cache.get("1333156680623591586");
        if (guild) {
            const channel = guild.channels.cache.get("1343289418961780768");
            if (channel) {
                try {
                    const messageToEdit = await channel.messages.fetch(userEntry.messageId);
                    await messageToEdit.edit({
                        content: `~~${messageToEdit.content}~~`, 
                    });
                } catch (error) {
                    console.error('Error fetching or editing the DWC message:', error);
                }
            } else {
                console.error('DWC log channel not found.');
            }
        } else {
            console.error('Guild not found.');
        }
    },
};
