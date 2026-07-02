import { useState } from 'react';
import { roles, rolePermissions } from '../data/adminData';

function RoleIcon({ type }) {
  const icons = {
    admin: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    dept: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <rect x="2" y="2" width="8" height="6" rx="1" /><rect x="8" y="16" width="8" height="6" rx="1" />
        <line x1="6" y1="8" x2="6" y2="13" /><line x1="18" y1="8" x2="18" y2="13" />
        <line x1="6" y1="13" x2="18" y2="13" /><rect x="14" y="2" width="8" height="6" rx="1" />
        <line x1="12" y1="13" x2="12" y2="16" />
      </svg>
    ),
    recruiter: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    interviewer: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
    analyst: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  };
  return icons[type] || icons.admin;
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-teal-500' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

export default function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState('global-admin');
  const [aiToggles, setAiToggles] = useState({ 'candidate-scoring': true, 'predictive-retention': true });
  const [sysToggles, setSysToggles] = useState({ 'user-lifecycle': true, billing: true, 'audit-log': true });
  const [opsMatrix, setOpsMatrix] = useState({
    'job-postings': { view: true, edit: true, delete: true },
    'candidate-profiles': { view: true, edit: true, delete: true },
    'interview-schedules': { view: true, edit: true, delete: false },
  });

  const toggleAI = id => setAiToggles(p => ({ ...p, [id]: !p[id] }));
  const toggleSys = id => setSysToggles(p => ({ ...p, [id]: !p[id] }));
  const toggleOps = (id, col) => setOpsMatrix(p => ({ ...p, [id]: { ...p[id], [col]: !p[id][col] } }));

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-gray-900">Roles &amp; Permissions</h1>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-[340px_1fr] gap-6 items-start">

        {/* Left: Role List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <span className="text-[13px] font-semibold text-gray-700">Active Roles ({roles.length})</span>
          </div>
          <div className="flex flex-col">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex items-start gap-3.5 px-5 py-4 text-left transition-colors border-b border-gray-50 last:border-0 ${
                  selectedRole === role.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <RoleIcon type={role.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold text-gray-800 mb-0.5">{role.name}</div>
                  <div className="text-[12px] text-gray-500 leading-snug mb-2">{role.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {role.tags.map(tag => (
                      <span key={tag} className="text-[10.5px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
                {selectedRole === role.id && (
                  <div className="w-1 self-stretch rounded-full bg-blue-600 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Permission Detail */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Role header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-[16px] font-bold text-gray-900">{selectedRoleData?.name}</span>
              {selectedRoleData?.isDefault && (
                <span className="text-[10.5px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded tracking-wide">SYSTEM DEFAULT</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Discard</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-colors">Save Changes</button>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-6">

            {/* AI & Intelligence Insights */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </div>
                <span className="font-semibold text-[14px] text-gray-900">AI &amp; Intelligence Insights</span>
              </div>
              <div className="flex flex-col gap-3">
                {rolePermissions.aiInsights.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50">
                    <div>
                      <div className="text-[13.5px] font-semibold text-gray-800">{item.label}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">{item.desc}</div>
                    </div>
                    <Toggle enabled={aiToggles[item.id]} onChange={() => toggleAI(item.id)} />
                  </div>
                ))}
              </div>
            </div>

            {/* System Management */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
                </svg>
                <span className="font-semibold text-[14px] text-gray-900">System Management</span>
              </div>
              <div className="flex flex-col gap-3">
                {rolePermissions.systemManagement.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50">
                    <div>
                      <div className="text-[13.5px] font-semibold text-gray-800">{item.label}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">{item.desc}</div>
                    </div>
                    <Toggle enabled={sysToggles[item.id]} onChange={() => toggleSys(item.id)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recruitment Operations */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                <span className="font-semibold text-[14px] text-gray-900">Recruitment Operations</span>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="text-left py-3 px-4">Permission</th>
                      <th className="text-center py-3 px-4">View</th>
                      <th className="text-center py-3 px-4">Edit</th>
                      <th className="text-center py-3 px-4">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rolePermissions.recruitmentOps.map(item => (
                      <tr key={item.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-3.5 px-4 text-[13px] text-gray-800">{item.label}</td>
                        {['view', 'edit', 'delete'].map(col => (
                          <td key={col} className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={opsMatrix[item.id]?.[col] ?? false}
                              onChange={() => toggleOps(item.id, col)}
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  Administrators have permanent "Delete" privileges.
                </div>
                <button className="text-[12.5px] text-red-500 font-semibold hover:underline">Delete Role Profile</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
