# Mobile-First Marketing Website

## 🚀 Migration Complete: AWS Amplify → S3/CloudFront

This project has been successfully migrated from AWS Amplify to S3 + CloudFront deployment.

### New Deployment Process
```bash
# Deploy to production
npm run deploy:production

# Set up new infrastructure (one-time)
npm run infrastructure:setup:production
```

### Live Site
- **Production URL**: https://d15sc9fc739ev2.cloudfront.net
- **Infrastructure**: S3 + CloudFront
- **Deployment**: Automated via GitHub Actions

For detailed deployment instructions, see `config/production-deployment-instructions.md`.

---


A modern, mobile-first marketing website built with Next.js, Tailwind CSS, and
the Zone UI kit. Optimized for mobile devices and hosted on AWS Amplify.

## Features

- 📱 Mobile-first responsive design
- ⚡ Static site generation for optimal performance
- 📝 Git-based content management with Markdown
- 🎨 Zone UI kit components
- 🚀 AWS Amplify hosting with CI/CD
- 📊 SEO optimized with analytics integration

## Services Showcased

- 📸 Photography
- 📈 Analytics
- 📢 Ad Campaigns

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd mobile-first-marketing-website
```

2. Install dependencies

```bash
npm install
```

3. Copy environment variables

```bash
cp .env.example .env.local
```

4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

## Content Management

Content is managed through Markdown files in the `content/` directory:

- `content/blog/` - Blog posts
- `content/services/` - Service pages
- `content/testimonials/` - Client testimonials
- `content/pages/` - Static pages

## Deployment

### Production Deployment
```bash
# Deploy to production S3/CloudFront
npm run deploy:production
```

### Infrastructure Setup (One-time)
```bash
# Set up production infrastructure
npm run infrastructure:setup:production
```

### Environment Configuration
Production environment variables are stored in `config/production.env`.

For detailed deployment instructions and troubleshooting, see:
- `config/production-deployment-instructions.md`
- `docs/s3-cloudfront-deployment-runbook.md`

### AWS Amplify Setup

The site is configured for automatic deployment on AWS Amplify with
comprehensive CI/CD pipeline.

#### Initial Setup

1. **Connect Repository**
   - Connect your Git repository to AWS Amplify
   - Select the main branch for production deployment

2. **Configure Build Settings**
   - The `amplify.yml` file contains all build configuration
   - Build settings are automatically detected

3. **Set Environment Variables**

   Configure these in AWS Amplify Console > App Settings > Environment
   Variables:

   **Required:**
   - `NEXT_PUBLIC_SITE_URL` - Your domain URL
   - `NEXT_PUBLIC_SITE_NAME` - Site name
   - `CONTACT_EMAIL` - Contact form recipient

   **Recommended:**
   - `NEXT_PUBLIC_GA_ID` - Google Analytics ID
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Email configuration
   - Social media URLs

4. **Custom Domain (Optional)**
   - Add your custom domain in Amplify Console
   - SSL certificate is automatically provisioned

#### Branch Configuration

- **main** → Production deployment
- **staging/develop** → Staging environment
- **feature branches** → Preview deployments

#### Deployment Process

1. Push code to configured branch
2. Amplify automatically detects changes
3. Build process runs (install → validate → build → test)
4. Static files deployed to CDN
5. Cache invalidation triggered
6. Deployment notifications sent

#### Manual Deployment

```bash
# Validate environment and build locally
npm run env:validate
npm run build

# Deploy via Amplify Console
# Go to Amplify Console > Select App > Redeploy
```

#### Environment Validation

```bash
# Validate required environment variables
npm run env:validate

# Validate content structure
npm run content:validate

# Full pre-deployment check
npm run prebuild
```

For detailed deployment configuration, see
[docs/amplify-deployment.md](docs/amplify-deployment.md).

## Performance

This website is optimized for mobile-first performance with:

- Core Web Vitals optimization
- Image optimization and lazy loading
- Code splitting and tree shaking
- CDN delivery through CloudFront

## License

This project is private and proprietary.
