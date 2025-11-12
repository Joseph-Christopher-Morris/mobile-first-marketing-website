const { S3Client, ListObjectVersionsCommand, CopyObjectCommand } = require("@aws-sdk/client-s3");
const { CloudFrontClient, CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");

const BUCKET_NAME = "mobile-marketing-site-prod-1759705011281-tyzuo9";
const DISTRIBUTION_ID = "E2IBMHQ3GCW6ZK";
const REGION = "us-east-1";

// Target deployment timestamp: November 11, 2025 at 3:15:32 PM UTC
const TARGET_TIMESTAMP = new Date("2025-11-11T15:15:32Z");

const s3Client = new S3Client({ region: REGION });
const cloudFrontClient = new CloudFrontClient({ region: REGION });

async function rollbackToDeployment() {
  console.log("🔄 Starting rollback to November 11, 2025 deployment...");
  console.log(`📅 Target: ${TARGET_TIMESTAMP.toISOString()}`);
  console.log("📱 Preserving: Phone number sticky CTA\n");

  try {
    // List all object versions
    console.log("📋 Fetching S3 object versions...");
    const listCommand = new ListObjectVersionsCommand({
      Bucket: BUCKET_NAME,
    });
    const versions = await s3Client.send(listCommand);

    if (!versions.Versions || versions.Versions.length === 0) {
      console.error("❌ No versions found in bucket");
      return;
    }

    // Find versions from the target deployment
    const targetVersions = versions.Versions.filter((v) => {
      const versionDate = new Date(v.LastModified);
      const timeDiff = Math.abs(versionDate - TARGET_TIMESTAMP);
      // Within 5 minutes of target time
      return timeDiff < 5 * 60 * 1000;
    });

    console.log(`✅ Found ${targetVersions.length} files from target deployment\n`);

    // Files to exclude (keep current version)
    const excludeFiles = [
      "_next/static/chunks/app/layout-*.js", // Keep current StickyCTA
      "_next/static/chunks/src_components_StickyCTA_*.js",
    ];

    // Restore each file
    let restoredCount = 0;
    for (const version of targetVersions) {
      const key = version.Key;

      // Skip excluded files
      const shouldExclude = excludeFiles.some((pattern) => {
        const regex = new RegExp(pattern.replace("*", ".*"));
        return regex.test(key);
      });

      if (shouldExclude) {
        console.log(`⏭️  Skipping: ${key} (preserving current version)`);
        continue;
      }

      try {
        const copyCommand = new CopyObjectCommand({
          Bucket: BUCKET_NAME,
          CopySource: `${BUCKET_NAME}/${key}?versionId=${version.VersionId}`,
          Key: key,
        });

        await s3Client.send(copyCommand);
        restoredCount++;

        if (restoredCount % 50 === 0) {
          console.log(`   Restored ${restoredCount} files...`);
        }
      } catch (error) {
        console.error(`❌ Failed to restore ${key}:`, error.message);
      }
    }

    console.log(`\n✅ Restored ${restoredCount} files from target deployment`);

    // Invalidate CloudFront cache
    console.log("\n🔄 Invalidating CloudFront cache...");
    const invalidationCommand = new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `rollback-keep-phone-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ["/*"],
        },
      },
    });

    const invalidation = await cloudFrontClient.send(invalidationCommand);
    console.log(`✅ Invalidation created: ${invalidation.Invalidation.Id}`);
    console.log("⏱️  Cache will be cleared in 5-15 minutes\n");

    console.log("✅ Rollback complete!");
    console.log("\n📋 Summary:");
    console.log(`   - Restored ${restoredCount} files to Nov 11 deployment`);
    console.log("   - Preserved phone number sticky CTA");
    console.log("   - CloudFront cache invalidation initiated");
    console.log("\n🌐 Site: https://d15sc9fc739ev2.cloudfront.net");
    console.log("⏱️  Changes will be live in 5-15 minutes");
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    throw error;
  }
}

rollbackToDeployment();
