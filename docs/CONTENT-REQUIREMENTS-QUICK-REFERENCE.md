# Kiro Content Requirements – Quick Reference

**Last Updated:** November 23, 2025  
**Version:** 1.0

---

## 🎯 Core Principles

1. **UK English Only** – optimise, centre, colour, enquiries
2. **Active Voice** – "I build websites" not "Websites are built"
3. **Clear & Direct** – No exaggeration or unverifiable claims
4. **Professional Tone** – Cheshire-based digital specialist

---

## 📝 Required Content by Page

### Website Design Page

✅ **Must Include:**
- WCAG 2.1 accessibility statement (full version)
- Microsoft Clarity statement (long version)
- "Website design for Cheshire businesses"
- "Fast, mobile-first websites"
- "From £300"
- Secure cloud hosting mention
- Mobile-first design mention
- Local trust: "Based in Nantwich. Serving Cheshire East."

### Services Page

✅ **Must Include:**
- WCAG 2.1 accessibility statement (short version)
- Microsoft Clarity statement (short version)
- Local trust indicator

### Hosting Page

✅ **Must Include:**
- WCAG 2.1 accessibility statement (recommended)
- Microsoft Clarity statement (short version)
- "Secure cloud hosting"
- "Fast websites for Cheshire businesses"
- "Annual hosting from £120"
- Local trust indicator

### Analytics Page

✅ **Must Include:**
- Microsoft Clarity statement (long version)
- "GA4 and tracking setup"
- "Insight reporting"
- "Conversion tracking for Google Ads"
- Local trust indicator

### Free Audit Page

✅ **Must Include:**
- Hot-pink theme
- Testimonial carousel (Anna, Claire, Zach)
- Audit form with all fields
- GA4 events
- Google Ads conversion event
- Local trust indicator

---

## 📋 Standard Wording

### WCAG 2.1 Accessibility

**Full Version:**
> I follow WCAG 2.1 accessibility standards when building websites. This includes clear structure, readable text, strong colour contrast and accessible navigation across desktop and mobile.

**Short Version:**
> I follow WCAG 2.1 accessibility standards when building websites.

### Microsoft Clarity

**Long Version:**
> I use Microsoft Clarity to analyse how visitors interact with your website. This includes scroll depth, click patterns and areas of hesitation. I use this information to improve usability and support better conversion performance.

**Short Version:**
> I use Microsoft Clarity to review how visitors use your website and to improve the customer experience.

### Local Trust Indicator

> Based in Nantwich. Serving Cheshire East.

---

## 🎯 Approved CTAs

- Get a Free Website Quote
- Get Hosting Quote
- Get a Free Ads and Tracking Audit
- Start Your Free Audit

---

## 💰 Pricing

- **Website Design:** from £300
- **Hosting:** from £120 per year

---

## 👥 Testimonials

**Required on Free Audit Page:**
- Anna
- Claire
- Zach

All three must appear in testimonial carousel.

---

## 🔧 SCRAM Requirements

### Secure Cloud Hosting
**Pages:** Website Design, Hosting  
**Wording:** "secure cloud hosting"

### Mobile-First Design
**Pages:** Website Design  
**Wording:** "mobile-first" or "mobile-optimised"

### Structured, Modular Builds
**Pages:** Website Design  
**Wording:** "structured, modular builds"

### Analytics Credentials
**Pages:** Analytics  
**Wording:** GA4, tracking, conversion tracking

### WCAG 2.1 + Clarity
**Pages:** Website Design, Services, Hosting  
**Wording:** See standard wording above

### Clear Pricing
**Pages:** Website Design, Hosting  
**Wording:** "from £300" and "from £120"

---

## 🚫 Prohibited

- American spellings (optimize, center, color)
- Passive voice (unless necessary for clarity)
- Em dashes
- Exaggerated claims
- Unverifiable statistics
- Hallucinated content

---

## ✅ Above-the-Fold Checklist

Every service page must have:

1. ✅ Clear headline
2. ✅ Supporting subheadline
3. ✅ Approved CTA
4. ✅ Local trust indicator

---

## 🎨 Exit Intent Rules

- Only trigger after 5 seconds
- Don't re-trigger after dismissal
- Don't show after visiting `/free-audit`
- Use session storage keys:
  - `exit_intent_shown`
  - `exit_intent_dismissed`
  - `visited_audit_page`

---

## 🔍 Quick Validation

### UK English Check
```bash
node scripts/validate-content-requirements.js src/app/[page]/page.tsx
```

### Full Audit
```bash
node scripts/audit-content-compliance.js
```

### Update Page to Spec
```bash
node scripts/update-page-to-spec.js src/app/[page]/page.tsx
```

### Generate New Content
```bash
node scripts/create-content-from-spec.js websiteDesign
```

---

## 📊 Google Ads Message Match

### Website Design
- "Website design for Cheshire businesses"
- "Fast, mobile-first websites"
- "From £300"

### Analytics
- "GA4 and tracking setup"
- "Insight reporting"
- "Conversion tracking for Google Ads"

### Hosting
- "Secure cloud hosting"
- "Fast websites for Cheshire businesses"
- "Annual hosting from £120"

---

## 🎯 CRO Requirements

### Hero Section
- Headline (clear value proposition)
- Subheadline (supporting detail)
- CTA (approved wording)
- Local trust indicator

### Forms
- Name, email, phone, business name, URL, location
- GA4 event tracking
- Google Ads conversion tracking
- Same-day reply messaging

### Testimonials
- Anna, Claire, Zach available
- Carousel on Free Audit page
- Strategic placement on service pages

---

## 📱 Mobile Requirements

- Mobile-first design approach
- Responsive breakpoints tested
- Touch-friendly CTAs
- Readable text without zoom
- Fast loading on mobile networks

---

## 🔐 Security & Privacy

- Cookie banner implementation
- Privacy policy link in footer
- GDPR compliance
- Secure form submissions
- SSL/TLS encryption

---

## 📈 Analytics & Tracking

- GA4 implementation (G-QJXSCJ0L43)
- Microsoft Clarity integration
- Google Ads conversion tracking
- Event tracking on key actions
- Looker Studio dashboard integration

---

## 🚀 Deployment Checklist

Before deploying content updates:

1. ✅ Run UK English validation
2. ✅ Check WCAG 2.1 statements
3. ✅ Verify Microsoft Clarity wording
4. ✅ Confirm pricing accuracy
5. ✅ Test CTAs
6. ✅ Validate testimonials
7. ✅ Check local trust indicators
8. ✅ Review SCRAM compliance
9. ✅ Test mobile responsiveness
10. ✅ Verify GA4 events

---

## 📞 Support

For questions about content requirements:
- Review full specification: `kiro_content_requirements_master_updated.md`
- Run validation scripts in `scripts/` directory
- Check deployment summaries for examples

---

**Remember:** This is the single source of truth for all content decisions. When in doubt, refer to this guide.
