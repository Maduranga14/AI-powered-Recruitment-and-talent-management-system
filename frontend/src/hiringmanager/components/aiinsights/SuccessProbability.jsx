import React from 'react';

export default function SuccessProbability({ bars }) {
  const maxH = Math.max(...bars.map(b => b.height));
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[14px] text-gray-900">Success Probability</h3>
          <p className="text-[11.5px] text-gray-400">Historical performance projection based on 4,000+ hires.</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-teal-600">
          <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
          Predicted
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-[100px]">
        {bars.map((b, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md transition-all duration-700"
            style={{
              height: `${(b.height / maxH) * 100}%`,
              backgroundColor: b.highlight ? '#14b8a6' : '#e2e8f0',
            }}
          />
        ))}
      </div>
    </div>
  );
}
