import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import CookieBanner from '@/components/CookieBanner';
import StickyCTA from '@/components/StickyCTA';
import { TrackingProvider } from '@/components/TrackingProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  title: 'Websites, Ads, Analytics & Photography in Cheshire | Vivid Media Cheshire',
  description:
    'Fast websites, Google Ads, and analytics for Cheshire businesses. Clear reporting and measurable results from Nantwich.',
  authors: [
    {
      name: 'Vivid Media Cheshire',
      url: 'https://vividmediacheshire.com',
    },
  ],
  creator: 'Vivid Media Cheshire',
  publisher: 'Vivid Media Cheshire',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://vividmediacheshire.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://vividmediacheshire.com',
    siteName: 'Vivid Media Cheshire',
    title:
      'Web Design, Hosting & Ads | Vivid Media Cheshire',
    description:
      'Fast websites, Google Ads, and analytics for Cheshire businesses. Clear reporting and measurable results from Nantwich.',
    images: [
      {
        url: '/images/hero/aston-martin-db6-website.webp',
        width: 1200,
        height: 630,
        alt: 'Vivid Media Cheshire – secure cloud infrastructure hosting, mobile-first design, and data-driven marketing based in Nantwich.',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Web Design, Hosting & Ads | Vivid Media Cheshire',
    description:
      'Fast websites, Google Ads, and analytics for Cheshire businesses. Clear reporting and measurable results from Nantwich.',
    images: ['/images/hero/aston-martin-db6-website.webp'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-placeholder',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="google78b99cbb6a5b4d4e" />
        
        {/* Critical resource preload for LCP optimisation */}
        <link
          rel="preload"
          href="/images/hero/230422_Chester_Stock_Photography-84.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        {/* Favicon and app icons */}
        <link
          rel="icon"
          href="/favicon.png"
          type="image/png"
          sizes="48x48"
        />
        <link
          rel="shortcut icon"
          href="/favicon.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          href="/favicon.png"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://d15sc9fc739ev2.cloudfront.net" />

        {/* LocalBusiness Schema Markup */}
        <Script
          id="local-business-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'Vivid Media Cheshire',
              image: 'https://vividmediacheshire.com/images/hero/aston-martin-db6-website.webp',
              '@id': 'https://vividmediacheshire.com',
              url: 'https://vividmediacheshire.com',
              telephone: '+44-XXXX-XXXXXX',
              priceRange: '££',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Nantwich',
                addressLocality: 'Nantwich',
                addressRegion: 'Cheshire',
                postalCode: 'CW5',
                addressCountry: 'GB',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 53.0679,
                longitude: -2.5211,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  opens: '09:00',
                  closes: '18:00',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: 'Saturday',
                  opens: '10:00',
                  closes: '14:00',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: 'Sunday',
                  opens: '10:00',
                  closes: '16:00',
                },
              ],
              sameAs: [
                'https://www.linkedin.com/company/vivid-media-cheshire',
              ],
              areaServed: [
                {
                  '@type': 'City',
                  name: 'Nantwich',
                },
                {
                  '@type': 'City',
                  name: 'Crewe',
                },
                {
                  '@type': 'AdministrativeArea',
                  name: 'Cheshire',
                },
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Digital Marketing Services',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Website Design & Development',
                      description: 'Mobile-first websites on secure cloud infrastructure',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Website Hosting & Migration',
                      description: 'secure cloud hosting with global delivery hosting and reliable performance',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Strategic Ad Campaigns',
                      description: 'Google Ads campaigns for Cheshire businesses',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Photography Services',
                      description: 'Professional photography for local businesses',
                    },
                  },
                ],
              },
            }),
          }}
        />

        {/* Google Tag Manager */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-W7L94JHW');
            `,
          }}
        />

        {/* Microsoft Clarity - Direct Implementation */}
        <Script
          id="clarity-direct"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.clarity || document.querySelector('script[src*="clarity.ms/tag/u4yftkmpxx"]')) return;
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "u4yftkmpxx");
              })();
            `,
          }}
        />

        {/* Ahrefs Web Analytics - Direct Implementation */}
        <Script
          id="ahrefs-direct"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (document.querySelector('script[src="https://analytics.ahrefs.com/analytics.js"]')) return;
                var s = document.createElement('script');
                s.async = true;
                s.src = 'https://analytics.ahrefs.com/analytics.js';
                s.setAttribute('data-key', 'l985apHePEHsTj+zER1zlw');
                document.head.appendChild(s);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-W7L94JHW"
            height="0" 
            width="0" 
            style={{display:'none',visibility:'hidden'}}
          />
        </noscript>
        
        <TrackingProvider>
          {children}
          <CookieBanner />
          <StickyCTA />
        </TrackingProvider>
      </body>
    </html>
  );
}
