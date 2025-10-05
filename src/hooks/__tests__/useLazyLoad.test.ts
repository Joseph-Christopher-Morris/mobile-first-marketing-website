import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLazyLoad, useLazyImage } from '../useLazyLoad';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

mockIntersectionObserver.mockReturnValue({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

describe('useLazyLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useLazyLoad());

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.hasTriggered).toBe(false);
    expect(result.current.elementRef.current).toBe(null);
  });

  it('should create IntersectionObserver with correct options', () => {
    const options = {
      threshold: 0.5,
      rootMargin: '100px',
      triggerOnce: false,
    };

    renderHook(() => useLazyLoad(options));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '100px',
      }
    );
  });

  it('should observe element when ref is set', () => {
    const { result } = renderHook(() => useLazyLoad());

    // Mock element
    const mockElement = document.createElement('div');

    act(() => {
      // Use Object.defineProperty to set the current value
      Object.defineProperty(result.current.elementRef, 'current', {
        value: mockElement,
        writable: true,
      });
    });

    // Re-render to trigger useEffect
    renderHook(() => useLazyLoad());

    expect(mockObserve).toHaveBeenCalledWith(mockElement);
  });

  it('should update intersection state when callback is triggered', () => {
    let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

    mockIntersectionObserver.mockImplementation(callback => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const { result } = renderHook(() => useLazyLoad());

    // Simulate intersection
    act(() => {
      intersectionCallback([
        { isIntersecting: true } as IntersectionObserverEntry,
      ]);
    });

    expect(result.current.isIntersecting).toBe(true);
  });

  it('should set hasTriggered when triggerOnce is true and element intersects', () => {
    let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

    mockIntersectionObserver.mockImplementation(callback => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const { result } = renderHook(() => useLazyLoad({ triggerOnce: true }));

    act(() => {
      intersectionCallback([
        { isIntersecting: true } as IntersectionObserverEntry,
      ]);
    });

    expect(result.current.hasTriggered).toBe(true);
    expect(result.current.isIntersecting).toBe(true);
  });

  it('should not create new observer if already triggered and triggerOnce is true', () => {
    let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

    mockIntersectionObserver.mockImplementation(callback => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const { result, rerender } = renderHook(() =>
      useLazyLoad({ triggerOnce: true })
    );

    // Trigger intersection
    act(() => {
      intersectionCallback([
        { isIntersecting: true } as IntersectionObserverEntry,
      ]);
    });

    const initialCallCount = mockIntersectionObserver.mock.calls.length;

    // Re-render
    rerender();

    // Should not create new observer
    expect(mockIntersectionObserver.mock.calls.length).toBe(initialCallCount);
  });

  it('should unobserve element on cleanup', () => {
    const { result, unmount } = renderHook(() => useLazyLoad());

    const mockElement = document.createElement('div');

    act(() => {
      // Use Object.defineProperty to set the current value
      Object.defineProperty(result.current.elementRef, 'current', {
        value: mockElement,
        writable: true,
      });
    });

    unmount();

    expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
  });
});

describe('useLazyImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useLazyImage('/test-image.jpg'));

    expect(result.current.imageSrc).toBe('');
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(result.current.isIntersecting).toBe(false);
  });

  it('should set imageSrc when intersecting', () => {
    let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

    mockIntersectionObserver.mockImplementation(callback => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const { result } = renderHook(() => useLazyImage('/test-image.jpg'));

    act(() => {
      intersectionCallback([
        { isIntersecting: true } as IntersectionObserverEntry,
      ]);
    });

    expect(result.current.imageSrc).toBe('/test-image.jpg');
  });

  it('should not set imageSrc if already set', () => {
    let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

    mockIntersectionObserver.mockImplementation(callback => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const { result } = renderHook(() => useLazyImage('/test-image.jpg'));

    // First intersection
    act(() => {
      intersectionCallback([
        { isIntersecting: true } as IntersectionObserverEntry,
      ]);
    });

    expect(result.current.imageSrc).toBe('/test-image.jpg');

    // Change src prop
    const { result: result2 } = renderHook(() =>
      useLazyImage('/new-image.jpg')
    );

    // Should not change imageSrc if already set
    expect(result.current.imageSrc).toBe('/test-image.jpg');
  });

  it('should handle load event', () => {
    const { result } = renderHook(() => useLazyImage('/test-image.jpg'));

    act(() => {
      result.current.handleLoad();
    });

    expect(result.current.isLoaded).toBe(true);
  });

  it('should handle error event', () => {
    const { result } = renderHook(() => useLazyImage('/test-image.jpg'));

    act(() => {
      result.current.handleError();
    });

    expect(result.current.hasError).toBe(true);
  });

  it('should not set imageSrc if src is empty', () => {
    let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

    mockIntersectionObserver.mockImplementation(callback => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const { result } = renderHook(() => useLazyImage(''));

    act(() => {
      intersectionCallback([
        { isIntersecting: true } as IntersectionObserverEntry,
      ]);
    });

    expect(result.current.imageSrc).toBe('');
  });
});
