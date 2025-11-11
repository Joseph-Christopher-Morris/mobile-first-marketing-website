#!/usr/bin/env node

/**
 * Photography Page Live Validation Script
 * Validates that the legacy statistics grid has been removed from the live site
 */

const https = require('https');

const SITE_URL = 'https://d15sc9fc739ev2.cloudfront.net/services/photography';

console.log('🔍 Photography Page Live Validation');
console.log('===================================');
console.log(`Testing: ${SITE_URL}\n`);

function fetchPage() {
    return new Promise((resolve, reject) => {
        const request = https.get(SITE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        }, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                resolve({
                    statusCode: response.statusCode,
                    headers: response.headers,
                    body: data
                });
            });
        });
        
        request.on('error', (error) => {
            reject(error);
        });
        
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function validateContent(html) {
    console.log('📋 Content Validation Results:');
    console.log('==============================');
    
    const results = {
        passed: 0,
        failed: 0,
        warnings: 0
    };
    
    // Check for REMOVED content (should NOT be present)
    const legacyPatterns = [
        { pattern: /3\+.*Major Publications/i, name: '3+ Major Publications' },
        { pattern: /50\+.*Local Projects/i, name: '50+ Local Projects' },
        { pattern: /100\+.*Campaign Images/i, name: '100+ Campaign Images' },
        { pattern: /grid-cols-1 md:grid-cols-3.*gap-8 text-center/i, name: 'Legacy statistics grid CSS' }
    ];
    
    console.log('❌ Checking for REMOVED content (should NOT be present):');
    legacyPatterns.forEach(({ pattern, name }) => {
        const found = pattern.test(html);
        if (found) {
            console.log(`   ❌ FAIL: "${name}" still present`);
            results.failed++;
        } else {
            console.log(`   ✅ PASS: "${name}" successfully removed`);
            results.passed++;
        }
    });
    
    // Check for REQUIRED content (should be present)
    const requiredPatterns = [
        { pattern: /3,500\+.*licensed images/i, name: '3,500+ licensed images' },
        { pattern: /90\+.*countries/i, name: '90+ countries' },
        { pattern: /Proven Global Reach/i, name: 'Proven Global Reach section' },
        { pattern: /Photography That.*Builds Trust/i, name: 'Main heading' }
    ];
    
    console.log('\n✅ Checking for REQUIRED content (should be present):');
    requiredPatterns.forEach(({ pattern, name }) => {
        const found = pattern.test(html);
        if (found) {
            console.log(`   ✅ PASS: "${name}" found`);
            results.passed++;
        } else {
            console.log(`   ❌ FAIL: "${name}" missing`);
            results.failed++;
        }
    });
    
    // Additional checks
    console.log('\n🔍 Additional Checks:');
    
    // Check for any remaining "3+" patterns that might be legacy
    const threePattern = /(?<!3,)3\+/g;
    const threeMatches = html.match(threePattern);
    if (threeMatches && threeMatches.length > 0) {
        console.log(`   ⚠️  WARNING: Found ${threeMatches.length} instances of "3+" (check if legacy)`);
        results.warnings++;
    } else {
        console.log('   ✅ PASS: No suspicious "3+" patterns found');
        results.passed++;
    }
    
    // Check page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1].includes('Photography')) {
        console.log(`   ✅ PASS: Page title correct: "${titleMatch[1]}"`);
        results.passed++;
    } else {
        console.log('   ❌ FAIL: Photography page title not found');
        results.failed++;
    }
    
    return results;
}

async function main() {
    try {
        console.log('🌐 Fetching live page...');
        const response = await fetchPage();
        
        console.log(`📊 Response Status: ${response.statusCode}`);
        console.log(`📏 Content Length: ${response.body.length} characters`);
        
        if (response.statusCode !== 200) {
            console.log(`❌ ERROR: Expected status 200, got ${response.statusCode}`);
            process.exit(1);
        }
        
        console.log('✅ Page fetched successfully\n');
        
        const results = await validateContent(response.body);
        
        console.log('\n📊 Validation Summary:');
        console.log('=====================');
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`⚠️  Warnings: ${results.warnings}`);
        
        if (results.failed === 0) {
            console.log('\n🎉 All validations passed! Photography page is correctly updated.');
            
            if (results.warnings > 0) {
                console.log('⚠️  Please review warnings above.');
            }
            
            console.log('\n📋 Manual verification recommended:');
            console.log('   1. Visit the page in a browser');
            console.log('   2. Confirm visual layout is correct');
            console.log('   3. Test on mobile devices');
            
            process.exit(0);
        } else {
            console.log('\n❌ Validation failed! Please check the issues above.');
            console.log('\nPossible causes:');
            console.log('   - Cache invalidation still in progress (wait 5-15 minutes)');
            console.log('   - Deployment did not complete successfully');
            console.log('   - Legacy content still in source files');
            
            process.exit(1);
        }
        
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        console.log('\nTroubleshooting:');
        console.log('   - Check internet connection');
        console.log('   - Verify CloudFront distribution is active');
        console.log('   - Try again in a few minutes');
        process.exit(1);
    }
}

main();