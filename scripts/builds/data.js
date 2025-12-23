const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { paths } = require('./config');
const { parseFrontmatter } = require('./utils');

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Load Global Config
let GLOBAL_CONFIG = {
  build: { locales: ['vi', 'en'], default_locale: 'vi' },
  site: {},
  categories: {},
  category_order: []
};

const globalConfigPath = path.join(paths.SRC, 'data', 'global.yaml');
if (fs.existsSync(globalConfigPath)) {
  try {
    const yamlContent = fs.readFileSync(globalConfigPath, 'utf8');
    const parsed = yaml.load(yamlContent);
    GLOBAL_CONFIG = { ...GLOBAL_CONFIG, ...parsed };
  } catch (e) {
    console.error('⚠️ Could not load global.yaml:', e);
  }
}

const LOCALES = GLOBAL_CONFIG.build.locales;
const DEFAULT_LOCALE = GLOBAL_CONFIG.build.default_locale;

function loadLocales(lang) {
  const translations = {};
  const srcDir = paths.SRC;

  // 1. Load legacy file
  const legacyPath = path.join(srcDir, 'locales', `${lang}.json`);
  if (fs.existsSync(legacyPath)) {
    try {
      Object.assign(translations, require(legacyPath));
    } catch (e) { console.error(`Error loading legacy locale ${lang} `, e); }
  }

  // 2. Load module folders
  const dirPath = path.join(srcDir, 'locales', lang);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = require(path.join(dirPath, file));
          Object.assign(translations, content);
        } catch (e) { console.error(`Error loading locale module ${lang}/${file}`, e); }
      } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        try {
          const content = yaml.load(fs.readFileSync(path.join(dirPath, file), 'utf8'));
          Object.assign(translations, content);
        } catch (e) { console.error(`Error loading locale module ${lang}/${file}`, e); }
      }
    }
  }

  // 3. Load Feature Bundled Locales
  const featuresDir = path.join(srcDir, 'features');
  if (fs.existsSync(featuresDir)) {
    const features = fs.readdirSync(featuresDir);
    for (const feature of features) {
      const localePath = path.join(featuresDir, feature, 'locales', `${lang}.yaml`);
      if (fs.existsSync(localePath)) {
        try {
          const content = yaml.load(fs.readFileSync(localePath, 'utf8'));
          deepMerge(translations, content);
        } catch (e) {
          console.error(`Error loading feature locale ${feature}/${lang}.yaml`, e);
        }
      }
    }
  }

  return translations;
}

const TRANSLATIONS = {};
LOCALES.forEach(lang => {
  TRANSLATIONS[lang] = loadLocales(lang);
});

// Load Tools
const featuresDir = path.join(paths.SRC, 'features');
let TOOLS = [];
if (fs.existsSync(featuresDir)) {
  const features = fs.readdirSync(featuresDir);
  for (const feature of features) {
    const configPath = path.join(featuresDir, feature, 'tool.yaml');
    if (fs.existsSync(configPath)) {
      try {
        const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
        if (!config.id) config.id = feature;
        if (!config.link) config.link = `/${feature}/`;
        TOOLS.push(config);
      } catch (e) {
        console.error(`❌ Error parsing ${feature}/tool.yaml:`, e);
      }
    }
  }
}
TOOLS.sort((a, b) => a.id.localeCompare(b.id));

function getTools() {
  const categories = {};
  const toolsMap = {};

  TOOLS.forEach(tool => {
    const cat = tool.category || 'other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(tool);
    toolsMap[tool.id] = tool;
  });

  return { categories, tools: TOOLS, toolsMap };
}

function getGlobalData() {
  return {
    site: GLOBAL_CONFIG.site || {},
    build: GLOBAL_CONFIG.build || {},
    categories: GLOBAL_CONFIG.categories || {},
    category_order: GLOBAL_CONFIG.category_order || []
  };
}

function getFeatureConfig(filePath) {
  const featuresDir = path.join(paths.SRC, 'features');
  if (!filePath.startsWith(featuresDir)) return null;

  const rel = path.relative(featuresDir, filePath);
  const parts = rel.split(path.sep);
  if (parts.length === 0) return null;

  const featureName = parts[0];
  const configPath = path.join(featuresDir, featureName, 'tool.yaml');

  if (fs.existsSync(configPath)) {
    try {
      const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
      if (!config.id) config.id = featureName;
      return config;
    } catch (e) {
      console.error(`Error loading feature config for ${featureName}`, e);
    }
  }
  return null;
}

function getBlogPosts() {
  const postsDir = path.join(paths.SRC, 'features/blog/posts');
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  const posts = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const { attributes, body } = parseFrontmatter(content);
    if (!attributes.slug) attributes.slug = file.replace('.md', '');

    posts.push({
      ...attributes,
      body: body
    });
  });

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getTranslation(key, locale) {
  const keys = key.split('.');
  let result = TRANSLATIONS[locale];
  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      return key;
    }
  }
  return result;
}

module.exports = {
  GLOBAL_CONFIG,
  LOCALES,
  DEFAULT_LOCALE,
  TRANSLATIONS,
  TOOLS,
  getTools,
  getGlobalData,
  getFeatureConfig,
  getBlogPosts,
  getTranslation
};
