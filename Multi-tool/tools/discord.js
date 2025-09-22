const axios = require("axios");
const chalk = require("chalk");

// decode discord snowflake -> date
function decodeSnowflake(id) {
  const discordEpoch = 1420070400000n;
  try {
    const created = new Date(Number((BigInt(id) >> 22n) + discordEpoch));
    return created.toISOString();
  } catch {
    return "Invalid ID";
  }
}

module.exports = {
  async webhookCheck(url) {
    console.log(chalk.cyan(`[?] Checking webhook...`));
    try {
      const res = await axios.get(url, { timeout: 10000 });
      if (res.status === 200 && res.data) {
        console.log(chalk.green("[✓] Webhook is valid!"));
        console.log(res.data);
      } else {
        console.log(chalk.red("[-] Webhook invalid or unreachable"));
      }
    } catch (err) {
      console.log(chalk.red("[-] Webhook check failed:"), err.response?.status || err.message);
    }
  },

  async deleteWebhook(url) {
    console.log(chalk.yellow(`[!] Deleting webhook...`));
    try {
      const res = await axios.delete(url, { timeout: 10000 });
      if (res.status >= 200 && res.status < 300) {
        console.log(chalk.green("[✓] Deleted webhook"));
      } else {
        console.log(chalk.red("[-] Failed to delete webhook"), res.status);
      }
    } catch (err) {
      console.log(chalk.red("[-] Delete failed:"), err.response?.status || err.message);
    }
  },

  async spamWebhook(url, message, count = 5, delay = 800) {
    console.log(chalk.yellow(`[!] Spamming webhook: ${count} messages (delay ${delay}ms)`));
    for (let i = 0; i < count; i++) {
      try {
        await axios.post(url, { content: message }, { timeout: 10000 });
        console.log(chalk.green(`[✓] Sent ${i + 1}/${count}`));
      } catch (err) {
        console.log(chalk.red(`[-] Failed at ${i + 1}:`), err.response?.status || err.message);
        break;
      }
      await new Promise(r => setTimeout(r, Number(delay) || 800));
    }
  },

  async inviteInfo(invite) {
    try {
      // normalize invite input (strip full urls, query strings)
      const cleaned = String(invite).trim().replace(/(^https?:\/\/)?(www\.)?discord\.gg\/?/, "").replace(/\?.*$/, "");
      const res = await axios.get(`https://discord.com/api/v10/invites/${encodeURIComponent(cleaned)}?with_counts=true&with_expiration=true`, { timeout: 10000 });
      console.log(chalk.green("[✓] Invite Info:"));
      const d = res.data;
      console.log("Server:", d.guild?.name || "N/A");
      console.log("Members:", d.approximate_member_count ?? "N/A");
      console.log("Online:", d.approximate_presence_count ?? "N/A");
      console.log("Invite Code:", d.code || "N/A");
      if (d.guild?.id && d.guild?.icon) {
        console.log("Icon URL:", `https://cdn.discordapp.com/icons/${d.guild.id}/${d.guild.icon}.png`);
      }
    } catch (err) {
      console.log(chalk.red("[-] Invite lookup failed:"), err.response?.status || err.message);
    }
  },

  async guildLookup(guildId) {
    try {
      if (!process.env.BOT_TOKEN) {
        console.log(chalk.red("[-] BOT_TOKEN not set in environment. Guild lookup requires a bot token."));
        return;
      }
      const res = await axios.get(`https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}`, {
        headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
        timeout: 10000
      });
      console.log(chalk.green("[✓] Guild Info:"));
      console.log("Name:", res.data.name);
      console.log("ID:", res.data.id);
      console.log("Owner ID:", res.data.owner_id);
      console.log("Features:", res.data.features?.join(", ") || "N/A");
      console.log("Created At:", decodeSnowflake(res.data.id));
    } catch (err) {
      console.log(chalk.red("[-] Guild lookup failed:"), err.response?.status || err.message);
    }
  },

  guildIdLookup(guildId) {
    try {
      console.log(chalk.green("[✓] Guild ID Lookup:"));
      console.log("Guild ID:", guildId);
      console.log("Created At:", decodeSnowflake(guildId));
    } catch {
      console.log(chalk.red("[-] Invalid Guild ID"));
    }
  }
};
