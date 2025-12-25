const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const { paths } = require('./config');
const { getHash } = require('./utils');
const { getTools, getBlogPosts, getGlobalData, GLOBAL_CONFIG, LOCALES, DEFAULT_LOCALE, TOOLS } = require('./data');

// We need direct access to cache state or similar mechanic for copyRootFiles
// But easier to just use fs checks for simplicity or import hasChanged if applicable.
// Since these are root files, hasChanged (rel to SRC) won't work easily.
const { hasChanged } = require('./cache');

async function buildTemplates() {
  const projectTemplatesDir = path.join(paths.SRC, 'templates');
  const coreTemplatesDir = path.join(paths.CORE_ROOT, 'src/templates');

  const templateDirs = [coreTemplatesDir, projectTemplatesDir].filter(fs.existsSync);
  if (templateDirs.length === 0) return;

  console.time('📝 Templates Build');

  const { categories, tools, toolsMap } = getTools();
  const blogPosts = getBlogPosts();

  // Map to store final file paths (project overrides core)
  const templateFiles = {};

  for (const dir of templateDirs) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.ejs')) {
        templateFiles[file] = path.join(dir, file);
      }
    }
  }

  for (const [file, filePath] of Object.entries(templateFiles)) {
    // Logic for hasChanged?
    // "template/" + relative path
    // But templates might depend on global data too.
    // For simplicity, always build or check simple hash.
    // We can use hasChanged with a custom key logic effectively by passing full path?
    // No, hasChanged enforces relative to SRC.
    // Let's just build them fast.

    try {
      const templateContent = fs.readFileSync(filePath, 'utf-8');
      const outputName = file.replace('.ejs', ''); // robots.txt.ejs -> robots.txt
      const outputPath = path.join(paths.DIST, outputName);

      const data = {
        global: GLOBAL_CONFIG,
        site: GLOBAL_CONFIG.site,
        tools: TOOLS,
        locales: LOCALES,
        defaultLocale: DEFAULT_LOCALE,
        t: (key) => key, // Dummy t function if needed or load default locale
        blogPosts: blogPosts || [],
        toolsMap,
        categories,
        isDev: require('./config').isDev
      };

      const rendered = ejs.render(templateContent, data, {
        filename: filePath
      });

      await fs.writeFile(outputPath, rendered);
      console.log(`📄 Generated: ${outputName}`);
    } catch (e) {
      console.error(`❌ Error building template ${file}:`, e);
    }
  }
  console.timeEnd('📝 Templates Build');
}

async function createRootRedirect() {
  const entry = GLOBAL_CONFIG.build.entry_point === 'blog' ? 'blog/' : '';
  const redirectUrl = `/${DEFAULT_LOCALE}/${entry}`;

  const html = `<!DOCTYPE html>
<html lang="${DEFAULT_LOCALE}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=${redirectUrl}">
    <script>
        window.location.href = '${redirectUrl}';
    </script>
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="${redirectUrl}">${redirectUrl}</a>...</p>
</body>
</html>`;
  await fs.writeFile(path.join(paths.DIST, 'index.html'), html);
  console.log('📄 Created root redirect index.html');
}

async function copyRootFiles() {
  // Logic to copy files from ROOT to DIST if they exist and changed
  // e.g. manual robots.txt override
  const files = ['manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml'];
  for (const file of files) {
    const srcPath = path.join(paths.ROOT, file);
    if (fs.existsSync(srcPath)) {
      // We'll just copy for now, skipping cache logic complexity to keep it simple or implement if critical.
      const destPath = path.join(paths.DIST, file);
      await fs.copy(srcPath, destPath);
      console.log(`📂 Copied root file: ${file}`);
    }
  }
}

module.exports = {
  buildTemplates,
  createRootRedirect,
  copyRootFiles
};
