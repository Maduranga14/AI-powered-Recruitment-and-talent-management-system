import React from 'react';

export default function AIUsageBar({ data }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{data.label}</div>
          <div className="text-[12px] text-gray-300">{data.sublabel}</div>
        </div>
        <span className="text-[16px] font-bold text-teal-400">{data.percentage}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-700"
          style={{ width: `${data.percentage}%` }}
        />
      </div>
    </div>
  );
}
