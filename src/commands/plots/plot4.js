const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { spawn } = require('child_process');
const { downloadData } = require('../../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('plot4')
		.setDescription('Create a comparative graph of a lap')
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
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('driver1')
				.setDescription('The TLA of the 1st driver you want to analyse')
				.setRequired(true)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('driver2')
				.setDescription('The TLA of the 2nd driver you want to analyse')
				.setRequired(true)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('driver3')
				.setDescription('The TLA of the 3rd driver you want to analyse')
				.setRequired(true)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('driver4')
				.setDescription('The TLA of the 4th driver you want to analyse')
				.setRequired(true)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('color_driver1')
				.setDescription('The Color for the 1st driver you want to analyse (b,r,g,c,m,y,k,w)')
				.setRequired(false)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('color_driver2')
				.setDescription('The Color for the 2nd driver you want to analyse (b,r,g,c,m,y,k,w)')
				.setRequired(false)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('color_driver3')
				.setDescription('The Color for the 3rd driver you want to analyse (b,r,g,c,m,y,k,w)')
				.setRequired(false)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('color_driver4')
				.setDescription('The Color for the 4th driver you want to analyse (b,r,g,c,m,y,k,w)')
				.setRequired(false)
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('lap')
				.setDescription('The lap you want to analyse')
				.setRequired(false)),

	async execute(interacton, client) {
		downloadData(interacton);
	},

	async python(interaction) {
		let Year = interaction.options.getString('year');
		let GP = interaction.options.getString('gp');
		let Session = interaction.options.getString('session').toUpperCase();
		let Driver1 = interaction.options.getString('driver1').toUpperCase();
		let Driver2 = interaction.options.getString('driver2').toUpperCase();
		let Driver3 = interaction.options.getString('driver3').toUpperCase();
		let Driver4 = interaction.options.getString('driver4').toUpperCase();
		let ColorDriver1 = interaction.options.getString('color_driver1');
		let ColorDriver2 = interaction.options.getString('color_driver2');
		let ColorDriver3 = interaction.options.getString('color_driver3');
		let ColorDriver4 = interaction.options.getString('color_driver4');
		let Lap = interaction.options.getString('lap');
		
		if(Lap === null) Lap = 'Fastest';

		if(ColorDriver1 === null) ColorDriver1 = 'default';
		if(ColorDriver2 === null) ColorDriver2 = 'default';
		if(ColorDriver3 === null) ColorDriver3 = 'default';
		if(ColorDriver4 === null) ColorDriver4 = 'default';
        
		const python = spawn('python3', ['src/commands/plots/python/createPlotByTeam.py', Year, GP, Session, Driver1, Driver2, Driver3, Driver4, ColorDriver1, ColorDriver2, ColorDriver3, ColorDriver4, Lap]);
        
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
				await interaction.editReply(`Sorry, this command failed. ${_error.includes('The data you are trying to access has not been loaded yet. See `Session.load`') ? 'The data is not available for now.' : 'The issue is reported to the development team'}. `);
				return;
			}
			const attachment = new AttachmentBuilder('src/commands/plots/python/Figure.png', { name: 'Plot.png' });
			await interaction.editReply({content: `Telemetry comparison ${Driver1} vs. ${Driver2} vs. ${Driver3} vs. ${Driver4} - ${GP} ${Year} ${Session}`, files: [attachment]});
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