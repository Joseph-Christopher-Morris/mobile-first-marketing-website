import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface BlogPostContentProps {
  post: BlogPost;
  contentHtml: string;
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({
  post,
  contentHtml,
}) => {
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
    <article className='bg-white'>
      {/* Hero Section */}
      <header className='relative'>
        {/* Featured Image */}
        {post.featuredImage && (
          <div className='relative h-64 sm:h-80 md:h-96 overflow-hidden'>
            <OptimizedImage
              src={post.featuredImage}
              alt={post.title}
              fill
              className='object-cover'
              priority
              sizes='100vw'
            />
            <div className='absolute inset-0 bg-black/40' />
          </div>
        )}

        {/* Post Header */}
        <div
          className={`${post.featuredImage ? 'absolute inset-0 flex items-end' : 'py-16'}`}
        >
          <div className='container mx-auto px-4'>
            <div
              className={`max-w-4xl mx-auto ${post.featuredImage ? 'text-white pb-8' : 'text-gray-900'}`}
            >
              {/* Breadcrumb */}
              <nav className='mb-4'>
                <ol className='flex items-center space-x-2 text-sm'>
                  <li>
                    <Link
                      href='/'
                      className={`hover:underline ${post.featuredImage ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Home
                    </Link>
                  </li>
                  <li
                    className={
                      post.featuredImage ? 'text-white/60' : 'text-gray-400'
                    }
                  >
                    <svg
                      className='w-4 h-4'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </li>
                  <li>
                    <Link
                      href='/blog'
                      className={`hover:underline ${post.featuredImage ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Blog
                    </Link>
                  </li>
                  <li
                    className={
                      post.featuredImage ? 'text-white/60' : 'text-gray-400'
                    }
                  >
                    <svg
                      className='w-4 h-4'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </li>
                  <li
                    className={
                      post.featuredImage ? 'text-white/80' : 'text-gray-500'
                    }
                  >
                    Current Post
                  </li>
                </ol>
              </nav>

              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-4'>
                  {post.categories.map(category => (
                    <Link
                      key={category}
                      href={`/blog?category=${encodeURIComponent(category)}`}
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                        post.featuredImage
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight'>
                {post.title}
              </h1>

              {/* Excerpt */}
              <p
                className={`text-lg sm:text-xl mb-6 ${post.featuredImage ? 'text-white/90' : 'text-gray-600'}`}
              >
                {post.excerpt}
              </p>

              {/* Meta Information */}
              <div className='flex flex-wrap items-center gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                      post.featuredImage
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={
                      post.featuredImage ? 'text-white/90' : 'text-gray-600'
                    }
                  >
                    By {post.author}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 ${post.featuredImage ? 'text-white/80' : 'text-gray-500'}`}
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
                <div
                  className={`flex items-center gap-1 ${post.featuredImage ? 'text-white/80' : 'text-gray-500'}`}
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span>
                    {post.readingTime || calculateReadingTime(post.content)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className='container mx-auto px-4 py-12'>
        <div className='max-w-4xl mx-auto'>
          <div className='prose prose-lg max-w-none'>
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className='mt-12 pt-8 border-t border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Tags</h3>
              <div className='flex flex-wrap gap-2'>
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className='inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors'
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          <div className='mt-12 pt-8 border-t border-gray-200'>
            <div className='flex items-start gap-4'>
              <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-700'>
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                  {post.author}
                </h3>
                <p className='text-gray-600'>
                  Content creator and industry expert sharing insights on modern
                  web development, design trends, and digital Vivid Auto
                  Photography strategies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPostContent;
