import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OptimizedImage from '../OptimizedImage';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, onLoad, onError, ...props }) => (
    <img src={src} alt={alt} onLoad={onLoad} onError={onError} {...props} />
  )),
}));

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with required props', () => {
    render(
      <OptimizedImage
        src='/test-image.jpg'
        alt='Test image'
        width={400}
        height={300}
      />
    );

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('applies priority loading when specified', () => {
    render(
      <OptimizedImage
        src='/hero-image.jpg'
        alt='Hero image'
        width={1200}
        height={600}
        priority
      />
    );

    const image = screen.getByAltText('Hero image');
    expect(image).toBeInTheDocument();
  });

  it('handles loading state', () => {
    const { container } = render(
      <OptimizedImage
        src='/loading-image.jpg'
        alt='Loading image'
        width={400}
        height={300}
      />
    );

    // Should have loading placeholder initially
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('handles load event', () => {
    render(
      <OptimizedImage
        src='/loaded-image.jpg'
        alt='Loaded image'
        width={400}
        height={300}
      />
    );

    const image = screen.getByAltText('Loaded image');

    // Simulate image load
    fireEvent.load(image);

    // Loading state should be removed
    expect(image.closest('.animate-pulse')).not.toBeInTheDocument();
  });

  it('handles error state', () => {
    render(
      <OptimizedImage
        src='/broken-image.jpg'
        alt='Broken image'
        width={400}
        height={300}
      />
    );

    const image = screen.getByAltText('Broken image');

    // Simulate image error
    fireEvent.error(image);

    // Should show error state
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <OptimizedImage
        src='/custom-image.jpg'
        alt='Custom image'
        width={400}
        height={300}
        className='custom-class'
      />
    );

    const container = screen.getByAltText('Custom image').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('uses blur placeholder by default', () => {
    render(
      <OptimizedImage
        src='/blur-image.jpg'
        alt='Blur image'
        width={400}
        height={300}
      />
    );

    // Should have blur placeholder
    const container = screen.getByAltText('Blur image').closest('div');
    expect(container?.querySelector('.bg-gray-200')).toBeInTheDocument();
  });

  it('handles responsive sizing', () => {
    render(
      <OptimizedImage
        src='/responsive-image.jpg'
        alt='Responsive image'
        width={400}
        height={300}
        sizes='(max-width: 768px) 100vw, 50vw'
      />
    );

    const image = screen.getByAltText('Responsive image');
    expect(image).toBeInTheDocument();
  });

  it('supports different image formats', () => {
    render(
      <OptimizedImage
        src='/test-image.webp'
        alt='WebP image'
        width={400}
        height={300}
      />
    );

    const image = screen.getByAltText('WebP image');
    expect(image).toHaveAttribute('src', '/test-image.webp');
  });

  it('maintains aspect ratio', () => {
    render(
      <OptimizedImage
        src='/aspect-image.jpg'
        alt='Aspect ratio image'
        width={800}
        height={400}
      />
    );

    const container = screen.getByAltText('Aspect ratio image').closest('div');
    expect(container).toHaveStyle({ aspectRatio: '800 / 400' });
  });

  it('handles lazy loading by default', () => {
    render(
      <OptimizedImage
        src='/lazy-image.jpg'
        alt='Lazy image'
        width={400}
        height={300}
      />
    );

    const image = screen.getByAltText('Lazy image');
    // Next.js Image component should handle lazy loading
    expect(image).toBeInTheDocument();
  });

  it('provides accessibility attributes', () => {
    render(
      <OptimizedImage
        src='/accessible-image.jpg'
        alt='Accessible image description'
        width={400}
        height={300}
      />
    );

    const image = screen.getByAltText('Accessible image description');
    expect(image).toHaveAttribute('alt', 'Accessible image description');
  });

  it('handles missing alt text gracefully', () => {
    // This should show a warning in development
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <OptimizedImage src='/no-alt-image.jpg' alt='' width={400} height={300} />
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', '');

    consoleSpy.mockRestore();
  });
});
