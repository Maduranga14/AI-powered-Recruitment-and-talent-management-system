import { useState } from 'react';
import RecruiterStatCard from '../components/ui/RecruiterStatCard';
import InterviewsTable from '../components/interviews/InterviewsTable';
import { interviewStats, upcomingInterviews } from '../data/interviewManagementData';

const timePeriods = ['Next 7 Days', 'Today', 'Next 30 Days', 'This Month'];
const departments = ['All Departments', 'Engineering', 'Product', 'Marketing', 'Design', 'AI'];
const interviewTypes = ['Interview Type', 'Technical Deep-dive', 'Final Panel', 'System Design', 'Culture Fit', 'HR Screen'];

export default function InterviewManagement() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState('Next 7 Days');
    const [dept, setDept] = useState('All Departments');
    const [type, setType] = useState('Interview Type');

    const filtered = upcomingInterviews.filter(iv => {
        const q = search.toLowerCase();
        return (
            iv.name.toLowerCase().includes(q) ||
            iv.role.toLowerCase().includes(q) ||
            iv.email.toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex flex-col gap-6">
            
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[12.5px] text-gray-400 font-medium mb-0.5">Interview Management</p>
                    <p className="text-[13.5px] text-gray-600 max-w-[480px]">
                        Coordinate and track candidate evaluations across all active pipelines.
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <line x1="12" y1="14" x2="12" y2="18" />
                        <line x1="10" y1="16" x2="14" y2="16" />
                    </svg>
                    Schedule New Interview
                </button>
            </div>

            
            <div className="grid grid-cols-3 gap-4">
                {interviewStats.map((s, i) => (
                    <RecruiterStatCard key={i} {...s} />
                ))}
            </div>

            
            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                
                <div className="flex items-center border-b border-gray-200 px-5">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex items-center gap-1.5 py-4 px-1 mr-5 text-[13.5px] font-semibold border-b-2 transition-colors
                            ${activeTab === 'upcoming'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        Upcoming Interviews
                        <span className="bg-teal-100 text-teal-700 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                            {upcomingInterviews.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('queue')}
                        className={`py-4 px-1 text-[13.5px] font-semibold border-b-2 transition-colors
                            ${activeTab === 'queue'
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        Scheduling Queue
                    </button>
                </div>

                
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-[280px] bg-gray-50">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Candidate or interviewer..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none flex-1 text-[13px] text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-300">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <select value={period} onChange={e => setPeriod(e.target.value)}
                            className="text-[13px] text-gray-700 bg-transparent outline-none cursor-pointer">
                            {timePeriods.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>

                    
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-300">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                        <select value={dept} onChange={e => setDept(e.target.value)}
                            className="text-[13px] text-gray-700 bg-transparent outline-none cursor-pointer">
                            {departments.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>

                    
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-300">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                        <select value={type} onChange={e => setType(e.target.value)}
                            className="text-[13px] text-gray-700 bg-transparent outline-none cursor-pointer">
                            {interviewTypes.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>

                    <button className="ml-auto text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                        </svg>
                    </button>
                </div>

                {activeTab === 'upcoming'
                    ? <InterviewsTable interviews={filtered} />
                    : (
                        <div className="py-16 text-center text-gray-400">
                            <svg width="40" height="40" className="mx-auto mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <p className="text-[14px] font-medium">No items in scheduling queue</p>
                            <p className="text-[12.5px]">Pending interview requests will appear here</p>
                        </div>
                    )
                }
            </div>
        </div>
    );
}
