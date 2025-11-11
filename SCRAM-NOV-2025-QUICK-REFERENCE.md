# SCRAM November 2025 - Quick Reference Guide

## 🎉 Deployment Complete!

**Status:** ✅ Live  
**URL:** https://d15sc9fc739ev2.cloudfront.net  
**QA Results:** 12/13 tests passed  

## 📋 What Changed

| Page | Changes |
|------|---------|
| **Website Hosting** | • Hero image: `hosting-migration-card.webp`<br>• Mobile phone: Required<br>• Removed duplicate savings image |
| **Website Design** | • Mobile phone: Required |
| **Ad Campaigns** | • Title: "My Work in Action"<br>• Metrics: "NYCC 35% increase" |
| **Analytics** | • No changes (uses percentages) |
| **About** | • Credentials: BBC News + Daily Mail<br>• Removed: Business Insider |
| **Footer** | • Added: Website Design & Development<br>• Updated: "Read our Privacy Policy" |
| **All Forms** | • Mobile phone: Required with UK validation |

## ✅ Quick Test URLs

Test these pages to verify changes:

1. **Website Hosting:** https://d15sc9fc739ev2.cloudfront.net/services/website-hosting
   - Check hero image
   - Test form with mobile phone

2. **Website Design:** https://d15sc9fc739ev2.cloudfront.net/services/website-design
   - Test form with mobile phone

3. **Ad Campaigns:** https://d15sc9fc739ev2.cloudfront.net/services/ad-campaigns
   - Check "My Work in Action" title
   - Check NYCC 35% metric

4. **About:** https://d15sc9fc739ev2.cloudfront.net/about
   - Check BBC News + Daily Mail
   - Check form has Website Design option

5. **PageSpeed:** https://pagespeed.web.dev/
   - Test any page for performance

## 🧪 Form Testing

### Valid UK Mobile Formats
- ✅ `07123 456789`
- ✅ `07123456789`
- ✅ `+44 7123 456789`
- ✅ `+447123456789`

### Invalid Formats (Should Fail)
- ❌ `123` (too short)
- ❌ `abc` (letters)
- ❌ `12345678901234` (too long)

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Performance (Mobile) | ≥ 85 | Test manually |
| Accessibility | ≥ 98 | Test manually |
| CLS | ≤ 0.02 | Monitor |
| LCP | < 1.9s | Monitor |

## 🔧 Troubleshooting

### If forms don't show mobile phone as required:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Wait 5-10 minutes for CloudFront propagation
3. Try incognito/private browsing mode

### If hero image doesn't update:
1. Hard refresh (Ctrl+F5)
2. Check image URL in browser dev tools
3. Wait for CloudFront cache to expire

### If content doesn't update:
1. Wait 5-15 minutes for global propagation
2. Check different geographic location
3. Verify deployment completed successfully

## 📞 Support Commands

```bash
# Re-run QA validation
node scripts/post-deployment-scram-qa.js

# Check deployment status
node scripts/deployment-health-check.js

# Rollback if needed
node scripts/rollback.js list
node scripts/rollback.js rollback <backup-id>
```

## 📈 Monitoring

### First 24 Hours
- Monitor Formspree for form submissions
- Check mobile phone numbers are captured
- Watch for any error reports

### First Week
- Review Google Analytics traffic
- Check form conversion rates
- Monitor PageSpeed scores

## ✅ Success Criteria

- [x] All files deployed to S3
- [x] 12/13 automated tests passed
- [ ] Manual form testing complete
- [ ] Mobile device testing complete
- [ ] PageSpeed validation complete
- [ ] 24-hour monitoring complete

## 🎯 Next Steps

1. **Now:** Complete manual testing checklist
2. **Today:** Test on mobile devices (Android + iPhone)
3. **Tomorrow:** Review first 24 hours of form submissions
4. **Next Week:** Analyze performance improvements

---

**Deployment ID:** deploy-1762701328743  
**Deployed:** 2025-11-09 15:17:24 UTC  
**Files Changed:** 63  
**Total Build Size:** 11.26 MB
