import React from 'react';

export default function HiringVelocity({ data }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
      
      <div className="absolute right-3 bottom-3 opacity-10">
        <svg width="60" height="50" viewBox="0 0 24 20" fill="none">
          <rect x="0" y="12" width="4" height="8" rx="1" fill="white" />
          <rect x="5" y="8" width="4" height="12" rx="1" fill="white" />
          <rect x="10" y="5" width="4" height="15" rx="1" fill="white" />
          <rect x="15" y="2" width="4" height="18" rx="1" fill="white" />
          <rect x="20" y="0" width="4" height="20" rx="1" fill="white" />
        </svg>
      </div>

      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">HIRING VELOCITY</div>

      <div>
        <span className="text-[38px] font-bold text-white leading-none">{data.days}</span>
        <span className="text-[15px] text-gray-300 ml-2">Days to Hire (Avg)</span>
      </div>

      <p className="text-[12.5px] text-gray-400 leading-relaxed">
        You're currently{' '}
        <span className="text-teal-400 font-semibold">{data.comparedTo} days faster</span>{' '}
        than the department average. Keep up the momentum.
      </p>
    </div>
  );
}
