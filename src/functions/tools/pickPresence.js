const { ActivityType, PresenceUpdateStatus } = require("discord.js");

module.exports = (client) => {
    client.pickPresence = async () => {
        const options = [
            {
                type: ActivityType.Watching,
                text: "for new plot to create !",
                status: PresenceUpdateStatus.Online,
            },
            {
                type: ActivityType.Listening,
                text: "for commands",
                status: PresenceUpdateStatus.Idle,
            },
            {
                type: ActivityType.Watching,
                text: "Q with Multiviewer for F1",
                status: PresenceUpdateStatus.DoNotDisturb,
            },
            {
                type: ActivityType.Playing,
                text: "with F1 Data !",
                status: PresenceUpdateStatus.Online,
            },
            {
                type: ActivityType.Playing,
                text: "In test, please do not use.",
                status: PresenceUpdateStatus.DoNotDisturb,
            },
        ];

        function randomNumber() {
            var result = "";
            var characters = "012";
            var charactersLength = characters.length;
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength),
            );
            return result;
        }

        const option = 1; //randomNumber();

        try {
            await client.user.setPresence({
                activities: [
                    {
                        name: options[option].text,
                        type: options[option].type,
                        
                    },
                ],
                status: options[option].status,
            });
        } catch (err) {
            console.error(err);
        }
    };
};
