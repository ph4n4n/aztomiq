const fs = require('fs-extra');
const path = require('path');
const { paths } = require('./config');

async function buildPlaygroundExamples() {
  const examplesSrcDir = path.join(paths.SRC, 'features/web-playground/examples');
  const examplesDistFile = path.join(paths.ASSETS_DIST, 'features/web-playground/examples.js');

  if (!await fs.pathExists(examplesSrcDir)) return;

  console.time('📝 Building Playground Examples');

  const exampleDirs = await fs.readdir(examplesSrcDir);
  const examples = [];

  for (const dirName of exampleDirs) {
    const dirPath = path.join(examplesSrcDir, dirName);
    if (!(await fs.stat(dirPath)).isDirectory()) continue;

    const metaPath = path.join(dirPath, 'meta.json');
    const htmlPath = path.join(dirPath, 'index.html');
    const cssPath = path.join(dirPath, 'style.css');
    const jsPath = path.join(dirPath, 'script.js');

    if (!await fs.pathExists(metaPath)) continue;

    const meta = await fs.readJson(metaPath);
    const html = await fs.pathExists(htmlPath) ? await fs.readFile(htmlPath, 'utf8') : '';
    const css = await fs.pathExists(cssPath) ? await fs.readFile(cssPath, 'utf8') : '';
    const js = await fs.pathExists(jsPath) ? await fs.readFile(jsPath, 'utf8') : '';

    examples.push({
      id: meta.id || dirName,
      title: meta.title || dirName,
      html,
      css,
      js
    });
  }

  const output = `/** Generated File - Do Not Edit Directly **/
window.PLAYGROUND_EXAMPLES = ${JSON.stringify(examples, null, 2)};`;

  await fs.ensureDir(path.dirname(examplesDistFile));
  await fs.writeFile(examplesDistFile, output);

  console.timeEnd('📝 Building Playground Examples');
}

module.exports = { buildPlaygroundExamples };
