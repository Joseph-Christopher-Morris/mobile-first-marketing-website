import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { getAllBlogPosts, getFeaturedPosts } from '@/lib/blog-api';
import { getAllServices } from '@/lib/content';
import { NewsletterSignup } from '@/components/sections/NewsletterSignup';
import { ServicesShowcase } from '@/components/sections/ServicesShowcase';
import { resolveBlogCardImageWithLegacy } from '@/lib/blog-thumbnail-resolver';
import { buildSEO } from '@/lib/seo';

export const metadata: Metadata = buildSEO({
  intent: "Digital Marketing Case Studies",
  description: "Real case studies on SEO, Google Ads, analytics, and website performance. Learn what works from actual Cheshire business projects with proven ROI results.",
  canonicalPath: "/blog/",
});

export default async function BlogPage() {
  const allPosts = await getAllBlogPosts();
  const featuredPosts = await getFeaturedPosts();
  const featuredPost = featuredPosts[0];
  const regularPosts = allPosts.filter(post => !post.featured);
  const services = getAllServices();
  
  // Model Car Collection series ordering (Part 5 → Part 1 on blog listing)
  const modelCarSeriesListingOrder = [
    'ebay-business-side-part-5',
    'ebay-repeat-buyers-part-4',
    'ebay-model-car-sales-timing-bundles',
    'ebay-photography-workflow-part-2',
    'ebay-model-ford-collection-part-1',
  ];
  
  const seriesIndex = new Map(modelCarSeriesListingOrder.map((s, i) => [s, i]));
  
  const sortedRegularPosts = [...regularPosts].sort((a, b) => {
    const ai = seriesIndex.get(a.slug);
    const bi = seriesIndex.get(b.slug);
    
    // Both in Model Car Collection series: order by seriesIndex (Part 5 → Part 1)
    if (ai !== undefined && bi !== undefined) return ai - bi;
    
    // Normal chronological ordering (newest first) for all other cases
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Layout>
      <div className='min-h-screen bg-gray-50'>
        {/* Hero Section */}
        <section className='bg-white border-b border-gray-200 py-16 md:py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6'>
                My Case Studies
              </h1>
              <p className='text-sm md:text-base text-slate-700 max-w-3xl mx-auto'>
                Real results from my projects. Learn what works and how to apply it to your business.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <section className='py-16 md:py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {/* Featured Blog Post */}
              {featuredPost && (
                <article className='md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                  <div className='relative w-full h-48 md:h-64 bg-gray-200'>
                    <Image
                      src={resolveBlogCardImageWithLegacy(featuredPost)}
                      alt={featuredPost.title}
                      fill
                      className='object-cover'
                      priority
                    />
                  </div>
                  <div className='p-6 md:p-8'>
                    <div className='flex items-center text-sm text-gray-500 mb-3'>
                      <time dateTime={featuredPost.date}>
                        {new Date(featuredPost.date).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </time>
                      <span className='mx-2'>•</span>
                      <span>{featuredPost.category}</span>
                      <span className='mx-2'>•</span>
                      <span>{featuredPost.readTime} min read</span>
                    </div>
                    <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
                      {featuredPost.title}
                    </h2>
                    <p className='text-gray-600 mb-6 leading-relaxed'>
                      {featuredPost.excerpt}
                    </p>
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
                      aria-label={`Read: ${featuredPost.title}`}
                    >
                      Read: {featuredPost.title}
                      <svg
                        className='ml-2 w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              )}

              {/* Regular Blog Posts */}
              {sortedRegularPosts.map((post, index) => (
                <article
                  key={post.slug}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
                >
                  <div className='relative w-full h-48 bg-gray-200'>
                    <Image
                      src={resolveBlogCardImageWithLegacy(post)}
                      alt={post.title}
                      fill
                      className='object-cover'
                      priority={index < 6}
                    />
                  </div>
                  <div className='p-6'>
                    <div className='flex items-center text-sm text-gray-500 mb-3'>
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <span className='mx-2'>•</span>
                      <span>{post.category}</span>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-3'>
                      {post.title}
                    </h3>
                    <p className='text-gray-600 mb-4 leading-relaxed'>
                      {post.excerpt}
                    </p>
                    <div className='flex items-center justify-between'>
                      <Link
                        href={`/blog/${post.slug}`}
                        className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
                        aria-label={`Read: ${post.title}`}
                      >
                        Read: {post.title}
                        <svg
                          className='ml-2 w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </Link>
                      {post.readTime && (
                        <span className='text-sm text-gray-500'>
                          {post.readTime} min read
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* My Services Section */}
        <ServicesShowcase services={services} />

        {/* Newsletter Signup */}
        <NewsletterSignup />
      </div>
    </Layout>
  );
}
