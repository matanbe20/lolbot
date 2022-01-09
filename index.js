const token = "OTI5NzY0NjM0NDIzMDk1Mjk2.YdsEyw.DIxQ0A8dM6RlWyzRbwCE6NOjpGs";
const { Client, Intents, MessageEmbed } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { fetchChampion, getInventory } = require("./app");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on("message", async (msg) => {
  if (msg.author.username !== "lolbot") {
    if (msg.content === "!champion" || msg.content === "!c") {
      const result = await fetchChampion(msg.author.username);
      const {champion, level, isAllowed, reason} = result;
      const embed = new MessageEmbed();

      if(!isAllowed){
        embed.setDescription(reason)
        .setColor("#ff0000");
      }else{
        const loadingSplashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion}_0.jpg`;
        embed.setDescription(
          `Nice, **${msg.author.username}** ! You've caught [**${champion}**](https://lol.gamepedia.com/${champion})`
        );
        embed.color = 0x00ff00;
        console.log(loadingSplashUrl);
        embed.setImage(loadingSplashUrl);
        embed.setFooter(`Level ${level}`);
      } 

      return msg.reply(embed);
    }
    if (msg.content === "!inventory" || msg.content === "!i") {
      const invetoryList = await getInventory(msg.author.username);

      const embed = new MessageEmbed();
      embed.color = 0x00ff00;
      embed.setDescription(
        `Your inventory: (Total ${invetoryList.split('\n').length} Champions)` + "\n" + invetoryList
      );
      return msg.reply(embed);
    }
  }
});

client.login(token);
