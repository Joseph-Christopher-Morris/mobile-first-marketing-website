import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  thumbnail: string;
  alt: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  href,
  thumbnail,
  alt
}) => {
  return (
    <Link
      href={href}
      className="group block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
    >
      <div className="p-6">
        {/* Thumbnail Image */}
        <div className="mb-4 relative h-48 w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={thumbnail}
            alt={alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTA Arrow */}
        <div className="mt-4 flex items-center text-pink-600 font-medium group-hover:text-pink-700 transition-colors duration-200">
          <span>Learn more</span>
          <svg
            className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
