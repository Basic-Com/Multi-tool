#!/usr/bin/env node
const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const networking = require("./tools/networking");
const utilities = require("./tools/utilities");
const discord = require("./tools/discord");

// Allow Discord HTTPS calls in pkg
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Ensure logs.txt exists
const logPath = path.join(__dirname, "logs.txt");
if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, "");

// Log usage
function logUsage(action, input) {
  const log = `[${new Date().toISOString()}] ${action} => ${input}\n`;
  try { fs.appendFileSync(logPath, log); } catch {}
}

// Pause
async function pause() {
  await inquirer.prompt([{ type: "input", name: "continue", message: chalk.gray("\nPress Enter to return to menu...") }]);
}

// Banner
function showBanner() {
  console.clear();
  console.log(
    chalk.magenta(`
╔══════════════════════════════════════╗
║                                      ║
║        🔧 MultiTool v2.2             ║
║        by YourNameHere               ║
║                                      ║
╚══════════════════════════════════════╝
`)
  );
}

// Interactive Menu
async function interactiveMenu() {
  while (true) {
    showBanner();
    const { category } = await inquirer.prompt([
      { type: "list", name: "category", message: chalk.yellow("Select a category:"), choices: ["Networking", "Utilities", "Discord/API", "Exit"] }
    ]);

    if (category === "Exit") {
      console.log(chalk.blue("[!] Exiting MultiTool..."));
      process.exit(0);
    }

    // --- Networking ---
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

    // --- Utilities ---
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

    // --- Discord/API ---
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
        const { url, message, count } = await inquirer.prompt([
          { type: "input", name: "url", message: "Enter Discord webhook URL:" },
          { type: "input", name: "message", message: "Message to spam:" },
          { type: "number", name: "count", message: "Number of times:", default: 5 }
        ]);
        logUsage("Webhook Spam", `${url} -> ${message} x${count}`);
        await discord.spamWebhook(url, message, count);
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
        await discord.guildIdLookup(id);
        await pause();
      }
    }
  }
}

// Start
interactiveMenu();
