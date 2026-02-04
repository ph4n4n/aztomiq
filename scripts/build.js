const fs = require('fs-extra');
const { paths, isSecure, forceRebuild } = require('./builds/config');
const { saveCache } = require('./builds/cache');
const { buildAssets } = require('./builds/assets');
const { buildPages } = require('./builds/pages');
const { buildTemplates, createRootRedirect, copyRootFiles } = require('./builds/templates');
// const { buildAdmin } = require('./builds/admin');

(async () => {
  console.time('🚀 Build Duration');
  console.log(`🚀 Starting build (Secure Mode: ${isSecure ? 'ON' : 'OFF'})...`);

  if (forceRebuild) {
    try {
      console.time("🧹 Cleaned dist folder");
      await fs.emptyDir(paths.DIST);
      console.timeEnd("🧹 Cleaned dist folder");
    } catch (e) { }
  } else {
    await fs.ensureDir(paths.DIST);
  }

  try {
    await buildAssets();
    await buildPages();
    // await buildAdmin(); 
    // await createRootRedirect(); // Disabled for SEO Strategy: root serves default locale directly
    await buildTemplates();
    await copyRootFiles();

    saveCache();
    console.log('✅ Build complete!');
  } catch (err) {
    console.error('❌ Build Failed:', err);
    process.exit(1);
  }

  console.timeEnd('🚀 Build Duration');
})();
