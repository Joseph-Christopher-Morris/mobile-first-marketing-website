export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  readTime: number;
  featured?: boolean;
  // Optional image fields for blog card thumbnails
  cardImage?: string;
  coverImage?: string;
  heroImage?: string;
  // SCRAM meta description — outcome-led, 140–160 chars, [Outcome] + [Mechanism] + [Who it is for]
  metaDescription?: string;
  // Proof image mode — for screenshots, dashboards, comparisons that must not be cropped
  proofImage?: boolean;
  imageWidth?: number;
  imageHeight?: number;
  imageCaption?: string;
  // Optional CTA override fields — posts can customise text but cannot remove the CTA block
  ctaProblem?: string;
  ctaSolution?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface BlogCategory {
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface BlogTag {
  name: string;
  slug: string;
  count: number;
}

/**
 * SCRAM: Returns metaDescription if present, falls back to excerpt.
 * All blog posts should have an outcome-led metaDescription (140–160 chars).
 */
export function generateMetaDescription(post: BlogPost): string {
  return post.metaDescription || post.excerpt;
}
