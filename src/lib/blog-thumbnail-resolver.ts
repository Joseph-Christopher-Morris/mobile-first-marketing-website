/**
 * Blog Card Thumbnail Resolver
 * 
 * Deterministic resolver for blog index card thumbnails only.
 * Does NOT affect individual blog post hero images or content.
 * 
 * Resolution order:
 * 1. cardImage
 * 2. coverImage  
 * 3. heroImage
 * 4. image
 * 5. DEFAULT_BLOG_CARD_IMAGE
 */

const DEFAULT_BLOG_CARD_IMAGE = "/images/hero/aston-martin-db6-website.webp";

interface BlogPostWithOptionalImages {
  cardImage?: string;
  coverImage?: string;
  heroImage?: string;
  image?: string;
  slug: string;
}

/**
 * Strict normalizer for blog card preview images ONLY
 * Ensures the resolved src maps to an existing file in public/images/blog/
 * @param src Raw image source string
 * @returns Normalized src that matches an existing file, or fallback
 */
function normalizeBlogCardSrc(src: string): string {
  if (!src) return DEFAULT_BLOG_CARD_IMAGE;
  
  // Ensure leading slash
  let normalizedSrc = src.startsWith("/") ? src : `/${src}`;
  
  // If it's not a blog image path, return as-is (for hero images, etc.)
  if (!normalizedSrc.startsWith("/images/blog/")) {
    return normalizedSrc;
  }
  
  // Extract filename from path
  const pathParts = normalizedSrc.split("/");
  const filename = pathParts[pathParts.length - 1];
  
  // If filename has no extension OR the extension doesn't match known files,
  // try extensions in order: .webp, .jpg, .jpeg, .png
  const extensionOrder = ['.webp', '.jpg', '.jpeg', '.png'];
  const baseFilename = filename.includes('.') ? filename.substring(0, filename.lastIndexOf('.')) : filename;
  
  // Known existing files (based on directory listing)
  const existingFiles = new Set([
    '201003_TRAX_Silvertone (4).webp',
    '210510_Ford_Mustang_GT_Arclid_Quarry-11.webp',
    '211125_Hampson_Auctions-29.webp',
    '211211_24_Club_24_Hours_37_Watermark.webp',
    '220312_Historics_Auctioneers_Ascot-23.webp',
    '220510_Ford_Mustang_GT_Arclid_Quarry-2.webp',
    '221125_Northwest_Motor_Auction_Pictures-14.webp',
    '230112_NEC_Autoshow-132.webp',
    '230112_NEC_Autoshow-62.webp',
    '230210_Stoke_Car_Photography-9.webp',
    '230226_Swadlincote_Stock_Photography-23.webp',
    '240217-Australia_Trip-226.webp',
    '240217-Australia_Trip-232.webp',
    '240221-Australia_Trip-314.webp',
    '240602-Car_Collection-18 (1).webp',
    '240602-Car_Collection-7.webp',
    '240603-Car_Collection-38 (1).jpg',
    '240616-Model_Car_Collection-10 (1).jpg',
    '240616-Model_Car_Collection-3.webp',
    '240616-Model_Car_Collection-38 (2).jpg',
    '240617-Model_Car_Collection-66 (1).jpg',
    '240617-Model_Car_Collection-91 (1).jpg',
    '240619-London-26.webp',
    '240620-Model_Car_Collection-111.webp',
    '240620-Model_Car_Collection-116.webp',
    '240620-Model_Car_Collection-96 (1).jpg',
    '240708-Model_Car_Collection-130 (1).jpg',
    '240708-Model_Car_Collection-21 (1).jpg',
    '240708-Model_Car_Collection-69 (1).jpg',
    '240728-Hampson_Auctions _Oulton_Park_GC_Sun-7.webp',
    '240804-Model_Car_Collection-46 (1).jpg',
    '240915-Trentham_Car_Meet-1.webp',
    '250705-Bentley_S2-1 (1).webp',
    '250710-NYCC-2.webp',
    'Audi TTS Martini White Rear three quarter landscape.webp',
    'Bathgate Yamaha R1 Superbike with Volvo FM Lorry in sand front three quarter poster.webp',
    'Chevrolet 3100 Pickup red rear three quarters poster.webp',
    'Cumulative_Shutterstock_Downloads_Earnings_Jan-Apr2023.png',
    'Cumulative_Stock_Photography_Revenue_2022_2025_v2.webp',
    'ezgif-675443f33cc2e4.webp',
    'Ford Escort Mexico MK1 with Dog front poster.webp',
    'google-ads-analytics-screenshot.webp',
    'image (1).jpg',
    'image (2).jpg',
    'McLaren 650S Alaskan Diamond White Front three quarter poster.webp',
    'mobile-first-design.jpg',
    'mobile-first-design.webp',
    'output (5).webp',
    'Rolls Royce Cullinan Premiere Silver front three quarters poster.webp',
    'Rolls Royce Cullinan Premiere Silver Side Profile poster.webp',
    'Screenshot 2025-05-25 191000.webp',
    'Screenshot 2025-07-04 193922 (1).webp',
    'Screenshot 2025-07-04 211333.webp',
    'Screenshot 2025-07-05 201726.jpg',
    'Screenshot 2025-08-11 090845.webp',
    'Screenshot 2025-08-11 091100.webp',
    'Screenshot 2025-08-11 091315.webp',
    'Screenshot 2025-08-11 143853.webp',
    'Screenshot 2025-08-11 143943.webp',
    'Screenshot 2025-08-14 093805-cropped.webp',
    'Screenshot 2025-08-14 093805.webp',
    'Screenshot 2025-08-14 093911.webp',
    'Screenshot 2025-08-14 093957.webp',
    'Screenshot 2025-08-14 094204.webp',
    'Screenshot 2025-08-14 094346.webp',
    'Screenshot 2025-08-14 094416.webp',
    'Screenshot 2025-08-14 151118.webp',
    'screenshot-2025-07-04-193922.webp',
    'screenshot-2025-08-11-143853.webp',
    'screenshot-2025-08-11-analytics-data.webp',
    'screenshot-2025-09-23-analytics-dashboard.webp',
    'Shutterstock_Downloads_Earnings_Jan_Apr_2023.webp',
    'Stock_Photography_Earnings_Comparison_Clear.png',
    'Stock_Photography_Earnings_Comparison.webp',
    'Stock_Photography_Revenue_Bar_Chart.png',
    'Stock_Photography_SAMIRA.png',
    'Toyota Supra MK4 Yellow front three quarter landscape.webp',
    'welcome-hero.jpg',
    'welcome-hero.webp',
    'WhatsApp Image 2025-07-04 at 7.10.38 PM.webp',
    'WhatsApp Image 2025-07-04 at 8.44.20 PM (1).jpg',
    'WhatsApp Image 2025-07-05 at 7.58.19 PM.jpg',
    'WhatsApp Image 2025-07-05 at 9.00.50 PM.jpg',
    'WhatsApp Image 2025-07-06 at 9.09.08 PM.jpeg',
    'WhatsApp Image 2025-07-11 at 2.22.32 PM (1).webp',
    'WhatsApp Image 2025-07-11 at 2.22.32 PM.webp',
    'WhatsApp Image 2025-07-11 at 2.22.33 PM (1).webp',
    'WhatsApp Image 2025-07-11 at 2.22.33 PM (2).webp',
    'WhatsApp Image 2025-07-11 at 2.22.33 PM (3).webp',
    'WhatsApp Image 2025-07-11 at 2.22.33 PM.webp'
  ]);
  
  // Check if the exact filename exists
  if (existingFiles.has(filename)) {
    return normalizedSrc;
  }
  
  // Try different extensions for the base filename
  for (const ext of extensionOrder) {
    const testFilename = baseFilename + ext;
    if (existingFiles.has(testFilename)) {
      return `/images/blog/${testFilename}`;
    }
  }
  
  // If no match found, return the original normalized src (will show broken image)
  // This helps identify missing files during development
  return normalizedSrc;
}

/**
 * Resolves the thumbnail image for blog index cards
 * @param post Blog post with optional image fields
 * @returns Valid, renderable src string with leading slash
 */
export function resolveBlogCardImage(post: BlogPostWithOptionalImages): string {
  // Follow the canonical resolution order
  const src = post.cardImage || 
               post.coverImage || 
               post.heroImage || 
               post.image || 
               DEFAULT_BLOG_CARD_IMAGE;
  
  // Handle empty/undefined values
  if (!src) {
    return DEFAULT_BLOG_CARD_IMAGE;
  }
  
  // Apply strict normalization for blog card previews
  return normalizeBlogCardSrc(src);
}

/**
 * Legacy hardcoded mapping for specific posts
 * This maintains existing behavior while allowing the resolver to handle missing cases
 */
export const LEGACY_CARD_COVERS: Record<string, string> = {
  'paid-ads-campaign-learnings': '/images/hero/google-ads-analytics-dashboard.webp',
  'flyers-roi-breakdown': '/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
  'flyer-marketing-case-study-part-1': '/images/hero/aston-martin-db6-website.webp',
  'flyer-marketing-case-study-part-2': '/images/blog/211125_Hampson_Auctions-29.webp',
  'stock-photography-lessons': '/images/hero/240619-london-19.webp',
  // Stock Photography series covers
  'stock-photography-getting-started': '/images/blog/230226_Swadlincote_Stock_Photography-23.webp',
  'stock-photography-breakthrough': '/images/blog/Cumulative_Shutterstock_Downloads_Earnings_Jan-Apr2023.png',
  'stock-photography-income-growth': '/images/blog/Stock_Photography_Revenue_Bar_Chart.png',
  // DeepMeta analytics article - LOCKED thumbnail (analytics dashboard)
  'exploring-istock-data-deepmeta': '/images/blog/screenshot-2025-09-23-analytics-dashboard.webp',
  // Model Car Collection series covers - CORRECTED EXTENSIONS
  'ebay-model-ford-collection-part-1': '/images/blog/240616-Model_Car_Collection-3.webp',
  'ebay-photography-workflow-part-2': '/images/blog/240602-Car_Collection-7.webp',
  'ebay-model-car-sales-timing-bundles': '/images/blog/240708-Model_Car_Collection-21 (1).jpg',
  'ebay-repeat-buyers-part-4': '/images/blog/240804-Model_Car_Collection-46 (1).jpg',
  'ebay-business-side-part-5': '/images/blog/240620-Model_Car_Collection-96 (1).jpg',
};

/**
 * Enhanced resolver that uses legacy mapping as cardImage fallback
 * @param post Blog post with slug and optional image fields
 * @returns Valid, renderable src string
 */
export function resolveBlogCardImageWithLegacy(post: BlogPostWithOptionalImages): string {
  // Create enhanced post object with legacy mapping as cardImage
  const enhancedPost = {
    ...post,
    cardImage: LEGACY_CARD_COVERS[post.slug] || post.cardImage,
  };
  
  return resolveBlogCardImage(enhancedPost);
}