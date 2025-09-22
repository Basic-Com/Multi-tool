#!/usr/bin/env node
"use strict";

const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { spawn } = require("child_process");

const networking = require("./tools/networking");
const utilities = require("./tools/utilities");
const discord = require("./tools/discord");

// Allow HTTPS in packaged exe on some systems (use with caution)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.SKIP_TLS_CHECK === "1" ? "0" : "1";

// ensure logs file exists (safe)
const LOG_PATH = path.join(__dirname, "logs.txt");
try { if (!fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, ""); } catch (e) { /* ignore */ }

// ========== Logging ==========
function logUsage(action, input) {
  const log = `[${new Date().toISOString()}] ${action} => ${input}\n`;
  try { fs.appendFileSync(LOG_PATH, log); } catch (e) { /* ignore */ }
}

// ========== Pause ==========
async function pause() {
  await inquirer.prompt([{ type: "input", name: "c", message: chalk.gray("\nPress Enter to return to menu...") }]);
}

// ========== Banner ==========
function showBanner() {
  console.clear();
  console.log(chalk.magenta(`
╔══════════════════════════════════════╗
║                                      ║
║        🔧 MultiTool v1.0             ║
║        by YourNameHere               ║
║                                      ║
╚══════════════════════════════════════╝
`));
}

// ========== Auto-update (tools from GitHub) ==========
/*
  Behavior:
  - This autoupdate downloads individual tool files from a GitHub repo (raw URLs).
  - Only works when running from the filesystem (NOT inside a pkg-packed exe).
  - If you will package into an exe and want auto-update, use the exe-updater flow described below.
*/
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO/main/tools"; // << EDIT THIS

async function updateToolsFromGitHub() {
  // Only run when not inside pkg snapshot
  if (process.pkg) {
    console.log(chalk.yellow("[!] Running inside packaged exe — auto tool update disabled."));
    return;
  }

  const tools = ["networking.js", "utilities.js", "discord.js"];
  console.log(chalk.cyan("[*] Checking GitHub for tool updates..."));

  try {
    for (const t of tools) {
      const url = `${GITHUB_RAW_BASE}/${t}`;
      const res = await axios.get(url, { timeout: 10000 });
      if (res.status === 200 && res.data) {
        const filePath = path.join(__dirname, "tools", t);
        fs.writeFileSync(filePath, res.data, "utf8");
        console.log(chalk.green(`  [✓] Updated ${t}`));
      } else {
        console.log(chalk.gray(`  [-] No update for ${t}`));
      }
    }
  } catch (err) {
    console.log(chalk.red("[-] Auto-update failed:"), err.message);
  }
}

// ========== exe self-update helper ==========
/*
  For packaged exe auto-update you should host the latest exe artifact (e.g. dist/multitool.exe)
  and use a small updater script that:
   1) downloads latest exe to temp (multitool_new.exe)
   2) spawns the new exe then exits the old one
  Example function below to launch downloaded exe (download logic left to you / simple example included).
*/

async function downloadFileTo(fileUrl, outPath) {
  const writer = fs.createWriteStream(outPath);
  const resp = await axios.get(fileUrl, { responseType: "stream", timeout: 60000 });
  resp.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function checkAndUpdateExe(downloadUrl) {
  if (!process.pkg) {
    console.log(chalk.yellow("[!] Not running as exe — exe auto-update skipped."));
    return;
  }
  try {
    const tmp = path.join(require("os").tmpdir(), "multitool_new.exe");
    console.log(chalk.cyan("[*] Downloading new exe..."));
    await downloadFileTo(downloadUrl, tmp);
    console.log(chalk.green("[✓] Downloaded new exe — launching it now."));
    // Launch new exe and exit old
    spawn(tmp, [], { detached: true, stdio: "ignore" }).unref();
    process.exit(0);
  } catch (err) {
    console.log(chalk.red("[-] Exe update failed:"), err.message);
  }
}

// ========== Main menu (loop-based) ==========
async function interactiveMenu() {
  // Attempt auto-update of tools if running from source
  await updateToolsFromGitHub().catch(() => {});

  while (true) {
    showBanner();
    const { category } = await inquirer.prompt([
      { type: "list", name: "category", message: chalk.yellow("Select a category:"), choices: ["Networking", "Utilities", "Discord/API", "Updater", "Exit"] }
    ]);

    if (category === "Exit") {
      console.log(chalk.blue("[!] Exiting MultiTool..."));
      process.exit(0);
    }

    // Networking
    if (category === "Networking") {
      const { tool } = await inquirer.prompt([
        { type: "list", name: "tool", message: "Choose tool:", choices: ["IP Lookup", "Ping Host", "Back"] }
      ]);

      if (tool === "IP Lookup") {
        const { ip } = await inquirer.prompt([{ type: "input", name: "ip", message: "Enter IP:" }]);
        logUsage("IP Lookup", ip);
        await networking.ipLookup(ip);
        await pause();
      } else if (tool === "Ping Host") {
        const { host } = await inquirer.prompt([{ type: "input", name: "host", message: "Enter host:" }]);
        logUsage("Ping Host", host);
        await networking.pingHost(host);
        await pause();
      }
    }

    // Utilities
    if (category === "Utilities") {
      const { tool } = await inquirer.prompt([
        { type: "list", name: "tool", message: "Choose tool:", choices: ["Hash Generator", "Base64 Encode", "Base64 Decode", "Back"] }
      ]);

      if (tool === "Hash Generator") {
        const { text, algorithm } = await inquirer.prompt([
          { type: "input", name: "text", message: "Enter text:" },
          { type: "list", name: "algorithm", message: "Choose algorithm:", choices: ["md5", "sha1", "sha256"] }
        ]);
        logUsage("Hash Generator", `${algorithm} -> ${text}`);
        utilities.hashGenerator(text, algorithm);
        await pause();
      } else if (tool === "Base64 Encode") {
        const { text } = await inquirer.prompt([{ type: "input", name: "text", message: "Enter text:" }]);
        logUsage("Base64 Encode", text);
        utilities.base64Encode(text);
        await pause();
      } else if (tool === "Base64 Decode") {
        const { text } = await inquirer.prompt([{ type: "input", name: "text", message: "Enter Base64:" }]);
        logUsage("Base64 Decode", text);
        utilities.base64Decode(text);
        await pause();
      }
    }

    // Discord/API
    if (category === "Discord/API") {
      const { tool } = await inquirer.prompt([
        { type: "list", name: "tool", message: "Choose tool:", choices: ["Webhook Check", "Webhook Delete", "Webhook Spam", "Invite Lookup", "Guild Lookup", "Guild ID Lookup", "Back"] }
      ]);

      if (tool === "Webhook Check") {
        const { url } = await inquirer.prompt([{ type: "input", name: "url", message: "Enter Discord webhook URL:" }]);
        logUsage("Webhook Check", url);
        await discord.webhookCheck(url);
        await pause();
      } else if (tool === "Webhook Delete") {
        const { url } = await inquirer.prompt([{ type: "input", name: "url", message: "Enter Discord webhook URL:" }]);
        logUsage("Webhook Delete", url);
        await discord.deleteWebhook(url);
        await pause();
      } else if (tool === "Webhook Spam") {
        const { url, message, count, delay } = await inquirer.prompt([
          { type: "input", name: "url", message: "Enter Discord webhook URL:" },
          { type: "input", name: "message", message: "Message to send:" },
          { type: "number", name: "count", message: "Number of messages:", default: 5 },
          { type: "number", name: "delay", message: "Delay between messages (ms):", default: 800 }
        ]);
        logUsage("Webhook Spam", `${url} -> ${message} x${count}`);
        await discord.spamWebhook(url, message, count, delay);
        await pause();
      } else if (tool === "Invite Lookup") {
        const { code } = await inquirer.prompt([{ type: "input", name: "code", message: "Enter invite code or URL:" }]);
        logUsage("Invite Lookup", code);
        await discord.inviteInfo(code);
        await pause();
      } else if (tool === "Guild Lookup") {
        const { id } = await inquirer.prompt([{ type: "input", name: "id", message: "Enter Guild ID:" }]);
        logUsage("Guild Lookup", id);
        await discord.guildLookup(id);
        await pause();
      } else if (tool === "Guild ID Lookup") {
        const { id } = await inquirer.prompt([{ type: "input", name: "id", message: "Enter Guild ID:" }]);
        logUsage("Guild ID Lookup", id);
        discord.guildIdLookup(id);
        await pause();
      }
    }

    // Updater: manual controls
    if (category === "Updater") {
      const { action } = await inquirer.prompt([
        { type: "list", name: "action", message: "Updater actions:", choices: ["Update tools from GitHub (dev)", "Check & download latest exe (packaged)", "Back"] }
      ]);
      if (action === "Update tools from GitHub (dev)") {
        await updateToolsFromGitHub();
        await pause();
      } else if (action === "Check & download latest exe (packaged)") {
        const { url } = await inquirer.prompt([{ type: "input", name: "url", message: "Enter direct download URL for latest exe:" }]);
        await checkAndUpdateExe(url);
      }
    }
  }
}

// Start
(async () => {
  try {
    await interactiveMenu();
  } catch (err) {
    console.error(chalk.red("Unexpected error:"), err.stack || err.message || err);
    process.exit(1);
  }
})();
