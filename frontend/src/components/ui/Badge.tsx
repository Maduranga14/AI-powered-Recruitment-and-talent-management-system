import React from 'react';
import { twMerge } from 'tailwind-merge';
type Tone = 'brand' | 'accent' | 'slate' | 'green' | 'amber' | 'red' | 'blue';
const tones: Record<Tone, string> = {
  brand: 'bg-brand-500/20 text-teal-300 ring-brand-500/30',
  accent: 'bg-teal-500/20 text-teal-300 ring-teal-500/30',
  slate: 'bg-slate-800 text-slate-300 ring-slate-700',
  green: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  red: 'bg-red-500/20 text-red-300 ring-red-500/30',
  blue: 'bg-blue-500/20 text-blue-300 ring-blue-500/30'
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