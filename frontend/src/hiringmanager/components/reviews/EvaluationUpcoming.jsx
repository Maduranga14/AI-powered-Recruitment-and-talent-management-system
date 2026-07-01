import React from 'react';

export default function EvaluationUpcoming({ interviews, onViewAll }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-[14px] text-gray-800">Upcoming Interviews</h3>
        <button onClick={onViewAll} className="text-[12.5px] text-teal-600 font-semibold hover:underline">
          View All
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-50">
            {['Candidate', 'Role', 'Date & Time', 'Panel', 'Status', 'Action'].map(h => (
              <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-6 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {interviews.map((iv, i) => (
            <tr key={iv.id} className={`hover:bg-gray-50 transition-colors ${i < interviews.length - 1 ? 'border-b border-gray-50' : ''}`}>
            
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: iv.color }}
                  >
                    {iv.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-[13px] text-gray-900">{iv.name}</div>
                    <div className="text-[11.5px] text-gray-400">{iv.email}</div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 text-[13px] text-gray-600">{iv.role}</td>
             
              <td className="px-6 py-4 text-[13px] text-gray-600">{iv.date}</td>
              
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-[9px] text-teal-700 font-bold">
                    {iv.initials[0]}
                  </div>
                  {iv.panelExtra > 0 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] text-gray-600 font-bold -ml-1">
                      +{iv.panelExtra}
                    </div>
                  )}
                </div>
              </td>
             
              <td className="px-6 py-4">
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: iv.status === 'LIVE NOW' ? '#dcfce7' : '#f1f5f9',
                    color: iv.status === 'LIVE NOW' ? '#16a34a' : '#64748b',
                  }}
                >
                  {iv.status}
                </span>
              </td>
             
              <td className="px-6 py-4">
                {iv.action === 'JOIN ROOM' ? (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    JOIN ROOM
                  </button>
                ) : (
                  <button className="text-gray-400 hover:text-gray-700 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
