# GitHub Repository Upload Checklist

## 🚨 Current Issue: Missing `src/app` Directory

Your deployment is failing because Next.js can't find the `src/app` directory. This means your GitHub repository is missing essential files.

## 📁 Required Project Structure

Your GitHub repository MUST contain these directories and files:

```
mobile-first-marketing-website/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── about/
│   │   ├── contact/
│   │   ├── services/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   └── styles/
├── package.json
├── next.config.js
├── amplify.yml
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔧 How to Fix This

### Option 1: Check Your GitHub Repository
1. **Go to your GitHub repository**: https://github.com/Joseph-Christopher-Morris/mobile-first-marketing-website
2. **Check if the `src` folder exists**
3. **If missing, you need to upload your local project files**

### Option 2: Upload Missing Files
If your `src` directory is missing from GitHub:

1. **Zip your local `src` folder**
2. **Go to your GitHub repository**
3. **Click "Add file" > "Upload files"**
4. **Drag and drop your `src` folder**
5. **Commit the changes**

### Option 3: Create Minimal Required Files
If you don't have the files locally, create these essential files in your GitHub repository:

**1. Create `src/app/layout.tsx`:**
```tsx
import './globals.css'

export const metadata = {
  title: 'Marketing Website',
  description: 'Mobile-first marketing website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**2. Create `src/app/page.tsx`:**
```tsx
export default function Home() {
  return (
    <main>
      <h1>Welcome to Our Marketing Website</h1>
      <p>This is the homepage of our mobile-first marketing website.</p>
    </main>
  )
}
```

**3. Create `src/app/globals.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
```

## ✅ Verification Steps

After uploading the files:
1. **Check your repository has the `src/app` directory**
2. **Verify `src/app/layout.tsx` and `src/app/page.tsx` exist**
3. **Trigger a new deployment in AWS Amplify**
4. **Monitor the build logs**

## 🚀 Quick Fix Command

If you have access to your local files, the fastest fix is to ensure your entire project is uploaded to GitHub, including:
- All files in the `src/` directory
- `package.json`
- `next.config.js`
- `amplify.yml`
- `tailwind.config.js`
- `tsconfig.json`

The deployment should succeed once Next.js can find the `src/app` directory!