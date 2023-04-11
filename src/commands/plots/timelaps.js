const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { spawn } = require('child_process');
const { downloadData } = require('../../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timelaps')
		.setDescription('Create a graph of the laps')
		.addStringOption(option =>
			option.setName('year')
				.setDescription('The year of the GP')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('gp')
				.setDescription('The GP you want to analyse')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('session')
				.setDescription('The session you want to analyse (FP1,FP2,FP3 for Practice; Q for Qualification; R for Race)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('driver1')
				.setDescription('The TLA of the 1st driver you want to analyse')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('driver2')
				.setDescription('The TLA of the 2nd driver you want to analyse')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('color_driver1')
				.setDescription('The Color for the 1st driver you want to analyse (b,r,g,c,m,y,k,w)')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('color_driver2')
				.setDescription('The Color for the 2nd driver you want to analyse (b,r,g,c,m,y,k,w)')
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
		let ColorDriver1 = interaction.options.getString('color_driver1');
		let ColorDriver2 = interaction.options.getString('color_driver2');
		
		if(ColorDriver1 === null) ColorDriver1 = 'default';
		if(ColorDriver2 === null) ColorDriver2 = 'default';
		
		const python = spawn('python3', ['src/commands/plots/python/timelaps.py', Year, GP, Session, Driver1, Driver2, ColorDriver1, ColorDriver2]);
		
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
				await interaction.editReply(`Sorry, this command failed. ${_error.includes('The data you are trying to access has not been loaded yet. See `Session.load`') ? 'The data is not available for now.' : `Python ERROR \`\`\`${_error}\`\`\``}. `);
				return;
			}
			const attachment = new AttachmentBuilder('src/commands/plots/python/Figure.png', { name: 'Plot.png' });
			await interaction.editReply({content: `Lap times comparison ${Driver1} vs. ${Driver2} - ${GP} ${Year} ${Session}`, files: [attachment]});
		});
	}
};