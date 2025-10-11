import React from 'react';
import '../styles/global-brand-colors.css';

// Button Components with Brand Colors
export const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}> = ({ children, onClick, disabled = false, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn-primary ${className}`}
    style={{
      backgroundColor: '#F5276F',
      color: '#FFFFFF',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease-in-out',
      opacity: disabled ? 0.6 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = '#C8094C';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(245, 39, 111, 0.3)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = '#F5276F';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}> = ({ children, onClick, disabled = false, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn-secondary ${className}`}
    style={{
      backgroundColor: 'transparent',
      color: '#F5276F',
      border: '2px solid #F5276F',
      padding: '10px 22px',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease-in-out',
      opacity: disabled ? 0.6 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = '#F5276F';
        e.currentTarget.style.color = '#FFFFFF';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#F5276F';
        e.currentTarget.style.transform = 'translateY(0)';
      }
    }}
  >
    {children}
  </button>
);

// Link Component with Brand Colors
export const BrandLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}> = ({ href, children, className = '', external = false }) => (
  <a
    href={href}
    className={className}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    style={{
      color: '#F5276F',
      textDecoration: 'none',
      transition: 'color 0.2s ease-in-out',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = '#C8094C';
      e.currentTarget.style.textDecoration = 'underline';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = '#F5276F';
      e.currentTarget.style.textDecoration = 'none';
    }}
  >
    {children}
  </a>
);

// Badge Component with Brand Colors
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}> = ({ children, variant = 'primary', className = '' }) => (
  <span
    className={`badge badge-${variant} ${className}`}
    style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      backgroundColor: variant === 'primary' ? '#F5276F' : '#E5E7EB',
      color: variant === 'primary' ? '#FFFFFF' : '#374151',
    }}
  >
    {children}
  </span>
);

// Card Component with Brand Accents
export const BrandCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}> = ({ children, className = '', hover = true }) => (
  <div
    className={`card ${className}`}
    style={{
      background: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: hover ? 'all 0.2s ease-in-out' : 'none',
      cursor: hover ? 'pointer' : 'default',
    }}
    onMouseEnter={(e) => {
      if (hover) {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
      }
    }}
    onMouseLeave={(e) => {
      if (hover) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }
    }}
  >
    {children}
  </div>
);

// Input Component with Brand Focus Colors
export const BrandInput: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
}> = ({ type = 'text', placeholder, value, onChange, className = '', required = false }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={className}
    style={{
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.2s ease-in-out',
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = '#F5276F';
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 39, 111, 0.1)';
      e.currentTarget.style.outline = 'none';
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = '#E5E7EB';
      e.currentTarget.style.boxShadow = 'none';
    }}
  />
);

// Textarea Component with Brand Focus Colors
export const BrandTextarea: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  required?: boolean;
}> = ({ placeholder, value, onChange, className = '', rows = 4, required = false }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    required={required}
    className={className}
    style={{
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.2s ease-in-out',
      resize: 'vertical',
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = '#F5276F';
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 39, 111, 0.1)';
      e.currentTarget.style.outline = 'none';
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = '#E5E7EB';
      e.currentTarget.style.boxShadow = 'none';
    }}
  />
);

// Loading Spinner with Brand Colors
export const BrandSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  };

  return (
    <div
      className={`spinner ${className}`}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: '3px solid #E5E7EB',
        borderTop: '3px solid #F5276F',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
};

// Alert Component with Brand Colors
export const BrandAlert: React.FC<{
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}> = ({ children, variant = 'info', className = '' }) => {
  const variantStyles = {
    info: {
      backgroundColor: 'rgba(245, 39, 111, 0.1)',
      border: '1px solid rgba(245, 39, 111, 0.2)',
      color: '#B01E56',
    },
    success: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      color: '#065F46',
    },
    warning: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.2)',
      color: '#92400E',
    },
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      color: '#991B1B',
    },
  };

  return (
    <div
      className={`alert alert-${variant} ${className}`}
      style={{
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
        ...variantStyles[variant],
      }}
    >
      {children}
    </div>
  );
};

// Progress Bar with Brand Colors
export const BrandProgressBar: React.FC<{
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
}> = ({ progress, className = '', showLabel = false }) => (
  <div className={className}>
    {showLabel && (
      <div style={{ marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
        {progress}%
      </div>
    )}
    <div
      style={{
        backgroundColor: '#E5E7EB',
        borderRadius: '4px',
        overflow: 'hidden',
        height: '8px',
      }}
    >
      <div
        style={{
          backgroundColor: '#F5276F',
          height: '100%',
          width: `${Math.min(100, Math.max(0, progress))}%`,
          transition: 'width 0.3s ease-in-out',
        }}
      />
    </div>
  </div>
);

// Navigation Link with Brand Colors
export const BrandNavLink: React.FC<{
  href: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}> = ({ href, children, active = false, className = '' }) => (
  <a
    href={href}
    className={`nav-link ${active ? 'active' : ''} ${className}`}
    style={{
      color: active ? '#F5276F' : '#374151',
      textDecoration: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      transition: 'all 0.2s ease-in-out',
      backgroundColor: active ? 'rgba(245, 39, 111, 0.1)' : 'transparent',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = '#F5276F';
      e.currentTarget.style.backgroundColor = 'rgba(245, 39, 111, 0.1)';
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.color = '#374151';
        e.currentTarget.style.backgroundColor = 'transparent';
      }
    }}
  >
    {children}
  </a>
);