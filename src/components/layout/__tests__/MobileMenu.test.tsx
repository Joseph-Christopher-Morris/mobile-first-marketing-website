import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileMenu } from '../MobileMenu';

// Mock Next.js router
const mockPush = vi.fn();
const mockPathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

const mockNavigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  navigationItems: mockNavigationItems,
  currentPath: '/',
};

describe('MobileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<MobileMenu {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobile navigation menu')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<MobileMenu {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<MobileMenu {...defaultProps} />);

    mockNavigationItems.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('highlights active navigation item', () => {
    render(<MobileMenu {...defaultProps} currentPath='/services' />);

    const servicesLink = screen.getByText('Services').closest('a');
    expect(servicesLink).toHaveClass(
      'bg-blue-50',
      'text-blue-600',
      'border-l-4',
      'border-blue-600'
    );
    expect(servicesLink).toHaveAttribute('aria-current', 'page');
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MobileMenu {...defaultProps} onClose={onClose} />);

    const backdrop = screen.getByRole('dialog').previousElementSibling;
    await user.click(backdrop as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MobileMenu {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close menu');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when navigation link is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MobileMenu {...defaultProps} onClose={onClose} />);

    const homeLink = screen.getByText('Home');
    await user.click(homeLink);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when CTA button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MobileMenu {...defaultProps} onClose={onClose} />);

    const ctaButton = screen.getByText('Get Started');
    await user.click(ctaButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes menu on Escape key press', () => {
    const onClose = vi.fn();
    render(<MobileMenu {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has proper touch target sizes for navigation links', () => {
    render(<MobileMenu {...defaultProps} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('min-h-[48px]');
  });

  it('has proper touch target size for close button', () => {
    render(<MobileMenu {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close menu');
    expect(closeButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
  });

  it('has proper touch target size for CTA button', () => {
    render(<MobileMenu {...defaultProps} />);

    const ctaButton = screen.getByText('Get Started');
    expect(ctaButton).toHaveClass('min-h-[48px]');
  });

  it('applies slide-in animation classes', () => {
    render(<MobileMenu {...defaultProps} />);

    const menu = screen.getByRole('dialog');
    expect(menu).toHaveClass(
      'transform',
      'transition-transform',
      'duration-300',
      'ease-in-out'
    );
    expect(menu).toHaveClass('translate-x-0'); // Open state
  });

  it('has proper z-index for overlay', () => {
    render(<MobileMenu {...defaultProps} />);

    const backdrop = screen.getByRole('dialog').previousElementSibling;
    expect(backdrop).toHaveClass('z-40');

    const menu = screen.getByRole('dialog');
    expect(menu).toHaveClass('z-50');
  });

  it('prevents body scroll when open', () => {
    const originalOverflow = document.body.style.overflow;

    const { unmount } = render(<MobileMenu {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('unset');

    // Restore original value
    document.body.style.overflow = originalOverflow;
  });

  it('has proper ARIA attributes', () => {
    render(<MobileMenu {...defaultProps} />);

    const menu = screen.getByRole('dialog');
    expect(menu).toHaveAttribute('aria-modal', 'true');
    expect(menu).toHaveAttribute('aria-label', 'Mobile navigation menu');
  });
});
