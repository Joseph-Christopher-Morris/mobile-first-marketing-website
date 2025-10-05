import React from 'react';
import Link from 'next/link';
import { generateBreadcrumbStructuredData } from '@/lib/seo-utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  includeStructuredData?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
  includeStructuredData = true,
}) => {
  // Generate structured data for breadcrumbs
  const breadcrumbData = items
    .filter(item => item.href)
    .map(item => ({
      name: item.label,
      url: item.href!,
    }));

  const structuredData =
    includeStructuredData && breadcrumbData.length > 0
      ? generateBreadcrumbStructuredData(breadcrumbData)
      : null;

  return (
    <>
      {/* Structured Data for Breadcrumbs */}
      {structuredData && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      <nav
        className={`flex items-center space-x-2 text-sm ${className}`}
        aria-label='Breadcrumb'
      >
        <ol
          className='flex items-center space-x-2'
          itemScope
          itemType='https://schema.org/BreadcrumbList'
        >
          {items.map((item, index) => (
            <li
              key={index}
              className='flex items-center'
              itemProp='itemListElement'
              itemScope
              itemType='https://schema.org/ListItem'
            >
              {index > 0 && (
                <svg
                  className='w-4 h-4 mx-2 text-gray-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className='text-gray-500 hover:text-gray-700 hover:underline transition-colors'
                  itemProp='item'
                >
                  <span itemProp='name'>{item.label}</span>
                </Link>
              ) : (
                <span
                  className='text-gray-700 font-medium'
                  aria-current='page'
                  itemProp='name'
                >
                  {item.label}
                </span>
              )}
              <meta itemProp='position' content={String(index + 1)} />
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;
