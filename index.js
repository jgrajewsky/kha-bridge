const irc = require("irc");
const discord = require("discord.js");

require('http').createServer(function (_, res) {
    res.end();
}).listen(process.env.PORT);

function start() {
    try {
        function irc_say(channel, from, msg) {
            irc_client.say(channel, `<${from}> ${msg}`);
        }

        function discord_say(channel, from, msg) {
            channel.send(`**<${from}>** ${msg}`);
        }

        const irc_client = new irc.Client("irc.kode.tech", "kha-bridge", {
            channels: ["#beginners", "#kha", "#kinc"],
        });

        irc_client.addListener("message#beginners", function (from, msg) {
            discord_say(beginners_channel, from, msg);
        });

        irc_client.addListener("message#kha", function (from, msg) {
            discord_say(kha_channel, from, msg);
            discord_say(haxe_channel, from, msg);
        });

        irc_client.addListener("message#kinc", function (from, msg) {
            discord_say(kinc_channel, from, msg);
        });

        irc_client.addListener("message#showcase", function (from, msg) {
            discord_say(showcase_channel, from, msg);
        });

        const discord_client = new discord.Client();

        var beginners_channel;
        var kha_channel;
        var kinc_channel;
        var showcase_channel;
        var haxe_channel;

        discord_client.on("ready", () => {
            discord_client.guilds.fetch("756857638041682015").then(guild => {
                beginners_channel = guild.channels.cache.get("756859153791713280");
                kha_channel = guild.channels.cache.get("756857638775423070");
                kinc_channel = guild.channels.cache.get("756860334790410380");
                showcase_channel = guild.channels.cache.get("756893887586500659");
            });

            discord_client.guilds.fetch("162395145352904705").then(guild => {
                haxe_channel = guild.channels.cache.get("501447516852715525");
            });
        });

        function message_to_string(msg) {
            let message = msg.content;
            msg.attachments.each(attachment => {
                message += `\n${attachment.url}`;
            });
            return message;
        }

        discord_client.on("message", msg => {
            if (msg.author.id !== "756864665518211203") {
                const content = message_to_string(msg);
                if (msg.channel.id === beginners_channel.id) {
                    irc_say("#beginners", msg.author.username, content);
                } else if (msg.channel.id === kha_channel.id) {
                    irc_say("#kha", msg.author.username, content);
                    discord_say(haxe_channel, msg.author.username, content);
                } else if (msg.channel.id === kinc_channel.id) {
                    irc_say("#kinc", msg.author.username, content);
                } else if (msg.channel.id === showcase_channel.id) {
                    irc_say("#showcase", msg.author.username, content);
                } else if (msg.channel.id === haxe_channel.id) {
                    irc_say("#kha", msg.author.username, content);
                    discord_say(kha_channel, msg.author.username, content);
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