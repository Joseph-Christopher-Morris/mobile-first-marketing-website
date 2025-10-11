# AWS Amplify Deployment Troubleshooting Guide

## Quick Diagnosis Commands

```bash
# Run comprehensive diagnostic
npm run deploy:test-comprehensive

# Check environment configuration
npm run env:validate

# Validate build process
npm run amplify:test-deployment

# Monitor current deployment
npm run amplify:monitor
```

## Build Issues

### Build Fails During Pre-build Phase

#### Environment Variable Validation Errors

**Error Message**: `Environment validation failed: Missing required variable`

**Diagnosis**:

```bash
npm run env:validate
```

**Solutions**:

1. Check Amplify Console → App Settings → Environment variables
2. Ensure all required variables are set:
   - `NEXT_PUBLIC_SITE_URL`
   - `CONTACT_EMAIL`
3. Verify variable names match exactly (case-sensitive)
4. Check for trailing spaces or special characters

**Prevention**:

- Use `.env.example` as template
- Run `npm run env:validate` before deployment

#### Content Structure Validation Errors

**Error Message**: `Content validation failed: Invalid content structure`

**Diagnosis**:

```bash
npm run content:validate-structure
npm run content:validate
```

**Solutions**:

1. Check content files in `/content` directory
2. Verify markdown frontmatter format
3. Ensure all required fields are present
4. Check for malformed YAML in frontmatter

**Prevention**:

- Use content validation in pre-commit hooks
- Regular content structure audits

#### TypeScript Compilation Errors

**Error Message**: `Type check failed` or `TS2xxx: TypeScript error`

**Diagnosis**:

```bash
npm run type-check
npm run lint
```

**Solutions**:

1. Fix TypeScript errors locally first
2. Update type definitions if needed
3. Check for missing dependencies
4. Verify tsconfig.json configuration

**Prevention**:

- Use TypeScript in development
- Configure IDE with TypeScript support

### Build Fails During Build Phase

#### Next.js Build Errors

**Error Message**: `Build failed` or `next build failed`

**Diagnosis**:

```bash
npm run build
npm run analyze
```

**Solutions**:

1. Check for syntax errors in components
2. Verify all imports are correct
3. Check for missing dependencies
4. Review Next.js configuration

#### Test Failures During Build

**Error Message**: `Tests failed` or `Test suite failed`

**Diagnosis**:

```bash
npm run test
npm run test:e2e
```

**Solutions**:

1. Run tests locally to identify failures
2. Update test expectations if needed
3. Check for environment-specific test issues
4. Verify test data and fixtures

### Build Fails During Post-build Phase

#### Cache Optimization Errors

**Error Message**: `Cache optimization failed`

**Diagnosis**:

```bash
npm run cache:optimize
npm run caching:validate
```

**Solutions**:

1. Check cache configuration
2. Verify CDN settings
3. Review cache invalidation scripts
4. Check for permission issues

## Runtime Issues

### Site Not Loading

#### 404 Errors on All Pages

**Symptoms**: Site returns 404 for all routes

**Diagnosis**:

```bash
# Check build output
ls -la out/
# Verify static export
npm run export
```

**Solutions**:

1. Verify `baseDirectory: out` in amplify.yml
2. Check Next.js export configuration
3. Ensure static export completed successfully
4. Review CloudFront distribution settings

#### Blank White Page

**Symptoms**: Site loads but shows blank page

**Diagnosis**:

- Check browser console for JavaScript errors
- Verify network requests in browser dev tools
- Check if CSS is loading

**Solutions**:

1. Check for JavaScript runtime errors
2. Verify asset paths are correct
3. Check CSP headers aren't blocking resources
4. Review build output for missing files

### Contact Form Issues

#### Forms Not Submitting

**Symptoms**: Contact form submissions fail or hang

**Diagnosis**:

```bash
npm run deploy:test-comprehensive
```

**Solutions**:

1. Verify `CONTACT_EMAIL` environment variable
2. Check SMTP configuration if using email
3. Test form validation logic
4. Check for CORS issues

#### Email Not Sending

**Symptoms**: Form submits but emails not received

**Diagnosis**:

- Check email configuration
- Verify SMTP credentials
- Test email service connectivity

**Solutions**:

1. Verify SMTP settings:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
2. Check email service logs
3. Verify email templates
4. Test with different email providers

### Analytics and Tracking Issues

#### Google Analytics Not Working

**Symptoms**: No data in GA dashboard

**Diagnosis**:

```bash
npm run deploy:test-comprehensive
```

**Solutions**:

1. Verify `NEXT_PUBLIC_GA_ID` is set correctly
2. Check GA tracking code implementation
3. Test in browser dev tools (Network tab)
4. Verify GA property configuration

#### Social Media Links Broken

**Symptoms**: Social media links don't work or missing

**Diagnosis**:

- Check environment variables for social URLs
- Verify links in page source

**Solutions**:

1. Set social media environment variables:
   - `NEXT_PUBLIC_FACEBOOK_URL`
   - `NEXT_PUBLIC_TWITTER_URL`
   - `NEXT_PUBLIC_LINKEDIN_URL`
   - `NEXT_PUBLIC_INSTAGRAM_URL`
2. Check component implementation
3. Verify URL format (include https://)

## Performance Issues

### Slow Loading Times

#### High Time to First Byte (TTFB)

**Symptoms**: Site takes long time to start loading

**Diagnosis**:

```bash
npm run performance:monitor
npm run performance:budget
```

**Solutions**:

1. Check CDN cache hit rates
2. Optimize server response times
3. Review CloudFront configuration
4. Check for database query issues

#### Large Bundle Sizes

**Symptoms**: JavaScript bundles are too large

**Diagnosis**:

```bash
npm run analyze
```

**Solutions**:

1. Implement code splitting
2. Remove unused dependencies
3. Optimize images and assets
4. Use dynamic imports for large components

#### Poor Core Web Vitals

**Symptoms**: LCP, FID, or CLS scores are poor

**Diagnosis**:

```bash
npm run performance:vitals
npm run test:e2e:performance
```

**Solutions**:

1. **LCP Issues**:
   - Optimize largest content element
   - Preload critical resources
   - Optimize images
2. **FID Issues**:
   - Reduce JavaScript execution time
   - Use web workers for heavy tasks
   - Optimize event handlers
3. **CLS Issues**:
   - Set dimensions for images and videos
   - Avoid inserting content above existing content
   - Use CSS containment

### Cache Issues

#### Stale Content

**Symptoms**: Updated content not appearing

**Diagnosis**:

```bash
npm run caching:validate
```

**Solutions**:

1. Invalidate CloudFront cache:
   ```bash
   npm run cache:invalidate
   ```
2. Check cache headers configuration
3. Verify cache invalidation in deployment process
4. Review CDN cache policies

#### Cache Misses

**Symptoms**: Poor cache hit rates

**Diagnosis**:

- Check CloudFront metrics
- Review cache headers

**Solutions**:

1. Optimize cache headers
2. Review cache policies
3. Check for cache-busting parameters
4. Verify CDN configuration

## Security Issues

### Security Headers Missing

#### CSP Violations

**Symptoms**: Console errors about Content Security Policy

**Diagnosis**:

```bash
npm run security:csp
```

**Solutions**:

1. Review CSP configuration in amplify.yml
2. Add necessary domains to CSP
3. Test CSP policies thoroughly
4. Use CSP report-only mode for testing

#### Missing Security Headers

**Symptoms**: Security scanners report missing headers

**Diagnosis**:

```bash
npm run security:headers
npm run security:validate
```

**Solutions**:

1. Verify custom headers in amplify.yml
2. Check header implementation
3. Test headers with online tools
4. Update header configurations

### SSL/HTTPS Issues

#### Mixed Content Warnings

**Symptoms**: Browser warnings about insecure content

**Diagnosis**:

```bash
npm run security:https
```

**Solutions**:

1. Ensure all resources use HTTPS
2. Update hardcoded HTTP URLs
3. Check third-party integrations
4. Verify CDN SSL configuration

## Monitoring and Alerting Issues

### Alerts Not Working

#### Build Failure Notifications

**Symptoms**: Not receiving build failure alerts

**Solutions**:

1. Check notification settings in Amplify Console
2. Verify email addresses and Slack webhooks
3. Test notification channels
4. Review alert thresholds

#### Performance Alerts

**Symptoms**: Not receiving performance regression alerts

**Diagnosis**:

```bash
npm run performance:monitor
```

**Solutions**:

1. Check performance monitoring configuration
2. Verify alert thresholds
3. Test alert mechanisms
4. Review monitoring scripts

### Dashboard Issues

#### Monitoring Dashboard Not Loading

**Symptoms**: Dashboard shows errors or no data

**Diagnosis**:

```bash
npm run amplify:dashboard
```

**Solutions**:

1. Check dashboard dependencies
2. Verify data sources
3. Review dashboard configuration
4. Check for permission issues

## Emergency Procedures

### Site Down - Critical Issues

#### Immediate Response (< 5 minutes)

1. **Check Site Status**:

   ```bash
   curl -I https://your-domain.com
   ```

2. **Quick Rollback**:
   - Go to Amplify Console → Deployments
   - Promote last known good build

3. **Notify Stakeholders**:
   - Send status update
   - Estimate resolution time

#### Investigation (< 30 minutes)

1. **Check Recent Changes**:
   - Review recent commits
   - Check deployment logs
   - Verify environment changes

2. **Run Diagnostics**:

   ```bash
   npm run deploy:test-comprehensive
   npm run amplify:monitor
   ```

3. **Identify Root Cause**:
   - Check error logs
   - Review monitoring data
   - Test specific components

#### Resolution (< 2 hours)

1. **Fix Issues**:
   - Apply hotfix if possible
   - Revert problematic changes
   - Test fix thoroughly

2. **Deploy Fix**:

   ```bash
   git push origin main
   npm run amplify:monitor
   ```

3. **Verify Resolution**:
   ```bash
   npm run deploy:test-comprehensive
   ```

### Data Loss or Corruption

#### Immediate Response

1. **Stop Further Changes**:
   - Disable auto-deployments
   - Prevent additional commits

2. **Assess Damage**:
   - Check what data is affected
   - Verify backup availability

3. **Restore from Backup**:
   - Use git history for code
   - Restore content from backups
   - Verify data integrity

## Diagnostic Tools and Scripts

### Built-in Diagnostic Commands

```bash
# Comprehensive testing
npm run deploy:test-comprehensive

# Environment diagnostics
npm run env:validate
npm run env:test

# Build diagnostics
npm run amplify:test-deployment
npm run amplify:build-validate

# Performance diagnostics
npm run performance:validate
npm run performance:monitor

# Security diagnostics
npm run security:validate

# Content diagnostics
npm run content:validate-structure
npm run content:validate
```

### External Diagnostic Tools

- **AWS CloudWatch**: Monitor AWS resources
- **Google PageSpeed Insights**: Performance analysis
- **GTmetrix**: Performance and optimization
- **SSL Labs**: SSL configuration testing
- **Security Headers**: Security header validation

## Getting Help

### Internal Resources

1. **Documentation**: Check `/docs` directory
2. **Code Comments**: Review inline documentation
3. **Git History**: Check commit messages and PRs

### External Resources

1. **AWS Amplify Documentation**: https://docs.amplify.aws/
2. **Next.js Documentation**: https://nextjs.org/docs
3. **AWS Support**: Create support case for AWS issues

### Escalation Process

1. **Level 1**: Development team (< 2 hours)
2. **Level 2**: DevOps team (< 4 hours)
3. **Level 3**: AWS Support (< 8 hours)

### Emergency Contacts

- Development Team: [team-email]
- DevOps Team: [devops-email]
- AWS Support: [support-case-url]

---

## Prevention Checklist

### Before Each Deployment

- [ ] Run `npm run deploy:test-comprehensive`
- [ ] Validate environment variables
- [ ] Test build process locally
- [ ] Review recent changes
- [ ] Check monitoring dashboards

### Regular Maintenance

- [ ] Weekly performance reviews
- [ ] Monthly security audits
- [ ] Quarterly disaster recovery tests
- [ ] Update documentation regularly

### Monitoring Setup

- [ ] Build failure alerts configured
- [ ] Performance regression alerts active
- [ ] Security monitoring enabled
- [ ] Uptime monitoring in place
