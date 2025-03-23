const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'policy',
    async execute(message) {
        if (message.author.id !== '1219880124351119373') {
            return;
        }

        const faqEmbed = new EmbedBuilder()
    .setColor('Blurple')
    .setTitle('Fraud Alert Server & Rexon Vouch Bot Policies')
    .setDescription(
        'Welcome to the official **Fraud Alert** server! Below, you can find the policies related to our server and the **Rexon** vouch bot.'
    )
            

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rpolicy')
                .setLabel('Report')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('vpolicy')
                .setLabel('Vouch')
                .setStyle(ButtonStyle.Primary)
        );

       
        await message.channel.send({ embeds: [faqEmbed], components: [buttons] });
    }
};