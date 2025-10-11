import React from 'react';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Semantic heading component that ensures proper heading hierarchy
 * and includes SEO-friendly attributes
 */
export function Heading({ level, children, className = '', id }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  // Default classes for each heading level (mobile-first)
  const defaultClasses = {
    1: 'text-2xl md:text-4xl lg:text-5xl font-bold leading-tight',
    2: 'text-xl md:text-3xl lg:text-4xl font-bold leading-tight',
    3: 'text-lg md:text-2xl lg:text-3xl font-semibold leading-tight',
    4: 'text-base md:text-xl lg:text-2xl font-semibold leading-tight',
    5: 'text-sm md:text-lg lg:text-xl font-medium leading-tight',
    6: 'text-sm md:text-base lg:text-lg font-medium leading-tight',
  };

  const combinedClassName = `${defaultClasses[level]} ${className}`.trim();

  return (
    <Tag className={combinedClassName} id={id}>
      {children}
    </Tag>
  );
}

/**
 * Page title component (always H1)
 */
interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function PageTitle({ children, className = '', id }: PageTitleProps) {
  return (
    <Heading level={1} className={`mb-4 md:mb-6 ${className}`} id={id}>
      {children}
    </Heading>
  );
}

/**
 * Section heading component (H2)
 */
interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionHeading({
  children,
  className = '',
  id,
}: SectionHeadingProps) {
  return (
    <Heading level={2} className={`mb-3 md:mb-4 ${className}`} id={id}>
      {children}
    </Heading>
  );
}

/**
 * Subsection heading component (H3)
 */
interface SubsectionHeadingProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SubsectionHeading({
  children,
  className = '',
  id,
}: SubsectionHeadingProps) {
  return (
    <Heading level={3} className={`mb-2 md:mb-3 ${className}`} id={id}>
      {children}
    </Heading>
  );
}
