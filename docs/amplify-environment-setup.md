# AWS Amplify Environment Variables Setup

This guide provides detailed instructions for configuring environment variables
in AWS Amplify for production deployment.

## Overview

Environment variables in AWS Amplify are configured through the Amplify Console
and are available during the build process. The variables are injected into the
build environment and can be accessed by Next.js during static site generation.

## Required Environment Variables

### Core Site Configuration

These variables are essential for the website to function properly:

```bash
# Site Identity
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Your Company Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your site description

# Contact Configuration
CONTACT_EMAIL=contact@your-domain.com

# Build Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max-old-space-size=4096
```

### AWS Amplify Specific Variables

These are automatically configured by Amplify but can be customized:

```bash
# Amplify Configuration (Auto-configured)
AMPLIFY_BRANCH=main
AMPLIFY_APP_ID=d1234567890123
AWS_REGION=us-east-1

# Dynamic Site URL (Set by Amplify)
AMPLIFY_APP_URL=https://main.d1234567890123.amplifyapp.com
```

## Optional but Recommended Variables

### Analytics and Tracking

```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345

# Hotjar
NEXT_PUBLIC_HOTJAR_ID=1234567
```

### Social Media Links

```bash
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/yourpage
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/yourhandle
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/yourcompany
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/yourhandle
```

### Email Configuration (Optional)

For contact form email functionality:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=true
```

### Performance and Optimization

```bash
# Performance Monitoring
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# Build Optimization
ANALYZE=false
GENERATE_SITEMAP=true
CONTENT_VALIDATION_STRICT=true

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

## Step-by-Step Configuration

### Step 1: Prepare Environment Variables

1. **Copy from .env.example**

   ```bash
   cp .env.example .env.production
   ```

2. **Edit .env.production**
   - Replace all placeholder values with your actual information
   - Remove any variables you don't need
   - Ensure all required variables are set

3. **Validate Configuration**
   ```bash
   npm run env:validate
   ```

### Step 2: Configure in AWS Amplify Console

1. **Access Environment Variables**
   - Go to AWS Amplify Console
   - Select your application
   - Click "Environment variables" in the left sidebar

2. **Add Variables**
   - Click "Manage variables"
   - For each variable in your `.env.production` file:
     - Click "Add variable"
     - Enter the variable name (key)
     - Enter the variable value
     - Click "Save"

3. **Special Considerations**
   - **NEXT_PUBLIC_SITE_URL**: Use your custom domain if configured, otherwise
     use the Amplify-provided URL
   - **AMPLIFY_APP_URL**: This is automatically set by Amplify
   - **NODE_ENV**: Always set to "production" for production builds

### Step 3: Configure Dynamic Site URL

The `NEXT_PUBLIC_SITE_URL` should be dynamically set based on the deployment:

1. **For Custom Domain**

   ```bash
   NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
   ```

2. **For Amplify Default Domain**
   ```bash
   NEXT_PUBLIC_SITE_URL=$AMPLIFY_APP_URL
   ```

The `amplify.yml` file already includes this configuration:

```yaml
preBuild:
  commands:
    - export NEXT_PUBLIC_SITE_URL=$AMPLIFY_APP_URL
```

### Step 4: Verify Environment Variable Inheritance

1. **Check Build Logs**
   - Trigger a new deployment
   - Monitor the build logs for environment validation
   - Look for the "Environment validation passed" message

2. **Test Variable Access**
   - Check that public variables are accessible in the browser
   - Verify server-side variables are available during build

## Environment Variable Categories

### Public Variables (NEXT*PUBLIC*\*)

These variables are embedded in the client-side JavaScript bundle:

- Available in both server and client code
- Visible to end users in the browser
- Should not contain sensitive information

### Server-Only Variables

These variables are only available during the build process:

- Used for server-side operations
- Not included in the client bundle
- Can contain sensitive information like API keys

## Security Best Practices

### Sensitive Information

- Never put sensitive data in `NEXT_PUBLIC_*` variables
- Use server-only variables for API keys and secrets
- Regularly rotate credentials and tokens

### Variable Validation

The project includes automatic validation:

```bash
# Validate all environment variables
npm run env:validate

# Test environment configuration
npm run env:test
```

## Troubleshooting

### Common Issues

1. **Build Fails with Missing Variables**

   ```
   Error: Required environment variable NEXT_PUBLIC_SITE_URL is not set
   ```

   **Solution**: Ensure all required variables are set in Amplify Console

2. **Variables Not Available in Client**

   ```
   Error: process.env.MY_VARIABLE is undefined
   ```

   **Solution**: Add `NEXT_PUBLIC_` prefix for client-side variables

3. **Dynamic URL Not Working**
   ```
   Error: AMPLIFY_APP_URL is not defined
   ```
   **Solution**: Verify the export command in amplify.yml preBuild phase

### Validation Commands

```bash
# Validate environment setup
npm run env:validate

# Test environment variables
npm run env:test

# Check build with current environment
npm run build
```

### Debug Environment Variables

Add this to your build logs to debug variable issues:

```bash
# In amplify.yml preBuild commands
- echo "AMPLIFY_APP_URL=$AMPLIFY_APP_URL"
- echo "NODE_ENV=$NODE_ENV"
- printenv | grep NEXT_PUBLIC
```

## Environment Variable Template

Use this template for your Amplify Console configuration:

```bash
# === REQUIRED VARIABLES ===
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Your Company Name
CONTACT_EMAIL=contact@your-domain.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# === ANALYTICS (Optional) ===
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# === SOCIAL MEDIA (Optional) ===
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/yourpage
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/yourhandle
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/yourcompany

# === PERFORMANCE (Optional) ===
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
ANALYZE=false
```

## Next Steps

After configuring environment variables:

1. Trigger a new deployment
2. Monitor build logs for validation
3. Test the deployed site functionality
4. Verify analytics and tracking (if configured)
5. Test contact forms (if email is configured)
