# GA4 + Clarity + Looker Studio - Quick Start Guide

## 🎯 What's Integrated

- **GA4**: G-QJXSCJ0L43 (conversion tracking)
- **Clarity**: u4yftkmpxx (behavior insights)
- **Looker Studio**: Unified dashboard (manual setup required)

---

## ✅ Verification (5 minutes)

### 1. Check GA4
- Visit: https://analytics.google.com/analytics/web/#/realtime
- Browse your website
- ✅ See active users appear

### 2. Check Clarity
- Visit: https://clarity.microsoft.com/projects/view/u4yftkmpxx
- Wait 30-60 minutes after deployment
- ✅ See session recordings appear

### 3. Check Website Performance
```powershell
node scripts/validate-lighthouse-results.js
```
- ✅ Performance score > 90
- ✅ No console errors

---

## 📊 Build Looker Studio Dashboard (15 minutes)

### Step 1: Connect GA4
1. Go to [Looker Studio](https://lookerstudio.google.com/)
2. Create → Data Source → Google Analytics
3. Select property: G-QJXSCJ0L43
4. Connect

### Step 2: Connect Clarity
1. Go to [Clarity](https://clarity.microsoft.com/projects/view/u4yftkmpxx)
2. Settings → Export → Download CSV
3. Upload CSV to Looker Studio

### Step 3: Create Dashboard
1. Create → Report
2. Add GA4 data source
3. Add Clarity data source
4. Blend on "Page Path"

---

## 📈 Key Metrics to Track

### GA4
- Users, Sessions, Engagement Rate
- Form Submissions, CTA Clicks
- Traffic Sources, Device Types
- Geographic Location (Cheshire focus)

### Clarity
- Session Recordings
- Rage Clicks, Dead Clicks
- Scroll Depth
- Click Heatmaps

---

## 🚀 Deploy Now

```powershell
# Build and deploy
npm run build
.\deploy-copy-cta-optimization.ps1
```

---

## 🔍 Troubleshooting

**GA4 not tracking?**
- Check Measurement ID: G-QJXSCJ0L43
- Accept cookie consent
- Disable ad blockers

**Clarity not recording?**
- Wait 30-60 minutes
- Check Project ID: u4yftkmpxx
- Test in incognito mode

**Performance issues?**
- Both scripts load async
- Impact < 0.3s
- Monitor Core Web Vitals

---

## 📞 Support

**Business Hours**:
- Mon-Fri: 09:00-18:00
- Sat: 10:00-14:00
- Sun: 10:00-16:00

**Full Documentation**:
- `GA4-CLARITY-LOOKER-STUDIO-INTEGRATION.md`

---

**Ready to go!** 🎉
