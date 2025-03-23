const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
    name: 'mark',
    async execute(message, args) {
        if (!message.member.roles.cache.has('1335557128609599529')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to mark a user as a scammer.'),
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

        const reason = args.slice(1).join(' ');
        if (!reason) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a reason for marking the user as a scammer.'),
                ],
            });
        }

        const scammerDB = loadDatabase(scammerPath);

        if (scammerDB.some((entry) => entry.userId === user.id)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ ${user.tag} is already marked as a scammer.`),
                ],
            });
        }

        const newEntry = {
            userId: user.id,
            username: user.tag,
            reason: reason,
            markedBy: message.author.tag,
            timestamp: Date.now(),
        };
        scammerDB.push(newEntry);

        saveDatabase(scammerPath, scammerDB);

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(
                        `<:tickYes:1335562497268252682> | Successfully marked ${user.tag} (ID: ${user.id}).`
                    )
                    .setFooter({ text: `Marked at ${new Date(newEntry.timestamp).toLocaleString()}` }),
            ],
        });

        const channel = message.client.channels.cache.get('1343289341887254660');
        if (channel) {
            try {
                // Fetch total messages in the scammer log channel
                const messages = await channel.messages.fetch({ limit: 100 });
                const count = messages.size + 1; // Get total messages & increment by 1

                const sentMessage = await channel.send(
                    `${count}. @${user.tag} : ${user.id} (${reason})`
                );

                // Save the sent message ID to the database
                newEntry.messageId = sentMessage.id;
                saveDatabase(scammerPath, scammerDB);
            } catch (error) {
                console.error('Error fetching message count from scammer log channel:', error);
            }
        } else {
            console.error('Scammer log channel not found.');
        }
    },
};
