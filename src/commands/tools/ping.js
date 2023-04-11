const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Return my ping !'),

	async execute(interacton, client) {
		const message = await interacton.deferReply({
			fetchReply: true
		});

		const newMessage = `API Latency: ${client.ws.ping}ms \nClient ping: ${message.createdTimestamp - interacton.createdTimestamp}ms`;
		await interacton.editReply({
			content: newMessage
		});
	}
};