import React from 'react';
import { siteConfig } from '@/config/site';

// Google Analytics types
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | object,
      config?: object
    ) => void;
    dataLayer: any[];
  }
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface ConversionEvent {
  event_name: string;
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity?: number;
    price?: number;
  }>;
}

export class Analytics {
  private static isInitialized = false;
  private static debugMode = process.env.NODE_ENV === 'development';

  /**
   * Initialize Google Analytics
   */
  static initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    const gaId = siteConfig.analytics.googleAnalyticsId;
    if (!gaId) {
      if (this.debugMode) {
        console.warn('Google Analytics ID not configured');
      }
      return;
    }

    try {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };

      // Configure Google Analytics
      window.gtag('js', new Date());
      window.gtag('config', gaId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true,
        // Enhanced ecommerce and conversion tracking
        allow_enhanced_conversions: true,
        allow_google_signals: true,
        // Privacy settings
        anonymize_ip: true,
        respect_dnt: true,
      });

      this.isInitialized = true;

      if (this.debugMode) {
        console.log('Google Analytics initialized:', gaId);
      }
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  /**
   * Track page view
   */
  static trackPageView(url: string, title?: string): void {
    if (!this.isGoogleAnalyticsAvailable()) {
      return;
    }

    try {
      window.gtag('config', siteConfig.analytics.googleAnalyticsId!, {
        page_title: title || document.title,
        page_location: url,
        send_page_view: true,
      });

      if (this.debugMode) {
        console.log('Page view tracked:', { url, title });
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track custom event
   */
  static trackEvent(event: AnalyticsEvent): void {
    if (!this.isGoogleAnalyticsAvailable()) {
      if (this.debugMode) {
        console.log('Event would be tracked:', event);
      }
      return;
    }

    try {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters,
      });

      if (this.debugMode) {
        console.log('Event tracked:', event);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track conversion event
   */
  static trackConversion(conversion: ConversionEvent): void {
    if (!this.isGoogleAnalyticsAvailable()) {
      if (this.debugMode) {
        console.log('Conversion would be tracked:', conversion);
      }
      return;
    }

    try {
      window.gtag('event', conversion.event_name, {
        currency: conversion.currency || 'USD',
        value: conversion.value || 0,
        transaction_id: conversion.transaction_id,
        items: conversion.items,
      });

      if (this.debugMode) {
        console.log('Conversion tracked:', conversion);
      }
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }

  /**
   * Track form submission
   */
  static trackFormSubmission(
    formType: string,
    formData?: Record<string, any>
  ): void {
    this.trackEvent({
      action: 'form_submit',
      category: 'engagement',
      label: formType,
      custom_parameters: {
        form_type: formType,
        form_location: window.location.pathname,
        ...formData,
      },
    });

    // Also track as conversion
    this.trackConversion({
      event_name: 'generate_lead',
      value: this.getFormValue(formType),
      items: [
        {
          item_id: `form_${formType}`,
          item_name: `${formType} Form Submission`,
          category: 'lead_generation',
          quantity: 1,
          price: this.getFormValue(formType),
        },
      ],
    });
  }

  /**
   * Track button click
   */
  static trackButtonClick(
    buttonText: string,
    location: string,
    category = 'engagement'
  ): void {
    this.trackEvent({
      action: 'click',
      category,
      label: buttonText,
      custom_parameters: {
        button_text: buttonText,
        click_location: location,
        page_location: window.location.pathname,
      },
    });
  }

  /**
   * Track phone call
   */
  static trackPhoneCall(phoneNumber: string): void {
    this.trackEvent({
      action: 'phone_call',
      category: 'engagement',
      label: phoneNumber,
      custom_parameters: {
        phone_number: phoneNumber,
        call_location: window.location.pathname,
      },
    });

    // Track as conversion
    this.trackConversion({
      event_name: 'phone_call',
      value: 50, // Assign value to phone calls
      items: [
        {
          item_id: 'phone_call',
          item_name: 'Phone Call',
          category: 'lead_generation',
          quantity: 1,
          price: 50,
        },
      ],
    });
  }

  /**
   * Track email click
   */
  static trackEmailClick(emailAddress: string): void {
    this.trackEvent({
      action: 'email_click',
      category: 'engagement',
      label: emailAddress,
      custom_parameters: {
        email_address: emailAddress,
        email_location: window.location.pathname,
      },
    });

    // Track as conversion
    this.trackConversion({
      event_name: 'email_click',
      value: 25, // Assign value to email clicks
      items: [
        {
          item_id: 'email_click',
          item_name: 'Email Click',
          category: 'lead_generation',
          quantity: 1,
          price: 25,
        },
      ],
    });
  }

  /**
   * Track service interest
   */
  static trackServiceInterest(serviceName: string, action: string): void {
    this.trackEvent({
      action,
      category: 'service_interest',
      label: serviceName,
      custom_parameters: {
        service_name: serviceName,
        interest_type: action,
        page_location: window.location.pathname,
      },
    });
  }

  /**
   * Track scroll depth
   */
  static trackScrollDepth(percentage: number): void {
    // Only track at specific milestones
    const milestones = [25, 50, 75, 90, 100];
    if (!milestones.includes(percentage)) {
      return;
    }

    this.trackEvent({
      action: 'scroll',
      category: 'engagement',
      label: `${percentage}%`,
      value: percentage,
      custom_parameters: {
        scroll_depth: percentage,
        page_location: window.location.pathname,
      },
    });
  }

  /**
   * Track time on page
   */
  static trackTimeOnPage(seconds: number): void {
    // Track time milestones
    const milestones = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    if (!milestones.includes(seconds)) {
      return;
    }

    this.trackEvent({
      action: 'time_on_page',
      category: 'engagement',
      label: `${seconds}s`,
      value: seconds,
      custom_parameters: {
        time_seconds: seconds,
        page_location: window.location.pathname,
      },
    });
  }

  /**
   * Track Core Web Vitals
   */
  static trackWebVitals(metric: {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  }): void {
    this.trackEvent({
      action: 'web_vitals',
      category: 'performance',
      label: metric.name,
      value: Math.round(metric.value),
      custom_parameters: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        page_location: window.location.pathname,
      },
    });
  }

  /**
   * Track user engagement score
   */
  static trackEngagementScore(score: number, factors: string[]): void {
    this.trackEvent({
      action: 'engagement_score',
      category: 'user_behavior',
      label: `Score: ${score}`,
      value: score,
      custom_parameters: {
        engagement_score: score,
        engagement_factors: factors.join(','),
        page_location: window.location.pathname,
      },
    });
  }

  /**
   * Check if Google Analytics is available
   */
  private static isGoogleAnalyticsAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.gtag === 'function' &&
      !!siteConfig.analytics.googleAnalyticsId
    );
  }

  /**
   * Get estimated value for form type
   */
  private static getFormValue(formType: string): number {
    const formValues: Record<string, number> = {
      general_contact: 75,
      service_inquiry: 150,
      photography: 200,
      analytics: 300,
      ad_campaigns: 500,
    };

    return formValues[formType] || 100;
  }
}

/**
 * Hook for tracking page views in Next.js
 */
export function usePageTracking() {
  if (typeof window !== 'undefined') {
    // Initialize analytics on first load
    Analytics.initialize();

    // Track initial page view
    Analytics.trackPageView(window.location.href);
  }
}

/**
 * Higher-order component for analytics tracking
 */
export function withAnalytics<T extends object>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> {
  return function AnalyticsWrapper(props: T) {
    // Initialize analytics when component mounts
    React.useEffect(() => {
      Analytics.initialize();
    }, []);

    return <WrappedComponent {...props} />;
  };
}

// Export the Analytics class as default
export default Analytics;
