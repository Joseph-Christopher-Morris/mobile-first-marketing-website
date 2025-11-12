# Business Hours Forms Update Plan

## Standard Business Hours Block

This exact block should be added after the submit button in ALL forms:

```tsx
<div className="mt-4 text-sm text-slate-500 text-center">
  <p><strong>Hours (UK time)</strong></p>
  <p>Monday to Friday: 09:00 to 18:00</p>
  <p>Saturday: 10:00 to 14:00</p>
  <p>Sunday: 10:00 to 16:00</p>
  <p>I personally reply to all enquiries the same day during these hours.</p>
</div>
```

## Forms to Update

### 1. ServiceInquiryForm.tsx
- Location: After submit button, before closing `</form>`
- Remove: No existing hours text
- Add: Standard business hours block

### 2. GeneralContactForm.tsx  
- Location: After submit button, before closing `</form>`
- Remove: "I'll get back to you personally the same day. No waiting around."
- Add: Standard business hours block

### 3. ServicesContactSection.tsx
- Location: After submit button, before closing `</form>`
- Remove: "No hard sell. Just clear, practical ideas for your business."
- Add: Standard business hours block

### 4. Website Hosting Page Form
- Location: After submit button, before closing `</form>`
- Remove: "This form is powered by Formspree..."
- Add: Standard business hours block + Formspree notice

### 5. Website Design Page Form
- Location: After submit button, before closing `</form>`
- Remove: "I will reply personally the same day with ideas and next steps."
- Add: Standard business hours block

### 6. Contact Page
- Update hero text to include business hours
- Add business hours block to form

## Old Wording to Remove/Replace

Search and replace these phrases:
- "within 24 hours" → "the same day during these hours"
- "within the same day" → "the same day during these hours"
- "ASAP" → Remove or replace with specific timeframe
- "I personally reply to all enquiries between" → Use standard block
- "I will get back to you personally within" → Use standard block

## Implementation Order

1. Update ServiceInquiryForm.tsx (reusable component)
2. Update GeneralContactForm.tsx (main contact form)
3. Update ServicesContactSection.tsx
4. Update website-hosting page form
5. Update website-design page form
6. Update contact page
7. Search for any remaining old wording
8. Test all forms

## Verification Checklist

After implementation:
- [ ] All forms show identical business hours
- [ ] No "within 24 hours" references remain
- [ ] No "ASAP" references remain
- [ ] Mobile layout looks good
- [ ] Desktop layout looks good
- [ ] Forms still submit correctly
- [ ] GA4 tracking still works
