const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const vouchesPath = path.join(__dirname, '../database/vouches.json');

function loadVouchesDatabase() {
    try {
        if (!fs.existsSync(vouchesPath)) {
            fs.writeFileSync(vouchesPath, JSON.stringify([], null, 2), 'utf8');
        }
        return JSON.parse(fs.readFileSync(vouchesPath, 'utf8'));
    } catch (error) {
        console.error('Error loading vouches database:', error);
        return [];
    }
}

function saveVouchesDatabase(data) {
    try {
        fs.writeFileSync(vouchesPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving vouches database:', error);
    }
}

module.exports = {
    name: 'insertrexon',
    description: 'Insert vouch data into the vouches database.',
    async execute(message) {
        if (!['1219880124351119373', '1307136740904927312'].includes(message.author.id)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Only the developer can use this command.')
                ]
            });
        }

        const args = message.content.split(' ');
        const userMention = args[1];
        if (!userMention) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please mention a user or provide their ID.')
                ]
            });
        }

        const recipientId = userMention.replace(/[<@!>]/g, '');
        const recipient = await message.guild.members.fetch(recipientId).catch(() => null);
        const recipientTag = recipient ? recipient.user.tag : null;
        if (!recipientTag) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Could not find the mentioned user.')
                ]
            });
        }

        if (!message.attachments.size) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please attach a .txt file containing the vouch data.')
                ]
            });
        }

        const attachment = message.attachments.first();
        if (!attachment.name.endsWith('.txt')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ The attached file must be a .txt file.')
                ]
            });
        }

        try {
            const response = await fetch(attachment.url);
            const textData = await response.text();
            const vouchEntries = extractVouchDetails(textData);
            if (!vouchEntries.length) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ No valid vouch entries found in the file.')
                    ]
                });
            }

            const vouchesDB = loadVouchesDatabase();
            vouchEntries.forEach(vouchDetails => {
                vouchesDB.push({
                    id: parseInt(vouchDetails.vouchId, 10),
                    timestamp: Date.now(),
                    authorId: vouchDetails.authorId,
                    authorTag: vouchDetails.authorTag,
                    recipientId: recipientId,
                    recipientTag: recipientTag,
                    dealDetails: vouchDetails.comment,
                    status: 'accepted',
                    reason: 'N/A',
                });
            });
            saveVouchesDatabase(vouchesDB);

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x57f287)
                        .setDescription(`✅ Successfully inserted ${vouchEntries.length} vouches into the database.`)
                ]
            });
        } catch (error) {
            console.error('Error processing the vouch file:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Error reading or processing the file.')
                ]
            });
        }
    }
};

function extractVouchDetails(text) {
    const vouchEntries = [];
    const vouchBlocks = text.split('------------');

    vouchBlocks.forEach(block => {
        const vouchIdMatch = block.match(/Vouch ID:\s*(\d+)/);
        const authorMatch = block.match(/Author:\s*([\w\d]+)\s*\((\d+)\)/);
        const commentMatch = block.match(/Comment:\s*(.*)/);
        const statusMatch = block.match(/Status:\s*(accepted|denied|manual)/);

        if (vouchIdMatch && authorMatch && commentMatch && statusMatch) {
            vouchEntries.push({
                vouchId: vouchIdMatch[1],
                authorTag: authorMatch[1],
                authorId: authorMatch[2],
                comment: commentMatch[1],
                status: statusMatch[1],
            });
        }
    });
    return vouchEntries;
}
