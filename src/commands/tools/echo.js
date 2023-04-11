const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Return my ping !')
        .addStringOption(option =>
			option.setName('text')
				.setDescription('The text to say')
				.setRequired(true)),

	async execute(interaction, client) {
        let text = interaction.options.getString('text');


		await interaction.deferReply();

		await interaction.editReply({
			content: text
		});
	}
};