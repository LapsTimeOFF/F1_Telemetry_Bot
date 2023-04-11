const { readdirSync } = require('fs');
const chalk = require('chalk');

module.exports = (client) => {
	client.handleEvents = async () => {
		const eventFolders = readdirSync('./src/events');
		for (const folder of eventFolders) {
			const eventFiles = readdirSync(`./src/events/${folder}`).filter((file) => file.endsWith('.js'));

			switch (folder) {
			case 'client':
				for (const file of eventFiles) {
					const event = require(`../../events/${folder}/${file}`);
					if(event.once === true) client.once(event.name, (...args) => event.execute(...args, client));
					else client.on(event.name, (...args) => event.execute(...args, client));
					console.log(`${chalk.bgYellow('[Event]')} ${event.name} has been registred`);
				}
				break;
            
			default:
				break;
			}
		}
	};
};