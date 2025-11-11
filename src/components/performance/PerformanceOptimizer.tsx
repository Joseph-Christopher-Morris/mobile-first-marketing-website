import Head from 'next/head';

interface PerformanceOptimizerProps {
  preloadImages?: string[];
  prefetchRoutes?: string[];
  criticalCSS?: string;
}

export default function PerformanceOptimizer({
  preloadImages = [],
  prefetchRoutes = [],
  criticalCSS
}: PerformanceOptimizerProps) {
  return (
    <Head>
      {/* Preload critical images */}
      {preloadImages.map((src, index) => (
        <link
          key={`preload-image-${index}`}
          rel="preload"
          as="image"
          href={src}
          type="image/webp"
        />
      ))}

      {/* Prefetch likely next routes */}
      {prefetchRoutes.map((route, index) => (
        <link
          key={`prefetch-route-${index}`}
          rel="prefetch"
          href={route}
        />
      ))}

      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* Preconnect to critical third-party origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Critical CSS inline */}
      {criticalCSS && (
        <style
          dangerouslySetInnerHTML={{
            __html: criticalCSS
          }}
        />
      )}

      {/* Resource hints for better performance */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />
    </Head>
  );
}

// Hook to generate critical CSS for above-the-fold content
export const useCriticalCSS = () => {
  const criticalCSS = `
    /* Critical CSS for above-the-fold content */
    .hero-section {
      background-color: #000;
      color: #fff;
      padding: 5rem 1rem;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }

    .hero-description {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-button {
      background-color: #ec4899;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.2s;
    }

    .cta-button:hover {
      background-color: #db2777;
    }

    /* Prevent layout shift */
    .image-container {
      aspect-ratio: 4/3;
      background-color: #f1f5f9;
    }

    /* Loading states */
    .loading-skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  return criticalCSS;
};
