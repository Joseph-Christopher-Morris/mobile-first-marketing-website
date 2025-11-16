# Conversion Tracking Quick Reference

## 🚀 Deploy Now

```powershell
.\deploy-conversion-tracking-final.ps1
```

## ✅ What's Included

### Tracking Tags
- **GA4:** G-QJXSCJ0L43 (with consent mode)
- **Google Ads:** AW-17708257497/AtMkCIiD1r4bENmh-vtB
- **Clarity:** u4yftkmpxx

### Consent Mode
- Default: `denied` for analytics_storage and ad_storage
- On accept: `granted` for both

### Thank You Page
- URL: `/thank-you`
- Metadata: noindex, proper canonical
- Conversion: Fires once per session
- Business hours displayed

### Phone Tracking
- Utility: `src/lib/trackPhone.ts`
- Fires on: Sticky CTA, contact page, all phone links
- Event: `phone_click` + conversion

### Form Redirects
- All forms redirect to `/thank-you` after submission
- Hidden input: `<input type="hidden" name="_redirect" value="https://vividmediacheshire.com/thank-you">`

## 🧪 Testing (5 minutes)

1. **Clear cache and cookies**
2. **Visit site** → Cookie banner appears
3. **Accept cookies** → Check console for consent update
4. **Submit form** → Redirects to /thank-you
5. **Check Tag Assistant** → GA4 + Ads tags, conversion event
6. **Click phone link** → Conversion fires
7. **Refresh /thank-you** → Conversion doesn't fire again (duplicate guard)

## 🎯 Google Ads Setup (Manual)

1. Go to **Google Ads → Tools → Conversions**
2. Verify event-based conversion: `AW-17708257497/AtMkCIiD1r4bENmh-vtB`
3. Add page-based conversion: URL contains `/thank-you`
4. Add Call Extension with call reporting
5. Set Primary conversion for bidding
6. Wait for "Recording conversions" status

## 📊 Validation

### Tag Assistant
- GA4 tag loads ✓
- Google Ads tag loads ✓
- Conversion event fires on /thank-you ✓
- No errors ✓

### Console Check
```javascript
// After accepting cookies:
gtag('consent', 'update', {
  analytics_storage: 'granted',
  ad_storage: 'granted'
})

// On thank-you page:
gtag('event', 'lead_form_submit', {...})
gtag('event', 'conversion', {send_to: 'AW-17708257497/...'})
```

### SessionStorage
```javascript
// Should exist after first conversion:
sessionStorage.getItem('vmc_thankyou_conv_fired') // "1"
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Conversion fires multiple times | Check sessionStorage, clear and test |
| Form doesn't redirect | Verify `_redirect` hidden input exists |
| Phone tracking not working | Check trackPhone import and onClick handler |
| Ads not recording | Wait 24-48 hours, verify consent granted |

## 📁 Files Changed

### Created
- `src/lib/trackPhone.ts`

### Modified
- `src/app/layout.tsx` (tracking tags)
- `src/app/thank-you/page.tsx` (metadata)
- `src/components/CookieBanner.tsx` (consent grant)
- `src/components/StickyCTA.tsx` (phone tracking)
- `src/app/contact/page.tsx` (phone tracking)
- All form components (redirect)

## 🎯 Success Criteria

- [ ] Cookie banner works
- [ ] Consent grants both storages
- [ ] Forms redirect to /thank-you
- [ ] Conversion fires once per session
- [ ] Phone clicks tracked
- [ ] Tag Assistant shows no errors
- [ ] Google Ads shows "Recording conversions"

## 📞 Support

- **Google Ads:** https://support.google.com/google-ads
- **GA4:** https://support.google.com/analytics
- **Tag Assistant:** https://tagassistant.google.com

---

**Ready to deploy!** 🚀
