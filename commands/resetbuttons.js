const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const buttonsPath = path.join(__dirname, '../database/buttons.json');

// Function to load the buttons database
function loadDatabase() {
    if (fs.existsSync(buttonsPath)) {
        try {
            return JSON.parse(fs.readFileSync(buttonsPath, 'utf8'));
        } catch (error) {
            console.error('Error loading buttons database:', error);
            return {};
        }
    }
    return {};
}

// Function to save the buttons database
function saveDatabase(data) {
    try {
        fs.writeFileSync(buttonsPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving buttons database:', error);
    }
}

module.exports = {
    name: 'resetbutton',
    aliases: ['removebuttons', 'clearbuttons', 'resetbuttons'],
    description: 'Removes all buttons associated with the user.',
    async execute(message) {
        const userId = message.author.id;
        const buttonsDB = loadDatabase();

        // Check if user has buttons
        if (!buttonsDB[userId] || buttonsDB[userId].length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have any buttons to reset!')
                ]
            });
        }

        // Remove all buttons for the user
        delete buttonsDB[userId];
        saveDatabase(buttonsDB);

        // Send success message
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription('<:tick:1309435134499622912> | Successfully removed all your buttons.')
            ]
        });
    }
};
