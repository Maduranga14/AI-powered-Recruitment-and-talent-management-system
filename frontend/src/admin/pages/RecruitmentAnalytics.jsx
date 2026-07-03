import { analyticsKPIs, hiringPipeline, deptPerformance, sourcingROI } from '../data/adminData';

/* ── KPI Card ── */
function KPICard({ kpi }) {
  const trendColor = kpi.trendUp === null ? 'text-gray-500' : kpi.trendUp ? 'text-green-600' : 'text-red-500';
  const trendBg = kpi.trendUp === null ? 'bg-gray-100' : kpi.trendUp ? 'bg-green-50' : 'bg-red-50';
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold text-gray-400 tracking-wider">{kpi.label}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${trendBg} ${trendColor}`}>
          {kpi.trend}
        </span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
        {kpi.unit && <span className="text-[13px] text-gray-500 mb-0.5">{kpi.unit}</span>}
      </div>
    </div>
  );
}

/* ── Pipeline Funnel ── */
function PipelineFunnel({ stages }) {
  const maxCount = stages[0].count;
  const colors = ['#1e3a5f', '#374151', '#2563EB', '#0284c7', '#0d9488'];
  return (
    <div className="flex items-end justify-start gap-3 flex-wrap">
      {stages.map((stage, i) => {
        const widthPct = Math.round((stage.count / maxCount) * 100);
        return (
          <div key={stage.stage} className="flex flex-col items-center gap-2">
            <div
              className="flex items-center justify-center rounded-lg text-white font-bold text-[15px] min-w-[90px] py-4"
              style={{ backgroundColor: colors[i], width: `${Math.max(widthPct, 30)}px`, minWidth: '90px' }}
            >
              {stage.count.toLocaleString()}
            </div>
            <div className="text-[10.5px] font-bold text-gray-600 text-center">{stage.stage}</div>
            {stage.cr && <div className="text-[11px] text-gray-500 text-center">{stage.cr}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Star Rating ── */
function Stars({ score }) {
  return (
    <span className="flex items-center gap-0.5">
      <span className="text-[13px] font-semibold text-gray-800">{score}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </span>
  );
}

export default function RecruitmentAnalytics() {
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Recruitment Analytics</h1>
          <p className="text-[13px] text-gray-500 mt-1">Real-time performance metrics across the global hiring cycle.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {analyticsKPIs.map(kpi => <KPICard key={kpi.id} kpi={kpi} />)}
      </div>

      {/* Global Hiring Pipeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-1">
          <div className="font-semibold text-gray-900 text-[15px]">Global Hiring Pipeline</div>
          <div className="text-[12.5px] text-gray-500">Candidate flow through recruitment stages</div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mb-5 mt-3">
          {[{ label: 'Top Funnel', color: '#1e3a5f' }, { label: 'Mid Funnel', color: '#2563EB' }, { label: 'Hired', color: '#0d9488' }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[12px] text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: l.color }} />
              {l.label}
            </div>
          ))}
        </div>

        <PipelineFunnel stages={hiringPipeline} />

        {/* Drop-off & Velocity */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Candidate Drop-off</div>
            <div className="text-[13.5px] font-semibold text-red-600">Applied → Screened<br />(65.7%)</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Conversion Velocity</div>
            <div className="text-[22px] font-bold text-gray-900">4.2 <span className="text-[13px] text-gray-500 font-normal">days/stage avg</span></div>
          </div>
          <div className="bg-teal-50 rounded-lg px-4 py-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <p className="text-[12px] text-teal-700 leading-snug">
              AI predicts a <strong>5.4% increase</strong> in hire volume next month based on current sourcing trends.
            </p>
          </div>
        </div>
      </div>

      {/* Performance by Dept + Sourcing ROI */}
      <div className="grid grid-cols-[1fr_1fr] gap-6">

        {/* Performance by Department */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-semibold text-gray-900 text-[15px]">Performance by Department</div>
            <button className="text-gray-400 hover:text-gray-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {deptPerformance.map(dept => (
              <div key={dept.dept}>
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <span className="text-gray-800 font-medium">{dept.dept}</span>
                  <span className="text-gray-500">{dept.roles} Active Roles</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${dept.pct}%`,
                      backgroundColor: dept.pct > 80 ? '#1e3a5f' : dept.pct > 60 ? '#2563EB' : dept.pct > 40 ? '#60a5fa' : '#94a3b8',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 text-[12.5px] text-blue-600 font-semibold hover:underline">
            View Detailed Department Breakdown →
          </button>
        </div>

        {/* Sourcing Channel ROI */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-semibold text-gray-900 text-[15px]">Sourcing Channel ROI</div>
            <span className="text-[10.5px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">AI RECOMMENDED</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left pb-3">Channel</th>
                <th className="text-left pb-3">Qual. Score</th>
                <th className="text-left pb-3">Conv. Rate</th>
                <th className="text-left pb-3">Cost/Hire</th>
              </tr>
            </thead>
            <tbody>
              {sourcingROI.map(row => (
                <tr key={row.channel} className="border-b border-gray-50 last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        {row.icon === 'linkedin' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563EB"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        ) : row.icon === 'referral' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-gray-800">{row.channel}</span>
                    </div>
                  </td>
                  <td className="py-4"><Stars score={row.qualScore} /></td>
                  <td className="py-4 text-[13px] text-gray-700">{row.convRate}</td>
                  <td className="py-4 text-[13px] font-semibold text-gray-800">{row.costPerHire}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quota Status Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quota Status</div>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }} />
          </div>
          <div className="text-[12.5px] text-gray-600 font-medium">820 / 1200 Monthly Sourced</div>
        </div>
      </div>
    </div>
  );
}
