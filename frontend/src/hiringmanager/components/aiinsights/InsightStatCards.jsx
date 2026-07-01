import React from 'react';

export default function InsightStatCards({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <div className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: s.trendUp ? '#22c55e' : s.trendUp === false ? '#ef4444' : '#94a3b8' }}>
              {s.trendUp && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                </svg>
              )}
              {s.trend}
            </div>
          </div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{s.label}</div>
          <div className="text-[22px] font-bold text-gray-900">{s.value}</div>
          
          <div className="h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: s.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
