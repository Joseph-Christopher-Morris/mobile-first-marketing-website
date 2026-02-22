#!/usr/bin/env node

/**
 * SEO Metadata Verification Script
 * 
 * This script validates all page titles and descriptions across the website
 * to ensure they meet SEO requirements:
 * - Brand name appears exactly once in final title
 * - Title length is under 60 characters (including brand suffix)
 * - Title follows "Primary Keyword | Supporting Context" format
 * - No duplicate titles across routes
 * - Description length is between 140-155 characters
 * - Description is present and non-empty
 * 
 * Usage: node scripts/seo-check.js
 * Exit codes: 0 = all checks pass, 1 = issues found
 */

const fs = require('fs');
const path = require('path');

// Constants
const BRAND = 'Vivid Media Cheshire';
const BRAND_SUFFIX = ` | ${BRAND}`;
const MAX_TITLE_LENGTH = 60;
const MIN_DESCRIPTION_LENGTH = 140;
const MAX_DESCRIPTION_LENGTH = 155;
const APP_DIR = path.join(process.cwd(), 'src', 'app');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Recursively find all page.tsx files in a directory
 */
function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other non-app directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        findPageFiles(filePath, fileList);
      }
    } else if (file === 'page.tsx' || file === 'page.ts') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract route path from file path
 */
function getRouteFromPath(filePath) {
  const relativePath = path.relative(APP_DIR, filePath);
  const routePath = path.dirname(relativePath);
  
  if (routePath === '.') {
    return '/';
  }
  
  return '/' + routePath.replace(/\\/g, '/');
}

/**
 * Extract metadata from a page file
 * This parses the buildSEO() call to extract intent and description
 */
function extractMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Look for buildSEO() call
  const buildSEOMatch = content.match(/buildSEO\s*\(\s*\{([^}]+)\}\s*\)/s);
  
  if (!buildSEOMatch) {
    return null;
  }
  
  const metadataBlock = buildSEOMatch[1];
  
  // Extract intent (the clean title without brand)
  const intentMatch = metadataBlock.match(/intent\s*:\s*["']([^"']+)["']/);
  const intent = intentMatch ? intentMatch[1] : null;
  
  // Extract description
  const descriptionMatch = metadataBlock.match(/description\s*:\s*["']([^"']+)["']/);
  const description = descriptionMatch ? descriptionMatch[1] : null;
  
  return {
    intent,
    description,
    filePath,
  };
}

/**
 * Validate a single page's metadata
 */
function validatePage(route, metadata) {
  const issues = [];
  
  if (!metadata) {
    issues.push({
      type: 'error',
      message: 'No buildSEO() metadata found',
    });
    return issues;
  }
  
  const { intent, description } = metadata;
  
  // Validate intent (clean title)
  if (!intent) {
    issues.push({
      type: 'error',
      message: 'Missing intent (title)',
    });
  } else {
    // Check if brand name is in the intent (it shouldn't be, template adds it)
    const brandCount = (intent.match(new RegExp(BRAND, 'gi')) || []).length;
    
    if (brandCount > 0) {
      issues.push({
        type: 'warning',
        message: `Brand name "${BRAND}" found ${brandCount} time(s) in intent. The layout template will add it automatically, causing duplication.`,
      });
    }
    
    // Calculate final title length (intent + brand suffix)
    const finalTitle = intent + BRAND_SUFFIX;
    const finalTitleLength = finalTitle.length;
    
    if (finalTitleLength > MAX_TITLE_LENGTH) {
      issues.push({
        type: 'error',
        message: `Final title length is ${finalTitleLength} characters (max: ${MAX_TITLE_LENGTH}). Title: "${finalTitle}"`,
      });
    }
    
    // Check title format (should have primary keyword, may have supporting context)
    // This is a soft check - we just warn if there's no clear structure
    if (!intent.includes('—') && !intent.includes('|') && !intent.includes(':')) {
      // Single-phrase titles are okay for some pages (e.g., "Privacy Policy")
      // Only warn if it's very long without structure
      if (intent.length > 40) {
        issues.push({
          type: 'info',
          message: `Title may benefit from "Primary Keyword | Supporting Context" format for better SEO structure`,
        });
      }
    }
  }
  
  // Validate description
  if (!description) {
    issues.push({
      type: 'error',
      message: 'Missing description',
    });
  } else {
    const descLength = description.length;
    
    if (descLength < MIN_DESCRIPTION_LENGTH) {
      issues.push({
        type: 'warning',
        message: `Description is ${descLength} characters (min: ${MIN_DESCRIPTION_LENGTH}). Consider adding more conversion-focused content.`,
      });
    }
    
    if (descLength > MAX_DESCRIPTION_LENGTH) {
      issues.push({
        type: 'warning',
        message: `Description is ${descLength} characters (max: ${MAX_DESCRIPTION_LENGTH}). It will be truncated in search results.`,
      });
    }
  }
  
  return issues;
}

/**
 * Check for duplicate titles across all pages
 */
function checkDuplicateTitles(pages) {
  const titleMap = new Map();
  const duplicates = [];
  
  pages.forEach(({ route, metadata }) => {
    if (!metadata || !metadata.intent) return;
    
    const finalTitle = metadata.intent + BRAND_SUFFIX;
    
    if (titleMap.has(finalTitle)) {
      titleMap.get(finalTitle).push(route);
    } else {
      titleMap.set(finalTitle, [route]);
    }
  });
  
  titleMap.forEach((routes, title) => {
    if (routes.length > 1) {
      duplicates.push({
        title,
        routes,
      });
    }
  });
  
  return duplicates;
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.bold}${colors.cyan}SEO Metadata Verification${colors.reset}\n`);
  console.log(`Scanning ${colors.blue}${APP_DIR}${colors.reset} for page files...\n`);
  
  // Find all page files
  const pageFiles = findPageFiles(APP_DIR);
  console.log(`Found ${colors.bold}${pageFiles.length}${colors.reset} page files\n`);
  
  // Extract metadata from each page
  const pages = pageFiles.map(filePath => {
    const route = getRouteFromPath(filePath);
    const metadata = extractMetadata(filePath);
    return { route, metadata, filePath };
  });
  
  // Validate each page
  let totalIssues = 0;
  let pagesWithIssues = 0;
  let pagesPassing = 0;
  
  const pageResults = pages.map(({ route, metadata, filePath }) => {
    const issues = validatePage(route, metadata);
    
    if (issues.length > 0) {
      pagesWithIssues++;
      totalIssues += issues.length;
    } else {
      pagesPassing++;
    }
    
    return { route, metadata, filePath, issues };
  });
  
  // Check for duplicate titles
  const duplicates = checkDuplicateTitles(pages);
  
  // Print results
  console.log(`${colors.bold}=== Validation Results ===${colors.reset}\n`);
  
  // Print pages with issues
  if (pagesWithIssues > 0) {
    console.log(`${colors.bold}${colors.red}Pages with Issues:${colors.reset}\n`);
    
    pageResults.forEach(({ route, metadata, issues }) => {
      if (issues.length === 0) return;
      
      console.log(`${colors.bold}${route}${colors.reset}`);
      
      if (metadata && metadata.intent) {
        const finalTitle = metadata.intent + BRAND_SUFFIX;
        console.log(`  Title: "${finalTitle}" (${finalTitle.length} chars)`);
      }
      
      if (metadata && metadata.description) {
        console.log(`  Description: ${metadata.description.length} chars`);
      }
      
      issues.forEach(issue => {
        const icon = issue.type === 'error' ? '✗' : issue.type === 'warning' ? '⚠' : 'ℹ';
        const color = issue.type === 'error' ? colors.red : issue.type === 'warning' ? colors.yellow : colors.blue;
        console.log(`  ${color}${icon} ${issue.message}${colors.reset}`);
      });
      
      console.log('');
    });
  }
  
  // Print duplicate titles
  if (duplicates.length > 0) {
    console.log(`${colors.bold}${colors.red}Duplicate Titles Found:${colors.reset}\n`);
    
    duplicates.forEach(({ title, routes }) => {
      console.log(`${colors.red}✗ "${title}"${colors.reset}`);
      routes.forEach(route => {
        console.log(`  - ${route}`);
      });
      console.log('');
    });
    
    totalIssues += duplicates.length;
  }
  
  // Print passing pages
  if (pagesPassing > 0) {
    console.log(`${colors.bold}${colors.green}Pages Passing All Checks:${colors.reset}\n`);
    
    pageResults.forEach(({ route, metadata, issues }) => {
      if (issues.length > 0) return;
      
      if (metadata && metadata.intent) {
        const finalTitle = metadata.intent + BRAND_SUFFIX;
        console.log(`${colors.green}✓${colors.reset} ${route}`);
        console.log(`  Title: "${finalTitle}" (${finalTitle.length} chars)`);
        console.log(`  Description: ${metadata.description.length} chars`);
        console.log('');
      }
    });
  }
  
  // Print summary
  console.log(`${colors.bold}=== Summary ===${colors.reset}\n`);
  console.log(`Total routes scanned: ${colors.bold}${pages.length}${colors.reset}`);
  console.log(`Routes passing: ${colors.green}${colors.bold}${pagesPassing}${colors.reset}`);
  console.log(`Routes with issues: ${colors.red}${colors.bold}${pagesWithIssues}${colors.reset}`);
  console.log(`Total issues found: ${colors.red}${colors.bold}${totalIssues}${colors.reset}`);
  
  if (duplicates.length > 0) {
    console.log(`Duplicate titles: ${colors.red}${colors.bold}${duplicates.length}${colors.reset}`);
  }
  
  console.log('');
  
  // Exit with appropriate code
  if (totalIssues > 0) {
    console.log(`${colors.red}${colors.bold}SEO validation failed!${colors.reset} Please fix the issues above.\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}All SEO checks passed!${colors.reset} 🎉\n`);
    process.exit(0);
  }
}

// Run the script
main();
