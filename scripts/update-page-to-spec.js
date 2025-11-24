#!/usr/bin/env node

/**
 * Page Updater to Specification
 * Updates existing pages to match Kiro Content Requirements
 */

const fs = require('fs');
const path = require('path');

const SPEC_UPDATES = {
  ukEnglish: {
    replacements: [
      { from: /\boptimize\b/gi, to: 'optimise' },
      { from: /\boptimization\b/gi, to: 'optimisation' },
      { from: /\bcenter\b/gi, to: 'centre' },
      { from: /\binquiries\b/gi, to: 'enquiries' },
      { from: /\bvisualization\b/gi, to: 'visualisation' },
      { from: /\bcolor\b/gi, to: 'colour' },
      { from: /\banalyze\b/gi, to: 'analyse' }
    ]
  },

  accessibility: {
    statement: `I follow WCAG 2.1 accessibility standards when building websites. This includes clear structure, readable text, strong colour contrast and accessible navigation across desktop and mobile.`,
    shortStatement: `I follow WCAG 2.1 accessibility standards when building websites.`,
    pages: ['website-design', 'services', 'hosting']
  },

  clarity: {
    short: `I use Microsoft Clarity to review how visitors use your website and to improve the customer experience.`,
    long: `I use Microsoft Clarity to analyse how visitors interact with your website. This includes scroll depth, click patterns and areas of hesitation. I use this information to improve usability and support better conversion performance.`,
    pages: ['website-design', 'ad-campaigns', 'analytics', 'hosting', 'services']
  },

  localTrust: {
    statement: 'Based in Nantwich. Serving Cheshire East.',
    variants: [
      'Based in Nantwich, Cheshire',
      'Serving Cheshire East businesses'
    ]
  }
};

class PageUpdater {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.options = {
      dryRun: options.dryRun || false,
      backup: options.backup !== false,
      verbose: options.verbose || false
    };
    this.content = '';
    this.originalContent = '';
    this.changes = [];
  }

  async update() {
    try {
      console.log(`\n🔧 Updating: ${this.filePath}`);
      console.log('─'.repeat(60));

      // Read file
      this.content = fs.readFileSync(this.filePath, 'utf-8');
      this.originalContent = this.content;

      // Apply updates
      this.updateUKEnglish();
      this.updateAccessibility();
      this.updateClarity();
      this.updateLocalTrust();

      // Show changes
      this.showChanges();

      // Save if not dry run
      if (!this.options.dryRun) {
        this.save();
      } else {
        console.log('\n🔍 DRY RUN - No changes saved');
      }

      return {
        file: this.filePath,
        changes: this.changes.length,
        modified: this.content !== this.originalContent
      };

    } catch (error) {
      console.error(`Error updating ${this.filePath}:`, error.message);
      throw error;
    }
  }

  updateUKEnglish() {
    let changeCount = 0;

    SPEC_UPDATES.ukEnglish.replacements.forEach(({ from, to }) => {
      const matches = this.content.match(from);
      if (matches) {
        this.content = this.content.replace(from, to);
        changeCount += matches.length;
        this.changes.push({
          type: 'UK English',
          description: `Replaced "${matches[0]}" with "${to}" (${matches.length} occurrence(s))`
        });
      }
    });

    if (changeCount > 0) {
      console.log(`✅ UK English: ${changeCount} correction(s) applied`);
    }
  }

  updateAccessibility() {
    const pageName = this.getPageName();
    const requiredPages = SPEC_UPDATES.accessibility.pages;

    if (requiredPages.some(p => pageName.includes(p))) {
      if (!this.content.includes('WCAG 2.1')) {
        // Try to find a good insertion point
        const insertionPoint = this.findInsertionPoint('accessibility');

        if (insertionPoint !== -1) {
          const statement = SPEC_UPDATES.accessibility.statement;
          this.content = this.insertAt(this.content, insertionPoint, `\n\n${statement}\n`);
          this.changes.push({
            type: 'Accessibility',
            description: 'Added WCAG 2.1 accessibility statement'
          });
          console.log('✅ Accessibility: Added WCAG 2.1 statement');
        } else {
          console.log('⚠️  Accessibility: Could not find insertion point for WCAG statement');
        }
      } else {
        console.log('✓ Accessibility: WCAG 2.1 statement already present');
      }
    }
  }

  updateClarity() {
    const pageName = this.getPageName();
    const requiredPages = SPEC_UPDATES.clarity.pages;

    if (requiredPages.some(p => pageName.includes(p))) {
      if (!this.content.includes('Microsoft Clarity') && !this.content.includes('Clarity')) {
        const insertionPoint = this.findInsertionPoint('clarity');

        if (insertionPoint !== -1) {
          const statement = SPEC_UPDATES.clarity.short;
          this.content = this.insertAt(this.content, insertionPoint, `\n\n${statement}\n`);
          this.changes.push({
            type: 'Clarity',
            description: 'Added Microsoft Clarity statement'
          });
          console.log('✅ Clarity: Added Microsoft Clarity statement');
        } else {
          console.log('⚠️  Clarity: Could not find insertion point for Clarity statement');
        }
      } else {
        console.log('✓ Clarity: Microsoft Clarity statement already present');
      }
    }
  }

  updateLocalTrust() {
    const hasLocalTrust = SPEC_UPDATES.localTrust.variants.some(v => 
      this.content.includes(v)
    ) || this.content.includes(SPEC_UPDATES.localTrust.statement);

    if (!hasLocalTrust) {
      // Look for hero section or similar
      const heroMatch = this.content.match(/(hero|Hero|HERO)/);
      if (heroMatch) {
        console.log('⚠️  Local Trust: Hero section found but no local trust indicator');
        this.changes.push({
          type: 'Local Trust',
          description: 'Manual addition recommended: "Based in Nantwich. Serving Cheshire East."'
        });
      }
    } else {
      console.log('✓ Local Trust: Local trust indicator present');
    }
  }

  findInsertionPoint(type) {
    // Try to find a logical place to insert content
    const markers = {
      accessibility: [
        /accessibility/i,
        /standards/i,
        /wcag/i,
        /inclusive/i
      ],
      clarity: [
        /analytics/i,
        /tracking/i,
        /monitoring/i,
        /insights/i
      ]
    };

    const relevantMarkers = markers[type] || [];

    for (const marker of relevantMarkers) {
      const match = this.content.match(marker);
      if (match) {
        return match.index + match[0].length;
      }
    }

    // Fallback: find end of first paragraph
    const firstParagraphEnd = this.content.indexOf('\n\n');
    return firstParagraphEnd !== -1 ? firstParagraphEnd : -1;
  }

  insertAt(str, index, insertion) {
    return str.slice(0, index) + insertion + str.slice(index);
  }

  getPageName() {
    const parts = this.filePath.split(path.sep);
    const appIndex = parts.indexOf('app');
    if (appIndex === -1) return 'unknown';

    const pathParts = parts.slice(appIndex + 1);
    pathParts.pop();

    return pathParts.length > 0 ? pathParts.join('/') : 'home';
  }

  showChanges() {
    console.log('─'.repeat(60));

    if (this.changes.length === 0) {
      console.log('✓ No changes needed - page already compliant');
      return;
    }

    console.log(`\n📝 Changes Applied (${this.changes.length}):\n`);
    this.changes.forEach((change, i) => {
      console.log(`${i + 1}. [${change.type}] ${change.description}`);
    });
  }

  save() {
    if (this.content === this.originalContent) {
      console.log('\n✓ No changes to save');
      return;
    }

    // Create backup if requested
    if (this.options.backup) {
      const backupPath = `${this.filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, this.originalContent);
      console.log(`\n💾 Backup created: ${backupPath}`);
    }

    // Save updated content
    fs.writeFileSync(this.filePath, this.content);
    console.log(`✅ Changes saved to: ${this.filePath}`);
  }
}

// CLI usage
if (require.main === module) {
  const filePath = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');
  const noBackup = process.argv.includes('--no-backup');

  if (!filePath) {
    console.log('Usage: node update-page-to-spec.js <file-path> [--dry-run] [--no-backup]');
    console.log('\nOptions:');
    console.log('  --dry-run    Show changes without saving');
    console.log('  --no-backup  Skip creating backup file');
    process.exit(1);
  }

  const updater = new PageUpdater(filePath, {
    dryRun,
    backup: !noBackup,
    verbose: true
  });

  updater.update()
    .then(result => {
      console.log('\n' + '='.repeat(60));
      console.log(`✅ Update complete: ${result.changes} change(s) applied`);
      console.log('='.repeat(60) + '\n');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Update failed:', err.message);
      process.exit(1);
    });
}

module.exports = PageUpdater;
