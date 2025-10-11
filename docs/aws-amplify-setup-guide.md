# AWS Amplify Setup Guide

## Prerequisites Checklist

✅ Project builds successfully locally  
✅ Environment variables configured  
✅ amplify.yml file ready  
✅ AWS account with Amplify access

## Step 2.1: Prepare for AWS Amplify

### 2.1.1 Verify AWS Account Access

**What you need:**

- AWS account with billing enabled
- IAM permissions for AWS Amplify (or admin access)

**To verify:**

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Sign in to your AWS account
3. Search for "Amplify" in the services search
4. Click on "AWS Amplify" to access the console

### 2.1.2 Create GitHub Repository

Since we don't have git locally, we'll create the repository through GitHub's
web interface:

**Steps:**

1. Go to [GitHub.com](https://github.com)
2. Click "New repository" (green button)
3. Repository settings:
   - **Name**: `mobile-first-marketing-website` (or your preferred name)
   - **Description**:
     `Mobile-first marketing website with Next.js and AWS Amplify`
   - **Visibility**: Public (recommended) or Private
   - **Initialize**: ✅ Add a README file
   - **Add .gitignore**: Node
   - **Choose a license**: MIT (optional)
4. Click "Create repository"

### 2.1.3 Upload Code to GitHub

**Option A: GitHub Web Interface (Recommended)**

1. In your new repository, click "uploading an existing file"
2. Drag and drop your entire project folder (excluding node_modules)
3. Or use "choose your files" to select all project files

**Important files to upload:**

- `amplify.yml` ⭐ **CRITICAL**
- `package.json` ⭐ **CRITICAL**
- `next.config.js` ⭐ **CRITICAL**
- All `src/` folder contents
- All `public/` folder contents
- All `content/` folder contents
- `.env.example` (but NOT .env.local or .env.production)
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`

**Files to EXCLUDE:**

- `node_modules/` folder
- `.next/` folder
- `out/` folder
- `.env.local`
- `.env.production`
- Any files with sensitive data

### 2.1.4 Verify Repository Accessibility

After uploading:

1. Verify `amplify.yml` is visible in the root directory
2. Check that `package.json` is present
3. Ensure all source files are uploaded correctly

## Step 2.2: Create Amplify Application

### 2.2.1 Access AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Make sure you're in your preferred AWS region (e.g., us-east-1)

### 2.2.2 Create New Amplify App

1. Click **"New app"** → **"Host web app"**
2. Choose **"GitHub"** as your Git provider
3. Click **"Continue"**

### 2.2.3 Connect GitHub Repository

1. **Authorize AWS Amplify** to access your GitHub account
2. **Select your repository** from the dropdown
3. **Select branch**: `main` (or `master` if that's your default)
4. Click **"Next"**

### 2.2.4 Verify Repository Connection

Amplify should automatically detect:

- ✅ Framework: Next.js
- ✅ Build settings from `amplify.yml`

## Step 2.3: Configure Build Settings

### 2.3.1 Verify amplify.yml Detection

Amplify should show your `amplify.yml` content. Verify it includes:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npm run env:validate
        # ... other commands
    build:
      commands:
        - npm run build
    postBuild:
      commands:
        - npm run cache:optimize
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
```

### 2.3.2 Configure Environment Variables

**CRITICAL**: Set these environment variables in Amplify Console:

**Required Variables:**

```
NEXT_PUBLIC_SITE_URL = https://your-amplify-url.amplifyapp.com
NEXT_PUBLIC_SITE_NAME = Your Marketing Website
CONTACT_EMAIL = contact@yourdomain.com
NODE_ENV = production
```

**Optional but Recommended:**

```
NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID = GTM-XXXXXXX
NEXT_PUBLIC_FACEBOOK_URL = https://facebook.com/yourpage
NEXT_PUBLIC_TWITTER_URL = https://twitter.com/yourhandle
NEXT_PUBLIC_LINKEDIN_URL = https://linkedin.com/company/yourcompany
NEXT_PUBLIC_INSTAGRAM_URL = https://instagram.com/yourhandle
```

**How to add them:**

1. In the build settings page, scroll to "Environment variables"
2. Click "Add environment variable"
3. Add each variable name and value
4. Click "Save"

### 2.3.3 Set Up Build Settings

**Verify these settings:**

- **App name**: Choose a meaningful name
- **Environment name**: `main` (or `production`)
- **Build settings**: Should auto-populate from `amplify.yml`

### 2.3.4 Review Deployment Configuration

**Final checklist before deployment:**

- ✅ Repository connected
- ✅ Branch selected (main)
- ✅ Build settings detected
- ✅ Environment variables configured
- ✅ amplify.yml file present

## Step 2.4: Deploy Your Application

1. Click **"Save and deploy"**
2. Amplify will start the build process
3. Monitor the build logs for any issues

**Build phases you'll see:**

1. **Provision** - Setting up build environment
2. **Build** - Running your build commands
3. **Deploy** - Deploying to CDN
4. **Verify** - Final verification

## Expected Build Time

- **First build**: 5-10 minutes
- **Subsequent builds**: 2-5 minutes

## Troubleshooting Common Issues

### Build Fails on Environment Variables

**Solution**: Double-check all required environment variables are set in Amplify
Console

### Build Fails on Dependencies

**Solution**: Ensure `package.json` and `package-lock.json` are both uploaded

### Build Fails on amplify.yml

**Solution**: Verify `amplify.yml` is in the root directory and properly
formatted

### Static Export Issues

**Expected**: Blog pages may fail (this is normal due to searchParams)
**Impact**: Core pages (home, about, services, contact) should still work

## Next Steps After Successful Deployment

1. **Test your deployed site** - Click the provided URL
2. **Set up custom domain** (optional)
3. **Configure monitoring and alerts**
4. **Set up CI/CD for future updates**

## Quick Reference Commands

If you need to test locally before deployment:

```bash
npm run env:validate
npm run build
npm run deploy:test-comprehensive
```

---

**Need Help?**

- Check the troubleshooting guide: `docs/troubleshooting-guide.md`
- Review deployment runbook: `docs/deployment-runbook.md`
