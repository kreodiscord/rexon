const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms'); // Install this package for easier time parsing
const humanizeDuration = require('humanize-duration'); // Install this for humanized durations

const dbPath = 'database/premium.json';

// Helper function to read the premium database
const getPremiumData = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch (error) {
    console.error('Error reading premium data:', error);
    return {};
  }
};

// Helper function to save the premium database
const savePremiumData = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving premium data:', error);
  }
};

// Helper function to format date in IST
const formatDateInIST = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

module.exports = {
  name: 'addpro',
  description: 'Add premium status to a user for a specific duration',
  async execute(message, args) {
    // Restrict the command to a specific user
    const ownerId = '1219880124351119373';
    if (message.author.id !== ownerId) {
      return message.reply("You don't have permission to use this command.");
    }

    // Validate arguments
    if (args.length < 2) {
      return message.reply('Usage: `?addpro @user <minute|day|week|month|year|100years>`');
    }

    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply('You must mention a user to add premium to.');
    }

    const durationType = args[1].toLowerCase();
    const durations = {
      minute: ms('1m'),
      day: ms('1d'),
      week: ms('1w'),
      month: ms('30d'), // Approximate month as 30 days
      year: ms('365d'),
      '100years': ms('36500d'), // 100 years (36500 days)
    };

    if (!durations[durationType]) {
      return message.reply('Invalid duration type. Use: `minute`, `day`, `week`, `month`, `year`, or `100years`.');
    }

    const premiumData = getPremiumData();
    const now = Date.now();
    const expiryTime = now + durations[durationType];

    // Add or update the user in the premium database
    premiumData[targetUser.id] = { expiresAt: expiryTime };
    savePremiumData(premiumData);

    // Humanize the expiry time
    const humanizedTime = humanizeDuration(expiryTime - now, { round: true });

    // Format the expiry time in IST
    const formattedExpiryTime = formatDateInIST(new Date(expiryTime));

    // Send confirmation message
    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('Premium Added')
      .setDescription(`I have added premium to ${targetUser} until **${formattedExpiryTime}**.`)
      .setFooter({ text: `Duration: ${humanizedTime}` });

    return message.channel.send({ embeds: [embed] });
  },
};
