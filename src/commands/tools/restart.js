const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restart')
		.setDescription('Restart the bot !'),

	async execute(interacton, client) {
		await interacton.reply('Restarting the bot...');
		process.exit(0);
	}
};