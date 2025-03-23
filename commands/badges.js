const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'badges',
    description: 'Displays badge descriptions.',
    execute(message) {
        const embed = new EmbedBuilder()
            .setTitle('Badge Descriptions')
            .setColor('Blurple')
            .setDescription(
                '<:50:1335922087197409280> 50+ Vouches\n' +
                '<:100vouch:1335921958319296592> 100+ Vouches\n' +
                '<:250:1335922165022982186> 250+ Vouches\n' +
                '<:500:1335922291191578635> 500+ Vouches\n' +
                '<:top10:1335922012274692108> Top-10 Vouches\n' +
                '<:members:1335554439041257482> Member\n' +
                '<:Admin:1338576363443060908> Admin\n' +
                '<:DiscordOwner:1335566753736163348> Owner\n' +
                '<:dev:1335554755782643732> Developer\n' +
                '<:BugHunterLevel1:1335638342158520391> Bughunter\n' +
                '<:staff3:1335565559420555264> Staff\n' +
                '<:EarlySupporter:1335566767115735103> Supporter\n' +
                '<:DonatorRoleIcon2:1335564805586817075> Donator\n' +
                '<:booster:1335554573259243582> Booster'
            );
        
        message.channel.send({ embeds: [embed] });
    }
};