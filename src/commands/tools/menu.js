const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('menu')
		.setDescription('Return a select menu !'),

	async execute(interacton) {
		const menu = new SelectMenuBuilder()
			.setCustomId('sub-menu')
			.setMinValues(1)
			.setMaxValues(1)
			.setOptions(
				new SelectMenuOptionBuilder({
					label: 'About my creator',
					value: 'https://github.com/LapsTimeOFF'
				}),
				new SelectMenuOptionBuilder({
					label: 'Rick Roll',
					value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
				})
			);

		await interacton.reply({
			components: [new ActionRowBuilder().addComponents(menu)]
		});
	}
};