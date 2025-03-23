const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const buttonsPath = path.join(__dirname, '../database/buttons.json');
const premiumPath = path.join(__dirname, '../database/premium.json');

// Load database helper function
function loadDatabase(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`Error loading database (${filePath}):`, error);
            return {};
        }
    }
    return {};
}

// Save database helper function
function saveDatabase(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error saving database (${filePath}):`, error);
    }
}

// List of blocked words (abusive, slang, defaming Fraud Alert/Rexon)
const blockedWords = [
    // English Abusive Words
    "fuck", "bitch", "asshole", "shit", "cunt", "bastard", "dumb", "retard", "pussy", "nigga", "whore", 
    "faggot", "twat", "slut", "dick", "cock", "motherfucker", "arse", "bollocks", "wanker", "tosser", 
    "cocksucker", "scam", "fraud", "kys", "die", "suicide", "kill", "pedo", "rape", "terrorist",
    "fake", "scammer", "hacker", "illegal", "haxor", "cheater", "exploiter",

    // Defaming Fraud Alert & Rexon
    "fuck fraud alert", "fraud alert is shit", "rexon is shit", "fuck rexon", "fraud alert is fake", 
    "scam alert is fake", "fraud alert scam", "rexon scam", "rexon fraud", "fraud alert fraud", 
    "fraud alert fake", "fraud alert trash", "fuck scam alert", "skidded", "copied", "stolen",

    // Hindi Abusive / Slangs
    "madarchod", "bhosdika", "bhosdike", "chutiya", "gandmasti", "behenchod", "lund", "randi", 
    "randi ka baccha", "chodu", "gandu", "chut", "bhenchod", "gaand", "teri maa ki", "teri behan ki", 
    "lund", "lauda", "laude", "chutmar", "jhantu", "gandmasti", "lodu", "chodna", "suar ka bachha", 
    "bhosadiwala", "chutiyapa", "chutiyapanti", "chodu", "gandfati", "teri gaand", "maa chod", "behn chod",
    "betichod", "bhadwa", "bhadwe", "chakkar", "harami", "haramkhor", "haraamzada", "haraamzadi", 
    "gand mein danda", "chinal", "chamakchallo", "randi ka beta", "chamaar", "kutta", "suar", "suar ka bachha"
];


// Convert blocked words to a regex pattern for better detection
const blockedRegex = new RegExp(blockedWords.map(word => `\\b${word}\\b`).join('|'), 'i');

module.exports = {
    name: 'addbutton',
    aliases: ['addbuttons'],
    description: 'Adds a custom button with a name and link.',
    async execute(message, args) {
        const buttonsDB = loadDatabase(buttonsPath);
        const premiumDB = loadDatabase(premiumPath);

        const userId = message.author.id;

        // Validate arguments
        if (args.length < 2) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Usage: `+addbutton <name> <link>`\nExample: `+addbutton MyShop https://example.com`')
                ]
            });
        }

        const buttonName = args[0].trim();
        const buttonLink = args[1].trim();

        // Check if the link is valid
        const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/;
        if (!urlRegex.test(buttonLink)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Invalid link! Please provide a valid URL starting with `http://` or `https://`.')
                ]
            });
        }

        // Block abusive/slang words in all languages
        if (blockedRegex.test(buttonName.toLowerCase())) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ The button name **${buttonName}** contains **prohibited words**! Choose a different name.`)
                ]
            });
        }

        // Ensure the user's button entry exists
        if (!buttonsDB[userId]) {
            buttonsDB[userId] = [];
        }

        // Check for duplicate button names
        if (buttonsDB[userId].some(button => button.name.toLowerCase() === buttonName.toLowerCase())) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(`⚠️ You already have a button named **${buttonName}**! Use a different name.`)
                ]
            });
        }

        // Premium check: Non-premium users can only have 1 button
        const isPremium = premiumDB[userId] && premiumDB[userId].expiresAt > Date.now();
        
        if (!isPremium && buttonsDB[userId].length >= 1) {
            const premiumEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('⚠️ Premium Required')
                .setDescription('You need a **Premium Subscription** to add more than 1 button.');

            const premiumButton = new ButtonBuilder()
                .setLabel('Get Premium')
                .setURL('https://discord.gg/FraudAlert') // Replace with actual premium link
                .setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder().addComponents(premiumButton);

            return message.reply({ embeds: [premiumEmbed], components: [row] });
        }

        // Save the new button
        buttonsDB[userId].push({ name: buttonName, link: buttonLink, addedAt: Date.now() });
        saveDatabase(buttonsPath, buttonsDB);

        // Confirmation embed
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(`Your custom button **${buttonName}** has been added successfully!`)
            ]
        });
    }
};
