import React from 'react';

export default function TalentMatchingEngine({ matches, totalScored }) {
  return (
    <div className="bg-white rounded-xl border border-teal-100 shadow-sm p-5 flex flex-col gap-4">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <div>
            <div className="font-bold text-[14px] text-gray-900">Talent Matching Engine</div>
            <div className="text-[11.5px] text-gray-400">Top-tier recommendations based on skill graph overlap.</div>
          </div>
        </div>
        <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
          {totalScored} Candidates Scored
        </span>
      </div>

      
      <div className="flex flex-col gap-4">
        {matches.map(m => (
          <div key={m.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full text-white text-[12px] font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: m.color }}
              >
                {m.initials}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[13.5px] text-gray-900">{m.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {m.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[16px] font-bold text-teal-600">{m.confidence}%</div>
                <div className="text-[10px] text-gray-400 uppercase">Confidence</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-700"
                  style={{ width: `${m.confidence}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-teal-600 uppercase">{m.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
