const fs = require('fs-extra');
const path = require('path');
const { paths } = require('./config');

async function buildAdmin() {
  const adminSrc = path.join(paths.SRC, 'admin');
  const adminDist = path.join(paths.DIST, 'admin');

  if (fs.existsSync(adminSrc)) {
    console.log('🛡️  Building Admin Panel...');
    await fs.ensureDir(adminDist);
    await fs.copy(adminSrc, adminDist);
    console.log('✅ Admin Panel copied.');
  }
}

module.exports = { buildAdmin };
