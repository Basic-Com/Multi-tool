const axios = require("axios");
const chalk = require("chalk");

// Decode Discord snowflake (ID -> creation date)
function decodeSnowflake(id) {
  const discordEpoch = 1420070400000n;
  return new Date(Number((BigInt(id) >> 22n) + discordEpoch));
}

module.exports = {
  // ✅ Webhook Check
  async webhookCheck(url) {
    try {
      const res = await axios.get(url);
      if (res.status === 200 && res.data) {
        console.log(chalk.green("[✓] Webhook is valid!"));
        console.log(res.data);
      }
    } catch {
      console.log(chalk.red("[-] Webhook invalid or unreachable"));
    }
  },

  // ✅ Webhook Delete
  async deleteWebhook(url) {
    try {
      await axios.delete(url);
      console.log(chalk.green("[✓] Webhook deleted successfully!"));
    } catch (err) {
      console.log(chalk.red("[-] Failed to delete webhook"), err.message);
    }
  },

  // ✅ Webhook Spam
  async spamWebhook(url, message, count = 5) {
    for (let i = 0; i < count; i++) {
      try {
        await axios.post(url, { content: message });
        console.log(chalk.green(`[✓] Sent ${i + 1}/${count}`));
      } catch (err) {
        console.log(chalk.red(`[-] Failed at ${i + 1}`), err.message);
        break;
      }
      await new Promise(res => setTimeout(res, 500)); // 0.5s delay
    }
  },

  // ✅ Invite Lookup
async inviteInfo(invite) {
  try {
    // Strip both https://discord.gg/ and discord.gg/ if present
    invite = invite
      .replace(/^https?:\/\/discord\.gg\//, "")
      .replace(/^discord\.gg\//, "")
      .trim();

    const res = await axios.get(
      `https://discord.com/api/v10/invites/${invite}?with_counts=true&with_expiration=true`
    );

    const data = res.data;
    console.log(chalk.green("\n[✓] Invite Found!"));
    console.log(chalk.yellow("Server:"), data.guild?.name || "Unknown");
    console.log(chalk.yellow("Members:"), data.approximate_member_count);
    console.log(chalk.yellow("Online:"), data.approximate_presence_count);
    console.log(chalk.yellow("Invite Code:"), data.code);

    if (data.guild?.icon) {
      console.log(
        chalk.yellow("Icon URL:"),
        `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`
      );
    }
  } catch (err) {
    console.log(
      chalk.red("[-] Invite lookup failed:"),
      err.response?.status || err.message
    );
  }
},


  // ✅ Guild Lookup (requires BOT token in env)
  async guildLookup(guildId) {
    try {
      const res = await axios.get(
        `https://discord.com/api/v10/guilds/${guildId}`,
        {
          headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }
        }
      );

      const data = res.data;
      console.log(chalk.green("\n[✓] Guild Found!"));
      console.log(chalk.yellow("Name:"), data.name);
      console.log(chalk.yellow("Owner ID:"), data.owner_id);
      console.log(chalk.yellow("ID:"), data.id);
      console.log(chalk.yellow("Created At:"), decodeSnowflake(data.id));
    } catch (err) {
      console.log(
        chalk.red("[-] Guild lookup failed:"),
        err.response?.status || err.message
      );
    }
  },

  // ✅ Guild ID Lookup (snowflake only)
  guildIdLookup(guildId) {
    try {
      const createdAt = decodeSnowflake(guildId);
      console.log(chalk.green("\n[✓] Guild ID Decoded!"));
      console.log(chalk.yellow("Guild ID:"), guildId);
      console.log(chalk.yellow("Created At:"), createdAt);
    } catch {
      console.log(chalk.red("[-] Invalid Guild ID"));
    }
  }
};
