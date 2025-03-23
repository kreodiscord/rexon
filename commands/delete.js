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

function saveDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

module.exports = {
    name: 'delete',
    description: 'Deletes specified vouches by their ID.',
    async execute(message, args) {
       
        const allowedRoles = [
            '1335557082740690975',
        ];

    
        const hasRole = message.member.roles.cache.some(role => allowedRoles.includes(role.id));
        if (!hasRole) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ You do not have the required role to delete vouches.'),
                ],
            });
        }


        const vouchIds = args.map(arg => parseInt(arg, 10)).filter(id => !isNaN(id));

        if (vouchIds.length === 0 || vouchIds.length > 10) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Please provide between 1 and 10 valid vouch IDs to delete.'),
                ],
            });
        }

        const vouchesDB = loadDatabase();

 
        const deletedVouches = [];
        let remainingVouches = [...vouchesDB];

        vouchIds.forEach(vouchId => {
            const index = remainingVouches.findIndex(v => v.id === vouchId);
            if (index !== -1) {
                deletedVouches.push(remainingVouches[index]);
                remainingVouches.splice(index, 1);
            }
        });

        if (deletedVouches.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ No vouches found with the provided IDs.'),
                ],
            });
        }

     
        saveDatabase(remainingVouches);


        let deletedVouchesText = `The following vouches were deleted:\n\n`;
        deletedVouches.forEach(vouch => {
            deletedVouchesText += `Vouch ID: ${vouch.id} - Recipient: ${vouch.recipientId} - Status: ${vouch.status}\n`;
        });

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(deletedVouchesText),
            ],
        });
    },
};
