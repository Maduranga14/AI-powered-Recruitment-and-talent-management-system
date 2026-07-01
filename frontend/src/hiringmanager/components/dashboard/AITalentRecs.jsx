import React from 'react';

export default function AITalentRecs({ recs, onViewAll }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <span className="font-bold text-[15px] text-gray-900">AI Talent Recs</span>
      </div>

      
      <div className="flex flex-col gap-4">
        {recs.map(rec => (
          <div key={rec.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-[13.5px] text-gray-900">{rec.name}</div>
                <div className="text-[12px] text-gray-500">{rec.role}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-bold text-teal-600">{rec.match}% Match</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">{rec.label}</div>
              </div>
            </div>
            <div
              className="text-[12px] rounded-lg px-3 py-2 leading-relaxed"
              style={{
                backgroundColor: rec.analysisType === 'skill' ? '#f0fdfa' : '#f8fafc',
                color: rec.analysisType === 'skill' ? '#0f766e' : '#475569',
              }}
            >
              {rec.analysis}
            </div>
          </div>
        ))}
      </div>

      
      <button
        onClick={onViewAll}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        View Top 5 Matches
      </button>
    </div>
  );
}
