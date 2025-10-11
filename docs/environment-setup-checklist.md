# Environment Setup Checklist for AWS Amplify

## 🔧 Required Updates Before Deployment

Your environment validation is passing, but you need to update placeholder
values with your actual production information.

### 1. Site Configuration (Required)

- [ ] **NEXT_PUBLIC_SITE_URL**: Update `https://your-production-domain.com` with
      your actual domain
- [ ] **NEXT_PUBLIC_SITE_NAME**: Update `Your Marketing Website` with your
      actual site name
- [ ] **CONTACT_EMAIL**: Update `contact@your-production-domain.com` with your
      actual contact email

### 2. Analytics (Optional but Recommended)

- [ ] **NEXT_PUBLIC_GA_ID**: Replace `G-XXXXXXXXXX` with your Google Analytics
      ID
- [ ] **NEXT_PUBLIC_GTM_ID**: Replace `GTM-XXXXXXX` with your Google Tag Manager
      ID
- [ ] **NEXT_PUBLIC_FACEBOOK_PIXEL_ID**: Add your Facebook Pixel ID if you use
      Facebook ads

### 3. Social Media Links (Update with your actual URLs)

- [ ] **NEXT_PUBLIC_FACEBOOK_URL**: Update `https://facebook.com/yourpage`
- [ ] **NEXT_PUBLIC_TWITTER_URL**: Update `https://twitter.com/yourhandle`
- [ ] **NEXT_PUBLIC_LINKEDIN_URL**: Update
      `https://linkedin.com/company/yourcompany`
- [ ] **NEXT_PUBLIC_INSTAGRAM_URL**: Update `https://instagram.com/yourhandle`

### 4. Email Configuration (Optional - for contact forms)

- [ ] **SMTP_USER**: Add your SMTP username if using email functionality
- [ ] **SMTP_PASS**: Add your SMTP password if using email functionality

## 🚀 AWS Amplify Setup Steps

### Step 1: Update .env.production

1. Open `.env.production` file
2. Replace all placeholder values with your actual information
3. Save the file

### Step 2: Prepare for AWS Amplify Console

When you set up AWS Amplify, you'll need to add these environment variables in
the Amplify Console:

**Required Variables:**

```
NEXT_PUBLIC_SITE_URL=https://your-actual-domain.com
NEXT_PUBLIC_SITE_NAME=Your Actual Site Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your actual site description
CONTACT_EMAIL=your-actual-contact@email.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**Optional Variables (add if you have them):**

```
NEXT_PUBLIC_GA_ID=G-YOUR-ACTUAL-ID
NEXT_PUBLIC_GTM_ID=GTM-YOUR-ACTUAL-ID
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your-pixel-id
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

### Step 3: GitHub Repository Preparation

- [ ] Commit all changes to your repository
- [ ] Push changes to the main branch
- [ ] Ensure your repository is accessible to AWS Amplify

## ✅ Current Status

- [x] Environment validation script created
- [x] Basic environment structure configured
- [x] Build process validated
- [ ] Production values updated (placeholder values detected)
- [ ] AWS Amplify app created
- [ ] Environment variables added to Amplify Console

## 🔄 Next Steps

1. Update placeholder values in `.env.production`
2. Run validation again: `node scripts/validate-production-env.js`
3. Commit and push changes to GitHub
4. Create AWS Amplify application
5. Add environment variables to Amplify Console
6. Deploy!
