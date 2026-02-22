#!/usr/bin/env node

/**
 * Create Default Fallback Image for Blog Posts
 * 
 * This script creates a professional placeholder image (1200x630) for blog posts
 * that displays when hero or content images fail to load.
 * 
 * Uses Vivid Media branding with a clean, professional design.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createFallbackImage() {
  const width = 1200;
  const height = 630;
  
  // Create a gradient background (professional blue-gray)
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            fill="white" text-anchor="middle" dominant-baseline="middle">
        Vivid Media
      </text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" 
            fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">
        Image Loading...
      </text>
    </svg>
  `;

  const outputPath = path.join(__dirname, '../public/images/blog/default.webp');
  
  try {
    // Create the image from SVG
    await sharp(Buffer.from(svg))
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);
    
    console.log('✅ Default fallback image created successfully!');
    console.log(`   Location: ${outputPath}`);
    
    // Get file size
    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   Size: ${fileSizeKB} KB`);
    console.log(`   Dimensions: ${width}x${height}`);
    
  } catch (error) {
    console.error('❌ Error creating fallback image:', error);
    process.exit(1);
  }
}

createFallbackImage();
