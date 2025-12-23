const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

const mapping = {
  '✍️': 'pen-tool',
  '⚖️': 'scale',
  '🔖': 'bookmark',
  '💼': 'briefcase',
  '📈': 'line-chart',
  '⏰': 'clock',
  '🗓️': 'calendar-clock',
  '📅': 'calendar-days',
  '👾': 'code',
  '🧾': 'receipt',
  '🔒': 'lock',
  '💸': 'banknote',
  '💻': 'braces',
  '🔑': 'key',
  '🏠': 'landmark',
  '📝': 'pilcrow',
  '🌙': 'moon',
  '🔐': 'key-round',
  '📋': 'clipboard',
  '％': 'percent',
  '🔳': 'qr-code',
  '🎲': 'dices',
  '🏦': 'landmark',
  '🏥': 'shield-plus',
  '↔️': 'file-diff',
  '🧹': 'wand-2',
  '🔄': 'refresh-cw',
  '⏳': 'stopwatch',
  '📏': 'ruler',
  '🔗': 'link',
  '🆔': 'fingerprint',
  '👨‍💻': 'code-2',
  '📊': 'bar-chart-3'
};

const featuresDir = path.join(__dirname, '../../src/features');

async function transform() {
  const features = await fs.readdir(featuresDir);
  for (const feature of features) {
    const configPath = path.join(featuresDir, feature, 'tool.yaml');
    if (await fs.pathExists(configPath)) {
      let content = await fs.readFile(configPath, 'utf8');
      let changed = false;

      for (const [emoji, lucide] of Object.entries(mapping)) {
        if (content.includes(emoji)) {
          // Use regex to replace exactly the icon value or items icon
          content = content.split(emoji).join(lucide);
          changed = true;
        }
      }

      if (changed) {
        await fs.writeFile(configPath, content);
        console.log(`✅ Updated ${feature}/tool.yaml`);
      }
    }
  }
}

transform();
