'use client';

import Image from 'next/image';

interface Publication {
  name: string;
  logo: string;
  alt: string;
}

interface CredibilityIndicatorsProps {
  publications: Publication[];
  variant?: 'hero' | 'section';
}

const CredibilityIndicators: React.FC<CredibilityIndicatorsProps> = ({
  publications,
  variant = 'hero'
}) => {
  const containerClasses = variant === 'hero'
    ? 'mt-8 pt-8 border-t border-white/20'
    : 'py-8';

  return (
    <div className={containerClasses}>
      <div className="text-center mb-6">
        <p className={`text-sm font-medium ${variant === 'hero' ? 'text-white/80' : 'text-gray-600'}`}>
          Published work featured in:
        </p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {publications.map((publication) => (
          <div
            key={publication.name}
            className="group transition-all duration-300 hover:scale-105"
            role="img"
            aria-label={publication.alt}
          >
            <div className={`
              relative h-10 w-24 md:h-12 md:w-28 lg:h-14 lg:w-32
              filter grayscale group-hover:grayscale-0
              transition-all duration-300 ease-in-out
              ${variant === 'hero' ? 'opacity-70 group-hover:opacity-100' : 'opacity-60 group-hover:opacity-100'}
            `}>
              <Image
                src={publication.logo}
                alt={publication.alt}
                fill
                className={`object-contain ${variant === 'hero' ? 'text-white' : 'text-gray-800'}`}
                sizes="(max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CredibilityIndicators;
