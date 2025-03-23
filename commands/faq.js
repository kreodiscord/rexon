const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'faq',
    async execute(message) {
        if (message.author.id !== '1219880124351119373') {
            return;
        }

        const faqEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: 'Fraud Alert',
                iconURL: message.client.user.displayAvatarURL()
            })
            .setDescription(
                '> We understand you might have a question, and it might already be answered in the select menu below.\n\n' +
                '> Please take a moment to check the available options. If your issue or inquiry is not listed there, we encourage you to be patient and allow us some time to assist you further.\n\n' +
                '> Additionally, if you need more immediate help or if the select menu doesn’t provide a solution, please reach out to the community support channel by using <#1343544300298043402>.\n\n' +
                '> Our team and community members are always here to help. Thank you for your understanding and patience.'
            );
            

        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('faq_select')
                .setPlaceholder('Frequently Asked Questions')
                .addOptions([
                    { label: 'What is Fraud Alert?', value: 'first' },
                    { label: 'How do i report a Fraud?', value: 'second' },
                    { label: 'How can I help prevent fraud?', value: 'third' },
                    { label: 'Can i advertise in this server?', value: 'fourth' },
                    { label: 'How can i become a Staff?', value: 'fifth' },
                    { label: 'How can i Import my Vouches?', value: 'sixth' },
                    { label: 'How do i Invite Rexon?', value: 'seventh' },
                    
                ])
        );

        await message.channel.send({ embeds: [faqEmbed], components: [selectMenu] });
    }
};
