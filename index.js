const irc = require("irc");
const discord = require("discord.js");
const fetch = require('node-fetch');

require('http').createServer(function (_, res) {
    res.end();
}).listen(process.env.PORT);

try {
    function irc_say(channel, from, msg) {
        irc_client.say(channel, `<${from}> ${msg}`);
    }

    function discord_say(channel, from, msg) {
        channel.send(`**<${from}>** ${msg}`);
    }

    const irc_client = new irc.Client("irc.kode.tech", "kha-bridge", {
        channels: ["#kha", "#kinc", "#krom"],
    });

    irc_client.addListener("message#kha", function (from, msg) {
        discord_say(kha_channel, from, msg);
        discord_say(haxe_channel, from, msg);
    });

    irc_client.addListener("message#kinc", function (from, msg) {
        discord_say(kinc_channel, from, msg);
    });

    irc_client.addListener("message#krom", function (from, msg) {
        discord_say(krom_channel, from, msg);
    });

    const discord_client = new discord.Client();

    var kha_channel, kinc_channel, krom_channel, haxe_channel;

    discord_client.on("ready", () => {
        var status = 0;
        setInterval(function () {
            discord_client.user.setActivity(`${["Kha", "Kinc", "Krom"][status++]} enlighten the world`, { type: "WATCHING" });
            status = status % 3;
        }, 60000);

        discord_client.guilds.fetch("757530409876717609").then(guild => {
            kha_channel = guild.channels.cache.get("757530769315856425");
            kinc_channel = guild.channels.cache.get("757530799292678174");
            krom_channel = guild.channels.cache.get("757530822164348988");
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

    var haxe_people = {};
    discord_client.on("message", msg => {
        if (msg.author.id !== "756864665518211203") {
            const content = message_to_string(msg);

            if (msg.content.substr(0, 11) === "!is_sponsor") {
                fetch(`https://discord.com/api/v8/users/${msg.content.substr(12)}/profile`, {
                    headers: {
                        authorization: process.env.SPONSOR_TOKEN
                    }
                }).then(res => {
                    res.text().then(body => {
                        const accounts = JSON.parse(body).connected_accounts;
                        for (let i = 0; i < accounts.length; i++) {
                            if (accounts[i].type === "github") {
                                msg.channel.send(`<@${msg.content.substr(12)}> ${sponsors.includes(accounts[i].name)? "is" : "is not"} Rob's Github Sponsor`);
                            }
                        }
                    });
                });
            }

            if (msg.channel.id === kha_channel.id) {
                irc_say("#kha", msg.author.username, content);
                discord_say(haxe_channel, msg.author.username, content);
            } else if (msg.channel.id === kinc_channel.id) {
                irc_say("#kinc", msg.author.username, content);
            } else if (msg.channel.id === krom_channel.id) {
                irc_say("#krom", msg.author.username, content);
            } else if (msg.channel.id === haxe_channel.id) {
                irc_say("#kha", msg.author.username, content);
                discord_say(kha_channel, msg.author.username, content);

                const last_pm = haxe_people[msg.author.id];
                const time = Date.now();
                if (!last_pm || time - last_pm >= 86400000) {
                    msg.author.send("Hello there traveler! Watch out, you're in the land of Haxe. That's all right but it's not the native habitat of the Kha people. If you are brave enough, follow me through the 🌉 to the mystical land of Kode!\nPlease head here to get your special invite: http://discord.kode.tech");
                    haxe_people[msg.author.id] = time;
                }
            }
        }
    });

    discord_client.login(process.env.TOKEN);

    var sponsors = [];

    fetch("https://github.com/sponsors/RobDangerous").then(res => {
        res.text().then(body => {
            const start = body.indexOf(`id="sponsors"`);
            let tag_count = 0;
            for (let i = start; i < body.length; ++i) {
                if (body[i] === "<" && body.substr(i + 1, 3) !== "img") {
                    if (body[i + 1] === "/") {
                        if (--tag_count < 0) {
                            break;
                        }
                    } else {
                        ++tag_count;
                    }
                } else if (body.substr(i, 6) === `href="`) {
                    i += 7;
                    let user = "";
                    for (let e = i; e < body.length; ++e) {
                        if (body[e] === `"`) {
                            i = e;
                            break;
                        } else {
                            user += body[e];
                        }
                    }
                    sponsors.push(user);
                }
            }
        });
    });

} catch (e) {
    console.error(e);
}