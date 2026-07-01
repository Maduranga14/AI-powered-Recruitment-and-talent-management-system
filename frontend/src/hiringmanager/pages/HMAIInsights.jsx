import React from 'react';
import InsightStatCards from '../components/aiinsights/InsightStatCards';
import TalentMatchingEngine from '../components/aiinsights/TalentMatchingEngine';
import SourcingPerformance from '../components/aiinsights/SourcingPerformance';
import SuccessProbability from '../components/aiinsights/SuccessProbability';
import AIInterviewPrep from '../components/aiinsights/AIInterviewPrep';
import AIUsageBar from '../components/aiinsights/AIUsageBar';
import { insightStats, talentMatches, sourcingPerformance, successProbabilityBars, aiInterviewPrep, aiUsage } from '../data/hmAIInsightsData';

export default function HMAIInsights() {
  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Executive AI Insights</h1>
          <p className="text-gray-500 text-[13.5px] mt-1">
            Proprietary deep-learning analysis of your current hiring funnel, talent density, and long-term retention forecasting.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-gray-200 text-gray-700 text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
          <button className="bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh Engine
          </button>
        </div>
      </div>

      
      <InsightStatCards stats={insightStats} />

      
      <div className="grid grid-cols-[1fr_320px] gap-6">
        <TalentMatchingEngine matches={talentMatches} totalScored={34} />
        <SourcingPerformance sources={sourcingPerformance} />
      </div>

      
      <AIUsageBar data={aiUsage} />

      
      <div className="grid grid-cols-[1fr_1fr] gap-6">
        <SuccessProbability bars={successProbabilityBars} />
        <AIInterviewPrep data={aiInterviewPrep} />
      </div>
    </div>
  );
}
