import React from 'react';

function StarRating({ stars, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i < stars ? '#14b8a6' : 'none'}
          stroke={i < stars ? '#14b8a6' : '#d1d5db'}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

const categoryIcons = {
  communication: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  technical: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  leadership: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  problem: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  cultural: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
};

export default function SkillScoreCards({ scores }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {scores.map(score => (
        <div key={score.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center gap-2">
          <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center">
            {categoryIcons[score.id] || categoryIcons.communication}
          </div>
          <div className="text-[18px] font-bold text-gray-900">{score.score}/{score.maxScore}</div>
          <div className="text-[11.5px] text-gray-500 font-medium">{score.label}</div>
          <StarRating stars={score.stars} />
        </div>
      ))}
    </div>
  );
}
