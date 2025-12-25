#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const projectName = process.argv[2] || 'my-aztomiq-site';
const projectPath = path.resolve(process.cwd(), projectName);

if (fs.existsSync(projectPath)) {
  console.error(`❌ Directory "${projectName}" already exists.`);
  process.exit(1);
}

console.log(`🚀 Creating a new AZtomiq project: ${projectName}...`);

// 1. Create project folder
fs.ensureDirSync(projectPath);

// 2. Define Template Structure (Minimal)
const templateDirs = [
  'src/assets/css',
  'src/assets/js',
  'src/assets/images',
  'src/data',
  'src/features/hello-world/locales',
  'src/includes',
  'src/locales/en',
  'src/locales/vi',
  'src/pages',
  'src/templates'
];

templateDirs.forEach(dir => fs.ensureDirSync(path.join(projectPath, dir)));

// 3. Create Basic Files
const packageJson = {
  name: projectName,
  version: '1.0.0',
  scripts: {
    "dev": "aztomiq dev",
    "build": "aztomiq build",
    "status": "aztomiq status"
  },
  dependencies: {
    "aztomiq": "latest"
  }
};
fs.writeJsonSync(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

const globalYaml = `site:
  title: "${projectName}"
  description: "Built with AZtomiq"
build:
  locales: ["en", "vi"]
  default_locale: "en"
`;
fs.writeFileSync(path.join(projectPath, 'src/data/global.yaml'), globalYaml);

// 4. Create a Sample Tool
const toolYaml = `id: hello-world
category: general
icon: smile
status: active
`;
fs.writeFileSync(path.join(projectPath, 'src/features/hello-world/tool.yaml'), toolYaml);

const toolEjs = `<h1>Hello World</h1>
<p>Welcome to your new AZtomiq site!</p>
`;
fs.writeFileSync(path.join(projectPath, 'src/features/hello-world/index.ejs'), toolEjs);

console.log(`\n✅ Project "${projectName}" initialized successfully!`);
console.log(`👉 Next steps:`);
console.log(`   cd ${projectName}`);
console.log(`   npm install`);
console.log(`   npm run dev`);
