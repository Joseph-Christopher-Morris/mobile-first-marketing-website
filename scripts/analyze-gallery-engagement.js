#!/usr/bin/env node

const https = require('https');
const { URL } = require('url');

function analyzeGalleryEngagement() {
  console.log('🔍 Analyzing Photography Gallery Engagement...\n');
  
  const url = 'https://d3vfzayzqyr2yg.cloudfront.net/services/photography';
  
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📊 Gallery Content Analysis:');
        
        // Analyze gallery structure
        const galleryMatches = data.match(/role="grid"/g) || [];
        const gridCellMatches = data.match(/role="gridcell"/g) || [];
        const imageMatches = data.match(/\.(webp|jpg|jpeg|png)/g) || [];
        const lazyLoadMatches = data.match(/loading="lazy"/g) || [];
        const altTextMatches = data.match(/alt="[^"]+"/g) || [];
        
        console.log(`   Gallery Grids: ${galleryMatches.length}`);
        console.log(`   Gallery Items: ${gridCellMatches.length}`);
        console.log(`   Images Found: ${imageMatches.length}`);
        console.log(`   Lazy Loaded: ${lazyLoadMatches.length}`);
        console.log(`   Alt Text Tags: ${altTextMatches.length}`);
        
        // Analyze engagement features
        const engagementFeatures = {
          'Interactive Gallery': data.includes('cursor-pointer'),
          'Hover Effects': data.includes('hover:'),
          'Focus States': data.includes('focus:'),
          'ARIA Labels': data.includes('aria-label'),
          'Keyboard Navigation': data.includes('tabindex'),
          'Click Tracking': data.includes('onClick') || data.includes('click'),
          'Local Content': data.includes('Nantwich') || data.includes('Cheshire'),
          'Credibility Indicators': data.includes('BBC') || data.includes('Forbes'),
          'CTA Buttons': data.includes('Book') || data.includes('Contact'),
          'Responsive Design': data.includes('sm:') || data.includes('lg:')
        };
        
        console.log('\n✅ Engagement Features Analysis:');
        Object.entries(engagementFeatures).forEach(([feature, present]) => {
          console.log(`   ${present ? '✅' : '❌'} ${feature}`);
        });
        
        // Analyze image types and categories
        const imageTypes = {
          editorial: (data.match(/editorial/gi) || []).length,
          local: (data.match(/nantwich|cheshire|local/gi) || []).length,
          campaign: (data.match(/campaign/gi) || []).length,
          clipping: (data.match(/clipping/gi) || []).length
        };
        
        console.log('\n📸 Image Content Categories:');
        Object.entries(imageTypes).forEach(([type, count]) => {
          console.log(`   ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} references`);
        });
        
        // Performance indicators
        const performanceFeatures = {
          'Next.js Image Optimization': data.includes('_next/image'),
          'WebP Format': data.includes('.webp'),
          'Responsive Images': data.includes('srcset') || data.includes('sizes'),
          'Preload Critical Images': data.includes('rel="preload"'),
          'Progressive Loading': data.includes('loading="lazy"'),
          'Aspect Ratio Preservation': data.includes('aspect-ratio')
        };
        
        console.log('\n⚡ Performance Features:');
        Object.entries(performanceFeatures).forEach(([feature, present]) => {
          console.log(`   ${present ? '✅' : '❌'} ${feature}`);
        });
        
        // Calculate engagement score
        const totalFeatures = Object.keys(engagementFeatures).length + Object.keys(performanceFeatures).length;
        const presentFeatures = Object.values(engagementFeatures).filter(Boolean).length + 
                               Object.values(performanceFeatures).filter(Boolean).length;
        const engagementScore = Math.round((presentFeatures / totalFeatures) * 100);
        
        console.log(`\n📊 Overall Engagement Score: ${engagementScore}%`);
        
        // Recommendations based on analysis
        console.log('\n🔧 Engagement Optimization Recommendations:');
        
        if (!engagementFeatures['Click Tracking']) {
          console.log('   • Add click tracking for gallery interactions');
        }
        
        if (!performanceFeatures['Preload Critical Images']) {
          console.log('   • Preload above-the-fold hero images');
        }
        
        if (!performanceFeatures['Aspect Ratio Preservation']) {
          console.log('   • Add aspect-ratio CSS to prevent layout shifts');
        }
        
        if (imageTypes.local < 3) {
          console.log('   • Increase local Nantwich content visibility');
        }
        
        if (gridCellMatches.length < 8) {
          console.log('   • Consider adding more gallery items for engagement');
        }
        
        console.log('\n📈 Conversion Optimization Suggestions:');
        console.log('   • A/B test gallery layout (grid vs masonry)');
        console.log('   • Add image captions with local business context');
        console.log('   • Implement gallery lightbox for detailed viewing');
        console.log('   • Add "Book Similar Shoot" CTAs on gallery items');
        console.log('   • Track scroll depth and time spent on gallery');
        
        const analysis = {
          timestamp: new Date().toISOString(),
          url: url,
          galleryItems: gridCellMatches.length,
          imagesFound: imageMatches.length,
          engagementScore: engagementScore,
          features: { ...engagementFeatures, ...performanceFeatures },
          imageCategories: imageTypes,
          recommendations: [
            'Add comprehensive click tracking',
            'Optimize image preloading strategy',
            'Enhance local content visibility',
            'Implement conversion-focused CTAs'
          ]
        };
        
        resolve(analysis);
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Analysis failed:', err.message);
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function main() {
  try {
    const analysis = await analyzeGalleryEngagement();
    
    // Save analysis results
    const fs = require('fs');
    fs.writeFileSync('photography-gallery-engagement-analysis.json', JSON.stringify(analysis, null, 2));
    
    console.log('\n💾 Analysis saved to: photography-gallery-engagement-analysis.json');
    console.log('🌐 Live site analyzed: https://d3vfzayzqyr2yg.cloudfront.net/services/photography');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeGalleryEngagement };