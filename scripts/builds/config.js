const path = require('path');

// CLI Args
const isSecure = process.argv.includes('--obfuscate');
const isDev = process.argv.includes('--dev');
let forceRebuild = process.argv.includes('--force');

// Paths
const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, isDev ? 'dist-dev' : 'dist');
const ASSETS_DIST = path.join(DIST_DIR, 'assets');
const CACHE_FILE = path.join(ROOT_DIR, '.build-cache.yaml');

// Internal paths for the framework itself (when running from node_modules)
const CORE_DIR = path.resolve(__dirname, '../../');

module.exports = {
  isSecure,
  isDev,
  forceRebuild,
  paths: {
    ROOT: ROOT_DIR,
    CORE_ROOT: CORE_DIR,
    SRC: SRC_DIR,
    DIST: DIST_DIR,
    ASSETS_DIST: ASSETS_DIST,
    CACHE_FILE: CACHE_FILE
  },
  setForceRebuild: (val) => { forceRebuild = val; }
};
