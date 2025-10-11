import type { Metadata } from 'next';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import { getAllBlogPosts, getFeaturedPosts } from '@/lib/blog-api';
import { getAllServices } from '@/lib/content';
import { NewsletterSignup } from '@/components/sections/NewsletterSignup';
import { ServicesShowcase } from '@/components/sections/ServicesShowcase';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest insights, tips, and updates from our Vivid Auto Photography team. Stay informed about industry trends, best practices, and success stories.',
  openGraph: {
    title: 'Blog | Mobile-First Vivid Auto Photography',
    description: 'Latest insights, tips, and updates from our Vivid Auto Photography team. Stay informed about industry trends, best practices, and success stories.',
  },
};

export default async function BlogPage() {
  const allPosts = await getAllBlogPosts();
  const featuredPosts = await getFeaturedPosts();
  const featuredPost = featuredPosts[0];
  const regularPosts = allPosts.filter(post => !post.featured);
  const services = getAllServices();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Our Blog
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Latest insights, tips, and updates from our Vivid Auto Photography team. 
                Stay informed about industry trends, best practices, and success stories.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Featured Blog Post */}
              {featuredPost && (
                <article className="md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={featuredPost.image || "/images/hero-bg.jpg"}
                      alt={featuredPost.title}
                      className="w-full h-48 md:h-64 object-cover"
                      loading="eager"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <time dateTime={featuredPost.date}>
                        {new Date(featuredPost.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <span className="mx-2">•</span>
                      <span>{featuredPost.category}</span>
                      <span className="mx-2">•</span>
                      <span>{featuredPost.readTime} min read</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read More
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              )}

              {/* Regular Blog Posts */}
              {regularPosts.map((post, index) => (
                <article key={post.slug} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={post.image || "/images/hero-bg.jpg"}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                      loading={index < 6 ? "eager" : "lazy"}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <span className="mx-2">•</span>
                      <span>{post.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Read More
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      {post.readTime && (
                        <span className="text-sm text-gray-500">{post.readTime} min read</span>
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