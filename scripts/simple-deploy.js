#!/usr/bin/env node

/**
 * Simple Deployment Script - Privacy Policy Update
 * Uses AWS CLI directly to avoid Node.js PATH issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Simple Deployment for Privacy Policy...\n');

// Configuration
const S3_BUCKET = 'mobile-marketing-site-prod-1759705011281-tyzuo9';
const CLOUDFRONT_DISTRIBUTION = 'E2IBMHQ3GCW6ZK';
const REGION = 'us-east-1';

try {
  console.log('📋 Configuration:');
  console.log(`   S3 Bucket: ${S3_BUCKET}`);
  console.log(`   CloudFront: ${CLOUDFRONT_DISTRIBUTION}`);
  console.log(`   Region: ${REGION}\n`);

  // Check if AWS CLI is available
  console.log('🔍 Checking AWS CLI...');
  try {
    execSync('aws --version', { stdio: 'pipe' });
    console.log('✅ AWS CLI is available');
  } catch (error) {
    throw new Error('AWS CLI not found. Please install AWS CLI first.');
  }

  // Create a minimal build structure for the privacy policy
  console.log('\n📁 Creating build structure...');
  
  const buildDir = 'temp-build';
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Create privacy-policy directory
  const privacyDir = path.join(buildDir, 'privacy-policy');
  if (!fs.existsSync(privacyDir)) {
    fs.mkdirSync(privacyDir, { recursive: true });
  }

  // Generate a simple HTML version of the privacy policy
  const privacyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy | Vivid Auto Photography</title>
    <meta name="description" content="Privacy Policy for Vivid Auto Photography. Learn how we collect, use, and protect your personal data in compliance with GDPR and UK data protection laws.">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #e91e63; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .toc { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .toc ul { list-style-type: disc; padding-left: 20px; }
        .toc a { color: #e91e63; text-decoration: none; }
        .toc a:hover { text-decoration: underline; }
        address { font-style: normal; background: #f0f0f0; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p><em>Vivid Auto Photography Privacy Notice</em></p>
    
    <div class="toc">
        <h2>Contents</h2>
        <ul>
            <li><a href="#intro">Introduction</a></li>
            <li><a href="#what-we-collect">What personal data we collect and why</a></li>
            <li><a href="#security">Data Security</a></li>
            <li><a href="#sharing">Who we share your personal data with</a></li>
            <li><a href="#breaches">Data Breaches</a></li>
            <li><a href="#storage">Data storage location</a></li>
            <li><a href="#retention">Retaining your data</a></li>
            <li><a href="#rights">Your Rights</a></li>
            <li><a href="#cookies">Cookies</a></li>
            <li><a href="#concerns">Concerns, Comments and Feedback</a></li>
        </ul>
    </div>

    <section id="intro">
        <h2>Introduction</h2>
        <p>Your personal data is important to both you and us and it requires respectful and careful protection. This privacy notice informs you of our privacy practices and of the choices you can make about the way we hold information about you as a website visitor, a client, a subcontractor or you work with us. We are committed to complying with the GDPR (2016), the UK GDPR (2021) and the Data Protection Act (2018) and good business practices. We are both a data controller and a data processor.</p>
        <p>This is our privacy notice so please be aware that should you follow a link to another website, you are no longer covered by this notice. It's a good idea to understand the privacy notice of any website before sharing personal information with it.</p>
    </section>

    <section id="what-we-collect">
        <h2>What personal data we collect and why?</h2>
        <p>At Vivid Auto Photography we will only collect the minimum personal information from you. This will be at the point you contact us, work with us, ask to be included on a newsletter, or become a client. This could include your name, address, telephone numbers, email address, signature and bank account details. We need this information for legitimate interest, contractual obligation or legal obligation purposes to provide you with the services that you have requested. We will not use your data for any other purpose unless we have obtained your consent for that specific purpose.</p>
    </section>

    <section id="security">
        <h2>Data Security</h2>
        <p>We take the security of your personal data seriously. We have implemented appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, regular security assessments, and access controls to ensure only authorized personnel can access your data.</p>
    </section>

    <section id="sharing">
        <h2>Who we share your personal data with</h2>
        <p>We do not sell, trade, or otherwise transfer your personal data to third parties without your consent, except as described in this privacy policy. We may share your information with trusted service providers who assist us in operating our website, conducting our business, or servicing you, provided they agree to keep this information confidential.</p>
    </section>

    <section id="breaches">
        <h2>Data Breaches</h2>
        <p>In the unlikely event of a data breach that poses a high risk to your rights and freedoms, we will notify you within 72 hours of becoming aware of the breach. We will also report the breach to the relevant supervisory authority as required by law.</p>
    </section>

    <section id="storage">
        <h2>Data storage location</h2>
        <p>Your personal data is stored securely within the UK and EU. If we need to transfer your data outside of these regions, we will ensure appropriate safeguards are in place to protect your data in accordance with GDPR requirements.</p>
    </section>

    <section id="retention">
        <h2>Retaining your data</h2>
        <p>We will only retain your personal data for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements. When we no longer need your personal data, we will securely delete or anonymize it.</p>
    </section>

    <section id="rights">
        <h2>Your Rights</h2>
        <p>Under GDPR and UK data protection laws, you have the following rights:</p>
        <ul>
            <li>The right to access your personal data</li>
            <li>The right to rectification of inaccurate data</li>
            <li>The right to erasure ("right to be forgotten")</li>
            <li>The right to restrict processing</li>
            <li>The right to data portability</li>
            <li>The right to object to processing</li>
            <li>Rights related to automated decision-making</li>
        </ul>
        <p>To exercise any of these rights, please contact us using the information provided in the "Concerns, Comments and Feedback" section below.</p>
    </section>

    <section id="cookies">
        <h2>Cookies</h2>
        <p>Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us understand how you use our website. We use essential cookies for website functionality and may use analytics cookies to improve our services. You can control cookie settings through your browser preferences.</p>
    </section>

    <section id="concerns">
        <h2>Concerns, Comments and Feedback</h2>
        <p>If you have any questions, concerns, or feedback about this privacy policy or our data practices, please contact us:</p>
        <address>
            <strong>Vivid Auto Photography</strong><br>
            Email: <a href="mailto:info@vividautophotography.co.uk">info@vividautophotography.co.uk</a>
        </address>
        <p>If you are not satisfied with our response, you have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK's data protection supervisory authority.</p>
        <p><small>Last updated: October 2024</small></p>
    </section>
</body>
</html>`;

  // Write the HTML file
  fs.writeFileSync(path.join(privacyDir, 'index.html'), privacyHtml);
  console.log('✅ Privacy policy HTML created');

  // Upload to S3
  console.log('\n📤 Uploading privacy policy to S3...');
  const uploadCmd = `aws s3 cp "${privacyDir}/index.html" "s3://${S3_BUCKET}/privacy-policy/index.html" --content-type "text/html" --cache-control "public, max-age=3600" --region ${REGION}`;
  
  execSync(uploadCmd, { stdio: 'inherit' });
  console.log('✅ Privacy policy uploaded to S3');

  // Invalidate CloudFront cache
  console.log('\n🔄 Invalidating CloudFront cache...');
  const invalidateCmd = `aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION} --paths "/privacy-policy/*" --region us-east-1`;
  
  execSync(invalidateCmd, { stdio: 'inherit' });
  console.log('✅ CloudFront cache invalidated');

  // Clean up temp files
  console.log('\n🧹 Cleaning up...');
  fs.rmSync(buildDir, { recursive: true, force: true });

  console.log('\n✅ Privacy Policy Deployment Complete!');
  console.log('🌐 Privacy Policy URL: https://d15sc9fc739ev2.cloudfront.net/privacy-policy/');
  console.log('⏱️  Cache invalidation may take 5-15 minutes to propagate globally');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Ensure AWS CLI is installed and configured');
  console.log('2. Check AWS credentials: aws sts get-caller-identity');
  console.log('3. Verify S3 bucket access permissions');
  console.log('4. Check CloudFront distribution permissions');
  process.exit(1);
}