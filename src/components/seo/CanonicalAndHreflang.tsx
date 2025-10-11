'use client';

import { usePathname } from 'next/navigation';
import { generateCanonicalUrl, generateHreflangTags } from '@/lib/seo-utils';

interface CanonicalAndHreflangProps {
  canonicalUrl?: string;
  supportedLocales?: string[];
}

export default function CanonicalAndHreflang({
  canonicalUrl,
  supportedLocales = ['en'],
}: CanonicalAndHreflangProps) {
  const pathname = usePathname();

  const canonical = canonicalUrl || generateCanonicalUrl({ path: pathname });
  const hreflangTags = generateHreflangTags(pathname, supportedLocales);

  return (
    <>
      {/* Canonical URL */}
      <link rel='canonical' href={canonical} />

      {/* Hreflang tags for multilingual support */}
      {hreflangTags.map(tag => (
        <link
          key={tag.hreflang}
          rel='alternate'
          hrefLang={tag.hreflang}
          href={tag.href}
        />
      ))}

      {/* Default hreflang */}
      <link rel='alternate' hrefLang='x-default' href={canonical} />
    </>
  );
}
