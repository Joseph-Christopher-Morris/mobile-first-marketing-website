// Server component - no "use client" needed for script tags in head

interface ServiceSchemaProps {
  serviceName: string;
  serviceType: string;
  description: string;
  url: string;
  priceRange?: string;
  serviceOutput?: string;
  areaServed?: string[];
}

/**
 * Service Schema Component
 * Implements structured data for service pages as per spec requirements
 * Spec: final_master_instructions.md - Section 4: Structured Data
 */
export function ServiceSchema({
  serviceName,
  serviceType,
  description,
  url,
  priceRange,
  serviceOutput,
  areaServed = ['Nantwich', 'Crewe', 'Chester', 'Cheshire']
}: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "serviceType": serviceType,
    "description": description,
    "url": url,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Vivid Media Cheshire",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nantwich",
        "addressRegion": "Cheshire",
        "postalCode": "CW5",
        "addressCountry": "GB"
      },
      "telephone": "+447586378502",
      "url": "https://d15sc9fc739ev2.cloudfront.net",
      "priceRange": priceRange || "££",
      "sameAs": [
        "https://www.linkedin.com/company/vivid-media-cheshire"
      ]
    },
    "areaServed": areaServed.map(area => ({
      "@type": area.includes('Cheshire') ? "AdministrativeArea" : "City",
      "name": area
    })),
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceSpecification": priceRange ? {
        "@type": "PriceSpecification",
        "priceCurrency": "GBP"
      } : undefined
    },
    ...(serviceOutput && {
      "serviceOutput": serviceOutput
    })
  };

  return (
    <script
      id={`service-schema-${serviceType.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

/**
 * Predefined service schemas for common pages
 */
export const ServiceSchemas = {
  WebsiteDesign: () => (
    <ServiceSchema
      serviceName="Website Design & Development"
      serviceType="Web Design Service"
      description="Mobile-first website design and development for Cheshire businesses. Fast, SEO-optimised websites built on secure cloud infrastructure."
      url="https://d15sc9fc739ev2.cloudfront.net/services/website-design"
      priceRange="From £300"
      serviceOutput="Professional, mobile-optimised website"
      areaServed={['Nantwich', 'Crewe', 'Chester', 'Cheshire', 'UK']}
    />
  ),
  
  WebsiteHosting: () => (
    <ServiceSchema
      serviceName="Website Hosting & Migration"
      serviceType="Web Hosting Service"
      description="Secure cloud website hosting with 82% faster load times. Zero downtime migration from Wix, WordPress, or other platforms. £120 per year."
      url="https://d15sc9fc739ev2.cloudfront.net/services/hosting"
      priceRange="£120/year"
      serviceOutput="Fast, secure website hosting"
      areaServed={['Nantwich', 'Crewe', 'Chester', 'Cheshire', 'UK']}
    />
  ),
  
  GoogleAds: () => (
    <ServiceSchema
      serviceName="Strategic Ad Campaigns"
      serviceType="Digital Marketing Service"
      description="Google Ads campaigns that bring real leads for Cheshire businesses. Clear reporting shows what works. Management from £150 per month."
      url="https://d15sc9fc739ev2.cloudfront.net/services/ad-campaigns"
      priceRange="From £150/month"
      serviceOutput="Targeted advertising campaigns with measurable ROI"
      areaServed={['Nantwich', 'Crewe', 'Chester', 'Cheshire', 'UK']}
    />
  ),
  
  Analytics: () => (
    <ServiceSchema
      serviceName="Data Analytics & Insights"
      serviceType="Analytics Service"
      description="Simple dashboards that show where leads come from and what to improve. Google Analytics 4 setup and reporting for Cheshire businesses."
      url="https://d15sc9fc739ev2.cloudfront.net/services/analytics"
      priceRange="££"
      serviceOutput="Clear analytics dashboards and actionable insights"
      areaServed={['Nantwich', 'Crewe', 'Chester', 'Cheshire', 'UK']}
    />
  ),
  
  Photography: () => (
    <ServiceSchema
      serviceName="Professional Photography Services"
      serviceType="Photography Service"
      description="Professional photography for Cheshire businesses. Fast turnaround, ready for web and social media. Event photography from £200 per day."
      url="https://d15sc9fc739ev2.cloudfront.net/services/photography"
      priceRange="From £200/day"
      serviceOutput="Professional photography for business use"
      areaServed={['Nantwich', 'Crewe', 'Chester', 'Cheshire', 'UK']}
    />
  )
};
