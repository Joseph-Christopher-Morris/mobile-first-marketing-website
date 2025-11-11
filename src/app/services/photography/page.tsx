// src/app/services/photography/page.tsx
import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Image from 'next/image';
import Link from 'next/link';
import { PressMentions } from '@/components/credibility/PressMentions';

export const metadata: Metadata = {
  title: 'Professional Photography Services | Nantwich & Cheshire',
  description:
    'Professional photography services in Nantwich & Cheshire. Published editorial work for BBC, Forbes, and The Times. Local Nantwich photography and commercial campaign work.',
  keywords: [
    'professional photography services',
    'photography Nantwich',
    'commercial photography Cheshire',
    'editorial photography',
    'published photographer',
    'BBC photographer',
    'Forbes photographer',
    'The Times photographer',
    'local photography Nantwich',
    'campaign photography'
  ],
  openGraph: {
    title: 'Professional Photography Services | Nantwich & Cheshire',
    description:
      'Professional photography services with published editorial work for BBC, Forbes, and The Times. Local Nantwich photography and commercial campaigns.',
    images: [
      {
        // if you want, change this to the real path you’re serving from /public
        url: '/images/services/Photography/photography-hero.webp',
        width: 1200,
        height: 630,
        alt: 'General view of a busy Hampson Auctions sale at Oulton Park, shot in July 2024'
      }
    ]
  }
};

export default function PhotographyServicesPage() {
  const galleryImages = [
    // Editorial proof - Financial Times (keep if you want top-of-page proof)
    {
      src: '/images/services/Photography/5eb6fc44-e1a5-460d-8dea-923fd303f59d.webp',
      alt: 'Published editorial photography work featured in Financial Times article about UK electric vehicle sales for leading business media',
      title: 'UK vies with Germany to be European EV champion',
      subtitle: 'Year of record sales was still below government targets',
      caption:
        'Editorial photography licensed for Financial Times EV coverage, demonstrating consistent delivery for leading business publications.',
      type: 'clipping' as const
    },

    // Local / Nantwich (existing content – keeping)
    {
      src: '/images/services/Photography/240427-_Nantwich_Stock_Photography-19.webp',
      title: 'Nantwich Market Square Photography',
      alt: 'Professional commercial photography of Nantwich Market Square showing local traders and historic market town atmosphere',
      type: 'local' as const,
      location: 'Market Square',
      caption:
        'Capturing the vibrant atmosphere of Nantwich Market Square for local business and tourism use.'
    },
    {
      src: '/images/services/Photography/240427-_Nantwich_Stock_Photography-23.webp',
      title: 'Historic Town Center Architecture',
      alt: 'Architectural photography of Nantwich High Street with Tudor buildings and local shops',
      type: 'local' as const,
      location: 'High Street',
      caption:
        "Architectural photography highlighting Nantwich's distinctive Tudor street scene for web, print, and destination marketing."
    },
    {
      src: '/images/services/Photography/240421-Nantwich_Stock_Photography-49.webp',
      title: 'Community Life Documentation',
      alt: 'Documentary street photography capturing authentic daily life in Nantwich town centre',
      type: 'local' as const,
      location: 'Town Centre',
      caption: 'Documentary-style local photography capturing real community moments in Nantwich.'
    },

    // Hampson Auctions — DRONE
    {
      src: '/images/services/Photography/WhatsApp%20Image%202025-11-01%20at%2011.58.16%20AM.webp',
      title: 'Hampson Auctions Bolesworth Castle Sale',
      alt: 'Aerial drone photograph of the Hampson Auctions Bolesworth Castle venue showcasing a diverse lineup of vehicles',
      type: 'campaign' as const,
      client: 'Hampson Auctions',
      caption:
        'Aerial drone photography captured at the Hampson Auctions Bolesworth Castle Sale, showcasing the venue and variety of vehicles for promotional use.'
    },

    // Hampson Auctions — creative
    {
      src: '/images/services/Photography/photography-sample-2.webp',
      title: 'Hampson Auctions Creative Event Photography',
      alt: 'Creative commercial photography from the Hampson Auctions Bolesworth Castle Sale with enhanced golden evening atmosphere',
      type: 'campaign' as const,
      client: 'Hampson Auctions',
      caption:
        'Creative event photography captured at the Hampson Auctions Bolesworth Castle Sale, featuring a golden evening sky swap to create an iconic, atmospheric brand image.'
    },

    // Singtel licensed image
    {
      src: '/images/services/Photography/photography-sample-1.webp',
      title: 'Singtel Investor Day 2025',
      alt: 'Licensed commercial photograph used in Singtel Investor Day 2025 presentation on ROIC improvement at Optus',
      type: 'campaign' as const,
      client: 'Singtel',
      caption:
        'One of my commercial photographs was licensed by Singtel for use in their Investor Day 2025 presentation (28 August), featured in a section discussing ROIC improvement at Optus.'
    },

    // CNN / FTSE 100 / LSEG
    {
      src: '/images/services/Photography/photography-sample-3.webp',
      title: 'FTSE 100 News',
      alt: 'Corporate photograph of the London Stock Exchange Group building used in CNN coverage of the FTSE 100 index',
      type: 'campaign' as const,
      publication: 'CNN',
      caption:
        'Licensed by CNN for editorial coverage of the FTSE 100 at the London Stock Exchange Group, this image reflects technical precision and financial-sector storytelling.'
    },

    // The Times — UK Car Finance scandal
    {
      src: '/images/services/Photography/photography-sample-4.webp',
      title: 'Professional Standards Showcase',
      alt: 'Editorial photograph of UK car dealerships featured in The Times coverage of the UK Car Finance scandal',
      type: 'campaign' as const,
      publication: 'The Times',
      caption:
        'Licensed by The Times for editorial coverage of the UK Car Finance scandal, this image highlights professional standards and composition control for commercial media.'
    }
  ];

  return (
    <Layout pageTitle="Photography Services">
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-brand-black text-white py-20 lg:py-32">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Professional <span className="text-brand-pink">Photography</span> Services
                </h1>
                <p className="text-xl md:text-2xl text-brand-grey mb-8 leading-relaxed">
                  Published editorial photographer with work featured in major publications.
                  Specializing in local Nantwich photography and commercial campaigns.
                </p>

                <div className="mt-6 mb-6">
                  <PressMentions variant="dark" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors text-center"
                  >
                    Book Your Photoshoot →
                  </Link>
                  <Link
                    href="#gallery"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors text-center"
                  >
                    View Portfolio
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src="/images/services/Photography/photography-hero.webp"
                    alt="Photography showcase from Vivid Media Cheshire"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Description */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Published Editorial Photographer
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              With published work featured in major publications including BBC, Forbes, and The Times,
              I bring editorial-quality photography to local Nantwich businesses and commercial campaigns.
              From capturing the essence of local markets to creating compelling commercial imagery,
              every shot tells a story that connects with your audience.
            </p>
            {/* 👇 stats removed per request */}
          </div>
        </section>

        {/* KPI Section - Proven Global Reach */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Proven Global Reach</h2>
            <p className="text-lg text-gray-600">
              With thousands of licensed images and clients in over 90 countries, my work has
              appeared in a wide range of publications, from local businesses to international
              media outlets.
            </p>
            <p className="text-lg text-gray-600">
              Each image connects with real audiences, whether for an auction listing, brand
              campaign, or editorial feature.
            </p>
            {/* 👇 3,500+ / 90+ cards removed per request */}
          </div>
        </section>

        {/* Photography Gallery */}
        <section id="gallery" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Portfolio Gallery</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real work samples showcasing published editorial photography, local Nantwich projects,
                and commercial campaign work. Each image represents my commitment to quality and
                storytelling.
              </p>
            </div>

            <section className="photo-gallery mt-6">
              <h2 className="gallery-heading text-xl font-semibold mb-4">Recent Photography</h2>
              <div className="gallery-grid" id="galleryGrid">
                {galleryImages.map((image, index) => (
                  <figure key={index} className={`gallery-item ${index >= 4 ? 'gallery-hidden' : ''}`}>
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
              <button className="gallery-load-more" id="galleryLoadMore">
                Load more photos
              </button>

              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  document.addEventListener('DOMContentLoaded', function() {
                    const btn = document.getElementById('galleryLoadMore');
                    const hidden = document.querySelectorAll('.gallery-hidden');
                    if (btn) {
                      btn.addEventListener('click', () => {
                        hidden.forEach((item) => (item.style.display = 'block'));
                        btn.style.display = 'none';
                      });
                    }
                  });
                `
                }}
              />
            </section>
          </div>
        </section>

        {/* Photography Pricing */}
        <section className="py-12 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Photography Pricing
            </h2>
            <p className="text-gray-700 mb-1">
              <strong>Event photography:</strong> from £200 per day.
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Travel:</strong> £0.45 per mile.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Full details are available on the{" "}
              <Link href="/pricing" className="text-pink-600 hover:text-pink-700 underline">
                pricing page
              </Link>.
            </p>
          </div>
        </section>

        {/* Reassurance / Insurance Section */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Reassurance You Can Rely On</h2>
            <p className="text-gray-700 mb-3">
              I hold <strong>£1,000,000 Public Liability Insurance</strong> for photography and film
              through Markel Direct (UK) and <strong>£1,000,000 drone insurance cover</strong> as a
              licensed drone pilot.
            </p>
            <p className="text-gray-600">
              Your project is fully protected, giving you complete confidence that everything is
              handled safely, legally, and professionally.
            </p>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                My Photography Process
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From initial consultation to final delivery, I ensure every step meets my high
                standards of excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Consultation</h3>
                <p className="text-gray-600">
                  We discuss your vision, requirements, and objectives to create the perfect
                  photography plan.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Planning</h3>
                <p className="text-gray-600">
                  Detailed planning including location scouting, equipment preparation, and timeline
                  coordination.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Shooting</h3>
                <p className="text-gray-600">
                  Professional photography session with attention to detail and creative excellence.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delivery</h3>
                <p className="text-gray-600">
                  Professional editing and mobile-optimized delivery of your final images.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Photography Pricing */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                Photography Pricing
              </h2>

              <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Event Photography
                  </h3>
                  <p className="text-3xl font-bold text-pink-600 mb-4">
                    from £200 <span className="text-base font-normal text-gray-600">per day</span>
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Professional photography for events
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Commercial and editorial work
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      High-quality editing included
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Fast turnaround times
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Travel
                  </h3>
                  <p className="text-3xl font-bold text-pink-600 mb-4">
                    £0.45 <span className="text-base font-normal text-gray-600">per mile</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    Standard mileage rate for travel to your location
                  </p>
                  <p className="text-xs text-gray-500">
                    Based in Nantwich, serving Cheshire and surrounding areas
                  </p>
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Every project is unique. Contact me for a custom quote tailored to your needs.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  For full pricing across all services, see the{" "}
                  <Link href="/pricing" className="text-pink-600 hover:text-pink-700 underline">
                    pricing page
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-brand-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Editorial-Quality Photography?
            </h2>
            <p className="text-xl text-brand-grey mb-8 max-w-3xl mx-auto">
              Whether you need local business photography, commercial campaigns, or editorial-style
              imagery, let's create something that tells your story with the same quality featured in
              major publications.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors"
            >
              Book Your Photoshoot →
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
