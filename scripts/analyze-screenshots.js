#!/usr/bin/env node

/**
 * Screenshot Layout Analyzer
 * Analyzes all screenshots to verify layout consistency
 */

const fs = require('fs').promises;
const path = require('path');

const SCREENSHOTS_DIR = './ui-test-results/screenshots';
const OUTPUT_FILE = './ui-test-results/layout-analysis.md';

async function analyzeScreenshots() {
  console.log('🔍 Analyzing screenshots for layout consistency...\n');

  const files = await fs.readdir(SCREENSHOTS_DIR);
  const desktopScreenshots = files.filter(f => f.includes('_desktop.png'));
  const mobileScreenshots = files.filter(f => f.includes('_mobile.png'));

  console.log(`📊 Found ${desktopScreenshots.length} desktop screenshots`);
  console.log(`📱 Found ${mobileScreenshots.length} mobile screenshots\n`);

  // Group by page type
  const pages = {
    home: [],
    tools: [],
    master: [],
    static: []
  };

  desktopScreenshots.forEach(file => {
    const name = file.replace('_desktop.png', '');

    // Remove leading underscores and parse
    const cleanName = name.replace(/^_+/, '');

    if (cleanName === 'vi_' || cleanName === 'en_' || cleanName === 'vi' || cleanName === 'en') {
      // Homepage
      pages.home.push(name);
    } else if (cleanName.includes('master')) {
      // Master tools
      pages.master.push(name);
    } else if (cleanName.includes('about') || cleanName.includes('privacy') || cleanName.includes('terms') || cleanName.includes('categories')) {
      // Static pages
      pages.static.push(name);
    } else {
      // Regular tools
      pages.tools.push(name);
    }
  });

  // Generate report
  let report = `# 📸 Layout Analysis Report

**Generated**: ${new Date().toLocaleString()}  
**Total Screenshots**: ${desktopScreenshots.length * 2} (desktop + mobile)

---

## 📊 SCREENSHOT BREAKDOWN

| Category | Count | Files |
|----------|-------|-------|
| **Homepage** | ${pages.home.length} | ${pages.home.slice(0, 3).join(', ')}... |
| **Tools** | ${pages.tools.length} | ${pages.tools.slice(0, 3).join(', ')}... |
| **Master Tools** | ${pages.master.length} | ${pages.master.join(', ')} |
| **Static Pages** | ${pages.static.length} | ${pages.static.join(', ')} |

---

## 🎯 LAYOUT CONSISTENCY CHECKLIST

### Expected Layout (1400px max-width)

All pages should show:
- ✅ Header aligned at 1400px
- ✅ Content container at 1400px
- ✅ Clear borders on containers
- ✅ Consistent spacing (2rem)
- ✅ No horizontal overflow

### Manual Review Required

Please review screenshots for:

#### 1. **Container Alignment**
Check that header and content align perfectly:
\`\`\`
┌─────────────────────────────────────────────┐
│  Header (1400px) ← Should align             │
├─────────────────────────────────────────────┤
│  Content (1400px) ← Should align            │
└─────────────────────────────────────────────┘
\`\`\`

#### 2. **Border Visibility**
All containers should have:
- Clear 1px border
- Border radius (12px)
- Box shadow

#### 3. **Spacing Consistency**
- 2rem padding inside containers
- 2rem gap between elements
- 2rem margin top/bottom

#### 4. **Master Tools Layout**
Should show sidebar + content:
\`\`\`
┌────────┐  ┌──────────────┐
│Sidebar │  │   Content    │
│(250px) │  │   (flex)     │
└────────┘  └──────────────┘
\`\`\`

---

## 📁 SCREENSHOTS TO REVIEW

### Homepage (${pages.home.length} screenshots)
${pages.home.map(name => `- [ ] \`${name}\``).join('\n')}

### Tools (${pages.tools.length} screenshots)
${pages.tools.map(name => `- [ ] \`${name}\``).join('\n')}

### Master Tools (${pages.master.length} screenshots)
${pages.master.map(name => `- [ ] \`${name}\``).join('\n')}

### Static Pages (${pages.static.length} screenshots)
${pages.static.map(name => `- [ ] \`${name}\``).join('\n')}

---

## 🔍 REVIEW PROCESS

1. **Open screenshots folder**:
   \`\`\`bash
   open ui-test-results/screenshots/
   \`\`\`

2. **Compare desktop vs mobile**:
   - Desktop should show full layout
   - Mobile should stack vertically
   - Both should maintain borders

3. **Check alignment**:
   - Use ruler/guides in image viewer
   - Verify 1400px max-width
   - Check header/content alignment

4. **Look for issues**:
   - Horizontal overflow
   - Missing borders
   - Inconsistent spacing
   - Broken layouts

---

## ✅ EXPECTED RESULTS

After layout unification, all pages should:

1. **Perfect Alignment** ✅
   - Header at 1400px
   - Content at 1400px
   - Footer at 1400px

2. **Clear Borders** ✅
   - All containers bordered
   - Consistent border color
   - Rounded corners

3. **Consistent Spacing** ✅
   - 2rem padding standard
   - 2rem gaps
   - No cramped layouts

4. **Responsive** ✅
   - Desktop: Full layout
   - Mobile: Stacked layout
   - Borders maintained

---

## 📝 NOTES

- Screenshots are at 1400x900 (desktop) and 375x667 (mobile)
- All screenshots taken with latest CSS changes
- Review both light and dark mode if applicable
- Check for any visual regressions

---

**Status**: Ready for manual review  
**Action**: Open screenshots and verify layout consistency  
**Report**: Mark checkboxes as you review each screenshot
`;

  await fs.writeFile(OUTPUT_FILE, report);
  console.log(`✅ Analysis report generated: ${OUTPUT_FILE}\n`);

  // Print summary
  console.log('📊 SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Total Pages: ${desktopScreenshots.length}`);
  console.log(`  - Homepage: ${pages.home.length}`);
  console.log(`  - Tools: ${pages.tools.length}`);
  console.log(`  - Master Tools: ${pages.master.length}`);
  console.log(`  - Static: ${pages.static.length}`);
  console.log('─'.repeat(50));
  console.log(`\n💡 Next: Review screenshots in ${SCREENSHOTS_DIR}`);
  console.log(`📄 Full report: ${OUTPUT_FILE}\n`);
}

// Run
analyzeScreenshots().catch(console.error);
