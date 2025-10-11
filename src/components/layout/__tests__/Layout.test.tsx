import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from '../Layout';

// Mock Next.js router
const mockPush = vi.fn();
const mockPathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

describe('Layout', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header component', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check for header elements
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to homepage')).toBeInTheDocument();
  });

  it('renders bottom navigation by default', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByLabelText('Bottom navigation')).toBeInTheDocument();
  });

  it('hides bottom navigation when showBottomNav is false', () => {
    render(
      <Layout showBottomNav={false}>
        <div>Test Content</div>
      </Layout>
    );

    expect(
      screen.queryByLabelText('Bottom navigation')
    ).not.toBeInTheDocument();
  });

  it('applies custom className to main content', () => {
    render(
      <Layout className='custom-class'>
        <div>Test Content</div>
      </Layout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('custom-class');
  });

  it('sets proper aria-label on main content', () => {
    render(
      <Layout pageTitle='Test Page'>
        <div>Test Content</div>
      </Layout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Test Page');
  });

  it('applies mobile padding when bottom nav is shown', () => {
    render(
      <Layout showBottomNav={true}>
        <div>Test Content</div>
      </Layout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('pb-16', 'md:pb-0');
  });

  it('renders footer with proper visibility classes', () => {
    render(
      <Layout showBottomNav={true}>
        <div>Test Content</div>
      </Layout>
    );

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('hidden', 'md:block');
  });
});
