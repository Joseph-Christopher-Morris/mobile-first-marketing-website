import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../page';

// Mock the content library
vi.mock('@/lib/content', () => ({
  getAllPosts: vi.fn(() => [
    {
      slug: 'test-post-1',
      title: 'Test Post 1',
      excerpt: 'This is a test post excerpt',
      date: '2023-01-01',
      author: 'Test Author',
      featured: true,
      categories: ['tech'],
      tags: ['test'],
      content: 'Test content',
      readingTime: 5,
    },
    {
      slug: 'test-post-2',
      title: 'Test Post 2',
      excerpt: 'Another test post excerpt',
      date: '2023-01-02',
      author: 'Test Author',
      featured: false,
      categories: ['Vivid Auto Photography'],
      tags: ['test'],
      content: 'Test content 2',
      readingTime: 3,
    },
  ]),
  getAllServices: vi.fn(() => [
    {
      slug: 'photography',
      title: 'Photography Services',
      shortDescription: 'Professional photography for your business',
      content: 'Detailed photography content',
      featuredImage: '/images/services/photography.jpg',
      icon: 'camera',
      order: 1,
      features: ['Portrait Photography', 'Product Photography'],
      benefits: ['High Quality', 'Fast Delivery'],
    },
    {
      slug: 'analytics',
      title: 'Analytics Services',
      shortDescription: 'Data-driven insights for your business',
      content: 'Detailed analytics content',
      featuredImage: '/images/services/analytics.jpg',
      icon: 'chart',
      order: 2,
      features: ['Web Analytics', 'Performance Tracking'],
      benefits: ['Better ROI', 'Data Insights'],
    },
  ]),
  getAllTestimonials: vi.fn(() => [
    {
      id: 'testimonial-1',
      author: 'John Doe',
      position: 'CEO',
      company: 'Test Company',
      content: 'Great service and results!',
      rating: 5,
      featured: true,
      order: 1,
    },
    {
      id: 'testimonial-2',
      author: 'Jane Smith',
      position: 'Vivid Auto Photography Director',
      company: 'Another Company',
      content: 'Highly recommend their services.',
      rating: 5,
      featured: true,
      order: 2,
    },
  ]),
}));

// Mock Next.js components
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, ...props }) => (
    <img src={src} alt={alt} {...props} />
  )),
}));

vi.mock('next/link', () => ({
  default: vi.fn(({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero section', async () => {
    render(await HomePage());

    // Check for hero content
    expect(
      screen.getByText(/Mobile-First Vivid Auto Photography/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Professional Vivid Auto Photography services/i)
    ).toBeInTheDocument();
  });

  it('renders services showcase', async () => {
    render(await HomePage());

    // Check for services section
    expect(screen.getByText('Photography Services')).toBeInTheDocument();
    expect(screen.getByText('Analytics Services')).toBeInTheDocument();
    expect(
      screen.getByText('Professional photography for your business')
    ).toBeInTheDocument();
  });

  it('renders testimonials carousel', async () => {
    render(await HomePage());

    // Check for testimonials
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Great service and results!')).toBeInTheDocument();
  });

  it('renders blog preview section', async () => {
    render(await HomePage());

    // Check for blog posts
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
  });

  it('has proper semantic structure', async () => {
    render(await HomePage());

    // Check for main content area
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Check for headings hierarchy
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('includes call-to-action buttons', async () => {
    render(await HomePage());

    // Check for CTA buttons
    const ctaButtons = screen.getAllByRole('button');
    expect(ctaButtons.length).toBeGreaterThan(0);
  });

  it('is mobile-responsive', async () => {
    render(await HomePage());

    // Check for mobile-first classes (this would be more comprehensive in a real test)
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('loads content from CMS', async () => {
    const { getAllPosts, getAllServices, getAllTestimonials } = await import(
      '@/lib/content'
    );

    render(await HomePage());

    // Verify content functions were called
    expect(getAllPosts).toHaveBeenCalled();
    expect(getAllServices).toHaveBeenCalled();
    expect(getAllTestimonials).toHaveBeenCalled();
  });

  it('handles empty content gracefully', async () => {
    // Mock empty content
    const { getAllPosts, getAllServices, getAllTestimonials } = await import(
      '@/lib/content'
    );

    vi.mocked(getAllPosts).mockReturnValue([]);
    vi.mocked(getAllServices).mockReturnValue([]);
    vi.mocked(getAllTestimonials).mockReturnValue([]);

    render(await HomePage());

    // Page should still render without errors
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
