import React from 'react';

export default function SourcingPerformance({ sources }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <h3 className="font-bold text-[14px] text-gray-900">Sourcing Performance</h3>
      <div className="flex flex-col gap-3">
        {sources.map(s => (
          <div key={s.source} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-gray-700 font-medium">{s.source}</span>
              <span className="font-bold text-gray-900">{s.matchAvg} Match Avg.</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 flex items-start gap-2 mt-1">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="mt-0.5 shrink-0">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-[11.5px] text-gray-500">
          <span className="font-semibold text-gray-700">AI Strategy: </span>
          Redirect 15% of LinkedIn budget to GitHub for high-density Engineering roles.
        </p>
      </div>
    </div>
  );
}
