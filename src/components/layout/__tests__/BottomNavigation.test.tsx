import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNavigation } from '../BottomNavigation';

// Mock Next.js router
const mockPush = vi.fn();
let mockPathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

describe('BottomNavigation', () => {
  it('renders all navigation items', () => {
    render(<BottomNavigation />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('is fixed at bottom and hidden on desktop', () => {
    render(<BottomNavigation />);

    const nav = screen.getByLabelText('Bottom navigation');
    expect(nav).toHaveClass(
      'fixed',
      'bottom-0',
      'left-0',
      'right-0',
      'md:hidden'
    );
  });

  it('has proper z-index for overlay', () => {
    render(<BottomNavigation />);

    const nav = screen.getByLabelText('Bottom navigation');
    expect(nav).toHaveClass('z-40');
  });

  it('highlights active navigation item', () => {
    mockPathname = '/services';
    render(<BottomNavigation />);

    const servicesLink = screen.getByText('Services').closest('a');
    expect(servicesLink).toHaveClass('text-blue-600', 'bg-blue-50');
    expect(servicesLink).toHaveAttribute('aria-current', 'page');
  });

  it('applies hover styles to inactive items', () => {
    mockPathname = '/';
    render(<BottomNavigation />);

    const servicesLink = screen.getByText('Services').closest('a');
    expect(servicesLink).toHaveClass(
      'text-gray-600',
      'hover:text-gray-900',
      'hover:bg-gray-50'
    );
    expect(servicesLink).not.toHaveAttribute('aria-current');
  });

  it('has proper touch target sizes', () => {
    render(<BottomNavigation />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('min-w-[64px]', 'min-h-[56px]');
  });

  it('scales active item icon', () => {
    mockPathname = '/';
    render(<BottomNavigation />);

    const homeLink = screen.getByText('Home').closest('a');
    const iconContainer = homeLink?.querySelector('div');
    expect(iconContainer).toHaveClass('scale-110');
  });

  it('renders icons for all navigation items', () => {
    render(<BottomNavigation />);

    // Check that each navigation item has an SVG icon
    const navItems = screen.getAllByRole('link');
    navItems.forEach(item => {
      const svg = item.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-6', 'h-6');
    });
  });

  it('has proper semantic structure', () => {
    render(<BottomNavigation />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Bottom navigation');

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
  });

  it('applies font weight to active item text', () => {
    mockPathname = '/blog';
    render(<BottomNavigation />);

    const blogText = screen.getByText('Blog');
    expect(blogText).toHaveClass('font-semibold');
  });
});
