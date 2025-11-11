"use client";

import { useState, useEffect } from 'react';

export type ConsentStatus = 'accepted' | 'rejected' | null;

export function useCookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookieConsent') as ConsentStatus;
      setConsentStatus(consent);
      setIsLoading(false);
    }
  }, []);

  const updateConsent = (status: ConsentStatus) => {
    if (typeof window !== 'undefined') {
      if (status) {
        localStorage.setItem('cookieConsent', status);
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
      } else {
        localStorage.removeItem('cookieConsent');
        localStorage.removeItem('cookieConsentDate');
      }
      setConsentStatus(status);
    }
  };

  const hasAnalyticsConsent = consentStatus === 'accepted';
  const hasEssentialConsent = true; // Essential cookies are always allowed

  return {
    consentStatus,
    isLoading,
    hasAnalyticsConsent,
    hasEssentialConsent,
    updateConsent,
  };
}
