# Images Directory Structure

This directory contains all images used throughout the mobile-first marketing
website. Images are organized by purpose and location for easy management.

## Directory Structure

```
public/images/
├── hero/           # Homepage hero background images
├── about/          # About page images (team photos, office, etc.)
├── blog/           # Blog post featured images and content images
├── services/       # Service page hero images and related graphics
├── testimonials/   # Customer photos and testimonial-related images
├── general/        # General purpose images used across the site
├── icons/          # Icon files and small graphics
└── README.md       # This file
```

## Image Guidelines

### File Naming

- Use descriptive, SEO-friendly names
- Use kebab-case: `mobile-first-hero.jpg`
- Include relevant keywords when appropriate
- Avoid spaces and special characters

### File Formats

- **JPEG**: For photographs and complex images
- **PNG**: For images with transparency or simple graphics
- **WebP**: Preferred format for better compression (when supported)
- **SVG**: For icons and simple vector graphics

### Image Sizes and Optimization

#### Hero Images (`hero/`)

- **Recommended size**: 1920x1080px (16:9 aspect ratio)
- **Mobile size**: 768x1024px (3:4 aspect ratio) for mobile-first design
- **File size**: Keep under 500KB after compression
- **Format**: JPEG or WebP

#### Blog Images (`blog/`)

- **Featured images**: 1200x630px (1.91:1 ratio for social sharing)
- **Content images**: 800x600px maximum
- **File size**: Keep under 200KB
- **Format**: JPEG or WebP

#### Service Images (`services/`)

- **Hero images**: 1200x800px (3:2 aspect ratio)
- **Icon images**: 64x64px or 128x128px
- **File size**: Keep under 300KB
- **Format**: JPEG for photos, PNG/SVG for icons

#### Testimonial Images (`testimonials/`)

- **Profile photos**: 200x200px (square)
- **File size**: Keep under 50KB
- **Format**: JPEG or PNG

#### About Page Images (`about/`)

- **Team photos**: 400x400px (square) for individual photos
- **Office/group photos**: 1200x800px (3:2 aspect ratio)
- **File size**: Keep under 200KB
- **Format**: JPEG

#### General Images (`general/`)

- **Various sizes** depending on usage
- **File size**: Keep under 200KB
- **Format**: Appropriate to content type

#### Icons (`icons/`)

- **Size**: 24x24px, 32x32px, 64x64px (multiple sizes)
- **Format**: SVG preferred, PNG as fallback
- **File size**: Keep under 10KB

## Current Images

### Hero Section

- `hero/hero-bg.jpg` - Main homepage hero background

### Blog Images

- `blog/mobile-first-design.jpg` - Mobile-first design principles post
- `blog/welcome-hero.jpg` - Welcome post hero image

### Service Images

- `services/photography-hero.jpg` - Photography service page hero
- `services/analytics-hero.jpg` - Analytics service page hero
- `services/ad-campaigns-hero.jpg` - Ad campaigns service page hero

### Testimonial Images

- `testimonials/sarah-johnson.jpg` - Sarah Johnson profile photo
- `testimonials/michael-chen.jpg` - Michael Chen profile photo
- `testimonials/lisa-rodriguez.jpg` - Lisa Rodriguez profile photo
- `testimonials/david-kim.jpg` - David Kim profile photo

## Adding New Images

### Step 1: Choose the Right Directory

Place your image in the appropriate subdirectory based on its purpose:

- Homepage hero → `hero/`
- Blog content → `blog/`
- Service pages → `services/`
- Team/about → `about/`
- Customer photos → `testimonials/`
- General use → `general/`
- Icons/graphics → `icons/`

### Step 2: Optimize Before Upload

1. **Resize** to appropriate dimensions
2. **Compress** to reduce file size
3. **Convert** to optimal format (WebP when possible)
4. **Name** descriptively using kebab-case

### Step 3: Update References

Update the relevant configuration files or content:

- Hero images: Update `src/config/hero.ts`
- Blog images: Add to blog post frontmatter
- Service images: Add to service content files
- About images: Reference in about page component

## Image Optimization Tools

### Online Tools

- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [Squoosh](https://squoosh.app/) - Modern image optimization
- [ImageOptim](https://imageoptim.com/) - Mac app for optimization

### Command Line Tools

```bash
# Install ImageMagick for batch processing
brew install imagemagick

# Resize image
convert input.jpg -resize 1920x1080^ -gravity center -extent 1920x1080 output.jpg

# Compress JPEG
convert input.jpg -quality 85 output.jpg

# Convert to WebP
convert input.jpg -quality 85 output.webp
```

## Responsive Images

The website automatically handles responsive images through the `OptimizedImage`
component. When you add images, the system will:

1. **Generate multiple sizes** for different screen sizes
2. **Serve appropriate format** (WebP when supported)
3. **Lazy load** images for better performance
4. **Add proper alt text** for accessibility

## SEO Considerations

### Alt Text

Always provide descriptive alt text for images:

```markdown
![Professional team working on mobile-first marketing strategy](/images/about/team-strategy.jpg)
```

### File Names

Use SEO-friendly file names:

- ✅ `mobile-first-marketing-hero.jpg`
- ❌ `IMG_1234.jpg`

### Image Sitemaps

Images are automatically included in the site's XML sitemap for better SEO.

## Performance Tips

1. **Compress images** before uploading
2. **Use appropriate formats** (WebP > JPEG > PNG)
3. **Provide multiple sizes** for responsive design
4. **Use lazy loading** (handled automatically)
5. **Optimize for mobile** (smaller images for mobile-first approach)

## Troubleshooting

### Image Not Displaying

1. Check file path starts with `/images/`
2. Verify file exists in correct directory
3. Check file name matches exactly (case-sensitive)
4. Ensure file format is supported

### Slow Loading

1. Check file size (compress if over recommended limits)
2. Verify image dimensions aren't excessive
3. Consider converting to WebP format

### Poor Quality

1. Check compression settings
2. Verify source image quality
3. Consider using higher quality settings for important images

## Best Practices Summary

1. **Organize by purpose** - Use the directory structure
2. **Optimize for mobile** - Mobile-first image strategy
3. **Compress appropriately** - Balance quality and file size
4. **Use descriptive names** - SEO and maintenance friendly
5. **Provide alt text** - Accessibility and SEO
6. **Test on devices** - Verify appearance on mobile and desktop
7. **Monitor performance** - Check loading times regularly

---

For questions about image management or optimization, refer to the main content
management guide or contact the development team.
