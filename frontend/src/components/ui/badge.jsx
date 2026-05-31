import { cn } from '../../lib/utils.js';

export function Badge({ className, tone = 'slate', ...props }) {
  const tones = {
    slate: 'bg-slate-900/10 text-slate-700 ring-slate-900/10',
    teal: 'bg-teal-500/10 text-teal-800 ring-teal-500/20',
    amber: 'bg-amber-400/20 text-amber-900 ring-amber-500/20',
    green: 'bg-emerald-500/10 text-emerald-800 ring-emerald-500/20',
    red: 'bg-red-500/10 text-red-700 ring-red-500/20',
    white: 'bg-white/10 text-white ring-white/20'
  };

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset', tones[tone], className)}
      {...props}
    />
  );
}
