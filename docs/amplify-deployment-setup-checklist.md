# AWS Amplify Deployment Setup Checklist

This checklist ensures all build settings and webhooks are properly configured
for AWS Amplify deployment.

## Pre-Deployment Checklist

### ✅ Repository Setup

- [ ] Code is committed to GitHub repository
- [ ] Repository has `main` branch (or `master`)
- [ ] All necessary files are included and not gitignored
- [ ] Repository is accessible to AWS Amplify

### ✅ Build Configuration

- [ ] `amplify.yml` file exists in repository root
- [ ] `amplify.yml` contains all required sections:
  - [ ] `version: 1`
  - [ ] `frontend` section
  - [ ] `phases` with `preBuild`, `build`, `postBuild`
  - [ ] `artifacts` with correct `baseDirectory`
  - [ ] `cache` configuration for dependencies
- [ ] All build scripts referenced in `amplify.yml` exist in `package.json`
- [ ] All script files exist in `scripts/` directory

### ✅ Next.js Configuration

- [ ] `next.config.js` configured for static export
- [ ] Output directory set to `out`
- [ ] Image optimization configured
- [ ] Security headers configured
- [ ] Bundle analyzer available for optimization

### ✅ Environment Variables

- [ ] `.env.example` file exists with all required variables
- [ ] Environment variables documented
- [ ] Validation script exists (`scripts/validate-env.js`)
- [ ] Production environment variables identified

### ✅ Content and Assets

- [ ] Content validation scripts exist
- [ ] All content files are properly structured
- [ ] Images are optimized for web
- [ ] Static assets are in correct directories

### ✅ Testing Setup

- [ ] Unit tests configured and passing
- [ ] End-to-end tests configured
- [ ] Test scripts work correctly
- [ ] Performance tests available

## AWS Amplify Setup

### ✅ Create Amplify Application

1. **Login to AWS Console**
   - [ ] Access AWS Amplify service
   - [ ] Ensure proper IAM permissions

2. **Create New App**
   - [ ] Choose "Host web app"
   - [ ] Select "GitHub" as source
   - [ ] Authorize GitHub access if needed

3. **Repository Connection**
   - [ ] Select your repository
   - [ ] Choose `main` branch
   - [ ] Verify repository access

### ✅ Build Settings Configuration

1. **Automatic Detection**
   - [ ] Amplify detects Next.js framework
   - [ ] `amplify.yml` is automatically detected
   - [ ] Build settings are populated correctly

2. **Manual Configuration (if needed)**
   - [ ] Set build commands:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - npm ci
             - npm run build:optimize
             - npm run env:validate
             - npm run content:validate-structure
             - npm run content:validate
             - npm run type-check
         build:
           commands:
             - npm run build
             - npm run test
         postBuild:
           commands:
             - npm run cache:optimize
             - npm run deploy:monitor
       artifacts:
         baseDirectory: out
         files:
           - '**/*'
       cache:
         paths:
           - node_modules/**/*
           - .next/cache/**/*
     ```

3. **Advanced Settings**
   - [ ] Node.js version set to 18.x or higher
   - [ ] Build timeout increased if needed (default: 30 minutes)
   - [ ] Build image configured (Amazon Linux 2)

### ✅ Environment Variables Setup

1. **Required Variables**
   - [ ] `NEXT_PUBLIC_SITE_URL` (will be auto-set to Amplify URL)
   - [ ] `NEXT_PUBLIC_SITE_NAME`
   - [ ] `NEXT_PUBLIC_SITE_DESCRIPTION`
   - [ ] `CONTACT_EMAIL`

2. **Optional Variables**
   - [ ] `NEXT_PUBLIC_GA_ID` (Google Analytics)
   - [ ] `NEXT_PUBLIC_GTM_ID` (Google Tag Manager)
   - [ ] `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
   - [ ] Social media URLs
   - [ ] SMTP configuration (if using email)

3. **Amplify Auto-Variables**
   - [ ] `AMPLIFY_BRANCH` (automatically set)
   - [ ] `AMPLIFY_APP_ID` (automatically set)
   - [ ] `AWS_REGION` (automatically set)

### ✅ Domain Configuration

1. **Default Domain**
   - [ ] Note the auto-generated Amplify domain
   - [ ] Test domain accessibility

2. **Custom Domain (Optional)**
   - [ ] Add custom domain in Amplify console
   - [ ] Configure DNS settings
   - [ ] Wait for SSL certificate provisioning
   - [ ] Verify domain ownership

### ✅ Webhook Configuration

1. **Automatic Setup**
   - [ ] Webhook automatically created in GitHub
   - [ ] Webhook URL noted for reference
   - [ ] Webhook secret configured

2. **Webhook Verification**
   - [ ] Check GitHub repository webhooks section
   - [ ] Verify webhook is active
   - [ ] Test webhook with a small commit

3. **Build Triggers**
   - [ ] Push to main branch triggers build
   - [ ] Manual trigger works from console
   - [ ] Build notifications configured

## Deployment Testing

### ✅ Initial Deployment

1. **Trigger First Build**
   - [ ] Push code to main branch OR
   - [ ] Trigger manual build from Amplify console

2. **Monitor Build Process**
   - [ ] Watch build logs in real-time
   - [ ] Verify each build phase completes successfully:
     - [ ] Provision phase
     - [ ] Pre-build phase
     - [ ] Build phase
     - [ ] Post-build phase
     - [ ] Deploy phase

3. **Build Validation**
   - [ ] Build completes without errors
   - [ ] All tests pass
   - [ ] Static files generated correctly
   - [ ] Deployment successful

### ✅ Site Functionality Testing

1. **Basic Functionality**
   - [ ] Site loads correctly
   - [ ] All pages accessible
   - [ ] Navigation works
   - [ ] Mobile responsiveness

2. **Content Verification**
   - [ ] All content displays correctly
   - [ ] Images load properly
   - [ ] Links work correctly
   - [ ] Forms function (if applicable)

3. **Performance Testing**
   - [ ] Site loads quickly
   - [ ] Core Web Vitals are good
   - [ ] No console errors
   - [ ] SEO metadata correct

### ✅ Security and Headers

1. **Security Headers**
   - [ ] HTTPS redirect working
   - [ ] Security headers present:
     - [ ] Strict-Transport-Security
     - [ ] X-Frame-Options
     - [ ] X-Content-Type-Options
     - [ ] Content-Security-Policy

2. **Caching Headers**
   - [ ] Static assets cached appropriately
   - [ ] HTML files have correct cache headers
   - [ ] CDN caching working

## Monitoring and Notifications

### ✅ Build Notifications

1. **Email Notifications**
   - [ ] Configure email addresses for notifications
   - [ ] Test build success notifications
   - [ ] Test build failure notifications

2. **Slack Integration (Optional)**
   - [ ] Configure Slack webhook
   - [ ] Test Slack notifications
   - [ ] Set appropriate notification levels

### ✅ Performance Monitoring

1. **Analytics Setup**
   - [ ] Google Analytics configured (if applicable)
   - [ ] Core Web Vitals tracking enabled
   - [ ] Error tracking configured

2. **AWS Monitoring**
   - [ ] CloudWatch logs accessible
   - [ ] Build metrics available
   - [ ] Performance metrics tracked

## Post-Deployment Tasks

### ✅ Documentation

1. **Team Documentation**
   - [ ] Document deployment process
   - [ ] Create troubleshooting guide
   - [ ] Document environment variables
   - [ ] Create rollback procedures

2. **Monitoring Setup**
   - [ ] Set up performance monitoring
   - [ ] Configure error alerting
   - [ ] Create monitoring dashboard

### ✅ Ongoing Maintenance

1. **Regular Tasks**
   - [ ] Monitor build success rates
   - [ ] Review performance metrics
   - [ ] Update dependencies regularly
   - [ ] Monitor security headers

2. **Optimization**
   - [ ] Optimize build times
   - [ ] Improve caching strategies
   - [ ] Monitor and optimize performance
   - [ ] Regular security reviews

## Troubleshooting Common Issues

### Build Failures

- **Environment Variables**: Ensure all required variables are set
- **Dependencies**: Check for missing or incompatible dependencies
- **Scripts**: Verify all referenced scripts exist and work
- **Memory**: Increase build timeout or optimize memory usage

### Deployment Issues

- **Static Export**: Ensure Next.js is configured for static export
- **File Paths**: Check for case-sensitive file path issues
- **Assets**: Verify all assets are included in build output

### Performance Issues

- **Bundle Size**: Use bundle analyzer to identify large dependencies
- **Images**: Ensure images are optimized
- **Caching**: Verify caching headers are set correctly
- **CDN**: Check CloudFront distribution settings

## Validation Commands

Run these commands to validate your setup:

```bash
# Validate build configuration
node scripts/amplify-build-validator.js

# Test build locally
npm run build
npm run export

# Validate environment
npm run env:validate

# Run tests
npm run test
npm run test:e2e

# Check content
npm run content:validate-structure
npm run content:validate
```

## Success Criteria

Your deployment is successful when:

- [ ] Build completes without errors
- [ ] Site is accessible via Amplify URL
- [ ] All functionality works correctly
- [ ] Performance metrics are acceptable
- [ ] Security headers are properly configured
- [ ] Monitoring and notifications are working
- [ ] Team can deploy changes successfully

## Next Steps

After successful deployment:

1. **Monitor Performance**: Set up ongoing performance monitoring
2. **Optimize**: Continuously optimize build times and site performance
3. **Scale**: Consider multi-environment setup for staging/production
4. **Security**: Regular security reviews and updates
5. **Documentation**: Keep deployment documentation updated
