import React from 'react';

export default function AIQualityTrend({ data }) {
  const maxVal = Math.max(...data.map(d => d.high));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[15px] text-gray-900">AI Candidate Quality Trend</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">Average match score for incoming applicants</p>
        </div>
        <div className="flex items-center gap-3 text-[11.5px]">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            High Quality
          </span>
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" />
            Baseline
          </span>
        </div>
      </div>

      
      <div className="flex items-end gap-2 h-[140px] pt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '120px', justifyContent: 'flex-end' }}>
              {/* High bar */}
              <div
                className="w-full rounded-t-md transition-all duration-700"
                style={{
                  height: `${(d.high / maxVal) * 100}%`,
                  backgroundColor: d.week === 'CURRENT' ? '#3b82f6' : '#93c5fd',
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{d.week}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
