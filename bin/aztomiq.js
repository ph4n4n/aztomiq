#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const yaml = require('js-yaml');

const args = process.argv.slice(2);
const command = args[0];

const ROOT = path.join(__dirname, '..');

const commands = {
  build: async () => {
    const force = args.includes('--force');
    const obfuscate = args.includes('--obfuscate');
    const cmdArgs = ['scripts/build.js'];
    if (force) cmdArgs.push('--force');
    if (obfuscate) cmdArgs.push('--obfuscate');
    runNode(cmdArgs);
  },
  dev: async () => {
    runNode(['scripts/build.js', '--dev'], () => {
      runNode(['server.js']);
    });
  },
  deploy: async () => {
    runNode(['scripts/deploy.js']);
  },
  test: async () => {
    const type = args[1] || 'all';
    if (type === 'ui') {
      runNode(['scripts/ui-test.js']);
    } else {
      runNpm(['run', 'test']);
    }
  },
  status: async () => {
    console.log('\n🔍  Scanning AZtomiq Ecosystem...');
    const featuresDir = path.join(ROOT, 'src/features');
    const testDir = path.join(ROOT, 'tests/features');
    const dirs = await fs.readdir(featuresDir);

    console.log('-----------------------------------------------------------------------------------');
    console.log(`${'Feature ID'.padEnd(25)} | ${'Status'.padEnd(10)} | ${'Locales'.padEnd(10)} | ${'Tests'.padEnd(8)} | ${'Mode'}`);
    console.log('-----------------------------------------------------------------------------------');

    for (const id of dirs) {
      const featPath = path.join(featuresDir, id);
      if (!(await fs.stat(featPath)).isDirectory()) continue;

      const toolYaml = path.join(featPath, 'tool.yaml');
      if (!await fs.pathExists(toolYaml)) continue;

      const config = yaml.load(await fs.readFile(toolYaml, 'utf8'));
      const vi = await fs.pathExists(path.join(featPath, 'locales/vi.yaml'));
      const en = await fs.pathExists(path.join(featPath, 'locales/en.yaml'));
      const hasTest = (await fs.readdir(testDir)).some(f => f.startsWith(id));

      const status = config.status === 'active' ? '✅ ACTIVE' : '🚧 DRAFT';
      const locales = (vi ? 'VI ' : '   ') + (en ? 'EN' : '');
      const test = hasTest ? '✓ YES' : '✗ NO';
      const mode = (config.mode || 'std').toUpperCase();

      console.log(`${id.padEnd(25)} | ${status.padEnd(10)} | ${locales.padEnd(10)} | ${test.padEnd(8)} | ${mode}`);
    }
    console.log('-----------------------------------------------------------------------------------\n');
  },
  analyze: async () => {
    console.log('\n📊  Analyzing Tool Payload...');
    let distFolder = 'dist';
    let distAssets = path.join(ROOT, 'dist/assets/features');

    if (!await fs.pathExists(distAssets)) {
      distFolder = 'dist-dev';
      distAssets = path.join(ROOT, 'dist-dev/assets/features');
    }

    if (!await fs.pathExists(distAssets)) {
      console.error('❌ Build folder (dist/ or dist-dev/) not found. Please run "aztomiq build" first.');
      return;
    }

    console.log(`📂  Target: ${distFolder}/`);
    const tools = await fs.readdir(distAssets);
    let totalSize = 0;

    console.log('------------------------------------------------------------------');
    console.log(`${'Tool ID'.padEnd(25)} | ${'CSS Size'.padEnd(12)} | ${'JS Size'.padEnd(12)} | ${'Total'}`);
    console.log('------------------------------------------------------------------');

    for (const tool of tools) {
      const toolDir = path.join(distAssets, tool);
      if (!(await fs.stat(toolDir)).isDirectory()) continue;

      const cssFile = path.join(toolDir, 'style.css');
      const jsFile = path.join(toolDir, 'script.js');

      const cssSize = await fs.pathExists(cssFile) ? (await fs.stat(cssFile)).size : 0;
      const jsSize = await fs.pathExists(jsFile) ? (await fs.stat(jsFile)).size : 0;
      const sum = cssSize + jsSize;
      totalSize += sum;

      console.log(`${tool.padEnd(25)} | ${formatBytes(cssSize).padEnd(12)} | ${formatBytes(jsSize).padEnd(12)} | ${formatBytes(sum)}`);
    }
    console.log('------------------------------------------------------------------');
    console.log(`${'TOTAL ECOSYSTEM SIZE'.padEnd(55)} | ${formatBytes(totalSize)}`);
    console.log('------------------------------------------------------------------\n');
  },
  cleanup: async () => {
    console.log('🧹 Cleaning up workspace...');

    // 1. Remove dist folders
    await fs.remove(path.join(ROOT, 'dist'));
    await fs.remove(path.join(ROOT, 'dist-dev'));
    console.log('✅ Removed dist/ and dist-dev/');

    // 2. Identify and remove draft tools if requested
    if (args.includes('--drafts')) {
      const featuresDir = path.join(ROOT, 'src/features');
      const dirs = await fs.readdir(featuresDir);
      for (const id of dirs) {
        const toolYamlPath = path.join(featuresDir, id, 'tool.yaml');
        if (await fs.pathExists(toolYamlPath)) {
          const config = yaml.load(await fs.readFile(toolYamlPath, 'utf8'));
          if (config.status === 'draft') {
            await fs.remove(path.join(featuresDir, id));
            console.log(`🗑️  Deleted draft tool: ${id}`);
          }
        }
      }
    }
    console.log('✨ Workspace is clean.\n');
  },
  version: async () => {
    const type = args[1] || 'patch'; // patch, minor, major
    const targetId = args[2]; // specific tool id or 'all'

    const bump = (v, t) => {
      let [ma, mi, pa] = v.split('.').map(Number);
      if (t === 'major') ma++;
      else if (t === 'minor') mi++;
      else pa++;
      if (t === 'major') mi = 0;
      if (t === 'major' || t === 'minor') pa = 0;
      return `${ma}.${mi}.${pa}`;
    };

    const featuresDir = path.join(ROOT, 'src/features');
    const tools = await fs.readdir(featuresDir);

    for (const id of tools) {
      if (targetId && targetId !== 'all' && targetId !== id) continue;

      const yamlPath = path.join(featuresDir, id, 'tool.yaml');
      if (!await fs.pathExists(yamlPath)) continue;

      const raw = await fs.readFile(yamlPath, 'utf8');
      const config = yaml.load(raw);

      if (!config.meta) config.meta = { version: '1.0.0' };
      const oldV = config.meta.version || '1.0.0';
      const newV = bump(oldV, type);

      config.meta.version = newV;
      await fs.writeFile(yamlPath, yaml.dump(config));
      console.log(`🚀 ${id.padEnd(25)} : ${oldV} -> ${newV}`);
    }
  },
  'tool:create': async () => {
    const name = args[1];
    if (!name) {
      console.error('❌ Please specify a tool name. Example: aztomiq tool:create my-new-tool');
      return;
    }

    const toolDir = path.join(ROOT, 'src/features', name);
    if (await fs.pathExists(toolDir)) {
      console.error(`❌ Tool "${name}" already exists at ${toolDir}`);
      return;
    }

    console.log(`🚀 Creating new tool: ${name}...`);

    await fs.ensureDir(toolDir);
    await fs.ensureDir(path.join(toolDir, 'locales'));

    const toolYaml = `id: ${name}
category: utilities
icon: box
title_key: ${name}.title
desc_key: ${name}.desc
status: active
link: /${name}/
mode: standard
meta:
  version: 1.0.0
`;
    await fs.writeFile(path.join(toolDir, 'tool.yaml'), toolYaml);

    const indexEjs = `<!-- title: <%= t('${name}.title') %> - AZtomiq -->
<section class="tool-page-container">
  <div class="tool-header">
    <h1><i data-lucide="box"></i> <%= t('${name}.title') %></h1>
    <p><%= t('${name}.desc') %></p>
    <div class="tool-meta">
      <span class="version-badge" id="open-changelog">v<%= toolConfig.meta.version %></span>
    </div>
  </div>

  <div class="card tool-card">
    <div class="input-group">
      <label>Sample Input</label>
      <input type="text" id="sample-input" placeholder="Type something...">
    </div>
    <button id="action-btn" class="btn-primary">Execute</button>
    <div id="result-area" class="result-box muted">
      Result will appear here...
    </div>
  </div>
</section>

<script src="<%= toolConfig._assets.js %>"></script>
<link rel="stylesheet" href="<%= toolConfig._assets.css %>">
`;
    await fs.writeFile(path.join(toolDir, 'index.ejs'), indexEjs);

    const styleCss = `.tool-card {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
}
.result-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-hover);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  min-height: 50px;
}
`;
    await fs.writeFile(path.join(toolDir, 'style.css'), styleCss);

    const scriptJs = `document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('sample-input');
  const btn = document.getElementById('action-btn');
  const result = document.getElementById('result-area');

  btn.addEventListener('click', () => {
    const val = input.value || 'No input';
    result.textContent = 'You entered: ' + val;
    result.classList.remove('muted');
    console.log('[${name}] Action executed');
  });
});
`;
    await fs.writeFile(path.join(toolDir, 'script.js'), scriptJs);

    const enYaml = `${name}:
  title: "${name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')}"
  desc: "Professional utility tool for ${name}."
`;
    const viYaml = `${name}:
  title: "${name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')}"
  desc: "Công cụ tiện ích chuyên nghiệp cho ${name}."
`;
    await fs.writeFile(path.join(toolDir, 'locales/en.yaml'), enYaml);
    await fs.writeFile(path.join(toolDir, 'locales/vi.yaml'), viYaml);

    console.log(`✅ Tool "${name}" created successfully!`);
    console.log(`👉 Edit it at: src/features/${name}`);
  }
};

if (!command || !commands[command]) {
  console.log(`
🛠️  AZtomiq CLI v${require('../package.json').version}

Usage:
  aztomiq <command> [options]

Commands:
  aztomiq dev             Start development server (Watcher + Node)
  aztomiq build           Build for production (--force, --obfuscate)
  aztomiq deploy          Deploy to public distribution repository
  aztomiq status          Scan ecosystem health (Locales, Tests, Config)
  aztomiq analyze         Analyze tool payloads and ecosystem size
  aztomiq cleanup         Remove build artifacts (--drafts to delete draft tools)
  aztomiq version <type> [id] Bump versions of tools (patch, minor, major)
  aztomiq test            Run integrity and logic tests
  aztomiq test ui         Run Puppeteer UI automation tests
  aztomiq tool:create <id> Scaffold a new atomic tool
  `);
  process.exit(0);
}

commands[command]().catch(err => {
  console.error('❌ Error executing command:', err);
  process.exit(1);
});

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function runNode(args, cb) {
  const proc = spawn('node', args, { stdio: 'inherit', cwd: ROOT });
  proc.on('close', (code) => {
    if (code === 0 && cb) cb();
  });
}

function runNpm(args, cb) {
  const proc = spawn('npm', args, { stdio: 'inherit', cwd: ROOT, shell: true });
  proc.on('close', (code) => {
    if (code === 0 && cb) cb();
  });
}
