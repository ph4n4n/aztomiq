
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Configuration
const SRC_DIR = path.join(__dirname, 'src');
const FEATURES_DIR = path.join(SRC_DIR, 'features');
const DIST_DIR = path.join(__dirname, 'dist-dev');

app.use(cors());
app.use(bodyParser.json());

// 1. Static Files (Serve the site)
app.use(express.static(DIST_DIR));

// 2. Admin API
// GET /api/features - List all features and their configs
app.get('/api/features', (req, res) => {
  try {
    const features = fs.readdirSync(FEATURES_DIR).filter(f => {
      return fs.statSync(path.join(FEATURES_DIR, f)).isDirectory();
    });

    const data = features.map(feature => {
      const configPath = path.join(FEATURES_DIR, feature, 'tool.yaml');
      if (fs.existsSync(configPath)) {
        const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
        return { id: feature, config };
      }
      return null;
    }).filter(item => item !== null);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/features/:id - Update feature config
app.post('/api/features/:id', (req, res) => {
  const { id } = req.params;
  const newConfig = req.body;
  const configPath = path.join(FEATURES_DIR, id, 'tool.yaml');

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ error: 'Feature not found' });
  }

  try {
    fs.writeFileSync(configPath, yaml.dump(newConfig), 'utf8');
    console.log(`📝 Updated config for ${id}`);

    console.log('🔄 Triggering rebuild...');
    exec('node scripts/build.js', (error, stdout, stderr) => {
      if (error) console.error(`Build error: ${error}`);
      else console.log(`✅ Build complete`);
    });

    res.json({ success: true, message: 'Config updated and rebuild triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/global
app.get('/api/global', (req, res) => {
  try {
    const globalPath = path.join(SRC_DIR, 'data', 'global.yaml');
    if (fs.existsSync(globalPath)) {
      const config = yaml.load(fs.readFileSync(globalPath, 'utf8'));
      res.json(config);
    } else {
      res.json({});
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/global
app.post('/api/global', (req, res) => {
  try {
    const globalPath = path.join(SRC_DIR, 'data', 'global.yaml');
    const newConfig = req.body;

    fs.writeFileSync(globalPath, yaml.dump(newConfig), 'utf8');
    console.log(`📝 Updated Global Config`);

    console.log('🔄 Triggering rebuild...');
    exec('node scripts/build.js', (error, stdout, stderr) => {
      if (error) console.error(`Build error: ${error}`);
      else console.log(`✅ Build complete`);
    });

    res.json({ success: true, message: 'Global config updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for SPA routing (only for page requests, not assets)
app.use((req, res) => {
  // If request has an extension, it's likely a missing asset
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  🚀 Admin Server running at http://localhost:${PORT}/admin
  👉 Admin API: http://localhost:${PORT}/api/features
  👉 Website:   http://localhost:${PORT}/
  `);
});
