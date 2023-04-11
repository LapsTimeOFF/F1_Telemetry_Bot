const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aboutme')
		.setDescription('Returns about me !'),

	async execute(interacton, client) {
		const embed = new EmbedBuilder()
			.setTitle('Here is my profile')
			.setDescription('I\'m creating beautiful plots !')
			.setColor(0x18e1ee)
			.setThumbnail(client.user.displayAvatarURL())
			.setAuthor({
				url: 'https://beta.f1mv.com/',
				iconURL: interacton.user.displayAvatarURL(),
				name: interacton.user.tag
			});
        

		await interacton.reply({
			embeds: [embed]
		});
	}
};