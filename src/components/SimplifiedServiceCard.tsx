import React from 'react';

interface SimplifiedServiceCardProps {
  title?: string;
  annualPrice: string;
  includes: string[];
  tagline: string;
  ctaText?: string;
  ctaLink?: string;
}

export function SimplifiedServiceCard({
  title = "Simplified Service Card",
  annualPrice,
  includes,
  tagline,
  ctaText = "Get Started",
  ctaLink = "#contact"
}: SimplifiedServiceCardProps) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      
      <div className="mb-4">
        <p className="text-3xl font-extrabold text-brand-pink">{annualPrice}</p>
        <p className="text-sm text-gray-600 mt-1">Annual Breakdown</p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Includes:</p>
        <ul className="space-y-1">
          {includes.map((item, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start">
              <span className="text-brand-pink mr-2">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-gray-600 italic mb-4">{tagline}</p>

      <a
        href={ctaLink}
        className="block w-full text-center bg-brand-pink text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-pink2 transition-colors"
      >
        {ctaText}
      </a>
    </div>
  );
}

// Pre-configured hosting card
export function HostingServiceCard() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Website hosting package</h3>
      
      <div className="mb-4">
        <p className="text-3xl font-extrabold text-brand-pink">£15 per month</p>
        <p className="text-sm text-gray-700">or £120 per year when paid annually</p>
        <p className="text-sm text-gray-600 mt-1">One clear price for hosting, backups and support.</p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Includes:</p>
        <ul className="space-y-1">
          <li className="text-sm text-gray-700 flex items-start">
            <span className="text-brand-pink mr-2">✓</span>
            Reliable secure cloud hosting
          </li>
          <li className="text-sm text-gray-700 flex items-start">
            <span className="text-brand-pink mr-2">✓</span>
            Business domain support
          </li>
          <li className="text-sm text-gray-700 flex items-start">
            <span className="text-brand-pink mr-2">✓</span>
            Professional email service
          </li>
          <li className="text-sm text-gray-700 flex items-start">
            <span className="text-brand-pink mr-2">✓</span>
            Straightforward, transparent costs you control
          </li>
        </ul>
      </div>

      <p className="text-sm text-gray-600 italic mb-4">One annual cost that keeps your website online, fast and supported.</p>

      <a
        href="/services/hosting#contact"
        className="block w-full text-center bg-brand-pink text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-pink2 transition-colors"
      >
        Get Hosting Quote
      </a>
    </div>
  );
}
