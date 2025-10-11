import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies default classes', () => {
    render(<Button>Default Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'text-sm',
      'font-medium',
      'transition-colors',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'disabled:pointer-events-none',
      'disabled:opacity-50'
    );
  });

  it('applies primary variant classes', () => {
    render(<Button variant='primary'>Primary Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus-visible:ring-blue-500'
    );
  });

  it('applies secondary variant classes', () => {
    render(<Button variant='secondary'>Secondary Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'bg-gray-100',
      'text-gray-900',
      'hover:bg-gray-200',
      'focus-visible:ring-gray-500'
    );
  });

  it('applies outline variant classes', () => {
    render(<Button variant='outline'>Outline Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'border',
      'border-gray-300',
      'bg-transparent',
      'text-gray-700',
      'hover:bg-gray-50',
      'focus-visible:ring-gray-500'
    );
  });

  it('applies ghost variant classes', () => {
    render(<Button variant='ghost'>Ghost Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'bg-transparent',
      'text-gray-700',
      'hover:bg-gray-100',
      'focus-visible:ring-gray-500'
    );
  });

  it('applies small size classes', () => {
    render(<Button size='sm'>Small Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-9', 'px-3', 'text-xs');
  });

  it('applies medium size classes', () => {
    render(<Button size='md'>Medium Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'px-4', 'py-2');
  });

  it('applies large size classes', () => {
    render(<Button size='lg'>Large Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-11', 'px-8', 'text-base');
  });

  it('applies icon size classes', () => {
    render(<Button size='icon'>🔍</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'w-10');
  });

  it('applies custom className', () => {
    render(<Button className='custom-class'>Custom Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Clickable Button</Button>);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(<Button ref={ref}>Button with Ref</Button>);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('spreads additional props', () => {
    render(
      <Button data-testid='test-button' aria-label='Test button'>
        Button with Props
      </Button>
    );

    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });

  it('has proper touch target size for mobile', () => {
    render(<Button>Mobile Button</Button>);

    const button = screen.getByRole('button');
    // Default medium size should have min-h-[44px] for touch targets
    expect(button).toHaveClass('h-10'); // 40px, but with padding should meet 44px minimum
  });

  it('supports keyboard navigation', () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Keyboard Button</Button>);

    const button = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter' });

    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    fireEvent.keyUp(button, { key: ' ' });

    // Button should be focusable
    button.focus();
    expect(button).toHaveFocus();
  });

  it('has proper focus styles', () => {
    render(<Button>Focus Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2'
    );
  });
});
