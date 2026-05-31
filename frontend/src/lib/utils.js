import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Price unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value));
}

export function compactTitle(title, length = 68) {
  if (!title) return 'Untitled product';
  return title.length > length ? `${title.slice(0, length - 1)}...` : title;
}

