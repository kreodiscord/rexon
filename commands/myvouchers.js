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

module.exports = {
    name: 'myvouchers',
    description: 'Shows users who have vouched for you with total counts of all statuses (pending, accepted, denied, manual).',
    async execute(message) {
        const vouchesDB = loadDatabase();

     
        const userVouches = vouchesDB.filter(vouch => vouch.recipientId === message.author.id);

       
        let vouchCounts = {};

       
        userVouches.forEach(vouch => {
            const vouchStatus = vouch.status;
            const vouchUser = vouch.authorTag;  

            if (!vouchCounts[vouchUser]) {
                vouchCounts[vouchUser] = {
                    accepted: 0,
                    pending: 0,
                    denied: 0,
                    manual: 0
                };
            }

            vouchCounts[vouchUser][vouchStatus]++;
        });

      
        if (Object.keys(vouchCounts).length === 0) {
            return message.reply("No users have vouched for you.");
        }

       
        let vouchHistory = '';
        let index = 1;

        for (const user in vouchCounts) {
            const counts = vouchCounts[user];
            const totalVouches = counts.accepted + counts.pending + counts.denied + counts.manual;
            vouchHistory += `${index}. ${user}: \`${totalVouches}\`\n`;
            index++;
        }


        const vouchEmbed = new EmbedBuilder()
            .setColor(0x5865F2)  
            .setTitle('Vouch History')
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL(),
            })
            .setDescription(vouchHistory + '\n\n⚠️ **Note:** This contains vouches of all statuses (denied, accepted, pending, manual) but doesn’t include imported vouches.')
            .setFooter({
                text: `Requested by ${message.author.tag}`,
                iconURL: message.client.user.displayAvatarURL(),
            });

        message.reply({ embeds: [vouchEmbed] });
    },
};

