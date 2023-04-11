const { REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const { token } = require('../../../config.json');
const chalk = require('chalk');

module.exports = (client) => {
	client.handleCommands = async () => {
		const commandFolders = readdirSync('./src/commands');
		for (const folder of commandFolders) {
			const commandFiles = readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));

			const { commands, commandArray } = client;
			for (const file of commandFiles) {
				const command = require(`../../commands/${folder}/${file}`);
				commands.set(command.data.name, command);
				commandArray.push(command.data.toJSON());
				console.log(`${chalk.bgGreen('[Command]')} ${command.data.name} has been registred.`);
			}
		}

		const clientId = '1028003764101193818';
		const rest = new REST({ version: '9' }).setToken(token);

		try {
			console.log('Started refreshing application (/) commands.');
        
			await rest.put(Routes.applicationCommands(clientId), { body: client.commandArray });
        
			console.log('Successfully reloaded application (/) commands.');
		} catch (error) {
			console.error(error);
		}
	};
};