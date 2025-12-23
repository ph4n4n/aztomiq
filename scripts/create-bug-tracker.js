#!/usr/bin/env node

/**
 * UI Bug Tracker
 * Analyzes screenshots and creates structured bug report
 */

const fs = require('fs').promises;
const path = require('path');

const SCREENSHOTS_DIR = './ui-test-results/screenshots';
const OUTPUT_FILE = './plans/0-WAR-ROOM/UI-BUGS-TRACKER.md';

async function createBugTracker() {
  console.log('🐛 Creating UI Bug Tracker...\n');

  const files = await fs.readdir(SCREENSHOTS_DIR);
  const desktopScreenshots = files.filter(f => f.includes('_desktop.png'));

  // Group by tool
  const tools = {};
  desktopScreenshots.forEach(file => {
    const match = file.match(/_(vi|en)_(.+?)_desktop\.png/);
    if (match) {
      const [, lang, toolName] = match;
      if (!tools[toolName]) {
        tools[toolName] = { vi: false, en: false };
      }
      tools[toolName][lang] = true;
    } else {
      // Homepage
      const homeLang = file.includes('_vi_') ? 'vi' : 'en';
      if (!tools['homepage']) {
        tools['homepage'] = { vi: false, en: false };
      }
      tools['homepage'][homeLang] = true;
    }
  });

  const report = `# 🐛 UI Bugs Tracker

**Created**: ${new Date().toLocaleString()}  
**Total Tools**: ${Object.keys(tools).length}  
**Status**: In Progress

---

## 📋 HOW TO USE THIS TRACKER

### Step 1: Review Screenshots
\`\`\`bash
open ui-test-results/screenshots/
\`\`\`

### Step 2: For Each Tool, Check:
- [ ] **Layout**: Form width, alignment, spacing
- [ ] **Labels**: Visible, clear, properly sized
- [ ] **Inputs**: Border, focus state, sizing
- [ ] **Buttons**: Prominent, well-placed
- [ ] **Results**: Clear display, good formatting
- [ ] **Mobile**: Responsive behavior (check mobile screenshots)
- [ ] **Borders**: All containers have visible borders
- [ ] **Spacing**: Consistent gaps (1.5-2rem)

### Step 3: Log Issues Below
For each bug found, add to the appropriate section.

---

## 🔴 CRITICAL BUGS (Breaks Functionality)

### Template
\`\`\`markdown
#### [Tool Name] - [Issue Title]
**Severity**: Critical  
**Pages**: VI, EN (or specify)  
**Description**: What's broken  
**Impact**: How it affects users  
**Screenshot**: \`tool-name_desktop.png\`  
**Fix Required**: What needs to be done  
**ETA**: Estimated time to fix
\`\`\`

### Issues
<!-- Add critical bugs here -->

---

## 🟡 HIGH PRIORITY (Major UX Issues)

### Template
\`\`\`markdown
#### [Tool Name] - [Issue Title]
**Severity**: High  
**Pages**: VI, EN  
**Description**: What's wrong  
**Impact**: UX degradation  
**Screenshot**: \`tool-name_desktop.png\`  
**Fix Required**: What to change  
**ETA**: Time estimate
\`\`\`

### Issues
<!-- Add high priority bugs here -->

---

## 🟢 MEDIUM PRIORITY (Visual/Polish Issues)

### Template
\`\`\`markdown
#### [Tool Name] - [Issue Title]
**Severity**: Medium  
**Pages**: VI, EN  
**Description**: Visual issue  
**Impact**: Cosmetic  
**Screenshot**: \`tool-name_desktop.png\`  
**Fix Required**: Polish needed  
**ETA**: Time estimate
\`\`\`

### Issues
<!-- Add medium priority bugs here -->

---

## 🔵 LOW PRIORITY (Minor Issues)

### Issues
<!-- Add low priority bugs here -->

---

## ✅ TOOLS REVIEWED

Track which tools have been reviewed for bugs:

${Object.keys(tools).sort().map(tool => {
    const hasVi = tools[tool].vi;
    const hasEn = tools[tool].en;
    return `- [ ] **${tool}** ${hasVi ? '(VI ✓)' : ''} ${hasEn ? '(EN ✓)' : ''}`;
  }).join('\n')}

---

## 📊 BUG STATISTICS

| Priority | Count | % |
|----------|-------|---|
| Critical | 0 | 0% |
| High | 0 | 0% |
| Medium | 0 | 0% |
| Low | 0 | 0% |
| **Total** | **0** | **100%** |

---

## 🎯 COMMON PATTERNS

### Form Issues
- [ ] Input width too wide
- [ ] Labels too small/muted
- [ ] No max-width constraint
- [ ] Poor spacing

### Layout Issues
- [ ] Content not centered
- [ ] Missing borders
- [ ] Inconsistent spacing
- [ ] Alignment problems

### Mobile Issues
- [ ] Horizontal scroll
- [ ] Text too small
- [ ] Buttons too small
- [ ] Poor touch targets

---

## 🔧 QUICK FIXES

### Global CSS Issues
If multiple tools have same issue, fix in \`global.css\`:
\`\`\`css
/* Example: All forms need max-width */
.input-section {
  max-width: 700px;
  margin: 0 auto;
}
\`\`\`

### Per-Tool CSS Issues
If issue is specific to one tool, fix in \`src/features/[tool]/style.css\`

---

## 📝 REVIEW PROCESS

1. **Open screenshots folder**
2. **Review each tool** (desktop + mobile)
3. **Compare with checklist**
4. **Log issues** in appropriate section
5. **Mark tool as reviewed**
6. **Update statistics**

---

## 🚀 FIX WORKFLOW

1. **Prioritize**: Start with Critical, then High
2. **Group**: Fix similar issues together
3. **Test**: Run UI test after each batch
4. **Verify**: Check screenshots
5. **Mark done**: Move to completed section

---

## ✅ COMPLETED FIXES

### Template
\`\`\`markdown
#### [Tool Name] - [Issue Title]
**Fixed**: YYYY-MM-DD  
**Solution**: What was changed  
**Verified**: Screenshot comparison
\`\`\`

### Fixes
<!-- Add completed fixes here -->

---

## 📸 SCREENSHOT REFERENCE

All screenshots available in:
\`\`\`
ui-test-results/screenshots/
├── _vi__desktop.png (Homepage VI)
├── _en__desktop.png (Homepage EN)
├── _vi_[tool]_desktop.png
├── _vi_[tool]_mobile.png
└── ... (${desktopScreenshots.length * 2} total)
\`\`\`

---

## 💡 TIPS

1. **Use screenshot names** to identify tools
2. **Check both VI and EN** versions
3. **Compare desktop vs mobile**
4. **Look for patterns** (same issue across tools)
5. **Fix globally** when possible
6. **Test incrementally** (don't fix everything at once)

---

**Last Updated**: ${new Date().toLocaleString()}  
**Status**: Ready for review  
**Next**: Start reviewing screenshots and logging bugs
`;

  await fs.writeFile(OUTPUT_FILE, report);
  console.log(`✅ Bug tracker created: ${OUTPUT_FILE}\n`);
  console.log('📊 SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Total Tools: ${Object.keys(tools).length}`);
  console.log(`Screenshots: ${desktopScreenshots.length * 2} (desktop + mobile)`);
  console.log('─'.repeat(50));
  console.log(`\n💡 Next Steps:`);
  console.log(`1. Open screenshots: open ${SCREENSHOTS_DIR}`);
  console.log(`2. Open tracker: open ${OUTPUT_FILE}`);
  console.log(`3. Review and log bugs`);
  console.log(`4. Fix by priority\n`);
}

createBugTracker().catch(console.error);
