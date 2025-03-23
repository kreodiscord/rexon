const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const https = require('https');

const gifPath = path.join(__dirname, '../database/gif.json');

function loadDatabase() {
    if (fs.existsSync(gifPath)) {
        try {
            return JSON.parse(fs.readFileSync(gifPath, 'utf8'));
        } catch (error) {
            console.error('Error loading GIF database:', error);
            return {};
        }
    }
    return {};
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(gifPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('GIF database updated successfully!');
    } catch (error) {
        console.error('Error saving GIF database:', error);
    }
}

function isValidImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const contentType = res.headers['content-type'];
            if (contentType && (contentType.includes('image/gif') || contentType.includes('image/'))) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = {
    name: 'image',
    async execute(message) {
        if (message.attachments.size === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | No attachment found. Please attach an image or GIF file.'),
                ],
            });
        }

        const attachment = message.attachments.first();

        const isImageFile = await isValidImage(attachment.url);
        if (!isImageFile) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | The attached file is not a valid image or GIF. Please attach a valid file.'),
                ],
            });
        }

        const gifDB = loadDatabase();
        console.log('Loaded GIF Database:', gifDB);

        const newImage = {
            url: attachment.url,
            addedBy: message.author.tag,
            timestamp: Date.now(),
        };
        gifDB[message.author.id] = newImage;
        console.log('Updated Database:', gifDB);

        saveDatabase(gifDB);

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setDescription('<:tickYes:1335562497268252682> | Successfully updated your image/GIF.'),
            ],
        });
    },
};
