const token = process.env.token;
const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { fetchChampion, getInventory } = require("./app");
const COMMANDS = {
  CHAMPION: new Set(["!champion", "!champ", "!c"]),
  INVENTORY: new Set(["!inventory", "!inv", "!i"]),
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  if (msg.author.username !== "lolbot") {
    if (COMMANDS.CHAMPION.has(msg.content)) {
      const result = await fetchChampion(msg.author.username);
      const { name, level, isAllowed, reason, id } = result;
      const embed = new MessageEmbed();

      if (!isAllowed) {
        embed.setDescription(reason).setColor("#ff0000");
        console.log(reason);
      } else {
        const loadingSplashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`;
        embed.setDescription(
          `Nice, **${
            msg.author.username
          }** ! You've caught [**${name}**](https://lol.gamepedia.com/${name.replace(
            /\./g,
            ""
          )})`
        );
        embed.color = 0x00ff00;
        console.log(loadingSplashUrl);
        embed.setImage(loadingSplashUrl);
        embed.setFooter(`Level ${level}`);
        console.log(
          msg.author.username + " has requested a champion, he got " + name
        );
      }
      return msg.reply(embed);
    }
    if (COMMANDS.INVENTORY.has(msg.content)) {
      const invetoryList = await getInventory(msg.author.username);

      const embed = new MessageEmbed();
      embed.color = 0x00ff00;
      embed.setDescription(
        `Hey **${msg.author.username}**, here's your inventory: (Total ${
          invetoryList.split("\n").length
        } Champions)` +
          "\n" +
          invetoryList
      );
      console.log(
        msg.author.username +
          " has requeted his inventory, he has " +
          invetoryList.split("\n").length +
          " champions"
      );
      return msg.reply(embed);
    }
  }
});

client.login(token);
