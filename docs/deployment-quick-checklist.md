# 🚀 AWS Deployment Quick Checklist

## ✅ Pre-Deployment (COMPLETED)
- [x] Project builds successfully
- [x] Environment variables validated
- [x] amplify.yml configured
- [x] All deployment scripts ready

## 📋 Step 2: AWS Amplify Setup (DO NOW)

### 🔗 2.1 GitHub Setup (5 minutes)
- [ ] Go to [GitHub.com](https://github.com) and create new repository
- [ ] Name: `mobile-first-marketing-website`
- [ ] Upload all project files (drag & drop entire folder)
- [ ] ⚠️ **EXCLUDE**: `node_modules/`, `.next/`, `.env.local`, `.env.production`
- [ ] ✅ **INCLUDE**: `amplify.yml`, `package.json`, `src/`, `public/`, `content/`

### ☁️ 2.2 AWS Amplify Console (10 minutes)
- [ ] Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [ ] Click "New app" → "Host web app"
- [ ] Choose "GitHub" and authorize
- [ ] Select your repository and `main` branch
- [ ] Verify `amplify.yml` is detected

### ⚙️ 2.3 Environment Variables (5 minutes)
**Add these in Amplify Console:**
```
NEXT_PUBLIC_SITE_URL = https://main.xxxxxx.amplifyapp.com
NEXT_PUBLIC_SITE_NAME = Your Marketing Website  
CONTACT_EMAIL = contact@yourdomain.com
NODE_ENV = production
```

### 🚀 2.4 Deploy (10 minutes)
- [ ] Click "Save and deploy"
- [ ] Monitor build progress
- [ ] Wait for "Deployed" status
- [ ] Test the provided URL

## 🎯 Expected Results
- ✅ Home page loads
- ✅ About page works
- ✅ Services pages work
- ✅ Contact page works
- ⚠️ Blog pages may have issues (fixable later)

## 🆘 If Something Goes Wrong
1. Check build logs in Amplify Console
2. Verify environment variables are set
3. Ensure `amplify.yml` is in repository root
4. Review troubleshooting guide: `docs/troubleshooting-guide.md`

---

**Total Time Estimate: 30 minutes**
**Current Status: Ready to start Step 2.1** 🚀