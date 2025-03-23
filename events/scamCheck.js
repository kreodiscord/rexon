const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const scammersPath = path.join(__dirname, '../database/scammers.json');
const dwcPath = path.join(__dirname, '../database/dwc.json');

function loadDatabase(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`Error loading database (${filePath}):`, error);
            return [];
        }
    }
    return [];
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        try {
            if (!interaction.isButton() && !interaction.isModalSubmit()) return;

            // Handle button interaction
            if (interaction.isButton() && interaction.customId === 'scammer_check') {
                const modal = new ModalBuilder()
                    .setCustomId('scammer_check_modal')
                    .setTitle('Scammer Check');

                const userIdInput = new TextInputBuilder()
                    .setCustomId('user_id')
                    .setLabel('Enter the User ID')
                    .setPlaceholder('Example: 1219880124351119373')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const row = new ActionRowBuilder().addComponents(userIdInput);
                modal.addComponents(row);

                return await interaction.showModal(modal);
            }

            // Handle modal submission
            if (interaction.isModalSubmit() && interaction.customId === 'scammer_check_modal') {
                await interaction.deferReply({ ephemeral: true });

                const userId = interaction.fields.getTextInputValue('user_id').trim();
                if (!/^\d+$/.test(userId)) {
                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xff0000)
                                .setDescription(`⚠️ Invalid User ID format. Please enter a valid numeric User ID.`)
                        ],
                    });
                }

                const scammersDB = loadDatabase(scammersPath);
                if (!Array.isArray(scammersDB)) {
                    return interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xff0000)
                                .setDescription(`⚠️ Database error. Could not load scammer records.`)
                        ],
                    });
                }

                const scammer = scammersDB.find((entry) => entry.userId === userId);

                if (scammer) {
                    const scammerEmbed = new EmbedBuilder()
                        .setTitle('Scammer Found! 🚨')
                        .setColor(0xff0000)
                        .setDescription(`⚠️ **User ID:** ${scammer.userId}\n**Username:** ${scammer.username}\n**Reason:** ${scammer.reason}\n**Marked by:** ${scammer.markedBy}`)
                        .setTimestamp(scammer.timestamp);

                    return interaction.editReply({ embeds: [scammerEmbed] });
                } else {
                    // If not a scammer, check in DWC (Deal With Caution) database
                    const dwcDB = loadDatabase(dwcPath);
                    if (!Array.isArray(dwcDB)) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0xff0000)
                                    .setDescription(`⚠️ Database error. Could not load DWC records.`)
                            ],
                        });
                    }

                    const dwcUser = dwcDB.find((entry) => entry.userId === userId);

                    if (dwcUser) {
                        const dwcEmbed = new EmbedBuilder()
                            .setTitle('⚠️ Deal With Caution ⚠️')
                            .setColor(0xffa500)
                            .setDescription(`⚠️ **User ID:** ${dwcUser.userId}\n**Username:** ${dwcUser.username}\n**Reason:** ${dwcUser.reason}\n**Marked by:** ${dwcUser.markedBy}`)
                            .setTimestamp(dwcUser.timestamp);

                        return interaction.editReply({ embeds: [dwcEmbed] });
                    } else {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(0x57f287)
                                    .setDescription(`✅ No scam or DWC records found for **${userId}**.`)
                            ],
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error in scammer check interaction:', error);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('⚠️ Something went wrong while processing your request.')
                ],
                ephemeral: true
            }).catch(() => {});
        }
    },
};
