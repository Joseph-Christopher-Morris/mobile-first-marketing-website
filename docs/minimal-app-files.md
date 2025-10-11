# Minimal Next.js App Files for Immediate Fix

## 🚀 Quick Fix: Create These Files in Your GitHub Repository

If your `src/app` directory is missing, create these files directly in your
GitHub repository:

### 1. Create `src/app/layout.tsx`

```tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketing Website',
  description:
    'Mobile-first marketing website showcasing photography, analytics, and ad campaign services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='min-h-screen bg-white text-gray-900'>{children}</body>
    </html>
  );
}
```

### 2. Create `src/app/page.tsx`

```tsx
export default function Home() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-8'>
      <div className='max-w-4xl mx-auto text-center'>
        <h1 className='text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          Welcome to Our Marketing Website
        </h1>
        <p className='text-xl md:text-2xl text-gray-600 mb-8'>
          Mobile-first marketing website showcasing photography, analytics, and
          ad campaign services
        </p>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-12'>
          <div className='p-6 border rounded-lg shadow-sm'>
            <h2 className='text-xl font-semibold mb-3'>Photography</h2>
            <p className='text-gray-600'>
              Professional photography services for your marketing needs
            </p>
          </div>
          <div className='p-6 border rounded-lg shadow-sm'>
            <h2 className='text-xl font-semibold mb-3'>Analytics</h2>
            <p className='text-gray-600'>
              Data-driven insights to optimize your campaigns
            </p>
          </div>
          <div className='p-6 border rounded-lg shadow-sm'>
            <h2 className='text-xl font-semibold mb-3'>Ad Campaigns</h2>
            <p className='text-gray-600'>
              Strategic advertising campaigns that deliver results
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
```

### 3. Create `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

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

a {
  color: inherit;
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}
```

### 4. Create `src/app/about/page.tsx`

```tsx
export default function About() {
  return (
    <main className='min-h-screen p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold mb-6'>About Us</h1>
        <p className='text-lg text-gray-600 mb-4'>
          We are a mobile-first marketing agency specializing in photography,
          analytics, and ad campaigns.
        </p>
        <p className='text-lg text-gray-600'>
          Our team delivers results-driven marketing solutions for businesses of
          all sizes.
        </p>
      </div>
    </main>
  );
}
```

### 5. Create `src/app/services/page.tsx`

```tsx
export default function Services() {
  return (
    <main className='min-h-screen p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold mb-6'>Our Services</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div className='p-6 border rounded-lg'>
            <h2 className='text-2xl font-semibold mb-3'>Photography</h2>
            <p className='text-gray-600'>
              Professional photography services for marketing materials.
            </p>
          </div>
          <div className='p-6 border rounded-lg'>
            <h2 className='text-2xl font-semibold mb-3'>Analytics</h2>
            <p className='text-gray-600'>
              Comprehensive analytics and reporting services.
            </p>
          </div>
          <div className='p-6 border rounded-lg'>
            <h2 className='text-2xl font-semibold mb-3'>Ad Campaigns</h2>
            <p className='text-gray-600'>
              Strategic advertising campaign management.
            </p>
          </div>
          <div className='p-6 border rounded-lg'>
            <h2 className='text-2xl font-semibold mb-3'>Consulting</h2>
            <p className='text-gray-600'>
              Marketing strategy and consulting services.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
```

### 6. Create `src/app/contact/page.tsx`

```tsx
export default function Contact() {
  return (
    <main className='min-h-screen p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold mb-6'>Contact Us</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div>
            <h2 className='text-2xl font-semibold mb-4'>Get in Touch</h2>
            <p className='text-gray-600 mb-4'>
              Ready to take your marketing to the next level? Contact us today.
            </p>
            <div className='space-y-2'>
              <p>
                <strong>Email:</strong> contact@yoursite.com
              </p>
              <p>
                <strong>Phone:</strong> (555) 123-4567
              </p>
              <p>
                <strong>Address:</strong> 123 Marketing St, City, State 12345
              </p>
            </div>
          </div>
          <div>
            <form className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Name</label>
                <input type='text' className='w-full p-2 border rounded' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Email</label>
                <input type='email' className='w-full p-2 border rounded' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Message
                </label>
                <textarea
                  rows={4}
                  className='w-full p-2 border rounded'
                ></textarea>
              </div>
              <button
                type='submit'
                className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
```

## 📋 How to Add These Files:

1. **Go to your GitHub repository**
2. **Click "Create new file"**
3. **Type the file path** (e.g., `src/app/layout.tsx`)
4. **Paste the code** from above
5. **Commit the file**
6. **Repeat for each file**

Once all files are created, your deployment should succeed!
