const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const paymentsDbPath = path.join(__dirname, '../database/payments.json');

function loadDatabase() {
    if (fs.existsSync(paymentsDbPath)) {
        try {
            return JSON.parse(fs.readFileSync(paymentsDbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading database:', error);
            return {};
        }
    }
    return {};
}

module.exports = {
    name: 'payments',
    aliases: ['payment'],
    description: 'View payment methods of a user.',
    async execute(message, args) {
        const paymentsDB = loadDatabase();
        const userId = args[0] ? args[0].replace(/[<@!>]/g, '') : message.author.id; // Handles user mention or ID

        if (!paymentsDB[userId]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | No payment methods found for this user.'),
                ],
            });
        }

        const paymentMethods = paymentsDB[userId].payments;

        // Get the username to display
        try {
            const user = await message.client.users.fetch(userId);
            const username = user.username;

            // Create the button
            const button = new ButtonBuilder()
                .setCustomId(`viewPaymentMethods_${userId}`)
                .setLabel('Payment Methods')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(button);

            // Send a message with the button
            const msg = await message.reply({
                content: `Click the below button to view Payment Methods of ${username}.`,
                components: [row],
            });

            // Collector to handle button press
            const filter = (interaction) =>
                interaction.customId === `viewPaymentMethods_${userId}` && interaction.user.id === message.author.id;

            const collector = msg.createMessageComponentCollector({ filter, time: 120000 });

            collector.on('collect', async (interaction) => {
                if (!interaction.isButton()) return;

                await interaction.reply({
                    content: `${paymentMethods}`,
                    ephemeral: true
                });
            });

            collector.on('end', () => {
                // Disable the button after the collector ends
                const disabledButton = new ButtonBuilder()
                    .setCustomId(`viewPaymentMethods_${userId}`)
                    .setLabel('Payment Methods')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);

                const rowWithDisabledButton = new ActionRowBuilder().addComponents(disabledButton);

                msg.edit({
                    content: `Click the below button to view Payment Methods of ${username}.`,
                    components: [rowWithDisabledButton],
                }).catch(() => {});
            });

        } catch (error) {
            console.error('Error fetching user:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ | Something went wrong while fetching the user.'),
                ],
            });
        }
    },
};
