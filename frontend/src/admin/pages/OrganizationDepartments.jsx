import { useState } from 'react';
import { corporateStructure, departments, globalPolicies } from '../data/adminData';

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${enabled ? 'bg-teal-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

const deptIcons = {
  code: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  dollar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
};

export default function OrganizationDepartments() {
  const [policies, setPolicies] = useState(
    Object.fromEntries(globalPolicies.map(p => [p.id, p.enabled]))
  );

  const togglePolicy = id => setPolicies(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Organization &amp; Departments</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Manage company hierarchy, department heads, and global recruitment policies across all entities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Export Structure
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Department
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
        <div className="flex flex-col gap-6">

          {/* Corporate Structure */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="font-semibold text-gray-900 text-[15px]">Corporate Structure</span>
              <button className="flex items-center gap-1.5 text-[12.5px] text-blue-600 font-semibold hover:underline">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Visual Map
              </button>
            </div>

            {/* Parent entity */}
            <div className="bg-[#1e3a5f] text-white rounded-xl px-5 py-4 flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[14px]">{corporateStructure.name}</div>
                  <div className="text-[11.5px] text-blue-200">{corporateStructure.sub}</div>
                </div>
              </div>
              <button className="text-white/60 hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>

            {/* Children */}
            <div className="ml-6 flex flex-col gap-2 border-l-2 border-gray-200 pl-5">
              {corporateStructure.children.map(child => (
                <div key={child.id} className="bg-gray-50 rounded-xl px-4 py-3.5 flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      {deptIcons[child.icon]}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-gray-800">{child.name}</div>
                      <div className="text-[11.5px] text-gray-500">{child.sub}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1">
                    {child.headcount} Headcount
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Directory */}
          <div>
            <div className="font-semibold text-gray-900 text-[15px] mb-4">Department Directory</div>
            <div className="grid grid-cols-3 gap-4">
              {departments.map(dept => (
                <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span
                      className="text-[10.5px] font-bold tracking-wider"
                      style={{ color: dept.badgeColor }}
                    >
                      {dept.badge}
                    </span>
                  </div>
                  <div className="font-bold text-[15px] text-gray-900 mb-2">{dept.name}</div>
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: dept.headColor }}
                    >
                      {dept.headInitials}
                    </div>
                    <span className="text-[12px] text-gray-600">Head: {dept.head}</span>
                  </div>
                  <div className="flex items-center gap-5 border-t border-gray-100 pt-3">
                    <div>
                      <div className="text-[11px] text-gray-400 mb-0.5">Headcount</div>
                      <div className="text-[16px] font-bold text-gray-900">{dept.headcount}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400 mb-0.5">Active Roles</div>
                      <div className="text-[16px] font-bold text-blue-600">{dept.activeRoles}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: Global Recruitment Policies */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#1e3a5f] rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              <span className="font-bold text-[14px]">Global Recruitment Policies</span>
            </div>
            <div className="text-[11.5px] text-blue-200">AI-Driven Optimization Active</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {globalPolicies.map((policy, idx) => (
              <div
                key={policy.id}
                className={`px-5 py-4 ${idx < globalPolicies.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-semibold text-[13.5px] text-gray-800 leading-tight">{policy.label}</span>
                  <Toggle enabled={policies[policy.id]} onChange={() => togglePolicy(policy.id)} />
                </div>
                <p className="text-[12px] text-gray-500 leading-snug">{policy.desc}</p>
              </div>
            ))}
          </div>

          {/* AI Insights Quote */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <div className="text-[11.5px] font-bold text-gray-500 uppercase tracking-wider mb-2">AI Insights</div>
            <p className="text-[12.5px] text-gray-700 italic leading-relaxed">
              "Enabling 'Diversity Bias Shield' for the Engineering division last quarter resulted in a 24% increase in candidate pool diversity without affecting time-to-hire."
            </p>
          </div>

          <button className="w-full py-2.5 border border-gray-200 rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            View Policy Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
