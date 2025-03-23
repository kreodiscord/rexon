const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'verify',
    async execute(message) {
        const requiredGuildId = '1327975540963020800';

     
        if (message.guild.id !== requiredGuildId) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ This command can only be used in the support server.'),
                ],
            });
        }

 
        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You need the **Manage Guild** permission to use this command.'),
                ],
            });
        }


       const verificationEmbed = new EmbedBuilder()
    .setColor(0x2b2d30)
    .setAuthor({
        name: 'Rexon',
        iconURL: message.guild.iconURL({ dynamic: true }),
    })
    .setTitle('Verification')
    .setDescription('Click the button below to get verified.')
    .setFooter({ text: 'Created by Kreo | Fraud Alert | .gg/FraudAlert' })
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setImage('https://i.imgur.com/kZ8IEWl.gif')



        const verifyButton = new ButtonBuilder()
            .setCustomId('verify')
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success);

        const actionRow = new ActionRowBuilder().addComponents(verifyButton);

        message.channel.send({
            embeds: [verificationEmbed],
            components: [actionRow],
        });
    },
};
