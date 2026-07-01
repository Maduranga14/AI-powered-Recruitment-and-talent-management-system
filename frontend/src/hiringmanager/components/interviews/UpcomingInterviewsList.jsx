import React from 'react';

export default function UpcomingInterviewsList({ interviews }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-[16px] text-gray-900">Upcoming Interviews</h3>
        <span className="text-[12px] font-semibold bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full">
          {interviews.length} Active
        </span>
      </div>

      
      {interviews.map(iv => (
        <div key={iv.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          {/* Top row */}
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
              style={{ backgroundColor: iv.color }}
            >
              {iv.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13.5px] text-gray-900">{iv.name}</div>
              <div className="text-[12px] text-gray-500">{iv.role}</div>
            </div>
            {iv.timeUrgent && iv.time && (
              <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-full shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {iv.time}
              </div>
            )}
            {!iv.timeUrgent && iv.time && (
              <span className="text-[11.5px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full shrink-0">{iv.time}</span>
            )}
            {iv.badge && (
              <span
                className="text-[11px] font-semibold px-2 py-1 rounded-full shrink-0"
                style={{ backgroundColor: iv.badgeColor + '18', color: iv.badgeColor }}
              >
                {iv.badge}
              </span>
            )}
          </div>

          
          {iv.aiInsight && (
            <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 flex items-start gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" className="mt-0.5 shrink-0">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span className="text-[12px] text-teal-700 font-medium">{iv.aiInsight}</span>
            </div>
          )}

          
          <div className="flex items-center gap-2">
            <button
              className={`flex-1 text-[12.5px] font-semibold py-2 rounded-lg transition-colors
                ${iv.actionStyle === 'primary' ? 'bg-gray-900 hover:bg-gray-700 text-white' :
                  iv.actionStyle === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              {iv.action}
            </button>
            {iv.actionStyle !== 'primary' && (
              <button className="p-2 text-gray-400 hover:text-gray-700 transition-colors border border-gray-100 rounded-lg">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
            )}
            {iv.actionStyle === 'primary' && (
              <button className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

     
      <div className="rounded-xl overflow-hidden relative mt-1" style={{ minHeight: '100px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 200 100">
            <circle cx="150" cy="50" r="60" fill="white" />
            <circle cx="60" cy="80" r="40" fill="white" />
          </svg>
        </div>
        <div className="relative p-4">
          <div className="font-bold text-[14px] text-white mb-1">Optimize your workflow</div>
          <div className="text-[12px] text-gray-300">Learn how to use AI scoring to save 4 hours a week on reviews.</div>
        </div>
      </div>
    </div>
  );
}
