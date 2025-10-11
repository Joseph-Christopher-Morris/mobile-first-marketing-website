# TLS Validation Guide

## Overview

This guide covers TLS (Transport Layer Security) validation for CloudFront distributions, including testing TLS version support, cipher suite analysis, and security best practices.

## TLS Version Requirements

### Supported TLS Versions

| Version | Status | Security | Recommendation |
|---------|--------|----------|----------------|
| TLS 1.0 | ❌ Deprecated | Insecure | Disable immediately |
| TLS 1.1 | ❌ Deprecated | Insecure | Disable immediately |
| TLS 1.2 | ✅ Current | Secure | Required minimum |
| TLS 1.3 | ✅ Latest | Most Secure | Recommended |

### Why Disable Old TLS Versions?

- **TLS 1.0/1.1**: Vulnerable to BEAST, POODLE, and other attacks
- **Industry Standards**: PCI-DSS requires TLS 1.2+ since June 2018
- **Browser Support**: Modern browsers deprecate TLS 1.0/1.1
- **Performance**: TLS 1.3 offers better performance and security

## Cipher Suite Analysis

### Strong Cipher Suites

Recommended cipher suites include:
- `ECDHE-RSA-AES256-GCM-SHA384`
- `ECDHE-RSA-AES128-GCM-SHA256`
- `ECDHE-ECDSA-AES256-GCM-SHA384`
- `ECDHE-ECDSA-AES128-GCM-SHA256`
- `ECDHE-RSA-CHACHA20-POLY1305`

### Weak Cipher Suites to Avoid

- **RC4**: Stream cipher with known biases
- **DES/3DES**: Vulnerable to Sweet32 attack
- **MD5**: Cryptographically broken
- **SHA1**: Vulnerable to collision attacks
- **NULL ciphers**: No encryption
- **EXPORT ciphers**: Deliberately weakened
- **Anonymous ciphers**: No authentication

### Perfect Forward Secrecy (PFS)

PFS ensures that session keys cannot be compromised even if the private key is compromised later.

**Required Key Exchange Algorithms:**
- **ECDHE** (Elliptic Curve Diffie-Hellman Ephemeral)
- **DHE** (Diffie-Hellman Ephemeral)

## CloudFront Security Policies

### Recommended Security Policies

1. **TLSv1.2_TLSv1.3_2021** (Best)
   - Supports TLS 1.2 and 1.3
   - Modern cipher suites only
   - Perfect Forward Secrecy

2. **TLSv1.2_2021** (Good)
   - TLS 1.2 only
   - Strongest TLS 1.2 cipher suites
   - Perfect Forward Secrecy

### Deprecated Security Policies

❌ **Avoid these policies:**
- `TLSv1` - Includes TLS 1.0/1.1
- `TLSv1.1_2016` - Includes TLS 1.1
- `TLSv1.2_2018` - Older cipher suites

## Using the TLS Validation Suite

### Basic Usage

```bash
# Validate your CloudFront distribution
node scripts/tls-validation-suite.js your-distribution.cloudfront.net

# Test against any domain
node scripts/tls-validation-suite.js example.com
```

### Running Tests

```bash
# Run comprehensive validation tests
node scripts/test-tls-validation.js
```

### Understanding Results

The validation suite provides:

1. **Security Score** (0-100)
   - 90-100: Excellent
   - 70-89: Good
   - 50-69: Needs improvement
   - <50: Critical issues

2. **TLS Version Support**
   - ✅ TLS 1.2/1.3 supported
   - ❌ TLS 1.0/1.1 disabled

3. **Cipher Suite Analysis**
   - Strong vs weak cipher detection
   - Perfect Forward Secrecy validation

4. **Security Recommendations**
   - Specific actions to improve security
   - CloudFront configuration guidance

## Security Best Practices

### 1. TLS Configuration

```json
{
  "minimumProtocolVersion": "TLSv1.2_2021",
  "sslSupportMethod": "sni-only",
  "certificateSource": "acm"
}
```

### 2. Security Headers

Implement these security headers in CloudFront:

```javascript
{
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

### 3. Certificate Management

- Use AWS Certificate Manager (ACM)
- Enable automatic renewal
- Use RSA 2048-bit or ECDSA P-256 keys
- Include all necessary domain names in SAN

### 4. Monitoring and Alerting

Set up CloudWatch alarms for:
- SSL certificate expiration
- TLS handshake failures
- Cipher suite usage patterns
- Security policy violations

## Compliance Requirements

### PCI-DSS Compliance

- Minimum TLS 1.2
- Perfect Forward Secrecy required
- No weak cipher suites
- Regular security assessments

### NIST Guidelines

- TLS 1.2 minimum, 1.3 recommended
- Strong cipher suites only
- Perfect Forward Secrecy
- Regular certificate rotation

### OWASP Recommendations

- Latest TLS versions
- Strong cipher suites
- Security headers implementation
- Regular security testing

## Troubleshooting

### Common Issues

1. **TLS 1.0/1.1 Still Supported**
   - Update CloudFront security policy
   - Use `TLSv1.2_2021` or newer

2. **Weak Cipher Suites Detected**
   - Update to modern security policy
   - Check client compatibility requirements

3. **No Perfect Forward Secrecy**
   - Ensure ECDHE/DHE key exchange
   - Update cipher suite configuration

4. **Low Security Score**
   - Review all recommendations
   - Implement suggested improvements
   - Re-test after changes

### Testing Commands

```bash
# Test TLS versions with OpenSSL
openssl s_client -connect domain.com:443 -tls1_2
openssl s_client -connect domain.com:443 -tls1_3

# Check cipher suites
nmap --script ssl-enum-ciphers -p 443 domain.com

# Validate certificate
openssl s_client -connect domain.com:443 -servername domain.com
```

## Integration with CI/CD

### GitHub Actions Integration

```yaml
- name: Validate TLS Configuration
  run: |
    node scripts/tls-validation-suite.js ${{ env.CLOUDFRONT_DOMAIN }}
    
- name: Check Security Score
  run: |
    SCORE=$(jq '.securityScore' config/tls-validation-report.json)
    if [ "$SCORE" -lt 70 ]; then
      echo "Security score too low: $SCORE"
      exit 1
    fi
```

### Automated Monitoring

Set up regular TLS validation:
- Daily security checks
- Alert on configuration changes
- Monthly compliance reports
- Quarterly penetration testing

## Resources

### Tools
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OWASP TLS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)

### Documentation
- [AWS CloudFront Security Policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html)
- [RFC 8446 - TLS 1.3](https://tools.ietf.org/html/rfc8446)
- [NIST SP 800-52 Rev. 2](https://csrc.nist.gov/publications/detail/sp/800-52/rev-2/final)

## Support

For issues with TLS validation:
1. Check the troubleshooting section
2. Review CloudFront security policy settings
3. Validate certificate configuration
4. Test with multiple tools for confirmation