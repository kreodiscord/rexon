const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'scheck',
    description: 'Scammer check command (only for 1219880124351119373)',
    async execute(message) {
        // Check if the user is authorized
        if (message.author.id !== '1219880124351119373') {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have permission to use this command.')
                ],
            });
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle('Scammer Check')
            .setDescription(
                'To check if a user is a scammer, use the methods below!\n' +
                '> 1. Use `+p <mention/id>`\n' +
                '> 2. Copy the user\'s ID and check in either <#1335499569756110848> or <#1335499592359219252>.\n' +
                '> 3. Click the button below and paste the user ID in the form.'
            )
            .setFooter({ text: 'Fraud Alert' })
            .setColor('Blurple');

        // Create button
        const button = new ButtonBuilder()
            .setCustomId('scammer_check')
            .setLabel('Scammer Check')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(button);

        // Send embed with button
        message.channel.send({ embeds: [embed], components: [row] });
    },
};
