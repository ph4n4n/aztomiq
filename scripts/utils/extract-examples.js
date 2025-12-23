const fs = require('fs-extra');
const path = require('path');

const EXAMPLES_FILE = path.join(__dirname, '../../src/features/web-playground/examples.js');
const EXAMPLES_DIR = path.join(__dirname, '../../src/features/web-playground/examples');

async function extract() {
  const content = await fs.readFile(EXAMPLES_FILE, 'utf8');
  // Basic extraction using regex (not perfect but should work for this specific file structure)
  // Actually, it's easier to just REQUIRE the file if it was a module, but it's a window property.
  // Let's use a safer way: eval or just parse the JS. 
  // Since I know the structure, I'll just use a small hack to get the array.

  const arrayStart = content.indexOf('window.PLAYGROUND_EXAMPLES = [');
  const arrayEnd = content.lastIndexOf('];');
  const arrayStr = content.substring(arrayStart + 'window.PLAYGROUND_EXAMPLES ='.length, arrayEnd + 1);

  let examples = [];
  try {
    examples = eval(arrayStr);
  } catch (e) {
    console.error("Failed to eval examples array", e);
    return;
  }

  await fs.ensureDir(EXAMPLES_DIR);

  for (const ex of examples) {
    const dir = path.join(EXAMPLES_DIR, ex.id);
    await fs.ensureDir(dir);

    await fs.writeFile(path.join(dir, 'index.html'), ex.html || '');
    await fs.writeFile(path.join(dir, 'style.css'), ex.css || '');
    await fs.writeFile(path.join(dir, 'script.js'), ex.js || '');
    await fs.writeJson(path.join(dir, 'meta.json'), {
      id: ex.id,
      title: ex.title
    }, { spaces: 2 });

    console.log(`✅ Extracted: ${ex.id}`);
  }
}

extract();
