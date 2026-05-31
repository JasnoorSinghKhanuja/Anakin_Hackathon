import React from 'react';
import { cn } from '../../lib/utils.js';

export function Card({ className, ...props }) {
  return <div className={cn('rounded-lg border border-white/20 bg-white/75 shadow-panel backdrop-blur-xl', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 pb-2', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-lg font-semibold tracking-normal text-slate-950', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}
