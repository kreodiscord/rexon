const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

function loadDatabase() {
    try {
        const data = fs.readFileSync(path.join(__dirname, '../database/vouches.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading vouches database:', error);
        return null;
    }
}

module.exports = {
    name: 'stats',
    aliases: ['botinfo', 'bi'],
    description: 'Shows bot statistics, system info, and vouch stats.',
    async execute(message) {
        const vouches = loadDatabase();
        if (!vouches) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Failed to load vouch data. Please try again later.')
                ],
            });
        }

        const totalSeconds = Math.floor(process.uptime());
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
        const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2);
        const totalCpuUsage = os.loadavg()[0].toFixed(2);

        const totalUsers = message.client.guilds.cache.reduce((sum, guild) => sum + guild.memberCount, 0);
        const cachedUsers = message.client.users.cache.size;
        const totalServers = message.client.guilds.cache.size;
        const totalChannels = message.client.channels.cache.size;
        const textChannels = message.client.channels.cache.filter(ch => ch.type === 0).size;
        const voiceChannels = message.client.channels.cache.filter(ch => ch.type === 2).size;
        const ping = Math.round(message.client.ws.ping);

        const dbStart = performance.now();
        let dbPing;
        try {
            fs.readFileSync(path.join(__dirname, '../database/vouches.json'), 'utf8');
            dbPing = `${(performance.now() - dbStart).toFixed(2)}ms`;
        } catch (error) {
            console.error('Error reading vouches.json:', error);
            dbPing = 'Error';
        }

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setDescription(
                `[Rexon Official Support Server](https://discord.gg/fraudalert)\n\n` +
                `**Latest Changes:**\n[\`a6eh4a\`](https://discord.gg/fraudalert) Shifted to better VPS! <t:1740751800:F>\n\n` +
                `**__Rexon Information__**\n` +
                `<a:bluedot:1340520574182490183> **Servers**: ${totalServers}\n` +
                `<a:bluedot:1340520574182490183> **Uptime**: ${uptime}\n` +
                `<a:bluedot:1340520574182490183> **Members**: ${totalUsers} (${cachedUsers} cached)\n` +
                `<a:bluedot:1340520574182490183> **Channels**: ${totalChannels} (Text: ${textChannels}, Voice: ${voiceChannels})\n` +
                `<a:bluedot:1340520574182490183> **Ping**: ${ping}ms (DB Ping: ${dbPing})\n` +
                `<a:bluedot:1340520574182490183> **Total Ram**: ${totalRam} MB\n` +
                `<a:bluedot:1340520574182490183> **Used Ram**: ${usedRam} MB\n` +
                `<a:bluedot:1340520574182490183> **CPU**: ${totalCpuUsage}%\n\n` +
                `**__Version Information__**\n` +
                `<:emoji_48:1345005714170576966> **Bot Version**: v2.1.5\n` +
                `<:djs:1345005841014722610> **Discord.js**: v14.18.0\n` +
                `<:nodeJS:1345005883058552862> **Node.js**: v18.19.1`
            )
            .setFooter({ text: 'Rexon Stats', iconURL: message.client.user.displayAvatarURL() })
            .setTimestamp();

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

        message.reply({ embeds: [embed], components: [row] });
    },
};
