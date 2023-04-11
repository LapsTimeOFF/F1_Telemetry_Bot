const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { spawn } = require('child_process');
const { downloadData } = require('../../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bestsectormap')
		.setDescription('Create a comparative map of the fastests')
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
		let Lap = interaction.options.getString('lap');
		
		if(Lap === null) Lap = 'Fastest';

		const python = spawn('python3', ['src/commands/plots/python/bestSectorMap.py', Year, GP, Session, Driver1, Driver2, Lap]);
		
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
			await interaction.editReply({content: `Fastest micro sector comparison ${Driver1} vs. ${Driver2} - ${GP} ${Year} ${Session} - Lap ${Lap}`, files: [attachment]});
		});
	}
};