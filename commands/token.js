const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dbPath = path.join(__dirname, '../database/tokens.json');

// Load database (tokens.json)
function loadDatabase() {
    if (fs.existsSync(dbPath)) {
        try {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading database:', error);
            return {};  // Return an empty object in case of error
        }
    }
    return {};  // Return an empty object if file doesn't exist
}

// Save database (tokens.json)
function saveDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

module.exports = {
    name: 'token',
    description: 'Generate and assign a unique token for the user.',
    async execute(message) {
        try {
            let tokensDB = loadDatabase();
            const authorId = message.author.id;

            // Check if the user already has a token
            if (tokensDB[authorId]) {
                const existingToken = tokensDB[authorId].token;
                const dmChannel = await message.author.createDM();

                const embed = new EmbedBuilder()
                    .setTitle('Profile Recovery Token')
                    .setDescription(`**Token:** ${existingToken}`)
                    .setFooter({ text: 'This 40-digit string is unique to you, Copy it and keep it safe!' })
                    .setColor('Blurple');

                await dmChannel.send({ embeds: [embed] });
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x57f287)
                            .setDescription('Your recovery token has been successfully sent to your DMs.'),
                    ],
                });
            }

            // Generate a unique 40-digit token
            let token;
            do {
                token = crypto.randomBytes(20).toString('hex'); // 40 characters
            } while (Object.values(tokensDB).some(item => item.token === token)); // Ensure no collision

            // Save the new token to the database
            tokensDB[authorId] = {
                token,
                authorId,
                authorUsername: message.author.username,
                createdAt: new Date().toISOString(),
            };
            saveDatabase(tokensDB);

            // Send the new token to the user via DM
            const dmChannel = await message.author.createDM();
            const embed = new EmbedBuilder()
                .setTitle('Profile Recovery Token')
                .setDescription(`**Token:** ${token}`)
                .setFooter({ text: 'This 40-digit string is unique to you, Copy it and keep it safe!' })
                .setColor('Blurple');

            await dmChannel.send({ embeds: [embed] });

            // Confirm success in the channel
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x57f287)
                        .setDescription('Your recovery token has been successfully sent to your DMs.'),
                ],
            });

        } catch (error) {
            console.error('Error generating or sending token:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ There was an error while processing your token. Make sure your DMes are opened.'),
                ],
            });
        }
    },
};

