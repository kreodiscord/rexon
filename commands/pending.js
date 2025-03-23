const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/vouches.json');

function loadDatabase(dbPath) {
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

module.exports = {
    name: 'pending',
    description: 'Shows pending vouches, optionally for a specific user.',
    async execute(message, args) {
        try {
            if (!message.member.roles.cache.has('1335556994781679617')) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ You need the required role to use this command.'),
                    ],
                });
            }

            const vouchesDB = loadDatabase(dbPath);

            let user;
            if (args.length > 0) {
                user =
                    message.mentions.users.first() ||
                    message.guild.members.cache.get(args[0]) ||
                    message.guild.members.cache.find(
                        (member) => member.user.username === args.join(' ')
                    )?.user;

                if (!user) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xff0000)
                                .setDescription('⚠️ Please provide a valid user mention, ID, or username.'),
                        ],
                    });
                }
            }

            const pendingVouches = user
                ? vouchesDB.filter((vouch) => vouch.status === 'pending' && vouch.recipientId === user.id)
                : vouchesDB.filter((vouch) => vouch.status === 'pending');

            if (pendingVouches.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setTitle('Pending Vouches')
                    .setDescription(
                        user
                            ? `There are no pending vouches for ${user.tag}.`
                            : 'There are no pending vouches at the moment.'
                    )
                    .setFooter({ text: 'Created by Kreo | Fraud Alert | .gg/FraudAlert' });

                return message.reply({ embeds: [embed] });
            }

            const vouchIds = pendingVouches.map((vouch) => vouch.id).join(', ');

            const embed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Pending Vouches')
                .setDescription(
                    user
                        ? `There are **${pendingVouches.length}** pending vouches for ${user.tag}.\nVouch IDs: ${vouchIds}`
                        : `There are **${pendingVouches.length}** pending vouches.\nVouch IDs: ${vouchIds}`
                )
                .setFooter({ text: 'Created by Kreo | Fraud Alert | .gg/FraudAlert' });

            const copyButton = new ButtonBuilder()
                .setCustomId('copy_vouch_ids')
                .setLabel('Copy')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(copyButton);

            const replyMessage = await message.reply({ embeds: [embed], components: [row] });

            // Create collector with 1-hour timeout
            const collector = replyMessage.createMessageComponentCollector({ time: 3600000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'copy_vouch_ids') {
                    await interaction.reply({
                        content: `${vouchIds}`,
                        ephemeral: false,
                    });
                }
            });

            collector.on('end', () => {
                replyMessage.edit({ components: [] }).catch(() => null);
            });

        } catch (error) {
            console.error('Error in pending command:', error);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ An error occurred while processing the command.'),
                ],
            });
        }
    },
};
