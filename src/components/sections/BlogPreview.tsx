'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/blog-types';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Button from '@/components/ui/Button';
import AnalyticsChart from '@/components/ui/AnalyticsChart';

interface BlogPreviewProps {
  posts: BlogPost[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({
  posts,
  title = 'Latest Insights',
  subtitle = 'Stay updated with our latest thoughts and industry insights',
  showViewAll = true,
}) => {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className='py-16 sm:py-20 bg-gray-50'>
      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-12 sm:mb-16'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            {title}
          </h2>
          <p className='text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto'>
            {subtitle}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12' data-testid="blog-preview">
          {posts.map((post, index) => (
            <BlogPostCard key={post.slug} post={post} isFirstRow={index < 3} />
          ))}
        </div>

        {/* View All Button */}
        {showViewAll && (
          <div className='text-center'>
            <Button
              href='/blog'
              variant='outline'
              size='lg'
              className='min-w-[200px]'
            >
              View All Posts
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

interface BlogPostCardProps {
  post: BlogPost;
  isFirstRow?: boolean;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, isFirstRow = false }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

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
    return readingTime;
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    console.log(`✅ Image loaded successfully: ${post.image}`);
  };

  const handleImageError = () => {
    console.error(`❌ Image failed to load: ${post.image} (attempt ${retryCount + 1})`);
    
    // Try to retry loading the image up to 2 times
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      // Small delay before retry
      setTimeout(() => {
        setImageLoading(true);
        setImageError(false);
      }, 1000);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  };

  const renderImageContent = () => {
    if (post.image && !imageError) {
      return (
        <div className='relative w-full h-full overflow-hidden'>
          {imageLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10'>
              <div className='text-gray-400 text-sm'>Loading image...</div>
            </div>
          )}
          <OptimizedImage
            key={`${post.slug}-image-${retryCount}`}
            src={post.image}
            alt={`Featured image for ${post.title}`}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-300'
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={isFirstRow}
            loading={isFirstRow ? 'eager' : 'lazy'}
            quality={85}
            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            placeholder='blur'
          />
        </div>
      );
    }

    // Fallback: Show analytics chart for analytics/campaign related posts
    if (post.tags?.some(tag => ['analytics', 'campaigns', 'paid-ads', 'data-driven', 'meta-ads', 'google-ads'].includes(tag))) {
      return (
        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50'>
          <AnalyticsChart 
            className='w-full max-w-sm scale-75 sm:scale-90'
            title='Campaign Performance'
            metric='2.9%'
            value='446'
            change='+15.2%'
          />
        </div>
      );
    }

    // Default fallback with better visual design
    return (
      <div className='w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl text-gray-400 mb-2'>📊</div>
          <div className='text-sm text-gray-500'>Blog Post</div>
        </div>
      </div>
    );
  };

  return (
    <article className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100'>
      {/* Analytics Chart/Image Section */}
      <div className='relative h-48 sm:h-52 bg-gray-50 overflow-hidden'>
        <div className='absolute inset-0'>
          {renderImageContent()}
        </div>

        {/* Reading Time Badge */}
        <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm z-20'>
          {post.readTime || calculateReadingTime(post.content)} min read
        </div>
      </div>

      {/* Content Section */}
      <div className='p-6'>
        {/* Title */}
        <h3 className='text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors'>
          <Link href={`/blog/${post.slug}`} className='hover:underline'>
            {post.title}
          </Link>
        </h3>

        {/* Description */}
        <p className='text-gray-600 mb-6 leading-relaxed line-clamp-3'>
          {post.excerpt}
        </p>

        {/* Key Features/Tags */}
        <div className='mb-6'>
          <h4 className='text-sm font-semibold text-gray-900 mb-3'>Key Topics:</h4>
          <div className='space-y-2'>
            {post.tags && post.tags.slice(0, 3).map((tag) => (
              <div key={tag} className='flex items-center text-sm text-gray-600'>
                <div className='w-2 h-2 bg-pink-500 rounded-full mr-3'></div>
                <span className='capitalize'>{tag.replace('-', ' ')}</span>
              </div>
            ))}
            {post.tags && post.tags.length > 3 && (
              <div className='flex items-center text-sm text-gray-500 italic'>
                <div className='w-2 h-2 bg-gray-300 rounded-full mr-3'></div>
                <span>+{post.tags.length - 3} more insights</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='space-y-3'>
          <Button
            href={`/blog/${post.slug}`}
            variant='primary'
            size='md'
            className='w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl'
          >
            Read Article
          </Button>
          
          {/* Meta Information */}
          <div className='flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100'>
            <span>By {post.author}</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPreview;
