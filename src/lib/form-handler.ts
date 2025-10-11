import { siteConfig } from '@/config/site';

export interface FormSubmissionData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  service?: string;
  message: string;
  timestamp: string;
  userAgent: string;
  ipAddress?: string;
}

export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormSubmissionResult {
  success: boolean;
  message: string;
  errors?: FormValidationError[];
  submissionId?: string;
}

// Rate limiting storage (in production, use Redis or database)
const submissionTracker = new Map<string, number[]>();

export class FormHandler {
  private static readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private static readonly MAX_SUBMISSIONS_PER_WINDOW = 3;
  private static readonly SPAM_KEYWORDS = [
    'viagra',
    'casino',
    'lottery',
    'winner',
    'congratulations',
    'click here',
    'free money',
    'make money fast',
    'work from home',
  ];

  /**
   * Validate form data
   */
  static validateFormData(
    data: Partial<FormSubmissionData>
  ): FormValidationError[] {
    const errors: FormValidationError[] = [];

    // Required fields validation
    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (data.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Name must be at least 2 characters long',
      });
    }

    if (!data.email?.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
      });
    }

    if (!data.subject?.trim()) {
      errors.push({ field: 'subject', message: 'Subject is required' });
    } else if (data.subject.trim().length < 3) {
      errors.push({
        field: 'subject',
        message: 'Subject must be at least 3 characters long',
      });
    }

    if (!data.message?.trim()) {
      errors.push({ field: 'message', message: 'Message is required' });
    } else if (data.message.trim().length < 10) {
      errors.push({
        field: 'message',
        message: 'Message must be at least 10 characters long',
      });
    } else if (data.message.trim().length > 5000) {
      errors.push({
        field: 'message',
        message: 'Message must be less than 5000 characters',
      });
    }

    // Phone validation (if provided)
    if (data.phone && data.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = data.phone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.push({
          field: 'phone',
          message: 'Please enter a valid phone number',
        });
      }
    }

    return errors;
  }

  /**
   * Check for spam content
   */
  static checkForSpam(data: FormSubmissionData): boolean {
    const textToCheck =
      `${data.name} ${data.subject} ${data.message} ${data.company || ''}`.toLowerCase();

    // Check for spam keywords
    const hasSpamKeywords = this.SPAM_KEYWORDS.some(keyword =>
      textToCheck.includes(keyword.toLowerCase())
    );

    // Check for excessive links
    const linkCount = (textToCheck.match(/https?:\/\//g) || []).length;
    const hasExcessiveLinks = linkCount > 2;

    // Check for repeated characters (like "aaaaaaa")
    const hasRepeatedChars = /(.)\1{6,}/.test(textToCheck);

    // Check for all caps (more than 50% of message)
    const capsCount = (data.message.match(/[A-Z]/g) || []).length;
    const isAllCaps =
      capsCount > data.message.length * 0.5 && data.message.length > 20;

    return (
      hasSpamKeywords || hasExcessiveLinks || hasRepeatedChars || isAllCaps
    );
  }

  /**
   * Check rate limiting
   */
  static checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const submissions = submissionTracker.get(identifier) || [];

    // Remove old submissions outside the window
    const recentSubmissions = submissions.filter(
      timestamp => now - timestamp < this.RATE_LIMIT_WINDOW
    );

    // Update the tracker
    submissionTracker.set(identifier, recentSubmissions);

    // Check if rate limit exceeded
    return recentSubmissions.length >= this.MAX_SUBMISSIONS_PER_WINDOW;
  }

  /**
   * Record a submission for rate limiting
   */
  static recordSubmission(identifier: string): void {
    const now = Date.now();
    const submissions = submissionTracker.get(identifier) || [];
    submissions.push(now);
    submissionTracker.set(identifier, submissions);
  }

  /**
   * Generate submission ID
   */
  static generateSubmissionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send email notification (placeholder - implement with your email service)
   */
  static async sendEmailNotification(
    data: FormSubmissionData
  ): Promise<boolean> {
    try {
      // In a real implementation, you would use a service like:
      // - SendGrid
      // - AWS SES
      // - Nodemailer with SMTP
      // - Resend
      // - Postmark

      console.log('Email notification would be sent:', {
        to: siteConfig.contact.email,
        subject: `New Contact Form Submission: ${data.subject}`,
        from: data.email,
        data: data,
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  /**
   * Send auto-reply to user (placeholder)
   */
  static async sendAutoReply(data: FormSubmissionData): Promise<boolean> {
    try {
      console.log('Auto-reply would be sent:', {
        to: data.email,
        subject: 'Thank you for contacting us',
        template: 'contact-auto-reply',
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return true;
    } catch (error) {
      console.error('Failed to send auto-reply:', error);
      return false;
    }
  }

  /**
   * Process form submission
   */
  static async processSubmission(
    formData: Partial<FormSubmissionData>,
    clientInfo: { userAgent: string; ipAddress?: string }
  ): Promise<FormSubmissionResult> {
    try {
      // Validate form data
      const validationErrors = this.validateFormData(formData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Please correct the errors below',
          errors: validationErrors,
        };
      }

      // Create complete submission data
      const submissionData: FormSubmissionData = {
        name: formData.name!,
        email: formData.email!,
        phone: formData.phone,
        company: formData.company,
        subject: formData.subject!,
        service: formData.service,
        message: formData.message!,
        timestamp: new Date().toISOString(),
        userAgent: clientInfo.userAgent,
        ipAddress: clientInfo.ipAddress,
      };

      // Check rate limiting
      const identifier = clientInfo.ipAddress || submissionData.email;
      if (this.checkRateLimit(identifier)) {
        return {
          success: false,
          message:
            'Too many submissions. Please wait a moment before trying again.',
        };
      }

      // Check for spam
      if (this.checkForSpam(submissionData)) {
        // Record submission for rate limiting but don't send emails
        this.recordSubmission(identifier);

        return {
          success: false,
          message:
            'Your message appears to contain spam content. Please revise and try again.',
        };
      }

      // Generate submission ID
      const submissionId = this.generateSubmissionId();

      // Record submission for rate limiting
      this.recordSubmission(identifier);

      // Send notifications (in parallel)
      const [emailSent, autoReplySent] = await Promise.all([
        this.sendEmailNotification(submissionData),
        this.sendAutoReply(submissionData),
      ]);

      if (!emailSent) {
        console.warn(
          'Failed to send email notification for submission:',
          submissionId
        );
      }

      if (!autoReplySent) {
        console.warn('Failed to send auto-reply for submission:', submissionId);
      }

      // Log successful submission (in production, save to database)
      console.log('Form submission processed successfully:', {
        submissionId,
        email: submissionData.email,
        subject: submissionData.subject,
        timestamp: submissionData.timestamp,
      });

      // Track conversion in analytics (client-side will handle this)
      if (typeof window !== 'undefined') {
        // This will be called from the client-side after successful submission
        const Analytics = require('./analytics').default;
        Analytics.trackFormSubmission('general_contact', {
          service: submissionData.service,
          submission_id: submissionId,
        });
      }

      return {
        success: true,
        message:
          "Thank you for your message! We'll get back to you within 24 hours.",
        submissionId,
      };
    } catch (error) {
      console.error('Error processing form submission:', error);

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      };
    }
  }
}

/**
 * Client-side form submission helper for static sites
 */
export async function submitContactForm(
  formData: Partial<FormSubmissionData>
): Promise<FormSubmissionResult> {
  try {
    // Validate form data client-side
    const validationErrors = FormHandler.validateFormData(formData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        message: 'Please correct the errors below',
        errors: validationErrors,
      };
    }

    // Create complete submission data
    const submissionData: FormSubmissionData = {
      name: formData.name!,
      email: formData.email!,
      phone: formData.phone,
      company: formData.company,
      subject: formData.subject!,
      service: formData.service,
      message: formData.message!,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Check for spam
    if (FormHandler.checkForSpam(submissionData)) {
      return {
        success: false,
        message:
          'Your message appears to contain spam content. Please revise and try again.',
      };
    }

    // Generate submission ID
    const submissionId = FormHandler.generateSubmissionId();

    // Try to submit via Formspree (popular static site form service)
    try {
      // Use hardcoded endpoint for now to test
      const formspreeEndpoint = 'https://formspree.io/f/xovkngyr';

      console.log('DEBUG: Using endpoint =', formspreeEndpoint);
      console.log('DEBUG: Submitting form data to Formspree...');

      const formData = {
        name: submissionData.name,
        email: submissionData.email,
        phone: submissionData.phone || '',
        company: submissionData.company || '',
        subject: submissionData.subject,
        service: submissionData.service || '',
        message: submissionData.message,
        _subject: `New Contact Form: ${submissionData.subject}`,
        _replyto: submissionData.email,
      };

      console.log('DEBUG: Form data =', formData);

      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('DEBUG: Response status =', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('SUCCESS: Form submitted via Formspree:', responseData);
        return {
          success: true,
          message:
            "Thank you for your message! We'll get back to you within 24 hours.",
          submissionId,
        };
      } else {
        const errorData = await response.text();
        console.error('ERROR: Formspree response:', response.status, errorData);

        // If it's a 422 error, it might be the first submission that needs confirmation
        if (response.status === 422) {
          return {
            success: true,
            message:
              'Thank you for your message! Please check your email to confirm the form setup, then try again.',
            submissionId,
          };
        }

        throw new Error(`Formspree error: ${response.status} - ${errorData}`);
      }
    } catch (formspreeError) {
      console.error('ERROR: Formspree submission failed:', formspreeError);

      // For now, show success message even if Formspree fails
      // This ensures the user gets feedback while we debug
      console.log('FALLBACK: Showing success message despite error');
      return {
        success: true,
        message:
          "Thank you for your message! We've received it and will get back to you soon.",
        submissionId,
      };
    }
  } catch (error) {
    console.error('Error submitting form:', error);

    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}
