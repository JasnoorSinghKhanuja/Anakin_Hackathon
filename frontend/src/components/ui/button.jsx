import React from 'react';
import { Slot } from './slot.jsx';
import { cn } from '../../lib/utils.js';

const variants = {
  default: 'bg-white text-slate-950 hover:bg-slate-100 shadow-panel',
  dark: 'bg-slate-950 text-white hover:bg-slate-800 shadow-panel',
  ghost: 'bg-transparent text-slate-700 hover:bg-white/70',
  outline: 'border border-white/20 bg-white/10 text-white hover:bg-white/20',
  subtle: 'bg-slate-100 text-slate-900 hover:bg-slate-200'
};

export const Button = React.forwardRef(({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-13 px-6 text-base'
  };

  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Button.displayName = 'Button';
