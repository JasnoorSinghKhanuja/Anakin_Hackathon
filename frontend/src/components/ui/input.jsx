import React from 'react';
import { cn } from '../../lib/utils.js';

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-12 w-full rounded-full border border-slate-200 bg-white px-5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/15',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';
