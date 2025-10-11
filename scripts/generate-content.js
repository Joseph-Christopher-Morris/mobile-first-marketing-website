#!/usr/bin/env node

/**
 * Content generation script for creating template files
 * Helps maintain consistent content structure
 */

const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const CONTENT_DIR = path.join(process.cwd(), 'content');

// Content templates
const TEMPLATES = {
  blog: `---
title: "Your Blog Post Title"
date: "${format(new Date(), 'yyyy-MM-dd')}"
author: "Author Name"
excerpt: "A brief description of your blog post that will appear in previews."
featuredImage: "/images/blog/your-image.jpg"
categories: ["category1", "category2"]
tags: ["tag1", "tag2", "tag3"]
featured: false
seoTitle: "SEO Optimized Title | Your Site"
metaDescription: "SEO meta description for this blog post."
---

# Your Blog Post Title

Write your blog post content here using Markdown syntax.

## Section Heading

Your content goes here...
`,

  service: `---
title: "Your Service Name"
shortDescription: "Brief description of your service."
order: 1
icon: "icon-name"
featuredImage: "/images/services/your-service.jpg"
features:
  - "Feature 1"
  - "Feature 2"
  - "Feature 3"
benefits:
  - "Benefit 1"
  - "Benefit 2"
  - "Benefit 3"
pricing:
  startingPrice: 299
  currency: "USD"
  billingPeriod: "per month"
seoTitle: "Your Service | Your Company"
metaDescription: "Description of your service for search engines."
---

# Your Service Name

Detailed description of your service goes here.

## What's Included

- Feature details
- Service benefits
- What clients can expect

## Get Started

Contact us to learn more about this service.
`,

  testimonial: `---
author: "Client Name"
position: "Job Title"
company: "Company Name"
avatar: "/images/testimonials/client-name.jpg"
content: "The testimonial content goes here. Keep it authentic and specific."
rating: 5
featured: false
order: 1
serviceRelated: ["service-slug"]
---`,

  page: `---
title: "Page Title"
seoTitle: "SEO Title | Your Site"
metaDescription: "SEO description for this page."
---

# Page Title

Your page content goes here using Markdown syntax.
`,
};

function generateContent(type, filename) {
  if (!TEMPLATES[type]) {
    console.error(`❌ Unknown content type: ${type}`);
    console.log(`Available types: ${Object.keys(TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const contentPath = path.join(CONTENT_DIR, type);

  // Create directory if it doesn't exist
  if (!fs.existsSync(contentPath)) {
    fs.mkdirSync(contentPath, { recursive: true });
  }

  const filePath = path.join(contentPath, `${filename}.md`);

  if (fs.existsSync(filePath)) {
    console.error(`❌ File already exists: ${filePath}`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, TEMPLATES[type]);
  console.log(`✅ Created ${type} file: ${filePath}`);
}

// CLI interface
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Usage: npm run content:generate <type> <filename>');
  console.log('Types: blog, service, testimonial, page');
  console.log('Example: npm run content:generate blog my-new-post');
  process.exit(1);
}

const [type, filename] = args;
generateContent(type, filename);
