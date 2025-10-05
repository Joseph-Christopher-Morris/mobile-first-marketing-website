import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FormHandler, submitContactForm } from '../form-handler';
import type { FormSubmissionData } from '../form-handler';

// Mock fetch for client-side tests
global.fetch = vi.fn();

describe('FormHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear rate limiting tracker
    (FormHandler as any).submissionTracker = new Map();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateFormData', () => {
    it('should validate required fields', () => {
      const invalidData = {};
      const errors = FormHandler.validateFormData(invalidData);

      expect(errors).toHaveLength(4);
      expect(errors.find(e => e.field === 'name')).toBeDefined();
      expect(errors.find(e => e.field === 'email')).toBeDefined();
      expect(errors.find(e => e.field === 'subject')).toBeDefined();
      expect(errors.find(e => e.field === 'message')).toBeDefined();
    });

    it('should validate email format', () => {
      const invalidEmail = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'Test message content here',
      };

      const errors = FormHandler.validateFormData(invalidEmail);
      const emailError = errors.find(e => e.field === 'email');

      expect(emailError).toBeDefined();
      expect(emailError?.message).toContain('valid email');
    });

    it('should validate minimum field lengths', () => {
      const shortData = {
        name: 'A',
        email: 'test@example.com',
        subject: 'Hi',
        message: 'Short',
      };

      const errors = FormHandler.validateFormData(shortData);

      expect(errors.find(e => e.field === 'name')).toBeDefined();
      expect(errors.find(e => e.field === 'subject')).toBeDefined();
      expect(errors.find(e => e.field === 'message')).toBeDefined();
    });

    it('should validate phone number format when provided', () => {
      const invalidPhone = {
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content here',
        phone: 'invalid-phone',
      };

      const errors = FormHandler.validateFormData(invalidPhone);
      const phoneError = errors.find(e => e.field === 'phone');

      expect(phoneError).toBeDefined();
      expect(phoneError?.message).toContain('valid phone number');
    });

    it('should pass validation with valid data', () => {
      const validData = {
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'This is a valid test message with sufficient length',
        phone: '+1234567890',
      };

      const errors = FormHandler.validateFormData(validData);
      expect(errors).toHaveLength(0);
    });

    it('should validate message length limits', () => {
      const longMessage = 'a'.repeat(5001);
      const tooLongData = {
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: longMessage,
      };

      const errors = FormHandler.validateFormData(tooLongData);
      const messageError = errors.find(e => e.field === 'message');

      expect(messageError).toBeDefined();
      expect(messageError?.message).toContain('less than 5000');
    });
  });

  describe('checkForSpam', () => {
    const validData: FormSubmissionData = {
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a legitimate message',
      timestamp: new Date().toISOString(),
      userAgent: 'test-agent',
    };

    it('should detect spam keywords', () => {
      const spamData = {
        ...validData,
        message: 'Click here to win free money from our casino!',
      };

      const isSpam = FormHandler.checkForSpam(spamData);
      expect(isSpam).toBe(true);
    });

    it('should detect excessive links', () => {
      const spamData = {
        ...validData,
        message:
          'Visit https://example1.com and https://example2.com and https://example3.com',
      };

      const isSpam = FormHandler.checkForSpam(spamData);
      expect(isSpam).toBe(true);
    });

    it('should detect repeated characters', () => {
      const spamData = {
        ...validData,
        message: 'This is aaaaaaaaaa spam message',
      };

      const isSpam = FormHandler.checkForSpam(spamData);
      expect(isSpam).toBe(true);
    });

    it('should detect all caps messages', () => {
      const spamData = {
        ...validData,
        message: 'THIS IS A VERY LONG ALL CAPS MESSAGE THAT LOOKS LIKE SPAM',
      };

      const isSpam = FormHandler.checkForSpam(spamData);
      expect(isSpam).toBe(true);
    });

    it('should not flag legitimate messages', () => {
      const isSpam = FormHandler.checkForSpam(validData);
      expect(isSpam).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow submissions within rate limit', () => {
      const identifier = 'test@example.com';

      expect(FormHandler.checkRateLimit(identifier)).toBe(false);
      FormHandler.recordSubmission(identifier);

      expect(FormHandler.checkRateLimit(identifier)).toBe(false);
      FormHandler.recordSubmission(identifier);

      expect(FormHandler.checkRateLimit(identifier)).toBe(false);
    });

    it('should block submissions exceeding rate limit', () => {
      const identifier = 'test@example.com';

      // Make 3 submissions (at the limit)
      FormHandler.recordSubmission(identifier);
      FormHandler.recordSubmission(identifier);
      FormHandler.recordSubmission(identifier);

      // 4th submission should be blocked
      expect(FormHandler.checkRateLimit(identifier)).toBe(true);
    });

    it('should reset rate limit after time window', () => {
      const identifier = 'test@example.com';

      // Mock Date.now to control time
      const originalNow = Date.now;
      let mockTime = 1000000;
      vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

      // Make 3 submissions
      FormHandler.recordSubmission(identifier);
      FormHandler.recordSubmission(identifier);
      FormHandler.recordSubmission(identifier);

      expect(FormHandler.checkRateLimit(identifier)).toBe(true);

      // Advance time beyond rate limit window (60 seconds)
      mockTime += 61 * 1000;

      expect(FormHandler.checkRateLimit(identifier)).toBe(false);

      Date.now = originalNow;
    });
  });

  describe('generateSubmissionId', () => {
    it('should generate unique submission IDs', () => {
      const id1 = FormHandler.generateSubmissionId();
      const id2 = FormHandler.generateSubmissionId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^sub_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^sub_\d+_[a-z0-9]+$/);
    });
  });

  describe('sendEmailNotification', () => {
    it('should simulate sending email notification', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const data: FormSubmissionData = {
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        timestamp: new Date().toISOString(),
        userAgent: 'test-agent',
      };

      const result = await FormHandler.sendEmailNotification(data);

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Email notification would be sent:',
        expect.objectContaining({
          subject: 'New Contact Form Submission: Test Subject',
          from: 'test@example.com',
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('processSubmission', () => {
    const validFormData = {
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a valid test message with sufficient length',
    };

    const clientInfo = {
      userAgent: 'test-agent',
      ipAddress: '127.0.0.1',
    };

    it('should process valid submission successfully', async () => {
      const result = await FormHandler.processSubmission(
        validFormData,
        clientInfo
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Thank you');
      expect(result.submissionId).toBeDefined();
    });

    it('should reject invalid form data', async () => {
      const invalidData = { name: 'A' };

      const result = await FormHandler.processSubmission(
        invalidData,
        clientInfo
      );

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should reject spam submissions', async () => {
      const spamData = {
        ...validFormData,
        message: 'Click here to win free money from our casino!',
      };

      const result = await FormHandler.processSubmission(spamData, clientInfo);

      expect(result.success).toBe(false);
      expect(result.message).toContain('spam');
    });

    it('should enforce rate limiting', async () => {
      // Make 3 successful submissions
      await FormHandler.processSubmission(validFormData, clientInfo);
      await FormHandler.processSubmission(validFormData, clientInfo);
      await FormHandler.processSubmission(validFormData, clientInfo);

      // 4th submission should be rate limited
      const result = await FormHandler.processSubmission(
        validFormData,
        clientInfo
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Too many submissions');
    });
  });
});

describe('submitContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should submit form successfully', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        message: 'Form submitted successfully',
        submissionId: 'test-id',
      }),
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const formData = {
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message',
    };

    const result = await submitContactForm(formData);

    expect(result.success).toBe(true);
    expect(result.submissionId).toBe('test-id');
    expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const formData = {
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message',
    };

    const result = await submitContactForm(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Network error');
  });

  it('should handle HTTP errors', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    };

    (global.fetch as any).mockResolvedValue(mockResponse);

    const formData = {
      name: 'John Doe',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test message',
    };

    const result = await submitContactForm(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Network error');
  });
});
