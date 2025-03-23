const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const profilePath = path.join(__dirname, '../database/profile.json');

function loadDatabase(dbPath) {
    if (fs.existsSync(dbPath)) {
        try {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading database:', error);
            return {};
        }
    }
    return {};
}

module.exports = {
    name: 'search',
    description: 'Search for users with the same product in their profiles.',
    async execute(message, args) {
        let profileDB = loadDatabase(profilePath);

        const query = args.join(' ');

        if (!query) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide a search query.'),
                ],
            });
        }

        const matchingUsers = [];

        for (const userId in profileDB) {
            const userProfile = profileDB[userId];
            if (userProfile.products && userProfile.products.toLowerCase().includes(query.toLowerCase())) {
                matchingUsers.push(userId);
            }
        }

        if (matchingUsers.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ No users found with the product: **${query}**.`),
                ],
            });
        }

        const results = await Promise.all(
            matchingUsers.map(async (userId) => {
                try {
                    const user =
                        message.client.users.cache.get(userId) ||
                        (await message.client.users.fetch(userId));
                    return `[${user.tag}](https://discord.com/users/${userId})`;
                } catch (error) {
                    console.error(`Error fetching user ${userId}:`, error);
                    return null;
                }
            })
        );

        const filteredResults = results.filter(Boolean);

        if (filteredResults.length > 20) {
            let fileContent = `Users with product: ${query}\n\n${filteredResults.join('\n')}`;
            const attachment = Buffer.from(fileContent, 'utf8');
            const attachmentFile = { attachment, name: 'search_results.txt' };

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865F2)
                        .setDescription(`Found **${filteredResults.length}** users with the product: **${query}**.`),
                ],
                files: [attachmentFile],
            });
        } else {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865F2)
                        .setTitle('Search Results')
                        .setDescription(
                            `Found **${filteredResults.length}** results for **${query}!**\n${filteredResults.join('\n')}`
                        ),
                ],
            });
        }
    },
};
