const crypto = require("crypto");
const chalk = require("chalk");

module.exports = {
  hashGenerator(text, algorithm) {
    try {
      const hash = crypto.createHash(algorithm).update(String(text)).digest("hex");
      console.log(chalk.green(`[✓] ${algorithm} hash:`), hash);
    } catch (err) {
      console.log(chalk.red("[-] Invalid algorithm"), err.message);
    }
  },

  base64Encode(text) {
    try {
      const encoded = Buffer.from(String(text)).toString("base64");
      console.log(chalk.green("[✓] Base64 Encoded:"), encoded);
    } catch (err) {
      console.log(chalk.red("[-] Encode failed:"), err.message);
    }
  },

  base64Decode(text) {
    try {
      const decoded = Buffer.from(String(text), "base64").toString("utf-8");
      console.log(chalk.green("[✓] Base64 Decoded:"), decoded);
    } catch (err) {
      console.log(chalk.red("[-] Invalid Base64:"), err.message);
    }
  }
};
