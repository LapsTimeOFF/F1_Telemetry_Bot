const { readdirSync } = require('fs');
const chalk = require('chalk');

module.exports = (client) => {
	client.handleComponents = async () => {
		const componentFolder = readdirSync('./src/components');
		for (const folder of componentFolder) {
			const componentFiles = readdirSync(`./src/components/${folder}`).filter(file => file.endsWith('.js'));

			const {buttons, selectMenus} = client;

			switch (folder) {
			case 'buttons':
				for (const file of componentFiles) {
					const button = require(`../../components/${folder}/${file}`);
					buttons.set(button.data.name, button);
					console.log(`${chalk.bgBlue('[Components]')} ${button.data.name} has been registred`);
				}
				break;

			case 'selectMenus':
				for (const file of componentFiles) {
					const menu = require(`../../components/${folder}/${file}`);
					selectMenus.set(menu.data.name, menu);
					console.log(`${chalk.bgBlue('[Components]')} ${menu.data.name} has been registred`);
				}
				break;
            
			default:
				break;
			}
		}
	};
};