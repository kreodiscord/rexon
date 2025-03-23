const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
    name: 'dwc',
    async execute(message, args) {
        if (!message.member.roles.cache.has('1335557128609599529')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to mark a user as DWC.'),
                ],
            });
        }

        let user =
            message.mentions.users.first() ||
            (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);

        // If user is still null, try fetching from the API forcefully
        if (!user && args[0]) {
            try {
                user = await message.client.users.fetch(args[0], { force: true });
            } catch (error) {
                console.error('Error fetching user from API:', error);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ Unable to fetch the user. Please check the ID and try again.'),
                    ],
                });
            }
        }

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
                        .setDescription('⚠️ Please provide a reason for marking the user as DWC.'),
                ],
            });
        }

        const dwcDB = loadDatabase(dwcPath);

        if (dwcDB.some((entry) => entry.userId === user.id)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ ${user.tag} is already marked as DWC.`),
                ],
            });
        }

        const newEntry = {
            userId: user.id,
            username: user.tag, // Always use fetched username
            reason: reason,
            markedBy: message.author.tag,
            timestamp: Date.now(),
        };
        dwcDB.push(newEntry);

        saveDatabase(dwcPath, dwcDB);

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(
                        `<:tickYes:1335562497268252682> | Successfully marked ${user.tag} (ID: ${user.id}) as DWC.`
                    )
                    .setFooter({ text: `Marked at ${new Date(newEntry.timestamp).toLocaleString()}` }),
            ],
        });

        const guild = message.client.guilds.cache.get("1333156680623591586");
        if (guild) {
            const channel = guild.channels.cache.get("1343289418961780768");
            if (channel) {
                try {
                    // Fetch message count from the channel
                    const messages = await channel.messages.fetch({ limit: 100 });
                    const totalMessages = messages.size + 1; // Next count number

                    const sentMessage = await channel.send(
                        `${totalMessages}. @${user.tag} : ${user.id} (${reason})`
                    );

                    // Save the message ID in the database
                    newEntry.messageId = sentMessage.id;
                    saveDatabase(dwcPath, dwcDB);
                } catch (err) {
                    console.error('Error fetching messages for DWC numbering:', err);
                }
            } else {
                console.error('DWC log channel not found.');
            }
        } else {
            console.error('Guild not found.');
        }
    },
};
