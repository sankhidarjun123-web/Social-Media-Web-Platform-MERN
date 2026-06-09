const crypto = require('crypto');


function generateTempUsername() {
  const randomString = crypto.randomBytes(6).toString("hex"); 
  return `user_${randomString}`;
}

module.exports = generateTempUsername;