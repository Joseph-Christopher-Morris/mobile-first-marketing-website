// Test script to verify blog data loading
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Blog Image Debug Implementation...\n');

// Test 1: Check if image file exists
const imagePath = path.join(__dirname, 'public', 'images', 'hero', 'paid-ads-analytics-screenshot.webp');
console.log('📁 Checking image file existence:');
console.log(`   Path: ${imagePath}`);

if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    console.log('   ✅ Image file exists');
    console.log(`   📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   📅 Modified: ${stats.mtime.toISOString()}`);
} else {
    console.log('   ❌ Image file does not exist');
}

// Test 2: Check blog post data
console.log('\n📝 Checking blog post data:');
try {
    // We can't directly import TypeScript in Node.js, so we'll check the file content
    const blogPostPath = path.join(__dirname, 'src', 'content', 'blog', 'paid-ads-campaign-learnings.ts');
    if (fs.existsSync(blogPostPath)) {
        const content = fs.readFileSync(blogPostPath, 'utf8');
        console.log('   ✅ Blog post file exists');
        
        // Check for image path in the content
        if (content.includes('/images/hero/paid-ads-analytics-screenshot.webp')) {
            console.log('   ✅ Image path found in blog post');
        } else {
            console.log('   ❌ Image path not found in blog post');
        }
        
        // Extract image path
        const imageMatch = content.match(/image:\s*['"`]([^'"`]+)['"`]/);
        if (imageMatch) {
            console.log(`   📸 Image path: ${imageMatch[1]}`);
        }
    } else {
        console.log('   ❌ Blog post file does not exist');
    }
} catch (error) {
    console.log(`   ❌ Error reading blog post: ${error.message}`);
}

// Test 3: Check BlogPreview component
console.log('\n🧩 Checking BlogPreview component:');
try {
    const componentPath = path.join(__dirname, 'src', 'components', 'sections', 'BlogPreview.tsx');
    if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        console.log('   ✅ BlogPreview component exists');
        
        // Check for key improvements
        const checks = [
            { name: 'use client directive', pattern: /'use client'/ },
            { name: 'OptimizedImage import', pattern: /import.*OptimizedImage/ },
            { name: 'useState hook', pattern: /useState/ },
            { name: 'Error handling', pattern: /handleImageError/ },
            { name: 'Retry mechanism', pattern: /retryCount/ },
            { name: 'Loading states', pattern: /imageLoading/ }
        ];
        
        checks.forEach(check => {
            if (check.pattern.test(content)) {
                console.log(`   ✅ ${check.name} implemented`);
            } else {
                console.log(`   ❌ ${check.name} missing`);
            }
        });
    } else {
        console.log('   ❌ BlogPreview component does not exist');
    }
} catch (error) {
    console.log(`   ❌ Error reading component: ${error.message}`);
}

console.log('\n🎯 Test Summary:');
console.log('   - Image file existence: Check above');
console.log('   - Blog post data: Check above');
console.log('   - Component implementation: Check above');
console.log('\n✨ Run this script with: node test-blog-data.js');