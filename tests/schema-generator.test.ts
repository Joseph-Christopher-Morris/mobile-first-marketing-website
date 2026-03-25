import { describe, it, expect } from 'vitest';
import {
  buildLocalBusiness,
  buildOrganization,
  buildWebPage,
  buildBreadcrumbList,
  buildService,
  buildFAQPage,
  buildOfferCatalog,
  buildPriceSpecification,
  buildPerson,
  buildAboutPage,
  buildContactPage,
  buildCollectionPage,
  buildItemList,
  buildBlogPosting,
  buildBlog,
  buildImageGallery,
  buildCreativeWork,
  buildHowTo,
  buildSpeakableSpecification,
} from '@/lib/schema-generator';
import { CANONICAL } from '@/config/canonical';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BANNED_PHRASES = [
  'digital services',
  'online presence enhancement',
  'comprehensive solutions',
  'performance optimisation',
];

const SCHEMA_ORG = 'https://schema.org';

/** Check that no banned generic phrase appears in any string value of the object. */
function assertNoBannedPhrases(obj: Record<string, unknown>) {
  const json = JSON.stringify(obj).toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    expect(json).not.toContain(phrase.toLowerCase());
  }
}

// ---------------------------------------------------------------------------
// 1. Builder output shape, required fields, @context/@type
// ---------------------------------------------------------------------------

describe('buildLocalBusiness', () => {
  const desc = 'Fixing websites that feel like hard work for South Cheshire businesses';
  const result = buildLocalBusiness(desc);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('LocalBusiness');
  });

  it('includes required fields from CANONICAL', () => {
    expect(result.name).toBe(CANONICAL.business.name);
    expect(result.description).toBe(desc);
    expect(result.telephone).toBe(CANONICAL.contact.phone);
    expect(result.email).toBe(CANONICAL.contact.email);
    expect(result.areaServed).toEqual(CANONICAL.business.areaServed);
  });

  it('includes contactPoint and openingHoursSpecification', () => {
    expect(result.contactPoint).toBeDefined();
    expect(result.contactPoint['@type']).toBe('ContactPoint');
    expect(result.openingHoursSpecification).toBeDefined();
    expect(result.openingHoursSpecification.length).toBeGreaterThan(0);
  });

  it('includes address and geo', () => {
    expect(result.address['@type']).toBe('PostalAddress');
    expect(result.geo['@type']).toBe('GeoCoordinates');
  });
});

describe('buildOrganization', () => {
  const desc = 'Helping South Cheshire businesses get more enquiries from their websites';
  const result = buildOrganization(desc);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('Organization');
  });

  it('includes founder and knowsAbout', () => {
    expect(result.founder).toEqual({ '@type': 'Person', name: CANONICAL.business.founder });
    expect(result.knowsAbout).toEqual([...CANONICAL.knowsAbout]);
  });

  it('includes sameAs and contactPoint', () => {
    expect(result.sameAs).toEqual(Object.values(CANONICAL.social));
    expect(result.contactPoint['@type']).toBe('ContactPoint');
  });
});

describe('buildWebPage', () => {
  const input = { name: 'Home', description: 'Websites that work harder for your business', url: 'https://vividmediacheshire.com/' };
  const result = buildWebPage(input);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('WebPage');
  });

  it('includes name, description, url, isPartOf', () => {
    expect(result.name).toBe(input.name);
    expect(result.description).toBe(input.description);
    expect(result.url).toBe(input.url);
    expect(result.isPartOf['@type']).toBe('WebSite');
  });
});

describe('buildBreadcrumbList', () => {
  const crumbs = [
    { name: 'Home', url: 'https://vividmediacheshire.com/' },
    { name: 'Services', url: 'https://vividmediacheshire.com/services/' },
  ];
  const result = buildBreadcrumbList(crumbs);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('BreadcrumbList');
  });

  it('maps crumbs to ListItem with correct positions', () => {
    expect(result.itemListElement).toHaveLength(2);
    expect(result.itemListElement[0]).toMatchObject({ '@type': 'ListItem', position: 1, name: 'Home' });
    expect(result.itemListElement[1]).toMatchObject({ '@type': 'ListItem', position: 2, name: 'Services' });
  });
});

describe('buildService', () => {
  const input = {
    name: 'Website Redesign',
    description: 'Your website looks fine but it feels like hard work',
    serviceType: 'Website Redesign',
    url: 'https://vividmediacheshire.com/services/website-design/',
    audience: 'Trades, local services, and SMEs in South Cheshire',
  };
  const result = buildService(input);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('Service');
  });

  it('includes provider from CANONICAL', () => {
    expect(result.provider).toMatchObject({ '@type': 'LocalBusiness', name: CANONICAL.business.name });
  });

  it('includes areaServed and audience when provided', () => {
    expect(result.areaServed).toEqual(CANONICAL.business.areaServed);
    expect(result.audience).toMatchObject({ '@type': 'Audience', audienceType: input.audience });
  });
});

describe('buildFAQPage', () => {
  const questions = [
    { question: 'Why is my website not getting enquiries?', answer: 'Because visitors cannot tell what to do next.' },
  ];
  const result = buildFAQPage(questions);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('FAQPage');
  });

  it('maps questions to Question/Answer pairs', () => {
    expect(result.mainEntity).toHaveLength(1);
    expect(result.mainEntity[0]['@type']).toBe('Question');
    expect(result.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
  });
});

describe('buildOfferCatalog', () => {
  const offers = [
    { name: 'Starter', description: 'A website that works harder for your business', price: '1500' },
  ];
  const result = buildOfferCatalog(offers);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('OfferCatalog');
  });

  it('defaults priceCurrency to GBP', () => {
    expect(result.itemListElement[0].priceCurrency).toBe('GBP');
  });
});

describe('buildPriceSpecification', () => {
  const input = { price: '1500', description: 'Website redesign starting price for local businesses' };
  const result = buildPriceSpecification(input);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('PriceSpecification');
  });

  it('defaults priceCurrency to GBP', () => {
    expect(result.priceCurrency).toBe('GBP');
  });
});

describe('buildPerson', () => {
  const result = buildPerson();

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('Person');
  });

  it('includes name, jobTitle, worksFor, knowsAbout', () => {
    expect(result.name).toBe(CANONICAL.business.founder);
    expect(result.jobTitle).toBe(CANONICAL.business.jobTitle);
    expect((result.worksFor as Record<string, unknown>)['@type']).toBe('Organization');
    expect(result.knowsAbout).toEqual([...CANONICAL.knowsAbout]);
  });

  it('omits sameAs when no options provided', () => {
    expect(result.sameAs).toBeUndefined();
  });

  it('includes sameAs when explicitly provided', () => {
    const withSameAs = buildPerson({ sameAs: ['https://linkedin.com/in/test'] });
    expect(withSameAs.sameAs).toEqual(['https://linkedin.com/in/test']);
  });

  it('includes hasCredential when explicitly provided', () => {
    const withCreds = buildPerson({
      hasCredential: [{ name: 'Adobe Analytics', credentialCategory: 'certification' }],
    });
    expect(withCreds.hasCredential).toEqual([
      { '@type': 'EducationalOccupationalCredential', name: 'Adobe Analytics', credentialCategory: 'certification' },
    ]);
  });

  it('omits hasCredential when not provided', () => {
    expect(result.hasCredential).toBeUndefined();
  });
});

describe('buildAboutPage', () => {
  const desc = 'One person behind every project, no account manager layer';
  const result = buildAboutPage(desc);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('AboutPage');
  });

  it('includes mainEntity Person', () => {
    expect(result.mainEntity).toMatchObject({ '@type': 'Person', name: CANONICAL.business.founder });
  });
});

describe('buildContactPage', () => {
  const desc = 'Send me your website and I will tell you what is not working';
  const result = buildContactPage(desc);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('ContactPage');
  });

  it('includes name and url from CANONICAL', () => {
    expect(result.name).toContain(CANONICAL.business.name);
    expect(result.url).toContain(CANONICAL.routes.contact);
  });
});

describe('buildCollectionPage', () => {
  const input = { name: 'Services', description: 'Pick the problem that sounds like yours', url: 'https://vividmediacheshire.com/services/' };
  const result = buildCollectionPage(input);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('CollectionPage');
  });

  it('includes isPartOf WebSite', () => {
    expect(result.isPartOf['@type']).toBe('WebSite');
  });
});

describe('buildItemList', () => {
  const items = [
    { name: 'Website Redesign', url: 'https://example.com/1', description: 'Your website feels like hard work' },
    { name: 'Hosting', url: 'https://example.com/2', description: 'Your website is slow and people leave' },
  ];
  const result = buildItemList(items);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('ItemList');
  });

  it('sets numberOfItems and positions', () => {
    expect(result.numberOfItems).toBe(2);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[1].position).toBe(2);
  });
});

describe('buildBlogPosting', () => {
  const post = {
    title: 'Why your website is not getting enquiries',
    description: 'Most websites look fine but feel like hard work',
    url: 'https://vividmediacheshire.com/blog/enquiries/',
    datePublished: '2025-01-15',
  };
  const result = buildBlogPosting(post);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('BlogPosting');
  });

  it('includes author and publisher from CANONICAL', () => {
    expect(result.author).toMatchObject({ '@type': 'Person', name: CANONICAL.business.founder });
    expect(result.publisher).toMatchObject({ '@type': 'Organization', name: CANONICAL.business.name });
  });

  it('defaults dateModified to datePublished', () => {
    expect(result.dateModified).toBe(post.datePublished);
  });
});

describe('buildBlog', () => {
  const desc = 'Real lessons from fixing websites that were not getting enquiries';
  const result = buildBlog(desc);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('Blog');
  });

  it('includes publisher from CANONICAL', () => {
    expect(result.publisher).toMatchObject({ '@type': 'Organization', name: CANONICAL.business.name });
  });
});

describe('buildImageGallery', () => {
  const images = [
    { name: 'Auction car', url: 'https://example.com/img.jpg', description: 'Commercial photography for auction catalogues' },
  ];
  const result = buildImageGallery(images);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('ImageGallery');
  });

  it('maps images to ImageObject', () => {
    expect(result.image).toHaveLength(1);
    expect(result.image[0]['@type']).toBe('ImageObject');
  });
});

describe('buildCreativeWork', () => {
  const work = { name: 'BBC News Feature', description: 'Editorial photography for national news coverage', url: 'https://example.com/work' };
  const result = buildCreativeWork(work);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('CreativeWork');
  });

  it('includes author from CANONICAL', () => {
    expect(result.author).toMatchObject({ '@type': 'Person', name: CANONICAL.business.founder });
  });
});

describe('buildHowTo', () => {
  const steps = [{ name: 'Step 1', text: 'Check your website speed' }];
  const result = buildHowTo('Fix a slow website', 'How to make your website load faster for visitors', steps);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('HowTo');
  });

  it('maps steps to HowToStep with positions', () => {
    expect(result.step).toHaveLength(1);
    expect(result.step[0]).toMatchObject({ '@type': 'HowToStep', position: 1 });
  });
});

describe('buildSpeakableSpecification', () => {
  const selectors = ['.hero-summary', '.intro-text'];
  const result = buildSpeakableSpecification(selectors);

  it('has correct @context and @type', () => {
    expect(result['@context']).toBe(SCHEMA_ORG);
    expect(result['@type']).toBe('SpeakableSpecification');
  });

  it('includes cssSelector array', () => {
    expect(result.cssSelector).toEqual(selectors);
  });
});


// ---------------------------------------------------------------------------
// 2. Builders throw on empty description / missing required fields
// ---------------------------------------------------------------------------

describe('validation: throws on invalid input', () => {
  it('buildLocalBusiness throws on empty description', () => {
    expect(() => buildLocalBusiness('')).toThrow();
    expect(() => buildLocalBusiness('short')).toThrow(); // < 10 chars
  });

  it('buildOrganization throws on empty description', () => {
    expect(() => buildOrganization('')).toThrow();
  });

  it('buildWebPage throws on missing fields', () => {
    expect(() => buildWebPage({ name: '', description: 'valid description text', url: 'https://x.com/' })).toThrow();
    expect(() => buildWebPage({ name: 'Home', description: '', url: 'https://x.com/' })).toThrow();
    expect(() => buildWebPage({ name: 'Home', description: 'valid description text', url: '' })).toThrow();
  });

  it('buildBreadcrumbList throws on empty array', () => {
    expect(() => buildBreadcrumbList([])).toThrow();
  });

  it('buildService throws on missing required fields', () => {
    expect(() => buildService({ name: '', description: 'valid description text', serviceType: 'Web', url: 'https://x.com/' })).toThrow();
    expect(() => buildService({ name: 'Svc', description: '', serviceType: 'Web', url: 'https://x.com/' })).toThrow();
    expect(() => buildService({ name: 'Svc', description: 'valid description text', serviceType: '', url: 'https://x.com/' })).toThrow();
    expect(() => buildService({ name: 'Svc', description: 'valid description text', serviceType: 'Web', url: '' })).toThrow();
  });

  it('buildFAQPage throws on empty questions array', () => {
    expect(() => buildFAQPage([])).toThrow();
  });

  it('buildFAQPage throws on empty question or answer', () => {
    expect(() => buildFAQPage([{ question: '', answer: 'Yes' }])).toThrow();
    expect(() => buildFAQPage([{ question: 'Why?', answer: '' }])).toThrow();
  });

  it('buildOfferCatalog throws on empty offers array', () => {
    expect(() => buildOfferCatalog([])).toThrow();
  });

  it('buildOfferCatalog throws on missing offer fields', () => {
    expect(() => buildOfferCatalog([{ name: '', description: 'valid description text', price: '100' }])).toThrow();
    expect(() => buildOfferCatalog([{ name: 'X', description: '', price: '100' }])).toThrow();
    expect(() => buildOfferCatalog([{ name: 'X', description: 'valid description text', price: '' }])).toThrow();
  });

  it('buildPriceSpecification throws on empty description or price', () => {
    expect(() => buildPriceSpecification({ price: '', description: 'valid description text' })).toThrow();
    expect(() => buildPriceSpecification({ price: '100', description: '' })).toThrow();
  });

  it('buildAboutPage throws on empty description', () => {
    expect(() => buildAboutPage('')).toThrow();
  });

  it('buildContactPage throws on empty description', () => {
    expect(() => buildContactPage('')).toThrow();
  });

  it('buildCollectionPage throws on missing fields', () => {
    expect(() => buildCollectionPage({ name: '', description: 'valid description text', url: 'https://x.com/' })).toThrow();
    expect(() => buildCollectionPage({ name: 'X', description: '', url: 'https://x.com/' })).toThrow();
  });

  it('buildItemList throws on empty items array', () => {
    expect(() => buildItemList([])).toThrow();
  });

  it('buildBlogPosting throws on missing fields', () => {
    expect(() => buildBlogPosting({ title: '', description: 'valid description text', url: 'https://x.com/', datePublished: '2025-01-01' })).toThrow();
    expect(() => buildBlogPosting({ title: 'T', description: '', url: 'https://x.com/', datePublished: '2025-01-01' })).toThrow();
    expect(() => buildBlogPosting({ title: 'T', description: 'valid description text', url: '', datePublished: '2025-01-01' })).toThrow();
    expect(() => buildBlogPosting({ title: 'T', description: 'valid description text', url: 'https://x.com/', datePublished: '' })).toThrow();
  });

  it('buildBlog throws on empty description', () => {
    expect(() => buildBlog('')).toThrow();
  });

  it('buildImageGallery throws on empty images array', () => {
    expect(() => buildImageGallery([])).toThrow();
  });

  it('buildCreativeWork throws on missing fields', () => {
    expect(() => buildCreativeWork({ name: '', description: 'valid description text', url: 'https://x.com/' })).toThrow();
    expect(() => buildCreativeWork({ name: 'X', description: '', url: 'https://x.com/' })).toThrow();
  });

  it('buildHowTo throws on empty name, description, or steps', () => {
    expect(() => buildHowTo('', 'valid description text', [{ name: 'S', text: 'T' }])).toThrow();
    expect(() => buildHowTo('Name', '', [{ name: 'S', text: 'T' }])).toThrow();
    expect(() => buildHowTo('Name', 'valid description text', [])).toThrow();
  });

  it('buildSpeakableSpecification throws on empty selectors', () => {
    expect(() => buildSpeakableSpecification([])).toThrow();
  });

  it('buildSpeakableSpecification throws on empty string selector', () => {
    expect(() => buildSpeakableSpecification([''])).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 3. No builder output contains banned generic phrases
// ---------------------------------------------------------------------------

describe('no banned generic phrases in builder output', () => {
  const validDesc = 'Fixing websites that feel like hard work for South Cheshire businesses';

  it('buildLocalBusiness output has no banned phrases', () => {
    assertNoBannedPhrases(buildLocalBusiness(validDesc));
  });

  it('buildOrganization output has no banned phrases', () => {
    assertNoBannedPhrases(buildOrganization(validDesc));
  });

  it('buildWebPage output has no banned phrases', () => {
    assertNoBannedPhrases(buildWebPage({ name: 'Home', description: validDesc, url: 'https://x.com/' }));
  });

  it('buildBreadcrumbList output has no banned phrases', () => {
    assertNoBannedPhrases(buildBreadcrumbList([{ name: 'Home', url: 'https://x.com/' }]));
  });

  it('buildService output has no banned phrases', () => {
    assertNoBannedPhrases(buildService({ name: 'Redesign', description: validDesc, serviceType: 'Website Redesign', url: 'https://x.com/' }));
  });

  it('buildFAQPage output has no banned phrases', () => {
    assertNoBannedPhrases(buildFAQPage([{ question: 'Why no enquiries?', answer: 'Visitors cannot tell what to do next.' }]));
  });

  it('buildOfferCatalog output has no banned phrases', () => {
    assertNoBannedPhrases(buildOfferCatalog([{ name: 'Starter', description: validDesc, price: '1500' }]));
  });

  it('buildPriceSpecification output has no banned phrases', () => {
    assertNoBannedPhrases(buildPriceSpecification({ price: '1500', description: validDesc }));
  });

  it('buildPerson output has no banned phrases', () => {
    assertNoBannedPhrases(buildPerson());
  });

  it('buildAboutPage output has no banned phrases', () => {
    assertNoBannedPhrases(buildAboutPage(validDesc));
  });

  it('buildContactPage output has no banned phrases', () => {
    assertNoBannedPhrases(buildContactPage(validDesc));
  });

  it('buildCollectionPage output has no banned phrases', () => {
    assertNoBannedPhrases(buildCollectionPage({ name: 'Services', description: validDesc, url: 'https://x.com/' }));
  });

  it('buildItemList output has no banned phrases', () => {
    assertNoBannedPhrases(buildItemList([{ name: 'Item', url: 'https://x.com/', description: validDesc }]));
  });

  it('buildBlogPosting output has no banned phrases', () => {
    assertNoBannedPhrases(buildBlogPosting({ title: 'Post', description: validDesc, url: 'https://x.com/', datePublished: '2025-01-01' }));
  });

  it('buildBlog output has no banned phrases', () => {
    assertNoBannedPhrases(buildBlog(validDesc));
  });

  it('buildImageGallery output has no banned phrases', () => {
    assertNoBannedPhrases(buildImageGallery([{ name: 'Photo', url: 'https://x.com/img.jpg', description: validDesc }]));
  });

  it('buildCreativeWork output has no banned phrases', () => {
    assertNoBannedPhrases(buildCreativeWork({ name: 'Work', description: validDesc, url: 'https://x.com/' }));
  });

  it('buildHowTo output has no banned phrases', () => {
    assertNoBannedPhrases(buildHowTo('Fix speed', validDesc, [{ name: 'Step 1', text: 'Check speed' }]));
  });

  it('buildSpeakableSpecification output has no banned phrases', () => {
    assertNoBannedPhrases(buildSpeakableSpecification(['.hero']));
  });
});

// ---------------------------------------------------------------------------
// 4. Canonical.ts exports: routes, email, phone
// ---------------------------------------------------------------------------

describe('CANONICAL config validation', () => {
  it('all routes end with /', () => {
    for (const [key, route] of Object.entries(CANONICAL.routes)) {
      expect(route, `routes.${key} should end with /`).toMatch(/\/$/);
    }
  });

  it('email contains @', () => {
    expect(CANONICAL.contact.email).toContain('@');
  });

  it('email is the canonical address', () => {
    expect(CANONICAL.contact.email).toBe('joe@vividmediacheshire.com');
  });

  it('phone starts with +44', () => {
    expect(CANONICAL.contact.phone).toMatch(/^\+44/);
  });

  it('phone is the canonical number', () => {
    expect(CANONICAL.contact.phone).toBe('+447586378502');
  });
});
