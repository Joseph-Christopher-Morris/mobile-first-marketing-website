const { CloudFrontClient, CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");

const DISTRIBUTION_ID = "E2IBMHQ3GCW6ZK";
const REGION = "us-east-1";

// Paths from November 13, 2025 invalidation (I1PWJ13F020GJ0D0HXJQPX7RM1)
const paths = [
  "/services/website-hosting/index.html",
  "/blog/stock-photography-breakthrough/index.html",
  "/privacy-policy/index.html",
  "/_next/static/chunks/app/services/page-919aba4348891a1c.js",
  "/blog/ebay-model-car-sales-timing-bundles/index.html",
  "/blog/stock-photography-income-growth/index.html",
  "/services/website-design/index.html",
  "/blog/flyer-marketing-case-study-part-2/index.html",
  "/_next/static/chunks/app/services/website-design/page-3f1f8e0c409b24c6.js",
  "/services/ad-campaigns/index.html",
  "/blog/flyer-marketing-case-study-part-1/index.html",
  "/blog/stock-photography-lessons/index.html",
  "/_next/static/chunks/app/services/ad-campaigns/page-2b252dc909009fed.js",
  "/blog/paid-ads-campaign-learnings/index.html",
  "/services/photography/index.html",
  "/blog/ebay-photography-workflow-part-2/index.html",
  "/404/index.html",
  "/pricing/index.html",
  "/blog/ebay-model-ford-collection-part-1/index.html",
  "/blog/index.html",
  "/_next/static/chunks/app/services/hosting/page-126101602ddeef9c.js",
  "/blog/flyers-roi-breakdown/index.html",
  "/blog/stock-photography-getting-started/index.html",
  "/blog/ebay-business-side-part-5/index.html",
  "/contact/index.html",
  "/services/hosting/index.html",
  "/_next/static/chunks/app/page-c841a7c9198fa946.js",
  "/about/index.html",
  "/blog/ebay-repeat-buyers-part-4/index.html",
  "/services/index.html",
  "/_next/static/chunks/702-4a80f973bd32321f.js",
  "/thank-you/index.html",
  "/blog/exploring-istock-data-deepmeta/index.html",
  "/index.html",
  "/404.html",
  "/services/analytics/index.html"
];

async function recreateInvalidation() {
  console.log("🔄 Recreating CloudFront invalidation from November 13, 2025...");
  console.log(`   Distribution: ${DISTRIBUTION_ID}`);
  console.log(`   Paths: ${paths.length}`);
  console.log(`   Original Invalidation: I1PWJ13F020GJ0D0HXJQPX7RM1`);
  console.log(`   Original Date: November 13, 2025 at 10:11:07 PM UTC`);
  console.log("");

  const client = new CloudFrontClient({ region: REGION });

  try {
    const command = new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `revert-to-nov-13-${Date.now()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    });

    const response = await client.send(command);
    
    console.log("✅ Invalidation created successfully!");
    console.log(`   Invalidation ID: ${response.Invalidation.Id}`);
    console.log(`   Status: ${response.Invalidation.Status}`);
    console.log(`   Created: ${response.Invalidation.CreateTime}`);
    console.log("");
    console.log("📋 This will restore the content from November 13, 2025");
    console.log("   (before today's hosting page updates)");
    console.log("");
    console.log("⏱️  Invalidation typically takes 5-15 minutes to complete");
    
  } catch (error) {
    console.error("❌ Error creating invalidation:", error.message);
    process.exit(1);
  }
}

recreateInvalidation();
