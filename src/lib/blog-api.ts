import { BlogPost } from './blog-types';



export async function getAllBlogPosts(): Promise<BlogPost[]> {
  // Import core blog posts (simplified structure)
  const postModules = await Promise.all([
    // Marketing Series (4 posts)
    import('../content/blog/flyers-roi-breakdown'),
    import('../content/blog/flyer-marketing-case-study-part-1'),
    import('../content/blog/flyer-marketing-case-study-part-2'),
    import('../content/blog/paid-ads-campaign-learnings'),

    // Stock Photography Series (4 posts)
    import('../content/blog/stock-photography-lessons'),
    import('../content/blog/stock-photography-income-growth'),
    import('../content/blog/stock-photography-getting-started'),
    import('../content/blog/stock-photography-breakthrough'),

    // Data Analysis (1 post)
    import('../content/blog/exploring-istock-data-deepmeta'),

    // eBay Series (5 posts)
    import('../content/blog/ebay-model-ford-collection-part-1'),
    import('../content/blog/ebay-photography-workflow-part-2'),
    import('../content/blog/ebay-model-car-sales-timing-bundles'),
    import('../content/blog/ebay-repeat-buyers-part-4'),
    import('../content/blog/ebay-business-side-part-5'),
  ]);

  const posts = postModules.map(module => module.default);

  // Sort by date (newest first)
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const module = await import(`../content/blog/${slug}`);
    return module.default;
  } catch (error) {
    return null;
  }
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.filter(post => post.featured);
}

export async function getPostsByCategory(
  category: string
): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.filter(
    post => post.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.filter(post =>
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
