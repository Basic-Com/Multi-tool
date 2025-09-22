const chalk = require("chalk");
const crypto = require("crypto");

module.exports = {
  hashGenerator(text, algorithm) {
    try {
      const hash = crypto.createHash(algorithm).update(text).digest("hex");
      console.log(chalk.green(`[✓] ${algorithm} hash: ${hash}`));
    } catch {
      console.log(chalk.red("[-] Invalid algorithm"));
    }
  },

  base64Encode(text) {
    const encoded = Buffer.from(text).toString("base64");
    console.log(chalk.green(`[✓] Base64 Encoded: ${encoded}`));
  },

  base64Decode(text) {
    try {
      const decoded = Buffer.from(text, "base64").toString("utf8");
      console.log(chalk.green(`[✓] Base64 Decoded: ${decoded}`));
    } catch {
      console.log(chalk.red("[-] Invalid Base64"));
    }
  }
};
