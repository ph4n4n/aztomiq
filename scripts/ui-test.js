#!/usr/bin/env node

/**
 * UI Testing Tool - Automated Visual & i18n Testing
 * 
 * Features:
 * - Crawls all pages from sitemap
 * - Takes screenshots for visual review
 * - Detects missing translations (i18n keys)
 * - Checks for CSS layout issues
 * - Generates HTML report
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { parseStringPromise } = require('xml2js');

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  sitemapPath: './dist-dev/sitemap.xml',
  outputDir: './ui-test-results',
  screenshotDir: './ui-test-results/screenshots',
  viewport: {
    width: 1400,
    height: 900
  },
  mobileViewport: {
    width: 375,
    height: 667
  },
  // Language filter: 'vi', 'en', or null for all
  langFilter: process.argv.includes('--lang=vi') ? 'vi' :
    process.argv.includes('--lang=en') ? 'en' : null,
  // Theme filter: 'light' or 'dark'
  theme: process.argv.includes('--theme=dark') ? 'dark' : 'light'
};

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  pages: []
};

/**
 * Read and parse sitemap
 */
async function readSitemap() {
  console.log('📄 Reading sitemap...');
  const sitemapContent = await fs.readFile(CONFIG.sitemapPath, 'utf-8');
  const sitemap = await parseStringPromise(sitemapContent);

  // Map production URLs to localhost
  let urls = sitemap.urlset.url
    .map(entry => entry.loc[0].trim())
    .map(url => url.replace('https://aztomiq.site', CONFIG.baseUrl));

  // Filter by language if specified
  if (CONFIG.langFilter) {
    urls = urls.filter(url => url.includes(`/${CONFIG.langFilter}/`));
    console.log(`🔍 Filtering for language: ${CONFIG.langFilter}`);
  }

  console.log(`✅ Found ${urls.length} URLs in sitemap`);
  console.log(`📍 Testing against: ${CONFIG.baseUrl}`);

  return urls;
}

/**
 * Check for i18n issues (missing translation keys)
 */
async function checkI18nIssues(page, url) {
  const issues = await page.evaluate(() => {
    const found = [];

    // Whitelist of known non-translation patterns
    const whitelist = [
      'AZtomiq.site',
      'aztomiq.site',
      'localhost.3000',
      'github.com',
      'npmjs.com'
    ];

    const bodyText = document.body.innerText;

    // Look for untranslated keys (camelCase.camelCase pattern)
    const possibleKeys = bodyText.match(/[a-z][a-zA-Z]+\.[a-z][a-zA-Z]+/g) || [];

    possibleKeys.forEach(key => {
      // Skip if in whitelist
      if (whitelist.some(w => key.toLowerCase().includes(w.toLowerCase()))) {
        return;
      }

      // Skip if it looks like a URL or domain
      if (key.includes('http') || key.includes('www') || key.includes('.com') || key.includes('.site')) {
        return;
      }

      // Skip version numbers (e.g., v1.2.0)
      if (/v?\d+\.\d+/.test(key)) {
        return;
      }

      // Find visible elements with this exact text
      const elements = Array.from(document.querySelectorAll('*')).filter(el =>
        el.textContent.trim() === key &&
        el.offsetParent !== null && // visible
        el.children.length === 0 // leaf node (not parent container)
      );

      if (elements.length > 0) {
        found.push({
          key: key,
          count: elements.length,
          selector: elements[0].tagName.toLowerCase()
        });
      }
    });

    return found;
  });

  return issues;
}

/**
 * Check for CSS layout issues
 */
async function checkCSSIssues(page) {
  const issues = await page.evaluate(() => {
    const problems = [];

    // Check for horizontal overflow
    if (document.body.scrollWidth > window.innerWidth) {
      problems.push({
        type: 'horizontal-overflow',
        message: `Page width (${document.body.scrollWidth}px) exceeds viewport (${window.innerWidth}px)`,
        severity: 'warning'
      });
    }

    // Check for elements outside viewport
    const allElements = document.querySelectorAll('*');
    let elementsOutside = 0;

    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 50) { // 50px tolerance
        elementsOutside++;
      }
    });

    if (elementsOutside > 0) {
      problems.push({
        type: 'elements-overflow',
        message: `${elementsOutside} elements extend beyond viewport`,
        severity: 'warning'
      });
    }

    // Check for invisible text (color too similar to background)
    const textElements = Array.from(document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6, label'));
    let lowContrastCount = 0;

    textElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = style.backgroundColor;

      // Simple check: if both are very similar (basic heuristic)
      if (color && bgColor && color === bgColor) {
        lowContrastCount++;
      }
    });

    if (lowContrastCount > 0) {
      problems.push({
        type: 'low-contrast',
        message: `${lowContrastCount} elements may have low contrast`,
        severity: 'info'
      });
    }

    return problems;
  });

  return issues;
}

/**
 * Check for console errors
 */
async function captureConsoleErrors(page) {
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  return errors;
}

/**
 * Test a single page
 */
async function testPage(browser, url, index, total) {
  const pageName = url.replace(CONFIG.baseUrl, '').replace(/\//g, '_') || 'home';
  console.log(`\n[${index + 1}/${total}] Testing: ${url}`);

  const page = await browser.newPage();
  const errors = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  const pageResult = {
    url,
    pageName,
    status: 'passed',
    issues: [],
    screenshots: {}
  };

  try {
    // Desktop test
    await page.setViewport(CONFIG.viewport);

    // Force theme
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: CONFIG.theme }]);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Ensure theme is set in localStorage to avoid flashes or overrides
    await page.evaluate((theme) => {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }, CONFIG.theme);

    // Wait a bit for any animations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take desktop screenshot
    const desktopScreenshot = path.join(CONFIG.screenshotDir, `${pageName}_desktop.png`);
    await page.screenshot({
      path: desktopScreenshot,
      fullPage: true
    });
    pageResult.screenshots.desktop = desktopScreenshot;
    console.log(`  📸 Desktop screenshot saved`);

    // Check i18n issues
    const i18nIssues = await checkI18nIssues(page, url);
    if (i18nIssues.length > 0) {
      pageResult.issues.push({
        type: 'i18n',
        severity: 'error',
        count: i18nIssues.length,
        details: i18nIssues
      });
      console.log(`  ⚠️  Found ${i18nIssues.length} i18n issues`);
    }

    // Check CSS issues
    const cssIssues = await checkCSSIssues(page);
    if (cssIssues.length > 0) {
      pageResult.issues.push({
        type: 'css',
        severity: 'warning',
        count: cssIssues.length,
        details: cssIssues
      });
      console.log(`  ⚠️  Found ${cssIssues.length} CSS issues`);
    }

    // Check console errors
    if (errors.length > 0) {
      pageResult.issues.push({
        type: 'console-errors',
        severity: 'error',
        count: errors.length,
        details: errors
      });
      console.log(`  ❌ Found ${errors.length} console errors`);
    }

    // Mobile test
    await page.setViewport(CONFIG.mobileViewport);
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mobileScreenshot = path.join(CONFIG.screenshotDir, `${pageName}_mobile.png`);
    await page.screenshot({
      path: mobileScreenshot,
      fullPage: true
    });
    pageResult.screenshots.mobile = mobileScreenshot;
    console.log(`  📱 Mobile screenshot saved`);

    // Determine status
    const hasErrors = pageResult.issues.some(i => i.severity === 'error');
    const hasWarnings = pageResult.issues.some(i => i.severity === 'warning');

    if (hasErrors) {
      pageResult.status = 'failed';
      results.summary.failed++;
    } else if (hasWarnings) {
      pageResult.status = 'warning';
      results.summary.warnings++;
    } else {
      pageResult.status = 'passed';
      results.summary.passed++;
    }

    console.log(`  ✅ Status: ${pageResult.status.toUpperCase()}`);

  } catch (error) {
    pageResult.status = 'error';
    pageResult.error = error.message;
    results.summary.failed++;
    console.log(`  ❌ Error: ${error.message}`);
  } finally {
    await page.close();
  }

  return pageResult;
}

/**
 * Generate HTML report
 */
async function generateReport() {
  console.log('\n📊 Generating HTML report...');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Test Report - ${new Date(results.timestamp).toLocaleString()}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f5f5f5;
      padding: 2rem;
      line-height: 1.6;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #333; margin-bottom: 0.5rem; }
    .timestamp { color: #666; font-size: 0.9rem; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .summary-card h3 { font-size: 2rem; margin-bottom: 0.5rem; }
    .summary-card p { color: #666; font-size: 0.9rem; }
    .passed { color: #16a34a; }
    .failed { color: #dc2626; }
    .warning { color: #ea580c; }
    .page-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e5e5;
    }
    .page-url { font-weight: 600; color: #333; }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-passed { background: #dcfce7; color: #16a34a; }
    .status-failed { background: #fee2e2; color: #dc2626; }
    .status-warning { background: #ffedd5; color: #ea580c; }
    .screenshots {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }
    .screenshot-box {
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      overflow: hidden;
    }
    .screenshot-box img {
      width: 100%;
      display: block;
    }
    .screenshot-label {
      padding: 0.5rem;
      background: #f5f5f5;
      font-size: 0.85rem;
      font-weight: 600;
      text-align: center;
    }
    .issues {
      margin-top: 1rem;
    }
    .issue {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
    }
    .issue.error {
      background: #fee2e2;
      border-left-color: #dc2626;
    }
    .issue-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .issue-details {
      font-size: 0.9rem;
      color: #666;
      font-family: monospace;
      background: white;
      padding: 0.5rem;
      border-radius: 4px;
      margin-top: 0.5rem;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 UI Test Report</h1>
      <p class="timestamp">Generated: ${new Date(results.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="summary">
      <div class="summary-card">
        <h3>${results.summary.total}</h3>
        <p>Total Pages</p>
      </div>
      <div class="summary-card">
        <h3 class="passed">${results.summary.passed}</h3>
        <p>Passed</p>
      </div>
      <div class="summary-card">
        <h3 class="warning">${results.summary.warnings}</h3>
        <p>Warnings</p>
      </div>
      <div class="summary-card">
        <h3 class="failed">${results.summary.failed}</h3>
        <p>Failed</p>
      </div>
    </div>
    
    ${results.pages.map(page => `
      <div class="page-card">
        <div class="page-header">
          <div class="page-url">${page.url}</div>
          <span class="status-badge status-${page.status}">${page.status}</span>
        </div>
        
        ${page.issues.length > 0 ? `
          <div class="issues">
            <strong>Issues Found:</strong>
            ${page.issues.map(issue => `
              <div class="issue ${issue.severity === 'error' ? 'error' : ''}">
                <div class="issue-title">
                  ${issue.type.toUpperCase()} (${issue.count} ${issue.count === 1 ? 'issue' : 'issues'})
                </div>
                <div class="issue-details">
                  ${JSON.stringify(issue.details, null, 2)}
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p style="color: #16a34a;">✅ No issues found</p>'}
        
        <div class="screenshots">
          <div class="screenshot-box">
            <div class="screenshot-label">🖥️ Desktop (1400x900)</div>
            <img src="${path.relative(CONFIG.outputDir, page.screenshots.desktop)}" alt="Desktop screenshot">
          </div>
          <div class="screenshot-box">
            <div class="screenshot-label">📱 Mobile (375x667)</div>
            <img src="${path.relative(CONFIG.outputDir, page.screenshots.mobile)}" alt="Mobile screenshot">
          </div>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;

  const reportPath = path.join(CONFIG.outputDir, 'report.html');
  await fs.writeFile(reportPath, html);
  console.log(`✅ Report saved to: ${reportPath}`);

  return reportPath;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting UI Testing Tool\n');
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Output: ${CONFIG.outputDir}\n`);

  // Clean up old screenshots
  try {
    const files = await fs.readdir(CONFIG.screenshotDir);
    console.log(`🗑️  Cleaning up ${files.length} old screenshots...`);
    for (const file of files) {
      if (file.endsWith('.png')) {
        await fs.unlink(path.join(CONFIG.screenshotDir, file));
      }
    }
    console.log('✅ Cleanup complete\n');
  } catch (err) {
    // Directory doesn't exist yet, that's fine
  }

  // Create output directories
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  await fs.mkdir(CONFIG.screenshotDir, { recursive: true });

  // Read sitemap
  const urls = await readSitemap();
  results.summary.total = urls.length;

  // Launch browser
  console.log('\n🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Test each page
  for (let i = 0; i < urls.length; i++) {
    const pageResult = await testPage(browser, urls[i], i, urls.length);
    results.pages.push(pageResult);
  }

  await browser.close();

  // Generate report
  const reportPath = await generateReport();

  // Save JSON results
  const jsonPath = path.join(CONFIG.outputDir, 'results.json');
  await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));
  console.log(`✅ JSON results saved to: ${jsonPath}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Pages:  ${results.summary.total}`);
  console.log(`✅ Passed:    ${results.summary.passed}`);
  console.log(`⚠️  Warnings:  ${results.summary.warnings}`);
  console.log(`❌ Failed:    ${results.summary.failed}`);
  console.log('='.repeat(60));
  console.log(`\n📄 Full report: ${reportPath}`);
  console.log(`\n💡 Open report: open ${reportPath}\n`);

  // Exit with error code if there are failures
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
