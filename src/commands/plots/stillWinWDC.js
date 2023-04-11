const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { spawn } = require('child_process');
const { downloadData } = require('../../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stillwinwdc')
		.setDescription('Showing who can still win the WDC'),

	async execute(interaction, client) {
		await interaction.deferReply();
		const python = spawn('python3', ['src/commands/plots/python/stillWinWDC.py']);
    
		let errors = [];
		let logs = [];

		python.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
			logs.push(data);
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
			await interaction.editReply({content: `Who can still win WDC ?\`\`\`diff\n${logs}\`\`\``});
		});
	}
};