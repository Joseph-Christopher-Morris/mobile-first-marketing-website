'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface BlogSearchProps {
  initialQuery?: string;
}

const BlogSearch: React.FC<BlogSearchProps> = ({ initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      router.push('/blog');
      return;
    }

    setIsSearching(true);

    // Create new search params
    const params = new URLSearchParams(searchParams);
    params.set('search', searchQuery.trim());
    params.delete('page'); // Reset to first page on new search

    // Navigate to search results
    router.push(`/blog?${params.toString()}`);

    setIsSearching(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    router.push('/blog');
  };

  return (
    <form onSubmit={handleSearch} className='relative'>
      <div className='relative'>
        <input
          type='text'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='Search blog posts...'
          className='w-full px-4 py-3 pl-12 pr-20 rounded-lg border border-gray-300 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500'
          disabled={isSearching}
        />

        {/* Search Icon */}
        <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
          <svg
            className='w-5 h-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>

        {/* Clear Button */}
        {searchQuery && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        )}

        {/* Search Button */}
        <button
          type='submit'
          disabled={isSearching}
          className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSearching ? (
            <svg
              className='w-4 h-4 animate-spin'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* Search Suggestions - Could be enhanced with real-time suggestions */}
      {searchQuery.length > 2 && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto'>
          <div className='p-3 text-sm text-gray-500'>
            Press Enter to search for &quot;{searchQuery}&quot;
          </div>
        </div>
      )}
    </form>
  );
};

export default BlogSearch;
