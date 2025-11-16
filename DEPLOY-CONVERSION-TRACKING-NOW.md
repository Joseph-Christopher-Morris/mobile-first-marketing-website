# 🚀 Deploy Conversion Tracking NOW

## ⚡ 3-Step Deployment

### Step 1: Validate (30 seconds)
```powershell
node scripts/validate-conversion-tracking.js
```
**Expected:** All 24 checks pass ✅

### Step 2: Deploy (5 minutes)
```powershell
.\deploy-conversion-tracking-final.ps1
```
**Expected:** Build → S3 → CloudFront → Success ✅

### Step 3: Test (5 minutes)
1. Visit: https://d15sc9fc739ev2.cloudfront.net
2. Accept cookies
3. Submit form → redirects to /thank-you
4. Check Tag Assistant → conversion fires
5. Click phone → conversion fires

## ✅ What You Get

- **GA4 tracking** with consent mode
- **Google Ads conversions** (AW-17708257497)
- **Microsoft Clarity** session recordings
- **Thank you page** with conversion tracking
- **Phone click tracking** sitewide
- **Form redirects** to thank-you page

## 🎯 After Deployment

### Immediate (5 minutes)
- Test cookie banner
- Test form submission
- Test phone tracking
- Check Tag Assistant

### Within 1 hour
- Configure Google Ads conversions (manual)
- Add page-based conversion backup
- Add Call Extension

### Within 24-48 hours
- Verify "Recording conversions" status
- Check conversion data in dashboard
- Monitor for any issues

## 📋 Google Ads Setup (Manual)

1. **Go to:** Google Ads → Tools → Conversions
2. **Verify:** Event-based conversion `AW-17708257497/AtMkCIiD1r4bENmh-vtB`
3. **Add:** Page-based conversion (URL contains `/thank-you`)
4. **Add:** Call Extension with call reporting
5. **Set:** Primary conversion for bidding

## 🧪 Quick Test

```javascript
// 1. Accept cookies → Console should show:
gtag('consent', 'update', {
  analytics_storage: 'granted',
  ad_storage: 'granted'
})

// 2. Visit /thank-you → Console should show:
gtag('event', 'lead_form_submit', {...})
gtag('event', 'conversion', {send_to: 'AW-17708257497/...'})

// 3. Check sessionStorage:
sessionStorage.getItem('vmc_thankyou_conv_fired') // "1"
```

## 📞 Support

- **Issues?** Check `CONVERSION-TRACKING-FINAL-IMPLEMENTATION.md`
- **Quick ref?** Check `CONVERSION-TRACKING-QUICK-REFERENCE.md`
- **Troubleshooting?** Check troubleshooting section in docs

---

**Ready?** Run the deploy script now! 🚀
