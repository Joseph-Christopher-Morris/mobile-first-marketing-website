#!/usr/bin/env node

/**
 * Comprehensive TLS Validation Report Generator
 * 
 * Task 7.5.4: Create comprehensive TLS validation report
 * - Generate detailed TLS configuration report
 * - Document all supported protocols and ciphers
 * - Create security recommendations
 * - Implement automated TLS validation testing
 * 
 * Requirements: 7.5
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveTLSReportGenerator {
    constructor(options = {}) {
        this.options = {
            domain: options.domain || this.getDefaultDomain(),
            outputDir: options.outputDir || path.join(process.cwd(), 'config'),
            includeTests: options.includeTests !== false,
            generateHTML: options.generateHTML !== false,
            ...options
        };
        
        this.report = {
            metadata: {
                title: 'Comprehensive TLS Validation Report',
                domain: this.options.domain,
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                generatedBy: 'Comprehensive TLS Validation Report Generator'
            },
            executiveSummary: {},
            tlsConfiguration: {},
            securityAssessment: {},
            complianceAnalysis: {},
            recommendations: [],
            technicalDetails: {},
            testResults: {},
            appendices: {}
        };
        
        this.loadConfiguration();
    }

    /**
     * Load TLS security configuration
     */
    loadConfiguration() {
        try {
            const configPath = path.join(this.options.outputDir, 'tls-security-config.json');
            this.securityConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.warn(`⚠️  Could not load TLS security config: ${error.message}`);
            this.securityConfig = this.getDefaultSecurityConfig();
        }
    }

    /**
     * Get default domain from CloudFront configuration
     */
    getDefaultDomain() {
        try {
            const configPath = path.join(process.cwd(), 'config', 'cloudfront-s3-config.json');
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                return config.distributionDomainName || config.domainName || 'example.cloudfront.net';
            }
        } catch (error) {
            console.log('⚠️  Could not read CloudFront config, using default domain');
        }
        return 'example.cloudfront.net';
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
            },
            compliance: {
                standards: ["PCI DSS", "NIST", "OWASP"]
            }
        };
    }

    /**
     * Generate comprehensive TLS validation report
     */
    async generateReport() {
        console.log(`🔍 Generating Comprehensive TLS Validation Report`);
        console.log(`🌐 Domain: ${this.options.domain}`);
        console.log(`📁 Output Directory: ${this.options.outputDir}`);
        console.log(`⏰ Timestamp: ${this.report.metadata.timestamp}`);

        try {
            // Ensure output directory exists
            if (!fs.existsSync(this.options.outputDir)) {
                fs.mkdirSync(this.options.outputDir, { recursive: true });
            }

            // Step 1: Run comprehensive TLS validation
            console.log(`\n📋 Step 1: Running comprehensive TLS validation...`);
            await this.runTLSValidation();

            // Step 2: Run TLS version and cipher validation
            console.log(`\n📋 Step 2: Running TLS version and cipher validation...`);
            await this.runTLSVersionValidation();

            // Step 3: Run Perfect Forward Secrecy validation
            console.log(`\n📋 Step 3: Running Perfect Forward Secrecy validation...`);
            await this.runPFSValidation();

            // Step 4: Run cipher suite validation
            console.log(`\n📋 Step 4: Running cipher suite validation...`);
            await this.runCipherSuiteValidation();

            // Step 5: Generate executive summary
            console.log(`\n📋 Step 5: Generating executive summary...`);
            this.generateExecutiveSummary();

            // Step 6: Analyze TLS configuration
            console.log(`\n📋 Step 6: Analyzing TLS configuration...`);
            this.analyzeTLSConfiguration();

            // Step 7: Perform security assessment
            console.log(`\n📋 Step 7: Performing security assessment...`);
            this.performSecurityAssessment();

            // Step 8: Analyze compliance
            console.log(`\n📋 Step 8: Analyzing compliance...`);
            this.analyzeCompliance();

            // Step 9: Generate recommendations
            console.log(`\n📋 Step 9: Generating recommendations...`);
            this.generateRecommendations();

            // Step 10: Compile technical details
            console.log(`\n📋 Step 10: Compiling technical details...`);
            this.compileTechnicalDetails();

            // Step 11: Run automated tests (if enabled)
            if (this.options.includeTests) {
                console.log(`\n📋 Step 11: Running automated tests...`);
                await this.runAutomatedTests();
            }

            // Step 12: Generate appendices
            console.log(`\n📋 Step 12: Generating appendices...`);
            this.generateAppendices();

            // Step 13: Save reports
            console.log(`\n📋 Step 13: Saving reports...`);
            await this.saveReports();

            console.log(`\n✅ Comprehensive TLS validation report generated successfully`);
            this.printReportSummary();

            return this.report;

        } catch (error) {
            console.error(`\n❌ Report generation failed: ${error.message}`);
            this.report.error = error.message;
            throw error;
        }
    }

    /**
     * Run comprehensive TLS validation
     */
    async runTLSValidation() {
        try {
            const validatorPath = path.join(__dirname, 'comprehensive-tls-validator.js');
            if (fs.existsSync(validatorPath)) {
                const command = `node "${validatorPath}" "${this.options.domain}" --output "${path.join(this.options.outputDir, 'comprehensive-tls-validation.json')}"`;
                const output = execSync(command, { encoding: 'utf8', timeout: 30000 });
                console.log('  ✅ Comprehensive TLS validation completed');
                
                // Load results
                const resultsPath = path.join(this.options.outputDir, 'comprehensive-tls-validation.json');
                if (fs.existsSync(resultsPath)) {
                    this.report.technicalDetails.comprehensiveValidation = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
                }
            } else {
                console.log('  ⚠️  Comprehensive TLS validator not found, skipping');
            }
        } catch (error) {
            console.log(`  ❌ Comprehensive TLS validation failed: ${error.message}`);
            this.report.technicalDetails.comprehensiveValidation = { error: error.message };
        }
    }

    /**
     * Run TLS version validation
     */
    async runTLSVersionValidation() {
        try {
            const validatorPath = path.join(__dirname, 'tls-version-cipher-validator.js');
            if (fs.existsSync(validatorPath)) {
                const command = `node "${validatorPath}" "${this.options.domain}"`;
                const output = execSync(command, { encoding: 'utf8', timeout: 20000 });
                console.log('  ✅ TLS version validation completed');
                
                // Load results
                const resultsPath = path.join(this.options.outputDir, 'tls-version-cipher-validation-report.json');
                if (fs.existsSync(resultsPath)) {
                    this.report.technicalDetails.tlsVersionValidation = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
                }
            } else {
                console.log('  ⚠️  TLS version validator not found, skipping');
            }
        } catch (error) {
            console.log(`  ❌ TLS version validation failed: ${error.message}`);
            this.report.technicalDetails.tlsVersionValidation = { error: error.message };
        }
    }

    /**
     * Run Perfect Forward Secrecy validation
     */
    async runPFSValidation() {
        try {
            const validatorPath = path.join(__dirname, 'comprehensive-pfs-validator.js');
            if (fs.existsSync(validatorPath)) {
                const command = `node "${validatorPath}" "${this.options.domain}"`;
                const output = execSync(command, { encoding: 'utf8', timeout: 20000 });
                console.log('  ✅ Perfect Forward Secrecy validation completed');
                
                // Load results
                const resultsPath = path.join(this.options.outputDir, 'pfs-validation-report.json');
                if (fs.existsSync(resultsPath)) {
                    this.report.technicalDetails.pfsValidation = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
                }
            } else {
                console.log('  ⚠️  PFS validator not found, skipping');
            }
        } catch (error) {
            console.log(`  ❌ PFS validation failed: ${error.message}`);
            this.report.technicalDetails.pfsValidation = { error: error.message };
        }
    }

    /**
     * Run cipher suite validation
     */
    async runCipherSuiteValidation() {
        try {
            const validatorPath = path.join(__dirname, 'cipher-suite-configuration-validator.js');
            if (fs.existsSync(validatorPath)) {
                const command = `node "${validatorPath}" "${this.options.domain}"`;
                const output = execSync(command, { encoding: 'utf8', timeout: 20000 });
                console.log('  ✅ Cipher suite validation completed');
                
                // Load results
                const resultsPath = path.join(this.options.outputDir, 'cipher-suite-validation-report.json');
                if (fs.existsSync(resultsPath)) {
                    this.report.technicalDetails.cipherSuiteValidation = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
                }
            } else {
                console.log('  ⚠️  Cipher suite validator not found, skipping');
            }
        } catch (error) {
            console.log(`  ❌ Cipher suite validation failed: ${error.message}`);
            this.report.technicalDetails.cipherSuiteValidation = { error: error.message };
        }
    }

    /**
     * Generate executive summary
     */
    generateExecutiveSummary() {
        const summary = {
            overallSecurityRating: 'UNKNOWN',
            keyFindings: [],
            criticalIssues: [],
            recommendations: [],
            complianceStatus: {},
            riskLevel: 'UNKNOWN'
        };

        // Analyze comprehensive validation results
        const comprehensiveResults = this.report.technicalDetails.comprehensiveValidation;
        if (comprehensiveResults && !comprehensiveResults.error) {
            const overallScore = comprehensiveResults.securityAssessment?.overall?.overallScore || 0;
            const grade = comprehensiveResults.securityAssessment?.overall?.grade || 'F';
            
            summary.overallSecurityRating = grade;
            summary.keyFindings.push(`Overall TLS security score: ${overallScore}/100 (Grade: ${grade})`);
            
            // Determine risk level
            if (overallScore >= 90) {
                summary.riskLevel = 'LOW';
            } else if (overallScore >= 70) {
                summary.riskLevel = 'MEDIUM';
            } else if (overallScore >= 50) {
                summary.riskLevel = 'HIGH';
            } else {
                summary.riskLevel = 'CRITICAL';
            }

            // Extract critical issues
            if (comprehensiveResults.recommendations) {
                summary.criticalIssues = comprehensiveResults.recommendations
                    .filter(rec => rec.includes('CRITICAL'))
                    .slice(0, 5); // Top 5 critical issues
            }

            // TLS version findings
            if (comprehensiveResults.tlsVersionSupport) {
                const tls12Supported = comprehensiveResults.tlsVersionSupport['TLS 1.2']?.supported;
                const tls13Supported = comprehensiveResults.tlsVersionSupport['TLS 1.3']?.supported;
                const weakTLSSupported = comprehensiveResults.tlsVersionSupport['TLS 1.0']?.supported || 
                                       comprehensiveResults.tlsVersionSupport['TLS 1.1']?.supported;

                if (tls12Supported) {
                    summary.keyFindings.push('✅ TLS 1.2 is supported');
                } else {
                    summary.criticalIssues.push('❌ TLS 1.2 is not supported');
                }

                if (tls13Supported) {
                    summary.keyFindings.push('✅ TLS 1.3 is supported');
                } else {
                    summary.keyFindings.push('⚠️  TLS 1.3 is not supported');
                }

                if (weakTLSSupported) {
                    summary.criticalIssues.push('❌ Weak TLS versions (1.0/1.1) are enabled');
                }
            }

            // Perfect Forward Secrecy findings
            if (comprehensiveResults.securityAssessment?.perfectForwardSecrecy?.supported) {
                summary.keyFindings.push('✅ Perfect Forward Secrecy is supported');
            } else {
                summary.criticalIssues.push('❌ Perfect Forward Secrecy is not supported');
            }

            // Cipher suite findings
            const cipherLevel = comprehensiveResults.cipherSuiteAnalysis?.securityLevel;
            if (cipherLevel === 'HIGH') {
                summary.keyFindings.push('✅ Strong cipher suites are configured');
            } else if (cipherLevel === 'MEDIUM') {
                summary.keyFindings.push('⚠️  Cipher suite security level is medium');
            } else {
                summary.criticalIssues.push('❌ Weak cipher suites detected');
            }
        }

        // Generate top recommendations
        summary.recommendations = [
            'Ensure TLS 1.2 and 1.3 are enabled',
            'Disable weak TLS versions (1.0, 1.1)',
            'Configure Perfect Forward Secrecy cipher suites',
            'Use strong encryption algorithms (AES-256, ChaCha20)',
            'Implement comprehensive security headers'
        ].slice(0, 5);

        this.report.executiveSummary = summary;
    }

    /**
     * Analyze TLS configuration
     */
    analyzeTLSConfiguration() {
        const config = {
            supportedProtocols: {},
            cipherSuites: {},
            securityFeatures: {},
            configuration: {}
        };

        // Analyze supported protocols
        const comprehensiveResults = this.report.technicalDetails.comprehensiveValidation;
        if (comprehensiveResults && comprehensiveResults.tlsVersionSupport) {
            config.supportedProtocols = comprehensiveResults.tlsVersionSupport;
        }

        // Analyze cipher suites
        if (comprehensiveResults && comprehensiveResults.cipherSuiteAnalysis) {
            config.cipherSuites = comprehensiveResults.cipherSuiteAnalysis;
        }

        // Analyze security features
        config.securityFeatures = {
            perfectForwardSecrecy: comprehensiveResults?.securityAssessment?.perfectForwardSecrecy?.supported || false,
            strongEncryption: comprehensiveResults?.cipherSuiteAnalysis?.strongEncryption || false,
            modernProtocols: comprehensiveResults?.tlsVersionSupport?.['TLS 1.3']?.supported || false
        };

        // CloudFront configuration
        config.configuration = {
            platform: 'AWS CloudFront',
            recommendedSecurityPolicy: this.securityConfig.cloudfront?.securityPolicy || 'TLSv1.2_2021',
            currentConfiguration: 'To be determined from CloudFront distribution settings'
        };

        this.report.tlsConfiguration = config;
    }

    /**
     * Perform security assessment
     */
    performSecurityAssessment() {
        const assessment = {
            overallScore: 0,
            categoryScores: {},
            vulnerabilities: [],
            strengths: [],
            riskFactors: []
        };

        const comprehensiveResults = this.report.technicalDetails.comprehensiveValidation;
        if (comprehensiveResults && comprehensiveResults.securityAssessment?.overall) {
            assessment.overallScore = comprehensiveResults.securityAssessment.overall.overallScore;
            assessment.categoryScores = comprehensiveResults.securityAssessment.overall.categories;
        }

        // Identify vulnerabilities
        if (comprehensiveResults && comprehensiveResults.recommendations) {
            assessment.vulnerabilities = comprehensiveResults.recommendations
                .filter(rec => rec.includes('CRITICAL') || rec.includes('HIGH'))
                .map(rec => ({
                    severity: rec.includes('CRITICAL') ? 'CRITICAL' : 'HIGH',
                    description: rec,
                    impact: this.getVulnerabilityImpact(rec)
                }));
        }

        // Identify strengths
        if (comprehensiveResults) {
            if (comprehensiveResults.tlsVersionSupport?.['TLS 1.2']?.supported) {
                assessment.strengths.push('TLS 1.2 support enabled');
            }
            if (comprehensiveResults.tlsVersionSupport?.['TLS 1.3']?.supported) {
                assessment.strengths.push('TLS 1.3 support enabled');
            }
            if (comprehensiveResults.securityAssessment?.perfectForwardSecrecy?.supported) {
                assessment.strengths.push('Perfect Forward Secrecy implemented');
            }
            if (comprehensiveResults.cipherSuiteAnalysis?.securityLevel === 'HIGH') {
                assessment.strengths.push('Strong cipher suites configured');
            }
        }

        // Identify risk factors
        assessment.riskFactors = this.identifyRiskFactors(comprehensiveResults);

        this.report.securityAssessment = assessment;
    }

    /**
     * Get vulnerability impact description
     */
    getVulnerabilityImpact(vulnerability) {
        if (vulnerability.includes('TLS 1.0') || vulnerability.includes('TLS 1.1')) {
            return 'Weak TLS versions are vulnerable to downgrade attacks and cryptographic weaknesses';
        }
        if (vulnerability.includes('Perfect Forward Secrecy')) {
            return 'Without PFS, past communications could be decrypted if private keys are compromised';
        }
        if (vulnerability.includes('cipher')) {
            return 'Weak cipher suites are vulnerable to cryptographic attacks';
        }
        return 'Security vulnerability that should be addressed';
    }

    /**
     * Identify risk factors
     */
    identifyRiskFactors(results) {
        const riskFactors = [];

        if (!results) return riskFactors;

        // Protocol risks
        if (results.tlsVersionSupport?.['TLS 1.0']?.supported) {
            riskFactors.push({
                category: 'Protocol',
                risk: 'TLS 1.0 enabled',
                severity: 'HIGH',
                description: 'TLS 1.0 has known vulnerabilities and should be disabled'
            });
        }

        if (results.tlsVersionSupport?.['TLS 1.1']?.supported) {
            riskFactors.push({
                category: 'Protocol',
                risk: 'TLS 1.1 enabled',
                severity: 'HIGH',
                description: 'TLS 1.1 has known vulnerabilities and should be disabled'
            });
        }

        // Cipher risks
        if (results.cipherSuiteAnalysis?.securityLevel === 'LOW') {
            riskFactors.push({
                category: 'Encryption',
                risk: 'Weak cipher suites',
                severity: 'HIGH',
                description: 'Weak cipher suites are vulnerable to cryptographic attacks'
            });
        }

        // PFS risks
        if (!results.securityAssessment?.perfectForwardSecrecy?.supported) {
            riskFactors.push({
                category: 'Key Exchange',
                risk: 'No Perfect Forward Secrecy',
                severity: 'MEDIUM',
                description: 'Without PFS, past communications could be decrypted if keys are compromised'
            });
        }

        return riskFactors;
    }

    /**
     * Analyze compliance
     */
    analyzeCompliance() {
        const compliance = {
            standards: {},
            overallCompliance: 'UNKNOWN',
            gaps: [],
            requirements: {}
        };

        const comprehensiveResults = this.report.technicalDetails.comprehensiveValidation;
        if (comprehensiveResults && comprehensiveResults.complianceCheck) {
            compliance.standards = comprehensiveResults.complianceCheck;
            
            // Calculate overall compliance
            const compliantStandards = Object.values(comprehensiveResults.complianceCheck)
                .filter(standard => standard === true).length;
            const totalStandards = Object.keys(comprehensiveResults.complianceCheck).length;
            
            if (compliantStandards === totalStandards) {
                compliance.overallCompliance = 'COMPLIANT';
            } else if (compliantStandards > 0) {
                compliance.overallCompliance = 'PARTIALLY_COMPLIANT';
            } else {
                compliance.overallCompliance = 'NON_COMPLIANT';
            }

            // Identify gaps
            Object.entries(comprehensiveResults.complianceCheck).forEach(([standard, compliant]) => {
                if (!compliant) {
                    compliance.gaps.push({
                        standard: standard,
                        description: this.getComplianceGapDescription(standard),
                        remediation: this.getComplianceRemediation(standard)
                    });
                }
            });
        }

        // Add detailed requirements
        compliance.requirements = {
            'PCI DSS': {
                description: 'Payment Card Industry Data Security Standard',
                requirements: [
                    'Use TLS 1.2 or higher',
                    'Disable weak TLS versions',
                    'Use strong encryption algorithms',
                    'Regular security testing'
                ]
            },
            'NIST': {
                description: 'National Institute of Standards and Technology',
                requirements: [
                    'Use approved cryptographic algorithms',
                    'Implement Perfect Forward Secrecy',
                    'Regular certificate validation',
                    'Proper key management'
                ]
            },
            'OWASP': {
                description: 'Open Web Application Security Project',
                requirements: [
                    'Use secure TLS configurations',
                    'Disable weak protocols and ciphers',
                    'Implement security headers',
                    'Regular vulnerability testing'
                ]
            }
        };

        this.report.complianceAnalysis = compliance;
    }

    /**
     * Get compliance gap description
     */
    getComplianceGapDescription(standard) {
        const descriptions = {
            'PCI DSS': 'TLS configuration does not meet PCI DSS requirements for secure payment processing',
            'NIST': 'TLS configuration does not align with NIST cybersecurity framework guidelines',
            'OWASP': 'TLS configuration does not follow OWASP secure configuration recommendations'
        };
        return descriptions[standard] || `${standard} compliance requirements not met`;
    }

    /**
     * Get compliance remediation steps
     */
    getComplianceRemediation(standard) {
        const remediations = {
            'PCI DSS': 'Enable TLS 1.2+, disable weak TLS versions, use strong encryption',
            'NIST': 'Implement approved algorithms, enable PFS, validate certificates',
            'OWASP': 'Use secure defaults, disable weak protocols, implement security headers'
        };
        return remediations[standard] || `Review ${standard} requirements and implement necessary changes`;
    }

    /**
     * Generate comprehensive recommendations
     */
    generateRecommendations() {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            monitoring: []
        };

        // Immediate actions (critical security issues)
        if (this.report.executiveSummary.criticalIssues.length > 0) {
            recommendations.immediate = this.report.executiveSummary.criticalIssues.map(issue => ({
                priority: 'CRITICAL',
                action: issue,
                timeline: 'Immediate',
                effort: 'High'
            }));
        }

        // Short-term improvements
        recommendations.shortTerm = [
            {
                priority: 'HIGH',
                action: 'Enable TLS 1.3 support for enhanced security and performance',
                timeline: '1-2 weeks',
                effort: 'Medium'
            },
            {
                priority: 'HIGH',
                action: 'Implement comprehensive security headers',
                timeline: '1 week',
                effort: 'Low'
            },
            {
                priority: 'MEDIUM',
                action: 'Configure Perfect Forward Secrecy cipher suites',
                timeline: '2-3 weeks',
                effort: 'Medium'
            }
        ];

        // Long-term improvements
        recommendations.longTerm = [
            {
                priority: 'MEDIUM',
                action: 'Implement automated TLS configuration monitoring',
                timeline: '1-2 months',
                effort: 'High'
            },
            {
                priority: 'LOW',
                action: 'Set up regular security assessments and penetration testing',
                timeline: '2-3 months',
                effort: 'High'
            },
            {
                priority: 'LOW',
                action: 'Develop incident response procedures for TLS vulnerabilities',
                timeline: '1-2 months',
                effort: 'Medium'
            }
        ];

        // Monitoring recommendations
        recommendations.monitoring = [
            {
                priority: 'HIGH',
                action: 'Monitor TLS certificate expiration dates',
                timeline: 'Ongoing',
                effort: 'Low'
            },
            {
                priority: 'MEDIUM',
                action: 'Track TLS security score and compliance status',
                timeline: 'Ongoing',
                effort: 'Medium'
            },
            {
                priority: 'MEDIUM',
                action: 'Monitor for new TLS vulnerabilities and updates',
                timeline: 'Ongoing',
                effort: 'Low'
            }
        ];

        this.report.recommendations = recommendations;
    }

    /**
     * Compile technical details
     */
    compileTechnicalDetails() {
        // Technical details are already populated by individual validation steps
        // Add summary information
        this.report.technicalDetails.summary = {
            validationSteps: Object.keys(this.report.technicalDetails).length,
            dataCollected: new Date().toISOString(),
            validationTools: [
                'Comprehensive TLS Validator',
                'TLS Version Cipher Validator',
                'Perfect Forward Secrecy Validator',
                'Cipher Suite Configuration Validator'
            ]
        };
    }

    /**
     * Run automated tests
     */
    async runAutomatedTests() {
        try {
            const testResults = {
                timestamp: new Date().toISOString(),
                tests: [],
                summary: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    warnings: 0
                }
            };

            // Run TLS validation tests
            const testPath = path.join(__dirname, 'test-tls-validation.js');
            if (fs.existsSync(testPath)) {
                const command = `node "${testPath}"`;
                const output = execSync(command, { encoding: 'utf8', timeout: 30000 });
                console.log('  ✅ Automated TLS validation tests completed');
                
                // Load test results
                const testResultsPath = path.join(this.options.outputDir, 'tls-validation-test-results.json');
                if (fs.existsSync(testResultsPath)) {
                    const loadedResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
                    testResults.tests = loadedResults.tests || [];
                    testResults.summary = loadedResults.summary || testResults.summary;
                }
            } else {
                console.log('  ⚠️  TLS validation tests not found, skipping');
            }

            this.report.testResults = testResults;

        } catch (error) {
            console.log(`  ❌ Automated tests failed: ${error.message}`);
            this.report.testResults = { error: error.message };
        }
    }

    /**
     * Generate appendices
     */
    generateAppendices() {
        this.report.appendices = {
            glossary: this.generateGlossary(),
            references: this.generateReferences(),
            configuration: this.securityConfig,
            rawData: {
                note: 'Raw validation data is available in the technicalDetails section',
                files: [
                    'comprehensive-tls-validation.json',
                    'tls-version-cipher-validation-report.json',
                    'pfs-validation-report.json',
                    'cipher-suite-validation-report.json'
                ]
            }
        };
    }

    /**
     * Generate glossary
     */
    generateGlossary() {
        return {
            'TLS': 'Transport Layer Security - A cryptographic protocol for secure communication',
            'SSL': 'Secure Sockets Layer - Predecessor to TLS, now deprecated',
            'PFS': 'Perfect Forward Secrecy - Ensures past communications remain secure even if private keys are compromised',
            'Cipher Suite': 'A set of algorithms that help secure a network connection',
            'ECDHE': 'Elliptic Curve Diffie-Hellman Ephemeral - Key exchange algorithm that provides PFS',
            'AES': 'Advanced Encryption Standard - Symmetric encryption algorithm',
            'SHA': 'Secure Hash Algorithm - Cryptographic hash function',
            'CloudFront': 'AWS Content Delivery Network service',
            'OAC': 'Origin Access Control - AWS CloudFront security feature'
        };
    }

    /**
     * Generate references
     */
    generateReferences() {
        return [
            {
                title: 'RFC 8446 - The Transport Layer Security (TLS) Protocol Version 1.3',
                url: 'https://tools.ietf.org/html/rfc8446'
            },
            {
                title: 'NIST SP 800-52 Rev. 2 - Guidelines for TLS Implementations',
                url: 'https://csrc.nist.gov/publications/detail/sp/800-52/rev-2/final'
            },
            {
                title: 'OWASP Transport Layer Protection Cheat Sheet',
                url: 'https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html'
            },
            {
                title: 'PCI DSS Requirements for TLS',
                url: 'https://www.pcisecuritystandards.org/'
            },
            {
                title: 'AWS CloudFront Security Policies',
                url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html'
            }
        ];
    }

    /**
     * Save reports in multiple formats
     */
    async saveReports() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseFilename = `comprehensive-tls-validation-report-${this.options.domain}-${timestamp}`;

        // Save JSON report
        const jsonPath = path.join(this.options.outputDir, `${baseFilename}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(this.report, null, 2));
        console.log(`  📄 JSON report saved: ${jsonPath}`);

        // Save markdown report
        const markdownPath = path.join(this.options.outputDir, `${baseFilename}.md`);
        const markdownContent = this.generateMarkdownReport();
        fs.writeFileSync(markdownPath, markdownContent);
        console.log(`  📄 Markdown report saved: ${markdownPath}`);

        // Save HTML report (if enabled)
        let htmlPath = null;
        if (this.options.generateHTML) {
            htmlPath = path.join(this.options.outputDir, `${baseFilename}.html`);
            const htmlContent = this.generateHTMLReport();
            fs.writeFileSync(htmlPath, htmlContent);
            console.log(`  📄 HTML report saved: ${htmlPath}`);
        }

        // Save summary report
        const summaryPath = path.join(this.options.outputDir, `tls-validation-summary.md`);
        const summaryContent = this.generateSummaryReport();
        fs.writeFileSync(summaryPath, summaryContent);
        console.log(`  📄 Summary report saved: ${summaryPath}`);

        const result = {
            json: jsonPath,
            markdown: markdownPath,
            summary: summaryPath
        };
        
        if (htmlPath) {
            result.html = htmlPath;
        }
        
        return result;
    }

    /**
     * Generate markdown report
     */
    generateMarkdownReport() {
        const report = this.report;
        
        return `# ${report.metadata.title}

## Executive Summary

**Domain:** ${report.metadata.domain}  
**Generated:** ${report.metadata.timestamp}  
**Overall Security Rating:** ${report.executiveSummary.overallSecurityRating}  
**Risk Level:** ${report.executiveSummary.riskLevel}

### Key Findings

${report.executiveSummary.keyFindings.map(finding => `- ${finding}`).join('\n')}

### Critical Issues

${report.executiveSummary.criticalIssues.length > 0 
    ? report.executiveSummary.criticalIssues.map(issue => `- ${issue}`).join('\n')
    : '- No critical issues identified'}

## TLS Configuration Analysis

### Supported Protocols

${Object.entries(report.tlsConfiguration.supportedProtocols || {}).map(([protocol, info]) => 
    `- **${protocol}**: ${info.supported ? '✅ Supported' : '❌ Not Supported'}`
).join('\n')}

### Security Features

- **Perfect Forward Secrecy**: ${report.tlsConfiguration.securityFeatures?.perfectForwardSecrecy ? '✅ Enabled' : '❌ Disabled'}
- **Strong Encryption**: ${report.tlsConfiguration.securityFeatures?.strongEncryption ? '✅ Enabled' : '❌ Disabled'}
- **Modern Protocols**: ${report.tlsConfiguration.securityFeatures?.modernProtocols ? '✅ Enabled' : '❌ Disabled'}

## Security Assessment

**Overall Score:** ${report.securityAssessment.overallScore}/100

### Vulnerabilities

${report.securityAssessment.vulnerabilities?.length > 0
    ? report.securityAssessment.vulnerabilities.map(vuln => 
        `- **${vuln.severity}**: ${vuln.description}\n  - Impact: ${vuln.impact}`
    ).join('\n')
    : '- No vulnerabilities identified'}

### Strengths

${report.securityAssessment.strengths?.length > 0
    ? report.securityAssessment.strengths.map(strength => `- ${strength}`).join('\n')
    : '- No strengths identified'}

## Compliance Analysis

**Overall Compliance:** ${report.complianceAnalysis.overallCompliance}

### Standards Compliance

${Object.entries(report.complianceAnalysis.standards || {}).map(([standard, compliant]) =>
    `- **${standard}**: ${compliant ? '✅ Compliant' : '❌ Non-Compliant'}`
).join('\n')}

### Compliance Gaps

${report.complianceAnalysis.gaps?.length > 0
    ? report.complianceAnalysis.gaps.map(gap =>
        `- **${gap.standard}**: ${gap.description}\n  - Remediation: ${gap.remediation}`
    ).join('\n')
    : '- No compliance gaps identified'}

## Recommendations

### Immediate Actions

${report.recommendations.immediate?.length > 0
    ? report.recommendations.immediate.map(rec =>
        `- **${rec.priority}**: ${rec.action} (${rec.timeline})`
    ).join('\n')
    : '- No immediate actions required'}

### Short-term Improvements

${report.recommendations.shortTerm?.length > 0
    ? report.recommendations.shortTerm.map(rec =>
        `- **${rec.priority}**: ${rec.action} (${rec.timeline})`
    ).join('\n')
    : '- No short-term improvements identified'}

### Long-term Improvements

${report.recommendations.longTerm?.length > 0
    ? report.recommendations.longTerm.map(rec =>
        `- **${rec.priority}**: ${rec.action} (${rec.timeline})`
    ).join('\n')
    : '- No long-term improvements identified'}

## Test Results

${report.testResults?.summary ? `
**Total Tests:** ${report.testResults.summary.total}  
**Passed:** ${report.testResults.summary.passed}  
**Failed:** ${report.testResults.summary.failed}  
**Warnings:** ${report.testResults.summary.warnings}
` : 'No test results available'}

---

*Report generated by Comprehensive TLS Validation Report Generator v${report.metadata.version}*
`;
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport() {
        const report = this.report;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .critical { color: #d32f2f; font-weight: bold; }
        .warning { color: #f57c00; font-weight: bold; }
        .success { color: #388e3c; font-weight: bold; }
        .score { font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .risk-critical { background-color: #ffebee; }
        .risk-high { background-color: #fff3e0; }
        .risk-medium { background-color: #f3e5f5; }
        .risk-low { background-color: #e8f5e8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.metadata.title}</h1>
        <p><strong>Domain:</strong> ${report.metadata.domain}</p>
        <p><strong>Generated:</strong> ${report.metadata.timestamp}</p>
        <p><strong>Overall Security Rating:</strong> <span class="score">${report.executiveSummary.overallSecurityRating}</span></p>
        <p><strong>Risk Level:</strong> <span class="${report.executiveSummary.riskLevel.toLowerCase()}">${report.executiveSummary.riskLevel}</span></p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <h3>Key Findings</h3>
        <ul>
            ${report.executiveSummary.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
        </ul>
        
        <h3>Critical Issues</h3>
        <ul>
            ${report.executiveSummary.criticalIssues.length > 0 
                ? report.executiveSummary.criticalIssues.map(issue => `<li class="critical">${issue}</li>`).join('')
                : '<li class="success">No critical issues identified</li>'}
        </ul>
    </div>

    <div class="section">
        <h2>Security Assessment</h2>
        <p><strong>Overall Score:</strong> <span class="score">${report.securityAssessment.overallScore}/100</span></p>
        
        <h3>Vulnerabilities</h3>
        <table>
            <tr><th>Severity</th><th>Description</th><th>Impact</th></tr>
            ${report.securityAssessment.vulnerabilities?.length > 0
                ? report.securityAssessment.vulnerabilities.map(vuln => 
                    `<tr class="risk-${vuln.severity.toLowerCase()}">
                        <td>${vuln.severity}</td>
                        <td>${vuln.description}</td>
                        <td>${vuln.impact}</td>
                    </tr>`
                ).join('')
                : '<tr><td colspan="3" class="success">No vulnerabilities identified</td></tr>'}
        </table>
    </div>

    <div class="section">
        <h2>Compliance Analysis</h2>
        <p><strong>Overall Compliance:</strong> ${report.complianceAnalysis.overallCompliance}</p>
        
        <table>
            <tr><th>Standard</th><th>Status</th></tr>
            ${Object.entries(report.complianceAnalysis.standards || {}).map(([standard, compliant]) =>
                `<tr><td>${standard}</td><td class="${compliant ? 'success' : 'critical'}">${compliant ? 'Compliant' : 'Non-Compliant'}</td></tr>`
            ).join('')}
        </table>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        <h3>Immediate Actions</h3>
        <ul>
            ${report.recommendations.immediate?.length > 0
                ? report.recommendations.immediate.map(rec => `<li class="critical">${rec.action} (${rec.timeline})</li>`).join('')
                : '<li>No immediate actions required</li>'}
        </ul>
    </div>

    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
        <p><em>Report generated by Comprehensive TLS Validation Report Generator v${report.metadata.version}</em></p>
    </footer>
</body>
</html>`;
    }

    /**
     * Generate summary report
     */
    generateSummaryReport() {
        const report = this.report;
        
        return `# TLS Validation Summary

**Domain:** ${report.metadata.domain}  
**Date:** ${new Date(report.metadata.timestamp).toLocaleDateString()}  
**Security Rating:** ${report.executiveSummary.overallSecurityRating}  
**Risk Level:** ${report.executiveSummary.riskLevel}

## Quick Status

- **TLS 1.2 Support:** ${report.tlsConfiguration.supportedProtocols?.['TLS 1.2']?.supported ? '✅' : '❌'}
- **TLS 1.3 Support:** ${report.tlsConfiguration.supportedProtocols?.['TLS 1.3']?.supported ? '✅' : '❌'}
- **Perfect Forward Secrecy:** ${report.tlsConfiguration.securityFeatures?.perfectForwardSecrecy ? '✅' : '❌'}
- **Strong Encryption:** ${report.tlsConfiguration.securityFeatures?.strongEncryption ? '✅' : '❌'}

## Critical Issues (${report.executiveSummary.criticalIssues.length})

${report.executiveSummary.criticalIssues.length > 0 
    ? report.executiveSummary.criticalIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')
    : 'None identified'}

## Next Steps

${report.recommendations.immediate?.length > 0
    ? report.recommendations.immediate.map((rec, i) => `${i + 1}. ${rec.action}`).join('\n')
    : 'No immediate actions required'}

---
*For detailed analysis, see the full report: comprehensive-tls-validation-report-${report.metadata.domain}-*.json*
`;
    }

    /**
     * Print report summary
     */
    printReportSummary() {
        console.log('\n📊 TLS Validation Report Summary');
        console.log('================================');
        console.log(`Domain: ${this.report.metadata.domain}`);
        console.log(`Security Rating: ${this.report.executiveSummary.overallSecurityRating}`);
        console.log(`Risk Level: ${this.report.executiveSummary.riskLevel}`);
        console.log(`Overall Score: ${this.report.securityAssessment.overallScore}/100`);
        
        if (this.report.executiveSummary.criticalIssues.length > 0) {
            console.log(`\n❌ Critical Issues: ${this.report.executiveSummary.criticalIssues.length}`);
            this.report.executiveSummary.criticalIssues.slice(0, 3).forEach((issue, i) => {
                console.log(`  ${i + 1}. ${issue}`);
            });
        } else {
            console.log('\n✅ No critical issues identified');
        }

        console.log(`\n📁 Reports saved to: ${this.options.outputDir}`);
    }
}

/**
 * CLI interface
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log(`
Comprehensive TLS Validation Report Generator

Usage: node comprehensive-tls-validation-report.js [domain] [options]

Options:
  --domain <domain>     Domain to validate (default: from CloudFront config)
  --output-dir <dir>    Output directory (default: ./config)
  --no-tests           Skip automated tests
  --no-html            Skip HTML report generation
  --help               Show this help message

Examples:
  node comprehensive-tls-validation-report.js
  node comprehensive-tls-validation-report.js example.cloudfront.net
  node comprehensive-tls-validation-report.js --domain example.com --output-dir ./reports
        `);
        process.exit(0);
    }

    const options = {};
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--domain' && args[i + 1]) {
            options.domain = args[i + 1];
            i++;
        } else if (args[i] === '--output-dir' && args[i + 1]) {
            options.outputDir = args[i + 1];
            i++;
        } else if (args[i] === '--no-tests') {
            options.includeTests = false;
        } else if (args[i] === '--no-html') {
            options.generateHTML = false;
        } else if (!args[i].startsWith('--') && !options.domain) {
            options.domain = args[i];
        }
    }

    const generator = new ComprehensiveTLSReportGenerator(options);
    
    try {
        await generator.generateReport();
        console.log('\n✅ Comprehensive TLS validation report generation completed successfully');
        process.exit(0);
    } catch (error) {
        console.error(`\n❌ Report generation failed: ${error.message}`);
        process.exit(1);
    }
}

// Export for testing
module.exports = { ComprehensiveTLSReportGenerator };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}