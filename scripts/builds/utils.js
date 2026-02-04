const crypto = require('crypto');

// Helper: Calculate MD5 Hash
function getHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Helper to parse Frontmatter
function parseFrontmatter(content) {
  // Regex to match frontmatter:
  // Starts with ---
  // Followed by optional content
  // Ends with ---
  // Followed by remaining content
  // Handles \r\n and optional spaces after ---
  const match = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]*([\s\S]*)$/);
  if (!match) return { attributes: {}, body: content };

  const yaml = match[1];
  const body = match[2]; // Don't trim here to preserve EJS structure if needed
  const attributes = {};

  yaml.split(/\r?\n/).forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts.shift().trim();
      const value = parts.join(':').trim();
      // Handle simple booleans
      if (value === 'true') attributes[key] = true;
      else if (value === 'false') attributes[key] = false;
      else attributes[key] = value;
    }
  });

  return { attributes, body };
}

module.exports = {
  getHash,
  parseFrontmatter
};
