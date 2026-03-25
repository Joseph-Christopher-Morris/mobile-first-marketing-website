import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog-api';
import ProblemHero from '@/components/scram/ProblemHero';
import WhyWebsitesFail from '@/components/scram/WhyWebsitesFail';
import CTABlock from '@/components/scram/CTABlock';
import SpeedProofBlock from '@/components/scram/SpeedProofBlock';
import NYCCProofBlock from '@/components/scram/NYCCProofBlock';
import TheFeedGroupProofBlock from '@/components/scram/TheFeedGroupProofBlock';
import StockPhotographyProofBlock from '@/components/scram/StockPhotographyProofBlock';
import { FAQAccordion } from '@/components/FAQAccordion';
import { generateMetadata as generateSocialMetadata } from '@/lib/metadata-generator';
import { JsonLd } from '@/components/JsonLd';
import { CANONICAL } from '@/config/canonical';
import { STANDARD_CTA, AHREFS_PROOF } from '@/lib/proof-data';
import {
  buildLocalBusiness,
  buildWebPage,
  buildOrganization,
  buildBreadcrumbList,
  buildFAQPage,
  buildSpeakableSpecification,
} from '@/lib/schema-generator';

export const metadata: Metadata = generateSocialMetadata({
  pageType: 'homepage',
  content: {
    title: 'Your Website Looks Fine. But It Feels Like Hard Work.',
    description: 'Your website looks fine but visitors leave without getting in touch. I fix that for Nantwich and Crewe businesses. Based in Nantwich.',
    image: '/images/hero/230422_Chester_Stock_Photography-84.webp',
  },
  canonicalPath: '/',
});

export default async function HomePage() {
  const blogPosts = await getAllBlogPosts();
  const latestPosts = blogPosts.slice(0, 3);

  // Map each blog slug to its hero image path
  const cardCovers: Record<string, string> = {
    'paid-ads-campaign-learnings': '/images/hero/google-ads-analytics-dashboard.webp',
    'flyers-roi-breakdown': '/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
    'stock-photography-lessons': '/images/hero/240619-london-19.webp',
    'exploring-istock-data-deepmeta': '/images/hero/screenshot-2025-09-23-analytics-dashboard.webp',
  };

  const siteUrl = CANONICAL.urls.site;

  const homepageFAQs = [
    {
      question: 'How does your hosting compare to Wix or other website builders?',
      answer: 'Wix costs around £9 per month. It works for small personal sites. I use faster cloud hosting with better caching and security. Your site loads quicker, ranks better in Google, and you talk directly to me instead of waiting in a support queue.',
    },
    {
      question: 'Will my website load faster on your hosting?',
      answer: 'I have taken sites from 14 seconds down to under 2 seconds. Faster sites rank better in Google and keep visitors on the page longer. That means more enquiries.',
    },
    {
      question: 'Do you design websites for Nantwich and Crewe businesses?',
      answer: 'I build mobile-first websites from £300 for businesses across Nantwich and Crewe. Every site is built on fast cloud hosting and structured so visitors know what to do next.',
    },
    {
      question: 'How do I know if my website is losing me enquiries?',
      answer: 'If visitors land on your site and leave without getting in touch, the problem is usually speed, structure, or unclear messaging. Send me your URL and I will tell you what is not working.',
    },
  ];

  const homepageSchemas = [
    buildLocalBusiness(
      'Websites that look fine but feel like hard work. Visitors leave without getting in touch. I fix that for Nantwich and Crewe businesses with mobile-first redesigns, faster hosting, and clear messaging that turns visitors into enquiries.'
    ),
    buildWebPage({
      name: 'Vivid Media Cheshire - Website Redesign for Nantwich and Crewe Businesses',
      description: 'Your website looks fine but visitors leave without getting in touch. I redesign websites for Nantwich and Crewe businesses so the next step is obvious and enquiries follow.',
      url: `${siteUrl}${CANONICAL.routes.home}`,
    }),
    buildOrganization(
      'I help Nantwich and Crewe businesses get more enquiries by fixing websites that feel like hard work. Conversion-focused redesigns, mobile-first clarity, and honest marketing that works.'
    ),
    buildBreadcrumbList([
      { name: 'Home', url: `${siteUrl}${CANONICAL.routes.home}` },
    ]),
    buildFAQPage(homepageFAQs),
    buildSpeakableSpecification([
      '[data-speakable="hero-proof"]',
    ]),
  ];

  return (
    <Layout>
      <JsonLd schemas={homepageSchemas} />
      <div className='min-h-screen bg-white'>
        {/* Section 1: ProblemHero */}
        <ProblemHero
          heading="Your website looks fine. But visitors leave without getting in touch."
          subline="When a site is slow, unclear, or hard to use, people give up. I fix the problems so more of them get in touch."
          ctaLabel="Show me what's not working"
          ctaHref={STANDARD_CTA.primaryHref}
          proofText="I fix websites for Nantwich and Crewe businesses so the next step is obvious."
          speakableId="hero-proof"
        />

        {/* Section 2: WhyWebsitesFail */}
        <WhyWebsitesFail showSolutionCTA={false} />

        {/* Reader recognition trigger */}
        <section className="pt-8 pb-2 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-fluid-base md:text-lg font-medium text-gray-800">
              If your website gets visitors but no enquiries, this is why.
            </p>
          </div>
        </section>

        {/* Reassurance line — before proof sections */}
        <section className="pb-4 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-fluid-base md:text-lg font-medium text-gray-700">
              This is fixable. It just needs the right changes.
            </p>
          </div>
        </section>

        {/* Section 3: SpeedProofBlock (full — highest emphasis) */}
        <SpeedProofBlock
          variant="full"
          sourceAttribution="Data from my own website rebuild and hosting migration"
        />

        {/* Section 4: TheFeedGroupProofBlock — diagnostic weight */}
        <TheFeedGroupProofBlock
          heading="The ads worked. The page didn't."
        />

        {/* Section 5: NYCCProofBlock — supporting weight */}
        <NYCCProofBlock />

        {/* Section 6: Two-service card grid (website redesign + hosting only) */}
        <section className='bg-gray-50 py-16 md:py-20'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center'>
              Pick the problem that sounds like yours
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {/* Website Design & Development */}
              <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col'>
                <div className='relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden'>
                  <Image
                    src='/images/services/Website Design/PXL_20240222_004124044~2.webp'
                    alt='Website design and development workspace'
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, 50vw'
                  />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-3'>
                  Your website feels like hard work
                </h3>
                <p className='text-sm md:text-base text-slate-700 mb-4'>
                  Visitors land on your site and leave. I rebuild the structure and messaging so the next step is obvious and enquiries follow.
                </p>
                <Link
                  href='/services/website-design'
                  className='inline-flex items-center gap-2 text-brand-pink font-semibold text-sm md:text-base hover:text-brand-pink2 mt-auto'
                  aria-label='Learn more about website design and development services'
                >
                  Learn more →
                </Link>
              </div>

              {/* Website Hosting & Migration */}
              <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col'>
                <div className='relative w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden'>
                  <Image
                    src='/images/services/web-hosting-and-migration/hosting-migration-card.webp'
                    alt='Website hosting and migration performance dashboard'
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, 50vw'
                  />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-3'>
                  Slow site costing you customers?
                </h3>
                <p className='text-sm md:text-base text-slate-700 mb-4'>
                  Your site takes too long to load. Visitors leave before they see what you offer. I fix the speed so people stay and enquire.
                </p>
                <Link
                  href='/services/website-hosting'
                  className='inline-flex items-center gap-2 text-brand-pink font-semibold text-sm md:text-base hover:text-brand-pink2 mt-auto'
                  aria-label='Learn more about secure cloud website hosting and migration services'
                >
                  Learn more →
                </Link>
              </div>
            </div>

            <div className='text-center mt-8'>
              <Link
                href='/services/'
                className='text-brand-pink font-semibold hover:text-brand-pink2 transition-colors'
              >
                View all services →
              </Link>
            </div>
          </div>
        </section>

        {/* Section 7: StockPhotographyProofBlock (homepage variant — authority weight, lightest) */}
        <StockPhotographyProofBlock variant="homepage" />

        {/* Ahrefs micro-proof strip */}
        <div className="bg-gray-50 py-3 px-4 text-center">
          <p className="text-sm text-gray-500">
            {AHREFS_PROOF.copySnippets.veryShort}
          </p>
        </div>

        {/* Section 8: Blog / supporting content */}
        <section className='bg-white py-16 md:py-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
                What I tested and what actually worked
              </h2>
              <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                Real projects. Honest results. I share what I tried, what worked, and what I learned.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {latestPosts.map(post => (
                <article
                  key={post.slug}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'
                >
                  <div className='relative h-48 sm:h-52 bg-gray-50 overflow-hidden'>
                    <Image
                      src={cardCovers[post.slug] || post.image || '/images/hero/230422_Chester_Stock_Photography-84.webp'}
                      alt={`${post.title} - Blog post cover image`}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    />
                    <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm'>
                      {post.readTime} min read
                    </div>
                  </div>
                  <div className='p-6'>
                    <div className='flex items-center text-sm text-gray-500 mb-3'>
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <span className='mx-2'>•</span>
                      <span>{post.category}</span>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-3'>
                      {post.title}
                    </h3>
                    <p className='text-gray-600 mb-4 leading-relaxed'>
                      {post.excerpt}
                    </p>
                    <div className='flex items-center justify-between'>
                      <Link
                        href={`/blog/${post.slug}`}
                        className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
                        aria-label={`Read: ${post.title}`}
                      >
                        {post.title}
                        <svg
                          className='ml-2 w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </Link>
                      <span className='text-sm text-gray-500'>
                        {post.readTime} min read
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className='text-center mt-12'>
              <Link
                href='/blog'
                className='inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 hover:shadow-xl transition'
              >
                View All Posts
                <svg
                  className='ml-2 w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQAccordion
          title="Frequently Asked Questions"
          faqs={homepageFAQs}
        />

        {/* Objection neutralisation */}
        <section className="pb-6 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-fluid-base md:text-lg text-gray-700">
              Most websites don&apos;t fail because they look bad. They fail because no one made the next step obvious.
            </p>
          </div>
        </section>

        {/* Transformation statement */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-fluid-2xl md:text-3xl font-bold text-brand-black leading-tight">
              Your website stops being a brochure.
            </p>
            <p className="mt-2 text-fluid-2xl md:text-3xl font-bold text-brand-black leading-tight">
              It starts bringing in enquiries.
            </p>
          </div>
        </section>

        {/* Final CTA — end of page */}
        <CTABlock
          heading="Send me your website. I will tell you what is not working."
          body="You send the URL. I look at speed, structure, and messaging. I reply with what I would fix and a clear next step."
          primaryLabel={STANDARD_CTA.primaryLabel}
          primaryHref={STANDARD_CTA.primaryHref}
          secondaryLabel={STANDARD_CTA.secondaryLabel}
          secondaryHref={STANDARD_CTA.secondaryHref}
          variant="end-of-page"
          valueLine="I'll tell you what's stopping people getting in touch. This is a quick website audit."
          urgencyLine="Most people miss this on their own."
        />
      </div>
    </Layout>
  );
}