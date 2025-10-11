#!/usr/bin/env node

/**
 * Content validation script for build-time checks
 * Validates Markdown frontmatter and content structure
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(process.cwd(), 'content');

// Required frontmatter fields for different content types
const REQUIRED_FIELDS = {
  blog: ['title', 'date', 'author', 'excerpt'],
  services: [
    'title',
    'shortDescription',
    'order',
    'icon',
    'featuredImage',
    'features',
    'benefits',
  ],
  testimonials: ['author', 'content', 'rating', 'order'],
  pages: ['title'],
};

// Optional but recommended fields
const RECOMMENDED_FIELDS = {
  blog: ['featuredImage', 'categories', 'tags', 'seoTitle', 'metaDescription'],
  services: ['pricing', 'seoTitle', 'metaDescription'],
  testimonials: ['position', 'company', 'avatar', 'featured', 'serviceRelated'],
  pages: ['seoTitle', 'metaDescription'],
};

// Field type validations
const FIELD_VALIDATORS = {
  date: value => !isNaN(Date.parse(value)),
  rating: value => typeof value === 'number' && value >= 1 && value <= 5,
  order: value => typeof value === 'number' && value > 0,
  featured: value => typeof value === 'boolean',
  categories: value => Array.isArray(value),
  tags: value => Array.isArray(value),
  features: value => Array.isArray(value),
  benefits: value => Array.isArray(value),
  serviceRelated: value => Array.isArray(value),
};

function validateContent() {
  console.log('🔍 Validating content...');

  let hasErrors = false;
  let hasWarnings = false;

  // Check if content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('❌ Content directory not found');
    process.exit(1);
  }

  // Validate each content type
  Object.keys(REQUIRED_FIELDS).forEach(contentType => {
    const contentPath = path.join(CONTENT_DIR, contentType);

    if (!fs.existsSync(contentPath)) {
      console.log(`⚠️  ${contentType} directory not found, skipping...`);
      return;
    }

    const files = fs
      .readdirSync(contentPath)
      .filter(file => file.endsWith('.md'));

    if (files.length === 0) {
      console.log(`ℹ️  No ${contentType} files found`);
      return;
    }

    console.log(`\n📁 Validating ${contentType} (${files.length} files):`);

    files.forEach(file => {
      const filePath = path.join(contentPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');

      try {
        const { data: frontmatter, content } = matter(fileContent);
        const requiredFields = REQUIRED_FIELDS[contentType];
        const recommendedFields = RECOMMENDED_FIELDS[contentType] || [];
        let fileHasErrors = false;
        let fileHasWarnings = false;

        // Check required fields
        requiredFields.forEach(field => {
          if (!frontmatter[field]) {
            console.error(`  ❌ ${file}: Missing required field '${field}'`);
            hasErrors = true;
            fileHasErrors = true;
          } else {
            // Validate field types if validator exists
            const validator = FIELD_VALIDATORS[field];
            if (validator && !validator(frontmatter[field])) {
              console.error(`  ❌ ${file}: Invalid value for field '${field}'`);
              hasErrors = true;
              fileHasErrors = true;
            }
          }
        });

        // Check recommended fields
        recommendedFields.forEach(field => {
          if (frontmatter[field] === undefined) {
            console.warn(`  ⚠️  ${file}: Missing recommended field '${field}'`);
            hasWarnings = true;
            fileHasWarnings = true;
          }
        });

        // Check content length (skip for testimonials as they use frontmatter content field)
        if (contentType !== 'testimonials' && content.trim().length < 50) {
          console.warn(
            `  ⚠️  ${file}: Content is very short (${content.trim().length} characters)`
          );
          hasWarnings = true;
          fileHasWarnings = true;
        }

        // For testimonials, check the frontmatter content field length
        if (
          contentType === 'testimonials' &&
          frontmatter.content &&
          frontmatter.content.length < 20
        ) {
          console.warn(
            `  ⚠️  ${file}: Testimonial content is very short (${frontmatter.content.length} characters)`
          );
          hasWarnings = true;
          fileHasWarnings = true;
        }

        // Validate specific content type rules
        if (contentType === 'services' && frontmatter.order) {
          // Check for duplicate order values
          const otherServices = files.filter(f => f !== file);
          otherServices.forEach(otherFile => {
            const otherPath = path.join(contentPath, otherFile);
            const otherContent = fs.readFileSync(otherPath, 'utf8');
            const { data: otherFrontmatter } = matter(otherContent);
            if (otherFrontmatter.order === frontmatter.order) {
              console.error(
                `  ❌ ${file}: Duplicate order value ${frontmatter.order} (also in ${otherFile})`
              );
              hasErrors = true;
              fileHasErrors = true;
            }
          });
        }

        if (!fileHasErrors && !fileHasWarnings) {
          console.log(`  ✅ ${file}: Valid`);
        } else if (!fileHasErrors) {
          console.log(`  ⚠️  ${file}: Valid with warnings`);
        }
      } catch (error) {
        console.error(`  ❌ ${file}: Invalid frontmatter - ${error.message}`);
        hasErrors = true;
      }
    });
  });

  console.log('\n📊 Validation Summary:');
  if (hasErrors) {
    console.error('❌ Content validation failed with errors');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Content validation passed with warnings');
  } else {
    console.log('✅ All content validated successfully');
  }
}

// Run validation if called directly
if (require.main === module) {
  validateContent();
}

module.exports = { validateContent };
