import React, { useState } from 'react'
import RecruiterStatCard from '../components/ui/RecruiterStatCard';
import { jobStats, jobs } from '../data/jobManagementData';
import JobsTable from '../components/jobs/JobsTable';

const tabs = ['All', 'Active', 'Draft', 'Closed'];
const departments = ['All Departments', 'Engineering', 'Design', 'Marketing', 'Sales & Ops'];
const locations = ['All Locations', 'Remote', 'New York', 'San Francisco', 'London'];

export default function JobManagement() {
    const [activeTab, setActiveTab] = useState('All');
    const [dept, setDept] = useState('All Departments');
    const [location, setLocation] = useState('All Locations');

    const filtered = jobs.filter(j => {
        const matchTab = activeTab === 'All' || j.status === activeTab;
        const matchDept = dept === 'All Departments' || j.department === dept;
        return matchTab && matchDept;
    });

  return (
    <div className="flex flex-col gap-6">
        
        <div className="flex items-start justify-between">
            <div>
                <h1 className="text-[22px] font-bold text-gray-900 mb-0.5">Job Management</h1>
                <p className="text-[13.5px] text-gray-500">Manage your organization's open roles and track hiring progress.</p>
            </div>
            <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Post New Job
            </button>
        </div>


        <div className="grid grid-cols-4 gap-4">
            {jobStats.map((s, i) => (
                <RecruiterStatCard key={i} {...s} />
            ))}
        </div>


        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors
                                ${activeTab === tab
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={dept}
                        onChange={e => setDept(e.target.value)}
                        className="text-[13px] text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none cursor-pointer hover:border-gray-300"
                    >
                        {departments.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <select
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="text-[13px] text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none cursor-pointer hover:border-gray-300"
                    >
                        {locations.map(l => <option key={l}>{l}</option>)}
                    </select>
                </div>
            </div>


            <JobsTable jobs={filtered} filter={activeTab} />
        </div>
    </div>
  )
}
