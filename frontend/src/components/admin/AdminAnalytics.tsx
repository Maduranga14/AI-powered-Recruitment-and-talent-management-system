import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  SparklesIcon,
  TrendingUpIcon,
  UsersRoundIcon,
  ZapIcon,
} from 'lucide-react';
import { adminApi, type DashboardAnalyticsDto } from '../../services/api';

// ── Palette for charts ────────────────────────────────────────────────────────
const CHART_COLORS = [
  '#4f46e5', '#0d9488', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#10b981', '#f97316',
];

// ── Funnel Bar ────────────────────────────────────────────────────────────────
function FunnelBar({
  label, value, max, color,
}: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-right text-xs font-semibold text-slate-300">{label}</span>
      <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-lg"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-left text-sm font-bold text-white">{value.toLocaleString()}</span>
    </div>
  );
}

// ── Donut Chart (pure SVG) ────────────────────────────────────────────────────
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        No data yet
      </div>
    );
  }

  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const slices = data.map((d) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const slice = { ...d, dash, offset };
    offset += dash;
    return slice;
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="22" />
        {slices.map((s) => (
          <motion.circle
            key={s.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="22"
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={circumference / 4 - s.offset}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${s.dash} ${circumference - s.dash}` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white" fontSize="18" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-400" fontSize="10">total</text>
      </svg>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-col">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs text-slate-300">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="font-semibold">{s.label}</span>
            <span className="text-slate-400">({s.value})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, detail, icon: Icon, colorClass, index,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
  colorClass: string;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-display text-3xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-300">{label}</p>
      <p className="mt-0.5 text-xs text-slate-400">{detail}</p>
    </motion.article>
  );
}

// ── Activity type config ──────────────────────────────────────────────────────
const ACTIVITY_CONFIG: Record<string, { color: string; label: string }> = {
  job_posted: { color: 'bg-brand-500', label: 'Job' },
  hired: { color: 'bg-green-500', label: 'Hired' },
  interview: { color: 'bg-amber-500', label: 'Interview' },
  application: { color: 'bg-blue-500', label: 'Applied' },
};

// ── Main Component ────────────────────────────────────────────────────────────
export function AdminAnalytics() {
  const [data, setData] = useState<DashboardAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getAnalytics()
      .then(setData)
      .catch((err) => {
        console.error('Analytics error:', err);
        setError(err.message || 'Failed to load analytics.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-teal-300" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center text-white">
        <p className="text-sm font-bold text-white">Could not load analytics</p>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  const { pipeline } = data;
  const funnelMax = pipeline.received || 1;
  const funnelStages = [
    { label: 'Applications received', value: pipeline.received, color: '#4f46e5' },
    { label: 'Under review', value: pipeline.underReview, color: '#0d9488' },
    { label: 'Interview scheduled', value: pipeline.interviewScheduled, color: '#f59e0b' },
    { label: 'Hired', value: pipeline.hired, color: '#10b981' },
  ];

  const deptDonutData = data.departmentBreakdown.slice(0, 8).map((d, i) => ({
    label: d.departmentName,
    value: d.jobCount,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const kpis = [
    {
      label: 'Total Jobs Posted',
      value: data.totalJobsPosted.toLocaleString(),
      detail: 'Across all organizations',
      icon: BriefcaseIcon,
      colorClass: 'bg-brand-500/20 text-teal-300 border border-brand-500/30',
    },
    {
      label: 'Total Applicants',
      value: data.totalApplicants.toLocaleString(),
      detail: 'Registered candidate profiles',
      icon: UsersRoundIcon,
      colorClass: 'bg-accent-500/20 text-accent-300 border border-accent-500/30',
    },
    {
      label: 'Total Hired',
      value: data.totalHired.toLocaleString(),
      detail: 'Offers accepted platform-wide',
      icon: CheckCircle2Icon,
      colorClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      label: 'Active Organizations',
      value: data.totalActiveOrganizations.toLocaleString(),
      detail: 'Client orgs on platform',
      icon: Building2Icon,
      colorClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8 text-white"
    >
      {/* Header */}
      <div className="mb-7">
        <p className="text-sm font-medium text-slate-400">Administrator Portal</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">
          Recruitment Analytics
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Live aggregated data across all jobs, candidates, and organizations.
        </p>
      </div>

      {/* KPI Cards */}
      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} {...kpi} index={i} />
        ))}
      </section>

      {/* Row 2: Pipeline + AI Metrics */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Recruitment Pipeline Funnel */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-teal-400" />
            <h2 className="font-display text-lg font-bold text-white">Recruitment Pipeline</h2>
          </div>
          <div className="space-y-3">
            {funnelStages.map((s) => (
              <FunnelBar key={s.label} label={s.label} value={s.value} max={funnelMax} color={s.color} />
            ))}
          </div>
          <div className="mt-5 flex gap-4 border-t border-slate-800 pt-4">
            <div className="text-center">
              <p className="font-display text-2xl font-extrabold text-white">
                {pipeline.received > 0
                  ? `${Math.round((pipeline.hired / pipeline.received) * 100)}%`
                  : '—'}
              </p>
              <p className="text-xs text-slate-400 font-medium">Hire rate</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-extrabold text-white">
                {pipeline.received > 0
                  ? `${Math.round((pipeline.interviewScheduled / pipeline.received) * 100)}%`
                  : '—'}
              </p>
              <p className="text-xs text-slate-400 font-medium">Interview rate</p>
            </div>
          </div>
        </section>

        {/* AI & Efficiency */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <ZapIcon className="h-5 w-5 text-teal-400" />
            <h2 className="font-display text-lg font-bold text-white">AI & Efficiency</h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-teal-200" />
              <p className="text-xs font-bold text-teal-100">Avg. AI Match Score</p>
            </div>
            <p className="mt-2 font-display text-5xl font-extrabold">
              {data.averageMatchScore > 0 ? `${data.averageMatchScore}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-teal-200 font-medium">Based on hiring manager ratings</p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-amber-400" />
              <p className="text-xs font-semibold text-slate-400">Avg. Time to Hire</p>
            </div>
            <p className="mt-2 font-display text-4xl font-extrabold text-white">
              {data.averageTimeToHireDays > 0 ? `${data.averageTimeToHireDays}d` : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-400 font-medium">From application to offer accepted</p>
          </div>
        </section>
      </div>

      {/* Row 3: Org Table + Dept Donut */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Top Organizations */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl text-white">
          <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
            <h2 className="font-display text-lg font-bold text-white">Top Hiring Organizations</h2>
            <p className="text-xs text-slate-400">Ranked by total jobs posted</p>
          </div>
          {data.topOrganizations.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-400">No organization data yet.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              <div className="hidden grid-cols-[1fr_80px_100px_80px] gap-3 bg-slate-950/60 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:grid sm:px-6 border-b border-slate-800">
                <span>Organization</span>
                <span className="text-center">Jobs</span>
                <span className="text-center">Applications</span>
                <span className="text-center">Hired</span>
              </div>
              {data.topOrganizations.map((org, i) => (
                <motion.div
                  key={org.organizationName}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-2 items-center gap-3 px-5 py-3.5 sm:grid-cols-[1fr_80px_100px_80px] sm:px-6 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    >
                      {org.organizationName.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate text-sm font-bold text-white">
                      {org.organizationName}
                    </span>
                  </div>
                  <span className="text-center text-sm font-semibold text-slate-300">{org.totalJobs}</span>
                  <span className="text-center text-sm text-slate-400">{org.totalApplications}</span>
                  <span className="text-center text-sm font-bold text-emerald-400">{org.hired}</span>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Department Breakdown */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white sm:p-6">
          <h2 className="font-display text-lg font-bold text-white">Jobs by Department</h2>
          <p className="mb-5 text-xs text-slate-400">Distribution of all posted roles</p>
          <DonutChart data={deptDonutData} />
        </section>
      </div>

      {/* Row 4: Recent Activity */}
      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white sm:p-6">
        <h2 className="font-display text-lg font-bold text-white">Recent Activity</h2>
        <p className="mb-5 text-xs text-slate-400">Latest 5 platform events</p>
        {data.recentActivity.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No recent activity found.</p>
        ) : (
          <ol className="space-y-4">
            {data.recentActivity.map((item, i) => {
              const cfg = ACTIVITY_CONFIG[item.type] ?? { color: 'bg-slate-400', label: 'Event' };
              const timeAgo = formatTimeAgo(item.occurredAt);
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cfg.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{item.message}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {item.meta} · {timeAgo}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold text-teal-300">
                    {cfg.label}
                  </span>
                </motion.li>
              );
            })}
          </ol>
        )}
      </section>
    </motion.div>
  );
}


function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
