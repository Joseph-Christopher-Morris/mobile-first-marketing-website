import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Button from '@/components/ui/Button';

interface BlogArchiveProps {
  posts: BlogPost[];
  postsByDate: Record<string, Record<string, BlogPost[]>>;
  selectedYear?: string;
  selectedMonth?: string;
}

const BlogArchive: React.FC<BlogArchiveProps> = ({
  posts,
  postsByDate,
  selectedYear,
  selectedMonth,
}) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getPageTitle = () => {
    if (selectedYear && selectedMonth) {
      const monthName = monthNames[parseInt(selectedMonth) - 1];
      return `${monthName} ${selectedYear} Archive`;
    }
    if (selectedYear) {
      return `${selectedYear} Archive`;
    }
    return 'Blog Archive';
  };

  const getPageSubtitle = () => {
    if (selectedYear && selectedMonth) {
      const monthName = monthNames[parseInt(selectedMonth) - 1];
      return `All posts from ${monthName} ${selectedYear}`;
    }
    if (selectedYear) {
      return `All posts from ${selectedYear}`;
    }
    return 'Browse all our blog posts organized by date';
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

            {/* Breadcrumb */}
            <nav className='mb-4'>
              <ol className='flex items-center justify-center space-x-2 text-sm'>
                <li>
                  <Link
                    href='/'
                    className='text-white/80 hover:text-white hover:underline'
                  >
                    Home
                  </Link>
                </li>
                <li className='text-white/60'>
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
                    className='text-white/80 hover:text-white hover:underline'
                  >
                    Blog
                  </Link>
                </li>
                <li className='text-white/60'>
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
                <li className='text-white/80'>Archive</li>
              </ol>
            </nav>
          </div>
        </div>
      </section>

      <div className='container mx-auto px-4 py-12'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar - Archive Navigation */}
          <aside className='lg:w-1/4'>
            <div className='sticky top-8'>
              <div className='bg-white rounded-lg shadow-sm border p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Archive
                </h3>

                {/* Back to All Posts */}
                <div className='mb-4'>
                  <Link
                    href='/blog/archive'
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      !selectedYear
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    All Posts
                  </Link>
                </div>

                {/* Years and Months */}
                <div className='space-y-2'>
                  {Object.keys(postsByDate)
                    .sort((a, b) => parseInt(b) - parseInt(a))
                    .map(year => (
                      <div key={year}>
                        <Link
                          href={`/blog/archive?year=${year}`}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            selectedYear === year && !selectedMonth
                              ? 'bg-blue-100 text-blue-800'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {year} (
                          {Object.values(postsByDate[year]).flat().length})
                        </Link>

                        {/* Show months if year is selected */}
                        {selectedYear === year && (
                          <div className='ml-4 mt-2 space-y-1'>
                            {Object.keys(postsByDate[year])
                              .sort((a, b) => parseInt(b) - parseInt(a))
                              .map(month => {
                                const monthName =
                                  monthNames[parseInt(month) - 1];
                                const postCount =
                                  postsByDate[year][month].length;
                                return (
                                  <Link
                                    key={month}
                                    href={`/blog/archive?year=${year}&month=${month}`}
                                    className={`block px-3 py-1 rounded-md text-sm transition-colors ${
                                      selectedMonth === month
                                        ? 'bg-green-100 text-green-800 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                  >
                                    {monthName} ({postCount})
                                  </Link>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className='lg:w-3/4'>
            {/* Active Filter Display */}
            {(selectedYear || selectedMonth) && (
              <div className='mb-8 p-4 bg-white rounded-lg shadow-sm border'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-sm font-medium text-gray-600'>
                    Viewing:
                  </span>

                  {selectedYear && selectedMonth && (
                    <Link
                      href='/blog/archive'
                      className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors'
                    >
                      {monthNames[parseInt(selectedMonth) - 1]} {selectedYear}
                      <span className='ml-1'>×</span>
                    </Link>
                  )}

                  {selectedYear && !selectedMonth && (
                    <Link
                      href='/blog/archive'
                      className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors'
                    >
                      {selectedYear}
                      <span className='ml-1'>×</span>
                    </Link>
                  )}

                  <Link
                    href='/blog/archive'
                    className='text-sm text-gray-500 hover:text-gray-700 underline ml-2'
                  >
                    View all
                  </Link>
                </div>
              </div>
            )}

            {/* Posts List */}
            {posts.length > 0 ? (
              <div className='space-y-6'>
                {posts.map(post => (
                  <ArchivePostCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              /* No Posts Found */
              <div className='text-center py-16'>
                <div className='text-6xl mb-4'>📅</div>
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                  No posts found
                </h3>
                <p className='text-gray-600 mb-6'>
                  No posts were published during this time period.
                </p>
                <Button href='/blog/archive' variant='primary'>
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

interface ArchivePostCardProps {
  post: BlogPost;
}

const ArchivePostCard: React.FC<ArchivePostCardProps> = ({ post }) => {
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
    <article className='bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow'>
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Featured Image */}
        {post.featuredImage && (
          <div className='sm:w-48 sm:flex-shrink-0'>
            <div className='relative h-32 sm:h-24 rounded-lg overflow-hidden'>
              <OptimizedImage
                src={post.featuredImage}
                alt={post.title}
                fill
                className='object-cover'
                sizes='(max-width: 640px) 100vw, 192px'
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className='flex-1'>
          {/* Meta Information */}
          <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2'>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>By {post.author}</span>
            <span>
              {post.readingTime || calculateReadingTime(post.content)}
            </span>
            {post.featured && (
              <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'>
                Featured
              </span>
            )}
          </div>

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-2'>
              {post.categories.slice(0, 2).map(category => (
                <Link
                  key={category}
                  href={`/blog/category/${encodeURIComponent(category)}`}
                  className='inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full capitalize hover:bg-gray-200 transition-colors'
                >
                  {category}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className='text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors'>
            <Link href={`/blog/${post.slug}`} className='hover:underline'>
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className='text-gray-600 mb-3 line-clamp-2'>{post.excerpt}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {post.tags.slice(0, 3).map(tag => (
                <Link
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
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
        </div>
      </div>
    </article>
  );
};

export default BlogArchive;
