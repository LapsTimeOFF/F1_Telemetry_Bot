const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { spawn } = require("child_process");
const { downloadData } = require("../../utils/functions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("corneranalyse")
        .setDescription("Create a comparative plot of a corner")
        .addStringOption((option) =>
            option
                .setName("year")
                .setDescription("The year of the GP")
                .setRequired(true)
                .setAutocomplete(true),
        )
        .addStringOption((option) =>
            option
                .setName("gp")
                .setDescription("The GP you want to analyse")
                .setRequired(true)
                .setAutocomplete(true),
        )
        .addStringOption((option) =>
            option
                .setName("session")
                .setDescription(
                    "The session you want to analyse (FP1,FP2,FP3 for Practice; Q for Qualification; R for Race)",
                )
                .setRequired(true)
                .setAutocomplete(true),
        )
        .addStringOption((option) =>
            option
                .setName("driver1")
                .setDescription("The TLA of the 1st driver you want to analyse")
                .setRequired(true)
                .setAutocomplete(true),
        )
        .addStringOption((option) =>
            option
                .setName("driver2")
                .setDescription("The TLA of the 2nd driver you want to analyse")
                .setRequired(true)
                .setAutocomplete(true),
        )
        .addStringOption((option) =>
            option
                .setName("meterofstart")
                .setDescription("The meter of the start")
                .setRequired(true)
                .setAutocomplete(false),
        )
        .addStringOption((option) =>
            option
                .setName("meterofend")
                .setDescription("The meter of the end")
                .setRequired(true)
                .setAutocomplete(false),
        )
        .addStringOption((option) =>
            option
				.setName("lap")
				.setDescription("Lap")
				.setRequired(false),
        ),

    async execute(interacton, client) {
        downloadData(interacton);
    },

    async python(interacton) {
        let Year = interacton.options.getString("year");
        let GP = interacton.options.getString("gp");
        let Session = interacton.options.getString("session").toUpperCase();
        let Driver1 = interacton.options.getString("driver1").toUpperCase();
        let Driver2 = interacton.options.getString("driver2").toUpperCase();
        let meterofstart = interacton.options.getString("meterofstart");
        let meterofend = interacton.options.getString("meterofend");
        let lap = interacton.options.getString("lap");
		
		if(lap === null) lap = 'Fastest';

        const python = spawn("python3", [
            "src/commands/plots/python/cornerAnalyse.py",
            Year,
            GP,
            Session,
            Driver1,
            Driver2,
            meterofstart,
            meterofend,
			lap
        ]);

        let errors = [];

        python.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
        });
        python.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
            errors.push(data);
        });

        python.on("close", async (code) => {
            console.log(`child process close all stdio with code ${code}`);
            if (code !== 0) {
                let _error = errors[errors.length - 1];
                await interacton.editReply(
                    `Sorry, this command failed. ${
                        _error.includes(
                            "The data you are trying to access has not been loaded yet. See `Session.load`",
                        )
                            ? "The data is not available for now."
                            : `Python ERROR \`\`\`${_error}\`\`\``
                    } `,
                );
                return;
            }
            const attachment = new AttachmentBuilder(
                "src/commands/plots/python/Figure.png",
                { name: "Plot.png" },
            );
            let response = await interacton.editReply({
                content: `Corner comparison ${Driver1} vs. ${Driver2} - ${Year} ${GP} ${Session}`,
                files: [attachment],
                fetchReply: true,
            });
        });
    },

    async autocomplete(interaction, client) {
        const focusedValue = interaction.options.getFocused();
        let focused = "";
        for (
            let _i = 0;
            _i < interaction.options["_hoistedOptions"].length;
            _i++
        ) {
            const option = interaction.options["_hoistedOptions"][_i];
            if (option.focused) {
                focused = option.name;
            }
        }
        let choices = [];
        if (focused.startsWith("driver")) {
            choices = [
                "VER",
                "PER",
                "LEC",
                "SAI",
                "HAM",
                "RUS",
                "NOR",
                "RIC",
                "GAS",
                "TSU",
                "OCO",
                "ALO",
                "VET",
                "STR",
                "MSC",
                "MAG",
                "ZHO",
                "BOT",
                "LAT",
                "ALB",
            ];
        }
        if (focused.startsWith("gp")) {
            choices = [
                "Bahrain",
                "Saudi Arabia",
                "Australia",
                "Imola",
                "Miami",
                "Spain",
                "Monaco",
                "Azerbaïjan",
                "Canada",
                "Great Britain",
                "Austria",
                "France",
                "Hungary",
                "Belgium",
                "Netherlands",
                "Monza",
                "Singapore",
                "Japan",
                "Austin",
                "Mexico",
                "Brazil",
                "Abu Dhabi",
            ];
        }
        if (focused.startsWith("session")) {
            choices = ["FP1", "FP2", "FP3", "Q", "SR", "R"];
        }
        if (focused.startsWith("year")) {
            choices = ["2018", "2019", "2020", "2021", "2022"];
        }
        const filtered = choices.filter((choice) =>
            choice.startsWith(focusedValue),
        );
        await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice })),
        );
    },
};
