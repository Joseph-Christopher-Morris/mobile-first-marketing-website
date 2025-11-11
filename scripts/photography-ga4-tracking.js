// Photography Page GA4 Conversion Tracking
// Add this to your photography page component

// Track gallery interactions
function trackGalleryInteraction(imageType, position, section) {
  gtag('event', 'photography_gallery_interaction', {
    image_type: imageType,
    image_position: position,
    gallery_section: section,
    page_location: window.location.href
  });
}

// Track CTA clicks
function trackCTAClick(ctaType, ctaText, section) {
  gtag('event', 'photography_cta_click', {
    cta_type: ctaType,
    cta_text: ctaText,
    page_section: section,
    page_location: window.location.href
  });
}

// Track contact form views
function trackContactFormView(referrerSection, timeOnPage) {
  gtag('event', 'photography_contact_view', {
    referrer_section: referrerSection,
    time_on_page: timeOnPage,
    page_location: window.location.href
  });
}

// Track booking inquiries
function trackBookingInquiry(inquiryType, completionTime) {
  gtag('event', 'photography_booking_inquiry', {
    inquiry_type: inquiryType,
    form_completion_time: completionTime,
    page_location: window.location.href,
    value: 100 // Conversion value
  });
}

// Track credibility indicator interactions
function trackCredibilityView(publication, interactionType) {
  gtag('event', 'photography_credibility_view', {
    publication: publication,
    interaction_type: interactionType,
    page_location: window.location.href
  });
}

// Track local content engagement
function trackLocalEngagement(contentType, duration) {
  gtag('event', 'photography_local_engagement', {
    content_type: contentType,
    engagement_duration: duration,
    page_location: window.location.href
  });
}

// Auto-track scroll depth
let maxScrollDepth = 0;
window.addEventListener('scroll', () => {
  const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  if (scrollDepth > maxScrollDepth) {
    maxScrollDepth = scrollDepth;
    if (scrollDepth >= 25 && scrollDepth < 50) {
      gtag('event', 'scroll_depth_25', { page_location: window.location.href });
    } else if (scrollDepth >= 50 && scrollDepth < 75) {
      gtag('event', 'scroll_depth_50', { page_location: window.location.href });
    } else if (scrollDepth >= 75) {
      gtag('event', 'scroll_depth_75', { page_location: window.location.href });
    }
  }
});

// Track time on page
let startTime = Date.now();
window.addEventListener('beforeunload', () => {
  const timeOnPage = Math.round((Date.now() - startTime) / 1000);
  gtag('event', 'page_engagement_time', {
    engagement_time: timeOnPage,
    page_location: window.location.href
  });
});