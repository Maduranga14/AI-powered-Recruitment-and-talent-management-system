import React from 'react';

const statusStyles = {
  'Interviewing': { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
  'Review': { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
  'Offer Pending': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
};

export default function CandidateReviewTable({ candidates, onExport, onAdd }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-[16px] text-gray-900">Candidate Review</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="text-[13px] text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={onAdd}
            className="text-[13px] text-white bg-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Add Candidate
          </button>
        </div>
      </div>

      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['NAME', 'POSITION', 'EXP.', 'SKILLS', 'AI SCORE', 'STATUS', ''].map(col => (
                <th key={col} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-6 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, i) => {
              const style = statusStyles[c.status] || { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
              return (
                <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === candidates.length - 1 ? 'border-b-0' : ''}`}>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full text-white text-[12px] font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.initials}
                      </div>
                      <span className="font-semibold text-[13.5px] text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-[13px] text-gray-600">{c.position}</td>
                  
                  <td className="px-6 py-4 text-[13px] text-gray-600">{c.exp}</td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${c.skills}%`, backgroundColor: c.skills >= 90 ? '#14b8a6' : '#3b82f6' }}
                        />
                      </div>
                      <span className="text-[12px] text-gray-600 font-medium">{c.skills}%</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-bold text-teal-600">{c.aiScore}</span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span
                      className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full border"
                      style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                    >
                      {c.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" />
                        <circle cx="12" cy="19" r="1" fill="currentColor" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-[12.5px] text-gray-400">
        <span>Showing 3 of 48 candidates</span>
        <div className="flex items-center gap-3">
          <button className="hover:text-gray-700 transition-colors">Previous</button>
          <button className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
