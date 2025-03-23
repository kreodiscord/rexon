const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const clientId = process.env.CLIENT_ID; 
const token = process.env.token;     


const commands = [];
const commandFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./slashCommands/${file}`);
  commands.push(command.data.toJSON()); 
}


const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started deploying global (/) commands.');

   
    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log('Successfully deployed global (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();
