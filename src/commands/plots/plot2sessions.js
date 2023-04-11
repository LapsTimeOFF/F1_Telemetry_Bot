const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { spawn } = require('child_process');
const { downloadData } = require('../../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('plot2sessions')
		.setDescription('Create a comparative graph of a lap')

		.addStringOption(option =>
			option.setName('gp')
				.setDescription('The GP you want to analyse')
				.setRequired(true)
				.setAutocomplete(true))
			
		.addStringOption(option =>
			option.setName('driver')
				.setDescription('The TLA of the driver you want to analyse')
				.setRequired(true)
				.setAutocomplete(true))

		.addStringOption(option =>
			option.setName('year1')
				.setDescription('The year of the GP')
				.setRequired(true)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('session1')
				.setDescription('The session you want to analyse (FP1,FP2,FP3 for Practice; Q for Qualification; R for Race)')
				.setRequired(true)
				.setAutocomplete(true))

		.addStringOption(option =>
			option.setName('year2')
				.setDescription('The year of the GP')
				.setRequired(true)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('session2')
				.setDescription('The session you want to analyse (FP1,FP2,FP3 for Practice; Q for Qualification; R for Race)')
				.setRequired(true)
				.setAutocomplete(true))

		.addStringOption(option =>
			option.setName('color_s1')
				.setDescription('The Color for the 1st session you want to analyse (b,r,g,c,m,y,k,w)')
				.setRequired(false)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('color_s2')
				.setDescription('The Color for the 2nd session you want to analyse (b,r,g,c,m,y,k,w)')
				.setRequired(false)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('lap')
				.setDescription('The lap you want to analyse')
				.setRequired(false)),

	async execute(interacton, client) {
		await interacton.editReply('This command is currently disabled.')
		// downloadData(interacton);
	},

	async python(interaction) {
		let Year1 = interaction.options.getString('year1');
		let GP = interaction.options.getString('gp');
		let Session1 = interaction.options.getString('session1').toUpperCase();
		let Year2 = interaction.options.getString('year2');
		let Session2 = interaction.options.getString('session2').toUpperCase();
		let Driver = interaction.options.getString('driver').toUpperCase();
		let ColorSession1 = interaction.options.getString('color_s1');
		let ColorSession2 = interaction.options.getString('color_s2');
		let Lap = interaction.options.getString('lap');
		
		if(Lap === null) Lap = 'Fastest';

		if(ColorSession1 === null) ColorSession1 = 'r';
		if(ColorSession2 === null) ColorSession2 = 'b';
		
		const python = spawn('python3', ['src/commands/plots/python/createPlot2Sessions.py', Year1, GP, Session1, Year2, null, Session2, Driver, ColorSession1, ColorSession2, Lap]);
		
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
				await interaction.editReply(`Sorry, this command failed. ${_error.includes('The data you are trying to access has not been loaded yet. See `Session.load`') ? 'The data is not available for now.' : ''}`);
				return;
			}
			const attachment = new AttachmentBuilder('src/commands/plots/python/Figure.png', { name: 'Plot.png' });
			await interaction.editReply({content: `Telemetry comparison ${Driver} - ${GP} - ${Year1} ${Session1} vs ${Year2} ${Session2} - Lap ${Lap}`, files: [attachment]});
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
		if(focused.startsWith('color')) {
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