// src/app/services/photography/page.tsx
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { PhotographyInquiryForm } from '@/components/PhotographyInquiryForm';
import { DualStickyCTA } from '@/components/DualStickyCTA';
import { generateMetadata as generateSocialMetadata } from '@/lib/metadata-generator';
import { JsonLd } from '@/components/JsonLd';
import { CANONICAL } from '@/config/canonical';
import {
  buildService,
  buildBreadcrumbList,
  buildItemList,
  buildFAQPage,
} from '@/lib/schema-generator';
import ProblemHero from '@/components/scram/ProblemHero';
import CTABlock from '@/components/scram/CTABlock';
import ProblemMirror from '@/components/scram/ProblemMirror';
import NumberedSteps from '@/components/scram/NumberedSteps';
import AuthorityProofBlock from '@/components/scram/AuthorityProofBlock';
import StockPhotographyProofBlock from '@/components/scram/StockPhotographyProofBlock';
import { PHOTOGRAPHY_CTA } from '@/lib/proof-data';

export const metadata = generateSocialMetadata({
  pageType: 'service',
  content: {
    title: 'Need Images That Sell Your Business?',
    description: 'Stock photos letting your Nantwich and Crewe business down? Published editorial photographer based in Nantwich. Real images that support your marketing goals.',
    image: '/images/services/photography/photography-hero.webp',
  },
  canonicalPath: '/services/photography/',
});

const siteUrl = (path: string) => `${CANONICAL.urls.site}${path}`;

const galleryImages = [
  {
    src: '/images/services/photography/5eb6fc44-e1a5-460d-8dea-923fd303f59d.webp',
    alt: 'Published editorial photography featured in Financial Times article about UK electric vehicle sales',
    title: 'UK vies with Germany to be European EV champion',
    subtitle: 'Year of record sales was still below government targets',
    caption: 'Licensed for Financial Times EV coverage. Consistent delivery for leading business publications.',
    type: 'clipping' as const,
  },
  {
    src: '/images/services/photography/240427-_Nantwich_Stock_Photography-19.webp',
    title: 'Nantwich Market Square Photography',
    alt: 'Commercial photography of Nantwich Market Square showing local traders and historic market town atmosphere',
    type: 'local' as const,
    location: 'Market Square',
    caption: 'Capturing the atmosphere of Nantwich Market Square for local business and tourism use.',
  },
  {
    src: '/images/services/photography/240427-_Nantwich_Stock_Photography-23.webp',
    title: 'Historic Town Centre Architecture',
    alt: 'Architectural photography of Nantwich High Street with Tudor buildings and local shops',
    type: 'local' as const,
    location: 'High Street',
    caption: 'Architectural photography of the Tudor street scene for web, print, and destination marketing.',
  },
  {
    src: '/images/services/photography/240421-Nantwich_Stock_Photography-49.webp',
    title: 'Community Life Documentation',
    alt: 'Documentary street photography capturing daily life in Nantwich town centre',
    type: 'local' as const,
    location: 'Town Centre',
    caption: 'Documentary-style local photography capturing real community moments in Nantwich.',
  },
  {
    src: '/images/services/photography/WhatsApp Image 2025-11-01 at 11.58.16 AM.webp',
    title: 'Hampson Auctions Bolesworth Castle Sale',
    alt: 'Aerial drone photograph of the Hampson Auctions Bolesworth Castle venue with a lineup of vehicles',
    type: 'campaign' as const,
    client: 'Hampson Auctions',
    caption: 'Aerial drone photography at the Bolesworth Castle Sale for promotional use.',
  },
  {
    src: '/images/services/photography/photography-sample-2.webp',
    title: 'Hampson Auctions Creative Event Photography',
    alt: 'Creative commercial photography from the Hampson Auctions Bolesworth Castle Sale with golden evening atmosphere',
    type: 'campaign' as const,
    client: 'Hampson Auctions',
    caption: 'Creative event photography at the Bolesworth Castle Sale with a golden evening sky swap for brand imagery.',
  },
  {
    src: '/images/services/photography/photography-sample-1.webp',
    title: 'Singtel Investor Day 2025',
    alt: 'Licensed commercial photograph used in Singtel Investor Day 2025 presentation on ROIC improvement at Optus',
    type: 'campaign' as const,
    client: 'Singtel',
    caption: 'Licensed by Singtel for their Investor Day 2025 presentation discussing ROIC improvement at Optus.',
  },
  {
    src: '/images/services/photography/photography-sample-3.webp',
    title: 'FTSE 100 News',
    alt: 'Corporate photograph of the London Stock Exchange Group building used in CNN coverage of the FTSE 100 index',
    type: 'campaign' as const,
    publication: 'CNN',
    caption: 'Licensed by CNN for editorial coverage of the FTSE 100 at the London Stock Exchange Group.',
  },
  {
    src: '/images/services/photography/photography-sample-4.webp',
    title: 'Professional Standards Showcase',
    alt: 'Editorial photograph of UK car dealerships featured in The Times coverage of the UK Car Finance scandal',
    type: 'campaign' as const,
    publication: 'The Times',
    caption: 'Licensed by The Times for editorial coverage of the UK Car Finance scandal.',
  },
];

const photographySchemas = [
  buildService({
    name: 'Commercial and Editorial Photography',
    description:
      'Stock photos make your business look like everyone else. I shoot commercial and editorial photography for Nantwich and Crewe businesses. Real images that build trust and support your website and campaigns.',
    serviceType: 'Commercial and Editorial Photography',
    url: siteUrl(CANONICAL.routes.photography),
    audience: 'Nantwich and Crewe businesses needing real images for websites, campaigns, and marketing',
  }),
  buildBreadcrumbList([
    { name: 'Home', url: siteUrl(CANONICAL.routes.home) },
    { name: 'Services', url: siteUrl(CANONICAL.routes.services) },
    { name: 'Photography', url: siteUrl(CANONICAL.routes.photography) },
  ]),
  buildItemList(
    galleryImages.map((img, i) => ({
      name: img.title,
      url: siteUrl(CANONICAL.routes.photography),
      description: img.caption,
      position: i + 1,
    }))
  ),
  buildFAQPage([
    {
      question: 'How quickly do you deliver photos?',
      answer: 'Most shoots are delivered within 24 to 72 hours, depending on volume.',
    },
    {
      question: 'Do you provide editing and retouching?',
      answer: 'Yes. All delivered images are edited to a consistent standard.',
    },
    {
      question: 'Can you upload images directly to my Google Business profile?',
      answer: 'Yes. This is available for most local business clients in Nantwich and Crewe.',
    },
    {
      question: 'Do you travel outside Cheshire?',
      answer: 'Yes. Travel costs apply depending on distance from Nantwich.',
    },
    {
      question: 'Can you handle regular shoots for my business?',
      answer: 'Yes. Ideal for businesses needing ongoing photography for Google Business profiles or social media.',
    },
  ]),
];

export default function PhotographyServicesPage() {
  return (
    <Layout pageTitle="Photography Services">
      <JsonLd schemas={photographySchemas} />
      <DualStickyCTA />
      <div className="min-h-screen bg-white">
        {/* ProblemHero — photography-hero.webp preserved (Req 12.1) */}
        <ProblemHero
          heading="Stock photos make your business look like everyone else"
          subline="I shoot editorial and commercial photography for Nantwich and Crewe businesses. Real images that tell your story and support your marketing."
          ctaLabel={PHOTOGRAPHY_CTA.primaryLabel}
          ctaHref={PHOTOGRAPHY_CTA.primaryHref}
          proofText="3,500+ licensed images across 90+ countries. Published in BBC, Forbes, Financial Times, and The Times."
          imageSrc="/images/services/photography/photography-hero.webp"
          imageAlt="Editorial photography by Vivid Media Cheshire"
        />

        {/* ProblemMirror */}
        <div className="max-w-3xl mx-auto px-4">
          <ProblemMirror
            statement="I keep using the same tired stock photos because I cannot find anything that looks like my business"
            followUp="I hear this from Nantwich and Crewe business owners regularly. Generic stock images make your brand look like everyone else. Real photography sets you apart and builds trust with local customers."
          />
        </div>

        {/* Narrative editorial section — approved stats only (Req 12.2, 12.3) */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Editorial-quality photography for Nantwich and Crewe businesses
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              I bring the same standards I use for international publications to local business photography.
              Over 3,500 licensed images used across more than 90 countries.
              My work has appeared in the BBC, Forbes, Financial Times, CNN, and The Times.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Product shots for your website. Event coverage for social media. Architectural photography for marketing materials.
              I deliver images that reflect your business as it actually is.
            </p>
          </div>
        </section>

        {/* Authority Proof — publications with visible portfolio images */}
        <AuthorityProofBlock
          publications={[
            {
              name: 'BBC',
              imageSrc: '/images/services/photography/editorial-proof-bbc-forbes-times.webp',
              imageAlt: 'Editorial photography featured in BBC News coverage',
              caption: 'Photography licensed by BBC News for editorial use.',
            },
            {
              name: 'Financial Times',
              imageSrc: '/images/services/photography/5eb6fc44-e1a5-460d-8dea-923fd303f59d.webp',
              imageAlt: 'Published editorial photography featured in Financial Times article about UK electric vehicle sales',
              caption: 'Licensed for Financial Times coverage of UK electric vehicle sales.',
            },
            {
              name: 'CNN',
              imageSrc: '/images/services/photography/photography-sample-3.webp',
              imageAlt: 'Corporate photograph of the London Stock Exchange Group building used in CNN coverage of the FTSE 100 index',
              caption: 'Licensed by CNN for editorial coverage of the FTSE 100 at the London Stock Exchange Group.',
            },
            {
              name: 'The Times',
              imageSrc: '/images/services/photography/photography-sample-4.webp',
              imageAlt: 'Editorial photograph of UK car dealerships featured in The Times coverage of the UK Car Finance scandal',
              caption: 'Licensed by The Times for editorial coverage of the UK Car Finance scandal.',
            },
          ]}
        />

        {/* Stock Photography Proof — revenue growth and demand patterns */}
        <StockPhotographyProofBlock variant="photography" />

        {/* Personal service reassurance */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              You deal directly with me
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              No agency layers. No account managers.
              I plan the shoot, take the photos, edit them, and deliver them.
              Based in Nantwich, I work with businesses across Nantwich and Crewe.
            </p>
          </div>
        </section>

        {/* Insurance section */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fully insured</h2>
            <p className="text-gray-700 mb-3">
              I hold £1,000,000 Public Liability Insurance through Markel Direct (UK).
              I also carry £1,000,000 drone insurance as a licensed drone pilot.
            </p>
            <p className="text-gray-600">
              Your project is fully protected. Everything is handled safely and legally.
            </p>
          </div>
        </section>

        {/* Portfolio Gallery */}
        <section id="gallery" className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Portfolio Gallery</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Published editorial photography, local Nantwich projects, and commercial campaign work.
              </p>
            </div>

            <section className="photo-gallery mt-6">
              <h3 className="gallery-heading text-xl font-semibold mb-4">Recent Photography</h3>
              <div className="gallery-grid" id="galleryGrid">
                {galleryImages.map((image, index) => (
                  <figure key={index} className="gallery-item">
                    <img src={image.src} alt={image.alt} />
                    <figcaption className="p-3 bg-white/80 backdrop-blur-sm text-slate-900 text-sm leading-snug">
                      {image.title && <p className="font-semibold mb-1">{image.title}</p>}
                      {image.caption && <p className="text-slate-600 text-xs">{image.caption}</p>}
                      {(image.location || image.client || image.publication) && (
                        <p className="mt-3 inline-block rounded-full bg-slate-100 px-2 py-1 text-[0.65rem] font-medium text-slate-700">
                          {image.location || image.client || image.publication}
                        </p>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </div>
        </section>

        {/* How It Works */}
        <NumberedSteps
          heading="How a photography project works"
          steps={[
            {
              number: 1,
              title: 'Consultation',
              description: 'I ask what you need, where the images will be used, and what style fits your brand.',
            },
            {
              number: 2,
              title: 'Planning',
              description: 'I handle location scouting, equipment prep, and scheduling. You focus on your business.',
            },
            {
              number: 3,
              title: 'Shooting',
              description: 'Photography session with attention to composition, lighting, and the details that matter.',
            },
            {
              number: 4,
              title: 'Delivery',
              description: 'Edited, mobile-ready images delivered within 24 to 72 hours. Ready for your website, social media, or print.',
            },
          ]}
        />

        {/* Photography Pricing */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Photography Pricing</h2>
            <p className="text-gray-700 mb-1">
              Event photography starts from £200 per day. Travel is charged at £0.45 per mile from Nantwich.
            </p>
            <p className="mt-3 text-gray-700">
              Every project is different. Contact me for a quote.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Full details across all services on the{' '}
              <Link href="/pricing" className="text-pink-600 hover:text-pink-700 underline">
                pricing page
              </Link>.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Questions</h2>
            <div className="space-y-4">
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">How quickly do you deliver photos?</summary>
                <p className="mt-3 text-gray-700">Most shoots are delivered within 24 to 72 hours, depending on volume.</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">Do you provide editing and retouching?</summary>
                <p className="mt-3 text-gray-700">Yes. All delivered images are edited to a consistent standard.</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">Can you upload images directly to my Google Business profile?</summary>
                <p className="mt-3 text-gray-700">Yes. This is available for most local business clients in Nantwich and Crewe.</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">Do you travel outside Cheshire?</summary>
                <p className="mt-3 text-gray-700">Yes. Travel costs apply depending on distance from Nantwich.</p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">Can you handle regular shoots for my business?</summary>
                <p className="mt-3 text-gray-700">Yes. Ideal for businesses needing ongoing photography for Google Business profiles or social media.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Cross-link to Website Design */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Great photos need a great website
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Good photography makes a real difference. But only if your website shows it off properly.
              I also design fast, conversion-focused websites for Nantwich and Crewe businesses.
            </p>
            <div className="mt-8">
              <Link
                href="/services/website-design/"
                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-brand-black">Website Design</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Not getting enquiries? I design fast websites that turn visitors into leads.
                </p>
                <span className="mt-3 inline-block text-brand-pink font-semibold text-sm">Learn more →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* End-of-page CTA */}
        <CTABlock
          heading="Send me your brief"
          body="Based in Nantwich, working with Nantwich and Crewe businesses and beyond."
          primaryLabel={PHOTOGRAPHY_CTA.primaryLabel}
          primaryHref={PHOTOGRAPHY_CTA.primaryHref}
          secondaryLabel={PHOTOGRAPHY_CTA.secondaryLabel}
          secondaryHref={PHOTOGRAPHY_CTA.secondaryHref}
          variant="end-of-page"
        />

        {/* Photography Enquiry Form */}
        <section id="contact" className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PhotographyInquiryForm formspreeId="xpwaqjqr" />
          </div>
        </section>
      </div>
    </Layout>
  );
}
