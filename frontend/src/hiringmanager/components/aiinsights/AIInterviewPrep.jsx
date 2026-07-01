import React from 'react';

export default function AIInterviewPrep({ data }) {
  const sections = [data.focusArea, data.suggestedQuestion, data.skillGapProbe];
  const colors = ['#14b8a6', '#14b8a6', '#14b8a6'];

  return (
    <div className="bg-gray-900 rounded-xl p-5 flex flex-col gap-4">
      
      <div className="flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <span className="font-bold text-[14px] text-white">AI Interview Preparation</span>
      </div>
      <p className="text-[12px] text-gray-400">Generated for: <span className="text-teal-400 font-medium">{data.candidate}</span></p>

      {sections.map((section, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">{section.title}</div>
          <p className="text-[12.5px] text-gray-300 leading-relaxed">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
