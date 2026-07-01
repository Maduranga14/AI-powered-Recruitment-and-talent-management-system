import React from 'react';

export default function PipelineFunnel({ pipeline }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[15px] text-gray-900">Pipeline Funnel</h3>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {pipeline.map((stage, i) => (
          <div key={stage.stage} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="font-medium text-gray-700">{stage.stage}</span>
              {stage.count && <span className="font-bold text-gray-900">{stage.count.toLocaleString()}</span>}
              <span className="text-gray-400">{stage.percentage}%</span>
            </div>
            <div className="h-6 rounded-md overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
              <div
                className="h-full rounded-md transition-all duration-700 flex items-center pl-2"
                style={{
                  width: `${stage.percentage}%`,
                  backgroundColor: stage.color,
                  minWidth: '20px',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
