const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { spawn } = require('child_process');
const { downloadData } = require('../../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tyreplot')
		.setDescription('Create a graph of all the tyres')
		.addStringOption(option =>
			option.setName('year')
				.setDescription('The year of the GP')
				.setRequired(true)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('gp')
				.setDescription('The GP you want to analyse')
				.setRequired(true)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('session')
				.setDescription('The session you want to analyse (FP1,FP2,FP3 for Practice; Q for Qualification; R for Race)')
				.setRequired(true)
				.setAutocomplete(true)),

	async execute(interacton, client) {
		downloadData(interacton);
	},

	async python(interacton) {
		let Year = interacton.options.getString('year');
		let GP = interacton.options.getString('gp');
		let Session = interacton.options.getString('session').toUpperCase();

		const python = spawn('python3', ['src/commands/plots/python/tyrePlot.py', Year, GP, Session]);

		let errors = [];

		python.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});
		python.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
			errors.push(data);
		});

		python.on('close', async (code) => {
			console.log(`child process close all stdio with code ${code}`);
			if(code !== 0) {
				let _error = errors[errors.length-1];
				await interacton.editReply(`Sorry, this command failed. ${_error.includes('The data you are trying to access has not been loaded yet. See `Session.load`') ? 'The data is not available for now.' : `Python ERROR \`\`\`${_error}\`\`\``} `);
				return;
			}
			const attachment = new AttachmentBuilder('src/commands/plots/python/Figure.png', { name: 'Plot.png' });
			await interacton.editReply({content: `Tyre history - ${Year} ${GP} ${Session}`, files: [attachment]});
		});
	},

	async autocomplete(interaction, client) {
		const focusedValue = interaction.options.getFocused();
		let focused = '';
		for (let _i = 0; _i < interaction.options['_hoistedOptions'].length; _i++) {
			const option = interaction.options['_hoistedOptions'][_i];
			if(option.focused) {
				focused = option.name;
			}
		}
		let choices = [];
		if(focused.startsWith('driver')) {
			choices = ['VER','PER','LEC','SAI','HAM','RUS','NOR','RIC','GAS','TSU','OCO','ALO','VET','STR','MSC','MAG','ZHO','BOT','LAT','ALB'];
		}
		if(focused.startsWith('gp')) {
			choices = ['Bahrain','Saudi Arabia','Australia','Imola','Miami','Spain','Monaco','Azerbaïjan','Canada','Great Britain','Austria','France','Hungary','Belgium','Netherlands','Monza','Singapore','Japan','Austin','Mexico','Brazil','Abu Dhabi'];
		}
		if(focused.startsWith('color_driver')) {
			choices = ['b','r','g','c','m','y','k','w'];
		}
		if(focused.startsWith('session')) {
			choices = ['FP1','FP2','FP3','Q','SR','R'];
		}
		if(focused.startsWith('year')) {
			choices = ['2018','2019','2020','2021','2022'];
		}
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	} 
};