import React from 'react';

export default function AIEvaluationInsights({ candidate }) {
  const { aiInsights } = candidate;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 h-full">
      
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span className="font-bold text-[14px] text-gray-900">AI Evaluation Insights</span>
      </div>

      
      <div>
        <span className="text-[12px] font-bold text-teal-600">Summary: </span>
        <span className="text-[12.5px] text-gray-600 leading-relaxed">{aiInsights.summary}</span>
      </div>

      
      <div>
        <div className="text-[12px] font-semibold text-gray-700 mb-2">Key Strengths</div>
        <ul className="flex flex-col gap-1.5">
          {aiInsights.strengths.map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-[12.5px] text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {s}
            </li>
          ))}
        </ul>
      </div>

      
      <div className="bg-amber-50 border-l-2 border-amber-400 px-3 py-2.5 rounded-r-lg">
        <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-1">Areas for Probing</div>
        <p className="text-[12px] text-amber-800 italic leading-relaxed">"{aiInsights.areasForProbing}"</p>
      </div>

      
      <button className="text-teal-600 text-[12.5px] font-semibold hover:underline text-left">
        Download Comprehensive AI Report
      </button>

      
      <div className="mt-auto text-right">
        <div className="text-[42px] font-bold text-gray-100 leading-none">{aiInsights.marketFitConfidence}%</div>
        <div className="text-[11px] text-gray-400 -mt-1">Market Fit Confidence</div>
      </div>
    </div>
  );
}
