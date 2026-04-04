import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Layout } from '@/components/layout';
import { getBlogPost, getAllBlogPosts } from '@/lib/blog-api';
import { buildSEO } from '@/lib/seo';
import { generateMetadata as generateSocialMetadata } from '@/lib/metadata-generator';
import { normaliseBlogImagePath } from '@/lib/blog-images';
import BlogHeroImage from '@/components/blog/BlogHeroImage';
import BlogPostCTA from '@/components/scram/BlogPostCTA';
import { JsonLd } from '@/components/JsonLd';
import { CANONICAL } from '@/config/canonical';
import {
  buildBlogPosting,
  buildBreadcrumbList,
  buildHowTo,
  buildFAQPage,
  buildSpeakableSpecification,
} from '@/lib/schema-generator';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);

    if (!post) {
      return buildSEO({
        intent: "Post Not Found",
        description: "This blog post could not be found. Browse my case studies for real project results.",
        canonicalPath: `/blog/${slug}/`,
        skipTitleValidation: true,
      });
    }

    // SCRAM: prefer metaDescription (outcome-led) over excerpt
    const description = post.metaDescription || post.excerpt;

    // Use the new social sharing metadata generator
    // SCRAM: normalise image path for consistent OG/Twitter cards
    const image = normaliseBlogImagePath(post.image);

    return generateSocialMetadata({
      pageType: 'blog',
      content: {
        title: post.title,
        description,
        image: image || undefined,
        type: 'article',
        publishedDate: post.date,
        author: post.author,
        tags: post.tags,
      },
      canonicalPath: `/blog/${slug}/`,
    });
  } catch {
    return {
      title: 'Blog | Vivid Media Cheshire',
      description: 'Blog post',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const image = normaliseBlogImagePath(post.image);
  const content = post.content || '';
  const siteUrl = CANONICAL.urls.site;
  const postUrl = `${siteUrl}/blog/${post.slug}/`;

  // Build base schemas (always present)
  const schemas: Record<string, unknown>[] = [
    buildBlogPosting({
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      datePublished: post.date,
      image: image ? `${siteUrl}${image}` : undefined,
    }),
    buildBreadcrumbList([
      { name: 'Home', url: `${siteUrl}${CANONICAL.routes.home}` },
      { name: 'Blog', url: `${siteUrl}${CANONICAL.routes.blog}` },
      { name: post.title, url: postUrl },
    ]),
  ];

  // Conditional: HowTo — only if step-by-step content is present
  // Detect ordered lists or headings containing "step" / "how to"
  const hasHowToContent =
    /<ol[\s>]/i.test(content) &&
    /step\s*\d|how\s*to/i.test(content);

  if (hasHowToContent) {
    // Extract steps from ordered list items
    const stepMatches = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (stepMatches && stepMatches.length >= 2) {
      const steps = stepMatches.slice(0, 10).map((li, i) => {
        const text = li.replace(/<[^>]+>/g, '').trim();
        return { name: `Step ${i + 1}`, text };
      });
      schemas.push(
        buildHowTo(post.title, post.excerpt, steps)
      );
    }
  }

  // Conditional: FAQPage — only if FAQ content is visible
  // Detect FAQ section headings or dl/dt patterns
  const hasFAQContent =
    /faq|frequently\s+asked/i.test(content) &&
    (/<h[23][^>]*>.*\?/i.test(content) || /<dt/i.test(content));

  if (hasFAQContent) {
    // Extract question/answer pairs from headings followed by paragraphs
    const faqPattern = /<h[23][^>]*>(.*?\?)<\/h[23]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
    const faqs: { question: string; answer: string }[] = [];
    let match;
    while ((match = faqPattern.exec(content)) !== null) {
      const question = match[1].replace(/<[^>]+>/g, '').trim();
      const answer = match[2].replace(/<[^>]+>/g, '').trim();
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
    if (faqs.length > 0) {
      schemas.push(buildFAQPage(faqs));
    }
  }

  // Conditional: SpeakableSpecification — only if concise summary blocks visible
  // Detect data-speakable attributes in the content
  const hasSpeakableContent = /data-speakable/i.test(content);

  if (hasSpeakableContent) {
    const speakableMatches = content.match(/data-speakable="([^"]+)"/gi);
    if (speakableMatches) {
      const selectors = speakableMatches.map((m) => {
        const id = m.replace(/data-speakable="([^"]+)"/i, '$1');
        return `[data-speakable="${id}"]`;
      });
      schemas.push(buildSpeakableSpecification(selectors));
    }
  }

  return (
    <Layout>
      <JsonLd schemas={schemas} />
      <article className='min-h-screen bg-white'>
        {/* Hero Section */}
        <header className='bg-gray-50 border-b border-gray-200'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16'>
            {/* Breadcrumb */}
            <nav className='mb-8'>
              <ol className='flex items-center space-x-2 text-sm text-gray-500'>
                <li>
                  <Link href='/' className='hover:text-gray-700'>
                    Home
                  </Link>
                </li>
                <li>
                  <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </li>
                <li>
                  <Link href='/blog' className='hover:text-gray-700'>
                    Blog
                  </Link>
                </li>
                <li>
                  <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </li>
                <li className='text-gray-900 font-medium'>{post.title}</li>
              </ol>
            </nav>

            {/* Post Header */}
            <div className='text-centre'>
              <div className='flex items-centre justify-centre space-x-2 text-sm text-gray-500 mb-4'>
                <span className='bg-brand-white text-brand-pink px-3 py-1 rounded-full font-medium border-2 border-brand-pink'>
                  {post.category}
                </span>
                <span>•</span>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                {post.readTime && (
                  <>
                    <span>•</span>
                    <span>{post.readTime} min read</span>
                  </>
                )}
              </div>

              <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight'>
                {post.title}
              </h1>

              <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8'>
                {post.excerpt}
              </p>

              <div className='flex items-centre justify-centre space-x-4 text-sm text-gray-500'>
                <span>By {post.author}</span>
                {post.tags.length > 0 && (
                  <div className='flex items-centre space-x-2'>
                    <span>•</span>
                    <div className='flex flex-wrap gap-2'>
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className='bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs'
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        {image ? (
          <div className='blog-hero max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12'>
            <div className='relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg'>
              <BlogHeroImage
                src={image}
                alt={`Hero image for ${post.title}`}
                priority={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                fetchPriority="high"
                loading="eager"
              />
            </div>
          </div>
        ) : null}

        {/* Post Content - Content images load AFTER hero */}
        <div className='pb-16'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <article className='prose prose-lg max-w-none blog-content'>
              <div
                dangerouslySetInnerHTML={{
                  __html: content,
                }}
              />
            </article>

            {/* Mandatory Blog Post CTA — always rendered, posts can override text but not remove */}
            <BlogPostCTA
              {...(post.ctaProblem ? { problemReminder: post.ctaProblem } : {})}
              {...(post.ctaSolution ? { solutionStatement: post.ctaSolution } : {})}
              {...(post.ctaLabel ? { ctaLabel: post.ctaLabel } : {})}
              {...(post.ctaHref ? { ctaHref: post.ctaHref } : {})}
            />
          </div>
        </div>

        {/* Post Footer */}
        <footer className='bg-gray-50 border-t border-gray-200'>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className='mb-8'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Tags
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className='bg-brand-white text-brand-pink px-3 py-1 rounded-full text-sm font-medium border-2 border-brand-pink'
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className='flex justify-between items-centre pt-8 border-t border-gray-200'>
              <Link
                href='/blog'
                className='inline-flex items-center text-brand-pink hover:text-brand-pink2 font-medium'
              >
                <svg
                  className='mr-2 w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
                Back to Blog
              </Link>

              <div className='flex items-centre space-x-4'>
                <span className='text-sm text-gray-500'>Share this post:</span>
                <div className='flex space-x-2'>
                  <button className='p-2 text-gray-400 hover:text-brand-pink transition-colors'>
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                  <button className='p-2 text-gray-400 hover:text-brand-pink transition-colors'>
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84' />
                    </svg>
                  </button>
                  <button className='p-2 text-gray-400 hover:text-brand-pink transition-colors'>
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </article>
    </Layout>
  );
}
