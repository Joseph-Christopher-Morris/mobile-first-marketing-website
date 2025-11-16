# Google Ads Conversion Tracking - Quick Reference

## Conversion Details
- **Google Ads ID**: AW-17708257497
- **Conversion Label**: AtMkCIiD1r4bENmh-vtB
- **Conversion Action**: Form submissions and phone clicks

## Key Files

### Thank You Page
- `src/app/thank-you/page.tsx` - Main thank you page
- `src/app/thank-you/Conversion.tsx` - Conversion tracking component

### Utilities
- `src/utils/trackPhone.ts` - Phone click tracking function

### Forms (All redirect to /thank-you)
- `src/components/sections/TrackedContactForm.tsx`
- `src/components/sections/GeneralContactForm.tsx`
- `src/components/ServiceInquiryForm.tsx`
- `src/components/AboutServicesForm.tsx`

## Quick Test

### Test Locally
```bash
npm run dev
```
Then visit: http://localhost:3000/test-conversion-tracking.html

### Test Form Submission
1. Go to any page with a form
2. Fill out and submit
3. Should redirect to `/thank-you`
4. Open DevTools > Console
5. Look for conversion events

### Test Phone Click
1. Go to homepage
2. Scroll down to see sticky CTA
3. Click "Call Joe"
4. Open DevTools > Console
5. Look for conversion events

## Deploy
```powershell
.\deploy-google-ads-conversion.ps1
```

## Verify in Google Ads
1. Go to: https://ads.google.com
2. Tools > Conversions
3. Find: AtMkCIiD1r4bENmh-vtB
4. Check status: "Recording conversions"

## Verify in GA4
1. Go to: https://analytics.google.com
2. Reports > Realtime
3. Look for events:
   - `lead_form_submit`
   - `phone_click`

## Troubleshooting

### Conversions Not Tracking
1. Check browser console for errors
2. Verify gtag is loaded: `typeof window.gtag === 'function'`
3. Clear sessionStorage: `sessionStorage.clear()`
4. Check Google Tag Assistant extension

### Forms Not Redirecting
1. Check Formspree submission success
2. Verify redirect URL is correct
3. Check browser console for errors
4. Test with different browsers

### Phone Clicks Not Tracking
1. Verify `trackPhoneClick()` is imported
2. Check onClick handler is attached
3. Verify gtag is loaded
4. Check browser console for events

## Important Notes
- Thank you page is noindex (won't appear in search)
- Conversions fire once per session (sessionStorage)
- Phone tracking works on all tel: links with handler
- All forms redirect to same thank you page
- Conversion appears in Google Ads within 24 hours

## Support
If issues persist:
1. Check `GOOGLE-ADS-CONVERSION-TRACKING-COMPLETE.md` for full details
2. Test with `test-conversion-tracking.html`
3. Verify Google Ads tag in browser DevTools
4. Check Google Ads conversion status page
