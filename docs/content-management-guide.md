# Content Management Guide

## Overview

This guide explains how to add, edit, and manage content for the mobile-first
marketing website. The website uses a file-based content management system with
Markdown files and frontmatter for structured data.

## Table of Contents

1. [Content Structure](#content-structure)
2. [Blog Posts](#blog-posts)
3. [Services](#services)
4. [Testimonials](#testimonials)
5. [Site Configuration](#site-configuration)
6. [Images and Media](#images-and-media)
7. [Development Workflow](#development-workflow)
8. [Content Validation](#content-validation)
9. [Troubleshooting](#troubleshooting)

## Content Structure

All content is stored in the `content/` directory with the following structure:

```
content/
├── blog/           # Blog posts
├── services/       # Service pages
├── testimonials/   # Customer testimonials
└── pages/          # Static pages (future use)
```

### File Format

All content files use Markdown (`.md`) format with YAML frontmatter for
metadata:

```markdown
---
# Frontmatter (metadata)
title: 'Your Title Here'
date: '2024-01-15'
---

# Markdown Content

Your content goes here using standard Markdown syntax.
```

## Blog Posts

### Creating a New Blog Post

1. **Create the file**: Add a new `.md` file in `content/blog/`
2. **Use kebab-case naming**: `my-awesome-blog-post.md`
3. **Add required frontmatter**: See template below

### Blog Post Template

````markdown
---
title: 'Your Blog Post Title'
date: '2024-01-15'
author: 'Author Name'
excerpt:
  'A brief summary of your blog post that appears in listings and meta
  descriptions.'
featuredImage: '/images/blog/your-image.jpg'
categories: ['category1', 'category2']
tags: ['tag1', 'tag2', 'tag3']
featured: false
seoTitle: 'SEO Optimized Title | Your Site Name'
metaDescription: 'SEO meta description for search engines (150-160 characters).'
---

# Your Blog Post Title

Your blog content goes here using Markdown syntax.

## Subheading

- Bullet points
- More content
- Links: [Link text](https://example.com)

### Code Examples

```javascript
const example = 'code block';
```
````

## Images

![Alt text](/images/blog/image.jpg)

## Conclusion

Wrap up your post with a call to action or summary.

````

### Required Fields

- `title`: The blog post title
- `date`: Publication date in YYYY-MM-DD format
- `author`: Author name
- `excerpt`: Brief summary (used in listings and SEO)

### Optional Fields

- `featuredImage`: Path to hero image
- `categories`: Array of categories
- `tags`: Array of tags
- `featured`: Boolean (shows in featured sections)
- `seoTitle`: Custom SEO title
- `metaDescription`: Custom meta description

### Example Blog Post

```markdown
---
title: 'Getting Started with Mobile-First Design'
date: '2024-01-15'
author: 'Design Team'
excerpt: 'Learn the fundamentals of mobile-first design and why it matters for modern websites.'
featuredImage: '/images/blog/mobile-first-guide.jpg'
categories: ['design', 'mobile']
tags: ['mobile-first', 'responsive', 'ux']
featured: true
seoTitle: 'Mobile-First Design Guide | Marketing Website'
metaDescription: 'Complete guide to mobile-first design principles, benefits, and implementation strategies for modern websites.'
---

# Getting Started with Mobile-First Design

Mobile-first design has become essential in today's digital landscape...

## Why Mobile-First Matters

Over 70% of web traffic now comes from mobile devices...

## Implementation Tips

1. Start with mobile layouts
2. Use progressive enhancement
3. Optimize for touch interactions

[Contact us](/contact) to learn more about our design services.
````

## Services

### Creating a New Service

Services represent the main offerings of your business (Photography, Analytics,
Ad Campaigns, etc.).

### Service Template

```markdown
---
title: 'Service Name'
shortDescription: 'Brief one-line description of the service'
order: 1
icon: 'icon-name'
featuredImage: '/images/services/service-hero.jpg'
features:
  - 'Feature 1'
  - 'Feature 2'
  - 'Feature 3'
benefits:
  - 'Benefit 1'
  - 'Benefit 2'
  - 'Benefit 3'
pricing:
  startingPrice: 299
  currency: 'USD'
  billingPeriod: 'per month'
seoTitle: 'Service Name | Professional Marketing Services'
metaDescription: 'Professional service description for SEO purposes.'
---

# Service Name

Detailed description of your service goes here.

## What's Included

- Feature details
- Service benefits
- What clients can expect

## Process

1. Initial consultation
2. Strategy development
3. Implementation
4. Results tracking

## Get Started

Ready to get started? [Contact us](/contact) for a consultation.
```

### Required Fields

- `title`: Service name
- `shortDescription`: Brief description for cards/listings
- `order`: Display order (lower numbers appear first)
- `icon`: Icon identifier (used in UI components)
- `featuredImage`: Hero image for service page

### Optional Fields

- `features`: Array of service features
- `benefits`: Array of client benefits
- `pricing`: Pricing information object
- `seoTitle`: Custom SEO title
- `metaDescription`: Custom meta description

### Service Icons

Available icon options (add more in components as needed):

- `camera` - Photography services
- `chart` - Analytics services
- `megaphone` - Advertising/Marketing
- `design` - Design services
- `code` - Development services

## Testimonials

### Creating a New Testimonial

Testimonials showcase client feedback and build trust.

### Testimonial Template

```markdown
---
author: 'Client Name'
position: 'Job Title'
company: 'Company Name'
avatar: '/images/testimonials/client-photo.jpg'
rating: 5
featured: true
order: 1
serviceRelated: ['photography', 'analytics']
---

The testimonial content goes here. This is what the client said about working
with us. Keep it authentic and specific to build trust with potential clients.
```

### Required Fields

- `author`: Client's name
- `position`: Client's job title
- `rating`: Star rating (1-5)
- `order`: Display order

### Optional Fields

- `company`: Client's company name
- `avatar`: Path to client photo
- `featured`: Boolean (shows in featured sections)
- `serviceRelated`: Array of related service slugs

### Example Testimonial

```markdown
---
author: 'Sarah Johnson'
position: 'Marketing Director'
company: 'Tech Startup Inc.'
avatar: '/images/testimonials/sarah-johnson.jpg'
rating: 5
featured: true
order: 1
serviceRelated: ['photography', 'analytics']
---

Working with this team transformed our marketing approach. Their mobile-first
strategy increased our conversion rates by 150% in just three months. The
photography work was exceptional and really captured our brand essence.
```

## Site Configuration

### Main Site Config

Edit `src/config/site.ts` to update global site settings:

```typescript
export const siteConfig: SiteConfig = {
  title: 'Your Site Title',
  description: 'Site description for SEO',
  url: 'https://your-domain.com',
  logo: '/images/logo.svg',
  favicon: '/favicon.ico',
  socialMedia: {
    facebook: 'https://facebook.com/yourpage',
    twitter: 'https://twitter.com/yourhandle',
    linkedin: 'https://linkedin.com/company/yourcompany',
    instagram: 'https://instagram.com/yourhandle',
  },
  contact: {
    email: 'contact@your-domain.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, City, State 12345',
  },
  analytics: {
    googleAnalyticsId: 'GA_TRACKING_ID',
    facebookPixelId: 'FB_PIXEL_ID',
  },
};
```

### Hero Section Config

Edit `src/config/hero.ts` to update the homepage hero:

```typescript
export const heroConfig: HeroSection = {
  title: 'Your Main Headline',
  subtitle: 'Supporting text that explains your value proposition',
  ctaButtons: [
    {
      text: 'Primary CTA',
      href: '/contact',
      variant: 'primary',
      size: 'lg',
    },
    {
      text: 'Secondary CTA',
      href: '/services',
      variant: 'outline',
      size: 'lg',
    },
  ],
  backgroundImage: '/images/hero-bg.jpg',
  mobileOptimized: true,
};
```

## Images and Media

### Image Organization

Store images in the `public/images/` directory:

```
public/images/
├── blog/           # Blog post images
├── services/       # Service images
├── testimonials/   # Client photos
├── hero-bg.jpg     # Homepage hero
└── logo.svg        # Site logo
```

### Image Guidelines

1. **Optimization**: Compress images before uploading
2. **Formats**: Use WebP when possible, fallback to JPG/PNG
3. **Sizes**: Provide multiple sizes for responsive images
4. **Alt Text**: Always include descriptive alt text
5. **File Names**: Use descriptive, SEO-friendly names

### Responsive Images

The site uses optimized image components. Reference images like this:

```markdown
![Alt text](/images/blog/my-image.jpg)
```

The system automatically handles:

- Responsive sizing
- Format optimization
- Lazy loading
- Performance optimization

## Development Workflow

### Local Development

1. **Start the dev server**:

   ```bash
   npm run dev
   ```

2. **Add/edit content**: Make changes to files in `content/`

3. **Preview changes**: The site auto-reloads with your changes

4. **Validate content**: Run validation scripts:
   ```bash
   npm run content:validate
   ```

### Content Validation

The system includes built-in validation:

- **Automatic**: Content is validated when the site builds
- **Manual**: Run `npm run content:validate` to check all content
- **Real-time**: Errors appear in the console during development

### Common Validation Errors

1. **Missing required fields**: Add all required frontmatter fields
2. **Invalid date format**: Use YYYY-MM-DD format
3. **Invalid file names**: Use kebab-case for file names
4. **Missing images**: Ensure image paths are correct

## Adding New Pages

### Static Pages

To add a new static page (like About, Privacy Policy, etc.):

1. **Create the page component**: `src/app/page-name/page.tsx`
2. **Use the Layout wrapper**: Import and wrap content with `Layout`
3. **Add navigation**: Update navigation in `src/components/layout/Header.tsx`

### Example New Page

```typescript
// src/app/privacy/page.tsx
import { Metadata } from 'next';
import { Layout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Privacy Policy | Your Site Name',
  description: 'Our privacy policy and data handling practices.',
};

export default function PrivacyPage() {
  return (
    <Layout pageTitle='Privacy Policy'>
      <div className='container mx-auto px-4 py-16'>
        <h1 className='text-3xl font-bold mb-8'>Privacy Policy</h1>
        <div className='prose max-w-none'>
          {/* Your content here */}
        </div>
      </div>
    </Layout>
  );
}
```

### Dynamic Pages

For content-driven pages (like individual blog posts), the system automatically
generates pages based on content files.

## Content Best Practices

### SEO Optimization

1. **Unique titles**: Each page should have a unique, descriptive title
2. **Meta descriptions**: Write compelling 150-160 character descriptions
3. **Header structure**: Use proper H1, H2, H3 hierarchy
4. **Internal linking**: Link to related content within your site
5. **Image alt text**: Describe images for accessibility and SEO

### Writing Guidelines

1. **Mobile-first**: Write for mobile readers (shorter paragraphs, scannable
   content)
2. **Clear headings**: Use descriptive headings that help users scan
3. **Action-oriented**: Include clear calls-to-action
4. **Value-focused**: Emphasize benefits to the reader
5. **Consistent tone**: Maintain your brand voice throughout

### Performance Considerations

1. **Image sizes**: Optimize images before uploading
2. **Content length**: Balance detail with loading speed
3. **External links**: Use sparingly to avoid users leaving your site
4. **Media**: Compress videos and use appropriate formats

## Troubleshooting

### Common Issues

1. **Content not appearing**:
   - Check file naming (use kebab-case)
   - Verify frontmatter syntax
   - Ensure required fields are present

2. **Images not loading**:
   - Verify image paths start with `/`
   - Check file exists in `public/images/`
   - Ensure proper file extensions

3. **Build errors**:
   - Run `npm run content:validate`
   - Check console for specific errors
   - Verify all required fields are present

4. **Styling issues**:
   - Check Markdown syntax
   - Verify custom CSS classes exist
   - Test on different screen sizes

### Getting Help

1. **Check the console**: Development errors appear in browser console
2. **Validate content**: Run validation scripts to catch errors
3. **Test locally**: Always test changes in development before deploying
4. **Review examples**: Look at existing content files for reference

## Content Validation Scripts

The project includes several validation scripts:

```bash
# Validate all content
npm run content:validate

# Validate content structure
npm run content:validate-structure

# Test content processing
npm run content:test
```

### Validation Rules

- **Blog posts**: Must have title, date, author, excerpt
- **Services**: Must have title, shortDescription, order, icon, featuredImage
- **Testimonials**: Must have author, position, rating, order
- **Dates**: Must be in YYYY-MM-DD format
- **Images**: Must exist in public directory
- **Slugs**: Generated from filenames (kebab-case)

## Advanced Features

### Content Caching

The system includes intelligent caching:

- Content is cached for 5 minutes in development
- Cache automatically invalidates when files change
- Manual cache clearing available via `clearContentCache()`

### Content Filtering

Built-in filtering functions:

- `getFilteredPosts({ category, tag, featured, limit })`
- `getFeaturedPosts(limit)`
- `getPostsByCategory(category)`
- `searchPosts(query)`

### Content Search

Full-text search across:

- Post titles and content
- Service descriptions
- Categories and tags
- Author names

## Deployment

### Pre-deployment Checklist

1. **Validate all content**: `npm run content:validate`
2. **Test build**: `npm run build`
3. **Check images**: Ensure all referenced images exist
4. **Review SEO**: Verify titles and meta descriptions
5. **Test mobile**: Check responsive design

### Environment Variables

Set these in your deployment environment:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id
CONTACT_EMAIL=contact@your-domain.com
```

---

## Quick Reference

### File Naming

- Use kebab-case: `my-blog-post.md`
- No spaces or special characters
- Descriptive names for SEO

### Required Frontmatter

- **Blog**: title, date, author, excerpt
- **Service**: title, shortDescription, order, icon, featuredImage
- **Testimonial**: author, position, rating, order

### Image Paths

- Always start with `/`: `/images/blog/my-image.jpg`
- Store in `public/images/` directory
- Use descriptive filenames

### Common Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run content:validate # Validate all content
npm run test             # Run tests
```

This guide covers the essential aspects of content management for the
mobile-first marketing website. For additional help or advanced customization,
refer to the component documentation or contact the development team.
