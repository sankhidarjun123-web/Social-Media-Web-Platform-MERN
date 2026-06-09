const fs = require("fs");

const json = JSON.parse(
  fs.readFileSync("./config/vibeo-485708-ea6db0cfb272.json", "utf8")
);

console.log(JSON.stringify(json));