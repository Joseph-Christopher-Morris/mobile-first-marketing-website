# Cipher Suite Validation Report

## Summary
- **Domain**: github.com
- **Validation Date**: 2025-10-05T21:40:11.105Z
- **Overall Score**: 0/100
- **Status**: ❌ FAILED

## Strong Cipher Suites Supported
- ❌ No strong ciphers detected

## Encryption Strength Analysis
- **AES-256 Ciphers**: 0
- **AES-128 Ciphers**: 0
- **ChaCha20 Ciphers**: 0
- **Perfect Forward Secrecy**: 0

## Weak Ciphers Found
- ❌ DHE-PSK-AES128-CBC-SHA (PSK)
- ❌ DHE-PSK-AES128-CBC-SHA256 (PSK)
- ❌ DHE-PSK-AES128-GCM-SHA256 (PSK)
- ❌ DHE-PSK-AES256-CBC-SHA (PSK)
- ❌ DHE-PSK-AES256-CBC-SHA384 (PSK)
- ❌ DHE-PSK-AES256-GCM-SHA384 (PSK)
- ❌ DHE-PSK-CHACHA20-POLY1305 (PSK)
- ❌ ECDHE-PSK-AES128-CBC-SHA (PSK)
- ❌ ECDHE-PSK-AES128-CBC-SHA256 (PSK)
- ❌ ECDHE-PSK-AES256-CBC-SHA (PSK)
- ❌ ECDHE-PSK-AES256-CBC-SHA384 (PSK)
- ❌ ECDHE-PSK-CHACHA20-POLY1305 (PSK)
- ❌ PSK-AES128-CBC-SHA (PSK)
- ❌ PSK-AES128-CBC-SHA256 (PSK)
- ❌ PSK-AES128-GCM-SHA256 (PSK)
- ❌ PSK-AES256-CBC-SHA (PSK)
- ❌ PSK-AES256-CBC-SHA384 (PSK)
- ❌ PSK-AES256-GCM-SHA384 (PSK)
- ❌ PSK-CHACHA20-POLY1305 (PSK)
- ❌ RSA-PSK-AES128-CBC-SHA (PSK)
- ❌ RSA-PSK-AES128-CBC-SHA256 (PSK)
- ❌ RSA-PSK-AES128-GCM-SHA256 (PSK)
- ❌ RSA-PSK-AES256-CBC-SHA (PSK)
- ❌ RSA-PSK-AES256-CBC-SHA384 (PSK)
- ❌ RSA-PSK-AES256-GCM-SHA384 (PSK)
- ❌ RSA-PSK-CHACHA20-POLY1305 (PSK)
- ❌ SRP-AES-128-CBC-SHA (SRP)
- ❌ SRP-AES-256-CBC-SHA (SRP)
- ❌ SRP-RSA-AES-128-CBC-SHA (SRP)
- ❌ SRP-RSA-AES-256-CBC-SHA (SRP)

## Recommendations
- Add support for AES-256 encryption
- Consider adding ChaCha20-Poly1305 cipher suites
- Enable Perfect Forward Secrecy with ECDHE or DHE key exchange
- Disable weak cipher suites found in the configuration
- Increase cipher suite diversity for better client compatibility
- Add modern AEAD cipher suites (GCM, ChaCha20-Poly1305)

## Detailed Results
For complete technical details, see the JSON report: `config/cipher-suite-validation-report.json`
