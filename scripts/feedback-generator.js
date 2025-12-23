const fs = require('fs').promises;
const path = require('path');

const RESULTS_FILE = './ui-test-results/results.json';
const OUTPUT_FILE = './feedback.md';

async function generateFeedback() {
  console.log('🤖 Generating Realistic Feedback...');

  try {
    const resultsData = await fs.readFile(RESULTS_FILE, 'utf-8');
    const results = JSON.parse(resultsData);

    let feedbackContent = `# Comprehensive Feature Feedback\n\n`;
    feedbackContent += `**Date**: ${new Date().toLocaleString()}\n`;
    feedbackContent += `**Total Pages Reviewed**: ${results.summary.total}\n\n`;
    feedbackContent += `This document contains realistic feedback based on automated UI testing and simulated user experience review.\n\n`;
    feedbackContent += `---\n\n`;

    // Group by feature/tool name
    // URLs are like http://localhost:3000/en/bmi-calculator/
    // We want to group everything related to "bmi-calculator"

    const features = {};

    results.pages.forEach(page => {
      // Extract feature name from URL. 
      // e.g., http://localhost:3000/vi/tool-name/
      const match = page.url.match(/localhost:3000\/(?:vi|en)\/([^\/]+)/);
      let featureName = 'Homepage';
      if (match && match[1]) {
        featureName = match[1];
      } else if (page.url.includes('/vi/') || page.url.includes('/en/')) {
        if (page.url.endsWith('/vi/') || page.url.endsWith('/en/')) featureName = 'Homepage';
      }

      if (!features[featureName]) {
        features[featureName] = {
          pages: []
        };
      }
      features[featureName].pages.push(page);
    });

    for (const [featureName, data] of Object.entries(features)) {
      feedbackContent += `## 🛠 ${featureName.toUpperCase().replace(/-/g, ' ')}\n\n`;

      let featureStatus = '✅ Excellent';
      let feedbackPoints = [];

      // Analyze pages for this feature
      data.pages.forEach(page => {
        const lang = page.url.includes('/vi/') ? 'Vietnamese' : 'English';

        if (page.status === 'failed') {
          featureStatus = '🔴 Critical Issues';
          feedbackPoints.push(`- **${lang} Version**: fatal errors detected.`);
        } else if (page.status === 'warning' && featureStatus !== '🔴 Critical Issues') {
          featureStatus = '⚠️ Needs Polish';
        }

        // Specific Feedback Generation
        if (page.issues.length > 0) {
          page.issues.forEach(issue => {
            if (issue.type === 'i18n') {
              feedbackPoints.push(`- **${lang}**: Found ${issue.count} untranslated text keys (e.g., "${issue.details[0]?.key}"). It makes the app look unfinished.`);
            }
            if (issue.type === 'css') {
              feedbackPoints.push(`- **${lang}**: The layout has issues. ${issue.details[0]?.message || 'Elements are overflowing or misaligned'}.`);
            }
            if (issue.type === 'console-errors') {
              feedbackPoints.push(`- **${lang}**: There are JavaScript errors in the console. Functionality might be broken. Error: "${issue.details[0]?.substring(0, 100)}..."`);
            }
          });
        }
      });

      if (feedbackPoints.length === 0) {
        feedbackPoints.push(`- Both language versions look clean and load without visible errors.`);
        feedbackPoints.push(`- Layout and responsiveness appear stable.`);
      }

      feedbackContent += `**Overall Status**: ${featureStatus}\n\n`;
      feedbackContent += `### 📝 User Feedback\n`;
      // Deduplicate feedback points
      const uniquePoints = [...new Set(feedbackPoints)];
      uniquePoints.forEach(point => {
        feedbackContent += `${point}\n`;
      });

      feedbackContent += `\n---\n\n`;
    }

    await fs.writeFile(OUTPUT_FILE, feedbackContent);
    console.log(`✅ Feedback generated at: ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('❌ Error generating feedback:', err);
  }
}

generateFeedback();
