const sharp = require('sharp');

module.exports = async function getImageMeta(buffer) {
  const meta = await sharp(buffer).metadata();
  return {
    width: meta.width,
    height: meta.height,
  };
}
