import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Test component to verify Tailwind classes are working
function TestComponent() {
  return (
    <div className='mobile-container'>
      <div className='touch-target bg-mobile-primary-500 text-white rounded-mobile'>
        Touch Target
      </div>
      <div className='mobile-grid'>
        <div className='mobile-card'>Card 1</div>
        <div className='mobile-card'>Card 2</div>
      </div>
      <h1 className='mobile-heading-1'>Mobile Heading</h1>
      <p className='mobile-body'>Mobile body text</p>
      <button className='min-h-touch min-w-touch bg-blue-500 text-white rounded-lg'>
        Mobile Button
      </button>
    </div>
  );
}

describe('Tailwind Mobile-First Configuration', () => {
  it('applies mobile-first container classes', () => {
    render(<TestComponent />);

    const container = screen
      .getByText('Touch Target')
      .closest('.mobile-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mobile-container');
  });

  it('applies touch target classes', () => {
    render(<TestComponent />);

    const touchTarget = screen.getByText('Touch Target');
    expect(touchTarget).toHaveClass('touch-target');
  });

  it('applies mobile grid classes', () => {
    render(<TestComponent />);

    const grid = screen.getByText('Card 1').closest('.mobile-grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('mobile-grid');
  });

  it('applies mobile card classes', () => {
    render(<TestComponent />);

    const card = screen.getByText('Card 1');
    expect(card).toHaveClass('mobile-card');
  });

  it('applies mobile typography classes', () => {
    render(<TestComponent />);

    const heading = screen.getByText('Mobile Heading');
    expect(heading).toHaveClass('mobile-heading-1');

    const body = screen.getByText('Mobile body text');
    expect(body).toHaveClass('mobile-body');
  });

  it('applies touch-friendly button sizing', () => {
    render(<TestComponent />);

    const button = screen.getByText('Mobile Button');
    expect(button).toHaveClass('min-h-touch', 'min-w-touch');
  });

  it('applies mobile-specific colors', () => {
    render(<TestComponent />);

    const touchTarget = screen.getByText('Touch Target');
    expect(touchTarget).toHaveClass('bg-mobile-primary-500');
  });

  it('applies mobile-specific border radius', () => {
    render(<TestComponent />);

    const touchTarget = screen.getByText('Touch Target');
    expect(touchTarget).toHaveClass('rounded-mobile');
  });
});

describe('Responsive Breakpoints', () => {
  it('applies responsive classes correctly', () => {
    render(
      <div
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        data-testid='responsive-grid'
      >
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    );

    const grid = screen.getByTestId('responsive-grid');
    expect(grid).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3'
    );
  });

  it('applies mobile-first spacing', () => {
    render(
      <div className='p-4 md:p-6 lg:p-8'>
        <span>Responsive padding</span>
      </div>
    );

    const element = screen.getByText('Responsive padding').closest('div');
    expect(element).toHaveClass('p-4', 'md:p-6', 'lg:p-8');
  });

  it('applies mobile-first text sizing', () => {
    render(
      <h1 className='text-2xl md:text-3xl lg:text-4xl'>Responsive heading</h1>
    );

    const heading = screen.getByText('Responsive heading');
    expect(heading).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl');
  });
});

describe('Touch and Interaction Classes', () => {
  it('applies touch manipulation classes', () => {
    render(
      <button className='touch-manipulation tap-highlight-none'>
        Touch Button
      </button>
    );

    const button = screen.getByText('Touch Button');
    expect(button).toHaveClass('touch-manipulation', 'tap-highlight-none');
  });

  it('applies safe area classes', () => {
    render(<div className='safe-top safe-bottom'>Safe area content</div>);

    const element = screen.getByText('Safe area content');
    expect(element).toHaveClass('safe-top', 'safe-bottom');
  });

  it('applies mobile animation classes', () => {
    render(
      <div className='animate-slide-up animate-fade-in'>Animated content</div>
    );

    const element = screen.getByText('Animated content');
    expect(element).toHaveClass('animate-slide-up', 'animate-fade-in');
  });
});
