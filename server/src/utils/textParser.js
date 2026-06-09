function extractMentions(text) {
  const regex = /@([a-zA-Z0-9_]{3,30})/g;
  return [...text.matchAll(regex)].map(m => m[1]);
}

function extractHashtags(text) {
  const regex = /#([a-zA-Z0-9_]{2,50})/g;
  return [...text.matchAll(regex)].map(h => h[1].toLowerCase());
}

module.exports = { extractMentions, extractHashtags };