import React, { useState } from 'react';

const filterTabs = ['Pending Reviews', 'Selected', 'Rejected'];

export default function DecisionManagement({ candidates }) {
  const [activeTab, setActiveTab] = useState('Pending Reviews');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[16px] text-gray-900">Decision Management</h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-md transition-colors
                ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {candidates.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
            
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: c.color }}
              >
                {c.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px] text-gray-900 truncate">{c.name}</div>
                <div className="text-[11.5px] text-gray-500 truncate">{c.role}</div>
              </div>
            </div>

            
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: c.aiMatch >= 90 ? '#f0fdfa' : c.aiMatch >= 80 ? '#eff6ff' : '#fef2f2',
                  color: c.aiMatch >= 90 ? '#0f766e' : c.aiMatch >= 80 ? '#1d4ed8' : '#b91c1c',
                }}
              >
                {c.level}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[18px] font-bold" style={{ color: c.aiMatch >= 90 ? '#14b8a6' : c.aiMatch >= 80 ? '#3b82f6' : '#ef4444' }}>{c.aiMatch}</span>
                <span className="text-[10px] text-gray-400">AI MATCH</span>
              </div>
            </div>

            
            <div
              className="rounded-lg px-3 py-2.5 flex items-start gap-2"
              style={{
                backgroundColor: c.type === 'ai-recommendation' ? '#f0fdfa' : c.type === 'ai-warning' ? '#fef2f2' : '#f8fafc',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={c.type === 'ai-recommendation' ? '#14b8a6' : c.type === 'ai-warning' ? '#ef4444' : '#64748b'}
                strokeWidth="2" className="mt-0.5 shrink-0"
              >
                {c.type === 'manager-note' ? (
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                ) : (
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                )}
              </svg>
              <div className="text-[11.5px] leading-relaxed" style={{ color: c.type === 'ai-warning' ? '#b91c1c' : '#475569' }}>
                {c.note}
              </div>
            </div>

            
            <div className="flex items-center gap-3 text-[11.5px] text-gray-500">
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
                {c.pipeline} in pipeline
              </span>
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {c.interviews} Interviews
              </span>
            </div>

            
            <button
              className={`w-full text-[12.5px] font-semibold py-2.5 rounded-xl transition-colors
                ${c.actionStyle === 'primary' ? 'bg-gray-900 hover:bg-gray-700 text-white' :
                  c.actionStyle === 'outline' ? 'border border-gray-200 text-gray-700 hover:bg-gray-50' :
                  'bg-red-500 hover:bg-red-600 text-white'
                }`}
            >
              {c.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
