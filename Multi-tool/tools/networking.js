const axios = require("axios");
const dns = require("dns");
const chalk = require("chalk");

module.exports = {
  async ipLookup(ip) {
    try {
      const res = await axios.get(`http://ip-api.com/json/${encodeURIComponent(ip)}`, { timeout: 10000 });
      if (res.data) {
        console.log(chalk.green("[✓] IP Lookup Result:"));
        console.log(res.data);
      } else {
        console.log(chalk.red("[-] IP not found"));
      }
    } catch (err) {
      console.log(chalk.red("[-] Failed to lookup IP:"), err.message);
    }
  },

  async pingHost(host) {
    try {
      // quick DNS resolve as a simple "ping"
      dns.lookup(host, (err, address) => {
        if (err) {
          console.log(chalk.red("[-] Host unreachable:", err.message));
        } else {
          console.log(chalk.green(`[✓] Host resolved: ${address}`));
        }
      });
    } catch (err) {
      console.log(chalk.red("[-] Ping error:"), err.message);
    }
  }
};
