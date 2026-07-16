import React from 'react';
import { twMerge } from 'tailwind-merge';
type Tone = 'brand' | 'accent' | 'slate' | 'green' | 'amber' | 'red' | 'blue';
const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  accent: 'bg-accent-50 text-accent-700 ring-accent-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100'
};
export function Badge({
  children,
  tone = 'slate',
  className




}: {children: React.ReactNode;tone?: Tone;className?: string;}) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className
      )}>
      
      {children}
    </span>);

}