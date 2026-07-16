import React from 'react';
import { SparklesIcon } from 'lucide-react';
export function MatchScore({
  score,
  size = 48,
  showLabel = false




}: {score: number;size?: number;showLabel?: boolean;}) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score / 100 * circumference;
  const color = score >= 85 ? '#0d9488' : score >= 70 ? '#4f46e5' : '#f59e0b';
  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="relative"
        style={{
          width: size,
          height: size
        }}
        aria-hidden>
        
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={4} />
          
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.6s ease'
            }} />
          
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{
            color
          }}>
          
          {score}
        </span>
      </div>
      {showLabel &&
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
          <SparklesIcon className="h-3.5 w-3.5 text-brand-500" />
          AI match
        </span>
      }
    </div>);

}