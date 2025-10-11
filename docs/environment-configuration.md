# Environment Configuration Guide

This guide explains how to configure environment variables for production
deployment on AWS Amplify.

## Required Environment Variables

### Site Configuration

**NEXT_PUBLIC_SITE_URL**

- **Description**: The production URL of your website
- **Example**: `https://yourcompany.com`
- **Required**: Yes (Production)
- **Setup**: Replace `your-production-domain.com` with your actual domain

**NEXT_PUBLIC_SITE_NAME**

- **Description**: The name of your website/company
- **Example**: `Acme Marketing Agency`
- **Required**: Yes
- **Setup**: Replace with your actual company/website name

**CONTACT_EMAIL**

- **Description**: Email address for contact form submissions
- **Example**: `contact@yourcompany.com`
- **Required**: Yes (Production)
- **Setup**: Use a valid email address you monitor

## Optional but Recommended Variables

### Analytics Configuration

**NEXT_PUBLIC_GA_ID**

- **Description**: Google Analytics 4 Measurement ID
- **Example**: `G-XXXXXXXXXX`
- **Setup**:
  1. Create a Google Analytics 4 property
  2. Copy the Measurement ID from Admin > Data Streams
  3. Replace `G-XXXXXXXXXX` with your actual ID

**NEXT_PUBLIC_GTM_ID**

- **Description**: Google Tag Manager Container ID
- **Example**: `GTM-XXXXXXX`
- **Setup**:
  1. Create a Google Tag Manager container
  2. Copy the Container ID
  3. Replace `GTM-XXXXXXX` with your actual ID

### Social Media Links

Update these with your actual social media profiles:

- **NEXT_PUBLIC_FACEBOOK_URL**: `https://facebook.com/yourpage`
- **NEXT_PUBLIC_TWITTER_URL**: `https://twitter.com/yourhandle`
- **NEXT_PUBLIC_LINKEDIN_URL**: `https://linkedin.com/company/yourcompany`
- **NEXT_PUBLIC_INSTAGRAM_URL**: `https://instagram.com/yourhandle`

### Email Configuration (Optional)

For contact form email functionality:

- **SMTP_HOST**: Your SMTP server (e.g., `smtp.gmail.com`)
- **SMTP_PORT**: SMTP port (usually `587` for TLS)
- **SMTP_USER**: Your SMTP username
- **SMTP_PASS**: Your SMTP password or app password

## AWS Amplify Setup

### Step 1: Copy Environment Variables

1. Open the `.env.production` file
2. Update all placeholder values with your actual information
3. Copy the configured variables

### Step 2: Configure in Amplify Console

1. Go to AWS Amplify Console
2. Select your app
3. Go to "Environment variables" in the left sidebar
4. Add each variable from `.env.production`:
   - Click "Manage variables"
   - Add each key-value pair
   - Save changes

### Step 3: Verify Configuration

After setting up variables in Amplify:

1. Trigger a new deployment
2. Check build logs for environment validation
3. Test the deployed site functionality

## Environment Validation

The project includes automatic environment validation:

```bash
# Validate current environment
npm run env:validate
```

This script checks:

- Required variables are present
- Recommended variables are configured
- Environment-specific requirements

## Security Notes

- Never commit `.env.production` with real values to version control
- Use strong, unique passwords for SMTP configuration
- Regularly rotate API keys and tokens
- Monitor access logs for your email and analytics accounts

## Troubleshooting

### Common Issues

1. **Build fails with missing environment variables**
   - Check that all required variables are set in Amplify Console
   - Verify variable names match exactly (case-sensitive)

2. **Contact forms not working**
   - Verify CONTACT_EMAIL is set and valid
   - Check SMTP configuration if using email sending

3. **Analytics not tracking**
   - Verify Google Analytics ID format (starts with G-)
   - Check that NEXT_PUBLIC_ENABLE_ANALYTICS=true

### Validation Commands

```bash
# Validate environment configuration
npm run env:validate

# Validate content structure
npm run content:validate-structure

# Run all pre-build validations
npm run prebuild
```
