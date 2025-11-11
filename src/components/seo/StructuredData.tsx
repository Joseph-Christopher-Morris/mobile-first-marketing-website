"use client";

interface PhotographyServiceSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  provider: {
    "@type": string;
    name: string;
    address: {
      "@type": string;
      addressLocality: string;
      addressRegion: string;
      addressCountry: string;
    };
    telephone?: string;
    email?: string;
    url: string;
    sameAs: string[];
  };
  serviceType: string[];
  areaServed: {
    "@type": string;
    name: string;
  }[];
  offers: {
    "@type": string;
    description: string;
    availability: string;
  };
}

interface LocalBusinessSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  address: {
    "@type": string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  geo: {
    "@type": string;
    latitude: number;
    longitude: number;
  };
  url: string;
  telephone?: string;
  email?: string;
  openingHours: string[];
  serviceArea: {
    "@type": string;
    name: string;
  }[];
  hasCredential: {
    "@type": string;
    name: string;
    credentialCategory: string;
    recognizedBy: {
      "@type": string;
      name: string;
    };
  }[];
}

interface ReviewSchema {
  "@context": string;
  "@type": string;
  itemReviewed: {
    "@type": string;
    name: string;
  };
  reviewRating: {
    "@type": string;
    ratingValue: number;
    bestRating: number;
  };
  author: {
    "@type": string;
    name: string;
  };
  reviewBody: string;
  datePublished: string;
}

interface StructuredDataProps {
  type: 'photography-service' | 'local-business' | 'reviews';
  data?: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generatePhotographyServiceSchema = (): PhotographyServiceSchema => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Professional Photography Services",
    description: "Professional photography services in Nantwich & Cheshire with published editorial work for BBC, Forbes, and The Times. Specializing in local business photography and commercial campaigns.",
    provider: {
      "@type": "LocalBusiness",
      name: "Vivid Media Cheshire",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nantwich",
        addressRegion: "Cheshire",
        addressCountry: "GB"
      },
      url: "https://d15sc9fc739ev2.cloudfront.net",
      sameAs: [
        "https://www.linkedin.com/company/vivid-media-cheshire",
        "https://twitter.com/vividmediaches"
      ]
    },
    serviceType: [
      "Commercial Photography",
      "Editorial Photography",
      "Local Business Photography",
      "Campaign Photography",
      "Professional Photography"
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Nantwich"
      },
      {
        "@type": "AdministrativeArea",
        name: "Cheshire"
      }
    ],
    offers: {
      "@type": "Offer",
      description: "Professional photography services with editorial quality standards",
      availability: "https://schema.org/InStock"
    }
  });

  const generateLocalBusinessSchema = (): LocalBusinessSchema => ({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Vivid Media Cheshire - Photography Services",
    description: "Professional photography services in Nantwich with published work in BBC, Forbes, and The Times. Local business photography and commercial campaigns.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nantwich",
      addressRegion: "Cheshire",
      addressCountry: "GB"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 53.0675,
      longitude: -2.5209
    },
    url: "https://d15sc9fc739ev2.cloudfront.net",
    openingHours: [
      "Mo-Fr 09:00-17:00"
    ],
    serviceArea: [
      {
        "@type": "City",
        name: "Nantwich"
      },
      {
        "@type": "AdministrativeArea",
        name: "Cheshire"
      }
    ],
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        name: "Published Editorial Photographer",
        credentialCategory: "Professional Recognition",
        recognizedBy: {
          "@type": "Organization",
          name: "BBC"
        }
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Published Editorial Photographer",
        credentialCategory: "Professional Recognition",
        recognizedBy: {
          "@type": "Organization",
          name: "Forbes"
        }
      },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Published Editorial Photographer",
        credentialCategory: "Professional Recognition",
        recognizedBy: {
          "@type": "Organization",
          name: "The Times"
        }
      }
    ]
  });

  const generateReviewsSchema = (): ReviewSchema[] => {
    const reviews = data?.reviews || [
      {
        name: "Sarah Mitchell",
        business: "The Nantwich Bookshop",
        rating: 5,
        review: "Exceptional photography that perfectly captured the character of our independent bookshop. The images have been fantastic for our social media and website.",
        date: "2024-09-15"
      },
      {
        name: "James Thompson",
        business: "Nantwich Marina",
        rating: 5,
        review: "Professional service from start to finish. The marina photography showcased our facilities beautifully and has helped attract new visitors.",
        date: "2024-08-22"
      },
      {
        name: "Emma Davies",
        business: "Cheshire Wedding Venue",
        rating: 5,
        review: "Outstanding quality and attention to detail. The venue photography has elevated our marketing materials and booking inquiries have increased significantly.",
        date: "2024-07-10"
      }
    ];

    return reviews.map((review: any) => ({
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: {
        "@type": "Service",
        name: "Professional Photography Services"
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5
      },
      author: {
        "@type": "Person",
        name: review.name
      },
      reviewBody: review.review,
      datePublished: review.date
    }));
  };

  const getSchemaData = () => {
    switch (type) {
      case 'photography-service':
        return generatePhotographyServiceSchema();
      case 'local-business':
        return generateLocalBusinessSchema();
      case 'reviews':
        return generateReviewsSchema();
      default:
        return null;
    }
  };

  const schemaData = getSchemaData();

  if (!schemaData) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2)
      }}
    />
  );
}
