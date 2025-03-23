const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/vouches.json');
const importedDbPath = path.join(__dirname, '../database/imported.json');

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

function loadImportedDatabase() {
    if (fs.existsSync(importedDbPath)) {
        try {
            return JSON.parse(fs.readFileSync(importedDbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading imported database:', error);
            return [];
        }
    }
    return [];
}

function getMonthlyVouches(vouchesDB, currentMonth, currentYear) {
    const userVouches = {};

    for (const vouch of vouchesDB) {
        const vouchDate = new Date(vouch.timestamp);
        const vouchMonth = vouchDate.getMonth();
        const vouchYear = vouchDate.getFullYear();

        if (vouch.status === 'accepted' && vouchMonth === currentMonth && vouchYear === currentYear) {
            userVouches[vouch.recipientId] = (userVouches[vouch.recipientId] || 0) + 1;
        }
    }

    return Object.entries(userVouches)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
}

function getDailyVouches(vouchesDB, currentDay) {
    const userVouches = {};

    for (const vouch of vouchesDB) {
        const vouchDate = new Date(vouch.timestamp);
        const vouchDay = vouchDate.toDateString();

        if (vouch.status === 'accepted' && vouchDay === currentDay) {
            userVouches[vouch.recipientId] = (userVouches[vouch.recipientId] || 0) + 1;
        }
    }

    return Object.entries(userVouches)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
}

module.exports = {
    name: 'top',
    description: 'Shows the top 10 users with the most accepted vouches.',
    async execute(message) {
        const vouchesDB = loadDatabase();
        const importedDB = loadImportedDatabase();

        const userVouches = {};

        for (const vouch of vouchesDB) {
            if (vouch.status === 'accepted') {
                userVouches[vouch.recipientId] = (userVouches[vouch.recipientId] || 0) + 1;
            }
        }

        for (const [userId, count] of Object.entries(importedDB)) {
            userVouches[userId] = (userVouches[userId] || 0) + count;
        }

        const sortedUsers = Object.entries(userVouches)
            .filter(([, count]) => count > 0)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const leaderboard = await Promise.all(
            sortedUsers.map(async ([userId, count], index) => {
                try {
                    const user = await message.client.users.fetch(userId);
                    const username = user.tag;
                    return `${index + 1}. User: \`${username}\` | Count: \`${count}\``;
                } catch (error) {
                    console.error(`Error fetching user ${userId}:`, error);
                    return `${index + 1}. User: \`User ID: ${userId}\` | Count: \`${count}\``;
                }
            })
        );

        const leaderboardEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Vouch Bot Leaderboard')
            .setDescription(leaderboard.join('\n') || 'No accepted vouches found.')
            .setFooter({ text: 'Top 10 users with the most vouches' });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('vouch_leaderboard')
                .setPlaceholder('Choose a timeframe')
                .addOptions([
                    {
                        label: 'Monthly',
                        description: 'View the leaderboard for the current month',
                        value: 'monthly',
                    },
                    {
                        label: 'Daily',
                        description: 'View the leaderboard for today',
                        value: 'daily',
                    },
                    {
                        label: 'Lifetime',
                        description: 'View the overall leaderboard',
                        value: 'lifetime',
                    },
                ])
        );

        const sentMessage = await message.reply({ embeds: [leaderboardEmbed], components: [row] });

        const collector = sentMessage.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: "You can't interact with this menu. Only the command author can.",
                    ephemeral: true,
                });
            }

            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const currentDay = currentDate.toDateString();

            if (interaction.values[0] === 'monthly') {
                const monthlyUsers = getMonthlyVouches(vouchesDB, currentMonth, currentYear);

                const monthlyLeaderboard = await Promise.all(
                    monthlyUsers.map(async ([userId, count], index) => {
                        try {
                            const user = await message.client.users.fetch(userId);
                            const username = user.tag;
                            return `${index + 1}. User: \`${username}\` | Count: \`${count}\``;
                        } catch (error) {
                            console.error(`Error fetching user ${userId}:`, error);
                            return `${index + 1}. User: \`User ID: ${userId}\` | Count: \`${count}\``;
                        }
                    })
                );

                const monthlyEmbed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('Monthly Vouch Leaderboard')
                    .setDescription(monthlyLeaderboard.join('\n') || 'No accepted vouches found for this month.')
                    .setFooter({ text: `Month: ${currentDate.toLocaleString('default', { month: 'long' })}` });

                await interaction.update({ embeds: [monthlyEmbed], components: [row] });
            } else if (interaction.values[0] === 'daily') {
                const dailyUsers = getDailyVouches(vouchesDB, currentDay);

                const dailyLeaderboard = await Promise.all(
                    dailyUsers.map(async ([userId, count], index) => {
                        try {
                            const user = await message.client.users.fetch(userId);
                            const username = user.tag;
                            return `${index + 1}. User: \`${username}\` | Count: \`${count}\``;
                        } catch (error) {
                            console.error(`Error fetching user ${userId}:`, error);
                            return `${index + 1}. User: \`User ID: ${userId}\` | Count: \`${count}\``;
                        }
                    })
                );

                const dailyEmbed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('Daily Vouch Leaderboard')
                    .setDescription(dailyLeaderboard.join('\n') || 'No accepted vouches found for today.')
                    .setFooter({ text: 'Today\'s Leaderboard' });

                await interaction.update({ embeds: [dailyEmbed], components: [row] });
            } else if (interaction.values[0] === 'lifetime') {
                const lifetimeLeaderboard = await Promise.all(
                    sortedUsers.map(async ([userId, count], index) => {
                        try {
                            const user = await message.client.users.fetch(userId);
                            const username = user.tag;
                            return `${index + 1}. User: \`${username}\` | Count: \`${count}\``;
                        } catch (error) {
                            console.error(`Error fetching user ${userId}:`, error);
                            return `${index + 1}. User: \`User ID: ${userId}\` | Count: \`${count}\``;
                        }
                    })
                );

                const lifetimeEmbed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('Lifetime Vouch Leaderboard')
                    .setDescription(lifetimeLeaderboard.join('\n') || 'No accepted vouches found.')
                    .setFooter({ text: 'Overall Leaderboard' });

                await interaction.update({ embeds: [lifetimeEmbed], components: [row] });
            }
        });

        collector.on('end', () => {
            sentMessage.edit({ components: [] });
        });
    },
};
