const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h'],
    async execute(message, args) {
        try {
            // Create the embed for the help message
            const helpEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('Rexon v2 | Command List')
                .setThumbnail(message.client.user.displayAvatarURL())
                .setDescription('Total Commands: \`28\`\nChoose select menu below to view options!')
                .setFooter({ text: 'Created by Kreo | Fraud Alert | .gg/FraudAlert', iconURL: message.client.user.displayAvatarURL() })
                .setTimestamp();

            // Create the select menu for category selection
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_category')
                .setPlaceholder('Select a category')
                .addOptions(
                    {
                        label: 'Profile Customization',
                        description: 'Commands for profile customization',
                        value: 'profile_customization',
                    },
                    {
                        label: 'Vouch Management',
                        description: 'Manage your vouches',
                        value: 'vouch_management',
                    },
                    {
                        label: 'Leaderboard',
                        description: 'View leaderboards',
                        value: 'leaderboard',
                    },
                    {
                        label: 'Search & Utility',
                        description: 'Search and utility commands',
                        value: 'search_utility',
                    },
                    {
                        label: 'Bot Info & Miscellaneous',
                        description: 'Bot info and other commands',
                        value: 'bot_info',
                    },
                    {
                        label: 'Configuration',
                        description: 'Set up roles and configurations',
                        value: 'configuration',
                    }
                );

            // Create an action row to hold the select menu
            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Create buttons for "Support Server" and "Invite Me"
            const buttonRow1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle('Link')
        .setURL('https://discord.gg/FraudAlert'),
    new ButtonBuilder()
        .setLabel('Invite Me')
        .setStyle('Link')
        .setURL('https://discord.com/oauth2/authorize?client_id=1335553466059325532&permissions=412317142080&integration_type=0&scope=bot')
);

            // Send the initial embed with the select menu and buttons
            const reply = await message.reply({
                embeds: [helpEmbed],
                components: [row, buttonRow1],
            });

            // Set up the interaction collector for the select menu
            const filter = i => i.customId === 'help_category' && i.user.id === message.author.id;
            const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (interaction) => {
                const selectedCategory = interaction.values[0];
                let categoryEmbed;

                // Switch case to handle the category and provide the relevant command list
                switch (selectedCategory) {
                    case 'profile_customization':
                        categoryEmbed = new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setTitle('Profile Customization Commands')
                            .setDescription('Commands for customizing your profile:')
                            .addFields(
                                 { name: '`+addbutton`', value: 'Add link buttons to your profile.' },
                                  { name: '`+resetbuttons`', value: 'Rest all buttons of your profile.' },
                                { name: '`+badges`', value: 'Show all badges.' },
                                { name: '`+color`', value: 'Customize your profile color.' },
                                { name: '`+discord`', value: 'Add a Discord link to your profile.' },
                                { name: '`+forum`', value: 'Set a forum link on your profile.' },
                                { name: '`+shop`', value: 'Add a shop link to your profile.' },
                                { name: '`+products`', value: 'Showcase products on your profile.' },
                                { name: '`+image`', value: 'Add an image or GIF to your profile.' },
                            );
                        break;
                    case 'vouch_management':
                        categoryEmbed = new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setTitle('Vouch Management Commands')
                            .setDescription('Manage your vouches:')
                            .addFields(
                                { name: '`+vouch`', value: 'Add a positive/negative vouch.' },
                                { name: '`+status`', value: 'Check vouch details.' },
                                { name: '`+myvouchers`', value: 'View all your vouchers.' },
                            );
                        break;
                    case 'leaderboard':
                        categoryEmbed = new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setTitle('Leaderboard Commands')
                            .setDescription('View the leaderboards:')
                            .addFields(
                                { name: '`+top`', value: 'View the top vouch holders.' },
                                { name: '`+hot`', value: 'See users with most vouches this month.' },
                                { name: '`+daily`', value: 'Check users with the most vouches today.' },
                                { name: '`+myrank`', value: 'View your rank among users.' },
                            );
                        break;
                    case 'search_utility':
                        categoryEmbed = new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setTitle('Search & Utility Commands')
                            .setDescription('Search and utility commands:')
                            .addFields(
                                { name: '`+search`', value: 'Search for users offering specific products.' },
                                { name: '`+compare`', value: 'Compare your profile with another user.' },
                                { name: '`+profile`', value: 'View your or another user’s profile.' },
                                { name: '`+setpayments`', value: 'Set your payment information.' },
                                { name: '`+payments`', value: 'View your or another user’s payment methods.' },
                                { name: '`+token`', value: 'View or generate a profile recovery token.' },
                               
                            );
                        break;
                    case 'bot_info':
                        categoryEmbed = new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setTitle('Bot Info & Miscellaneous Commands')
                            .setDescription('Bot info and other commands:')
                            .addFields(
                                { name: '`+help`', value: 'Display this command list.' },
                                { name: '`+invite`', value: 'Get bot invite link.' },
                                { name: '`+ping`', value: 'Check bot’s latency.' },
                                { name: '`/clearmydms`', value: 'Clear your DMs.' },
                                { name: '`+stats`', value: 'View bot’s statistics.' },
                            );
                        break;
                    case 'configuration':
                        categoryEmbed = new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setTitle('Configuration Commands')
                            .setDescription('Set up roles and configurations:')
                            .addFields(
                                { name: '`+setup`', value: 'Create Scammer/Dwc roles and assign them.' }
                            );
                        break;
                }

                // Send the selected category embed
                await interaction.update({ embeds: [categoryEmbed], components: [row, buttonRow1] });
            });

            collector.on('end', async () => {
                // Disable the select menu after 1 minute (time can be adjusted)
                row.components[0].setDisabled(true);
                await reply.edit({ components: [row, buttonRow1] });
            });
        } catch (error) {
            console.error('Error in help command:', error);
            message.reply('⚠️ Bot does not have permissions to send Embeds.');
        }
    },
};
