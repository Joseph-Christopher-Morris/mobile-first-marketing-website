#!/usr/bin/env node

/**
 * TLS Validation Suite
 * 
 * Validates TLS configuration for CloudFront distributions including:
 * - TLS version support (1.2, 1.3)
 * - Weak TLS version detection
 * - Cipher suite strength validation
 * - Perfect Forward Secrecy verification
 */

const tls = require('tls');
const fs = require('fs');
const path = require('path');

class TLSValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            domain: null,
            tlsVersions: {},
            cipherSuites: [],
            weakCiphers: [],
            perfectForwardSecrecy: false,
            securityScore: 0,
            recommendations: [],
            errors: []
        };
    }

    /**
     * Main validation function
     */
    async validateTLS(domain) {
        console.log(`🔒 Starting TLS validation for: ${domain}`);
        this.results.domain = domain;

        try {
            // Test TLS version support
            await this.testTLSVersions(domain);
            
            // Analyze cipher suites
            await this.analyzeCipherSuites(domain);
            
            // Check for weak configurations
            this.checkWeakConfigurations();
            
            // Validate Perfect Forward Secrecy
            this.validatePerfectForwardSecrecy();
            
            // Calculate security score
            this.calculateSecurityScore();
            
            // Generate recommendations
            this.generateRecommendations();
            
            // Save results
            this.saveResults();
            
            console.log(`✅ TLS validation completed for ${domain}`);
            this.printSummary();
            
        } catch (error) {
            console.error(`❌ TLS validation failed: ${error.message}`);
            this.results.errors.push(error.message);
            throw error;
        }
    }

    /**
     * Test TLS version support
     */
    async testTLSVersions(domain) {
        console.log('📋 Testing TLS version support...');
        
        const tlsVersions = [
            { name: 'TLSv1.0', version: 'TLSv1', secure: false },
            { name: 'TLSv1.1', version: 'TLSv1_1', secure: false },
            { name: 'TLSv1.2', version: 'TLSv1_2', secure: true },
            { name: 'TLSv1.3', version: 'TLSv1_3', secure: true }
        ];

        for (const tlsVersion of tlsVersions) {
            try {
                const supported = await this.testTLSVersion(domain, tlsVersion.version);
                this.results.tlsVersions[tlsVersion.name] = {
                    supported,
                    secure: tlsVersion.secure,
                    recommended: tlsVersion.secure
                };
                
                console.log(`  ${supported ? '✅' : '❌'} ${tlsVersion.name}: ${supported ? 'Supported' : 'Not supported'}`);
            } catch (error) {
                this.results.tlsVersions[tlsVersion.name] = {
                    supported: false,
                    secure: tlsVersion.secure,
                    error: error.message
                };
                console.log(`  ❌ ${tlsVersion.name}: Error - ${error.message}`);
            }
        }
    }

    /**
     * Test individual TLS version
     */
    testTLSVersion(domain, version) {
        return new Promise((resolve, reject) => {
            // Map TLS versions to Node.js constants
            const versionMap = {
                'TLSv1': 'TLSv1_method',
                'TLSv1_1': 'TLSv1_1_method',
                'TLSv1_2': 'TLSv1_2_method',
                'TLSv1_3': 'TLS_method' // Use generic TLS method for 1.3
            };

            const secureProtocol = versionMap[version] || `${version}_method`;
            
            const options = {
                hostname: domain,
                port: 443,
                secureProtocol: secureProtocol,
                rejectUnauthorized: false,
                timeout: 5000
            };

            // For TLS 1.3, we need to set min/max version
            if (version === 'TLSv1_3') {
                options.minVersion = 'TLSv1.3';
                options.maxVersion = 'TLSv1.3';
            } else if (version === 'TLSv1_2') {
                options.minVersion = 'TLSv1.2';
                options.maxVersion = 'TLSv1.2';
            } else if (version === 'TLSv1_1') {
                options.minVersion = 'TLSv1.1';
                options.maxVersion = 'TLSv1.1';
            } else if (version === 'TLSv1') {
                options.minVersion = 'TLSv1';
                options.maxVersion = 'TLSv1';
            }

            const socket = tls.connect(options, () => {
                const actualProtocol = socket.getProtocol();
                socket.destroy();
                
                // Check if the actual protocol matches what we requested
                const protocolMatch = this.checkProtocolMatch(version, actualProtocol);
                resolve(protocolMatch);
            });

            socket.on('error', (error) => {
                socket.destroy();
                resolve(false);
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });

            setTimeout(() => {
                if (!socket.destroyed) {
                    socket.destroy();
                    resolve(false);
                }
            }, 5000);
        });
    }

    /**
     * Check if the actual protocol matches the requested version
     */
    checkProtocolMatch(requestedVersion, actualProtocol) {
        const versionMapping = {
            'TLSv1': 'TLSv1',
            'TLSv1_1': 'TLSv1.1',
            'TLSv1_2': 'TLSv1.2',
            'TLSv1_3': 'TLSv1.3'
        };

        const expectedProtocol = versionMapping[requestedVersion];
        return actualProtocol === expectedProtocol;
    }

    /**
     * Analyze cipher suites
     */
    async analyzeCipherSuites(domain) {
        console.log('🔐 Analyzing cipher suites...');
        
        try {
            const cipherInfo = await this.getCipherSuites(domain);
            this.results.cipherSuites = cipherInfo.ciphers;
            
            // Analyze cipher strength
            this.analyzeCipherStrength(cipherInfo.ciphers);
            
            console.log(`  📊 Found ${cipherInfo.ciphers.length} cipher suites`);
            
        } catch (error) {
            console.error(`  ❌ Failed to analyze cipher suites: ${error.message}`);
            this.results.errors.push(`Cipher analysis failed: ${error.message}`);
        }
    }

    /**
     * Get cipher suites and connection information
     */
    getCipherSuites(domain) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: domain,
                port: 443,
                rejectUnauthorized: false,
                timeout: 10000
            };

            const socket = tls.connect(options, () => {
                try {
                    const cipher = socket.getCipher();
                    const protocol = socket.getProtocol();
                    const peerCertificate = socket.getPeerCertificate(false);
                    const ephemeralKeyInfo = socket.getEphemeralKeyInfo();
                    
                    // Store ephemeral key info for PFS validation
                    this.ephemeralKeyInfo = ephemeralKeyInfo;
                    
                    socket.destroy();
                    
                    resolve({
                        ciphers: cipher ? [cipher] : [],
                        protocol,
                        certificate: peerCertificate,
                        ephemeralKeyInfo
                    });
                } catch (error) {
                    socket.destroy();
                    reject(new Error(`Failed to get cipher information: ${error.message}`));
                }
            });

            socket.on('error', (error) => {
                socket.destroy();
                reject(new Error(`Connection failed: ${error.message}`));
            });

            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error('Connection timeout'));
            });

            setTimeout(() => {
                if (!socket.destroyed) {
                    socket.destroy();
                    reject(new Error('Connection timeout after 10 seconds'));
                }
            }, 10000);
        });
    }

    /**
     * Analyze cipher strength
     */
    analyzeCipherStrength(ciphers) {
        const weakCiphers = [
            'RC4', 'DES', '3DES', 'MD5', 'SHA1',
            'NULL', 'EXPORT', 'anon'
        ];

        const strongCiphers = [
            'AES256', 'AES128', 'CHACHA20',
            'ECDHE', 'DHE', 'SHA256', 'SHA384'
        ];

        ciphers.forEach(cipher => {
            const cipherName = cipher.name || cipher;
            let strength = 'medium';
            let isWeak = false;

            // Check for weak ciphers
            for (const weak of weakCiphers) {
                if (cipherName.toUpperCase().includes(weak)) {
                    strength = 'weak';
                    isWeak = true;
                    this.results.weakCiphers.push({
                        name: cipherName,
                        reason: `Contains weak algorithm: ${weak}`
                    });
                    break;
                }
            }

            // Check for strong ciphers
            if (!isWeak) {
                for (const strong of strongCiphers) {
                    if (cipherName.toUpperCase().includes(strong)) {
                        strength = 'strong';
                        break;
                    }
                }
            }

            cipher.strength = strength;
        });
    }

    /**
     * Check for weak configurations
     */
    checkWeakConfigurations() {
        console.log('⚠️  Checking for weak configurations...');
        
        // Check if weak TLS versions are supported
        const weakTLSVersions = ['TLSv1.0', 'TLSv1.1'];
        weakTLSVersions.forEach(version => {
            if (this.results.tlsVersions[version]?.supported) {
                this.results.recommendations.push({
                    type: 'security',
                    severity: 'high',
                    message: `Disable ${version} support - it's considered insecure`,
                    action: `Configure CloudFront to use minimum TLS version 1.2`
                });
            }
        });

        // Check if strong TLS versions are supported
        if (!this.results.tlsVersions['TLSv1.2']?.supported) {
            this.results.recommendations.push({
                type: 'security',
                severity: 'critical',
                message: 'TLS 1.2 is not supported - this is a critical security issue',
                action: 'Enable TLS 1.2 support immediately'
            });
        }

        if (!this.results.tlsVersions['TLSv1.3']?.supported) {
            this.results.recommendations.push({
                type: 'security',
                severity: 'medium',
                message: 'TLS 1.3 is not supported - consider enabling for better security',
                action: 'Enable TLS 1.3 support for enhanced security and performance'
            });
        }

        // Check for weak ciphers
        if (this.results.weakCiphers.length > 0) {
            this.results.recommendations.push({
                type: 'security',
                severity: 'high',
                message: `Found ${this.results.weakCiphers.length} weak cipher suites`,
                action: 'Disable weak cipher suites and use only strong, modern ciphers'
            });
        }
    }

    /**
     * Validate Perfect Forward Secrecy
     */
    validatePerfectForwardSecrecy() {
        console.log('🔄 Validating Perfect Forward Secrecy...');
        
        const pfsKeyExchanges = ['ECDHE', 'DHE'];
        let hasPFS = false;
        let pfsDetails = [];

        // Check cipher suites for PFS algorithms
        this.results.cipherSuites.forEach(cipher => {
            const cipherName = cipher.name || cipher;
            for (const pfsAlgo of pfsKeyExchanges) {
                if (cipherName.toUpperCase().includes(pfsAlgo)) {
                    hasPFS = true;
                    pfsDetails.push({
                        cipher: cipherName,
                        keyExchange: pfsAlgo
                    });
                    break;
                }
            }
        });

        // Also check ephemeral key info if available
        if (this.ephemeralKeyInfo) {
            if (this.ephemeralKeyInfo.type === 'ECDH' || this.ephemeralKeyInfo.type === 'DH') {
                hasPFS = true;
                pfsDetails.push({
                    type: 'ephemeral',
                    keyType: this.ephemeralKeyInfo.type,
                    size: this.ephemeralKeyInfo.size
                });
            }
        }

        this.results.perfectForwardSecrecy = hasPFS;
        this.results.pfsDetails = pfsDetails;

        if (!hasPFS) {
            this.results.recommendations.push({
                type: 'security',
                severity: 'medium',
                message: 'Perfect Forward Secrecy not detected',
                action: 'Configure cipher suites that support ECDHE or DHE key exchange'
            });
        }

        console.log(`  ${hasPFS ? '✅' : '❌'} Perfect Forward Secrecy: ${hasPFS ? 'Supported' : 'Not detected'}`);
        
        if (hasPFS && pfsDetails.length > 0) {
            console.log(`    Details: ${pfsDetails.map(d => d.cipher || `${d.keyType} ${d.size}-bit`).join(', ')}`);
        }
    }

    /**
     * Calculate security score
     */
    calculateSecurityScore() {
        let score = 0;
        let maxScore = 100;

        // TLS version scoring (40 points)
        if (this.results.tlsVersions['TLSv1.3']?.supported) score += 20;
        if (this.results.tlsVersions['TLSv1.2']?.supported) score += 20;
        if (this.results.tlsVersions['TLSv1.1']?.supported) score -= 10;
        if (this.results.tlsVersions['TLSv1.0']?.supported) score -= 20;

        // Cipher suite scoring (30 points)
        const strongCiphers = this.results.cipherSuites.filter(c => c.strength === 'strong').length;
        const totalCiphers = this.results.cipherSuites.length;
        if (totalCiphers > 0) {
            score += Math.round((strongCiphers / totalCiphers) * 30);
        }

        // Weak cipher penalty (20 points)
        score -= Math.min(this.results.weakCiphers.length * 5, 20);

        // Perfect Forward Secrecy (10 points)
        if (this.results.perfectForwardSecrecy) score += 10;

        this.results.securityScore = Math.max(0, Math.min(score, maxScore));
    }

    /**
     * Generate recommendations
     */
    generateRecommendations() {
        // Add general recommendations based on score
        if (this.results.securityScore < 70) {
            this.results.recommendations.unshift({
                type: 'general',
                severity: 'high',
                message: `Security score is low (${this.results.securityScore}/100)`,
                action: 'Review and implement the security recommendations below'
            });
        }

        // Add CloudFront specific recommendations
        this.results.recommendations.push({
            type: 'cloudfront',
            severity: 'info',
            message: 'CloudFront TLS configuration recommendations',
            action: 'Set Security Policy to TLSv1.2_2021 or newer in CloudFront distribution settings'
        });
    }

    /**
     * Save results to file
     */
    saveResults() {
        const resultsDir = path.join(process.cwd(), 'config');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const resultsFile = path.join(resultsDir, 'tls-validation-report.json');
        fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
        
        console.log(`📄 Results saved to: ${resultsFile}`);
    }

    /**
     * Print summary
     */
    printSummary() {
        console.log('\n📊 TLS Validation Summary');
        console.log('========================');
        console.log(`Domain: ${this.results.domain}`);
        console.log(`Security Score: ${this.results.securityScore}/100`);
        console.log(`Perfect Forward Secrecy: ${this.results.perfectForwardSecrecy ? 'Yes' : 'No'}`);
        console.log(`Weak Ciphers Found: ${this.results.weakCiphers.length}`);
        
        console.log('\nTLS Version Support:');
        Object.entries(this.results.tlsVersions).forEach(([version, info]) => {
            const status = info.supported ? '✅' : '❌';
            const security = info.secure ? '(Secure)' : '(Insecure)';
            console.log(`  ${status} ${version} ${security}`);
        });

        if (this.results.recommendations.length > 0) {
            console.log('\n⚠️  Recommendations:');
            this.results.recommendations.forEach((rec, index) => {
                const severity = rec.severity.toUpperCase();
                console.log(`  ${index + 1}. [${severity}] ${rec.message}`);
                console.log(`     Action: ${rec.action}`);
            });
        }

        if (this.results.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.results.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
    }
}

/**
 * CLI interface
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node tls-validation-suite.js <domain>');
        console.log('Example: node tls-validation-suite.js example.cloudfront.net');
        process.exit(1);
    }

    const domain = args[0];
    const validator = new TLSValidator();
    
    try {
        await validator.validateTLS(domain);
        process.exit(0);
    } catch (error) {
        console.error(`❌ Validation failed: ${error.message}`);
        process.exit(1);
    }
}

// Export for testing
module.exports = { TLSValidator };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}