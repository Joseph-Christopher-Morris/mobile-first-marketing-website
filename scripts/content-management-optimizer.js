#!/usr/bin/env node

/**
 * Content Management Optimizer
 * Streamlines blog and service page management with SEO optimization
 */

const fs = require('fs');
const path = require('path');

class ContentManagementOptimizer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      blog: { posts: 0, issues: [], optimizations: [] },
      services: { pages: 0, issues: [], optimizations: [] },
      seo: { score: 0, issues: [], recommendations: [] },
      images: { total: 0, optimized: 0, issues: [] }
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async optimizeBlogContent() {
    this.log('\n📝 Optimizing Blog Content...', 'info');

    try {
      const blogDir = 'src/content/blog';
      if (!fs.existsSync(blogDir)) {
        this.results.blog.issues.push('Blog directory not found');
        return;
      }

      const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts'));
      this.results.blog.posts = blogFiles.length;

      this.log(`Found ${blogFiles.length} blog posts`, 'info');

      for (const file of blogFiles) {
        await this.analyzeBlogPost(path.join(blogDir, file));
      }

      // Check blog page implementation
      const blogPagePath = 'src/app/blog/page.tsx';
      if (fs.existsSync(blogPagePath)) {
        await this.analyzeBlogPage(blogPagePath);
      } else {
        this.results.blog.issues.push('Blog page (src/app/blog/page.tsx) not found');
      }

      // Check individual blog post pages
      const blogSlugPath = 'src/app/blog/[slug]/page.tsx';
      if (fs.existsSync(blogSlugPath)) {
        await this.analyzeBlogSlugPage(blogSlugPath);
      } else {
        this.results.blog.issues.push('Blog slug page not found');
      }

    } catch (error) {
      this.log(`✗ Blog optimization failed: ${error.message}`, 'error');
      this.results.blog.issues.push(`Optimization error: ${error.message}`);
    }
  }

  async analyzeBlogPost(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.ts');

    // Check for required metadata
    const requiredFields = ['title', 'description', 'publishedAt', 'image', 'tags'];
    const missingFields = requiredFields.filter(field => !content.includes(`${field}:`));

    if (missingFields.length > 0) {
      this.results.blog.issues.push(`${fileName}: Missing fields - ${missingFields.join(', ')}`);
    }

    // Check for SEO optimization
    if (!content.includes('metaDescription') && !content.includes('description:')) {
      this.results.blog.issues.push(`${fileName}: Missing meta description`);
    }

    // Check for image optimization
    const imageMatches = content.match(/image:\s*['"`]([^'"`]+)['"`]/);
    if (imageMatches) {
      const imagePath = imageMatches[1];
      if (!imagePath.includes('.webp') && !imagePath.includes('optimized')) {
        this.results.blog.issues.push(`${fileName}: Image not optimized - ${imagePath}`);
      }
    }

    // Check for internal linking
    if (!content.includes('href=') && !content.includes('Link')) {
      this.results.seo.recommendations.push(`${fileName}: Add internal links to improve SEO`);
    }

    // Check content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 300) {
      this.results.seo.recommendations.push(`${fileName}: Content too short (${wordCount} words) - aim for 500+ words`);
    }

    // Check for structured data
    if (!content.includes('schema') && !content.includes('StructuredData')) {
      this.results.seo.recommendations.push(`${fileName}: Add structured data for better SEO`);
    }
  }

  async analyzeBlogPage(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for pagination
    if (!content.includes('pagination') && !content.includes('page')) {
      this.results.blog.issues.push('Blog page missing pagination');
    }

    // Check for search functionality
    if (!content.includes('search') && !content.includes('filter')) {
      this.results.blog.optimizations.push('Add search/filter functionality to blog page');
    }

    // Check for categories/tags
    if (!content.includes('category') && !content.includes('tag')) {
      this.results.blog.optimizations.push('Add category/tag filtering to blog page');
    }

    // Check for RSS feed
    if (!content.includes('rss') && !content.includes('feed')) {
      this.results.blog.optimizations.push('Add RSS feed for blog');
    }
  }

  async analyzeBlogSlugPage(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for dynamic metadata
    if (!content.includes('generateMetadata') && !content.includes('metadata')) {
      this.results.blog.issues.push('Blog slug page missing dynamic metadata generation');
    }

    // Check for structured data
    if (!content.includes('StructuredData') && !content.includes('schema')) {
      this.results.blog.issues.push('Blog slug page missing structured data');
    }

    // Check for social sharing
    if (!content.includes('share') && !content.includes('social')) {
      this.results.blog.optimizations.push('Add social sharing buttons to blog posts');
    }

    // Check for related posts
    if (!content.includes('related') && !content.includes('similar')) {
      this.results.blog.optimizations.push('Add related posts section');
    }
  }

  async optimizeServicePages() {
    this.log('\n🛠️  Optimizing Service Pages...', 'info');

    try {
      const servicesDir = 'src/app/services';
      if (!fs.existsSync(servicesDir)) {
        this.results.services.issues.push('Services directory not found');
        return;
      }

      const serviceDirs = fs.readdirSync(servicesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      this.results.services.pages = serviceDirs.length;
      this.log(`Found ${serviceDirs.length} service pages`, 'info');

      for (const serviceDir of serviceDirs) {
        await this.analyzeServicePage(path.join(servicesDir, serviceDir, 'page.tsx'));
      }

      // Check main services page
      const mainServicesPath = path.join(servicesDir, 'page.tsx');
      if (fs.existsSync(mainServicesPath)) {
        await this.analyzeMainServicesPage(mainServicesPath);
      }

    } catch (error) {
      this.log(`✗ Service page optimization failed: ${error.message}`, 'error');
      this.results.services.issues.push(`Optimization error: ${error.message}`);
    }
  }

  async analyzeServicePage(filePath) {
    if (!fs.existsSync(filePath)) {
      const serviceName = path.basename(path.dirname(filePath));
      this.results.services.issues.push(`${serviceName}: page.tsx not found`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const serviceName = path.basename(path.dirname(filePath));

    // Check for metadata
    if (!content.includes('metadata') && !content.includes('title')) {
      this.results.services.issues.push(`${serviceName}: Missing metadata`);
    }

    // Check for structured data
    if (!content.includes('StructuredData') && !content.includes('schema')) {
      this.results.services.issues.push(`${serviceName}: Missing structured data`);
    }

    // Check for call-to-action
    if (!content.includes('CTA') && !content.includes('Contact') && !content.includes('button')) {
      this.results.services.issues.push(`${serviceName}: Missing call-to-action`);
    }

    // Check for testimonials
    if (!content.includes('testimonial') && !content.includes('review')) {
      this.results.services.optimizations.push(`${serviceName}: Add testimonials section`);
    }

    // Check for pricing information
    if (!content.includes('price') && !content.includes('cost') && !content.includes('£')) {
      this.results.services.optimizations.push(`${serviceName}: Consider adding pricing information`);
    }

    // Check for FAQ section
    if (!content.includes('FAQ') && !content.includes('question')) {
      this.results.services.optimizations.push(`${serviceName}: Add FAQ section`);
    }

    // Check for portfolio/examples
    if (!content.includes('portfolio') && !content.includes('example') && !content.includes('gallery')) {
      this.results.services.optimizations.push(`${serviceName}: Add portfolio/examples section`);
    }
  }

  async analyzeMainServicesPage(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for service overview
    if (!content.includes('ServiceCard') && !content.includes('service')) {
      this.results.services.issues.push('Main services page missing service overview');
    }

    // Check for navigation
    if (!content.includes('Link') && !content.includes('href')) {
      this.results.services.issues.push('Main services page missing navigation links');
    }
  }

  async optimizeSEO() {
    this.log('\n🔍 Optimizing SEO...', 'info');

    try {
      let seoScore = 0;
      const maxScore = 100;

      // Check for sitemap
      if (fs.existsSync('public/sitemap.xml')) {
        seoScore += 10;
        this.log('✓ Sitemap found', 'success');
      } else {
        this.results.seo.issues.push('Sitemap not found');
        this.results.seo.recommendations.push('Generate and deploy sitemap.xml');
      }

      // Check for robots.txt
      if (fs.existsSync('public/robots.txt')) {
        seoScore += 10;
        this.log('✓ Robots.txt found', 'success');
      } else {
        this.results.seo.issues.push('Robots.txt not found');
        this.results.seo.recommendations.push('Create robots.txt file');
      }

      // Check for structured data components
      const structuredDataPath = 'src/components/seo/StructuredData.tsx';
      if (fs.existsSync(structuredDataPath)) {
        seoScore += 15;
        this.log('✓ Structured data component found', 'success');
      } else {
        this.results.seo.issues.push('Structured data component not found');
      }

      // Check for meta tags in layout
      const layoutPath = 'src/app/layout.tsx';
      if (fs.existsSync(layoutPath)) {
        const content = fs.readFileSync(layoutPath, 'utf8');
        
        if (content.includes('metadata')) {
          seoScore += 15;
        } else {
          this.results.seo.issues.push('Layout missing metadata configuration');
        }

        if (content.includes('viewport')) {
          seoScore += 10;
        } else {
          this.results.seo.issues.push('Layout missing viewport meta tag');
        }
      }

      // Check for Open Graph tags
      const hasOpenGraph = this.checkForOpenGraph();
      if (hasOpenGraph) {
        seoScore += 15;
      } else {
        this.results.seo.recommendations.push('Add Open Graph meta tags for social sharing');
      }

      // Check for Twitter Card tags
      const hasTwitterCards = this.checkForTwitterCards();
      if (hasTwitterCards) {
        seoScore += 10;
      } else {
        this.results.seo.recommendations.push('Add Twitter Card meta tags');
      }

      // Check for canonical URLs
      const hasCanonical = this.checkForCanonicalUrls();
      if (hasCanonical) {
        seoScore += 15;
      } else {
        this.results.seo.recommendations.push('Add canonical URLs to prevent duplicate content');
      }

      this.results.seo.score = Math.round((seoScore / maxScore) * 100);
      this.log(`SEO Score: ${this.results.seo.score}%`, 
        this.results.seo.score >= 80 ? 'success' : 
        this.results.seo.score >= 60 ? 'warning' : 'error');

    } catch (error) {
      this.log(`✗ SEO optimization failed: ${error.message}`, 'error');
      this.results.seo.issues.push(`SEO analysis error: ${error.message}`);
    }
  }

  checkForOpenGraph() {
    const files = this.findFiles('src', /\.(tsx|ts)$/);
    return files.some(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('og:') || content.includes('openGraph');
    });
  }

  checkForTwitterCards() {
    const files = this.findFiles('src', /\.(tsx|ts)$/);
    return files.some(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('twitter:') || content.includes('twitterCard');
    });
  }

  checkForCanonicalUrls() {
    const files = this.findFiles('src', /\.(tsx|ts)$/);
    return files.some(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('canonical') || content.includes('rel="canonical"');
    });
  }

  async optimizeImages() {
    this.log('\n🖼️  Optimizing Content Images...', 'info');

    try {
      const imageDirectories = ['public', 'src/assets', 'public/images'];
      let totalImages = 0;
      let optimizedImages = 0;

      for (const dir of imageDirectories) {
        if (fs.existsSync(dir)) {
          const images = this.findFiles(dir, /\.(jpg|jpeg|png|gif|webp|svg)$/i);
          totalImages += images.length;

          for (const imagePath of images) {
            const stats = fs.statSync(imagePath);
            const sizeKB = Math.round(stats.size / 1024);
            
            // Check if image is optimized
            if (imagePath.includes('.webp') || sizeKB < 100) {
              optimizedImages++;
            } else if (sizeKB > 500) {
              this.results.images.issues.push(`Large image: ${imagePath} (${sizeKB}KB)`);
            }

            // Check for alt text usage in components
            const imageFileName = path.basename(imagePath);
            const componentsUsingImage = this.findComponentsUsingImage(imageFileName);
            
            for (const component of componentsUsingImage) {
              const content = fs.readFileSync(component, 'utf8');
              if (!content.includes('alt=') || content.includes('alt=""')) {
                this.results.images.issues.push(`Missing alt text for ${imageFileName} in ${path.basename(component)}`);
              }
            }
          }
        }
      }

      this.results.images.total = totalImages;
      this.results.images.optimized = optimizedImages;

      const optimizationRate = totalImages > 0 ? Math.round((optimizedImages / totalImages) * 100) : 0;
      this.log(`Image optimization: ${optimizationRate}% (${optimizedImages}/${totalImages})`, 
        optimizationRate >= 80 ? 'success' : 'warning');

    } catch (error) {
      this.log(`✗ Image optimization failed: ${error.message}`, 'error');
      this.results.images.issues.push(`Image analysis error: ${error.message}`);
    }
  }

  findComponentsUsingImage(imageFileName) {
    const components = this.findFiles('src', /\.(tsx|ts)$/);
    return components.filter(component => {
      const content = fs.readFileSync(component, 'utf8');
      return content.includes(imageFileName);
    });
  }

  findFiles(dir, pattern, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.findFiles(filePath, pattern, fileList);
      } else if (stat.isFile() && pattern.test(file)) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  async generateContentReport() {
    const reportPath = `content-optimization-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    this.log(`\n📄 Content report saved: ${reportPath}`, 'success');
    return reportPath;
  }

  async generateActionPlan() {
    const actionPlan = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    // Immediate actions (critical issues)
    if (this.results.blog.issues.length > 0) {
      actionPlan.immediate.push('Fix blog content issues');
    }
    if (this.results.services.issues.length > 0) {
      actionPlan.immediate.push('Fix service page issues');
    }
    if (this.results.seo.score < 60) {
      actionPlan.immediate.push('Improve SEO fundamentals');
    }

    // Short-term actions (optimizations)
    actionPlan.shortTerm = [
      ...this.results.blog.optimizations.slice(0, 3),
      ...this.results.services.optimizations.slice(0, 3),
      ...this.results.seo.recommendations.slice(0, 3)
    ];

    // Long-term actions (enhancements)
    actionPlan.longTerm = [
      'Implement advanced SEO features',
      'Add content personalization',
      'Optimize for Core Web Vitals',
      'Implement A/B testing for content'
    ];

    const planPath = 'content-action-plan.json';
    fs.writeFileSync(planPath, JSON.stringify(actionPlan, null, 2));
    
    this.log(`📋 Action plan saved: ${planPath}`, 'success');
    return actionPlan;
  }

  async run() {
    this.log('📝 Starting Content Management Optimization...', 'info');

    await this.optimizeBlogContent();
    await this.optimizeServicePages();
    await this.optimizeSEO();
    await this.optimizeImages();

    const reportPath = await this.generateContentReport();
    const actionPlan = await this.generateActionPlan();

    this.log('\n' + '='.repeat(60), 'success');
    this.log('📝 CONTENT OPTIMIZATION COMPLETED!', 'success');
    this.log('='.repeat(60), 'success');
    this.log(`Blog Posts: ${this.results.blog.posts}`, 'info');
    this.log(`Service Pages: ${this.results.services.pages}`, 'info');
    this.log(`SEO Score: ${this.results.seo.score}%`, 'info');
    this.log(`Image Optimization: ${Math.round((this.results.images.optimized / this.results.images.total) * 100)}%`, 'info');
    this.log(`Report: ${reportPath}`, 'info');

    if (actionPlan.immediate.length > 0) {
      this.log('\n🚨 Immediate Actions Needed:', 'warning');
      actionPlan.immediate.forEach(action => this.log(`  • ${action}`, 'warning'));
    }

    return this.results;
  }
}

// Run if called directly
if (require.main === module) {
  const optimizer = new ContentManagementOptimizer();
  optimizer.run().then(results => {
    process.exit(0);
  }).catch(error => {
    console.error('Content optimization failed:', error);
    process.exit(1);
  });
}

module.exports = ContentManagementOptimizer;