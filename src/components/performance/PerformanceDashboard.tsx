"use client";

import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  navigationStart?: number;
  domContentLoaded?: number;
  loadComplete?: number;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Monitor Core Web Vitals
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onLCP((metric) => setMetrics(prev => ({ ...prev, lcp: metric.value })));
      onFID((metric) => setMetrics(prev => ({ ...prev, fid: metric.value })));
      onCLS((metric) => setMetrics(prev => ({ ...prev, cls: metric.value })));
      onFCP((metric) => setMetrics(prev => ({ ...prev, fcp: metric.value })));
      onTTFB((metric) => setMetrics(prev => ({ ...prev, ttfb: metric.value })));
    }).catch(() => {
      console.warn('web-vitals library not available');
    });

    // Monitor navigation timing
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          navigationStart: navigation.startTime,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
          loadComplete: navigation.loadEventEnd - navigation.startTime
        }));
      }
    }

    // Show dashboard with keyboard shortcut (Ctrl+Shift+P)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  const getMetricColor = (name: string, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'cls') return value.toFixed(3);
    return Math.round(value);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {/* Core Web Vitals */}
        <div className="border-b pb-2">
          <div className="font-medium text-gray-700 mb-1">Core Web Vitals</div>
          {metrics.lcp && (
            <div className={`flex justify-between ${getMetricColor('lcp', metrics.lcp)}`}>
              <span>LCP:</span>
              <span>{formatValue('lcp', metrics.lcp)}ms</span>
            </div>
          )}
          {metrics.fid && (
            <div className={`flex justify-between ${getMetricColor('fid', metrics.fid)}`}>
              <span>FID:</span>
              <span>{formatValue('fid', metrics.fid)}ms</span>
            </div>
          )}
          {metrics.cls !== undefined && (
            <div className={`flex justify-between ${getMetricColor('cls', metrics.cls)}`}>
              <span>CLS:</span>
              <span>{formatValue('cls', metrics.cls)}</span>
            </div>
          )}
        </div>

        {/* Other Metrics */}
        <div>
          <div className="font-medium text-gray-700 mb-1">Other Metrics</div>
          {metrics.fcp && (
            <div className={`flex justify-between ${getMetricColor('fcp', metrics.fcp)}`}>
              <span>FCP:</span>
              <span>{formatValue('fcp', metrics.fcp)}ms</span>
            </div>
          )}
          {metrics.ttfb && (
            <div className={`flex justify-between ${getMetricColor('ttfb', metrics.ttfb)}`}>
              <span>TTFB:</span>
              <span>{formatValue('ttfb', metrics.ttfb)}ms</span>
            </div>
          )}
          {metrics.domContentLoaded && (
            <div className="flex justify-between text-gray-600">
              <span>DOM Ready:</span>
              <span>{formatValue('dom', metrics.domContentLoaded)}ms</span>
            </div>
          )}
          {metrics.loadComplete && (
            <div className="flex justify-between text-gray-600">
              <span>Load Complete:</span>
              <span>{formatValue('load', metrics.loadComplete)}ms</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t text-xs text-gray-500">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}
