import React from 'react';
import AnalyticsStatCards from '../components/analytics/AnalyticsStatCards';
import PipelineFunnel from '../components/analytics/PipelineFunnel';
import AIQualityTrend from '../components/analytics/AIQualityTrend';
import DepartmentDistribution from '../components/analytics/DepartmentDistribution';
import DecisionManagement from '../components/analytics/DecisionManagement';
import { analyticsStats, pipelineFunnel, aiQualityTrend, departmentDistribution, decisionCandidates } from '../data/hmAnalyticsData';

export default function HMAnalytics() {
  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Talent Analytics</h1>
          <p className="text-gray-500 text-[13.5px] mt-1">Real-time recruitment performance and decision pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-gray-200 text-gray-700 text-[13px] font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Last 30 Days
          </button>
          <button className="bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-[1fr_380px] gap-6">
        <AnalyticsStatCards stats={analyticsStats} />
        <PipelineFunnel pipeline={pipelineFunnel} />
      </div>

      
      <div className="grid grid-cols-[1fr_300px] gap-6">
        <AIQualityTrend data={aiQualityTrend} />
        <DepartmentDistribution departments={departmentDistribution} />
      </div>

      
      <DecisionManagement candidates={decisionCandidates} />
    </div>
  );
}
