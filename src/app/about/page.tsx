import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';
import { generateMetadata as generateSocialMetadata } from '@/lib/metadata-generator';
import ProblemHero from '@/components/scram/ProblemHero';
import CTABlock from '@/components/scram/CTABlock';
import ProblemMirror from '@/components/scram/ProblemMirror';
import TechnicalProofItem from '@/components/scram/TechnicalProofItem';
import { JsonLd } from '@/components/JsonLd';
import { CANONICAL } from '@/config/canonical';
import { STANDARD_CTA, AHREFS_PROOF } from '@/lib/proof-data';
import {
  buildAboutPage,
  buildPerson,
  buildLocalBusiness,
  buildBreadcrumbList,
} from '@/lib/schema-generator';

export const metadata: Metadata = generateSocialMetadata({
  pageType: 'general',
  content: {
    title: 'About Joe Morris - Nantwich and Crewe',
    description: 'I fix websites and marketing for Nantwich and Crewe businesses. Editorial photography licensed by BBC News and Business Insider. Based in Nantwich.',
    image: '/images/about/Portrait_fc67d980-837c-4932-a705-24b4b76b2402-68.webp',
  },
  canonicalPath: '/about/',
});

const siteUrl = CANONICAL.urls.site;

const aboutSchemas = [
  buildAboutPage(
    'I fix websites and marketing for Nantwich and Crewe businesses. You deal directly with me. No account manager. No middleman. I do the work myself.'
  ),
  buildPerson({
    hasCredential: [
      { name: 'Adobe Experience Cloud Certification', credentialCategory: 'certification' },
      { name: 'Google Marketing Platform Certification', credentialCategory: 'certification' },
    ],
  }),
  buildLocalBusiness(
    'Websites that look fine but do not get enquiries. I fix that for trades, local services, and small businesses across Nantwich and Crewe. You deal directly with me.'
  ),
  buildBreadcrumbList([
    { name: 'Home', url: `${siteUrl}${CANONICAL.routes.home}` },
    { name: 'About', url: `${siteUrl}${CANONICAL.routes.about}` },
  ]),
];

export default function AboutPage() {
  return (
    <Layout pageTitle="About">
      <JsonLd schemas={aboutSchemas} />
      <div className="min-h-screen bg-white">
        {/* ProblemHero */}
        <ProblemHero
          heading="You deal directly with me."
          subline="I do the work. I answer the phone. There is no account manager between us."
          ctaLabel="Send me your website"
          ctaHref="/contact/"
          proofText="Editorial photography licensed by BBC News and Business Insider. Certified in Adobe Experience Cloud and Google Marketing Platform."
        />

        {/* ProblemMirror */}
        <div className="max-w-3xl mx-auto px-4">
          <ProblemMirror
            statement="I paid for a website and it does not bring in work"
            followUp="Most websites talk about the business. They do not describe the problem the customer has. That is what I change."
          />
        </div>

        {/* About — Two Column Layout with portrait */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    One person does the work
                  </h2>
                  <div className="space-y-4 text-base md:text-lg text-gray-600">
                    <p>
                      I fix websites and marketing for trades, local services, and small businesses across Nantwich and Crewe.
                    </p>
                    <p>
                      No account manager. No middleman.
                    </p>
                    <p>
                      I built my own photography business from scratch. I built the website, ran the ads, and tracked the results myself.
                    </p>
                    <p>
                      I use that experience to fix websites that are not getting enquiries.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative h-96 w-full lg:h-[500px]">
                    <Image
                      src="/images/about/Portrait_fc67d980-837c-4932-a705-24b4b76b2402-68.webp"
                      alt="Joe Morris, website and marketing specialist based in Nantwich and Crewe"
                      fill
                      className="object-cover rounded-lg shadow-lg"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real work examples — NYCC, BBC News, Business Insider */}
        <section className="py-12 md:py-16 bg-gray-50 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Real work, not theory
            </h2>
            <div className="mt-6 space-y-4 text-base md:text-lg text-gray-700">
              <p>
                My editorial photography has been licensed by BBC News and Business Insider.
              </p>
              <p>
                I support NYCC with photography and digital content.
              </p>
              <p>
                I hold certifications in Adobe Experience Cloud, Google Marketing Platform, Adobe Analytics, Adobe Target, and Microsoft Clarity.
              </p>
            </div>
            <div className="mt-8">
              <TechnicalProofItem
                heading={`Technical SEO, ${AHREFS_PROOF.attribution}`}
                metric={`Ahrefs Health Score: ${AHREFS_PROOF.healthScoreBefore} → ${AHREFS_PROOF.healthScoreAfter}`}
                description={AHREFS_PROOF.copySnippets.short}
              />
            </div>
          </div>
        </section>

        {/* Work context images */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="relative h-64 w-full">
                  <Image
                    src="/images/about/IMG_20190405_102621.webp"
                    alt="Automotive photography session in Nantwich and Crewe"
                    fill
                    className="object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Photography</h3>
                  <p className="text-gray-600">Licensed by BBC News and Business Insider.</p>
                </div>
              </div>
              <div className="relative">
                <div className="relative h-64 w-full">
                  <Image
                    src="/images/about/PXL_20240222_004124044~2.webp"
                    alt="Analytics dashboard for a Nantwich business"
                    fill
                    className="object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                  <p className="text-gray-600">I track what works and cut what does not.</p>
                </div>
              </div>
              <div className="relative">
                <div className="relative h-64 w-full">
                  <Image
                    src="/images/about/PXL_20240220_085641747.webp"
                    alt="Client meeting in Nantwich"
                    fill
                    className="object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Direct accountability</h3>
                  <p className="text-gray-600">You talk to me. I do the work.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local credibility */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Based in Nantwich, working across Nantwich and Crewe
            </h2>
            <div className="mt-6 space-y-4 text-base md:text-lg text-gray-700">
              <p>
                I work with trades, local services, and small businesses across Nantwich and Crewe.
              </p>
              <p>
                I also support organisations like NYCC with photography and digital content.
              </p>
              <p>
                You get someone who knows the local market. Not a remote agency guessing at what Nantwich and Crewe customers want.
              </p>
            </div>
          </div>
        </section>

        {/* Credentials */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
              Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-4">📰</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">BBC News</h3>
                <p className="text-gray-600 text-sm">Editorial photography licensed by BBC News.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">📰</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Business Insider</h3>
                <p className="text-gray-600 text-sm">Editorial photography licensed by Business Insider.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Adobe Experience Cloud</h3>
                <p className="text-gray-600 text-sm">Certified in Adobe Analytics, Target, and Experience Manager.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Google Marketing Platform</h3>
                <p className="text-gray-600 text-sm">Certified in Google Marketing Platform tools.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services overview */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              What I do for Nantwich and Crewe businesses
            </h2>
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Website Design</h3>
                <p className="mt-1 text-gray-700">Your website is not getting enquiries. I rebuild it so visitors know what to do next.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hosting</h3>
                <p className="mt-1 text-gray-700">Your site is slow. Visitors leave before they see what you offer. I fix the speed.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Google Ads</h3>
                <p className="mt-1 text-gray-700">You are spending money but leads are not coming in. I rework the setup so your budget brings real enquiries.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="mt-1 text-gray-700">You do not know where your leads come from. I set up tracking so you can see what is working.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Photography</h3>
                <p className="mt-1 text-gray-700">Stock photos look generic. I shoot images that show your real work.</p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/services/"
                className="inline-flex items-center text-brand-pink font-semibold hover:text-brand-pink2 transition-colors"
              >
                View all services →
              </Link>
            </div>
          </div>
        </section>

        {/* End-of-page CTA */}
        <CTABlock
          heading="Tell me what is not working. I will take a look."
          body="Based in Nantwich. Working with Nantwich and Crewe businesses."
          primaryLabel={STANDARD_CTA.primaryLabel}
          primaryHref={STANDARD_CTA.primaryHref}
          secondaryLabel={STANDARD_CTA.secondaryLabel}
          secondaryHref={STANDARD_CTA.secondaryHref}
          variant="end-of-page"
        />
      </div>
    </Layout>
  );
}
