const { inspect } = require('util');

module.exports = {
    name: 'eval',
    description: 'Evaluates JavaScript code (Owner only)',
    async execute(message, args) {
        // Restrict command to specific user ID
        if (message.author.id !== '1219880124351119373') return;

        const code = args.join(' ');
        if (!code) return message.reply('⚠️ Provide code to evaluate.');

        try {
            let result = await eval(code);
            if (typeof result !== 'string') result = inspect(result, { depth: 0 });

            // Send result in a code block
            message.reply(`\`\`\`js\n${result}\n\`\`\``).catch(console.error);
        } catch (error) {
            message.reply(`⚠️ Error:\n\`\`\`js\n${error}\n\`\`\``);
        }
    }
};
