const fs = require('fs');
const { spawn } = require('child_process');

module.exports = {
	async downloadData(interaction) {
		await interaction.deferReply();
		if(interaction.commandName === 'plot2sessions') {
			await interaction.editReply('`Downloading data for Session 1... Please wait...`');
			await require('./functions').checkdata(interaction, 'year1', 'gp', 'session1');
		} else {
			await interaction.editReply('`Downloading data... Please wait...`');
			await require('./functions').checkdata(interaction, 'year', 'gp', 'session');
		}
	},
	async checkdata(interaction, y, gp, s) {
		let Year = interaction.options.getString(y);
		let GP = interaction.options.getString(gp);
		let Session = interaction.options.getString(s).toUpperCase();
        
		const python = spawn('python3', ['src/commands/plots/python/download.py', Year, GP, Session]);
        
		let errors = [];
    
		python.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});
		python.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
			errors.push(data);
		});
    
		await python.on('close', async (code) => {
			console.log(`child process close all stdio with code ${code}`);
			if(y === 'year2') {
				await interaction.editReply('`Parsing data... Please wait...`');
				await require('../commands/plots/plot2sessions').python(interaction);
			} else {
				require('./functions').next(interaction);
			}
		});
	},
	async next(interaction) {
		await interaction.editReply('`Parsing data... Please wait...`');
    
		if (interaction.commandName === 'speedontrack') {
			await require('../commands/plots/speedOnTrack').python(interaction);
		}
    
		if (interaction.commandName === 'plot') {
			await require('../commands/plots/plot').python(interaction);
		}
    
		if (interaction.commandName === 'plot4') {
			await require('../commands/plots/plot4').python(interaction);
		}
    
		if (interaction.commandName === 'tyreplot') {
			await require('../commands/plots/tyrePlot').python(interaction);
		}
    
		if (interaction.commandName === 'exporttocsv') {
			await require('../commands/plots/exporttocsv').python(interaction);
		}
        
		if (interaction.commandName === 'bestsectormap') {
			await require('../commands/plots/bestSectorMap').python(interaction);
		}
        
		if (interaction.commandName === 'corneranalyse') {
			await require('../commands/plots/cornerAnalyse').python(interaction);
		}
    
		if (interaction.commandName === 'timelaps') {
			await require('../commands/plots/timelaps').python(interaction);
		}
    
		if (interaction.commandName === 'plot2sessions') {
			await interaction.editReply('`Downloading data for Session 2... Please wait...`');
			await require('./functions').checkdata(interaction, 'year2', 'gp', 'session2');
		}
	}
};