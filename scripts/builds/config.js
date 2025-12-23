const path = require('path');

// CLI Args
const isSecure = process.argv.includes('--obfuscate');
const isDev = !isSecure;
let forceRebuild = process.argv.includes('--force');

// Paths
const ROOT_DIR = path.resolve(__dirname, '../../');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, isSecure ? 'dist' : 'dist-dev');
const ASSETS_DIST = path.join(DIST_DIR, 'assets');
const CACHE_FILE = path.join(ROOT_DIR, '.build-cache.yaml');

module.exports = {
  isSecure,
  isDev,
  forceRebuild,
  paths: {
    ROOT: ROOT_DIR,
    SRC: SRC_DIR,
    DIST: DIST_DIR,
    ASSETS_DIST: ASSETS_DIST,
    CACHE_FILE: CACHE_FILE
  },
  setForceRebuild: (val) => { forceRebuild = val; }
};
