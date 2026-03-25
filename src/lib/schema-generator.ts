/**
 * Pure builder functions for JSON-LD structured data.
 * Every builder imports business data from CANONICAL — no hardcoded values.
 * No side effects, no DOM access, no React dependency.
 *
 * Covers: Req 16 (site-wide baseline), Req 17 (schema integrity).
 */

import { CANONICAL } from '@/config/canonical';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WebPageInput {
  name: string;
  description: string;
  url: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ServiceInput {
  name: string;
  description: string;
  serviceType: string;
  url: string;
  audience?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface OfferInput {
  name: string;
  description: string;
  price: string;
  priceCurrency?: string;
}

interface PriceInput {
  price: string;
  priceCurrency?: string;
  description: string;
}

interface ItemInput {
  name: string;
  url: string;
  description: string;
  position?: number;
}

interface BlogPostInput {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}

interface ImageInput {
  name: string;
  url: string;
  description: string;
}

interface CreativeWorkInput {
  name: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
}

interface HowToStep {
  name: string;
  text: string;
}

interface CollectionPageInput {
  name: string;
  description: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required and must be a non-empty string`);
  }
  return value.trim();
}

function requireMinLength(value: string, min: number, field: string): string {
  const trimmed = requireString(value, field);
  if (trimmed.length < min) {
    throw new Error(`${field} must be at least ${min} characters (got ${trimmed.length})`);
  }
  return trimmed;
}

function requireNonEmptyArray<T>(arr: T[], field: string): T[] {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error(`${field} must be a non-empty array`);
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Shared fragments
// ---------------------------------------------------------------------------

const CONTEXT = 'https://schema.org' as const;

function baseAddress() {
  return {
    '@type': 'PostalAddress' as const,
    ...CANONICAL.business.address,
  };
}

function baseGeo() {
  return {
    '@type': 'GeoCoordinates' as const,
    latitude: CANONICAL.business.geo.latitude,
    longitude: CANONICAL.business.geo.longitude,
  };
}

function openingHours() {
  return CANONICAL.openingHours.map((h) => ({
    '@type': 'OpeningHoursSpecification' as const,
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  }));
}

function contactPoint() {
  return {
    '@type': 'ContactPoint' as const,
    telephone: CANONICAL.contact.phone,
    email: CANONICAL.contact.email,
    contactType: 'customer service',
    areaServed: CANONICAL.business.areaServed,
    availableLanguage: 'English',
  };
}

function siteUrl(path = '') {
  return `${CANONICAL.urls.site}${path}`;
}

function socialProfiles() {
  return Object.values(CANONICAL.social);
}


// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

/** LocalBusiness — Homepage, Contact, About, Services overview. */
export function buildLocalBusiness(description: string) {
  requireMinLength(description, 10, 'description');
  return {
    '@context': CONTEXT,
    '@type': 'LocalBusiness',
    name: CANONICAL.business.name,
    description,
    url: siteUrl(CANONICAL.routes.home),
    telephone: CANONICAL.contact.phone,
    email: CANONICAL.contact.email,
    priceRange: CANONICAL.business.priceRange,
    address: baseAddress(),
    geo: baseGeo(),
    areaServed: CANONICAL.business.areaServed,
    contactPoint: contactPoint(),
    openingHoursSpecification: openingHours(),
    sameAs: socialProfiles(),
  };
}

/** Organization — Homepage, About. */
export function buildOrganization(description: string) {
  requireMinLength(description, 10, 'description');
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    name: CANONICAL.business.name,
    description,
    url: siteUrl(CANONICAL.routes.home),
    founder: {
      '@type': 'Person',
      name: CANONICAL.business.founder,
    },
    knowsAbout: [...CANONICAL.knowsAbout],
    sameAs: socialProfiles(),
    contactPoint: contactPoint(),
  };
}

/** WebPage — All pages. */
export function buildWebPage(page: WebPageInput) {
  requireMinLength(page.description, 10, 'description');
  requireString(page.name, 'name');
  requireString(page.url, 'url');
  return {
    '@context': CONTEXT,
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    url: page.url,
    isPartOf: {
      '@type': 'WebSite',
      name: CANONICAL.business.name,
      url: siteUrl(CANONICAL.routes.home),
    },
  };
}

/** BreadcrumbList — All pages. */
export function buildBreadcrumbList(crumbs: BreadcrumbItem[]) {
  requireNonEmptyArray(crumbs, 'crumbs');
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => {
      requireString(c.name, `crumbs[${i}].name`);
      requireString(c.url, `crumbs[${i}].url`);
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.url,
      };
    }),
  };
}

/** Service — All service pages, Free Audit. */
export function buildService(service: ServiceInput) {
  requireMinLength(service.description, 10, 'description');
  requireString(service.name, 'name');
  requireString(service.serviceType, 'serviceType');
  requireString(service.url, 'url');
  return {
    '@context': CONTEXT,
    '@type': 'Service',
    name: service.name,
    description: service.description,
    serviceType: service.serviceType,
    url: service.url,
    provider: {
      '@type': 'LocalBusiness',
      name: CANONICAL.business.name,
      url: siteUrl(CANONICAL.routes.home),
    },
    areaServed: CANONICAL.business.areaServed,
    ...(service.audience && {
      audience: {
        '@type': 'Audience',
        audienceType: service.audience,
      },
    }),
  };
}

/** FAQPage — Pages with visible FAQ content only. */
export function buildFAQPage(questions: FAQItem[]) {
  requireNonEmptyArray(questions, 'questions');
  questions.forEach((q, i) => {
    requireString(q.question, `questions[${i}].question`);
    requireString(q.answer, `questions[${i}].answer`);
  });
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/** OfferCatalog — Pricing page (only when pricing visible). */
export function buildOfferCatalog(offers: OfferInput[]) {
  requireNonEmptyArray(offers, 'offers');
  offers.forEach((o, i) => {
    requireString(o.name, `offers[${i}].name`);
    requireMinLength(o.description, 10, `offers[${i}].description`);
    requireString(o.price, `offers[${i}].price`);
  });
  return {
    '@context': CONTEXT,
    '@type': 'OfferCatalog',
    name: `${CANONICAL.business.name} Services`,
    itemListElement: offers.map((o) => ({
      '@type': 'Offer',
      name: o.name,
      description: o.description,
      price: o.price,
      priceCurrency: o.priceCurrency ?? 'GBP',
    })),
  };
}

/** PriceSpecification — Pricing page (only when pricing visible). */
export function buildPriceSpecification(price: PriceInput) {
  requireMinLength(price.description, 10, 'description');
  requireString(price.price, 'price');
  return {
    '@context': CONTEXT,
    '@type': 'PriceSpecification',
    price: price.price,
    priceCurrency: price.priceCurrency ?? 'GBP',
    description: price.description,
  };
}


/** Person — About page. Accepts optional overrides for hasCredential and sameAs. */
export function buildPerson(options?: {
  hasCredential?: Array<{ name: string; credentialCategory?: string }>;
  sameAs?: string[];
}) {
  const base: Record<string, unknown> = {
    '@context': CONTEXT,
    '@type': 'Person',
    name: CANONICAL.business.founder,
    jobTitle: CANONICAL.business.jobTitle,
    worksFor: {
      '@type': 'Organization',
      name: CANONICAL.business.name,
      url: siteUrl(CANONICAL.routes.home),
    },
    knowsAbout: [...CANONICAL.knowsAbout],
  };

  // sameAs: only include if explicitly provided (real profiles linked from the page)
  if (options?.sameAs && options.sameAs.length > 0) {
    base.sameAs = options.sameAs;
  }

  // hasCredential: only include when credentials are named in visible copy
  if (options?.hasCredential && options.hasCredential.length > 0) {
    base.hasCredential = options.hasCredential.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.name,
      ...(c.credentialCategory && { credentialCategory: c.credentialCategory }),
    }));
  }

  return base;
}

/** AboutPage — About page. */
export function buildAboutPage(description: string) {
  requireMinLength(description, 10, 'description');
  return {
    '@context': CONTEXT,
    '@type': 'AboutPage',
    name: `About ${CANONICAL.business.name}`,
    description,
    url: siteUrl(CANONICAL.routes.about),
    mainEntity: {
      '@type': 'Person',
      name: CANONICAL.business.founder,
    },
  };
}

/** ContactPage — Contact page. */
export function buildContactPage(description: string) {
  requireMinLength(description, 10, 'description');
  return {
    '@context': CONTEXT,
    '@type': 'ContactPage',
    name: `Contact ${CANONICAL.business.name}`,
    description,
    url: siteUrl(CANONICAL.routes.contact),
  };
}

/** CollectionPage — Services overview, Blog index. */
export function buildCollectionPage(page: CollectionPageInput) {
  requireMinLength(page.description, 10, 'description');
  requireString(page.name, 'name');
  requireString(page.url, 'url');
  return {
    '@context': CONTEXT,
    '@type': 'CollectionPage',
    name: page.name,
    description: page.description,
    url: page.url,
    isPartOf: {
      '@type': 'WebSite',
      name: CANONICAL.business.name,
      url: siteUrl(CANONICAL.routes.home),
    },
  };
}

/** ItemList — Services overview, Blog index, Photography. */
export function buildItemList(items: ItemInput[]) {
  requireNonEmptyArray(items, 'items');
  items.forEach((item, i) => {
    requireString(item.name, `items[${i}].name`);
    requireString(item.url, `items[${i}].url`);
    requireMinLength(item.description, 10, `items[${i}].description`);
  });
  return {
    '@context': CONTEXT,
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: item.position ?? i + 1,
      name: item.name,
      url: item.url,
      description: item.description,
    })),
  };
}

/** BlogPosting — Individual blog posts. */
export function buildBlogPosting(post: BlogPostInput) {
  requireMinLength(post.description, 10, 'description');
  requireString(post.title, 'title');
  requireString(post.url, 'url');
  requireString(post.datePublished, 'datePublished');
  return {
    '@context': CONTEXT,
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.url,
    datePublished: post.datePublished,
    dateModified: post.dateModified ?? post.datePublished,
    author: {
      '@type': 'Person',
      name: CANONICAL.business.founder,
    },
    publisher: {
      '@type': 'Organization',
      name: CANONICAL.business.name,
      url: siteUrl(CANONICAL.routes.home),
    },
    ...(post.image && { image: post.image }),
  };
}

/** Blog — Blog index. */
export function buildBlog(description: string) {
  requireMinLength(description, 10, 'description');
  return {
    '@context': CONTEXT,
    '@type': 'Blog',
    name: `${CANONICAL.business.name} Blog`,
    description,
    url: siteUrl(CANONICAL.routes.blog),
    publisher: {
      '@type': 'Organization',
      name: CANONICAL.business.name,
      url: siteUrl(CANONICAL.routes.home),
    },
  };
}

/** ImageGallery — Photography page. */
export function buildImageGallery(images: ImageInput[]) {
  requireNonEmptyArray(images, 'images');
  images.forEach((img, i) => {
    requireString(img.name, `images[${i}].name`);
    requireString(img.url, `images[${i}].url`);
    requireMinLength(img.description, 10, `images[${i}].description`);
  });
  return {
    '@context': CONTEXT,
    '@type': 'ImageGallery',
    name: `${CANONICAL.business.name} Photography Portfolio`,
    url: siteUrl(CANONICAL.routes.photography),
    image: images.map((img) => ({
      '@type': 'ImageObject',
      name: img.name,
      contentUrl: img.url,
      description: img.description,
    })),
  };
}

/** CreativeWork — Photography page (only if maintained). */
export function buildCreativeWork(work: CreativeWorkInput) {
  requireMinLength(work.description, 10, 'description');
  requireString(work.name, 'name');
  requireString(work.url, 'url');
  return {
    '@context': CONTEXT,
    '@type': 'CreativeWork',
    name: work.name,
    description: work.description,
    url: work.url,
    author: {
      '@type': 'Person',
      name: CANONICAL.business.founder,
    },
    ...(work.image && { image: work.image }),
    ...(work.datePublished && { datePublished: work.datePublished }),
  };
}

/** HowTo — Blog posts with step-by-step content. */
export function buildHowTo(name: string, description: string, steps: HowToStep[]) {
  requireString(name, 'name');
  requireMinLength(description, 10, 'description');
  requireNonEmptyArray(steps, 'steps');
  steps.forEach((s, i) => {
    requireString(s.name, `steps[${i}].name`);
    requireString(s.text, `steps[${i}].text`);
  });
  return {
    '@context': CONTEXT,
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/** SpeakableSpecification — Pages with concise summary blocks. */
export function buildSpeakableSpecification(selectors: string[]) {
  requireNonEmptyArray(selectors, 'selectors');
  selectors.forEach((s, i) => requireString(s, `selectors[${i}]`));
  return {
    '@context': CONTEXT,
    '@type': 'SpeakableSpecification',
    cssSelector: selectors,
  };
}
