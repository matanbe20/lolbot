const token = process.env.token;
const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { fetchChampion, getInventory } = require("./app");
const COMMANDS = {
  CHAMPION: new Set(["!champion", "!champ", "!c", '!C', '!ב']),
  INVENTORY: new Set(["!inventory", "!inv", "!i"]),
};

const BOT_ID = '929764634423095296';

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  try {
    if (msg.author.id !== BOT_ID) {
      if (COMMANDS.CHAMPION.has(msg.content)) {
        let user = msg.mentions.users.first() || msg.author;
        let avatar = user.displayAvatarURL({ size: 1024, dynamic: true });
        const result = await fetchChampion(msg.author, avatar);
        const { name, level, isAllowed, reason, id } = result;
        const embed = new MessageEmbed();

        if (!isAllowed) {
          embed.setDescription(reason).setColor("#ff0000");
          console.log(reason);
        } else {
          const loadingSplashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`;
          embed.setDescription(
            `Nice, **${msg.author.username
            }** ! You've caught [**${name}**](https://lol.gamepedia.com/${encodeURI(name)})`
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
        const inventoryList = await getInventory(msg.author);
        const embed = new MessageEmbed();
        embed.color = 0x00ff00;
        embed.setDescription(
          `Hey **${msg.author.username}**, here's your [**inventory**](https://lolbotviewer.vercel.app/inventory?user=${encodeURI(msg.author.username)}): (Total ${inventoryList.split("\n").length
          } Champions)`
        );
        console.log(
          msg.author.username +
          " has requested his inventory, he has " +
          inventoryList.split("\n").length +
          " champions"
        );
        return msg.reply(embed);
      }
    }
  } catch (e) {
    console.error('general error:', JSON.stringify(e))
  }
});

client.login(token);


process.on('uncaughtException', (error) => {
  console.error("uncaughtException: ", JSON.stringify(error))
})