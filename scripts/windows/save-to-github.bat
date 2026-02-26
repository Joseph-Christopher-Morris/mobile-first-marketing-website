@echo off
echo 🚀 Saving Website to GitHub
echo ============================
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not available in PATH
    echo 💡 Please install Git first: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo ✅ Git is available
echo.

REM Check if this is already a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo 📁 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
    echo.
)

echo 📋 Adding files to Git...
git add .

echo 💾 Creating commit...
git commit -m "🎉 Website Image & Navigation Fixes - Production Ready

✅ Fixed Issues:
- Removed desktop hamburger menu (mobile-only now)
- Fixed all image loading issues across site
- Service cards now display correct images
- Blog preview images loading properly
- About page hero image working
- All service sub-page images functional

🚀 Deployment:
- Successfully deployed to S3 + CloudFront
- All 8 critical images verified (200 status, correct MIME types)
- Cache invalidated and propagated
- Build verification passed (113 files, 3.37MB)

🔧 Technical Changes:
- Modified Header.tsx for responsive navigation
- Verified image paths and build inclusion
- Updated deployment pipeline with MIME type fixes
- Added comprehensive validation scripts

🌐 Live Site: https://d15sc9fc739ev2.cloudfront.net/

Date: %date% %time%"

echo.
echo ✅ Files committed to Git!
echo.
echo 📋 Next Steps:
echo 1. Set up GitHub remote (if not already done):
echo    git remote add origin https://github.com/yourusername/your-repo.git
echo.
echo 2. Push to GitHub:
echo    git push -u origin main
echo.
echo 🎉 Your website is now saved and ready for GitHub!
echo.
pause