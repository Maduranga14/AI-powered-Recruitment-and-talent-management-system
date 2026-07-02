import { useState } from 'react';
import {
  dashboardStats, hiringFunnelData, orgSummary, recentAdminActivity,
} from '../data/adminData';

/* ── Stat Card ── */
function StatCard({ stat }) {
  const icons = {
    users: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    server: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    api: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
        <path d="M2 20h20" />
      </svg>
    ),
    shield: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  };

  const badgeStyle = {
    up: 'bg-green-50 text-green-700',
    optimal: 'bg-green-50 text-green-700',
    info: 'bg-gray-100 text-gray-600',
    stable: 'bg-gray-100 text-gray-600',
  };

  const iconColors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    teal: 'text-teal-600 bg-teal-50',
    red: 'text-red-500 bg-red-50',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColors[stat.color]}`}>
          {icons[stat.icon]}
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeStyle[stat.badgeType]}`}>
          {stat.badge}
        </span>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
        <div className="text-[12.5px] text-gray-500 mt-0.5">{stat.label}</div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${stat.color === 'blue' ? 'bg-blue-600' : stat.color === 'green' ? 'bg-green-500' : stat.color === 'teal' ? 'bg-teal-500' : 'bg-red-400'}`}
          style={{ width: stat.color === 'red' ? '5%' : stat.color === 'green' ? '99%' : stat.color === 'teal' ? '75%' : '78%' }}
        />
      </div>
    </div>
  );
}

/* ── Hiring Funnel Bar Chart (pure SVG) ── */
function HiringFunnelChart({ data }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.applications, d.interviews)));
  const chartH = 160;
  const barW = 18;
  const gap = 8;
  const groupW = barW * 2 + gap;
  const groupGap = 20;
  const totalW = data.length * (groupW + groupGap);

  return (
    <svg width="100%" viewBox={`0 0 ${totalW + 20} ${chartH + 36}`} className="overflow-visible">
      {data.map((d, i) => {
        const x = 10 + i * (groupW + groupGap);
        const appH = Math.round((d.applications / maxVal) * chartH);
        const intH = Math.round((d.interviews / maxVal) * chartH);
        return (
          <g key={d.day}>
            {/* Applications bar */}
            <rect x={x} y={chartH - appH} width={barW} height={appH} rx="3" fill="#1e3a5f" />
            {/* Interviews bar */}
            <rect x={x + barW + gap} y={chartH - intH} width={barW} height={intH} rx="3" fill="#2563EB" />
            {/* Day label */}
            <text x={x + barW + gap / 2} y={chartH + 18} textAnchor="middle" fontSize="11" fill="#9ca3af">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Module Badge ── */
function ModuleBadge({ label }) {
  const colors = {
    SECURITY: 'bg-purple-50 text-purple-700',
    USERS: 'bg-blue-50 text-blue-700',
    DATABASE: 'bg-amber-50 text-amber-700',
    AUTH: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded ${colors[label] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const [funnelView, setFunnelView] = useState('weekly');

  return (
    <div className="flex flex-col gap-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {dashboardStats.map(stat => <StatCard key={stat.id} stat={stat} />)}
      </div>

      {/* Funnel + Org Summary */}
      <div className="grid grid-cols-[1fr_280px] gap-6">

        {/* Global Hiring Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-semibold text-gray-900 text-[15px]">Global Hiring Funnel</div>
              <div className="text-[12.5px] text-gray-500 mt-0.5">Applications vs Interviews throughput</div>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {['Daily', 'Weekly'].map(v => (
                <button
                  key={v}
                  onClick={() => setFunnelView(v.toLowerCase())}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                    funnelView === v.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mb-4">
            <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
              <span className="w-3 h-3 rounded-sm bg-[#1e3a5f] inline-block" /> APPLICATIONS
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
              <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" /> INTERVIEWS
            </div>
          </div>

          <HiringFunnelChart data={hiringFunnelData[funnelView]} />
        </div>

        {/* Org Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <div className="font-semibold text-gray-900 text-[15px]">Organization Summary</div>

          <div className="flex flex-col gap-3">
            {[
              { icon: '🏢', label: 'Active Departments', sub: '8 Functional Units', value: orgSummary.activeDepartments },
              { icon: '👥', label: 'Total Employees', sub: 'All Regions', value: orgSummary.totalEmployees.toLocaleString() },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="text-[13px] font-semibold text-gray-800">{item.label}</div>
                    <div className="text-[11px] text-gray-500">{item.sub}</div>
                  </div>
                </div>
                <div className="text-[22px] font-bold text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Department Distribution</div>
            <div className="flex flex-col gap-2.5">
              {orgSummary.distribution.map(d => (
                <div key={d.dept}>
                  <div className="flex justify-between text-[12.5px] text-gray-700 mb-1">
                    <span>{d.dept}</span><span className="font-semibold">{d.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admin Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="font-semibold text-gray-900 text-[15px]">Recent Admin Activity</div>
          <button className="text-[13px] text-blue-600 font-semibold hover:underline">View All Logs</button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="text-left pb-3 pl-1">Administrator</th>
              <th className="text-left pb-3">Action</th>
              <th className="text-left pb-3">Module</th>
              <th className="text-left pb-3">Timestamp</th>
              <th className="text-left pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentAdminActivity.map(row => (
              <tr key={row.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3.5 pl-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {row.initials}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-gray-800">{row.name}</div>
                      <div className="text-[11px] text-gray-400">{row.sub}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 text-[13px] text-gray-700">{row.action}</td>
                <td className="py-3.5"><ModuleBadge label={row.module} /></td>
                <td className="py-3.5 text-[12.5px] text-gray-500">{row.timestamp}</td>
                <td className="py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                    row.status === 'Success' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Success' ? 'bg-teal-500' : 'bg-red-500'}`} />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
