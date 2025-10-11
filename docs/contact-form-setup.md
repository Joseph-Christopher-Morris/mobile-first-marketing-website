# Contact Form Setup for Static Site

Since this is a static site deployed to S3 + CloudFront, the contact form requires a third-party service to handle form submissions. Here are the recommended options:

## Option 1: Formspree (Recommended)

Formspree is a popular service for handling forms on static sites.

### Setup Steps:

1. Go to [Formspree.io](https://formspree.io/) and create an account
2. Create a new form and get your form endpoint URL
3. Add the endpoint to your environment variables:
   ```
   NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
   ```
4. Deploy your site - the form will now work!

### Features:
- ✅ Free tier available (50 submissions/month)
- ✅ Spam protection included
- ✅ Email notifications
- ✅ Form validation
- ✅ File uploads support

## Option 2: EmailJS

EmailJS allows you to send emails directly from client-side JavaScript.

### Setup Steps:

1. Go to [EmailJS.com](https://www.emailjs.com/) and create an account
2. Set up an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Add your credentials to environment variables:
   ```
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   ```

### Features:
- ✅ Free tier available (200 emails/month)
- ✅ Direct email sending
- ✅ Template customization
- ✅ Multiple email services

## Option 3: Netlify Forms

If you deploy to Netlify instead of S3, you can use Netlify Forms.

### Setup Steps:

1. Add `netlify` attribute to your form element
2. Add a hidden input: `<input type="hidden" name="form-name" value="contact" />`
3. Deploy to Netlify - forms are automatically detected

### Features:
- ✅ Built into Netlify hosting
- ✅ Spam protection
- ✅ Form notifications
- ✅ Zapier integration

## Option 4: AWS Lambda + SES

For more control, you can create a serverless function.

### Setup Steps:

1. Create an AWS Lambda function
2. Set up AWS SES for email sending
3. Create an API Gateway endpoint
4. Update the form handler to use your endpoint

### Features:
- ✅ Full control over processing
- ✅ Custom validation and logic
- ✅ Integration with AWS services
- ✅ Scalable and reliable

## Current Implementation

The current form implementation:
- ✅ Validates all input client-side
- ✅ Checks for spam content
- ✅ Provides user feedback
- ✅ Supports Formspree integration (when configured)
- ✅ Falls back to local logging for development

## Testing

To test the form:

1. Fill out the contact form
2. Check the browser console for submission logs
3. If Formspree is configured, check your email for notifications

## Production Checklist

Before going live:

- [ ] Choose and configure a form service (Formspree recommended)
- [ ] Test form submissions
- [ ] Set up email notifications
- [ ] Configure spam protection
- [ ] Test on mobile devices
- [ ] Verify email deliverability

## Troubleshooting

### Form shows "Network error"
- Check if `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is set correctly
- Verify the Formspree endpoint URL is valid
- Check browser console for detailed error messages

### Emails not being received
- Check spam folder
- Verify Formspree account is active
- Test with different email addresses
- Check Formspree dashboard for submission logs

### Form validation errors
- Ensure all required fields are filled
- Check email format is valid
- Verify message is at least 10 characters long

## Support

For issues with:
- **Formspree**: Check their [documentation](https://help.formspree.io/)
- **EmailJS**: Check their [documentation](https://www.emailjs.com/docs/)
- **Form code**: Check the browser console for error messages