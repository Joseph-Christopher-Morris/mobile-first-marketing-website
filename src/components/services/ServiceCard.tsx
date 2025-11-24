import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  thumbnail: string;
  alt: string;
  bestFor?: string; // Week 2: Added "Best for" label
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  href,
  thumbnail,
  alt,
  bestFor
}) => {
  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col w-full max-w-sm hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
    >
      {/* Thumbnail Image */}
      <div className="relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden">
        <Image
          src={thumbnail}
          alt={alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Week 2: "Best for" label */}
      {bestFor && (
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
            ✓ {bestFor}
          </span>
        </div>
      )}

      {/* Content */}
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        {title}
      </h3>
      <p className="text-sm md:text-base text-slate-700 mb-4">
        {description}
      </p>

      {/* CTA Arrow */}
      <div className="inline-flex items-center gap-2 text-brand-pink font-semibold text-sm md:text-base hover:text-brand-pink2 mt-auto">
        <span>Learn more →</span>
      </div>
    </Link>
  );
};

export default ServiceCard;
