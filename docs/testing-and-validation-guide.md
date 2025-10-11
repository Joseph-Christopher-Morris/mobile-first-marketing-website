# Testing and Validation Guide

This guide covers the comprehensive testing and validation framework for the S3 + CloudFront deployment solution.

## Overview

The testing framework provides multiple layers of validation:

1. **Comprehensive Test Suite** - End-to-end deployment testing, performance validation, and security configuration validation
2. **Production Readiness Validator** - Complete deployment pipeline testing in staging, rollback procedures validation, and security audit
3. **Individual Test Scripts** - Focused testing for specific components
4. **E2E Tests** - Browser-based testing using Playwright

## Quick Start

### Run All Tests

```bash
# Run comprehensive test suite
npm run test:all

# Run with verbose output
npm run test:all -- --verbose

# Run quick validation tests only
npm run test:quick

# Run tests without server dependency
npm run test:all -- --skip-server
```

### Run Specific Test Categories

```bash
# Core site functionality
node scripts/validate-site-functionality.js

# Comprehensive test suite
node scripts/comprehensive-test-suite.js

# Production readiness validation
node scripts/production-readiness-validator.js

# Security validation
node scripts/security-validation-suite.js
```

## Test Categories

### 1. End-to-End Deployment Testing

**Script:** `scripts/comprehensive-test-suite.js`

**Purpose:** Validates the complete deployment pipeline functionality

**Tests Include:**
- Build process validation
- Infrastructure setup validation
- Deployment script validation
- Rollback mechanism validation
- Site accessibility post-deployment
- Critical user journeys

**Usage:**
```bash
node scripts/comprehensive-test-suite.js --env=staging --verbose
```

**Requirements Covered:** 1.5, 2.5, 7.5

### 2. Performance Validation Tests

**Included in:** Comprehensive Test Suite

**Purpose:** Ensures performance meets defined budgets and standards

**Tests Include:**
- Core Web Vitals validation (LCP, FID, CLS, FCP, TTI, TBT)
- Performance budget compliance
- Resource loading performance
- Bundle size analysis
- CDN optimization validation
- Resource optimization checks

**Performance Budgets:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Page Load Time: < 3s
- JavaScript Bundle: < 500KB
- CSS Bundle: < 100KB

### 3. Security Configuration Validation

**Scripts:** Multiple security validation scripts

**Purpose:** Comprehensive security audit and penetration testing

**Tests Include:**
- Security headers validation
- SSL/TLS configuration testing
- Access control audit
- Penetration testing suite
- Vulnerability assessment
- Runtime security validation

**Security Standards:**
- HTTPS enforcement
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- TLS 1.2+ only
- Perfect Forward Secrecy
- Strong cipher suites

### 4. Production Readiness Validation

**Script:** `scripts/production-readiness-validator.js`

**Purpose:** Validates complete production readiness

**Validation Categories:**
- **Deployment (25% weight):** Staging deployment, production deployment test, rollback procedures, disaster recovery
- **Security (30% weight):** Security headers, SSL/TLS, access control, penetration testing, vulnerability assessment
- **Performance (20% weight):** Load testing, performance benchmarks, CDN optimization, resource optimization
- **Monitoring (15% weight):** Monitoring setup, alerting configuration, logging validation, health checks
- **Compliance (10% weight):** Accessibility compliance, SEO optimization, content validation, legal compliance

**Usage:**
```bash
# Validate staging environment
node scripts/production-readiness-validator.js --env=staging --staging=https://staging.example.com

# Validate production readiness
node scripts/production-readiness-validator.js --env=production --production=https://example.com
```

**Requirements Covered:** 8.3, 8.4

## E2E Testing with Playwright

### Core Functionality Tests

**File:** `e2e/core-functionality.spec.ts`

**Tests:**
- Homepage loading and navigation
- Contact form functionality
- Mobile navigation
- Resource loading efficiency
- Social media integrations
- Error handling

### Accessibility Tests

**File:** `e2e/accessibility.spec.ts`

**Tests:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation
- Form accessibility
- Focus management

### Performance Tests

**File:** `e2e/performance.spec.ts`

**Tests:**
- Core Web Vitals monitoring
- Performance budget validation
- Image optimization
- Resource compression
- Cache effectiveness
- Mobile performance

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/core-functionality.spec.ts

# Run with specific browser
npx playwright test --project=chromium

# Run in headed mode for debugging
npx playwright test --headed

# Generate HTML report
npx playwright test --reporter=html
```

## Test Configuration

### Environment Variables

```bash
# Site URLs for testing
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STAGING_URL=https://staging.example.com
PRODUCTION_URL=https://example.com

# Contact form testing
CONTACT_EMAIL=contact@example.com

# Social media links
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/example
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/example
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/example

# Analytics
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_GTM_ID=GTM_CONTAINER_ID
```

### Test Output

All tests generate comprehensive reports in the `./test-results` directory:

- **JSON Reports:** Machine-readable test results
- **HTML Reports:** Interactive visual reports
- **Markdown Summaries:** Executive summaries for stakeholders

### Continuous Integration

The testing framework is designed to work in CI/CD environments:

```yaml
# GitHub Actions example
- name: Run Comprehensive Tests
  run: |
    npm run build
    npm run test:all -- --skip-server --env=ci
    
- name: Upload Test Reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: test-results/
```

## Test Execution Strategies

### Development Environment

```bash
# Quick validation during development
npm run test:quick

# Full test suite with local server
npm start &
npm run test:all
```

### Staging Environment

```bash
# Comprehensive validation before production
node scripts/comprehensive-test-suite.js --env=staging --url=https://staging.example.com

# Production readiness assessment
node scripts/production-readiness-validator.js --env=staging --staging=https://staging.example.com
```

### Production Environment

```bash
# Post-deployment validation
node scripts/comprehensive-test-suite.js --env=production --url=https://example.com

# Production health check
node scripts/production-readiness-validator.js --env=production --production=https://example.com
```

## Troubleshooting

### Common Issues

1. **Server Not Running**
   - Use `--skip-server` flag for tests that don't require a running server
   - Start development server: `npm run dev`

2. **Playwright Browser Issues**
   - Install browsers: `npx playwright install`
   - Update browsers: `npx playwright install --force`

3. **Timeout Issues**
   - Increase timeout in test configuration
   - Check network connectivity
   - Verify site accessibility

4. **Permission Issues**
   - Ensure proper AWS credentials are configured
   - Check IAM permissions for deployment scripts

### Debug Mode

```bash
# Run with verbose logging
node scripts/comprehensive-test-suite.js --verbose

# Run Playwright in debug mode
npx playwright test --debug

# Generate trace files
npx playwright test --trace on
```

## Best Practices

1. **Run Tests Regularly**
   - Execute quick tests during development
   - Run comprehensive tests before deployments
   - Schedule regular production health checks

2. **Monitor Test Results**
   - Review HTML reports for detailed analysis
   - Track performance trends over time
   - Address warnings before they become failures

3. **Maintain Test Environment**
   - Keep staging environment up-to-date
   - Regularly update test dependencies
   - Monitor test execution times

4. **Security Testing**
   - Run security tests after any infrastructure changes
   - Keep vulnerability databases updated
   - Address security warnings promptly

## Integration with Deployment Pipeline

The testing framework integrates with the deployment pipeline:

1. **Pre-deployment:** Run comprehensive tests in staging
2. **Deployment:** Execute production readiness validation
3. **Post-deployment:** Validate production functionality
4. **Monitoring:** Continuous health checks and performance monitoring

This ensures that every deployment is thoroughly validated and production-ready.