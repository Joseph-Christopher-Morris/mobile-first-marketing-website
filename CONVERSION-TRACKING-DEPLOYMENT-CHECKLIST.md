# Google Ads Conversion Tracking - Deployment Checklist

## Pre-Deployment Validation

### 1. Run Validation Script
```bash
node scripts/validate-conversion-tracking.js
```
- [ ] All checks pass (12/12)
- [ ] No failed checks
- [ ] No warnings

### 2. Local Testing
```bash
npm run dev
```
- [ ] Visit http://localhost:3000/thank-you
- [ ] Page loads without errors
- [ ] No console errors
- [ ] Conversion component renders

### 3. Test Forms Locally
- [ ] Test contact form submission
- [ ] Test service inquiry form
- [ ] Test about services form
- [ ] All forms redirect to /thank-you

### 4. Test Phone Tracking
- [ ] Click phone link in sticky CTA
- [ ] Check console for conversion event
- [ ] Verify no errors

## Build and Deploy

### 5. Build the Site
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] Output directory created

### 6. Deploy to Production
```powershell
.\deploy-google-ads-conversion.ps1
```
- [ ] Deployment script runs successfully
- [ ] Files uploaded to S3
- [ ] CloudFront invalidation triggered
- [ ] No deployment errors

## Post-Deployment Testing

### 7. Test Live Site - Forms
- [ ] Visit live site contact page
- [ ] Fill out and submit form
- [ ] Redirects to /thank-you
- [ ] Thank you page loads correctly
- [ ] No console errors

### 8. Test Live Site - Phone
- [ ] Visit live site homepage
- [ ] Scroll to see sticky CTA
- [ ] Click "Call Joe" button
- [ ] Phone dialer opens
- [ ] Check console for conversion event

### 9. Verify with Browser Tools
- [ ] Open Chrome DevTools
- [ ] Go to Network tab
- [ ] Submit a form
- [ ] See requests to google-analytics.com
- [ ] See requests to googletagmanager.com

### 10. Test with Google Tag Assistant
- [ ] Install Google Tag Assistant extension
- [ ] Visit live site
- [ ] Submit a form
- [ ] Tag Assistant shows conversion event
- [ ] No tag errors reported

## Google Ads Verification

### 11. Check Conversion Status
- [ ] Log into Google Ads
- [ ] Go to Tools > Conversions
- [ ] Find conversion: AtMkCIiD1r4bENmh-vtB
- [ ] Status shows "Recording conversions"

### 12. Monitor First Conversions
- [ ] Wait 24 hours
- [ ] Check conversion count
- [ ] Verify conversions are being recorded
- [ ] Check conversion value (if applicable)

### 13. Set Up Conversion Action
- [ ] Set as primary conversion action
- [ ] Configure conversion value (if needed)
- [ ] Set up conversion tracking in campaigns
- [ ] Adjust bidding strategy if needed

## GA4 Verification

### 14. Check GA4 Events
- [ ] Log into GA4
- [ ] Go to Reports > Realtime
- [ ] Submit a test form
- [ ] See lead_form_submit event
- [ ] Click phone link
- [ ] See phone_click event

### 15. Set Up GA4 Reports
- [ ] Create conversion report
- [ ] Add lead_form_submit to conversions
- [ ] Add phone_click to conversions
- [ ] Set up custom dashboard

## Monitoring Setup

### 16. Set Up Alerts
- [ ] Create alert for conversion drops
- [ ] Set up daily conversion report
- [ ] Configure email notifications
- [ ] Set up Slack notifications (optional)

### 17. Document Baseline Metrics
- [ ] Record initial conversion rate
- [ ] Document average conversions per day
- [ ] Note cost per conversion
- [ ] Save baseline for comparison

## Final Checks

### 18. SEO Verification
- [ ] Thank you page is noindex
- [ ] Thank you page not in sitemap
- [ ] No broken links
- [ ] All forms work correctly

### 19. Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile devices

### 20. Documentation
- [ ] Update team documentation
- [ ] Share conversion tracking guide
- [ ] Document any issues found
- [ ] Create runbook for troubleshooting

## Rollback Plan (If Needed)

### If Issues Occur
1. Check browser console for errors
2. Verify Google Ads tag is loading
3. Test with Tag Assistant
4. Check Formspree submissions
5. Review CloudFront logs
6. If critical, rollback deployment:
   ```bash
   node scripts/rollback.js
   ```

## Success Criteria

### Deployment is successful when:
- [ ] All forms redirect to thank you page
- [ ] Thank you page fires conversion event
- [ ] Phone clicks fire conversion event
- [ ] No console errors on any page
- [ ] Google Ads shows "Recording conversions"
- [ ] GA4 shows conversion events
- [ ] No increase in bounce rate
- [ ] No decrease in form submissions

## Timeline

- **Day 1**: Deploy and test
- **Day 2-3**: Monitor conversions
- **Day 4-7**: Verify conversion accuracy
- **Week 2**: Optimize based on data

## Support Contacts

- **Google Ads Support**: https://support.google.com/google-ads
- **GA4 Support**: https://support.google.com/analytics
- **Formspree Support**: https://help.formspree.io

## Notes

- Conversions may take up to 24 hours to appear in Google Ads
- SessionStorage prevents duplicate conversions on page reload
- Thank you page is noindex to prevent SEO issues
- All forms use the same thank you page for consistency
- Phone tracking works on all tel: links with handler

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Verified By**: _______________
**Sign-off**: _______________
