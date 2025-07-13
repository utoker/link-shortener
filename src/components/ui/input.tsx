import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        {...props}
        className={cn(
          // Default base styling
          'border-border bg-input text-foreground focus-visible:ring-yellow flex w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder:text-[#0C0C0D]/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',

          // Custom override styling
          className,
        )}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
