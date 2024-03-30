const token = process.env.token;
const { Client, GatewayIntentBits, EmbedBuilder, Events } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences] });
const { fetchChampion, getInventory } = require("./app");
const COMMANDS = {
  CHAMPION: new Set(["!champion", "!champ", "!c", '!C', '!ב']),
  INVENTORY: new Set(["!inventory", "!inv", "!i"]),
};
const LOLBOT_ID = '929764634423095296'
client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, async (msg) => {
  try {
    const userId = msg.author.id;
    if (userId!== LOLBOT_ID) {
      if (COMMANDS.CHAMPION.has(msg.content)) {
        let user = msg.mentions.users.first() || msg.author;
        let avatar = user.displayAvatarURL({ size: 1024, dynamic: true });
        const result = await fetchChampion(msg.author, avatar);
        const { name, level, isAllowed, reason, id } = result;
        const embed = new EmbedBuilder();

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
          embed.setFooter({text: `Level ${level}`});
          console.log(
            msg.author.username + " has requested a champion, he got " + name
          );
        }
        return msg.reply({embeds: [embed]});
      }
      if (COMMANDS.INVENTORY.has(msg.content)) {
        const invetoryList = await getInventory(msg.author);
        const embed = new EmbedBuilder();
        embed.color = 0x00ff00;
        embed.setDescription(
          `Hey **${msg.author.username}**, here's your [**inventory**](https://lolbotviewer.vercel.app/inventory?user=${encodeURI(msg.author.id)}): (Total ${invetoryList.split("\n").length
          } Champions)` 
        );
        console.log(
          msg.author.username +
          " has requeted his inventory, he has " +
          invetoryList.split("\n").length +
          " champions"
        );
        return msg.reply({embeds: [embed]});
      }
    }
  }
  catch (e) {
    console.error('general error:', JSON.stringify(e.message))
  }
});

client.login(token);


process.on('uncaughtException', (error)=> {
  console.error("uncaughtException: ", JSON.stringify(error.message))
})

process.on('unhandledRejection', (error)=> {
  console.error("unhandledRejection: ", JSON.stringify(error.message))
})

process.on('SIGTERM', (error)=> {
  console.error("SIGTERM: ", JSON.stringify(error.message))
})

process.on('SIGABRT', (error)=> {
  console.error("SIGABRT: ", JSON.stringify(error.message))
})

process.on('SIGSTOP', (error)=> {
  console.error("SIGSTOP: ", JSON.stringify(error.message))
})


