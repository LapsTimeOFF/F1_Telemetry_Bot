const { token } = require("../config.json");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const chalk = require("chalk");
const fs = require("fs");

const client = new Client({ intents: GatewayIntentBits.Guilds });
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync("./src/functions");
for (const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of functionFiles) {
        require(`${__dirname}/functions/${folder}/${file}`)(client);
    }
}

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(token);
