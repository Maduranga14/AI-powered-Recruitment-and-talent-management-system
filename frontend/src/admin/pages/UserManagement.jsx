import { useState } from 'react';
import { userStats, userDirectory } from '../data/adminData';

const ROLE_COLORS = {
  Admin: 'bg-blue-50 text-blue-700',
  Recruiter: 'bg-violet-50 text-violet-700',
  'Hiring Manager': 'bg-teal-50 text-teal-700',
  Interviewer: 'bg-amber-50 text-amber-700',
};

export default function UserManagement() {
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const roles = ['All Roles', 'Admin', 'Recruiter', 'Hiring Manager', 'Interviewer'];
  const statuses = ['All', 'Active', 'Inactive'];

  const filtered = userDirectory.filter(u => {
    const roleOk = roleFilter === 'All Roles' || u.role === roleFilter;
    const statusOk = statusFilter === 'All' || u.status === statusFilter;
    return roleOk && statusOk;
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">User Management</h1>
          <p className="text-[13px] text-gray-500 mt-1">Control access, manage roles, and monitor recruiter activity across the portal.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Stat Cards + AI Insight */}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-stretch">
        {userStats.map(stat => (
          <div key={stat.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {stat.id === 'total-users' ? (
                    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>
                  ) : stat.id === 'admins' ? (
                    <><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></>
                  ) : (
                    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>
                  )}
                </svg>
              </div>
              {stat.badge && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">{stat.badge}</span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-[12.5px] text-gray-500">{stat.label}</div>
          </div>
        ))}

        {/* AI Insight */}
        <div className="bg-white rounded-xl border-l-4 border-l-teal-500 border border-gray-200 p-5 min-w-[240px] max-w-[280px]">
          <div className="flex items-center gap-1.5 text-teal-600 font-semibold text-[12.5px] mb-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5" /></svg>
            AI Insight
          </div>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            3 Recruiter accounts haven't logged in for 30+ days. Recommend deactivation to optimize seats.
          </p>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-[15px] text-gray-900">User Directory</span>
            <span className="bg-gray-100 text-gray-600 text-[11.5px] font-semibold px-2 py-0.5 rounded-full">
              {filtered.filter(u => u.status === 'Active').length} Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-[12.5px] border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white outline-none cursor-pointer hover:border-gray-300"
            >
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-[12.5px] border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white outline-none cursor-pointer hover:border-gray-300"
            >
              {statuses.map(s => <option key={s}>Status: {s}</option>)}
            </select>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <th className="text-left py-3 px-6">Name & Email</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Last Login</th>
              <th className="text-left py-3 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full text-white text-[10.5px] font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.initials}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-gray-800">{user.name}</div>
                      <div className="text-[11.5px] text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`flex items-center gap-1.5 text-[12.5px] font-medium ${user.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-[12.5px] text-gray-500">{user.lastLogin}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button className="text-[12px] text-blue-600 font-medium hover:underline">Edit</button>
                    <span className="text-gray-200">|</span>
                    <button className="text-[12px] text-red-500 font-medium hover:underline">
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <span className="text-[12.5px] text-gray-500">Showing 1 to {filtered.length} of 124 users</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all ${
                  page === n ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(3, p + 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
