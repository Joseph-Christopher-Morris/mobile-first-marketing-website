'use client';

import { useEffect, useRef } from 'react';

interface ConversionEvent {
  event_name: string;
  event_category: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface ConversionGoal {
  id: string;
  name: string;
  trigger: 'page_view' | 'click' | 'scroll' | 'time_on_page' | 'form_submit';
  target?: string;
  threshold?: number;
  value: number;
}

interface ConversionTrackerProps {
  goals?: ConversionGoal[];
  enableHeatMapping?: boolean;
  enableScrollTracking?: boolean;
  enableTimeTracking?: boolean;
}

const defaultGoals: ConversionGoal[] = [
  {
    id: 'contact_page_visit',
    name: 'Contact Page Visit',
    trigger: 'page_view',
    target: '/contact',
    value: 5
  },
  {
    id: 'gallery_engagement',
    name: 'Gallery Engagement',
    trigger: 'scroll',
    threshold: 50, // 50% scroll
    value: 2
  },
  {
    id: 'extended_engagement',
    name: 'Extended Page Engagement',
    trigger: 'time_on_page',
    threshold: 60, // 60 seconds
    value: 3
  },
  {
    id: 'booking_inquiry',
    name: 'Booking Inquiry',
    trigger: 'click',
    target: '[href="/contact"]',
    value: 10
  }
];

export default function ConversionTracker({
  goals = defaultGoals,
  enableHeatMapping = true,
  enableScrollTracking = true,
  enableTimeTracking = true
}: ConversionTrackerProps) {
  const startTime = useRef<number>(Date.now());
  const scrollTracked = useRef<Set<number>>(new Set());
  const timeTracked = useRef<Set<number>>(new Set());
  const heatMapData = useRef<Array<{x: number, y: number, timestamp: number}>>([]);

  // Track conversion event
  const trackConversion = (goal: ConversionGoal, additionalData?: Record<string, any>) => {
    const event: ConversionEvent = {
      event_name: 'conversion',
      event_category: 'photography_conversion',
      event_label: goal.id,
      value: goal.value,
      custom_parameters: {
        goal_name: goal.name,
        goal_type: goal.trigger,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    };

    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event_name, {
        event_category: event.event_category,
        event_label: event.event_label,
        value: event.value,
        custom_parameter_1: goal.name,
        custom_parameter_2: goal.trigger,
        custom_parameter_3: JSON.stringify(additionalData || {})
      });
    }

    // Store locally for analysis
    const conversions = JSON.parse(localStorage.getItem('photography_conversions') || '[]');
    conversions.push({
      ...event,
      sessionId: sessionStorage.getItem('session_id') || 'unknown',
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });
    localStorage.setItem('photography_conversions', JSON.stringify(conversions));

    console.log('Conversion tracked:', event);
  };

  // Track gallery interactions
  const trackGalleryInteraction = (action: string, imageId?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'gallery_interaction', {
        event_category: 'engagement',
        event_label: action,
        custom_parameter_1: imageId || 'unknown',
        custom_parameter_2: window.location.pathname,
        value: 1
      });
    }

    // Store gallery interaction data
    const interactions = JSON.parse(localStorage.getItem('gallery_interactions') || '[]');
    interactions.push({
      action,
      imageId,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
    localStorage.setItem('gallery_interactions', JSON.stringify(interactions));
  };

  // Heat mapping functionality
  const trackMouseMovement = (e: MouseEvent) => {
    if (!enableHeatMapping) return;

    // Sample mouse movements (every 100ms to avoid performance issues)
    const now = Date.now();
    if (heatMapData.current.length === 0 || now - heatMapData.current[heatMapData.current.length - 1].timestamp > 100) {
      heatMapData.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: now
      });

      // Limit data points to prevent memory issues
      if (heatMapData.current.length > 1000) {
        heatMapData.current = heatMapData.current.slice(-500);
      }
    }
  };

  const trackClick = (e: MouseEvent) => {
    if (!enableHeatMapping) return;

    const clickData = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
      target: (e.target as Element)?.tagName || 'unknown',
      className: (e.target as Element)?.className || '',
      id: (e.target as Element)?.id || ''
    };

    // Store click data
    const clicks = JSON.parse(localStorage.getItem('heat_map_clicks') || '[]');
    clicks.push(clickData);
    localStorage.setItem('heat_map_clicks', JSON.stringify(clicks));

    // Track specific CTA clicks
    const target = e.target as Element;
    if (target.closest('[href="/contact"]')) {
      const ctaGoal = goals.find(g => g.id === 'booking_inquiry');
      if (ctaGoal) {
        trackConversion(ctaGoal, { click_position: { x: e.clientX, y: e.clientY } });
      }
    }
  };

  // Scroll tracking
  const trackScroll = () => {
    if (!enableScrollTracking) return;

    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    // Track scroll milestones
    const milestones = [25, 50, 75, 90];
    milestones.forEach(milestone => {
      if (scrollPercent >= milestone && !scrollTracked.current.has(milestone)) {
        scrollTracked.current.add(milestone);

        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'scroll_depth', {
            event_category: 'engagement',
            event_label: `${milestone}%`,
            value: milestone
          });
        }

        // Check for gallery engagement goal
        if (milestone >= 50) {
          const galleryGoal = goals.find(g => g.id === 'gallery_engagement');
          if (galleryGoal) {
            trackConversion(galleryGoal, { scroll_depth: milestone });
          }
        }
      }
    });
  };

  // Time tracking
  const trackTimeOnPage = () => {
    if (!enableTimeTracking) return;

    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
    const milestones = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m

    milestones.forEach(milestone => {
      if (timeSpent >= milestone && !timeTracked.current.has(milestone)) {
        timeTracked.current.add(milestone);

        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'time_on_page', {
            event_category: 'engagement',
            event_label: `${milestone}s`,
            value: milestone
          });
        }

        // Check for extended engagement goal
        if (milestone >= 60) {
          const timeGoal = goals.find(g => g.id === 'extended_engagement');
          if (timeGoal) {
            trackConversion(timeGoal, { time_spent: timeSpent });
          }
        }
      }
    });
  };

  useEffect(() => {
    // Initialize session
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }

    // Set up event listeners
    if (enableHeatMapping) {
      document.addEventListener('mousemove', trackMouseMovement);
      document.addEventListener('click', trackClick);
    }

    if (enableScrollTracking) {
      window.addEventListener('scroll', trackScroll);
    }

    // Set up time tracking interval
    let timeInterval: NodeJS.Timeout;
    if (enableTimeTracking) {
      timeInterval = setInterval(trackTimeOnPage, 1000);
    }

    // Track page view
    const pageViewGoal = goals.find(g => g.trigger === 'page_view');
    if (pageViewGoal && window.location.pathname === pageViewGoal.target) {
      trackConversion(pageViewGoal);
    }

    // Set up gallery interaction tracking
    const setupGalleryTracking = () => {
      const galleryImages = document.querySelectorAll('[data-gallery-image]');
      galleryImages.forEach((img, index) => {
        img.addEventListener('click', () => {
          trackGalleryInteraction('image_click', `image_${index}`);
        });
      });
    };

    // Delay gallery setup to ensure DOM is ready
    setTimeout(setupGalleryTracking, 1000);

    // Cleanup
    return () => {
      if (enableHeatMapping) {
        document.removeEventListener('mousemove', trackMouseMovement);
        document.removeEventListener('click', trackClick);
      }
      if (enableScrollTracking) {
        window.removeEventListener('scroll', trackScroll);
      }
      if (timeInterval) {
        clearInterval(timeInterval);
      }

      // Save heat map data before unmount
      if (heatMapData.current.length > 0) {
        const existingHeatMap = JSON.parse(localStorage.getItem('heat_map_data') || '[]');
        existingHeatMap.push(...heatMapData.current);
        localStorage.setItem('heat_map_data', JSON.stringify(existingHeatMap));
      }
    };
  }, [goals, enableHeatMapping, enableScrollTracking, enableTimeTracking]);

  // This component doesn't render anything visible
  return null;
}

// Analytics helper functions
export const getConversionAnalytics = () => {
  if (typeof window === 'undefined') return null;

  const conversions = JSON.parse(localStorage.getItem('photography_conversions') || '[]');
  const galleryInteractions = JSON.parse(localStorage.getItem('gallery_interactions') || '[]');
  const heatMapClicks = JSON.parse(localStorage.getItem('heat_map_clicks') || '[]');
  const heatMapData = JSON.parse(localStorage.getItem('heat_map_data') || '[]');

  return {
    conversions: {
      total: conversions.length,
      byGoal: conversions.reduce((acc: any, conv: any) => {
        acc[conv.event_label] = (acc[conv.event_label] || 0) + 1;
        return acc;
      }, {}),
      data: conversions
    },
    galleryEngagement: {
      total: galleryInteractions.length,
      byAction: galleryInteractions.reduce((acc: any, interaction: any) => {
        acc[interaction.action] = (acc[interaction.action] || 0) + 1;
        return acc;
      }, {}),
      data: galleryInteractions
    },
    heatMap: {
      clicks: heatMapClicks.length,
      movements: heatMapData.length,
      clickData: heatMapClicks,
      movementData: heatMapData
    }
  };
};

export const clearAnalyticsData = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('photography_conversions');
  localStorage.removeItem('gallery_interactions');
  localStorage.removeItem('heat_map_clicks');
  localStorage.removeItem('heat_map_data');
  localStorage.removeItem('cta-clicks');
};
