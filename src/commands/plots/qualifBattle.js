const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { spawn } = require("child_process");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("quali_battle")
        .setDescription("battle")
        .addStringOption((option) =>
            option
                .setName("year")
                .setDescription("The year")
                .setRequired(false),
        ),

    async execute(interaction, client) {
        await interaction.deferReply();
        await interaction.editReply({
            content: `Let me think, why I'm doing this plot. (*jk it's loading*)`,
        });
        let year = interaction.options.getString("year");
        if (year === null) {
            year = 2022;
        }
        const python = spawn("python3", [
            "src/commands/plots/python/qualifBattle.py",
            year,
        ]);

        let errors = [];
        let logs = [];

        python.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
            logs.push(data);
        });
        python.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
            errors.push(data);
        });

        python.on("close", async (code) => {
            console.log(`child process close all stdio with code ${code}`);
            if (code !== 0) {
                let _error = errors[errors.length - 1];
                await interaction.editReply(
                    `<@249542934666543104> *Can you stop doing shit ?* ${
                        _error.includes(
                            "The data you are trying to access has not been loaded yet. See `Session.load`",
                        )
                            ? "The data is not available for now."
                            : `Python ERROR`
                    }. `,
                );
                return;
            }
            const attachment = new AttachmentBuilder(
                "src/commands/plots/python/Figure.png",
                { name: "Plot.png" },
            );
            await interaction.editReply({
                content: `Battle Qualifying ${year}`,
                files: [attachment],
            });
        });
    },
};
