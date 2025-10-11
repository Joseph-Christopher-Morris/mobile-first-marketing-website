import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';

// Mock Next.js router
const mockPush = vi.fn();
const mockPathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

describe('Header', () => {
  it('renders logo and brand name', () => {
    render(<Header />);

    expect(screen.getByLabelText('Go to homepage')).toBeInTheDocument();
    expect(screen.getByAltText('Vivid Auto Photography Logo')).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    render(<Header />);

    // Check for navigation links (hidden on mobile, visible on desktop)
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    // These should be present but hidden on mobile
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders mobile menu button', () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Toggle mobile menu');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveClass('md:hidden');
  });

  it('toggles mobile menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByLabelText('Toggle mobile menu');

    // Initially menu should be closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Click to open menu
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // Click to close menu
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('has proper touch target size for mobile menu button', () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Toggle mobile menu');
    expect(menuButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
  });

  it('renders CTA button on desktop', () => {
    render(<Header />);

    const ctaButton = screen.getByText('Get Started');
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton.closest('div')).toHaveClass('hidden', 'md:flex');
  });

  it('applies sticky positioning', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0', 'z-50');
  });

  it('shows hamburger icon when menu is closed', () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Toggle mobile menu');
    const svg = menuButton.querySelector('svg');
    const path = svg?.querySelector('path');

    expect(path).toHaveAttribute('d', 'M4 6h16M4 12h16M4 18h16');
  });

  it('shows close icon when menu is open', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const menuButton = screen.getByLabelText('Toggle mobile menu');
    await user.click(menuButton);

    const svg = menuButton.querySelector('svg');
    const path = svg?.querySelector('path');

    expect(path).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12');
  });

  it('has proper responsive height classes', () => {
    render(<Header />);

    const headerContent = screen.getByRole('banner').querySelector('div > div');
    expect(headerContent).toHaveClass('h-16', 'md:h-20');
  });
});
