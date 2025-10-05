'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { BlogPost } from '@/types';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Button from '@/components/ui/Button';
import BlogFilters from './BlogFilters';
import BlogPagination from './BlogPagination';
import BlogSearch from './BlogSearch';

interface BlogListingProps {
  posts: BlogPost[];
  categories: string[];
  tags: string[];
  currentPage?: number;
  totalPages?: number;
  totalPosts?: number;
  activeCategory?: string;
  activeTag?: string;
}

const BlogListing: React.FC<BlogListingProps> = ({
  posts,
  categories,
  tags,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current filters from URL
  const activeCategory = searchParams.get('category') || '';
  const activeTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const postsPerPage = 9;

  // Filter posts based on current filters
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query)) ||
          post.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter(post =>
        post.categories.some(
          cat => cat.toLowerCase() === activeCategory.toLowerCase()
        )
      );
    }

    // Filter by tag
    if (activeTag) {
      filtered = filtered.filter(post =>
        post.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase())
      );
    }

    return filtered;
  }, [posts, searchQuery, activeCategory, activeTag]);

  // Calculate pagination
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (activeCategory) {
      return `Posts in "${activeCategory}"`;
    }
    if (activeTag) {
      return `Posts tagged "${activeTag}"`;
    }
    return 'Latest Blog Posts';
  };

  const getPageSubtitle = () => {
    if (searchQuery) {
      return `Found ${totalPosts} post${totalPosts !== 1 ? 's' : ''} matching your search`;
    }
    if (activeCategory || activeTag) {
      return `${totalPosts} post${totalPosts !== 1 ? 's' : ''} found`;
    }
    return 'Stay updated with our latest insights, tips, and industry news';
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      <section className='bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16 sm:py-20'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto text-center'>
            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4'>
              {getPageTitle()}
            </h1>
            <p className='text-lg sm:text-xl opacity-90 mb-8'>
              {getPageSubtitle()}
            </p>

            {/* Search Component */}
            <div className='max-w-md mx-auto'>
              <BlogSearch initialQuery={searchQuery} />
            </div>
          </div>
        </div>
      </section>

      <div className='container mx-auto px-4 py-12'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar - Filters */}
          <aside className='lg:w-1/4'>
            <div className='sticky top-8'>
              <BlogFilters
                categories={categories}
                tags={tags}
                activeCategory={activeCategory}
                activeTag={activeTag}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className='lg:w-3/4'>
            {/* Active Filters Display */}
            {(activeCategory || activeTag || searchQuery) && (
              <div className='mb-8 p-4 bg-white rounded-lg shadow-sm border'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-sm font-medium text-gray-600'>
                    Active filters:
                  </span>

                  {activeCategory && (
                    <Link
                      href='/blog'
                      className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors'
                    >
                      Category: {activeCategory}
                      <span className='ml-1'>×</span>
                    </Link>
                  )}

                  {activeTag && (
                    <Link
                      href='/blog'
                      className='inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors'
                    >
                      Tag: {activeTag}
                      <span className='ml-1'>×</span>
                    </Link>
                  )}

                  {searchQuery && (
                    <Link
                      href='/blog'
                      className='inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors'
                    >
                      Search: {searchQuery}
                      <span className='ml-1'>×</span>
                    </Link>
                  )}

                  <Link
                    href='/blog'
                    className='text-sm text-gray-500 hover:text-gray-700 underline ml-2'
                  >
                    Clear all
                  </Link>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            {paginatedPosts.length > 0 ? (
              <>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-12'>
                  {paginatedPosts.map(post => (
                    <BlogPostCard key={post.slug} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <BlogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl='/blog'
                    searchParams={{
                      ...(activeCategory && { category: activeCategory }),
                      ...(activeTag && { tag: activeTag }),
                      ...(searchQuery && { search: searchQuery }),
                    }}
                  />
                )}
              </>
            ) : (
              /* No Posts Found */
              <div className='text-center py-16'>
                <div className='text-6xl mb-4'>📝</div>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                  No posts found
                </h3>
                <p className='text-gray-600 mb-6'>
                  {searchQuery || activeCategory || activeTag
                    ? 'Try adjusting your filters or search terms'
                    : 'We haven&apos;t published any posts yet'}
                </p>
                <Button href='/blog' variant='primary'>
                  View All Posts
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
  };

  return (
    <article className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group overflow-hidden'>
      {/* Featured Image */}
      <div className='relative h-48 sm:h-56 overflow-hidden'>
        {post.featuredImage ? (
          <OptimizedImage
            src={post.featuredImage}
            alt={post.title}
            fill
            className='object-cover group-hover:scale-110 transition-transform duration-300'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
            <div className='text-6xl opacity-20'>📝</div>
          </div>
        )}

        {/* Featured Badge */}
        {post.featured && (
          <div className='absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium'>
            Featured
          </div>
        )}

        {/* Reading Time */}
        <div className='absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm'>
          {post.readingTime || calculateReadingTime(post.content)}
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-3'>
            {post.categories.slice(0, 2).map(category => (
              <Link
                key={category}
                href={`/blog?category=${encodeURIComponent(category)}`}
                className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize hover:bg-blue-200 transition-colors'
              >
                {category}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2'>
          <Link href={`/blog/${post.slug}`} className='hover:underline'>
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className='text-gray-600 mb-4 line-clamp-3'>{post.excerpt}</p>

        {/* Meta Information */}
        <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
          <div className='flex items-center gap-2'>
            <span>By {post.author}</span>
          </div>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className='flex flex-wrap gap-1 mb-4'>
            {post.tags.slice(0, 3).map(tag => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className='inline-block text-xs text-gray-500 hover:text-blue-600 transition-colors'
              >
                #{tag}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className='text-xs text-gray-400'>
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Read More Button */}
        <Button
          href={`/blog/${post.slug}`}
          variant='primary'
          size='sm'
          className='w-full'
        >
          Read More
        </Button>
      </div>
    </article>
  );
};

export default BlogListing;
