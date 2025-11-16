const { CloudFrontClient, CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");

const DISTRIBUTION_ID = "E2IBMHQ3GCW6ZK";
const REGION = "us-east-1";

// Paths from the first invalidation (I7OYTQVOV4MH71Q8IYXFU4TTDY)
const paths = [
  "/services/website-hosting/index.html",
  "/blog/stock-photography-breakthrough/index.html",
  "/privacy-policy/index.html",
  "/blog/ebay-model-car-sales-timing-bundles/index.html",
  "/blog/stock-photography-income-growth/index.html",
  "/services/website-design/index.html",
  "/blog/flyer-marketing-case-study-part-2/index.html",
  "/services/ad-campaigns/index.html",
  "/_next/static/css/91245f3a66b2bde7.css",
  "/blog/flyer-marketing-case-study-part-1/index.html",
  "/blog/stock-photography-lessons/index.html",
  "/blog/paid-ads-campaign-learnings/index.html",
  "/services/photography/index.html",
  "/blog/ebay-photography-workflow-part-2/index.html",
  "/404/index.html",
  "/pricing/index.html",
  "/blog/ebay-model-ford-collection-part-1/index.html",
  "/blog/index.html",
  "/blog/flyers-roi-breakdown/index.html",
  "/blog/stock-photography-getting-started/index.html",
  "/blog/ebay-business-side-part-5/index.html",
  "/contact/index.html",
  "/services/hosting/index.html",
  "/about/index.html",
  "/blog/ebay-repeat-buyers-part-4/index.html",
  "/services/index.html",
  "/thank-you/index.html",
  "/blog/exploring-istock-data-deepmeta/index.html",
  "/index.html",
  "/404.html",
  "/services/analytics/index.html"
];

async function recreateInvalidation() {
  console.log("🔄 Recreating CloudFront invalidation from first deployment...");
  console.log(`   Distribution: ${DISTRIBUTION_ID}`);
  console.log(`   Paths: ${paths.length}`);
  console.log("");

  const client = new CloudFrontClient({ region: REGION });

  try {
    const command = new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `revert-to-first-${Date.now()}`,
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
    console.log("📋 This will restore the content from the first deployment today");
    console.log("   (before the final spec implementation)");
    console.log("");
    console.log("⏱️  Invalidation typically takes 5-15 minutes to complete");
    
  } catch (error) {
    console.error("❌ Error creating invalidation:", error.message);
    process.exit(1);
  }
}

recreateInvalidation();
