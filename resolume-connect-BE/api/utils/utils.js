const fs = require('fs')
module.exports.getApiUrl = async() =>{
    const readApiUrl = await fs.readFileSync("./host.json", {
        encoding: "utf8",
      });
      const apiUrl = JSON.parse(readApiUrl);
      return apiUrl
}