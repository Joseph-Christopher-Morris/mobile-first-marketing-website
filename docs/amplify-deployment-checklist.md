# AWS Amplify Deployment Checklist

This checklist ensures your mobile-first marketing website is properly
configured for AWS Amplify deployment.

## Pre-Deployment Validation

### 1. Validate Project Configuration

```bash
# Validate Amplify setup
npm run amplify:validate

# Validate environment variables
npm run amplify:env-validate

# Generate environment configuration
npm run amplify:env-generate
```

### 2. Fix Any Validation Issues

- Update placeholder values in environment variables
- Ensure all required scripts are present
- Verify amplify.yml configuration

## AWS Amplify Setup Process

### Step 1: Create Amplify Application

1. **Access AWS Amplify Console**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "Get started" under "Host your web app"

2. **Connect GitHub Repository**
   - Select "GitHub" as Git provider
   - Authorize AWS Amplify
   - Select your repository
   - Choose `main` branch

3. **Configure Build Settings**
   - App name: `mobile-marketing-website`
   - Framework: Next.js - SSG (auto-detected)
   - Build command: `npm run build` (from amplify.yml)
   - Output directory: `out` (from amplify.yml)

4. **Review and Deploy**
   - Click "Save and deploy"
   - Initial build may fail due to missing environment variables (expected)

### Step 2: Configure Environment Variables

1. **Generate Configuration**

   ```bash
   npm run amplify:env-generate
   ```

2. **Add Variables to Amplify Console**
   - Go to "Environment variables" in Amplify console
   - Click "Manage variables"
   - Add each variable from the generated list:

   **Core Configuration:**

   ```
   NEXT_PUBLIC_SITE_URL=$AMPLIFY_APP_URL
   NEXT_PUBLIC_SITE_NAME=Your Company Name
   NEXT_PUBLIC_SITE_DESCRIPTION=Your site description
   CONTACT_EMAIL=contact@your-domain.com
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

   **Analytics (Optional):**

   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
   ```

   **Social Media (Optional):**

   ```
   NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/yourpage
   NEXT_PUBLIC_TWITTER_URL=https://twitter.com/yourhandle
   NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/yourcompany
   NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/yourhandle
   ```

3. **Save Configuration**
   - Click "Save" after adding all variables
   - Trigger a new deployment

### Step 3: Custom Domain Setup (Optional)

1. **Add Domain**
   - Go to "Domain management" in Amplify console
   - Click "Add domain"
   - Enter your domain name

2. **Configure DNS**
   - Add provided CNAME records to your domain registrar
   - Wait for DNS propagation (up to 48 hours)
   - SSL certificate will be automatically provisioned

### Step 4: Verify Deployment

1. **Monitor Build Process**
   - Watch build logs in real-time
   - Verify all build phases complete successfully:
     - Provision
     - Build (includes pre-build, build, post-build)
     - Deploy
     - Verify

2. **Test Deployed Site**
   - Visit the Amplify-provided URL
   - Test all major functionality
   - Verify environment variables are working
   - Check analytics integration (if configured)

## Build Process Overview

The `amplify.yml` configuration includes:

### Pre-Build Phase

- Install dependencies with `npm ci`
- Run build optimization
- Validate environment variables
- Validate content structure and integrity
- Type check the project
- Set dynamic environment variables

### Build Phase

- Build Next.js application with static export
- Run tests to ensure build quality

### Post-Build Phase

- Optimize caching and CDN configuration
- Invalidate CDN cache for new deployment
- Monitor deployment and generate reports

## Security and Performance Features

### Security Headers

- Strict Transport Security (HSTS)
- Content Security Policy (CSP)
- X-Frame-Options, X-Content-Type-Options
- Referrer Policy and Permissions Policy

### Caching Strategy

- Static assets: 1 year cache with immutable flag
- HTML files: 1 hour cache with revalidation
- API routes: No cache
- Service worker: No cache

### Redirects and Rewrites

- HTTP to HTTPS redirects
- www to non-www redirects (configurable)
- Clean URL handling
- Legacy URL redirects

## Troubleshooting

### Common Build Issues

1. **Environment Variable Errors**

   ```
   Error: Required environment variable NEXT_PUBLIC_SITE_URL is not set
   ```

   **Solution:** Ensure all required variables are set in Amplify Console

2. **Script Not Found Errors**

   ```
   Error: npm ERR! missing script: env:validate
   ```

   **Solution:** Verify all scripts exist in package.json

3. **Build Timeout** **Solution:** Check for large dependencies or infinite
   loops in build scripts

4. **Static Export Issues**
   ```
   Error: Image Optimization using Next.js' default loader is not compatible with `next export`
   ```
   **Solution:** Verify next.config.js is configured for static export

### Performance Issues

1. **Slow Build Times**
   - Enable build caching (configured in amplify.yml)
   - Optimize dependencies
   - Use npm ci instead of npm install

2. **Large Bundle Size**
   - Run bundle analyzer: `npm run analyze`
   - Optimize imports and dependencies
   - Enable tree shaking

### Monitoring and Alerts

Set up monitoring for:

- Build failures
- Performance regressions
- Security header compliance
- SSL certificate expiration
- Custom domain issues

## Post-Deployment Tasks

### 1. Verify Functionality

- [ ] Site loads correctly
- [ ] All pages are accessible
- [ ] Contact forms work (if configured)
- [ ] Analytics tracking works (if configured)
- [ ] Social media links work
- [ ] SEO meta tags are correct

### 2. Performance Testing

- [ ] Run Lighthouse audit
- [ ] Test mobile responsiveness
- [ ] Verify caching headers
- [ ] Check Core Web Vitals

### 3. Security Testing

- [ ] Verify HTTPS is working
- [ ] Check security headers
- [ ] Test CSP compliance
- [ ] Verify no sensitive data exposure

### 4. Set Up Monitoring

- [ ] Configure CloudWatch alarms
- [ ] Set up uptime monitoring
- [ ] Enable error tracking
- [ ] Configure performance monitoring

## Maintenance

### Regular Tasks

- Monitor build logs for warnings
- Update dependencies regularly
- Review and rotate API keys
- Monitor performance metrics
- Update content and ensure validation passes

### Emergency Procedures

- Rollback process using Amplify console
- Emergency contact information
- Backup and recovery procedures
- Incident response plan

## Support Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Next.js Static Export Guide](https://nextjs.org/docs/advanced-features/static-html-export)
- [Project Environment Configuration](./environment-configuration.md)
- [Amplify Setup Guide](./amplify-setup-guide.md)

---

**✅ Deployment Complete!**

Your mobile-first marketing website is now successfully deployed on AWS Amplify
with:

- Automated CI/CD pipeline
- Global CDN distribution
- SSL/TLS encryption
- Performance optimization
- Security headers
- Environment-specific configuration
