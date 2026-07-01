import React from 'react';

export default function AnalyticsStatCards({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map(s => (
        <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: s.iconBg }}
            >
              {s.icon === 'people' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
            </div>
            {s.trend && (
              <div className="flex items-center gap-1 text-[12px]" style={{ color: s.trendUp ? '#22c55e' : '#94a3b8' }}>
                {s.trendUp && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                )}
                <span className="font-semibold">{s.trend}</span>
              </div>
            )}
          </div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">{s.label}</div>
          <div className="text-[34px] font-bold text-gray-900">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
