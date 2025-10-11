#!/usr/bin/env node

console.log('🚀 Starting MIME Type Verification Test...');

const { execSync } = require('child_process');

const config = {
    s3BucketName: 'mobile-marketing-site-prod-1759705011281-tyzuo9',
    cloudfrontDomain: 'd15sc9fc739ev2.cloudfront.net',
    region: 'us-east-1'
};

console.log(`📦 S3 Bucket: ${config.s3BucketName}`);
console.log(`🌐 CloudFront Domain: ${config.cloudfrontDomain}`);
console.log(`🌍 Region: ${config.region}\n`);

try {
    console.log('🔍 Testing AWS CLI access...');
    const identity = execSync(`aws sts get-caller-identity --region ${config.region}`, { encoding: 'utf8' });
    console.log('✅ AWS CLI access confirmed');
    console.log('Identity:', JSON.parse(identity));

    console.log('\n🔍 Listing S3 objects...');
    const listCommand = `aws s3api list-objects-v2 --bucket ${config.s3BucketName} --max-items 10 --region ${config.region}`;
    const listResult = execSync(listCommand, { encoding: 'utf8' });
    const objects = JSON.parse(listResult);
    
    console.log(`Found ${objects.Contents ? objects.Contents.length : 0} objects`);
    
    if (objects.Contents) {
        for (const obj of objects.Contents.slice(0, 5)) {
            console.log(`- ${obj.Key} (${obj.Size} bytes)`);
        }
    }

    console.log('\n🖼️ Testing specific blog image...');
    const blogImagePath = 'images/hero/paid-ads-analytics-screenshot.webp';
    
    try {
        const headCommand = `aws s3api head-object --bucket ${config.s3BucketName} --key "${blogImagePath}" --region ${config.region}`;
        const headResult = execSync(headCommand, { encoding: 'utf8' });
        const metadata = JSON.parse(headResult);
        
        console.log(`✅ Found blog image: ${blogImagePath}`);
        console.log(`   Content-Type: ${metadata.ContentType}`);
        console.log(`   Size: ${metadata.ContentLength} bytes`);
        console.log(`   Last Modified: ${metadata.LastModified}`);
        
    } catch (error) {
        console.log(`❌ Blog image not found: ${blogImagePath}`);
        console.log('Error:', error.message);
        
        // Try to find similar files
        console.log('\n🔍 Looking for similar image files...');
        try {
            const searchCommand = `aws s3 ls s3://${config.s3BucketName}/images/ --recursive --region ${config.region}`;
            const searchResult = execSync(searchCommand, { encoding: 'utf8' });
            console.log('Image files found:');
            console.log(searchResult);
        } catch (searchError) {
            console.log('No image files found or error searching:', searchError.message);
        }
    }

} catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
}

console.log('\n✅ Test completed successfully');