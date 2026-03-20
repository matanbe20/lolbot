// Run once locally to register slash commands with Discord.
// Requires env vars: DISCORD_APPLICATION_ID, DISCORD_TOKEN
//
// Usage:
//   DISCORD_APPLICATION_ID=... DISCORD_TOKEN=... node scripts/register-commands.js
//
// Global commands take up to 1 hour to propagate.
// For instant testing, add DISCORD_GUILD_ID to register guild-scoped commands.

const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID; // optional

if (!APPLICATION_ID || !TOKEN) {
  console.error("Missing DISCORD_APPLICATION_ID or DISCORD_TOKEN env vars.");
  process.exit(1);
}

const commands = [
  {
    name: "champion",
    description: "Get a random League of Legends champion (3-hour cooldown)",
  },
  {
    name: "inventory",
    description: "View your champion inventory",
  },
];

const url = GUILD_ID
  ? `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`
  : `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;

(async () => {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to register commands (${res.status}):`, text);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`Registered ${data.length} command(s):`, data.map((c) => c.name).join(", "));
  if (GUILD_ID) {
    console.log(`Guild-scoped (instant) — guild: ${GUILD_ID}`);
  } else {
    console.log("Global commands — may take up to 1 hour to propagate.");
  }
})();
