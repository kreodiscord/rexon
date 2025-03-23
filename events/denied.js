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
    name: 'channelCreate',
    async execute(channel) {
        if (!channel.guild) return;

        console.log(`Channel created: ${channel.name} (ID: ${channel.id})`);

        // Check if channel is in the required category
        if (channel.parentId !== '1343292276398358598') return;
        console.log('Channel is inside the correct category.');

        // Check if channel name starts with "appeal-"
        if (!channel.name.startsWith('appeal-')) return;
        console.log('Channel name starts with "appeal-".');

        // Ensure the channel topic exists and is a valid numeric Discord ID
        if (!channel.topic || !/^\d{17,19}$/.test(channel.topic)) {
            console.log(`Invalid or missing channel topic: ${channel.topic}`);
            return;
        }

        const authorId = channel.topic.trim();
        console.log(`Extracted Author ID: ${authorId}`);

        // Wait for 3 seconds before sending the response
        await new Promise(resolve => setTimeout(resolve, 3000));

        const vouchesDB = loadDatabase();

        // Get all "denied" vouches for this user with the specific reason
        const deniedVouches = vouchesDB.filter(
            vouch =>
                vouch.recipientId === authorId &&
                vouch.status === 'denied' &&
                vouch.reason === "You took too long to verify. If this happens more regularly, you will be blacklisted from our vouch system."
        );

        if (!channel.permissionsFor(channel.guild.members.me)?.has('SendMessages')) {
            console.log('Bot lacks permission to send messages in this channel.');
            return;
        }

        if (deniedVouches.length > 0) {
            const embeds = deniedVouches.map(vouch => {
                return new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle(`Denied Vouch #${vouch.id}`)
                    .setDescription(
                        `**Recipient Tag:** ${vouch.recipientTag}\n**Recipient ID:** ${vouch.recipientId}\n\n` +
                        `**Giver Tag:** ${vouch.authorTag}\n**Giver ID:** ${vouch.authorId}\n\n` +
                        `**Vouch Type:** ❌ Denied\n**When:** <t:${Math.floor(vouch.timestamp / 1000)}:F> (<t:${Math.floor(vouch.timestamp / 1000)}:R>)\n\n` +
                        `**Comment:** ${vouch.dealDetails}\n**Reason:** ⚠️ You took too long to verify. If this happens more regularly, you will be blacklisted from our vouch system.`
                    )
                    .setFooter({ text: 'Automated Vouch Sending System | .gg/FraudAlert' });
            });

            for (const embed of embeds) {
                await channel.send({ embeds: [embed] });
            }

            console.log('Sent all denied vouches with specific reason for the user.');

            // Wait for 2 more seconds before sending the proof instructions
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Send proof requirements message
            const proofMessage = `**Required Proof:**\n` +
                `- Submit a **recent, uncropped screenshot** of your payment showing the entire screen with date and time visible. No edits or cropping are allowed.\n` +
                `- For **cryptocurrency payments**, include the **Transaction ID (TXID)**.\n` +
                `- For **SellAuth, Sellix, or auto-buy platforms**, blur customer details while keeping the payment proof uncropped.\n` +
                `- **Chat logs are not required**; only payment proof is necessary.\n\n` +
                `- **Submission Format:**\n` +
                `- Provide proof in the following format:\n` +
                `- **Vouch ID:** \`<Enter Vouch ID>\`\n` +
                `- **TXID (if crypto):** \`<Enter Transaction ID>\`\n` +
                `- **Payment Proof:** \`<Attach uncropped screenshot>\`\n\n` +
                `- **Verification:**\n` +
                `- Ensure the **date and time** on the screenshot match the provided vouch IDs.\n` +
                `- Reply to the vouch or mention the vouch ID when submitting proof.\n\n` +
                `- **Note:**\n` +
                `- Both an **uncropped screenshot** and **TXID** (for crypto) are mandatory.\n` +
                `- You have __**18 hours**__ to comply.\n\n` +
                `<@${authorId}>`;

            await channel.send(proofMessage);
            console.log('Sent proof requirements message.');
        } else {
            channel.send(`No denied manual vouches found, Kindly wait for a staff to continue.\n\n<@${authorId}>`);
            console.log('Sent no denied vouches found message.');
        }
    }
};
