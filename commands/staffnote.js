const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const staffNotePath = path.join(__dirname, '../database/staffnotes.json');

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

function saveDatabase(dbPath, data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error saving database (${dbPath}):`, error);
    }
}

module.exports = {
    name: 'staffnote',
    async execute(message, args) {
        if (!message.member.roles.cache.has('1335557128609599529')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to use this command.'),
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

        const staffNotesDB = loadDatabase(staffNotePath);

        if (args.length === 1) {
            delete staffNotesDB[user.id];
            saveDatabase(staffNotePath, staffNotesDB);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setDescription(`<:tickYes:1335562497268252682> | Successfully updated staff note for ${user.tag} (ID: ${user.id}).`),
                ],
            });
        }

        const note = args.slice(1).join(' ');
        staffNotesDB[user.id] = {
            userId: user.id,
            username: user.tag,
            note: note,
            notedBy: message.author.tag,
            timestamp: Date.now(),
        };

        saveDatabase(staffNotePath, staffNotesDB);

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(`<:tickYes:1335562497268252682> | Successfully updated staff note for ${user.tag} (ID: ${user.id}).`)
                  
            ],
        });
    },
};
