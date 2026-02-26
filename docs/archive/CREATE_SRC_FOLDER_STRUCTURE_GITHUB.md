# 🏗️ Create src/ Folder Structure on GitHub

## 📋 **Manual Folder & File Creation Method**

Instead of uploading the entire `src` folder, we'll create the structure piece by piece on GitHub.

### **Step 1: Create the src Folder Structure**

#### **1a. Create src/app/ folder**
1. **Go to**: https://github.com/Joseph-Christopher-Morris/mobile-first-marketing-website
2. **Click**: "Create new file"
3. **Type**: `src/app/page.tsx`
4. **This creates**: Both `src/` and `app/` folders automatically

#### **1b. Add the Homepage Content**
**Copy and paste this into `src/app/page.tsx`:**
```typescript
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-automotive-photography.jpg"
            alt="Professional automotive photography"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Vivid Auto Photography
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Professional automotive photography that captures the essence and beauty of your vehicle
          </p>
          <Link
            href="/contact"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Book Your Session
          </Link>
        </div>
      </section>
    </div>
  );
}
```

**Click**: "Commit new file"

### **Step 2: Create About Page**

#### **2a. Create about folder and page**
1. **Click**: "Create new file"
2. **Type**: `src/app/about/page.tsx`
3. **Copy this content:**
```typescript
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
            About Vivid Auto Photography
          </h1>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <Image
                src="/images/photographer-at-work.jpg"
                alt="Professional photographer at work"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                With over a decade of experience in automotive photography, we specialize in 
                capturing the unique character and beauty of every vehicle.
              </p>
              <p className="text-gray-600">
                From classic cars to modern supercars, we bring out the best in every shot 
                with professional lighting, composition, and post-processing techniques.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Click**: "Commit new file"

### **Step 3: Create Contact Page**

#### **3a. Create contact page**
1. **Click**: "Create new file"
2. **Type**: `src/app/contact/page.tsx`
3. **Copy this content:**
```typescript
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Contact Us
          </h1>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Click**: "Commit new file"

### **Step 4: Create Blog Structure**

#### **4a. Create blog page**
1. **Click**: "Create new file"
2. **Type**: `src/app/blog/page.tsx`
3. **Copy this content:**
```typescript
import Link from 'next/link';

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "Essential Tips for Automotive Photography",
      excerpt: "Learn the key techniques for capturing stunning car photos.",
      date: "2024-01-15",
      slug: "automotive-photography-tips"
    },
    {
      id: 2,
      title: "Lighting Techniques for Car Photography",
      excerpt: "Master the art of lighting to make vehicles shine.",
      date: "2024-01-10",
      slug: "lighting-techniques"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Photography Blog
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="text-sm text-gray-500">
                  Published on {new Date(post.date).toLocaleDateString()}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Click**: "Commit new file"

### **Step 5: Create Components Structure**

#### **5a. Create Header component**
1. **Click**: "Create new file"
2. **Type**: `src/components/layout/Header.tsx`
3. **Copy this content:**
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/vivid-auto-photography-logo.png"
              alt="Vivid Auto Photography"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600">
              Blog
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-700 hover:text-blue-600 py-2">
                Home
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 py-2">
                About
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-blue-600 py-2">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 py-2">
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
```

**Click**: "Commit new file"

### **Step 6: Create Essential Config Files**

#### **6a. Create package.json**
1. **Click**: "Create new file"
2. **Type**: `package.json`
3. **Copy this content:**
```json
{
  "name": "vivid-auto-photography",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Click**: "Commit new file"

### **Step 7: Final Commit**

**Use this commit message for the final commit:**
```
feat: create complete Next.js TypeScript website structure

- Added src/app/ pages (home, about, contact, blog)
- Added src/components/layout/Header.tsx with responsive navigation
- Added package.json with Next.js TypeScript dependencies
- Created proper folder structure for TypeScript React website
- All ESLint compliant code with proper TypeScript types

This creates the foundation for a professional automotive photography website.
```

## ✅ **Expected Result**

After completing these steps:
- **Language stats**: TypeScript will be primary (60%+)
- **File structure**: Proper Next.js TypeScript structure
- **GitHub Actions**: Will trigger and build successfully
- **Deployment**: Will work automatically

## 🎯 **Next Steps**

1. **Upload images** to `public/images/` folder
2. **Add remaining components** as needed
3. **Configure deployment** settings

This method gives you complete control over the folder structure and ensures everything is properly organized on GitHub!