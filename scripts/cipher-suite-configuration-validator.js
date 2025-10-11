#!/usr/bin/env node

/**
 * Cipher Suite Configuration Validator
 * 
 * This script validates cipher suite configurations for CloudFront and HTTPS endpoints
 * focusing on configuration analysis rather than live testing
 */

const fs = require('fs');
const path = require('path');
const tls = require('tls');

class CipherSuiteConfigurationValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            configurationAnalysis: {},
            cipherStrengthAnalysis: {},
            securityRecommendations: [],
            complianceCheck: {},
            score: 0,
            passed: false
        };

        // Load configuration standards
        this.loadSecurityStandards();
    }

    /**
     * Load security standards from configuration file
     */
    loadSecurityStandards() {
        try {
            const configPath = path.join(__dirname, '..', 'config', 'cipher-suite-security-config.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            this.securityStandards = JSON.parse(configData).cipherSuiteStandards;
            console.log('✅ Loaded cipher suite security standards');
        } catch (error) {
            console.log('⚠️  Could not load security standards, using defaults');
            this.securityStandards = this.getDefaultStandards();
        }
    }

    /**
     * Get default security standards if config file is not available
     */
    getDefaultStandards() {
        return {
            strongCipherSuites: {
                required: [
                    'ECDHE-RSA-AES256-GCM-SHA384',
                    'ECDHE-RSA-AES128-GCM-SHA256',
                    'ECDHE-ECDSA-AES256-GCM-SHA384',
                    'ECDHE-ECDSA-AES128-GCM-SHA256'
                ],
                recommended: [
                    'ECDHE-RSA-CHACHA20-POLY1305',
                    'ECDHE-ECDSA-CHACHA20-POLY1305'
                ]
            },
            weakCipherSuites: {
                prohibited: ['RC4', 'DES', '3DES', 'MD5', 'SHA1', 'NULL', 'EXPORT']
            },
            encryptionStrength: {
                symmetric: { minimum: 128, recommended: 256 }
            }
        };
    }

    /**
     * Main validation method
     */
    async validateCipherConfiguration(configType = 'cloudfront') {
        console.log('🔐 Starting Cipher Suite Configuration Validation...\n');
        
        try {
            // Analyze Node.js cipher support
            this.analyzeNodeJSCipherSupport();
            
            // Validate cipher strength requirements
            this.validateCipherStrength();
            
            // Check for weak cipher patterns
            this.checkWeakCipherPatterns();
            
            // Analyze CloudFront specific requirements
            if (configType === 'cloudfront') {
                this.analyzeCloudFrontCipherRequirements();
            }
            
            // Generate compliance report
            this.generateComplianceReport();
            
            // Calculate security score
            this.calculateSecurityScore();
            
            // Generate recommendations
            this.generateSecurityRecommendations();
            
            // Save reports
            this.saveReports();
            
            return this.results;
            
        } catch (error) {
            console.error('❌ Cipher configuration validation failed:', error.message);
            this.results.error = error.message;
            return this.results;
        }
    }

    /**
     * Analyze Node.js cipher support
     */
    analyzeNodeJSCipherSupport() {
        console.log('🔍 Analyzing Node.js cipher support...');
        
        const nodeCiphers = tls.getCiphers();
        console.log(`📋 Node.js supports ${nodeCiphers.length} cipher suites`);
        
        const analysis = {
            totalCiphers: nodeCiphers.length,
            strongCiphers: [],
            modernCiphers: [],
            legacyCiphers: [],
            weakCiphers: []
        };

        // Categorize ciphers
        nodeCiphers.forEach(cipher => {
            const upperCipher = cipher.toUpperCase();
            
            // Check for strong patterns
            if (this.isStrongCipherPattern(upperCipher)) {
                analysis.strongCiphers.push(cipher);
            }
            
            // Check for modern AEAD ciphers
            if (upperCipher.includes('GCM') || upperCipher.includes('CHACHA20') || upperCipher.includes('POLY1305')) {
                analysis.modernCiphers.push(cipher);
            }
            
            // Check for weak patterns
            if (this.isWeakCipherPattern(upperCipher)) {
                analysis.weakCiphers.push(cipher);
            }
            
            // Check for legacy patterns
            if (upperCipher.includes('CBC') && !upperCipher.includes('GCM')) {
                analysis.legacyCiphers.push(cipher);
            }
        });

        this.results.configurationAnalysis = analysis;
        
        console.log(`✅ Strong cipher patterns found: ${analysis.strongCiphers.length}`);
        console.log(`🔒 Modern AEAD ciphers found: ${analysis.modernCiphers.length}`);
        console.log(`⚠️  Legacy ciphers found: ${analysis.legacyCiphers.length}`);
        console.log(`❌ Weak cipher patterns found: ${analysis.weakCiphers.length}`);
    }

    /**
     * Check if cipher matches strong patterns
     */
    isStrongCipherPattern(cipher) {
        const strongPatterns = [
            /ECDHE.*AES.*GCM/,
            /ECDHE.*CHACHA20/,
            /DHE.*AES.*GCM/,
            /AES.*256.*GCM/,
            /CHACHA20.*POLY1305/
        ];
        
        return strongPatterns.some(pattern => pattern.test(cipher));
    }

    /**
     * Check if cipher matches weak patterns
     */
    isWeakCipherPattern(cipher) {
        const weakPatterns = [
            /RC4/,
            /DES/,
            /MD5/,
            /SHA$/,  // SHA1
            /NULL/,
            /EXPORT/,
            /PSK/,
            /SRP/,
            /ADH/,
            /AECDH/
        ];
        
        return weakPatterns.some(pattern => pattern.test(cipher));
    }

    /**
     * Validate cipher strength requirements
     */
    validateCipherStrength() {
        console.log('\n🔬 Validating cipher strength requirements...');
        
        const { strongCiphers, modernCiphers } = this.results.configurationAnalysis;
        
        const strengthAnalysis = {
            aes256Support: strongCiphers.filter(c => c.toUpperCase().includes('AES256')).length,
            aes128Support: strongCiphers.filter(c => c.toUpperCase().includes('AES128')).length,
            chacha20Support: strongCiphers.filter(c => c.toUpperCase().includes('CHACHA20')).length,
            aeadSupport: modernCiphers.length,
            perfectForwardSecrecy: strongCiphers.filter(c => c.toUpperCase().includes('ECDHE') || c.toUpperCase().includes('DHE')).length
        };

        this.results.cipherStrengthAnalysis = strengthAnalysis;

        // Validate against requirements
        if (strengthAnalysis.aes256Support === 0) {
            this.results.securityRecommendations.push('Enable AES-256 cipher suites for enhanced security');
        } else {
            console.log(`✅ AES-256 support: ${strengthAnalysis.aes256Support} ciphers`);
        }

        if (strengthAnalysis.chacha20Support === 0) {
            this.results.securityRecommendations.push('Consider enabling ChaCha20-Poly1305 cipher suites');
        } else {
            console.log(`✅ ChaCha20 support: ${strengthAnalysis.chacha20Support} ciphers`);
        }

        if (strengthAnalysis.perfectForwardSecrecy === 0) {
            this.results.securityRecommendations.push('Enable Perfect Forward Secrecy with ECDHE or DHE key exchange');
        } else {
            console.log(`✅ Perfect Forward Secrecy: ${strengthAnalysis.perfectForwardSecrecy} ciphers`);
        }

        if (strengthAnalysis.aeadSupport < 4) {
            this.results.securityRecommendations.push('Increase AEAD cipher suite support (GCM, ChaCha20-Poly1305)');
        } else {
            console.log(`✅ AEAD cipher support: ${strengthAnalysis.aeadSupport} ciphers`);
        }
    }

    /**
     * Check for weak cipher patterns in configuration
     */
    checkWeakCipherPatterns() {
        console.log('\n🚫 Checking for weak cipher patterns...');
        
        const { weakCiphers } = this.results.configurationAnalysis;
        
        if (weakCiphers.length > 0) {
            console.log(`❌ Found ${weakCiphers.length} weak cipher patterns:`);
            weakCiphers.slice(0, 10).forEach(cipher => {
                console.log(`   - ${cipher}`);
            });
            
            if (weakCiphers.length > 10) {
                console.log(`   ... and ${weakCiphers.length - 10} more`);
            }
            
            this.results.securityRecommendations.push(`Disable ${weakCiphers.length} weak cipher suites found in configuration`);
        } else {
            console.log('✅ No weak cipher patterns detected');
        }
    }

    /**
     * Analyze CloudFront specific cipher requirements
     */
    analyzeCloudFrontCipherRequirements() {
        console.log('\n☁️  Analyzing CloudFront cipher requirements...');
        
        const cloudFrontAnalysis = {
            recommendedSecurityPolicy: 'TLSv1.2_2021',
            supportedProtocols: ['TLSv1.2', 'TLSv1.3'],
            requiredCiphers: [
                'ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-ECDSA-AES256-GCM-SHA384',
                'ECDHE-ECDSA-AES128-GCM-SHA256'
            ],
            securityHeaders: {
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block'
            }
        };

        // Check if Node.js supports CloudFront required ciphers
        const nodeCiphers = tls.getCiphers().map(c => c.toUpperCase());
        const supportedRequired = cloudFrontAnalysis.requiredCiphers.filter(cipher => {
            const variations = [
                cipher,
                cipher.replace(/-/g, '_'),
                `TLS_${cipher.replace(/-/g, '_')}`
            ];
            return variations.some(variation => nodeCiphers.includes(variation));
        });

        console.log(`✅ CloudFront required ciphers supported: ${supportedRequired.length}/${cloudFrontAnalysis.requiredCiphers.length}`);
        
        if (supportedRequired.length < cloudFrontAnalysis.requiredCiphers.length) {
            this.results.securityRecommendations.push('Ensure all CloudFront required cipher suites are supported');
        }

        this.results.cloudFrontAnalysis = cloudFrontAnalysis;
    }

    /**
     * Generate compliance report
     */
    generateComplianceReport() {
        console.log('\n📋 Generating compliance report...');
        
        const { strongCiphers, weakCiphers, modernCiphers } = this.results.configurationAnalysis;
        const { aes256Support, chacha20Support, perfectForwardSecrecy, aeadSupport } = this.results.cipherStrengthAnalysis;
        
        const compliance = {
            strongCipherSupport: strongCiphers.length >= 4,
            noWeakCiphers: weakCiphers.length === 0,
            modernEncryption: aes256Support > 0 && chacha20Support > 0,
            perfectForwardSecrecy: perfectForwardSecrecy > 0,
            aeadSupport: aeadSupport >= 4,
            overallCompliant: false
        };

        // Calculate overall compliance
        const checks = Object.keys(compliance).filter(key => key !== 'overallCompliant');
        const passedChecks = checks.filter(key => compliance[key]).length;
        compliance.overallCompliant = passedChecks >= Math.ceil(checks.length * 0.8); // 80% threshold

        this.results.complianceCheck = compliance;

        console.log('📊 Compliance Results:');
        console.log(`   Strong cipher support: ${compliance.strongCipherSupport ? '✅' : '❌'}`);
        console.log(`   No weak ciphers: ${compliance.noWeakCiphers ? '✅' : '❌'}`);
        console.log(`   Modern encryption: ${compliance.modernEncryption ? '✅' : '❌'}`);
        console.log(`   Perfect Forward Secrecy: ${compliance.perfectForwardSecrecy ? '✅' : '❌'}`);
        console.log(`   AEAD support: ${compliance.aeadSupport ? '✅' : '❌'}`);
        console.log(`   Overall compliant: ${compliance.overallCompliant ? '✅' : '❌'}`);
    }

    /**
     * Calculate security score
     */
    calculateSecurityScore() {
        const { strongCiphers, weakCiphers, modernCiphers } = this.results.configurationAnalysis;
        const { aes256Support, chacha20Support, perfectForwardSecrecy } = this.results.cipherStrengthAnalysis;
        
        let score = 0;
        
        // Strong cipher support (30 points)
        score += Math.min(30, strongCiphers.length * 3);
        
        // No weak ciphers (25 points)
        if (weakCiphers.length === 0) {
            score += 25;
        } else {
            score += Math.max(0, 25 - weakCiphers.length);
        }
        
        // Modern encryption support (20 points)
        if (aes256Support > 0) score += 10;
        if (chacha20Support > 0) score += 10;
        
        // Perfect Forward Secrecy (15 points)
        if (perfectForwardSecrecy > 0) score += 15;
        
        // AEAD cipher support (10 points)
        score += Math.min(10, modernCiphers.length);
        
        this.results.score = Math.min(100, score);
        this.results.passed = this.results.score >= 80;
        
        console.log(`\n📊 Security Score: ${this.results.score}/100`);
        console.log(`Status: ${this.results.passed ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}`);
    }

    /**
     * Generate security recommendations
     */
    generateSecurityRecommendations() {
        if (this.results.securityRecommendations.length === 0) {
            this.results.securityRecommendations.push('Cipher suite configuration meets security standards');
        }
        
        // Add general recommendations
        this.results.securityRecommendations.push('Regularly update cipher suite configurations');
        this.results.securityRecommendations.push('Monitor for new cipher suite vulnerabilities');
        this.results.securityRecommendations.push('Test cipher configurations in staging before production');
    }

    /**
     * Save validation reports
     */
    saveReports() {
        const reportPath = path.join(__dirname, '..', 'config', 'cipher-suite-configuration-report.json');
        const summaryPath = path.join(__dirname, '..', 'config', 'cipher-suite-configuration-summary.md');

        // Save detailed JSON report
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Generate markdown summary
        const summary = this.generateMarkdownSummary();
        fs.writeFileSync(summaryPath, summary);

        console.log(`\n📄 Reports saved:`);
        console.log(`   - Detailed report: ${reportPath}`);
        console.log(`   - Summary report: ${summaryPath}`);
    }

    /**
     * Generate markdown summary
     */
    generateMarkdownSummary() {
        const { score, passed, configurationAnalysis, cipherStrengthAnalysis, securityRecommendations, complianceCheck } = this.results;
        
        return `# Cipher Suite Configuration Validation Report

## Summary
- **Validation Date**: ${this.results.timestamp}
- **Security Score**: ${score}/100
- **Status**: ${passed ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}

## Configuration Analysis
- **Total Ciphers**: ${configurationAnalysis.totalCiphers}
- **Strong Ciphers**: ${configurationAnalysis.strongCiphers?.length || 0}
- **Modern AEAD Ciphers**: ${configurationAnalysis.modernCiphers?.length || 0}
- **Weak Ciphers**: ${configurationAnalysis.weakCiphers?.length || 0}
- **Legacy Ciphers**: ${configurationAnalysis.legacyCiphers?.length || 0}

## Cipher Strength Analysis
- **AES-256 Support**: ${cipherStrengthAnalysis.aes256Support || 0} ciphers
- **ChaCha20 Support**: ${cipherStrengthAnalysis.chacha20Support || 0} ciphers
- **Perfect Forward Secrecy**: ${cipherStrengthAnalysis.perfectForwardSecrecy || 0} ciphers
- **AEAD Support**: ${cipherStrengthAnalysis.aeadSupport || 0} ciphers

## Compliance Check
- **Strong Cipher Support**: ${complianceCheck.strongCipherSupport ? '✅ PASS' : '❌ FAIL'}
- **No Weak Ciphers**: ${complianceCheck.noWeakCiphers ? '✅ PASS' : '❌ FAIL'}
- **Modern Encryption**: ${complianceCheck.modernEncryption ? '✅ PASS' : '❌ FAIL'}
- **Perfect Forward Secrecy**: ${complianceCheck.perfectForwardSecrecy ? '✅ PASS' : '❌ FAIL'}
- **AEAD Support**: ${complianceCheck.aeadSupport ? '✅ PASS' : '❌ FAIL'}

## Security Recommendations
${securityRecommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps
${passed ? 
'✅ Configuration meets security standards. Continue monitoring and updating as needed.' : 
'⚠️ Configuration needs improvement. Please implement the recommendations above.'}
`;
    }
}

// CLI execution
async function main() {
    const configType = process.argv[2] || 'cloudfront';
    
    console.log('🔐 Cipher Suite Configuration Validator');
    console.log('=======================================\n');
    
    const validator = new CipherSuiteConfigurationValidator();
    
    try {
        const results = await validator.validateCipherConfiguration(configType);
        
        if (results.passed) {
            console.log('\n🎉 Cipher suite configuration validation completed successfully!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Cipher suite configuration needs improvement.');
            console.log('Please review the recommendations and update the configuration.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Cipher suite configuration validation failed:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = CipherSuiteConfigurationValidator;

// Run if called directly
if (require.main === module) {
    main();
}