const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load Config
const ROOT_DIR = path.join(__dirname, '..');
const globalConfigPath = path.join(ROOT_DIR, 'src/data/global.yaml');
// 1. Initial Defaults
const defaults = {
  branch: 'gh-pages',
  remote: 'origin',
  dist_folder: 'dist',
  strategy: 'init'
};

// 2. Parse CLI Arguments (e.g. --branch=prod)
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.split('=');
    acc[key.replace('--', '').replace('-', '_')] = value || true;
  }
  return acc;
}, {});

// 3. Load Global Config
let yamlConfig = {};
try {
  if (fs.existsSync(globalConfigPath)) {
    const parsed = yaml.load(fs.readFileSync(globalConfigPath, 'utf8'));
    // Merge order: defaults < yaml.build.deploy < yaml.deployment
    const buildDeploy = parsed.build?.deploy || {};
    const topDeployment = parsed.deployment || {};

    // Normalize keys (handle "folder" as "dist_folder")
    const normalize = (obj) => {
      if (obj.folder) {
        obj.dist_folder = obj.folder;
        delete obj.folder;
      }
      return obj;
    };

    yamlConfig = { ...normalize(buildDeploy), ...normalize(topDeployment) };
  }
} catch (e) {
  console.warn('⚠️ Warning: Failed to parse global.yaml, using defaults.');
}

// 4. Final Config (Priority: CLI > YAML > Defaults)
const config = { ...defaults, ...yamlConfig, ...args };
const { branch, remote, dist_folder, strategy } = config;

console.time('🚀 Deployment Duration');
console.log('🚀 Starting Deployment...');
console.log(`📡 Target: ${remote}/${branch}`);
console.log(`📂 Folder: ${dist_folder}`);
console.log(`🛠️  Strategy: ${strategy}`);

try {
  // 1. Build
  console.log('📦 Building Production...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Ensure dist exists
  const deployDir = path.resolve(ROOT_DIR, dist_folder);
  if (!fs.existsSync(deployDir)) {
    throw new Error(`Build folder "${dist_folder}" not found.`);
  }

  // 4. Deployment
  if (strategy === 'init') {
    // Strategy: Init new repo in dist and force push (Good for external repo deploy)
    console.log('☁️  Deploying via git init strategy...');

    // Commands run inside dist folder
    execSync('git init', { cwd: deployDir, stdio: 'inherit' });

    // Set default branch for new repo to main/master to avoid issues
    try { execSync('git checkout -b main', { cwd: deployDir, stdio: 'quiet' }); } catch (e) { }

    // Ensure the current directory is safe
    try { execSync('git config --global --add safe.directory ' + deployDir, { stdio: 'inherit' }); } catch (e) { }

    execSync('git add .', { cwd: deployDir, stdio: 'inherit' });
    try {
      execSync('git commit -m "🚀 Deploy: ' + new Date().toISOString() + '"', { cwd: deployDir, stdio: 'inherit' });
    } catch (e) {
      console.log('⚠️ Nothing to commit, proceeding to push.');
    }

    // Determine the actual URL
    let remoteUrl = remote;
    const isUrl = remote.includes('://') || remote.startsWith('git@');

    if (!isUrl) {
      try {
        remoteUrl = execSync(`git remote get-url ${remote}`).toString().trim();
      } catch (e) {
        console.error(`❌ Error: Could not resolve remote name "${remote}" to a URL.`);
        process.exit(1);
      }
    }

    // Add remote to the dist repo
    try {
      execSync(`git remote add deploy-remote "${remoteUrl}"`, { cwd: deployDir, stdio: 'inherit' });
    } catch (e) {
      execSync(`git remote set-url deploy-remote "${remoteUrl}"`, { cwd: deployDir, stdio: 'inherit' });
    }

    const pushCmd = `git push --force deploy-remote HEAD:${branch}`;
    console.log(`> ${pushCmd}`);
    execSync(pushCmd, { cwd: deployDir, stdio: 'inherit' });

  } else {
    // Strategy: Git Subtree (Good for same-repo gh-pages)
    console.log('☁️  Pushing subtree...');

    // Ensure dist is committed first (subtree needs it)
    try { execSync(`git add ${dist_folder} -f`, { stdio: 'inherit' }); } catch (e) { }
    try { execSync('git commit -m "🚀 Deploy: Update dist"', { stdio: 'inherit' }); } catch (e) { }

    const cmd = `git subtree push --prefix ${dist_folder} ${remote} ${branch}`;
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
  }

  console.log('✅ Deployed Successfully!');
  console.timeEnd('🚀 Deployment Duration');

} catch (e) {
  console.error('❌ Deployment Failed:', e.message);
  process.exit(1);
}
