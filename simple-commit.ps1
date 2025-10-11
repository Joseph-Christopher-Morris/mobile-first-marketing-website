Write-Host "🚀 Committing Website Changes..." -ForegroundColor Cyan

# Add key files
git add src/
git add content/
git add public/
git add scripts/
git add .kiro/
git add package.json
git add next.config.js
git add README.md

# Create commit
$message = "🎉 Website Image & Navigation Fixes - Production Ready

✅ Fixed Issues:
- Removed desktop hamburger menu (mobile-only now)
- Fixed all image loading issues across site
- Service cards now display correct images
- Blog preview images loading properly
- About page hero image working

🚀 Deployment: Successfully deployed to S3 + CloudFront
🌐 Live Site: https://d15sc9fc739ev2.cloudfront.net/"

git commit -m $message

Write-Host "✅ Changes committed!" -ForegroundColor Green
Write-Host "💡 Next: Push to GitHub with 'git push'" -ForegroundColor Yellow