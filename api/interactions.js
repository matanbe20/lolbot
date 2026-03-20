const { InteractionType, InteractionResponseType, verifyKey } = require("discord-interactions");
const { waitUntil } = require("@vercel/functions");
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

async function handleChampionFollowup(interaction, discordUser, avatarUrl) {
  const patchUrl = `https://discord.com/api/v10/webhooks/${process.env.DISCORD_APPLICATION_ID}/${interaction.token}/messages/@original`;

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
      const { name: champName, id: champId, numericId, level, skinName, skinNum } = result;
      const skinId = Number(numericId) * 1000 + Number(skinNum);
      const communityDragonUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/${numericId}/${skinId}.jpg`;
      const ddragonFallbackUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champId}_0.jpg`;
      const imageCheck = await fetch(communityDragonUrl, { method: "HEAD" });
      const imageUrl = imageCheck.ok ? communityDragonUrl : ddragonFallbackUrl;
      embed = {
        title: `You got **${champName}**!`,
        description: `Level: **${level}**\nSkin: **${skinName}**`,
        color: 0x0099ff,
        image: { url: imageUrl },
      };
    }

    const patchRes = await fetch(patchUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!patchRes.ok) {
      console.error("Discord PATCH failed:", patchRes.status, await patchRes.text());
    }
  } catch (err) {
    console.error("Error in champion followup:", err);
    await fetch(patchUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [{ description: "An error occurred.", color: 0xff0000 }] }),
    });
  }
}

async function handleInventoryFollowup(interaction, discordUser) {
  const patchUrl = `https://discord.com/api/v10/webhooks/${process.env.DISCORD_APPLICATION_ID}/${interaction.token}/messages/@original`;

  try {
    const inventoryText = await getInventory({
      id: discordUser.id,
      username: discordUser.username,
    });

    const championCount = inventoryText ? inventoryText.split("\n").length : 0;
    const viewerUrl = `https://lolbotviewer.vercel.app/inventory?user=${discordUser.id}`;
    const embed = {
      title: `${discordUser.username}'s Champion Inventory`,
      description: `You own **${championCount}** champion${championCount !== 1 ? "s" : ""}.\n\n[View full inventory](${viewerUrl})`,
      color: 0x00cc44,
    };

    const patchRes = await fetch(patchUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!patchRes.ok) {
      console.error("Discord PATCH failed:", patchRes.status, await patchRes.text());
    }
  } catch (err) {
    console.error("Error in inventory followup:", err);
    await fetch(patchUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [{ description: "An error occurred.", color: 0xff0000 }] }),
    });
  }
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
      waitUntil(handleChampionFollowup(interaction, discordUser, avatarUrl));
      return res.status(200).json({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });
    }

    if (name === "inventory") {
      waitUntil(handleInventoryFollowup(interaction, discordUser));
      return res.status(200).json({ type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });
    }
  }

  return res.status(400).end("Unknown interaction type");
};
