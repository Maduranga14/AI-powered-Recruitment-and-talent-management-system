import React from 'react';
import { BoxIcon } from 'lucide-react';
export function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'brand'





}: {icon: BoxIcon;label: string;value: string | number;tone?: 'brand' | 'accent' | 'amber' | 'blue';}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-50 text-accent-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600'
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-display text-2xl font-extrabold text-slate-900">
        {value}
      </p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>);

}