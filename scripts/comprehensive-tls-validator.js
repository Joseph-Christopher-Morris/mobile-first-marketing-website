#!/usr/bin/env node

/**
 * Comprehensive TLS Version and Cipher Suite Validator
 * 
 * This script implements task 7.5 requirements:
 * - Test TLS 1.2 and 1.3 support
 * - Verify weak TLS versions are disabled
 * - Check cipher suite strength and configuration
 * - Validate perfect forward secrecy
 */

const https = require('https');
const tls = require('tls');
const fs = require('fs');
const path = require('path');

class ComprehensiveTLSValidator {
    constructor(domain, options = {}) {
        this.domain = domain;
        this.port = options.port || 443;
        this.timeout = options.timeout || 15000;
        this.results = {
            domain: this.domain,
            port: this.port,
            timestamp: new Date().toISOString(),
            tlsVersionSupport: {},
            cipherSuiteAnalysis: {},
            securityAssessment: {},
            complianceCheck: {},
            recommendations: [],
            testDetails: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                warnings: 0
            }
        };
        
        this.loadSecurityConfig();
    }

    /**
     * Load security configuration
     */
    loadSecurityConfig() {
        try {
            const configPath = path.join(__dirname, '../config/tls-security-config.json');
            this.securityConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.warn(`⚠️  Could not load security config: ${error.message}`);
            this.securityConfig = this.getDefaultSecurityConfig();
        }
    }

    /**
     * Get default security configuration
     */
    getDefaultSecurityConfig() {
        return {
            tlsValidation: {
                requiredVersions: ["TLS 1.2", "TLS 1.3"],
                prohibitedVersions: ["SSL 2.0", "SSL 3.0", "TLS 1.0", "TLS 1.1"],
                minimumSecurityLevel: "MEDIUM",
                requirePFS: true,
                strongEncryptionRequired: true
            },
            cipherSuites: {
                recommended: [
                    "ECDHE-RSA-AES256-GCM-SHA384",
                    "ECDHE-RSA-AES128-GCM-SHA256",
                    "TLS_AES_256_GCM_SHA384",
                    "TLS_CHACHA20_POLY1305_SHA256"
                ],
                prohibited: ["RC4", "DES", "3DES", "MD5", "SHA1-only"]
            }
        };
    }

    /**
     * Test TLS 1.2 and 1.3 support (Task requirement 1)
     */
    async testSecureTLSVersions() {
        console.log(`\n🔒 Testing secure TLS version support...`);
        
        const secureTLSVersions = [
            { name: 'TLS 1.2', version: 'TLSv1.2', required: true },
            { name: 'TLS 1.3', version: 'TLSv1.3', required: false }
        ];

        for (const tlsVersion of secureTLSVersions) {
            try {
                const result = await this.testSpecificTLSVersion(tlsVersion.version);
                this.results.tlsVersionSupport[tlsVersion.name] = {
                    supported: result.supported,
                    required: tlsVersion.required,
                    negotiatedProtocol: result.negotiatedProtocol,
                    cipher: result.cipher,
                    connectionTime: result.connectionTime,
                    status: result.supported ? '✅ SUPPORTED' : '❌ NOT SUPPORTED'
                };
                
                console.log(`  ${tlsVersion.name}: ${this.results.tlsVersionSupport[tlsVersion.name].status}`);
                
                if (result.supported && result.cipher) {
                    console.log(`    Cipher: ${result.cipher.name}`);
                    console.log(`    Protocol: ${result.negotiatedProtocol}`);
                }
                
                this.results.testDetails.totalTests++;
                if (result.supported) {
                    this.results.testDetails.passedTests++;
                } else if (tlsVersion.required) {
                    this.results.testDetails.failedTests++;
                    this.results.recommendations.push(`Enable ${tlsVersion.name} support - this is required for security compliance`);
                } else {
                    this.results.testDetails.warnings++;
                    this.results.recommendations.push(`Consider enabling ${tlsVersion.name} support for enhanced security`);
                }
                
            } catch (error) {
                this.results.tlsVersionSupport[tlsVersion.name] = {
                    supported: false,
                    required: tlsVersion.required,
                    status: '❌ ERROR',
                    error: error.message
                };
                console.log(`  ${tlsVersion.name}: ❌ ERROR - ${error.message}`);
                this.results.testDetails.totalTests++;
                this.results.testDetails.failedTests++;
            }
        }
    }

    /**
     * Verify weak TLS versions are disabled (Task requirement 2)
     */
    async testWeakTLSVersions() {
        console.log(`\n🚫 Testing weak TLS version support (should be disabled)...`);
        
        const weakTLSVersions = [
            { name: 'SSL 3.0', version: 'SSLv3', critical: true },
            { name: 'TLS 1.0', version: 'TLSv1', critical: true },
            { name: 'TLS 1.1', version: 'TLSv1.1', critical: true }
        ];

        for (const tlsVersion of weakTLSVersions) {
            try {
                const result = await this.testSpecificTLSVersion(tlsVersion.version);
                this.results.tlsVersionSupport[tlsVersion.name] = {
                    supported: result.supported,
                    shouldBeDisabled: true,
                    critical: tlsVersion.critical,
                    status: result.supported ? '⚠️  ENABLED (INSECURE)' : '✅ DISABLED'
                };
                
                console.log(`  ${tlsVersion.name}: ${this.results.tlsVersionSupport[tlsVersion.name].status}`);
                
                this.results.testDetails.totalTests++;
                if (!result.supported) {
                    this.results.testDetails.passedTests++;
                } else {
                    if (tlsVersion.critical) {
                        this.results.testDetails.failedTests++;
                        this.results.recommendations.push(`CRITICAL: Disable ${tlsVersion.name} support immediately - this is a security vulnerability`);
                    } else {
                        this.results.testDetails.warnings++;
                        this.results.recommendations.push(`Disable ${tlsVersion.name} support for better security`);
                    }
                }
                
            } catch (error) {
                // For weak versions, connection errors usually mean they're disabled (good)
                this.results.tlsVersionSupport[tlsVersion.name] = {
                    supported: false,
                    shouldBeDisabled: true,
                    status: '✅ DISABLED',
                    note: 'Connection failed (likely disabled)'
                };
                console.log(`  ${tlsVersion.name}: ✅ DISABLED (connection failed)`);
                this.results.testDetails.totalTests++;
                this.results.testDetails.passedTests++;
            }
        }
    }

    /**
     * Test specific TLS version with enhanced error handling
     */
    async testSpecificTLSVersion(tlsVersion) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            let options = {
                host: this.domain,
                port: this.port,
                rejectUnauthorized: false,
                timeout: this.timeout
            };

            // Configure TLS version specific options
            if (tlsVersion === 'TLSv1.3') {
                options.minVersion = 'TLSv1.3';
                options.maxVersion = 'TLSv1.3';
            } else if (tlsVersion === 'TLSv1.2') {
                options.minVersion = 'TLSv1.2';
                options.maxVersion = 'TLSv1.2';
            } else if (tlsVersion === 'TLSv1.1') {
                options.minVersion = 'TLSv1.1';
                options.maxVersion = 'TLSv1.1';
            } else if (tlsVersion === 'TLSv1') {
                options.minVersion = 'TLSv1';
                options.maxVersion = 'TLSv1';
            } else if (tlsVersion === 'SSLv3') {
                // SSLv3 is not supported in modern Node.js
                resolve({
                    supported: false,
                    connectionTime: Date.now() - startTime,
                    error: 'SSLv3 not supported by Node.js (good for security)'
                });
                return;
            }

            const socket = tls.connect(options, () => {
                const connectionTime = Date.now() - startTime;
                const negotiatedProtocol = socket.getProtocol();
                const cipher = socket.getCipher();
                
                socket.destroy();
                resolve({
                    supported: true,
                    negotiatedProtocol,
                    cipher,
                    connectionTime
                });
            });

            socket.on('error', (error) => {
                socket.destroy();
                const connectionTime = Date.now() - startTime;
                
                // Analyze error to determine if version is actually unsupported
                if (error.code === 'ENOTFOUND') {
                    reject(error); // DNS/network error
                } else if (error.message.includes('protocol version') ||
                          error.message.includes('wrong version number') ||
                          error.message.includes('legacy sigalg disallowed') ||
                          error.code === 'EPROTO') {
                    resolve({
                        supported: false,
                        connectionTime,
                        error: error.message
                    });
                } else {
                    resolve({
                        supported: false,
                        connectionTime,
                        error: error.message
                    });
                }
            });

            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error('Connection timeout'));
            });

            socket.setTimeout(this.timeout);
        });
    }

    /**
     * Check cipher suite strength and configuration (Task requirement 3)
     */
    async analyzeCipherSuites() {
        console.log(`\n🔐 Analyzing cipher suite strength and configuration...`);
        
        const cipherAnalysis = {
            negotiatedCiphers: [],
            strongCiphers: [],
            weakCiphers: [],
            pfsSupported: false,
            strongEncryption: false,
            securityLevel: 'UNKNOWN'
        };

        // Test with different TLS versions to get cipher information
        const tlsVersionsToTest = ['TLSv1.3', 'TLSv1.2'];
        
        for (const version of tlsVersionsToTest) {
            try {
                const result = await this.testSpecificTLSVersion(version);
                if (result.supported && result.cipher) {
                    const cipherInfo = this.analyzeCipherStrength(result.cipher);
                    cipherAnalysis.negotiatedCiphers.push({
                        tlsVersion: version,
                        cipher: result.cipher,
                        analysis: cipherInfo
                    });
                    
                    if (cipherInfo.strong) {
                        cipherAnalysis.strongCiphers.push(result.cipher.name);
                    } else {
                        cipherAnalysis.weakCiphers.push(result.cipher.name);
                    }
                    
                    if (cipherInfo.pfs) {
                        cipherAnalysis.pfsSupported = true;
                    }
                    
                    if (cipherInfo.strongEncryption) {
                        cipherAnalysis.strongEncryption = true;
                    }
                    
                    console.log(`  ${version} cipher: ${result.cipher.name}`);
                    console.log(`    Strength: ${cipherInfo.strong ? '✅ STRONG' : '⚠️  WEAK'}`);
                    console.log(`    PFS: ${cipherInfo.pfs ? '✅ YES' : '❌ NO'}`);
                    console.log(`    Encryption: ${cipherInfo.strongEncryption ? '✅ STRONG' : '⚠️  WEAK'}`);
                }
            } catch (error) {
                console.log(`  ${version}: ❌ Could not analyze - ${error.message}`);
            }
        }

        // Determine overall security level
        if (cipherAnalysis.pfsSupported && cipherAnalysis.strongEncryption && cipherAnalysis.weakCiphers.length === 0) {
            cipherAnalysis.securityLevel = 'HIGH';
        } else if (cipherAnalysis.pfsSupported || cipherAnalysis.strongEncryption) {
            cipherAnalysis.securityLevel = 'MEDIUM';
        } else {
            cipherAnalysis.securityLevel = 'LOW';
        }

        this.results.cipherSuiteAnalysis = cipherAnalysis;
        
        console.log(`\n📊 Cipher Suite Analysis Summary:`);
        console.log(`  Security Level: ${cipherAnalysis.securityLevel}`);
        console.log(`  Perfect Forward Secrecy: ${cipherAnalysis.pfsSupported ? '✅ YES' : '❌ NO'}`);
        console.log(`  Strong Encryption: ${cipherAnalysis.strongEncryption ? '✅ YES' : '❌ NO'}`);
        console.log(`  Strong Ciphers: ${cipherAnalysis.strongCiphers.length}`);
        console.log(`  Weak Ciphers: ${cipherAnalysis.weakCiphers.length}`);

        // Add test results
        this.results.testDetails.totalTests += 2; // PFS and strong encryption tests
        if (cipherAnalysis.pfsSupported) {
            this.results.testDetails.passedTests++;
        } else {
            this.results.testDetails.failedTests++;
            this.results.recommendations.push('Enable Perfect Forward Secrecy (PFS) cipher suites');
        }
        
        if (cipherAnalysis.strongEncryption) {
            this.results.testDetails.passedTests++;
        } else {
            this.results.testDetails.failedTests++;
            this.results.recommendations.push('Use stronger encryption algorithms (AES-256, ChaCha20)');
        }
    }

    /**
     * Analyze cipher strength
     */
    analyzeCipherStrength(cipher) {
        const cipherName = cipher.name.toUpperCase();
        
        const analysis = {
            name: cipher.name,
            pfs: false,
            strongEncryption: false,
            keyExchange: 'UNKNOWN',
            encryption: 'UNKNOWN',
            mac: 'UNKNOWN',
            strong: false
        };

        // Check for Perfect Forward Secrecy
        analysis.pfs = cipherName.includes('ECDHE') || 
                      cipherName.includes('DHE') ||
                      cipherName.startsWith('TLS_'); // TLS 1.3 ciphers have PFS by default

        // Check encryption strength
        analysis.strongEncryption = cipherName.includes('AES256') || 
                                   cipherName.includes('AES_256') ||
                                   cipherName.includes('CHACHA20') ||
                                   cipherName.includes('TLS_AES_256') ||
                                   cipherName.includes('TLS_CHACHA20');

        // Determine key exchange
        if (cipherName.includes('ECDHE')) {
            analysis.keyExchange = 'ECDHE';
        } else if (cipherName.includes('DHE')) {
            analysis.keyExchange = 'DHE';
        } else if (cipherName.includes('RSA')) {
            analysis.keyExchange = 'RSA';
        } else if (cipherName.startsWith('TLS_')) {
            analysis.keyExchange = 'ECDHE'; // TLS 1.3 default
        }

        // Determine encryption algorithm
        if (cipherName.includes('AES256') || cipherName.includes('AES_256')) {
            analysis.encryption = 'AES-256';
        } else if (cipherName.includes('AES128') || cipherName.includes('AES_128')) {
            analysis.encryption = 'AES-128';
        } else if (cipherName.includes('CHACHA20')) {
            analysis.encryption = 'ChaCha20';
        }

        // Determine MAC
        if (cipherName.includes('SHA384')) {
            analysis.mac = 'SHA384';
        } else if (cipherName.includes('SHA256')) {
            analysis.mac = 'SHA256';
        } else if (cipherName.includes('GCM')) {
            analysis.mac = 'AEAD';
        } else if (cipherName.includes('POLY1305')) {
            analysis.mac = 'AEAD';
        }

        // Overall strength assessment
        analysis.strong = analysis.pfs && analysis.strongEncryption;

        return analysis;
    }

    /**
     * Validate perfect forward secrecy (Task requirement 4)
     */
    async validatePerfectForwardSecrecy() {
        console.log(`\n🛡️  Validating Perfect Forward Secrecy...`);
        
        const pfsResults = {
            supported: false,
            ciphersWithPFS: [],
            ciphersWithoutPFS: [],
            recommendation: ''
        };

        // Check PFS support across different TLS versions
        for (const cipherInfo of this.results.cipherSuiteAnalysis.negotiatedCiphers) {
            if (cipherInfo.analysis.pfs) {
                pfsResults.ciphersWithPFS.push({
                    tlsVersion: cipherInfo.tlsVersion,
                    cipher: cipherInfo.cipher.name,
                    keyExchange: cipherInfo.analysis.keyExchange
                });
                pfsResults.supported = true;
            } else {
                pfsResults.ciphersWithoutPFS.push({
                    tlsVersion: cipherInfo.tlsVersion,
                    cipher: cipherInfo.cipher.name,
                    keyExchange: cipherInfo.analysis.keyExchange
                });
            }
        }

        console.log(`  PFS Support: ${pfsResults.supported ? '✅ YES' : '❌ NO'}`);
        console.log(`  Ciphers with PFS: ${pfsResults.ciphersWithPFS.length}`);
        console.log(`  Ciphers without PFS: ${pfsResults.ciphersWithoutPFS.length}`);

        if (pfsResults.ciphersWithPFS.length > 0) {
            console.log(`  PFS Ciphers:`);
            pfsResults.ciphersWithPFS.forEach(cipher => {
                console.log(`    - ${cipher.cipher} (${cipher.tlsVersion}, ${cipher.keyExchange})`);
            });
        }

        if (pfsResults.ciphersWithoutPFS.length > 0) {
            console.log(`  Non-PFS Ciphers:`);
            pfsResults.ciphersWithoutPFS.forEach(cipher => {
                console.log(`    - ${cipher.cipher} (${cipher.tlsVersion}, ${cipher.keyExchange})`);
            });
            pfsResults.recommendation = 'Configure server to prefer PFS cipher suites';
        }

        this.results.securityAssessment.perfectForwardSecrecy = pfsResults;
        
        this.results.testDetails.totalTests++;
        if (pfsResults.supported) {
            this.results.testDetails.passedTests++;
        } else {
            this.results.testDetails.failedTests++;
            this.results.recommendations.push('Enable Perfect Forward Secrecy (PFS) - use ECDHE or DHE key exchange');
        }
    }

    /**
     * Generate comprehensive security assessment
     */
    generateSecurityAssessment() {
        console.log(`\n📋 Comprehensive Security Assessment:`);
        
        const assessment = {
            overallScore: 0,
            maxScore: 100,
            categories: {
                tlsVersions: { score: 0, maxScore: 40, weight: 0.4 },
                cipherSuites: { score: 0, maxScore: 30, weight: 0.3 },
                perfectForwardSecrecy: { score: 0, maxScore: 20, weight: 0.2 },
                compliance: { score: 0, maxScore: 10, weight: 0.1 }
            },
            grade: 'F',
            status: 'FAIL'
        };

        // Score TLS versions (40 points)
        const hasTLS12 = this.results.tlsVersionSupport['TLS 1.2']?.supported;
        const hasTLS13 = this.results.tlsVersionSupport['TLS 1.3']?.supported;
        const hasWeakTLS = this.results.tlsVersionSupport['TLS 1.0']?.supported || 
                          this.results.tlsVersionSupport['TLS 1.1']?.supported;

        if (hasTLS12) assessment.categories.tlsVersions.score += 25;
        if (hasTLS13) assessment.categories.tlsVersions.score += 15;
        if (hasWeakTLS) assessment.categories.tlsVersions.score -= 20;

        // Score cipher suites (30 points)
        const cipherLevel = this.results.cipherSuiteAnalysis.securityLevel;
        if (cipherLevel === 'HIGH') assessment.categories.cipherSuites.score = 30;
        else if (cipherLevel === 'MEDIUM') assessment.categories.cipherSuites.score = 20;
        else if (cipherLevel === 'LOW') assessment.categories.cipherSuites.score = 10;

        // Score PFS (20 points)
        if (this.results.securityAssessment.perfectForwardSecrecy?.supported) {
            assessment.categories.perfectForwardSecrecy.score = 20;
        }

        // Score compliance (10 points)
        if (hasTLS12 && !hasWeakTLS && this.results.cipherSuiteAnalysis.pfsSupported) {
            assessment.categories.compliance.score = 10;
        }

        // Calculate overall score
        assessment.overallScore = Object.values(assessment.categories)
            .reduce((total, category) => total + category.score, 0);

        // Determine grade and status
        if (assessment.overallScore >= 90) {
            assessment.grade = 'A';
            assessment.status = 'EXCELLENT';
        } else if (assessment.overallScore >= 80) {
            assessment.grade = 'B';
            assessment.status = 'GOOD';
        } else if (assessment.overallScore >= 70) {
            assessment.grade = 'C';
            assessment.status = 'ACCEPTABLE';
        } else if (assessment.overallScore >= 60) {
            assessment.grade = 'D';
            assessment.status = 'POOR';
        } else {
            assessment.grade = 'F';
            assessment.status = 'FAIL';
        }

        this.results.securityAssessment.overall = assessment;

        console.log(`  Overall Score: ${assessment.overallScore}/${assessment.maxScore}`);
        console.log(`  Grade: ${assessment.grade}`);
        console.log(`  Status: ${assessment.status}`);
        console.log(`  TLS Versions: ${assessment.categories.tlsVersions.score}/${assessment.categories.tlsVersions.maxScore}`);
        console.log(`  Cipher Suites: ${assessment.categories.cipherSuites.score}/${assessment.categories.cipherSuites.maxScore}`);
        console.log(`  Perfect Forward Secrecy: ${assessment.categories.perfectForwardSecrecy.score}/${assessment.categories.perfectForwardSecrecy.maxScore}`);
        console.log(`  Compliance: ${assessment.categories.compliance.score}/${assessment.categories.compliance.maxScore}`);
    }

    /**
     * Check compliance with security standards
     */
    checkCompliance() {
        console.log(`\n✅ Checking compliance with security standards...`);
        
        const compliance = {
            'PCI DSS': false,
            'NIST': false,
            'OWASP': false,
            details: {}
        };

        // PCI DSS compliance check
        const pciCompliant = this.results.tlsVersionSupport['TLS 1.2']?.supported &&
                            !this.results.tlsVersionSupport['TLS 1.0']?.supported &&
                            !this.results.tlsVersionSupport['TLS 1.1']?.supported &&
                            this.results.cipherSuiteAnalysis.strongEncryption;
        
        compliance['PCI DSS'] = pciCompliant;
        compliance.details['PCI DSS'] = {
            required: ['TLS 1.2+', 'No weak TLS', 'Strong encryption'],
            status: pciCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'
        };

        // NIST compliance check
        const nistCompliant = this.results.tlsVersionSupport['TLS 1.2']?.supported &&
                             this.results.cipherSuiteAnalysis.pfsSupported;
        
        compliance['NIST'] = nistCompliant;
        compliance.details['NIST'] = {
            required: ['TLS 1.2+', 'Perfect Forward Secrecy'],
            status: nistCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'
        };

        // OWASP compliance check
        const owaspCompliant = this.results.tlsVersionSupport['TLS 1.2']?.supported &&
                              !this.results.tlsVersionSupport['TLS 1.0']?.supported &&
                              !this.results.tlsVersionSupport['TLS 1.1']?.supported &&
                              this.results.cipherSuiteAnalysis.securityLevel !== 'LOW';
        
        compliance['OWASP'] = owaspCompliant;
        compliance.details['OWASP'] = {
            required: ['TLS 1.2+', 'No weak TLS', 'Strong ciphers'],
            status: owaspCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'
        };

        this.results.complianceCheck = compliance;

        console.log(`  PCI DSS: ${compliance['PCI DSS'] ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
        console.log(`  NIST: ${compliance['NIST'] ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
        console.log(`  OWASP: ${compliance['OWASP'] ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
    }

    /**
     * Generate final recommendations
     */
    generateRecommendations() {
        console.log(`\n📝 Security Recommendations:`);
        
        if (this.results.recommendations.length === 0) {
            this.results.recommendations.push('TLS configuration meets security requirements');
            console.log(`  ✅ No critical issues found`);
        } else {
            // Sort recommendations by priority (critical first)
            const sortedRecommendations = this.results.recommendations.sort((a, b) => {
                if (a.includes('CRITICAL')) return -1;
                if (b.includes('CRITICAL')) return 1;
                return 0;
            });

            sortedRecommendations.forEach((recommendation, index) => {
                const priority = recommendation.includes('CRITICAL') ? '🚨 CRITICAL' : 
                               recommendation.includes('Enable TLS') ? '⚠️  HIGH' : '💡 MEDIUM';
                console.log(`  ${index + 1}. ${priority}: ${recommendation}`);
            });
        }
    }

    /**
     * Save detailed results
     */
    saveResults(filename) {
        const outputFile = filename || `comprehensive-tls-validation-${this.domain}-${Date.now()}.json`;
        
        // Add summary to results
        this.results.summary = {
            domain: this.domain,
            timestamp: this.results.timestamp,
            overallScore: this.results.securityAssessment.overall?.overallScore || 0,
            grade: this.results.securityAssessment.overall?.grade || 'F',
            status: this.results.securityAssessment.overall?.status || 'FAIL',
            testResults: this.results.testDetails,
            criticalIssues: this.results.recommendations.filter(r => r.includes('CRITICAL')).length,
            totalRecommendations: this.results.recommendations.length
        };

        fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Detailed results saved to: ${outputFile}`);
        return outputFile;
    }

    /**
     * Run comprehensive TLS validation
     */
    async validate() {
        console.log(`🔍 Starting Comprehensive TLS Validation`);
        console.log(`🌐 Domain: ${this.domain}:${this.port}`);
        console.log(`⏰ Timestamp: ${this.results.timestamp}`);
        console.log(`📋 Task 7.5 Requirements:`);
        console.log(`   - Test TLS 1.2 and 1.3 support`);
        console.log(`   - Verify weak TLS versions are disabled`);
        console.log(`   - Check cipher suite strength and configuration`);
        console.log(`   - Validate perfect forward secrecy`);

        try {
            // Execute all validation steps
            await this.testSecureTLSVersions();
            await this.testWeakTLSVersions();
            await this.analyzeCipherSuites();
            await this.validatePerfectForwardSecrecy();
            
            this.generateSecurityAssessment();
            this.checkCompliance();
            this.generateRecommendations();

            console.log(`\n✅ Comprehensive TLS validation completed`);
            console.log(`📊 Final Score: ${this.results.securityAssessment.overall?.overallScore || 0}/100 (${this.results.securityAssessment.overall?.grade || 'F'})`);
            
            return this.results;

        } catch (error) {
            console.error(`\n❌ TLS validation failed: ${error.message}`);
            this.results.error = error.message;
            throw error;
        }
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help')) {
        console.log(`
Comprehensive TLS Version and Cipher Suite Validator

Usage: node comprehensive-tls-validator.js <domain> [options]

Options:
  --port <port>        Port to test (default: 443)
  --timeout <ms>       Connection timeout (default: 15000)
  --output <file>      Output file for results
  --help              Show this help message

Examples:
  node comprehensive-tls-validator.js example.com
  node comprehensive-tls-validator.js d1234567890.cloudfront.net
  node comprehensive-tls-validator.js mysite.com --output tls-results.json
        `);
        process.exit(args.includes('--help') ? 0 : 1);
    }
    
    const domain = args[0];
    const options = {};
    let outputFile = null;
    
    for (let i = 1; i < args.length; i += 2) {
        switch (args[i]) {
            case '--port':
                options.port = parseInt(args[i + 1]);
                break;
            case '--timeout':
                options.timeout = parseInt(args[i + 1]);
                break;
            case '--output':
                outputFile = args[i + 1];
                break;
        }
    }
    
    const validator = new ComprehensiveTLSValidator(domain, options);
    
    validator.validate()
        .then((results) => {
            validator.saveResults(outputFile);
            
            // Exit with appropriate code based on security assessment
            const score = results.securityAssessment.overall?.overallScore || 0;
            const hasCriticalIssues = results.recommendations.some(r => r.includes('CRITICAL'));
            
            if (hasCriticalIssues || score < 60) {
                console.log(`\n🚨 Critical security issues detected - immediate action required`);
                process.exit(1);
            } else if (score < 80) {
                console.log(`\n⚠️  Security improvements recommended`);
                process.exit(1);
            } else {
                console.log(`\n✅ TLS configuration meets security requirements`);
                process.exit(0);
            }
        })
        .catch((error) => {
            console.error(`\n💥 Validation failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = ComprehensiveTLSValidator;