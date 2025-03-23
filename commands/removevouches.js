const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');


const vouchesPath = path.join(__dirname, '../database/vouches.json');


function loadVouchesDatabase() {
    if (fs.existsSync(vouchesPath)) {
        try {
            return JSON.parse(fs.readFileSync(vouchesPath, 'utf8'));
        } catch (error) {
            console.error('Error loading vouches database:', error);
            return [];
        }
    }
    return [];
}

function saveVouchesDatabase(data) {
    try {
        fs.writeFileSync(vouchesPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('Vouches database updated successfully!');
    } catch (error) {
        console.error('Error saving vouches database:', error);
    }
}

module.exports = {
    name: 'removevouches',
    description: 'Removes all vouches received by a user.',
    async execute(message, args) {
        try {
      
            if (!message.member.roles.cache.has('1335557082740690975')) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ You do not have permission to remove vouches.'),
                    ],
                });
            }

           
            let targetUser = null;

            
            if (message.mentions.users.size > 0) {
                targetUser = message.mentions.users.first();
            }
         
            else if (args[0] && args[0].match(/^(\d{17,19})$/)) {
                targetUser = message.client.users.cache.get(args[0]) || await message.client.users.fetch(args[0]);
            }

            if (!targetUser) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('⚠️ Please mention a user or provide their valid ID.'),
                    ],
                });
            }

            
            const vouchesDB = loadVouchesDatabase();

            
            const updatedVouchesDB = vouchesDB.filter(vouch => vouch.recipientId !== targetUser.id);

            
            if (vouchesDB.length === updatedVouchesDB.length) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription(`⚠️ ${targetUser.tag} has no received vouches to remove.`),
                    ],
                });
            }

            
            saveVouchesDatabase(updatedVouchesDB);

           
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Blurple')
                        .setDescription(`✅ Successfully removed all received vouches for ${targetUser.tag}.`),
                ],
            });
        } catch (error) {
            console.error('Error executing removevouches command:', error);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ There was an error while executing this command. Please try again later.'),
                ],
            });
        }
    },
};
