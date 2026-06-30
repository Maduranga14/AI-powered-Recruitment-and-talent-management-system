import { useState } from 'react';
import RecruiterStatCard from '../components/ui/RecruiterStatCard';
import ApplicationVolumeTrend from '../components/reports/ApplicationVolumeTrend';
import DepartmentPipeline from '../components/reports/DepartmentPipeline';
import TopPerformingJobs from '../components/reports/TopPerformingJobs';
import { reportStats, volumeTrendData, departmentPipeline, topPerformingJobs } from '../data/reportsData';

const periods = ['Last 30 Days', 'Last 7 Days', 'Last 90 Days', 'This Year'];

export default function ReportsAnalytics() {
    const [period, setPeriod] = useState('Last 30 Days');

    return (
        <div className="flex flex-col gap-6">
          
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[22px] font-bold text-gray-900 mb-0.5">Reports & Analytics</h1>
                    <p className="text-[13.5px] text-gray-500">
                        Comprehensive insights into your recruitment lifecycle and AI efficiency.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                  
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2.5 bg-white hover:border-gray-300 cursor-pointer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <select
                            value={period}
                            onChange={e => setPeriod(e.target.value)}
                            className="text-[13px] text-gray-700 bg-transparent outline-none cursor-pointer"
                        >
                            {periods.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <button className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export Report
                    </button>
                </div>
            </div>

            
            <div className="grid grid-cols-4 gap-4">
                {reportStats.map((s, i) => (
                    <RecruiterStatCard key={i} {...s} />
                ))}
            </div>

            
            <ApplicationVolumeTrend data={volumeTrendData} />

            
            <div className="grid grid-cols-[1fr_1fr] gap-6">
                <DepartmentPipeline pipeline={departmentPipeline} />
                <TopPerformingJobs jobs={topPerformingJobs} onViewAll={() => {}} />
            </div>
        </div>
    );
}
