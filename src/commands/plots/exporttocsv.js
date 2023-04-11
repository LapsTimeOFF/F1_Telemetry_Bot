const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { spawn } = require('child_process');
const { downloadData } = require('../../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('exporttocsv')
		.setDescription('Raw data of a lap')
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
			option.setName('driver')
				.setDescription('The TLA of the driver you want to analyse')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('lap')
				.setDescription('The lap you want to analyse')
				.setRequired(true)),

	async execute(interacton, client) {
		downloadData(interacton);
	},

	async python(interaction) {
		let Year = interaction.options.getString('year');
		let GP = interaction.options.getString('gp');
		let Session = interaction.options.getString('session').toUpperCase();
		let Driver1 = interaction.options.getString('driver').toUpperCase();
		let Lap = interaction.options.getString('lap');
		
		const python = spawn('python3', ['src/commands/plots/python/exporttocsv.py', Year, GP, Session, Driver1, Lap]);
		
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
			const attachment = new AttachmentBuilder(`src/commands/plots/python/${Year}_${GP}_${Session}_${Driver1}_Lap${Lap}.csv`);
			await interaction.editReply({files: [attachment]});
		});
	}
};