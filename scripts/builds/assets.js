const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const { paths, isSecure } = require('./config');
const { hasChanged } = require('./cache');
const { getHash } = require('./utils');

const ASSET_HASHES = {};
function getAssetHash(relPath) {
  if (ASSET_HASHES[relPath]) return ASSET_HASHES[relPath];
  const fullPath = path.join(paths.DIST, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath);
    const hash = getHash(content).substring(0, 8);
    ASSET_HASHES[relPath] = hash;
    return hash;
  }
  return '';
}

function minifyJs(src, dest) {
  try {
    execSync(`npx terser "${src}" --compress --mangle --output "${dest}"`);
  } catch (e) {
    console.error(`Minify failed ${src}, copy raw`);
    fs.copySync(src, dest);
  }
}

function processJs(srcPath, destPath, fileName) {
  if (hasChanged(srcPath) || !fs.existsSync(destPath)) {
    if (isSecure) {
      console.time(`📦 Obfuscating JS: ${fileName}`);
      try {
        const cmd = `npx javascript-obfuscator "${srcPath}" --output "${destPath}" \
            --compact true --control-flow-flattening true --control-flow-flattening-threshold 0.5 \
            --dead-code-injection true --identifier-names-generator hexadecimal \
            --rename-globals true --string-array true --string-array-threshold 0.5 \
            --transform-object-keys true`;
        execSync(cmd);
      } catch (e) {
        console.error(`Obfuscation failed for ${fileName}, fallback to minify.`);
        minifyJs(srcPath, destPath);
      }
      console.timeEnd(`📦 Obfuscating JS: ${fileName}`);
    } else {
      console.time(`📄 Copying JS: ${fileName}`);
      fs.copySync(srcPath, destPath);
      console.timeEnd(`📄 Copying JS: ${fileName}`);
    }
  }
}

async function buildAssets() {
  const cssSrc = path.join(paths.SRC, 'assets', 'css');
  const jsSrc = path.join(paths.SRC, 'assets', 'js');
  const featuresDir = path.join(paths.SRC, 'features');
  const cssDist = path.join(paths.ASSETS_DIST, 'css');
  const jsDist = path.join(paths.ASSETS_DIST, 'js');
  const featuresDist = path.join(paths.ASSETS_DIST, 'features');

  await fs.ensureDir(paths.ASSETS_DIST);
  await fs.ensureDir(cssDist);
  await fs.ensureDir(jsDist);
  await fs.ensureDir(featuresDist);

  console.time('🎨 Assets Build');

  // 0. Copy all raw assets (images, fonts, vendor, etc)
  const assetsSrc = path.join(paths.SRC, 'assets');
  if (fs.existsSync(assetsSrc)) {
    const items = fs.readdirSync(assetsSrc);
    for (const item of items) {
      if (['css', 'js'].includes(item)) continue;
      const srcPath = path.join(assetsSrc, item);
      const destPath = path.join(paths.ASSETS_DIST, item);
      if (hasChanged(srcPath, 'assets-copy/', false)) {
        await fs.copy(srcPath, destPath);
        hasChanged(srcPath, 'assets-copy/', true);
      }
    }
  }

  // 1. Global CSS
  if (await fs.pathExists(cssSrc)) {
    const files = await fs.readdir(cssSrc);
    for (const file of files) {
      if (!file.endsWith('.css')) continue;
      const srcPath = path.join(cssSrc, file);
      const destPath = path.join(cssDist, file);
      if (hasChanged(srcPath) || !fs.existsSync(destPath)) {
        if (isSecure) {
          console.time(`🎨 Minifying Global CSS: ${file}`);
          try { execSync(`npx clean-css-cli -o "${destPath}" "${srcPath}"`); }
          catch (e) { await fs.copy(srcPath, destPath); }
          console.timeEnd(`🎨 Minifying Global CSS: ${file}`);
        } else {
          console.time(`🎨 Copying Global CSS: ${file}`);
          await fs.copy(srcPath, destPath);
          console.timeEnd(`🎨 Copying Global CSS: ${file}`);
        }
      }
    }
  }

  // 2. Global JS
  if (await fs.pathExists(jsSrc)) {
    const files = await fs.readdir(jsSrc);
    for (const file of files) {
      if (!file.endsWith('.js')) continue;
      const srcPath = path.join(jsSrc, file);
      const destPath = path.join(jsDist, file);
      processJs(srcPath, destPath, file);
    }
  }

  // 3. Feature Assets
  if (await fs.pathExists(featuresDir)) {
    const features = await fs.readdir(featuresDir);
    for (const feature of features) {
      const featDir = path.join(featuresDir, feature);
      if (!(await fs.stat(featDir)).isDirectory()) continue;

      const featDistDir = path.join(featuresDist, feature);
      await fs.ensureDir(featDistDir);

      // Feature CSS
      const cssPath = path.join(featDir, 'style.css');
      if (fs.existsSync(cssPath)) {
        const destPath = path.join(featDistDir, 'style.css');
        if (hasChanged(cssPath) || !fs.existsSync(destPath)) {
          if (isSecure) {
            console.time(`🎨 Minifying Feature CSS: ${feature}/style.css`);
            try { execSync(`npx clean-css-cli -o "${destPath}" "${cssPath}"`); }
            catch (e) { await fs.copy(cssPath, destPath); }
            console.timeEnd(`🎨 Minifying Feature CSS: ${feature}/style.css`);
          } else {
            console.time(`🎨 Copying Feature CSS: ${feature}/style.css`);
            await fs.copy(cssPath, destPath);
            console.timeEnd(`🎨 Copying Feature CSS: ${feature}/style.css`);
          }
        }
      }

      // Feature JS
      const files = fs.readdirSync(featDir);
      for (const file of files) {
        if (file.endsWith('.js') && file !== 'toolConfig.js') {
          const jsSrcPath = path.join(featDir, file);
          const jsDestPath = path.join(featDistDir, file);
          processJs(jsSrcPath, jsDestPath, `${feature}/${file}`);
        }
      }
    }
  }

  // 4. Special: Building Playground Examples from folders
  const { buildPlaygroundExamples } = require('./playground-examples');
  await buildPlaygroundExamples();

  console.timeEnd('🎨 Assets Build');
}

module.exports = {
  getAssetHash,
  buildAssets
};
