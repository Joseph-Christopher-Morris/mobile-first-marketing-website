#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator
 * 
 * Generates sitemap.xml with:
 * - Static top-level and service page URLs
 * - Dynamically discovered blog article URLs from src/content/blog/
 * - Excludes artifact URL /services/hosting/
 * - Writes to public/sitemap.xml for Next.js static export
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://vividmediacheshire.com';

/**
 * Static URLs with priority and changefreq values
 * Preserves existing sitemap structure for non-blog pages
 * Note: Priority values use exact string format to preserve baseline behavior
 */
const STATIC_URLS = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/services/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/services/website-design/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/website-hosting/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/ad-campaigns/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/analytics/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services/photography/', priority: '0.8', changefreq: 'monthly' },
  { loc: '/about/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/pricing/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/blog/', priority: '0.8', changefreq: 'weekly' },
  { loc: '/free-audit/', priority: '0.6', changefreq: 'monthly' },
  { loc: '/privacy-policy/', priority: '0.3', changefreq: 'yearly' },
];

/**
 * Artifact URLs to exclude from sitemap
 * These are deprecated URLs that should not appear in sitemap
 */
const EXCLUDED_URLS = [
  '/services/hosting/',
];

/**
 * Discovers blog article files from src/content/blog/ directory
 * @returns {string[]} Array of blog slugs (filenames without .ts extension)
 */
function discoverBlogArticles() {
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  
  // Handle edge case: blog directory doesn't exist
  if (!fs.existsSync(blogDir)) {
    console.warn('Blog directory not found:', blogDir);
    return [];
  }
  
  // Read directory and filter for .ts files only
  const files = fs.readdirSync(blogDir);
  const blogSlugs = files
    .filter(file => file.endsWith('.ts'))
    .map(file => file.replace('.ts', ''));
  
  console.log(`Discovered ${blogSlugs.length} blog articles`);
  return blogSlugs;
}

/**
 * Generates blog URLs from slugs
 * @param {string[]} slugs - Array of blog slugs
 * @returns {object[]} Array of URL objects with loc, priority, changefreq
 */
function generateBlogUrls(slugs) {
  return slugs.map(slug => ({
    loc: `/blog/${slug}/`,
    priority: '0.7',
    changefreq: 'monthly',
  }));
}

/**
 * Filters out excluded artifact URLs
 * @param {object[]} urls - Array of URL objects
 * @returns {object[]} Filtered array without excluded URLs
 */
function filterExcludedUrls(urls) {
  return urls.filter(url => !EXCLUDED_URLS.includes(url.loc));
}

/**
 * Generates XML sitemap content
 * @param {object[]} urls - Array of URL objects
 * @returns {string} XML sitemap content
 */
function generateXML(urls) {
  const today = new Date().toISOString().split('T')[0];
  
  const urlEntries = urls.map(url => {
    return `  <url>
    <loc>${DOMAIN}${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

/**
 * Main sitemap generation function
 */
function generateSitemap() {
  console.log('Generating sitemap.xml...');
  
  // 1. Discover blog articles
  const blogSlugs = discoverBlogArticles();
  const blogUrls = generateBlogUrls(blogSlugs);
  
  // 2. Combine static and blog URLs
  const allUrls = [...STATIC_URLS, ...blogUrls];
  
  // 3. Filter out excluded artifact URLs
  const filteredUrls = filterExcludedUrls(allUrls);
  
  console.log(`Total URLs: ${filteredUrls.length} (${STATIC_URLS.length} static + ${blogUrls.length} blog)`);
  
  // 4. Generate XML
  const xml = generateXML(filteredUrls);
  
  // 5. Write to public/sitemap.xml
  const outputPath = path.join(process.cwd(), 'public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  
  console.log(`Sitemap generated successfully: ${outputPath}`);
  console.log(`Total URLs in sitemap: ${filteredUrls.length}`);
}

// Run if executed directly
if (require.main === module) {
  try {
    generateSitemap();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  generateSitemap,
  discoverBlogArticles,
  generateBlogUrls,
  filterExcludedUrls,
  generateXML,
  STATIC_URLS,
  EXCLUDED_URLS,
};
