import { useState } from 'react';
import RecruiterStatCard from '../components/ui/RecruiterStatCard';
import ApplicationsTable from '../components/applications/ApplicationsTable';
import { applicationStats, applications } from '../data/applicationsData';

const tabFilters = ['All', 'New', 'Shortlisted'];
const departments = ['Department', 'Engineering', 'Design', 'Marketing', 'Product', 'Sales'];
const jobRoles = ['Job Role', 'Senior Backend Engineer', 'Design Lead', 'Head of Infrastructure', 'Product Manager'];
const matchScores = ['Match Score', '90%+', '80%+', '70%+', 'All'];

export default function Applications() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [dept, setDept] = useState('Department');
    const [role, setRole] = useState('Job Role');
    const [matchFilter, setMatchFilter] = useState('Match Score');

    const filtered = applications.filter(a => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.role.toLowerCase().includes(search.toLowerCase());
        const matchTab = activeTab === 'All' ||
            (activeTab === 'New' && a.status === 'NEW') ||
            (activeTab === 'Shortlisted' && a.status === 'SHORTLISTED');
        const matchDept = dept === 'Department' || a.dept.toLowerCase().includes(dept.toLowerCase());
        return matchSearch && matchTab && matchDept;
    });

    return (
        <div className="flex flex-col gap-6">
            
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[22px] font-bold text-gray-900 mb-0.5">Applications Management</h1>
                    <p className="text-[13.5px] text-gray-500">Review and manage candidates across all active roles</p>
                </div>
                <button className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export Report
                </button>
            </div>

            
            <div className="grid grid-cols-4 gap-4">
                {applicationStats.map((s, i) => (
                    <RecruiterStatCard key={i} {...s} />
                ))}
            </div>

            
            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3">
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-[320px] bg-gray-50">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Candidate name or keyword..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none flex-1 text-[13px] text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        {[
                            [departments, dept, setDept],
                            [jobRoles, role, setRole],
                            [matchScores, matchFilter, setMatchFilter],
                        ].map(([opts, val, setter], i) => (
                            <select
                                key={i}
                                value={val}
                                onChange={e => setter(e.target.value)}
                                className="text-[13px] text-gray-700 border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none cursor-pointer hover:border-gray-300"
                            >
                                {opts.map(o => <option key={o}>{o}</option>)}
                            </select>
                        ))}
                    </div>

                    
                    <div className="flex items-center gap-1">
                        {tabFilters.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors
                                    ${activeTab === tab
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <ApplicationsTable applications={filtered} filter={activeTab} />
            </div>
        </div>
    );
}
