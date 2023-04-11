const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('button')
		.setDescription('Return a button !'),

	async execute(interacton) {
		const button = new ButtonBuilder()
			.setCustomId('f1mv')
			.setLabel('F1MV Link')
			.setStyle(ButtonStyle.Primary);

		await interacton.reply({
			components: [new ActionRowBuilder().addComponents(button)]
		});
	}
};