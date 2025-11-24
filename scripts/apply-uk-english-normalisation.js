#!/usr/bin/env node

/**
 * UK English Normalisation Script
 * Converts US English spellings to UK English across all content files
 * Based on: docs/specs/🇬🇧 UK English Normalisation – Regex Rules for Kiro.txt
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define all UK English normalisation rules
const normalisationRules = [
  // 1. Optimise / Optimisation Family
  { pattern: /\boptimize\b/gi, replacement: 'optimise', description: 'optimize → optimise' },
  { pattern: /\boptimized\b/gi, replacement: 'optimised', description: 'optimized → optimised' },
  { pattern: /\boptimizing\b/gi, replacement: 'optimising', description: 'optimizing → optimising' },
  { pattern: /\boptimization\b/gi, replacement: 'optimisation', description: 'optimization → optimisation' },
  { pattern: /\bspeed optimization\b/gi, replacement: 'speed optimisation', description: 'speed optimization → speed optimisation' },
  { pattern: /\bperformance optimization\b/gi, replacement: 'performance optimisation', description: 'performance optimization → performance optimisation' },

  // 2. Analyse / Analysis Family
  { pattern: /\banalyze\b/gi, replacement: 'analyse', description: 'analyze → analyse' },
  { pattern: /\banalyzed\b/gi, replacement: 'analysed', description: 'analyzed → analysed' },
  { pattern: /\banalyzing\b/gi, replacement: 'analysing', description: 'analyzing → analysing' },

  // 3. Customise / Personalise
  { pattern: /\bcustomize\b/gi, replacement: 'customise', description: 'customize → customise' },
  { pattern: /\bcustomized\b/gi, replacement: 'customised', description: 'customized → customised' },
  { pattern: /\bcustomizing\b/gi, replacement: 'customising', description: 'customizing → customising' },
  { pattern: /\bcustomization\b/gi, replacement: 'customisation', description: 'customization → customisation' },
  { pattern: /\bpersonalize\b/gi, replacement: 'personalise', description: 'personalize → personalise' },
  { pattern: /\bpersonalized\b/gi, replacement: 'personalised', description: 'personalized → personalised' },

  // 4. Behaviour / Colour / Centre / Favourite
  { pattern: /\bcolor\b/gi, replacement: 'colour', description: 'color → colour' },
  { pattern: /\bbehavior\b/gi, replacement: 'behaviour', description: 'behavior → behaviour' },
  { pattern: /\bcenter\b/gi, replacement: 'centre', description: 'center → centre' },
  { pattern: /\bfavorite\b/gi, replacement: 'favourite', description: 'favorite → favourite' },

  // 5. Organisation / Licence / Defence / Enquiries
  { pattern: /\borganize\b/gi, replacement: 'organise', description: 'organize → organise' },
  { pattern: /\borganized\b/gi, replacement: 'organised', description: 'organized → organised' },
  { pattern: /\borganizing\b/gi, replacement: 'organising', description: 'organizing → organising' },
  { pattern: /\blicense\b/gi, replacement: 'licence', description: 'license → licence' },
  { pattern: /\bdefense\b/gi, replacement: 'defence', description: 'defense → defence' },
  { pattern: /\binquiry\b/gi, replacement: 'enquiry', description: 'inquiry → enquiry' },
  { pattern: /\binquiries\b/gi, replacement: 'enquiries', description: 'inquiries → enquiries' },

  // 6. Hosting & Website Copy Phrases (Contextual)
  { pattern: /\bNo tech stress\./gi, replacement: 'No technical stress.', description: 'No tech stress. → No technical stress.' },
  { pattern: /\bMobile first\b/gi, replacement: 'Mobile-first', description: 'Mobile first → Mobile-first' },
  { pattern: /\bPerformance focused\b/gi, replacement: 'Performance-focused', description: 'Performance focused → Performance-focused' },
  { pattern: /\bSEO Ready\b/gi, replacement: 'SEO-ready', description: 'SEO Ready → SEO-ready' },
  
  // 7. Additional compound terms
  { pattern: /\bmobile-optimized\b/gi, replacement: 'mobile-optimised', description: 'mobile-optimized → mobile-optimised' },
  { pattern: /\bMobile-Optimized\b/g, replacement: 'Mobile-Optimised', description: 'Mobile-Optimized → Mobile-Optimised' },
  { pattern: /\bROI Optimization\b/g, replacement: 'ROI Optimisation', description: 'ROI Optimization → ROI Optimisation' },
];

// Files to process
const filePatterns = [
  'src/app/**/*.tsx',
  'src/app/**/*.ts',
  'src/components/**/*.tsx',
  'src/components/**/*.ts',
  'src/content/**/*.ts',
  'content/**/*.md',
];

// Files to exclude (CSS classes, config files, etc.)
const excludePatterns = [
  '**/node_modules/**',
  '**/out/**',
  '**/.next/**',
  '**/build-*/**',
  '**/temp-*/**',
];

function shouldProcessFile(filePath) {
  // Skip excluded patterns
  for (const pattern of excludePatterns) {
    if (filePath.includes(pattern.replace(/\*\*/g, ''))) {
      return false;
    }
  }
  return true;
}

function applyNormalisationToContent(content, filePath) {
  let modifiedContent = content;
  let changesApplied = [];

  // Skip CSS class names and certain code patterns
  const isCodeFile = filePath.endsWith('.tsx') || filePath.endsWith('.ts');
  
  for (const rule of normalisationRules) {
    const matches = modifiedContent.match(rule.pattern);
    if (matches && matches.length > 0) {
      // For code files, be more careful with replacements
      if (isCodeFile) {
        // Don't replace in className strings, CSS modules, or imports
        const lines = modifiedContent.split('\n');
        const processedLines = lines.map(line => {
          // Skip lines with className, class=, import, or CSS-related content
          // Also skip lines that are purely CSS utility classes
          if (
            line.includes('className') ||
            line.includes('class=') ||
            line.includes('import ') ||
            line.match(/text-center|justify-center|items-center|place-center|content-center/i)
          ) {
            // For lines with className, only replace in string content, not class names
            if (line.includes('className') && rule.pattern.source.includes('center')) {
              // Skip center → centre replacement in className lines entirely
              return line;
            }
            // For other rules, still apply to content within the line
            if (!line.includes('className') || rule.pattern.source.includes('center')) {
              return line;
            }
          }
          return line.replace(rule.pattern, rule.replacement);
        });
        modifiedContent = processedLines.join('\n');
      } else {
        // For markdown and other content files, apply directly
        modifiedContent = modifiedContent.replace(rule.pattern, rule.replacement);
      }
      
      changesApplied.push({
        rule: rule.description,
        count: matches.length,
      });
    }
  }

  return { modifiedContent, changesApplied };
}

async function processFiles() {
  console.log('🇬🇧 Starting UK English Normalisation...\n');

  const allFiles = [];
  for (const pattern of filePatterns) {
    const files = glob.sync(pattern, { nodir: true });
    allFiles.push(...files);
  }

  const filesToProcess = allFiles.filter(shouldProcessFile);
  console.log(`Found ${filesToProcess.length} files to process\n`);

  const results = {
    filesModified: 0,
    totalChanges: 0,
    changesByRule: {},
    modifiedFiles: [],
  };

  for (const filePath of filesToProcess) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { modifiedContent, changesApplied } = applyNormalisationToContent(content, filePath);

      if (changesApplied.length > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        results.filesModified++;
        results.modifiedFiles.push({
          file: filePath,
          changes: changesApplied,
        });

        console.log(`✓ ${filePath}`);
        changesApplied.forEach(change => {
          console.log(`  - ${change.rule} (${change.count} occurrences)`);
          results.totalChanges += change.count;
          results.changesByRule[change.rule] = (results.changesByRule[change.rule] || 0) + change.count;
        });
        console.log('');
      }
    } catch (error) {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  }

  // Generate summary report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `uk-english-normalisation-report-${timestamp}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('🇬🇧 UK English Normalisation Complete');
  console.log('='.repeat(60));
  console.log(`Files modified: ${results.filesModified}`);
  console.log(`Total changes: ${results.totalChanges}`);
  console.log(`\nReport saved to: ${reportPath}\n`);

  // Display summary by rule
  console.log('Changes by rule:');
  Object.entries(results.changesByRule)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rule, count]) => {
      console.log(`  ${count.toString().padStart(3)} × ${rule}`);
    });

  return results;
}

// Run the script
processFiles().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
