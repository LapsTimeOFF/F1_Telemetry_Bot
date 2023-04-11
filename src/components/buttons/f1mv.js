module.exports = {
	data: {
		name: 'f1mv'
	},
	async execute(interaction) {
		await interaction.reply({
			content: 'https://beta.f1mv.com/'
		});
	}
};