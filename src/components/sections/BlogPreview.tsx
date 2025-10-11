import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Button from '@/components/ui/Button';

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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12'>
          {posts.map(post => (
            <BlogPostCard key={post.slug} post={post} />
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
    return readingTime;
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
          {post.readingTime || calculateReadingTime(post.content)} min read
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-3'>
            {post.categories.slice(0, 2).map(category => (
              <span
                key={category}
                className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize'
              >
                {category}
              </span>
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
              <span
                key={tag}
                className='inline-block text-xs text-gray-500 hover:text-blue-600 transition-colors'
              >
                #{tag}
              </span>
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

export default BlogPreview;
