const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'report',
    async execute(message) {
        const reportEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('How do I report someone?')
            .setDescription(`Head over to [our server](https://discord.gg/FraudAlert) to report a user!`)
            .setFooter({ text: 'Created by Kreo | Fraud Alert | .gg/FraudAlert' });

        message.reply({ embeds: [reportEmbed] });
    },
};
