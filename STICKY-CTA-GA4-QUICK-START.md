# Sticky CTA & GA4 Tracking - Quick Start Guide

## 🚀 Deploy Now

```powershell
.\deploy-sticky-cta-ga4.ps1
```

**Or:**

```bash
node scripts/deploy-sticky-cta-ga4.js
```

---

## ✅ What You Get

### Context-Aware CTAs
Each page shows a relevant call-to-action:
- **Home:** "Get Started"
- **Hosting:** "Get Hosting Quote"
- **Design:** "Build My Website"
- **Photography:** "Book Your Shoot"
- **Analytics:** "View My Data Options"
- **Ad Campaigns:** "Start My Campaign"

### GA4 Event Tracking
Three new events automatically tracked:
1. **sticky_cta_click** - When users click the CTA
2. **cta_form_input** - When users fill form fields
3. **lead_form_submit** - When users submit forms

---

## 📊 After Deployment

### 1. Test the CTA (2 minutes)
- Visit https://d15sc9fc739ev2.cloudfront.net
- Scroll down 300px
- Click the sticky CTA button
- Verify it scrolls to contact form

### 2. Check GA4 Events (5 minutes)
1. Go to GA4 → **Reports → Realtime**
2. Click the sticky CTA on your site
3. See `sticky_cta_click` event appear
4. Fill out a form field
5. See `cta_form_input` event appear
6. Submit the form
7. See `lead_form_submit` event appear

### 3. Mark as Conversion (2 minutes)
1. Go to GA4 → **Admin → Events**
2. Find `lead_form_submit`
3. Toggle **Mark as conversion** ON
4. Done!

### 4. Import to Google Ads (5 minutes)
1. Go to Google Ads → **Tools → Conversions**
2. Click **+ New conversion action**
3. Select **Import → Google Analytics 4**
4. Choose `lead_form_submit`
5. Set value and category
6. Save

---

## 🎯 Expected Results

### Immediate
- ✅ Sticky CTA appears on all pages
- ✅ Events show in GA4 Realtime
- ✅ Form submissions tracked

### Within 24 Hours
- 📈 Conversion data in GA4
- 📊 Service attribution visible
- 🎯 Google Ads optimization starts

### Within 1 Week
- 💰 Better ad performance
- 📉 Lower cost per lead
- 📈 Higher conversion rates

---

## 🔧 Troubleshooting

### CTA Not Showing?
- Scroll down more than 300px
- Check browser console for errors
- Clear cache and reload

### Events Not in GA4?
- Wait 5-10 minutes for processing
- Check cookie consent is granted
- Disable ad blockers for testing

### Form Not Submitting?
- Check Formspree endpoint (xvgvkbjb)
- Verify network requests in DevTools
- Check for JavaScript errors

---

## 📞 Need Help?

**Documentation:**
- Full guide: `STICKY-CTA-GA4-IMPLEMENTATION-COMPLETE.md`
- Implementation plan: `docs/vmc-sticky-cta-and-ga4-plan.md`

**Testing:**
- Run tests: `node scripts/test-sticky-cta-ga4.js`

---

## 🎉 Success Checklist

- [ ] Deployed to production
- [ ] CTA appears on all pages
- [ ] Events show in GA4 Realtime
- [ ] Conversion marked in GA4
- [ ] Conversion imported to Google Ads
- [ ] Mobile tested and working

**Time to complete:** ~20 minutes  
**Impact:** High - Better conversion tracking and ad optimization
