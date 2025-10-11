import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import OptimizedImage from '../OptimizedImage';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    // Simulate different loading scenarios based on src
    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (src.includes('broken') || src.includes('404')) {
          onError?.();
        } else if (src.includes('slow')) {
          // Simulate slow loading
          setTimeout(() => onLoad?.(), 2000);
        } else {
          onLoad?.();
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [src, onLoad, onError]);

    return <img src={src} alt={alt} {...props} data-testid='next-image' />;
  },
}));

describe('OptimizedImage Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading States', () => {
    it('should show loading indicator by default', async () => {
      render(
        <OptimizedImage
          src='/images/slow-loading.jpg'
          alt='Slow loading image'
          width={400}
          height={300}
        />
      );

      expect(screen.getByText('Loading image...')).toBeInTheDocument();
    });

    it('should hide loading indicator when showLoadingIndicator is false', () => {
      render(
        <OptimizedImage
          src='/images/test.jpg'
          alt='Test image'
          width={400}
          height={300}
          showLoadingIndicator={false}
        />
      );

      expect(screen.queryByText('Loading image...')).not.toBeInTheDocument();
    });

    it('should show custom loading component when provided', () => {
      const CustomLoader = () => <div>Custom loading...</div>;

      render(
        <OptimizedImage
          src='/images/slow-loading.jpg'
          alt='Test image'
          width={400}
          height={300}
          loadingComponent={<CustomLoader />}
        />
      );

      expect(screen.getByText('Custom loading...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error message when image fails to load', async () => {
      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Broken image'
          width={400}
          height={300}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Image failed to load')).toBeInTheDocument();
      });

      expect(screen.getByText('Broken image')).toBeInTheDocument();
    });

    it('should show custom error message', async () => {
      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Broken image'
          width={400}
          height={300}
          errorMessage='Custom error occurred'
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Custom error occurred')).toBeInTheDocument();
      });
    });

    it('should hide error message when showErrorMessage is false', async () => {
      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Broken image'
          width={400}
          height={300}
          showErrorMessage={false}
        />
      );

      await waitFor(() => {
        expect(
          screen.queryByText('Image failed to load')
        ).not.toBeInTheDocument();
      });
    });

    it('should show custom error component when provided', async () => {
      const CustomError = () => <div>Custom error component</div>;

      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Broken image'
          width={400}
          height={300}
          errorComponent={<CustomError />}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Custom error component')).toBeInTheDocument();
      });
    });
  });

  describe('Fallback Mechanism', () => {
    it('should try fallback image when main image fails', async () => {
      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Test image'
          width={400}
          height={300}
          fallbackSrc='/images/fallback.jpg'
        />
      );

      // Wait for the fallback to be attempted
      await waitFor(() => {
        const image = screen.getByTestId('next-image');
        expect(image).toHaveAttribute('src', '/images/fallback.jpg');
      });
    });

    it('should show error if both main and fallback images fail', async () => {
      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Test image'
          width={400}
          height={300}
          fallbackSrc='/images/broken-fallback.jpg'
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Image failed to load')).toBeInTheDocument();
      });
    });
  });

  describe('Retry Mechanism', () => {
    it('should show retry count during retry attempts', async () => {
      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Test image'
          width={400}
          height={300}
          maxRetries={2}
          retryDelay={100}
        />
      );

      // Should show retry indicator
      await waitFor(
        () => {
          expect(screen.getByText('Retry 1/2')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('should respect maxRetries setting', async () => {
      const onError = vi.fn();

      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Test image'
          width={400}
          height={300}
          maxRetries={1}
          retryDelay={50}
          onError={onError}
        />
      );

      // Wait for all retries to complete
      await waitFor(
        () => {
          expect(screen.getByText('Image failed to load')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Development Debug Info', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show debug info in development mode', async () => {
      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Test image'
          width={400}
          height={300}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Debug Info')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for error state', async () => {
      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Test image'
          width={400}
          height={300}
        />
      );

      await waitFor(() => {
        const errorContainer = screen.getByRole('img');
        expect(errorContainer).toHaveAttribute(
          'aria-label',
          'Failed to load image: Test image'
        );
      });
    });

    it('should maintain alt text in error state', async () => {
      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Important test image'
          width={400}
          height={300}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Important test image')).toBeInTheDocument();
      });
    });
  });

  describe('Callback Functions', () => {
    it('should call onLoad when image loads successfully', async () => {
      const onLoad = vi.fn();

      render(
        <OptimizedImage
          src='/images/success.jpg'
          alt='Test image'
          width={400}
          height={300}
          onLoad={onLoad}
        />
      );

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onError when all retries are exhausted', async () => {
      const onError = vi.fn();

      render(
        <OptimizedImage
          src='/images/broken-image.jpg'
          alt='Test image'
          width={400}
          height={300}
          maxRetries={1}
          retryDelay={50}
          onError={onError}
        />
      );

      await waitFor(
        () => {
          expect(onError).toHaveBeenCalledTimes(1);
        },
        { timeout: 2000 }
      );
    });
  });
});
