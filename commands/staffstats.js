const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../database/vouches.json');

module.exports = {
    name: 'staffstats',
    aliases: ['ss'],
    description: 'Check a staff member’s vouch review stats',
    async execute(message, args) {
        if (!message.member.roles.cache.has('1335633435460501617')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have permission to use this command.'),
                ],
            });
        }

        let user =
            message.mentions.users.first() ||
            (args[0]
                ? await message.client.users.fetch(args[0]).catch(() => null) ||
                  message.client.users.cache.find(
                      (u) => u.username.toLowerCase() === args[0].toLowerCase()
                  )
                : null) ||
            message.author;

        if (!user) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a valid user ID or mention a user.'),
                ],
            });
        }

        // Load database fresh every time
        let vouchesDB = [];
        if (fs.existsSync(dbPath)) {
            try {
                vouchesDB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            } catch (error) {
                console.error('Error loading database:', error);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ Error loading vouch data. Please try again later.'),
                    ],
                });
            }
        }

        // Ensure every vouch has reviewerId, otherwise default to empty string
        let reviewed = vouchesDB.filter((v) => v.reviewerId === user.id).length;
        let accepted = vouchesDB.filter((v) => v.reviewerId === user.id && v.status === 'accepted').length;
        let denied = vouchesDB.filter((v) => v.reviewerId === user.id && v.status === 'denied').length;

        // Create embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${user.username}'s Vouch Staff Stats`, iconURL: user.displayAvatarURL() })
            .setColor(0x2b2d30)
            .setDescription(
                `**Vouch Stats**\n\n**Reviewed:** ${reviewed}\n**Accepted:** ${accepted}\n**Denied:** ${denied}`
            );

        return message.reply({ embeds: [embed] });
    },
};
