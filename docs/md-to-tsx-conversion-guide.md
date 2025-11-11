# MD to TSX Blog Conversion Guide

## Overview

This guide explains how to convert Markdown blog posts to TSX format for the Vivid Auto website using the automated conversion script.

## Prerequisites

- Node.js installed
- Required dependencies: `gray-matter` and `marked` (installed as dev dependencies)

## Directory Structure

```
content/
├── md/                    # Source Markdown files
│   └── *.md              # Your markdown blog posts
src/
├── content/
│   └── blog/             # Generated TSX files
│       └── *.ts          # Converted blog posts
scripts/
└── md-to-tsx.js          # Conversion script
```

## Markdown File Format

Your Markdown files should include frontmatter with blog metadata:

```markdown
---
title: "Your Blog Post Title"
excerpt: "A brief description of your post"
date: "2025-11-04"
author: "Joe from Vivid Auto"
category: "Case Study"
tags: ["tag1", "tag2", "tag3"]
image: "/images/blog/your-image.webp"
readTime: 7
featured: false
---

# Your Blog Content

Your markdown content goes here...
```

## Conversion Process

### Step 1: Add Markdown Files

Place your `.md` files in the `content/md/` directory.

### Step 2: Run Conversion Script

```bash
node scripts/md-to-tsx.js
```

### Step 3: Review Generated Files

The script will create corresponding `.ts` files in `src/content/blog/` with:
- Proper TypeScript imports
- BlogPost interface compliance
- HTML-converted content
- Escaped strings for safe rendering

### Step 4: Manual Adjustments

After conversion, review each generated file for:
- Image path corrections
- Category and tag adjustments
- Read time estimates
- Featured post settings
- Content formatting tweaks

### Step 5: Build and Deploy

```bash
npm run build
# Deploy using your standard deployment process
```

## Features

### Automatic Processing
- ✅ Frontmatter extraction
- ✅ Markdown to HTML conversion
- ✅ Slug generation from filename
- ✅ Proper string escaping
- ✅ TypeScript compliance

### Fallback Defaults
- Title: Generated from filename
- Date: 2025-01-01
- Author: "Joe from Vivid Auto"
- Category: "Case Study"
- Tags: Empty array
- Image: "/images/blog/default.jpg"
- Read Time: 7 minutes
- Featured: false

## Example Conversion

**Input** (`content/md/sample-post.md`):
```markdown
---
title: "My Great Blog Post"
excerpt: "This post is amazing"
date: "2025-11-04"
---

# Hello World

This is **bold** text.
```

**Output** (`src/content/blog/sample-post.ts`):
```typescript
import { BlogPost } from '../../lib/blog-types';

const post: BlogPost = {
  slug: "sample-post",
  title: "My Great Blog Post",
  excerpt: "This post is amazing",
  content: "<h1>Hello World</h1>\n<p>This is <strong>bold</strong> text.</p>\n",
  date: "2025-11-04",
  author: "Joe from Vivid Auto",
  category: "Case Study",
  tags: [],
  image: "/images/blog/default.jpg",
  readTime: 7,
  featured: false,
};

export default post;
```

## Troubleshooting

### Common Issues

1. **No .md files found**: Ensure files are in `content/md/` directory
2. **Build errors**: Check for unescaped quotes or special characters
3. **Missing images**: Update image paths after conversion
4. **Incorrect metadata**: Review and adjust frontmatter values

### Script Errors

- **ENOENT error**: Source directory doesn't exist (script will create it)
- **Permission errors**: Check file/directory permissions
- **Parsing errors**: Verify Markdown syntax and frontmatter format

## Best Practices

1. **Consistent Frontmatter**: Use the same frontmatter structure across all files
2. **Image Optimization**: Ensure all referenced images exist in `/public/images/blog/`
3. **SEO-Friendly Slugs**: Use descriptive filenames that become good URL slugs
4. **Content Review**: Always review generated HTML for formatting issues
5. **Backup**: Keep original Markdown files as backup

## Integration with Existing Blog System

The converted TSX files integrate seamlessly with the existing blog system:
- Automatic discovery by the blog API
- Compatible with existing blog components
- Maintains SEO and performance optimizations
- Works with the current deployment pipeline

## Maintenance

- Run the script whenever you add new Markdown files
- The script is idempotent - safe to run multiple times
- Generated files can be manually edited after conversion
- Keep the script updated if BlogPost interface changes