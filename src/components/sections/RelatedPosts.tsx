import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Button from '@/components/ui/Button';

interface RelatedPostsProps {
  posts: BlogPost[];
  title?: string;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({
  posts,
  title = 'Related Posts',
}) => {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className='bg-gray-50 py-16'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          {/* Section Header */}
          <div className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
              {title}
            </h2>
            <p className='text-lg text-gray-600'>
              Continue reading with these related articles
            </p>
          </div>

          {/* Related Posts Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12'>
            {posts.map(post => (
              <RelatedPostCard key={post.slug} post={post} />
            ))}
          </div>

          {/* View All Posts Button */}
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
        </div>
      </div>
    </section>
  );
};

interface RelatedPostCardProps {
  post: BlogPost;
}

const RelatedPostCard: React.FC<RelatedPostCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      <div className='relative h-48 overflow-hidden'>
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
            <div className='text-4xl opacity-20'>📝</div>
          </div>
        )}

        {/* Featured Badge */}
        {post.featured && (
          <div className='absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium'>
            Featured
          </div>
        )}

        {/* Reading Time */}
        <div className='absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs'>
          {post.readingTime || calculateReadingTime(post.content)}
        </div>
      </div>

      {/* Content */}
      <div className='p-5'>
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className='flex flex-wrap gap-1 mb-3'>
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
        <h3 className='text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2'>
          <Link href={`/blog/${post.slug}`} className='hover:underline'>
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
          {post.excerpt}
        </p>

        {/* Meta Information */}
        <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
          <span>By {post.author}</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className='flex flex-wrap gap-1 mb-3'>
            {post.tags.slice(0, 2).map(tag => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className='inline-block text-xs text-gray-500 hover:text-blue-600 transition-colors'
              >
                #{tag}
              </Link>
            ))}
            {post.tags.length > 2 && (
              <span className='text-xs text-gray-400'>
                +{post.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Read More Button */}
        <Button
          href={`/blog/${post.slug}`}
          variant='primary'
          size='sm'
          className='w-full text-sm'
        >
          Read More
        </Button>
      </div>
    </article>
  );
};

export default RelatedPosts;
