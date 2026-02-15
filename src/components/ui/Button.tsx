import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-[var(--color-indigo)] text-white hover:bg-opacity-95 hover:shadow-sm',
      secondary: 'bg-[var(--color-periwinkle)] text-white hover:bg-opacity-95 hover:shadow-sm',
      outline: 'border-2 border-[var(--color-indigo)] text-[var(--color-indigo)] hover:bg-[var(--color-indigo)] hover:text-white hover:shadow-sm',
      ghost: 'hover:bg-gray-100 text-gray-700',
      danger: 'bg-[var(--color-danger)] text-white hover:bg-red-700 hover:shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-indigo)] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
