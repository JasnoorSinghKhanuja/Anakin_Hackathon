import React from 'react';
import { cn } from '../../lib/utils.js';

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-28 w-full resize-none rounded-lg border border-slate-200 bg-white px-5 py-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/15',
      className
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
