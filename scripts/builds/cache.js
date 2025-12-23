const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const { paths, isSecure, forceRebuild } = require('./config');
const { getHash } = require('./utils');

let buildCache = {};

if (fs.existsSync(paths.CACHE_FILE)) {
  try {
    buildCache = yaml.load(fs.readFileSync(paths.CACHE_FILE, 'utf8')) || {};
  } catch (e) {
    console.warn("⚠️ Failed to load build cache, starting fresh.");
  }
}

function hasChanged(filePath, keyPrefix = '', update = true) {
  if (forceRebuild) return true;
  if (!fs.existsSync(filePath)) return true;
  if (fs.statSync(filePath).isDirectory()) return true;

  const content = fs.readFileSync(filePath);
  const currentHash = getHash(content);

  // Separate cache for dev and prod
  const modePrefix = isSecure ? 'prod/' : 'dev/';
  const relPath = path.relative(paths.SRC, filePath);
  const cacheKey = modePrefix + keyPrefix + relPath;

  if (buildCache[cacheKey] !== currentHash) {
    if (update) buildCache[cacheKey] = currentHash;
    return true;
  }
  return false;
}

function saveCache() {
  try {
    fs.writeFileSync(paths.CACHE_FILE, yaml.dump(buildCache));
  } catch (e) {
    console.error("⚠️ Failed to save build cache:", e);
  }
}

module.exports = {
  hasChanged,
  saveCache
};
