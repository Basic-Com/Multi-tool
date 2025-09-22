const axios = require("axios");
const chalk = require("chalk");

module.exports = {
  async ipLookup(ip) {
    console.log(chalk.cyanBright(`[+] Looking up IP: ${ip}`));
    try {
      const res = await axios.get(`http://ip-api.com/json/${ip}`);
      if (res.data.status === "fail") {
        console.log(chalk.red("[-] Invalid IP address"));
      } else {
        console.log(chalk.green("[✓] IP Info:"));
        console.table(res.data);
      }
    } catch {
      console.log(chalk.red("[-] Error fetching IP info"));
    }
  },

  async pingHost(host) {
    console.log(chalk.cyanBright(`[+] Checking host: ${host}`));
    try {
      const res = await axios.get(`https://${host}`);
      console.log(chalk.green(`[✓] Host responded with status: ${res.status}`));
    } catch {
      console.log(chalk.red("[-] Host unreachable"));
    }
  }
};
