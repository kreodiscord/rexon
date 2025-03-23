const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'inv',
    aliases: ['invite'],
    async execute(message, args) {
        try {
            // Create the embed
            const helpEmbed = new EmbedBuilder()
                .setColor(0x5865F2)  // You can change the color as per preference
                .setTitle('Rexon Invites')
                .setDescription(`**Discord Invite**\n[Click Here](https://discord.com/oauth2/authorize?client_id=1335553466059325532&permissions=412317142080&integration_type=0&scope=bot)\n**Server Invite**\n[Click Here](https://discord.gg/FraudAlert)`)
                .setFooter({ text: 'Created by Kreo | Fraud Alert | .gg/FraudAlert' });

            // Create the buttons
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Bot Invite')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=1335553466059325532&permissions=412317142080&integration_type=0&scope=bot'),
                new ButtonBuilder()
                    .setLabel('Server Invite')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/FraudAlert')
            );

            // Send the embed with buttons as a reply
            await message.reply({ embeds: [helpEmbed], components: [row] });
        } catch (error) {
            console.error('Error in help command:', error);
            message.reply('There was an error while executing this command!');
        }
    },
};
