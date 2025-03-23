const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/vouches.json');

function loadDatabase() {
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

function getStartOfMonthTimestamp() {
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0); 
    return now.getTime();
}

module.exports = {
    name: 'hot',
    description: 'Shows the top 10 users with the most accepted vouches in the current month.',
    async execute(message) {
        const vouchesDB = loadDatabase();
        const startOfMonthTimestamp = getStartOfMonthTimestamp();

       
        const userVouches = {};
        for (const vouch of vouchesDB) {
            if (vouch.status === 'accepted' && vouch.timestamp >= startOfMonthTimestamp) {
                userVouches[vouch.recipientId] = (userVouches[vouch.recipientId] || 0) + 1;
            }
        }

     
        const sortedUsers = Object.entries(userVouches)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

       
        const leaderboard = await Promise.all(
            sortedUsers.map(async ([userId, count], index) => {
                try {
                    const user = await message.client.users.fetch(userId);
                    const username = user.tag;
                     return `**${index + 1}.** User: \`${username}\` | Count: \`${count}\``;
                } catch (error) {
                    console.error(`Error fetching user ${userId}:`, error);
                    return `**${index + 1}. User ID: ${userId}** - \`${count} vouches\``;
                }
            })
        );

  
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    
        const leaderboardEmbed = new EmbedBuilder()
            .setColor(0x5865F2) 
            .setTitle(`Rexon Hot Leaderboard - ${currentMonth}`)
            .setDescription(
                leaderboard.join('\n') || 
                `No accepted vouches have been recorded in ${currentMonth}. Start vouching now!`
            )
            .setFooter({
                text: `Top 10 users • ${currentMonth}`,
                iconURL: message.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        message.reply({ embeds: [leaderboardEmbed] });
    },
};
