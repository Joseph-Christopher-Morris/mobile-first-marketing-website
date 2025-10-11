# AWS Amplify Setup Guide

This guide provides step-by-step instructions for setting up AWS Amplify hosting
for the mobile-first marketing website.

## Prerequisites

- AWS Account with appropriate permissions
- GitHub repository with the website code
- Domain name (optional, for custom domain setup)

## Step 1: Create AWS Amplify Application

### 1.1 Connect GitHub Repository

1. **Access AWS Amplify Console**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "Get started" under "Host your web app"

2. **Connect Repository**
   - Select "GitHub" as your Git provider
   - Click "Continue"
   - Authorize AWS Amplify to access your GitHub account
   - Select your repository from the dropdown
   - Choose the `main` branch for deployment
   - Click "Next"

### 1.2 Configure Build Settings

1. **App Name**
   - Enter a descriptive name for your application
   - Example: `mobile-marketing-website`

2. **Build Settings Detection**
   - Amplify should automatically detect the `amplify.yml` file
   - Verify the build settings show:
     - Framework: Next.js - SSG
     - Build command: `npm run build`
     - Output directory: `out`

3. **Advanced Settings**
   - Leave the default settings for now
   - Environment variables will be configured in the next step

4. **Review and Deploy**
   - Review all settings
   - Click "Save and deploy"

### 1.3 Monitor Initial Deployment

1. **Build Process**
   - Watch the build logs in real-time
   - The initial build may fail due to missing environment variables
   - This is expected and will be resolved in the next step

2. **Build Phases**
   - **Provision**: AWS sets up the build environment
   - **Build**: Runs the commands from `amplify.yml`
   - **Deploy**: Publishes the built files to CloudFront
   - **Verify**: Runs post-deployment checks

## Step 2: Configure Custom Domain (Optional)

### 2.1 Add Custom Domain

1. **Domain Management**
   - In the Amplify console, go to "Domain management"
   - Click "Add domain"

2. **Domain Configuration**
   - Enter your domain name (e.g., `yourcompany.com`)
   - Choose to include `www` subdomain if desired
   - Click "Configure domain"

3. **DNS Configuration**
   - Follow the provided instructions to update your DNS records
   - Add the CNAME records to your domain registrar
   - SSL certificate will be automatically provisioned

### 2.2 Verify Domain Setup

1. **DNS Propagation**
   - Wait for DNS changes to propagate (can take up to 48 hours)
   - Use online DNS checkers to verify propagation

2. **SSL Certificate**
   - AWS will automatically provision an SSL certificate
   - Verify HTTPS is working once DNS is configured

## Step 3: Verify Build Configuration

### 3.1 Check amplify.yml Integration

The existing `amplify.yml` file includes:

- **Pre-build Phase**:
  - Dependency installation with `npm ci`
  - Environment validation
  - Content structure validation
  - TypeScript type checking

- **Build Phase**:
  - Next.js static build
  - Test execution

- **Post-build Phase**:
  - Cache optimization
  - CDN invalidation
  - Deployment monitoring

### 3.2 Security Headers

The configuration includes comprehensive security headers:

- Strict Transport Security (HSTS)
- Content Security Policy (CSP)
- X-Frame-Options, X-Content-Type-Options
- Referrer Policy and Permissions Policy

### 3.3 Caching Strategy

Optimized caching rules:

- Static assets: 1 year cache
- HTML files: 1 hour cache with revalidation
- API routes: No cache
- Service worker: No cache

## Step 4: Environment Variables Configuration

See the next section (4.2) for detailed environment variable setup.

## Troubleshooting

### Common Issues

1. **Build Fails with "Command not found"**
   - Verify all npm scripts exist in `package.json`
   - Check that dependencies are properly listed

2. **Environment Variable Errors**
   - Ensure all required variables are set in Amplify console
   - Variable names are case-sensitive

3. **Custom Domain Not Working**
   - Verify DNS records are correctly configured
   - Check that SSL certificate is issued

4. **Build Takes Too Long**
   - Check for large dependencies
   - Verify caching is working properly

### Build Optimization

The project includes several optimization features:

- Dependency caching for faster builds
- Build artifact caching
- Optimized Docker container usage
- Parallel processing where possible

### Monitoring and Alerts

Set up monitoring for:

- Build failures
- Performance regressions
- Security header compliance
- SSL certificate expiration

## Next Steps

After completing the Amplify application setup:

1. Configure environment variables (Task 4.2)
2. Test the deployment pipeline
3. Set up monitoring and alerts
4. Configure backup and rollback procedures
