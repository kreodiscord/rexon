const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const scammersFile = path.join(__dirname, '../database/scammers.json');
const dwcFile = path.join(__dirname, '../database/dwc.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (!member.guild) return;

        try {
            // Load scammer and DWC databases
            const scammers = fs.existsSync(scammersFile) ? JSON.parse(fs.readFileSync(scammersFile, 'utf-8')) : [];
            const dwc = fs.existsSync(dwcFile) ? JSON.parse(fs.readFileSync(dwcFile, 'utf-8')) : [];
            
            const scammerData = scammers.find(user => user.userId === member.id);
            const dwcData = dwc.find(user => user.userId === member.id);

            let rolesToAdd = [];
            let roleErrors = [];

            if (scammerData) {
                const scammerRole = member.guild.roles.cache.find(r => r.name.toLowerCase() === 'scammer');
                if (scammerRole) {
                    rolesToAdd.push(scammerRole);
                } else {
                    roleErrors.push('Scammer role not found');
                }
            }

            if (dwcData) {
                const dwcRole = member.guild.roles.cache.find(r => r.name.toLowerCase() === 'dwc');
                if (dwcRole) {
                    rolesToAdd.push(dwcRole);
                } else {
                    roleErrors.push('DWC role not found');
                }
            }

            if (rolesToAdd.length > 0) {
                await member.roles.add(rolesToAdd).catch(err => console.error(`Failed to add roles to ${member.user.tag}:`, err));
            }

            if (roleErrors.length > 0) {
                console.warn(`Role errors for ${member.user.tag}:`, roleErrors.join(', '));
            }
        } catch (error) {
            console.error(`Error processing member ${member.user.tag} (${member.id}):`, error);
        }
    }
};
