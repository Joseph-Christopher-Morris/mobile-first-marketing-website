# DIY Website Editing Guide - Save Your Kiro Credits!

## 🎯 Quick Answer: YES! You can easily edit most things yourself.

Your website is built with Next.js and has a very clean, organized structure. Here are the most common changes you can make without any AI help:

## 📝 Simple Text Changes

### Home Page Content
**File:** `src/app/page.tsx`
**What to change:** Headlines, descriptions, button text
**Example:** Look for text between `>` and `<` tags:
```jsx
<h1>Professional Automotive Photography</h1>
```
Just change "Professional Automotive Photography" to whatever you want.

### Service Pages
**Files:** 
- `src/app/services/photography/page.tsx`
- `src/app/services/analytics/page.tsx` 
- `src/app/services/ad-campaigns/page.tsx`

**What to change:** Service descriptions, pricing, features

### Contact Information
**Files:** `src/app/contact/page.tsx` and `src/components/layout/Footer.tsx`
**Look for:** Phone numbers, email addresses
**Example:**
```jsx
<a href='tel:+447586378502'>+44 7586 378502</a>
```
Change both the `href` and the display text.

## 🖼️ Image Updates

### Replace Images
1. Find your image in `public/images/`
2. Replace with new image (keep same filename)
3. Or change the filename in the code

### Add New Images
1. Add image to `public/images/` folder
2. Update the code:
```jsx
<Image src='/images/your-new-image.webp' alt='Description' />
```

## 📰 Add Blog Posts

**Create new file:** `src/content/blog/your-post-name.ts`
**Copy this template:**
```typescript
import { BlogPost } from '../../lib/blog-types';

const post: BlogPost = {
  slug: 'your-post-name',
  title: 'Your Post Title',
  excerpt: 'Brief description',
  content: `<p>Your content here</p>`,
  date: '2025-01-15',
  category: 'Photography',
  readTime: 5,
  featured: false
};

export default post;
```

## 🎨 Color Changes

**File:** `tailwind.config.js`
**Find the brand colors section:**
```javascript
brand: {
  pink: '#ff2d7a',    // Change this hex code
  pink2: '#d81b60',   // And this one
  // etc.
}
```

## 🛠️ How to Test Your Changes

### Option 1: Local Development (Best)
1. Install Node.js
2. Run `npm install` in your project folder
3. Run `npm run dev`
4. Open `http://localhost:3000` in browser
5. Make changes and see them instantly

### Option 2: Direct Editing
1. Edit files directly
2. Run validation scripts to check for issues:
   ```bash
   node scripts/validate-requirements-compliance.js
   ```
3. Build and deploy

## ✅ What's Safe to Change Yourself

- ✅ Text content (headlines, descriptions, contact info)
- ✅ Images (replace existing or add new ones)
- ✅ Blog posts (add new content)
- ✅ Colors (using the brand color system)
- ✅ Contact form options (service dropdown, etc.)
- ✅ Navigation menu items
- ✅ Footer content

## ⚠️ What to Be Careful With

- ⚠️ Don't use non-brand colors (blue, green, red, etc.)
- ⚠️ Don't remove accessibility attributes (`alt`, `aria-label`)
- ⚠️ Don't break responsive design (avoid fixed widths)
- ⚠️ Keep the existing file structure

## 🆘 When to Use Kiro Credits

Save your credits for:
- 🔧 Complex new features (new page types, advanced functionality)
- 🎨 Major design overhauls
- 🐛 Technical debugging (build errors, deployment issues)
- ⚡ Performance optimization
- 🔍 SEO improvements

## 💡 Pro Tips

1. **Start small** - Change one thing at a time
2. **Use the validation scripts** - They'll catch most issues
3. **Keep backups** - Save copies before major changes
4. **Test on mobile** - Most visitors use phones

## 🔧 Recommended Tools

- **VS Code** (free code editor)
- **Chrome DevTools** (built into Chrome)
- **TinyPNG** (compress images)

Your website is very well-structured, so most content changes are straightforward. The validation scripts I created will help you catch any issues before deployment.

Want to try a simple change first? Pick one piece of text to update and I can walk you through exactly where to find it!