const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/blacklisted.json');

function loadDatabase() {
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

function saveDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

module.exports = {
    name: 'blacklist',
    aliases: ['bl'],
    description: 'Blacklist a user by ID or mention.',
    async execute(message, args) {
        if (!message.member.roles.cache.has('1335557128609599529')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to blacklist users.'),
                ],
            });
        }


        const targetUser =
            message.mentions.users.first() ||
            (args[0] ? await message.client.users.fetch(args[0]).catch(() => null) : null);

        if (!targetUser) {
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
                        .setDescription('⚠️ Please provide a reason for blacklisting the user.'),
                ],
            });
        }

    
        const blacklistDB = loadDatabase();

       
        if (blacklistDB.some((entry) => entry.id === targetUser.id)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ \`${targetUser.tag}\` is already blacklisted.`),
                ],
            });
        }

     
        blacklistDB.push({ id: targetUser.id, tag: targetUser.tag, reason, timestamp: Date.now() });
        saveDatabase(blacklistDB);

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(`✅ \`${targetUser.tag}\` has been blacklisted for the following reason:\n\`\`\`${reason}\`\`\``),
            ],
        });
    },
};
