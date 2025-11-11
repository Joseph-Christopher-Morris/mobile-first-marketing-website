---
inclusion: always
---

# Project Deployment Configuration

## Current Deployment Architecture

This project uses **S3 + CloudFront deployment architecture** exclusively. AWS
Amplify has been decommissioned and should not be used.

### Production Infrastructure

- **S3 Bucket**: `mobile-marketing-site-prod-1759705011281-tyzuo9`
- **CloudFront Distribution**: `E2IBMHQ3GCW6ZK`
- **Domain**: `d15sc9fc739ev2.cloudfront.net`
- **Region**: `us-east-1`
- **Status**: Active and fully operational

### Deployment Commands

#### Infrastructure Setup (One-time)

```bash
node scripts/setup-infrastructure.js
```

#### Regular Deployment

```bash
# Set environment variables
export S3_BUCKET_NAME="mobile-marketing-site-prod-1759705011281-tyzuo9"
export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"
export AWS_REGION="us-east-1"

# Deploy
node scripts/deploy.js
```

#### Rollback Operations

```bash
# List available backups
node scripts/rollback.js list

# Rollback to specific backup
node scripts/rollback.js rollback <backup-id>

# Emergency rollback
node scripts/rollback.js emergency
```

### GitHub Actions Automation

The project has automated deployment via GitHub Actions:

- **Workflow File**: `.github/workflows/s3-cloudfront-deploy.yml`
- **Trigger**: Push to `main` branch
- **Process**: Build → Deploy → Validate → Notify

### Key Scripts and Tools

| Script                                   | Purpose                          |
| ---------------------------------------- | -------------------------------- |
| `scripts/setup-infrastructure.js`        | Initial AWS infrastructure setup |
| `scripts/deploy.js`                      | Main deployment script           |
| `scripts/rollback.js`                    | Backup and rollback management   |
| `scripts/deployment-validator.js`        | Post-deployment validation       |
| `scripts/setup-cloudwatch-monitoring.js` | Monitoring setup                 |

### Configuration Files

| File                                         | Purpose                      |
| -------------------------------------------- | ---------------------------- |
| `config/production-infrastructure.json`      | Infrastructure configuration |
| `config/cloudfront-s3-config.json`           | CloudFront settings          |
| `.github/workflows/s3-cloudfront-deploy.yml` | CI/CD pipeline               |

## Migration Status

### ✅ Completed

- AWS Amplify decommissioned
- S3 + CloudFront infrastructure deployed
- GitHub Actions pipeline configured
- Security hardening implemented
- Monitoring and alerting active
- Rollback procedures tested
- Photography page legacy statistics removed (2025-11-01)

### 🚫 Deprecated/Prohibited

- **AWS Amplify**: Completely decommissioned, do not use
- **Direct S3 hosting**: Security risk, use CloudFront only
- **Public S3 buckets**: Violates security standards
- **Manual deployments**: Use automated scripts only

## Development Workflow

1. **Local Development**: `npm run dev`
2. **Build Testing**: `npm run build`
3. **Code Changes**: Edit files in `src/` directory
4. **Blog Updates**: Edit `src/app/blog/page.tsx`
5. **Photography Page**: Source of truth is `src/app/services/photography/page.tsx`
6. **Commit & Push**: Changes to `main` branch trigger auto-deployment
7. **Monitoring**: Check CloudWatch and deployment logs

### Content Guidelines

- **Photography Page**: Do not reintroduce legacy metric grids (3+, 50+, 100+)
- **Approved Statistics**: Only "3,500+ licensed images" and "90+ countries"
- **Client Preference**: Narrative copy over statistics blocks
- **Hero Image**: Must use "photography-hero.webp" (not editorial-proof-bbc-forbes-times.webp)

## Support and Troubleshooting

### Common Issues

- **Blog menu not working**: Ensure `src/app/blog/page.tsx` exists
- **Deployment failures**: Check AWS credentials and permissions
- **Cache issues**: Use CloudFront invalidation via deployment script
- **Security errors**: Verify OAC configuration and bucket policies

### Monitoring URLs

- **Website**: `https://d15sc9fc739ev2.cloudfront.net`
- **CloudWatch**: AWS Console → CloudWatch → us-east-1
- **S3 Console**: AWS Console → S3 → mobile-marketing-site-prod-\*
- **CloudFront Console**: AWS Console → CloudFront → E2IBMHQ3GCW6ZK

## Security Compliance

This deployment follows all security standards:

- ✅ Private S3 buckets with OAC
- ✅ HTTPS-only via CloudFront
- ✅ Security headers enabled
- ✅ Access logging configured
- ✅ IAM roles with least privilege
- ✅ Automated security scanning

**Remember**: Always use S3 + CloudFront, never Amplify for this project.
