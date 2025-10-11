#!/usr/bin/env node

/**
 * Content Security Policy Tester
 *
 * This script tests and validates the Content Security Policy (CSP)
 * implementation for security compliance and functionality.
 */

const fs = require('fs');
const path = require('path');

class CSPPolicyTester {
  constructor() {
    this.results = {
      parsing: { passed: 0, failed: 0, tests: [] },
      directives: { passed: 0, failed: 0, tests: [] },
      security: { passed: 0, failed: 0, tests: [] },
      compatibility: { passed: 0, failed: 0, tests: [] },
      overall: { passed: 0, failed: 0 },
    };
    this.cspPolicy = null;
  }

  /**
   * Parse CSP from amplify.yml
   */
  parseCSPFromConfig() {
    console.log('\n🔍 Parsing CSP from Amplify Configuration...');

    try {
      const amplifyPath = path.join(process.cwd(), 'amplify.yml');
      const amplifyContent = fs.readFileSync(amplifyPath, 'utf8');

      // Extract CSP policy using a comprehensive regex that handles the YAML structure
      const cspRegex =
        /-\s+key:\s*["']Content-Security-Policy["']\s*\n\s*value:\s*["']([^"]*(?:\\.[^"]*)*)["']/s;
      const cspMatch = amplifyContent.match(cspRegex);

      let cspValue = null;
      if (cspMatch) {
        cspValue = cspMatch[1];
      } else {
        // Fallback: try simpler pattern
        const fallbackMatch = amplifyContent.match(
          /Content-Security-Policy[\s\S]*?value:\s*["']([^"]+)["']/
        );
        if (fallbackMatch) {
          cspValue = fallbackMatch[1];
        }
      }

      if (!cspValue) {
        this.addTest(
          'parsing',
          'CSP policy found',
          false,
          'No CSP found in amplify.yml'
        );
        return false;
      }

      this.cspPolicy = cspValue;
      this.addTest('parsing', 'CSP policy found', true);

      console.log(
        `  🔍 CSP policy extracted (${this.cspPolicy.length} characters)`
      );

      // Parse directives
      const directives = this.parseCSPDirectives(this.cspPolicy);
      this.addTest(
        'parsing',
        'CSP directives parsed',
        Object.keys(directives).length > 0
      );

      console.log(
        `  📋 Found ${Object.keys(directives).length} CSP directives`
      );
      console.log(`  📋 Directives: ${Object.keys(directives).join(', ')}`);

      return true;
    } catch (error) {
      this.addTest('parsing', 'CSP parsing', false, error.message);
      return false;
    }
  }

  /**
   * Parse CSP directives into object
   */
  parseCSPDirectives(csp) {
    const directives = {};
    const parts = csp
      .split(';')
      .map(part => part.trim())
      .filter(part => part);

    parts.forEach(part => {
      const spaceIndex = part.indexOf(' ');
      if (spaceIndex > 0) {
        const directive = part.substring(0, spaceIndex);
        const values = part
          .substring(spaceIndex + 1)
          .split(/\s+/)
          .filter(v => v);
        directives[directive] = values;
      } else if (part) {
        // Handle directives without values
        directives[part] = [];
      }
    });

    return directives;
  }

  /**
   * Test CSP directives
   */
  testCSPDirectives() {
    console.log('\n🛡️ Testing CSP Directives...');

    if (!this.cspPolicy) {
      this.addTest('directives', 'CSP available for testing', false);
      return;
    }

    const directives = this.parseCSPDirectives(this.cspPolicy);

    // Required directives
    const requiredDirectives = [
      'default-src',
      'script-src',
      'style-src',
      'img-src',
      'font-src',
      'connect-src',
      'frame-ancestors',
    ];

    requiredDirectives.forEach(directive => {
      const hasDirective = directive in directives;
      this.addTest(
        'directives',
        `${directive} directive present`,
        hasDirective
      );

      if (hasDirective) {
        console.log(`    ${directive}: ${directives[directive].join(' ')}`);
      }
    });

    // Optional but recommended directives
    const recommendedDirectives = [
      'object-src',
      'media-src',
      'child-src',
      'form-action',
      'base-uri',
    ];

    recommendedDirectives.forEach(directive => {
      const hasDirective = directive in directives;
      if (hasDirective) {
        this.addTest('directives', `${directive} directive configured`, true);
        console.log(`    ${directive}: ${directives[directive].join(' ')}`);
      }
    });
  }

  /**
   * Test security aspects of CSP
   */
  testCSPSecurity() {
    console.log('\n🔒 Testing CSP Security Configuration...');

    if (!this.cspPolicy) {
      this.addTest('security', 'CSP available for security testing', false);
      return;
    }

    const directives = this.parseCSPDirectives(this.cspPolicy);

    // Test default-src security
    if (directives['default-src']) {
      const hasSecureDefault = directives['default-src'].includes("'self'");
      this.addTest('security', "default-src includes 'self'", hasSecureDefault);

      const hasUnsafeDefaults = directives['default-src'].some(
        src =>
          src.includes('*') ||
          src === "'unsafe-inline'" ||
          src === "'unsafe-eval'"
      );
      this.addTest(
        'security',
        'default-src avoids unsafe wildcards',
        !hasUnsafeDefaults
      );
    }

    // Test script-src security
    if (directives['script-src']) {
      const hasUnsafeInline =
        directives['script-src'].includes("'unsafe-inline'");
      const hasUnsafeEval = directives['script-src'].includes("'unsafe-eval'");

      // Note: unsafe-inline and unsafe-eval might be needed for some frameworks
      // We'll warn but not fail if they're present with trusted domains
      if (hasUnsafeInline || hasUnsafeEval) {
        const hasTrustedDomains = directives['script-src'].some(
          src =>
            src.includes('googleapis.com') ||
            src.includes('google-analytics.com')
        );
        this.addTest(
          'security',
          'script-src unsafe directives used with trusted domains',
          hasTrustedDomains
        );
      } else {
        this.addTest('security', 'script-src avoids unsafe directives', true);
      }
    }

    // Test frame-ancestors
    if (directives['frame-ancestors']) {
      const hasNoneOrSelf =
        directives['frame-ancestors'].includes("'none'") ||
        directives['frame-ancestors'].includes("'self'");
      this.addTest(
        'security',
        'frame-ancestors properly configured',
        hasNoneOrSelf
      );
    }

    // Test img-src for data: and https: allowance
    if (directives['img-src']) {
      const allowsData = directives['img-src'].includes('data:');
      const allowsHttps = directives['img-src'].includes('https:');
      this.addTest('security', 'img-src allows data: URIs', allowsData);
      this.addTest('security', 'img-src allows HTTPS images', allowsHttps);
    }

    // Test connect-src for analytics
    if (directives['connect-src']) {
      const allowsAnalytics = directives['connect-src'].some(
        src =>
          src.includes('google-analytics.com') ||
          src.includes('googletagmanager.com')
      );
      this.addTest(
        'security',
        'connect-src allows analytics connections',
        allowsAnalytics
      );
    }
  }

  /**
   * Test CSP compatibility with common web features
   */
  testCSPCompatibility() {
    console.log('\n🌐 Testing CSP Compatibility...');

    if (!this.cspPolicy) {
      this.addTest(
        'compatibility',
        'CSP available for compatibility testing',
        false
      );
      return;
    }

    const directives = this.parseCSPDirectives(this.cspPolicy);

    // Test Google Fonts compatibility
    const fontSrcAllowsGoogleFonts =
      directives['font-src'] &&
      directives['font-src'].some(src => src.includes('fonts.gstatic.com'));
    const styleSrcAllowsGoogleFonts =
      directives['style-src'] &&
      directives['style-src'].some(src => src.includes('fonts.googleapis.com'));

    this.addTest(
      'compatibility',
      'Google Fonts font-src compatibility',
      fontSrcAllowsGoogleFonts
    );
    this.addTest(
      'compatibility',
      'Google Fonts style-src compatibility',
      styleSrcAllowsGoogleFonts
    );

    // Test Google Analytics compatibility
    const scriptSrcAllowsGA =
      directives['script-src'] &&
      directives['script-src'].some(
        src =>
          src.includes('google-analytics.com') ||
          src.includes('googletagmanager.com')
      );
    const connectSrcAllowsGA =
      directives['connect-src'] &&
      directives['connect-src'].some(src =>
        src.includes('google-analytics.com')
      );

    this.addTest(
      'compatibility',
      'Google Analytics script compatibility',
      scriptSrcAllowsGA
    );
    this.addTest(
      'compatibility',
      'Google Analytics connect compatibility',
      connectSrcAllowsGA
    );

    // Test Next.js compatibility
    const scriptSrcAllowsSelf =
      directives['script-src'] && directives['script-src'].includes("'self'");
    const styleSrcAllowsUnsafeInline =
      directives['style-src'] &&
      directives['style-src'].includes("'unsafe-inline'");

    this.addTest(
      'compatibility',
      'Next.js script-src compatibility',
      scriptSrcAllowsSelf
    );
    this.addTest(
      'compatibility',
      'Next.js style-src compatibility',
      styleSrcAllowsUnsafeInline
    );

    // Test image optimization compatibility
    const imgSrcAllowsData =
      directives['img-src'] && directives['img-src'].includes('data:');
    const imgSrcAllowsHttps =
      directives['img-src'] && directives['img-src'].includes('https:');

    this.addTest(
      'compatibility',
      'Image data: URI compatibility',
      imgSrcAllowsData
    );
    this.addTest(
      'compatibility',
      'Image HTTPS compatibility',
      imgSrcAllowsHttps
    );
  }

  /**
   * Generate CSP recommendations
   */
  generateRecommendations() {
    console.log('\n💡 CSP Recommendations:');

    if (!this.cspPolicy) {
      console.log('  • Add a Content Security Policy to amplify.yml');
      return;
    }

    const directives = this.parseCSPDirectives(this.cspPolicy);
    const recommendations = [];

    // Check for missing recommended directives
    if (!directives['object-src']) {
      recommendations.push(
        "Consider adding 'object-src' directive (recommend: 'none')"
      );
    }
    if (!directives['base-uri']) {
      recommendations.push(
        "Consider adding 'base-uri' directive (recommend: 'self')"
      );
    }
    if (!directives['form-action']) {
      recommendations.push(
        "Consider adding 'form-action' directive (recommend: 'self')"
      );
    }

    // Check for security improvements
    if (
      directives['script-src'] &&
      directives['script-src'].includes("'unsafe-eval'")
    ) {
      recommendations.push(
        "Consider removing 'unsafe-eval' from script-src if possible"
      );
    }

    if (recommendations.length === 0) {
      console.log(
        '  ✅ CSP configuration looks good! No major recommendations.'
      );
    } else {
      recommendations.forEach(rec => console.log(`  • ${rec}`));
    }
  }

  /**
   * Add test result
   */
  addTest(category, name, passed, details = '') {
    const test = { name, passed, details };
    this.results[category].tests.push(test);

    if (passed) {
      this.results[category].passed++;
      this.results.overall.passed++;
      console.log(`  ✅ ${name}`);
    } else {
      this.results[category].failed++;
      this.results.overall.failed++;
      console.log(`  ❌ ${name}${details ? ` - ${details}` : ''}`);
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🛡️ CONTENT SECURITY POLICY TEST REPORT');
    console.log('='.repeat(60));

    if (this.cspPolicy) {
      console.log('\n📋 Current CSP Policy:');
      console.log(`   ${this.cspPolicy}`);
    }

    Object.entries(this.results).forEach(([category, result]) => {
      if (category === 'overall') return;

      const categoryName = category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      const total = result.passed + result.failed;
      const percentage =
        total > 0 ? Math.round((result.passed / total) * 100) : 0;

      console.log(`\n📊 ${categoryName}:`);
      console.log(`   Passed: ${result.passed}/${total} (${percentage}%)`);

      if (result.failed > 0) {
        console.log('   Failed tests:');
        result.tests
          .filter(test => !test.passed)
          .forEach(test => {
            console.log(
              `     • ${test.name}${test.details ? ` - ${test.details}` : ''}`
            );
          });
      }
    });

    this.generateRecommendations();

    const overallTotal =
      this.results.overall.passed + this.results.overall.failed;
    const overallPercentage =
      overallTotal > 0
        ? Math.round((this.results.overall.passed / overallTotal) * 100)
        : 0;

    console.log('\n' + '='.repeat(60));
    console.log(
      `📈 OVERALL CSP SCORE: ${this.results.overall.passed}/${overallTotal} (${overallPercentage}%)`
    );

    if (overallPercentage >= 90) {
      console.log(
        '🎉 Excellent! CSP is well configured for security and compatibility.'
      );
    } else if (overallPercentage >= 75) {
      console.log(
        '✅ Good CSP configuration with minor improvements possible.'
      );
    } else {
      console.log('⚠️  CSP configuration needs attention for better security.');
    }

    console.log('='.repeat(60));

    return overallPercentage >= 75;
  }

  /**
   * Run all CSP tests
   */
  async run() {
    console.log('🛡️ Starting Content Security Policy Testing...');
    console.log(
      'This will test CSP configuration for security and compatibility.'
    );

    if (!this.parseCSPFromConfig()) {
      console.log('❌ Cannot proceed without valid CSP configuration');
      process.exit(1);
    }

    this.testCSPDirectives();
    this.testCSPSecurity();
    this.testCSPCompatibility();

    const success = this.generateReport();

    if (!success) {
      process.exit(1);
    }

    console.log('\n✅ CSP testing completed successfully!');
  }
}

// Run testing if called directly
if (require.main === module) {
  const tester = new CSPPolicyTester();
  tester.run().catch(error => {
    console.error('❌ CSP testing failed:', error);
    process.exit(1);
  });
}

module.exports = CSPPolicyTester;
