# SSL Certificate Validation Guide

This guide explains how to use the SSL certificate validation tools to test certificate validity, configuration, and security for CloudFront distributions and custom domains.

## Overview

The SSL certificate validation system provides comprehensive testing of:

- **Certificate Validity**: Expiration dates and validity periods
- **Subject and SAN Matching**: Hostname verification against certificate
- **Certificate Chain Integrity**: Complete chain validation and trust path
- **Certificate Authority Trust**: CA validation and trust store verification
- **Security Configuration**: Signature algorithms and key usage validation

## Tools Available

### 1. SSL Certificate Validator (`ssl-certificate-validator.js`)

Main validation tool for individual domains or multiple domains.

#### Usage

```bash
# Validate a single domain
node scripts/ssl-certificate-validator.js example.com

# Validate with custom port
node scripts/ssl-certificate-validator.js example.com --port 8443

# Save results to file
node scripts/ssl-certificate-validator.js example.com --output results.json

# Validate multiple domains from config file
node scripts/ssl-certificate-validator.js --multiple config/ssl-certificate-config.json
```

#### Features

- **Certificate Validity Dates**: Checks current validity and warns about upcoming expiration
- **Subject/SAN Matching**: Verifies hostname matches certificate names (supports wildcards)
- **Certificate Chain**: Validates complete certificate chain integrity
- **CA Trust**: Verifies certificate is trusted by system CA store
- **Signature Algorithms**: Checks for weak signature algorithms (MD5, SHA1)
- **Key Usage**: Validates appropriate key usage extensions

### 2. CloudFront SSL Validator (`cloudfront-ssl-validator.js`)

Specialized tool for validating CloudFront distribution SSL certificates.

#### Usage

```bash
# Validate CloudFront distributions from config
node scripts/cloudfront-ssl-validator.js config/cloudfront-distributions.json

# Save detailed results
node scripts/cloudfront-ssl-validator.js config/cloudfront-distributions.json --output cloudfront-ssl-report.json

# Enable verbose output
node scripts/cloudfront-ssl-validator.js config/cloudfront-distributions.json --verbose
```

#### Configuration Format

Create `config/cloudfront-distributions.json`:

```json
{
  "distributions": [
    {
      "id": "E1234567890123",
      "domainName": "d1234567890123.cloudfront.net",
      "customDomains": ["example.com", "www.example.com"]
    }
  ]
}
```

### 3. SSL Certificate Validation Test Suite (`test-ssl-certificate-validation.js`)

Comprehensive test suite that validates the SSL validation tools themselves.

#### Usage

```bash
# Run all SSL validation tests
node scripts/test-ssl-certificate-validation.js
```

## Configuration Files

### SSL Certificate Configuration (`config/ssl-certificate-config.json`)

```json
{
  "domains": [
    "example.com",
    "www.example.com"
  ],
  "validation": {
    "checkExpiry": true,
    "expiryWarningDays": 30,
    "checkChain": true,
    "checkTrust": true,
    "checkSubjectMatch": true,
    "checkKeyUsage": true
  },
  "reporting": {
    "outputFormat": "json",
    "saveToFile": true,
    "outputPath": "ssl-certificate-validation-report.json"
  }
}
```

### CloudFront Distributions Configuration (`config/cloudfront-distributions.json`)

```json
{
  "distributions": [
    {
      "id": "E1234567890123",
      "domainName": "d1234567890123.cloudfront.net",
      "customDomains": ["example.com", "www.example.com"],
      "description": "Production distribution"
    }
  ],
  "validation": {
    "checkCustomDomains": true,
    "checkCloudFrontDomains": true,
    "expiryWarningDays": 30
  }
}
```

## Validation Tests Performed

### 1. Certificate Validity Dates

- **Current Validity**: Checks if certificate is currently valid
- **Expiration Warning**: Warns if certificate expires within 30 days
- **Lifetime Validation**: Ensures certificate lifetime is within recommended limits (≤825 days)

### 2. Subject and SAN Matching

- **Hostname Matching**: Verifies hostname matches certificate CN or SAN entries
- **Wildcard Support**: Properly handles wildcard certificates (*.example.com)
- **Subject Completeness**: Checks for recommended subject fields (C, ST, L, O, CN)

### 3. Certificate Chain Integrity

- **Chain Length**: Validates appropriate chain length (2-4 certificates)
- **Chain Completeness**: Ensures complete chain to trusted root
- **Circular Reference Detection**: Prevents infinite loops in chain validation
- **Signature Algorithm Validation**: Checks for weak algorithms in chain

### 4. Certificate Authority Trust

- **System Trust Store**: Verifies certificate is trusted by system CA store
- **Root CA Validation**: Validates root certificate is properly self-signed
- **Authorization Errors**: Reports specific trust issues if found

### 5. Security Configuration

- **Key Usage Extensions**: Validates appropriate key usage for TLS server authentication
- **Signature Algorithms**: Identifies weak signature algorithms (MD5, SHA1)
- **Certificate Strength**: Validates overall certificate security configuration

## Output Formats

### JSON Report Structure

```json
{
  "timestamp": "2025-10-05T20:51:48.340Z",
  "tests": [
    {
      "test": "validity-dates",
      "status": "PASSED",
      "message": "Certificate is valid until 2025-12-08T08:34:17.000Z (63 days remaining)",
      "hostname": "example.com",
      "timestamp": "2025-10-05T20:51:48.516Z"
    }
  ],
  "summary": {
    "total": 9,
    "passed": 7,
    "failed": 0,
    "warnings": 2
  }
}
```

### Test Status Values

- **PASSED**: Test completed successfully with no issues
- **FAILED**: Test failed and requires immediate attention
- **WARNING**: Test passed but has potential issues
- **SKIPPED**: Test was skipped (e.g., example domains)
- **INFO**: Informational message

## Integration with CI/CD

### GitHub Actions Integration

Add to your workflow:

```yaml
- name: Validate SSL Certificates
  run: |
    node scripts/ssl-certificate-validator.js ${{ secrets.DOMAIN_NAME }} --output ssl-validation-report.json
    
- name: Upload SSL Validation Report
  uses: actions/upload-artifact@v3
  with:
    name: ssl-validation-report
    path: ssl-validation-report.json
```

### Automated Monitoring

Set up automated SSL certificate monitoring:

```bash
# Daily SSL certificate check
0 9 * * * /usr/bin/node /path/to/scripts/ssl-certificate-validator.js example.com --output /var/log/ssl-check.json
```

## Troubleshooting

### Common Issues

#### Certificate Not Trusted

```
❌ ca-trust: Certificate is not trusted: SELF_SIGNED_CERT_IN_CHAIN
```

**Solution**: Install intermediate certificates or use a certificate from a trusted CA.

#### Hostname Mismatch

```
❌ subject-san-match: Hostname example.com does not match certificate
```

**Solution**: Update certificate to include the correct domain names in SAN.

#### Certificate Expired

```
❌ validity-dates: Certificate has expired. Valid until: 2024-01-01T00:00:00.000Z
```

**Solution**: Renew the SSL certificate immediately.

#### Weak Signature Algorithm

```
❌ signature-algorithms: Weak signature algorithms detected: Certificate 0 uses weak signature algorithm: sha1WithRSAEncryption
```

**Solution**: Replace certificate with one using SHA-256 or stronger.

### Connection Issues

#### Timeout Errors

```
Failed to retrieve certificate: TLS connection failed: connect ETIMEDOUT
```

**Solutions**:
- Check network connectivity
- Verify domain name resolution
- Increase timeout value with `--timeout` option
- Check firewall settings

#### Port Issues

```
Failed to retrieve certificate: TLS connection failed: connect ECONNREFUSED
```

**Solutions**:
- Verify correct port (usually 443 for HTTPS)
- Check if service is running on the specified port
- Use `--port` option to specify custom port

## Best Practices

### Regular Monitoring

1. **Automated Checks**: Run SSL validation daily in CI/CD
2. **Expiration Alerts**: Set up alerts for certificates expiring within 30 days
3. **Chain Validation**: Regularly verify complete certificate chains
4. **Security Updates**: Monitor for weak signature algorithms

### Certificate Management

1. **Use Trusted CAs**: Always use certificates from trusted certificate authorities
2. **Proper SAN Configuration**: Include all necessary domain names in SAN
3. **Appropriate Lifetime**: Use certificates with reasonable validity periods
4. **Strong Algorithms**: Ensure SHA-256 or stronger signature algorithms

### CloudFront Specific

1. **Custom Domain Validation**: Always validate custom domain certificates
2. **Distribution Monitoring**: Monitor all CloudFront distributions
3. **Certificate Renewal**: Plan for certificate renewal before expiration
4. **Security Headers**: Combine with security header validation

## Security Considerations

### Certificate Security

- **Private Key Protection**: Ensure private keys are properly secured
- **Certificate Transparency**: Monitor CT logs for unauthorized certificates
- **Revocation Checking**: Implement OCSP stapling where possible
- **Perfect Forward Secrecy**: Use cipher suites supporting PFS

### Validation Security

- **Network Security**: Run validation from secure networks
- **Result Storage**: Secure storage of validation results
- **Access Control**: Limit access to validation tools and results
- **Audit Logging**: Log all validation activities

## Support and Maintenance

### Regular Updates

- Update validation tools regularly
- Monitor for new security requirements
- Update trusted CA lists
- Review and update validation criteria

### Documentation

- Keep configuration files updated
- Document any custom validation requirements
- Maintain troubleshooting guides
- Update integration procedures

This SSL certificate validation system provides comprehensive testing to ensure your CloudFront distributions and custom domains maintain proper SSL/TLS security configuration.