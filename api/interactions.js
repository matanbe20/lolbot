const { InteractionType, InteractionResponseType, verifyKey } = require("discord-interactions");
const { fetchChampion, getInventory } = require("../app");

module.exports.config = { api: { bodyParser: false } };

async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];

  const isValid = verifyKey(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY);
  if (!isValid) {
    return res.status(401).end("Invalid signature");
  }

  const interaction = JSON.parse(rawBody.toString());

  // Handle Discord's PING verification
  if (interaction.type === InteractionType.PING) {
    return res.status(200).json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name } = interaction.data;
    const discordUser = interaction.member?.user || interaction.user;
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    if (name === "champion") {
      // Defer immediately — fetchChampion makes external HTTP calls that can exceed 3s
      res.status(200).json({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });

      try {
        const result = await fetchChampion(
          { id: discordUser.id, username: discordUser.username },
          avatarUrl
        );

        let embed;
        if (!result || !result.isAllowed) {
          embed = {
            description: result?.reason || "Something went wrong. Please try again.",
            color: 0xff0000,
          };
        } else {
          const { name: champName, id: champId, level, skinName, skinNum } = result;
          const api_version = "13.1.1"; // fallback; champion image works with any recent version
          embed = {
            title: `You got **${champName}**!`,
            description: `Level: **${level}**\nSkin: **${skinName}**`,
            color: 0x0099ff,
            image: {
              url: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champId}_${skinNum}.jpg`,
            },
          };
        }

        await fetch(
          `https://discord.com/api/v10/webhooks/${process.env.DISCORD_APPLICATION_ID}/${interaction.token}/messages/@original`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] }),
          }
        );
      } catch (err) {
        console.error("Error handling /champion followup:", err);
        await fetch(
          `https://discord.com/api/v10/webhooks/${process.env.DISCORD_APPLICATION_ID}/${interaction.token}/messages/@original`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [{ description: "An error occurred.", color: 0xff0000 }] }),
          }
        );
      }
      return;
    }

    if (name === "inventory") {
      const inventoryText = await getInventory({
        id: discordUser.id,
        username: discordUser.username,
      });

      const embed = {
        title: `${discordUser.username}'s Champion Inventory`,
        description: inventoryText || "Your inventory is empty.",
        color: 0x00cc44,
        footer: {
          text: "View your full inventory at lolbotviewer.vercel.app",
        },
      };

      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { embeds: [embed] },
      });
    }
  }

  return res.status(400).end("Unknown interaction type");
};
