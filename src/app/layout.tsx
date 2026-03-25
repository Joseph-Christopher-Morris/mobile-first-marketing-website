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
  title: {
    template: '%s | Vivid Media Cheshire',
    default: 'Websites, Ads & Analytics for Cheshire Businesses',
  },
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
      'Web Design, Hosting & Ads',
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
      'Web Design, Hosting & Ads',
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
