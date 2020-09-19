const irc = require("irc");
const discord = require("discord.js");

require('http').createServer(function (_, res) {
    res.end();
}).listen(process.env.PORT);

function start() {
    try {
        const irc_client = new irc.Client("irc.kode.tech", "KhaBridge", {
            channels: ["#kha"],
        });

        irc_client.addListener("message#kha", function (from, message) {
            kha_channel.send(`**<${from}>** ${message}`);
        });

        irc_client.addListener("message#kinc", function (from, message) {
            kinc_channel.send(`**<${from}>** ${message}`);
        });

        function irc_say(channel, msg) {
            irc_client.say(channel, `<${msg.author.username} on #${msg.channel.name}> ${msg.content}`);
        }

        const discord_client = new discord.Client();

        var kha_channel;
        var kinc_channel;

        discord_client.on("ready", () => {
            discord_client.guilds.fetch("756857638041682015").then(guild => {
                kha_channel = guild.channels.cache.get("756857638775423070");
                kinc_channel = guild.channels.cache.get("756857638775423070");
            });
        });

        discord_client.on("message", msg => {
            if (msg.author.id !== "756864665518211203") {
                if (msg.channel.id === "756857638775423070") {
                    irc_say("#kha", msg);
                } else if (msg.channel.id === "756860334790410380") {
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