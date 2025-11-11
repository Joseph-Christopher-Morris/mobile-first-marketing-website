/**
 * Post-Deployment Verification Script
 * Validates all requirements for task 12: Post-Deployment Verification
 */

const https = require('https');
const { URL } = require('url');

const PRODUCTION_URL = 'https://d15sc9fc739ev2.cloudfront.net';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

/**
 * Fetch a URL and return response details
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Task 12.1: Verify no chunk errors
 */
async function verifyNoChunkErrors() {
  logSection('Task 12.1: Verify No Chunk Errors');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  try {
    // Check main pages for chunk loading
    const pagesToCheck = [
      '/',
      '/services/photography',
      '/services/hosting',
      '/services/ad-campaigns',
      '/services/analytics',
      '/pricing',
      '/about',
      '/contact'
    ];

    for (const page of pagesToCheck) {
      const url = `${PRODUCTION_URL}${page}`;
      logInfo(`Checking ${page}...`);
      
      try {
        const response = await fetchUrl(url);
        
        if (response.statusCode === 200) {
          // Check for chunk error indicators in HTML
          const hasUnexpectedToken = response.body.includes('Unexpected token');
          const hasChunkLoadError = response.body.includes('ChunkLoadError');
          const hasNextChunks = response.body.includes('/_next/static/');
          
          if (hasUnexpectedToken || hasChunkLoadError) {
            logError(`${page}: Found chunk errors in response`);
            results.failed++;
            results.details.push({
              page,
              status: 'FAIL',
              issue: 'Chunk errors detected'
            });
          } else if (!hasNextChunks) {
            logWarning(`${page}: No Next.js chunks found (may be expected for static pages)`);
            results.warnings++;
            results.details.push({
              page,
              status: 'WARNING',
              issue: 'No Next.js chunks detected'
            });
          } else {
            logSuccess(`${page}: No chunk errors detected`);
            results.passed++;
            results.details.push({
              page,
              status: 'PASS',
              issue: null
            });
          }
        } else {
          logError(`${page}: HTTP ${response.statusCode}`);
          results.failed++;
          results.details.push({
            page,
            status: 'FAIL',
            issue: `HTTP ${response.statusCode}`
          });
        }
      } catch (error) {
        logError(`${page}: ${error.message}`);
        results.failed++;
        results.details.push({
          page,
          status: 'FAIL',
          issue: error.message
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    logInfo(`\nResults: ${results.passed} passed, ${results.failed} failed, ${results.warnings} warnings`);
    return results;
  } catch (error) {
    logError(`Error during chunk verification: ${error.message}`);
    return results;
  }
}

/**
 * Task 12.2: Verify press logos display correctly
 */
async function verifyPressLogos() {
  logSection('Task 12.2: Verify Press Logos Display Correctly');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  try {
    // Check home page
    logInfo('Checking home page press logos...');
    const homeResponse = await fetchUrl(`${PRODUCTION_URL}/`);
    
    if (homeResponse.statusCode === 200) {
      const expectedLogos = [
        'autotrader-logo.svg',
        'bbc-logo.svg',
        'business-insider-logo.svg',
        'cnn-logo.svg',
        'daily-mail-logo.svg',
        'financial-times-logo.svg',
        'forbes-logo.svg'
      ];

      let allLogosFound = true;
      let hasFilters = false;

      for (const logo of expectedLogos) {
        if (homeResponse.body.includes(logo)) {
          logSuccess(`Found ${logo}`);
          results.passed++;
        } else {
          logError(`Missing ${logo}`);
          results.failed++;
          allLogosFound = false;
        }
      }

      // Check for CSS filters (should NOT be present)
      const filterPatterns = [
        'brightness',
        'hue-rotate',
        'sepia',
        'saturate'
      ];

      for (const pattern of filterPatterns) {
        if (homeResponse.body.includes(`group-hover:${pattern}`) || 
            homeResponse.body.includes(`hover:${pattern}`)) {
          logError(`Found CSS filter: ${pattern} (should be removed)`);
          hasFilters = true;
          results.failed++;
        }
      }

      if (!hasFilters) {
        logSuccess('No CSS filters detected (correct)');
        results.passed++;
      }

      // Check for opacity classes (should be present)
      if (homeResponse.body.includes('opacity-80') && 
          homeResponse.body.includes('hover:opacity-100')) {
        logSuccess('Opacity hover effects present');
        results.passed++;
      } else {
        logWarning('Opacity hover effects may be missing');
        results.details.push({
          check: 'Opacity effects',
          status: 'WARNING'
        });
      }
    }

    // Check photography page
    logInfo('\nChecking photography page press logos...');
    const photoResponse = await fetchUrl(`${PRODUCTION_URL}/services/photography`);
    
    if (photoResponse.statusCode === 200) {
      const hasLogos = photoResponse.body.includes('press-logos') || 
                       photoResponse.body.includes('As featured in');
      
      if (hasLogos) {
        logSuccess('Photography page has press logos section');
        results.passed++;
      } else {
        logWarning('Photography page may not have press logos');
        results.details.push({
          check: 'Photography page logos',
          status: 'WARNING'
        });
      }
    }

    logInfo(`\nResults: ${results.passed} passed, ${results.failed} failed`);
    return results;
  } catch (error) {
    logError(`Error during press logos verification: ${error.message}`);
    return results;
  }
}

/**
 * Task 12.3: Verify no old PNG/JPG logos remain
 */
async function verifyNoOldLogos() {
  logSection('Task 12.3: Verify No Old PNG/JPG Logos Remain');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  try {
    const pagesToCheck = [
      '/',
      '/services/photography',
      '/about'
    ];

    const oldLogoPatterns = [
      '/images/publications/',
      '.png',
      '.jpg',
      '.jpeg'
    ];

    for (const page of pagesToCheck) {
      logInfo(`Checking ${page}...`);
      const response = await fetchUrl(`${PRODUCTION_URL}${page}`);
      
      if (response.statusCode === 200) {
        let foundOldLogos = false;
        
        for (const pattern of oldLogoPatterns) {
          // Look for old logo references in image tags
          const regex = new RegExp(`<img[^>]*src=["'][^"']*${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*["']`, 'gi');
          const matches = response.body.match(regex);
          
          if (matches && matches.length > 0) {
            // Filter out false positives (like blog images)
            const logoMatches = matches.filter(match => 
              match.includes('logo') || 
              match.includes('press') || 
              match.includes('publication')
            );
            
            if (logoMatches.length > 0) {
              logError(`${page}: Found old logo references with ${pattern}`);
              foundOldLogos = true;
              results.failed++;
              results.details.push({
                page,
                pattern,
                matches: logoMatches
              });
            }
          }
        }
        
        if (!foundOldLogos) {
          logSuccess(`${page}: No old PNG/JPG logos found`);
          results.passed++;
        }
      }
    }

    logInfo(`\nResults: ${results.passed} passed, ${results.failed} failed`);
    return results;
  } catch (error) {
    logError(`Error during old logos verification: ${error.message}`);
    return results;
  }
}

/**
 * Task 12.4: Verify pricing information displays
 */
async function verifyPricingInformation() {
  logSection('Task 12.4: Verify Pricing Information Displays');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  try {
    const pricingChecks = [
      {
        page: '/',
        name: 'Home page pricing teaser',
        keywords: ['pricing', 'from £', 'View full pricing']
      },
      {
        page: '/services/hosting',
        name: 'Hosting page pricing',
        keywords: ['£15', 'hosting', 'pricing']
      },
      {
        page: '/services/photography',
        name: 'Photography page pricing',
        keywords: ['£200', 'per day', 'pricing']
      },
      {
        page: '/services/ad-campaigns',
        name: 'Ads/Campaigns page pricing',
        keywords: ['£150', 'management', 'pricing']
      },
      {
        page: '/services/analytics',
        name: 'Analytics page pricing',
        keywords: ['£75', 'GA4', 'pricing']
      },
      {
        page: '/pricing',
        name: 'Pricing page',
        keywords: ['pricing', '£', 'service']
      }
    ];

    for (const check of pricingChecks) {
      logInfo(`Checking ${check.name}...`);
      
      try {
        const response = await fetchUrl(`${PRODUCTION_URL}${check.page}`);
        
        if (response.statusCode === 200) {
          let allKeywordsFound = true;
          const missingKeywords = [];
          
          for (const keyword of check.keywords) {
            if (!response.body.toLowerCase().includes(keyword.toLowerCase())) {
              allKeywordsFound = false;
              missingKeywords.push(keyword);
            }
          }
          
          if (allKeywordsFound) {
            logSuccess(`${check.name}: All pricing information present`);
            results.passed++;
          } else {
            logError(`${check.name}: Missing keywords: ${missingKeywords.join(', ')}`);
            results.failed++;
            results.details.push({
              page: check.page,
              missing: missingKeywords
            });
          }
          
          // Check for pricing page link
          if (check.page !== '/pricing') {
            if (response.body.includes('href="/pricing"') || 
                response.body.includes('href=\\"/pricing\\"')) {
              logSuccess(`${check.name}: Has link to pricing page`);
              results.passed++;
            } else {
              logWarning(`${check.name}: May be missing link to pricing page`);
              results.details.push({
                page: check.page,
                issue: 'Missing pricing link'
              });
            }
          }
        } else {
          logError(`${check.name}: HTTP ${response.statusCode}`);
          results.failed++;
        }
      } catch (error) {
        logError(`${check.name}: ${error.message}`);
        results.failed++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    logInfo(`\nResults: ${results.passed} passed, ${results.failed} failed`);
    return results;
  } catch (error) {
    logError(`Error during pricing verification: ${error.message}`);
    return results;
  }
}

/**
 * Task 12.5: Verify navigation updates
 */
async function verifyNavigationUpdates() {
  logSection('Task 12.5: Verify Navigation Updates');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  try {
    logInfo('Checking navigation links...');
    
    const response = await fetchUrl(`${PRODUCTION_URL}/`);
    
    if (response.statusCode === 200) {
      // Check for pricing link in header
      const hasPricingInHeader = response.body.includes('href="/pricing"') || 
                                  response.body.includes('href=\\"/pricing\\"');
      
      if (hasPricingInHeader) {
        logSuccess('Header navigation has pricing link');
        results.passed++;
      } else {
        logError('Header navigation missing pricing link');
        results.failed++;
        results.details.push({
          location: 'Header',
          issue: 'Missing pricing link'
        });
      }
      
      // Check for pricing link in footer
      const footerMatch = response.body.match(/<footer[\s\S]*?<\/footer>/i);
      if (footerMatch) {
        const footerContent = footerMatch[0];
        if (footerContent.includes('pricing') || footerContent.includes('Pricing')) {
          logSuccess('Footer navigation has pricing link');
          results.passed++;
        } else {
          logWarning('Footer may be missing pricing link');
          results.details.push({
            location: 'Footer',
            issue: 'Pricing link not clearly visible'
          });
        }
      }
      
      // Test pricing link from multiple pages
      const pagesToTest = [
        '/services/hosting',
        '/services/photography',
        '/about'
      ];
      
      for (const page of pagesToTest) {
        const pageResponse = await fetchUrl(`${PRODUCTION_URL}${page}`);
        if (pageResponse.statusCode === 200) {
          if (pageResponse.body.includes('href="/pricing"') || 
              pageResponse.body.includes('href=\\"/pricing\\"')) {
            logSuccess(`${page}: Has pricing link`);
            results.passed++;
          } else {
            logWarning(`${page}: May be missing pricing link`);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    logInfo(`\nResults: ${results.passed} passed, ${results.failed} failed`);
    return results;
  } catch (error) {
    logError(`Error during navigation verification: ${error.message}`);
    return results;
  }
}

/**
 * Main execution
 */
async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     POST-DEPLOYMENT VERIFICATION - Task 12                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  logInfo(`\nProduction URL: ${PRODUCTION_URL}`);
  logInfo(`Timestamp: ${new Date().toISOString()}\n`);

  const allResults = {
    chunkErrors: null,
    pressLogos: null,
    oldLogos: null,
    pricing: null,
    navigation: null
  };

  try {
    // Run all verification tasks
    allResults.chunkErrors = await verifyNoChunkErrors();
    allResults.pressLogos = await verifyPressLogos();
    allResults.oldLogos = await verifyNoOldLogos();
    allResults.pricing = await verifyPricingInformation();
    allResults.navigation = await verifyNavigationUpdates();

    // Summary
    logSection('VERIFICATION SUMMARY');
    
    const totalPassed = Object.values(allResults).reduce((sum, result) => 
      sum + (result?.passed || 0), 0);
    const totalFailed = Object.values(allResults).reduce((sum, result) => 
      sum + (result?.failed || 0), 0);
    const totalWarnings = Object.values(allResults).reduce((sum, result) => 
      sum + (result?.warnings || 0), 0);

    log(`\nTotal Checks Passed: ${totalPassed}`, 'green');
    if (totalFailed > 0) {
      log(`Total Checks Failed: ${totalFailed}`, 'red');
    }
    if (totalWarnings > 0) {
      log(`Total Warnings: ${totalWarnings}`, 'yellow');
    }

    if (totalFailed === 0) {
      log('\n✓ ALL VERIFICATION TASKS PASSED!', 'green');
      log('The deployment meets all requirements.', 'green');
    } else {
      log('\n✗ SOME VERIFICATION TASKS FAILED', 'red');
      log('Please review the errors above and address them.', 'red');
    }

    // Save results to file
    const fs = require('fs');
    const reportPath = `post-deployment-verification-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      productionUrl: PRODUCTION_URL,
      results: allResults,
      summary: {
        passed: totalPassed,
        failed: totalFailed,
        warnings: totalWarnings
      }
    }, null, 2));
    
    logInfo(`\nDetailed report saved to: ${reportPath}`);

  } catch (error) {
    logError(`\nFatal error during verification: ${error.message}`);
    process.exit(1);
  }
}

// Run the verification
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
