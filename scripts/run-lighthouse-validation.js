#!/usr/bin/env node

/**
 * Run Lighthouse Validation Script for SCRAM Final Deployment
 * 
 * This script runs Lighthouse CI validation against the production site
 * and validates the results according to SCRAM requirements.
 * 
 * Usage:
 *   node scripts/run-lighthouse-validation.js
 *   npm run lighthouse:validate
 * 
 * Requirements: 9.1
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runLighthouseValidation() {
  console.log('🚀 Starting Lighthouse CI Validation for SCRAM Final Deployment\n');
  
  try {
    // Clean up previous results
    const lhciDir = path.join(process.cwd(), '.lighthouseci');
    if (fs.existsSync(lhciDir)) {
      console.log('🧹 Cleaning up previous Lighthouse CI results...');
      fs.rmSync(lhciDir, { recursive: true, force: true });
    }
    
    console.log('🔍 Running Lighthouse CI against production site...');
    console.log('Target URLs:');
    console.log('  - https://d15sc9fc739ev2.cloudfront.net/ (Home)');
    console.log('  - https://d15sc9fc739ev2.cloudfront.net/services/ (Services)');
    console.log('  - https://d15sc9fc739ev2.cloudfront.net/blog/ (Blog)');
    console.log('');
    
    // Run Lighthouse CI
    console.log('📊 Executing Lighthouse audits...');
    try {
      execSync('npm run lighthouse:ci', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Lighthouse CI execution completed\n');
    } catch (error) {
      // Lighthouse CI might exit with non-zero code if assertions fail
      // but we still want to validate the results
      console.log('⚠️  Lighthouse CI completed with warnings/failures\n');
    }
    
    // Validate results
    console.log('🔍 Validating Lighthouse CI results...\n');
    const validateScript = path.join(__dirname, 'lighthouse-ci-validation.js');
    
    try {
      execSync(`node "${validateScript}"`, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('\n🎉 Lighthouse validation completed successfully!');
      console.log('📁 Reports available in .lighthouseci/ directory');
      
      return true;
      
    } catch (validationError) {
      console.log('\n❌ Lighthouse validation failed');
      console.log('📁 Reports available in .lighthouseci/ directory for analysis');
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error running Lighthouse validation:', error.message);
    return false;
  }
}

// Run validation
if (require.main === module) {
  runLighthouseValidation().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = runLighthouseValidation;