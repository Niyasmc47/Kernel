import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kernel-cyan disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-kernel-cyan text-kernel-navy hover:bg-kernel-cyan/80 shadow-[0_0_10px_rgba(102,252,241,0.5)]': variant === 'primary',
            'bg-kernel-violet text-white hover:bg-kernel-violet/80 shadow-[0_0_10px_rgba(138,43,226,0.5)]': variant === 'secondary',
            'border-2 border-kernel-cyan text-kernel-cyan hover:bg-kernel-cyan/10': variant === 'outline',
            'hover:bg-kernel-dark text-kernel-gray hover:text-kernel-cyan': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-11 px-8 text-base': size === 'md',
            'h-14 px-10 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

