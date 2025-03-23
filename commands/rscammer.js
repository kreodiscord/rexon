const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const scammerPath = path.join(__dirname, '../database/scammers.json');

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
    name: 'unmark',
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

        const scammerDB = loadDatabase(scammerPath);

        const userIndex = scammerDB.findIndex((entry) => entry.userId === user.id);
        if (userIndex === -1) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ ${user.tag} is not marked as a scammer.`),
                ],
            });
        }

        const removedEntry = scammerDB.splice(userIndex, 1)[0];

        saveDatabase(scammerPath, scammerDB);

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    
                    .setDescription(
                        `<:tickYes:1335562497268252682> | Successfully unmarked ${user.tag} (ID: ${user.id}).`
                    )
                    .setFooter({ text: `Removed at ${new Date().toLocaleString()}` }),
            ],
        });

        // Fetch the message from the scammer channel using the messageId from the database
        const guild = message.client.guilds.cache.get("1333156680623591586");
        if (guild) {
            const channel = guild.channels.cache.get("1343289341887254660");
            if (channel) {
                try {
                    const scamMessage = await channel.messages.fetch(removedEntry.messageId);

                    // Edit the message and add ~~ to strike through the text
                    await scamMessage.edit(`~~${scamMessage.content}~~`);
                } catch (error) {
                    console.error('Error fetching or editing the scam message:', error);
                }
            } else {
                console.error('Channel not found in the guild.');
            }
        } else {
            console.error('Guild not found.');
        }
    },
};
