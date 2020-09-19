const irc = require("irc");
const discord = require("discord.js");

require('http').createServer(function (_, res) {
    res.end();
}).listen(process.env.PORT);

function start() {
    try {
        function irc_say(channel, msg) {
            irc_client.say(channel, `<${msg.author.username}> ${msg.content}`);
        }

        function discord_say(channel, from, msg) {
            if (from === "Kha-IRC-Bridge") {
                const split = msg.split(">");
                channel.send(`**<${split[0].substr(1)}>** ${msg.substr(split[0].length + 2)}`);
            } else {
                channel.send(`**<${from}>** ${msg}`);
            }
        }

        const irc_client = new irc.Client("irc.kode.tech", "KhaBridge", {
            channels: ["#beginners", "#kha", "#kinc"],
        });

        irc_client.addListener("message#beginners", function (from, msg) {
            discord_say(beginners_channel, from, msg);
        });

        irc_client.addListener("message#kha", function (from, msg) {
            discord_say(kha_channel, from, msg);
        });

        irc_client.addListener("message#kinc", function (from, msg) {
            discord_say(kinc_channel, from, msg);
        });

        const discord_client = new discord.Client();

        var beginners_channel;
        var kha_channel;
        var kinc_channel;

        discord_client.on("ready", () => {
            discord_client.guilds.fetch("756857638041682015").then(guild => {
                beginners_channel = guild.channels.cache.get("756859153791713280");
                kha_channel = guild.channels.cache.get("756857638775423070");
                kinc_channel = guild.channels.cache.get("756860334790410380");
            });
        });

        discord_client.on("message", msg => {
            if (msg.author.id !== "756864665518211203") {
                if (msg.channel.id === beginners_channel.id) {
                    irc_say("#beginners", msg);
                } else if (msg.channel.id === kha_channel.id) {
                    irc_say("#kha", msg);
                } else if (msg.channel.id === kinc_channel.id) {
                    irc_say("#kinc", msg);
                }
            }
        });

        discord_client.login(process.env.TOKEN);

    } catch (e) {
        console.error(e);
        setTimeout(start, 0);
    }
}

start();