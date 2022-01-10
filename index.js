const token = process.env.token;
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
        const loadingSplashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.replace(/\./g,"")}_0.jpg`;
        embed.setDescription(
          `Nice, **${msg.author.username}** ! You've caught [**${champion}**](https://lol.gamepedia.com/${champion.replace(/\./g,"")})`
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


process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
})
