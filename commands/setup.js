const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const scammersFile = 'database/scammers.json';
const dwcFile = 'database/dwc.json';

module.exports = {
    name: 'setup',
    description: 'Setup scammer and dwc roles in the server.',
    async execute(message) {
        if (!message.guild) return;
        
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('⚠️ You do not have permission to use this command.')]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('⚠️ I do not have permission to manage roles.')]
            });
        }

        const existingScammerRole = message.guild.roles.cache.find(role => role.name === 'Scammer');
        const existingDwcRole = message.guild.roles.cache.find(role => role.name === 'Dwc');

        if (existingScammerRole && existingDwcRole) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('⚠️ Scammer and Dwc roles already exist in this server.')] 
            });
        }

        const waitingMessage = await message.reply({
            embeds: [new EmbedBuilder().setColor(0x2b2d30).setDescription('<a:loading:1335233861214539847> Creating Roles...')]
        });

        const scammerRole = existingScammerRole || await message.guild.roles.create({ name: 'Scammer', color: 0xff0000 });
        const dwcRole = existingDwcRole || await message.guild.roles.create({ name: 'Dwc', color: 0xffa500 });

        await waitingMessage.edit({
            embeds: [new EmbedBuilder().setColor(0x2b2d30).setDescription(
                '<:tickYes:1331105902677327915> Created Roles.\n<a:loading:1335233861214539847> Adding roles to Scammers/Dwc\'s...'
            )]
        });

        let assignedCount = 0;
        const scammers = fs.existsSync(scammersFile) ? JSON.parse(fs.readFileSync(scammersFile, 'utf-8')) : [];
        const dwc = fs.existsSync(dwcFile) ? JSON.parse(fs.readFileSync(dwcFile, 'utf-8')) : [];

        for (const scammer of scammers) {
            const member = await message.guild.members.fetch(scammer.userId).catch(() => null);
            if (member && !member.roles.cache.has(scammerRole.id)) {
                await member.roles.add(scammerRole);
                assignedCount++;
            }
        }

        for (const dwcUser of dwc) {
            const member = await message.guild.members.fetch(dwcUser.userId).catch(() => null);
            if (member && !member.roles.cache.has(dwcRole.id)) {
                await member.roles.add(dwcRole);
                assignedCount++;
            }
        }

        await waitingMessage.edit({
            embeds: [new EmbedBuilder().setColor(0x2b2d30).setDescription(
                `<:tickYes:1331105902677327915> Created Roles.\n<:tickYes:1331105902677327915> Added roles to ${assignedCount} dwc/scammers.`
            )]
        });
    },
};
