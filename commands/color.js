const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const profileDbPath = path.join(__dirname, '../database/profile.json');

function loadDatabase() {
    if (fs.existsSync(profileDbPath)) {
        try {
            return JSON.parse(fs.readFileSync(profileDbPath, 'utf8'));
        } catch (error) {
            console.error('Error loading database:', error);
            return {};
        }
    }
    return {};
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(profileDbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

const profileDB = loadDatabase();

function ensureUserProfile(userId) {
    if (!profileDB[userId]) {
        profileDB[userId] = {
            discord: null,
            products: null,
            forum: null,
            color: null,
        };
    }
}

module.exports = {
    name: 'color',
    description: 'Set your profile color.',
    async execute(message, args) {
        const value = args.join(' ').trim();
        const userId = message.author.id;

        const hexRegex = /^#([A-Fa-f0-9]{6})$/;

        if (!value) {
            const colorEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Color Selector')
                .setDescription(
                    'To reset your color to default (Blurple), Click ⚙️ button!\n\n' +
                    '**Preset Colors**\nClick a button to set a preset color:\n' +
                    '⚫Black | 🔴Red | 🟠Orange | 🟡Yellow | 🟢Green | 🔵Blue | 🟣Purple | 🟤Brown |\n\n' +
                    '**Custom Color?**\nClick 💭 to set a custom hex code.'
                );

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('black').setEmoji('⚫').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('red').setEmoji('🔴').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('orange').setEmoji('🟠').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('yellow').setEmoji('🟡').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('green').setEmoji('🟢').setStyle(ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('blue').setEmoji('🔵').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('purple').setEmoji('🟣').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('brown').setEmoji('🟤').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('reset').setEmoji('⚙️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('custom').setEmoji('💭').setStyle(ButtonStyle.Secondary)
            );

            const reply = await message.reply({ embeds: [colorEmbed], components: [row1, row2] });

            const collector = reply.createMessageComponentCollector({
                filter: (interaction) => interaction.user.id === userId,
                time: 120000
            });

            collector.on('collect', async (interaction) => {
                if (!interaction.isButton()) return;

                let selectedColor;
                switch (interaction.customId) {
                    case 'black': selectedColor = '#000000'; break;
                    case 'red': selectedColor = '#FF0000'; break;
                    case 'orange': selectedColor = '#FFA500'; break;
                    case 'yellow': selectedColor = '#FFFF00'; break;
                    case 'green': selectedColor = '#008000'; break;
                    case 'blue': selectedColor = '#0000FF'; break;
                    case 'purple': selectedColor = '#800080'; break;
                    case 'brown': selectedColor = '#A52A2A'; break;
                    case 'reset': selectedColor = 'Blurple'; break;
                    case 'custom':
                        await interaction.reply({ content: 'Please enter a custom hex color (e.g., #FFFFFF):', ephemeral: true });
                        const messageCollector = message.channel.createMessageCollector({
                            filter: (msg) => msg.author.id === userId,
                            time: 30000,
                            max: 1
                        });
                        messageCollector.on('collect', (msg) => {
                            if (hexRegex.test(msg.content)) {
                                selectedColor = msg.content;
                                ensureUserProfile(userId);
                                profileDB[userId].color = selectedColor;
                                saveDatabase(profileDB);
                                msg.reply({
                                    embeds: [
                                        new EmbedBuilder().setColor(selectedColor).setDescription(`<:tickYes:1335562497268252682> | Your color has been set to: **${selectedColor}**.`)
                                    ]
                                });
                            } else {
                                msg.reply({
                                    embeds: [
                                        new EmbedBuilder().setColor(0xff0000).setDescription('⚠️ | Invalid hex code. Please provide a valid one.')
                                    ]
                                });
                            }
                        });
                        return;
                }

                ensureUserProfile(userId);
                profileDB[userId].color = selectedColor;
                saveDatabase(profileDB);

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder().setColor(selectedColor).setDescription(`<:tickYes:1335562497268252682> | Your color has been set to: **${selectedColor}**.`)
                    ],
                    ephemeral: false
                });

                collector.stop();
                
            });

            collector.on('end', async () => {
                reply.edit({ components: [
                    new ActionRowBuilder().addComponents(
                        row1.components.map(button => button.setDisabled(true))
                    ),
                    new ActionRowBuilder().addComponents(
                        row2.components.map(button => button.setDisabled(true))
                    )
                ] });
            });
            return;
        }

        if (!hexRegex.test(value)) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('⚠️ | Please provide a valid hex color code (e.g., #FFFFFF).')],
            });
        }

        ensureUserProfile(userId);
        profileDB[userId].color = value;
        saveDatabase(profileDB);

        return message.reply({
            embeds: [new EmbedBuilder().setColor(value).setDescription(`<:tickYes:1335562497268252682> | Your color has been set to: **${value}**.`)],
        });
        reply.edit({ components: [
                    new ActionRowBuilder().addComponents(
                        row1.components.map(button => button.setDisabled(true))
                    ),
                    new ActionRowBuilder().addComponents(
                        row2.components.map(button => button.setDisabled(true))
                    )
                ] });
    }
};
