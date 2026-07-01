import React, { useState } from 'react';

const decisions = [
  { id: 'strongly', label: 'Strongly Recommended', sub: 'HIGH CONFIDENCE MATCH', color: '#14b8a6' },
  { id: 'consider', label: 'Consider / Move Forward', sub: 'MODERATE CONFIDENCE', color: '#94a3b8' },
  { id: 'not', label: 'Not Recommended', sub: 'LOW CONFIDENCE', color: '#94a3b8' },
];

export default function CandidateScorePanel({ candidate, onSaveDraft, onSubmit }) {
  const [selected, setSelected] = useState('strongly');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: candidate.color }}
          >
            {candidate.initials}
          </div>
          <div>
            <div className="font-bold text-[18px] text-gray-900">{candidate.name}</div>
            <div className="text-[13px] text-gray-500">{candidate.role} • ID: {candidate.id}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12px] text-gray-400 font-medium">Overall Score</div>
          <div className="text-[28px] font-bold text-teal-600">{candidate.overallScore}<span className="text-[16px] text-gray-400">/10</span></div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-[14px] text-gray-800 mb-1">Category Scores</h3>
          {candidate.categoryScores.map(cs => (
            <div key={cs.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-700">{cs.label}</span>
                <span className="font-semibold text-gray-900">{cs.score}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${(cs.score / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}

          
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={onSaveDraft}
              className="flex-1 border border-gray-200 text-gray-700 text-[13px] font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-semibold py-2.5 rounded-xl transition-colors"
            >
              Submit Evaluation
            </button>
          </div>
        </div>

        
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-[14px] text-gray-800 mb-1">Final Decision</h3>
          {decisions.map(d => (
            <button
              key={d.id}
              onClick={() => setSelected(d.id)}
              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150
                ${selected === d.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors
                ${selected === d.id ? 'border-teal-500' : 'border-gray-300'}`}
              >
                {selected === d.id && <div className="w-2 h-2 rounded-full bg-teal-500" />}
              </div>
              <div>
                <div className={`font-semibold text-[13px] ${selected === d.id ? 'text-teal-700' : 'text-gray-700'}`}>
                  {d.label}
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5">{d.sub}</div>
              </div>
              {selected === d.id && (
                <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
