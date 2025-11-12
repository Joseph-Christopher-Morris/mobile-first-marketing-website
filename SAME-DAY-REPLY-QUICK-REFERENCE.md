# Same-Day Reply Copy - Quick Reference

## What Changed

All contact and enquiry forms now feature consistent same-day reply messaging that builds trust and sets clear expectations.

## Form Messages by Page

### Contact Page (Main)
**Message:** "I personally reply to all enquiries the same day between 8am and 6pm."  
**Location:** Hero section, after main heading

### General Contact Form
**Message:** "I'll get back to you personally the same day. No waiting around."  
**Location:** Below "Get in Touch" heading

### Website Hosting
**Message:** "Tell me a bit about your website plans, and I'll personally get back to you the same day with ideas and next steps."

### Website Design
**Message:** "Share your vision, and I'll reply personally the same day with feedback and a plan to get started."

### Photography
**Message:** "Let me know what you'd like to capture, and I'll get back to you the same day to plan your shoot."

### Data Analytics
**Message:** "Send over a few details about your data goals, and I'll personally reply the same day to discuss how I can help."

### Ad Campaigns
**Message:** "Tell me about your business goals, and I'll personally reply the same day with ideas to boost your reach."

### Services Page
**Message:** "Tell me a bit about your website plans, and I'll personally get back to you the same day with ideas and next steps."

## Tone Guidelines

✅ **Use:**
- Plain English
- "I" instead of "we"
- Confident, helpful language
- Clear time commitments
- Simple punctuation

❌ **Avoid:**
- Jargon or corporate speak
- Emojis
- Em dashes
- Vague promises
- Repetitive phrases

## Component Usage

### ServiceInquiryForm
```tsx
<ServiceInquiryForm
  serviceName="Website Hosting & Migration"
  formspreeId="xpwaqjqr"
  customMessage="Optional custom message here"
/>
```

The component automatically selects appropriate messaging based on service name if no custom message is provided.

## Quick Edits

To update a form message:

1. **General Contact:** Edit `src/components/sections/GeneralContactForm.tsx`
2. **Contact Page Hero:** Edit `src/app/contact/page.tsx`
3. **Service Forms:** Edit `src/components/ServiceInquiryForm.tsx`
4. **Services Page:** Edit `src/components/sections/ServicesContactSection.tsx`
5. **About Page:** Edit `src/components/AboutServicesForm.tsx`

## Testing

Visit these pages to verify:
- `/contact` - Main contact page
- `/services/hosting` - Hosting form
- `/services/ad-campaigns` - Ad campaigns form
- `/services/analytics` - Analytics form
- `/services` - Services page form
- `/about` - About page form

## Deployment Info

- **Deployment ID:** deploy-1762899139891
- **Files Updated:** 66
- **CloudFront Invalidation:** IBN8RFIAN33C1QKRCRZT8POVH2
- **Propagation Time:** 5-15 minutes

---

**Quick Tip:** The same-day reply commitment is now consistent across all forms, building trust and setting clear expectations for response times.
