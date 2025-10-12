import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { getAllBlogPosts, getFeaturedPosts } from '@/lib/blog-api';
import { getAllServices } from '@/lib/content';
import { NewsletterSignup } from '@/components/sections/NewsletterSignup';
import { ServicesShowcase } from '@/components/sections/ServicesShowcase';

export const metadata: Metadata = {
  title: 'Automotive Photography Blog | Industry Insights & Success Stories',
  description:
    'Latest insights, tips, and success stories from Vivid Auto Photography. Learn about automotive photography techniques, industry trends, marketing strategies, and real-world case studies from my Nantwich & Cheshire team.',
  keywords: [
    'automotive photography blog',
    'car photography tips',
    'automotive marketing insights',
    'photography industry trends',
    'automotive advertising case studies',
    'vehicle photography techniques',
    'car dealership marketing',
    'automotive photography success stories',
    'photography business insights',
    'automotive industry updates'
  ],
  openGraph: {
    title: 'Automotive Photography Blog | Industry Insights & Success Stories',
    description:
      'Latest insights, tips, and success stories from Vivid Auto Photography. Learn about automotive photography techniques, industry trends, and real-world case studies.',
  },
};

export default async function BlogPage() {
  const allPosts = await getAllBlogPosts();
  const featuredPosts = await getFeaturedPosts();
  const featuredPost = featuredPosts[0];
  const regularPosts = allPosts.filter(post => !post.featured);
  const services = getAllServices();
  // Map each blog slug to its hero image path
const cardCovers: Record<string, string> = {
  'paid-ads-campaign-learnings': '/images/hero/google-ads-analytics-dashboard.webp',
  'flyers-roi-breakdown': '/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
  'stock-photography-lessons': '/images/hero/240619-london-19.webp',
};

// Prefer our mapped cover, then frontmatter image, then a safe default
  const coverFor = (slug: string, img?: string) =>
    cardCovers[slug] || img || '/images/hero/aston-martin-db6-website.webp';

  return (
    <Layout>
      <div className='min-h-screen bg-gray-50'>
        {/* Hero Section */}
        <section className='bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16'>
            <div className='text-center'>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'>
                My Blog
              </h1>
              <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto'>
                Latest insights, tips, and updates from my Vivid Auto
                Photography team. Stay informed about industry trends, best
                practices, and success stories.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <section className='py-12 md:py-16'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
              {/* Featured Blog Post */}
              {featuredPost && (
                <article className='md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
                  <div className='relative w-full h-48 md:h-64 bg-gray-200'>
                    <Image
                    src={coverFor(featuredPost.slug, featuredPost.image)}
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
                      aria-label={`Read full article: ${featuredPost.title}`}
                    >
                      Read More
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
              {regularPosts.map((post, index) => (
                <article
                  key={post.slug}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
                >
                  <div className='relative w-full h-48 bg-gray-200'>
                    <Image
                      src={cardCovers[post.slug] ?? post.image ?? '/images/hero/aston-martin-db6-website.webp'}
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
                        aria-label={`Read full article: ${post.title}`}
                      >
                        Read More
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

        {/* Our Services Section */}
        <ServicesShowcase services={services} />

        {/* Newsletter Signup */}
        <NewsletterSignup />
      </div>
    </Layout>
  );
}
