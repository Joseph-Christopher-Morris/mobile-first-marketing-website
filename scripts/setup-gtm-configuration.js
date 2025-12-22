#!/usr/bin/env node

/**
 * GTM Configuration Setup Script
 * 
 * This script provides the configuration needed for Google Tag Manager
 * to properly set up Ahrefs, Clarity, GA4, and Google Ads tracking.
 * 
 * Container ID: GTM-W7L94JHW
 */

console.log('🏷️  GTM Configuration Setup for Vivid Media Cheshire');
console.log('================================================\n');

console.log('📋 MANUAL GTM CONFIGURATION REQUIRED');
console.log('=====================================\n');

console.log('1. Go to: https://tagmanager.google.com/');
console.log('2. Open container: GTM-W7L94JHW');
console.log('3. Create the following tags:\n');

console.log('🎯 TAG 1: GA4 Configuration');
console.log('---------------------------');
console.log('• Tag Type: Google Analytics: GA4 Configuration');
console.log('• Measurement ID: G-QJXSCJ0L43');
console.log('• Trigger: All Pages');
console.log('• Configuration Settings:');
console.log('  - anonymize_ip: true');
console.log('  - cookie_flags: SameSite=None;Secure\n');

console.log('🎯 TAG 2: Google Ads Conversion');
console.log('-------------------------------');
console.log('• Tag Type: Google Ads Conversion Tracking');
console.log('• Conversion ID: AW-17708257497');
console.log('• Trigger: All Pages\n');

console.log('🎯 TAG 3: Google Tag (Primary)');
console.log('-------------------------------');
console.log('• Tag Type: Google Tag');
console.log('• Tag ID: GT-TWM7V38N');
console.log('• Trigger: All Pages\n');

console.log('🎯 TAG 4: Google Tag (Secondary)');
console.log('---------------------------------');
console.log('• Tag Type: Google Tag');
console.log('• Tag ID: GT-PJSWKF7B');
console.log('• Trigger: All Pages\n');

console.log('🎯 TAG 5: Microsoft Clarity');
console.log('---------------------------');
console.log('• Tag Type: Custom HTML');
console.log('• HTML:');
console.log(`<script>
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "u4yftkmpxx");
</script>`);
console.log('• Trigger: All Pages\n');

console.log('🎯 TAG 6: Ahrefs Web Analytics');
console.log('------------------------------');
console.log('• Tag Type: Custom HTML');
console.log('• HTML:');
console.log(`<script>
  var ahrefs_analytics_script = document.createElement('script');
  ahrefs_analytics_script.async = true;
  ahrefs_analytics_script.src = 'https://analytics.ahrefs.com/analytics.js';
  ahrefs_analytics_script.setAttribute('data-key', 'l985apHePEHsTj+zER1zlw');
  document.getElementsByTagName('head')[0].appendChild(ahrefs_analytics_script);
</script>`);
console.log('• Trigger: All Pages\n');

console.log('🚀 PUBLISH CONTAINER');
console.log('====================');
console.log('1. Click "Submit" in GTM');
console.log('2. Version name: "Complete Analytics Setup - 6 Tags"');
console.log('3. Description: "GA4, Google Ads, Google Tags, Clarity, Ahrefs via GTM"');
console.log('4. Click "Publish"\n');

console.log('✅ VERIFICATION CHECKLIST');
console.log('=========================');
console.log('After publishing, verify:');
console.log('• GA4 Realtime shows data: https://analytics.google.com/');
console.log('• Clarity sessions appear: https://clarity.microsoft.com/');
console.log('• Ahrefs installation verified: https://ahrefs.com/webmaster-tools/');
console.log('• Google Tag Assistant shows all tags firing');
console.log('• No duplicate tags or console errors\n');

console.log('🔧 TESTING URLS');
console.log('===============');
console.log('• Production: https://vividmediacheshire.com/');
console.log('• CloudFront: https://d15sc9fc739ev2.cloudfront.net/');
console.log('• Blog test: https://vividmediacheshire.com/blog/');
console.log('• Contact test: https://vividmediacheshire.com/contact/\n');

console.log('📊 EXPECTED RESULTS');
console.log('==================');
console.log('• GA4 (G-QJXSCJ0L43): Page views, events, conversions');
console.log('• Google Ads (AW-17708257497): Conversion tracking ready');
console.log('• Google Tag (GT-TWM7V38N): Additional tracking');
console.log('• Google Tag (GT-PJSWKF7B): Secondary tracking');
console.log('• Clarity (u4yftkmpxx): Session recordings, heatmaps');
console.log('• Ahrefs: Website analytics, SEO data\n');

console.log('⚠️  IMPORTANT NOTES');
console.log('==================');
console.log('• All 6 tracking tags now go through GTM (single source of truth)');
console.log('• Direct gtag.js scripts have been removed from site code');
console.log('• Clarity moved from direct script to GTM');
console.log('• Social sharing metadata fixed for blog articles');
console.log('• CloudFront cache invalidation required after deployment');
console.log('• You have 6 tags total: GA4 + Google Ads + 2 Google Tags + Clarity + Ahrefs\n');

console.log('🎉 Setup complete! Configure GTM manually using the instructions above.');
console.log('📋 Total Tags to Create: 6 (GA4 + Google Ads + 2 Google Tags + Clarity + Ahrefs)');
console.log('⏱️  Estimated Time: 15 minutes');
console.log('\n🔑 GOOGLE TAG IDs PROVIDED:');
console.log('===========================');
console.log('• G-QJXSCJ0L43 (GA4 Configuration)');
console.log('• GT-TWM7V38N (Google Tag Primary)');
console.log('• AW-17708257497 (Google Ads Conversion)');
console.log('• GT-PJSWKF7B (Google Tag Secondary)');
console.log('• u4yftkmpxx (Clarity Project ID)');
console.log('• l985apHePEHsTj+zER1zlw (Ahrefs Data Key)');
console.log('\n✨ All analytics tracking now goes through GTM as single source of truth!');