#!/usr/bin/env node

/**
 * UK English Verification Script
 * Checks for any remaining US English spellings in content files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// US English patterns to check for
const usEnglishPatterns = [
  { pattern: /\boptimize\b/gi, term: 'optimize', correct: 'optimise' },
  { pattern: /\boptimized\b/gi, term: 'optimized', correct: 'optimised' },
  { pattern: /\boptimizing\b/gi, term: 'optimizing', correct: 'optimising' },
  { pattern: /\boptimization\b/gi, term: 'optimization', correct: 'optimisation' },
  { pattern: /\banalyze\b/gi, term: 'analyze', correct: 'analyse' },
  { pattern: /\banalyzed\b/gi, term: 'analyzed', correct: 'analysed' },
  { pattern: /\banalyzing\b/gi, term: 'analyzing', correct: 'analysing' },
  { pattern: /\bcustomize\b/gi, term: 'customize', correct: 'customise' },
  { pattern: /\bcustomized\b/gi, term: 'customized', correct: 'customised' },
  { pattern: /\bcustomizing\b/gi, term: 'customizing', correct: 'customising' },
  { pattern: /\bcustomization\b/gi, term: 'customization', correct: 'customisation' },
  { pattern: /\bpersonalize\b/gi, term: 'personalize', correct: 'personalise' },
  { pattern: /\bpersonalized\b/gi, term: 'personalized', correct: 'personalised' },
  { pattern: /\borganize\b/gi, term: 'organize', correct: 'organise' },
  { pattern: /\borganized\b/gi, term: 'organized', correct: 'organised' },
  { pattern: /\borganizing\b/gi, term: 'organizing', correct: 'organising' },
  { pattern: /\blicense\b/gi, term: 'license', correct: 'licence' },
  { pattern: /\bdefense\b/gi, term: 'defense', correct: 'defence' },
  { pattern: /\binquiry\b/gi, term: 'inquiry', correct: 'enquiry' },
  { pattern: /\binquiries\b/gi, term: 'inquiries', correct: 'enquiries' },
];

// Files to check
const filePatterns = [
  'src/app/**/*.tsx',
  'src/app/**/*.ts',
  'src/components/**/*.tsx',
  'src/components/**/*.ts',
  'src/content/**/*.ts',
  'src/lib/**/*.ts',
  'content/**/*.md',
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/out/**',
  '**/.next/**',
  '**/build-*/**',
  '**/temp-*/**',
];

function shouldCheckFile(filePath) {
  for (const pattern of excludePatterns) {
    if (filePath.includes(pattern.replace(/\*\*/g, ''))) {
      return false;
    }
  }
  return true;
}

function checkFileForUSEnglish(filePath, content) {
  const issues = [];
  const lines = content.split('\n');

  for (const { pattern, term, correct } of usEnglishPatterns) {
    lines.forEach((line, lineIndex) => {
      // Skip CSS class names
      if (
        line.includes('className') &&
        (line.includes('text-center') ||
          line.includes('justify-center') ||
          line.includes('items-center') ||
          line.includes('place-center') ||
          line.includes('content-center'))
      ) {
        return;
      }

      // Skip import statements
      if (line.trim().startsWith('import ')) {
        return;
      }

      const matches = line.match(pattern);
      if (matches) {
        issues.push({
          line: lineIndex + 1,
          term: term,
          correct: correct,
          context: line.trim(),
        });
      }
    });
  }

  return issues;
}

async function verifyUKEnglish() {
  console.log('🇬🇧 Verifying UK English Implementation...\n');

  const allFiles = [];
  for (const pattern of filePatterns) {
    const files = glob.sync(pattern, { nodir: true });
    allFiles.push(...files);
  }

  const filesToCheck = allFiles.filter(shouldCheckFile);
  console.log(`Checking ${filesToCheck.length} files...\n`);

  const results = {
    filesChecked: filesToCheck.length,
    filesWithIssues: 0,
    totalIssues: 0,
    issuesByFile: [],
  };

  for (const filePath of filesToCheck) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = checkFileForUSEnglish(filePath, content);

      if (issues.length > 0) {
        results.filesWithIssues++;
        results.totalIssues += issues.length;
        results.issuesByFile.push({
          file: filePath,
          issues: issues,
        });

        console.log(`❌ ${filePath}`);
        issues.forEach((issue) => {
          console.log(`   Line ${issue.line}: "${issue.term}" → should be "${issue.correct}"`);
          console.log(`   Context: ${issue.context.substring(0, 80)}...`);
        });
        console.log('');
      }
    } catch (error) {
      console.error(`⚠️  Error checking ${filePath}:`, error.message);
    }
  }

  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('🇬🇧 UK English Verification Complete');
  console.log('='.repeat(60));
  console.log(`Files checked: ${results.filesChecked}`);
  console.log(`Files with issues: ${results.filesWithIssues}`);
  console.log(`Total issues found: ${results.totalIssues}`);

  if (results.totalIssues === 0) {
    console.log('\n✅ SUCCESS: All content uses UK English!');
    console.log('🎉 No US English spellings found.\n');
  } else {
    console.log('\n⚠️  ISSUES FOUND: Some US English spellings remain.');
    console.log('Run the normalisation script to fix:');
    console.log('   node scripts/apply-uk-english-normalisation.js\n');
  }

  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `uk-english-verification-report-${timestamp}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Report saved to: ${reportPath}\n`);

  return results.totalIssues === 0 ? 0 : 1;
}

// Run verification
verifyUKEnglish()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
