import React from 'react';
import Link from 'next/link';

interface BlogFiltersProps {
  categories: string[];
  tags: string[];
  activeCategory?: string;
  activeTag?: string;
}

const BlogFilters: React.FC<BlogFiltersProps> = ({
  categories,
  tags,
  activeCategory,
  activeTag,
}) => {
  return (
    <div className='space-y-6'>
      {/* Categories Filter */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Categories</h3>
        <div className='space-y-2'>
          <Link
            href='/blog'
            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
              !activeCategory
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            All Categories ({categories.length})
          </Link>
          {categories.map(category => (
            <Link
              key={category}
              href={`/blog?category=${encodeURIComponent(category)}`}
              className={`block px-3 py-2 rounded-md text-sm transition-colors capitalize ${
                activeCategory === category
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Tags</h3>
        <div className='flex flex-wrap gap-2'>
          {tags.map(tag => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className={`inline-block px-3 py-1 rounded-full text-sm transition-colors ${
                activeTag === tag
                  ? 'bg-green-100 text-green-800 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Posts */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Quick Links
        </h3>
        <div className='space-y-2'>
          <Link
            href='/blog/featured'
            className='block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors'
          >
            Featured Posts
          </Link>
          <Link
            href='/blog/archive'
            className='block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors'
          >
            Archive
          </Link>
        </div>
      </div>

      {/* Mobile Filter Toggle - Hidden on desktop */}
      <div className='lg:hidden'>
        <button
          type='button'
          className='w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors'
          onClick={() => {
            // This would toggle mobile filter visibility
            // Implementation would depend on state management approach
          }}
        >
          Filter Posts
        </button>
      </div>
    </div>
  );
};

export default BlogFilters;
