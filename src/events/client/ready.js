const chalk = require("chalk");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        setInterval(client.pickPresence, 10 * 1000);
        console.log(`${chalk.bgCyan("[BOT]")} Logged as ${client.user.tag}.`);
    },
};
