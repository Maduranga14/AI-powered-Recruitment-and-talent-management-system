import React from 'react';
import { BoxIcon } from 'lucide-react';

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'brand',
}: {
  icon: BoxIcon;
  label: string;
  value: string | number;
  tone?: 'brand' | 'accent' | 'amber' | 'blue';
}) {
  const tones = {
    brand: {
      badge: 'bg-gradient-to-br from-indigo-500 to-brand-600 text-white shadow-md shadow-indigo-500/20',
      card: 'hover:border-indigo-500/50 bg-slate-900/90 border-slate-800 text-white shadow-xl',
      accentText: 'text-teal-300',
    },
    accent: {
      badge: 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md shadow-teal-500/20',
      card: 'hover:border-teal-500/50 bg-slate-900/90 border-slate-800 text-white shadow-xl',
      accentText: 'text-teal-300',
    },
    amber: {
      badge: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20',
      card: 'hover:border-amber-500/50 bg-slate-900/90 border-slate-800 text-white shadow-xl',
      accentText: 'text-amber-300',
    },
    blue: {
      badge: 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-blue-500/20',
      card: 'hover:border-blue-500/50 bg-slate-900/90 border-slate-800 text-white shadow-xl',
      accentText: 'text-sky-300',
    },
  };

  const currentTone = tones[tone] || tones.brand;

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${currentTone.card}`}>
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${currentTone.badge}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="h-2 w-2 rounded-full bg-teal-400/80" />
      </div>
      <p className="mt-4 font-display text-3xl font-black text-white tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}