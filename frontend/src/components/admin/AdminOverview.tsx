import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ActivityIcon,
  ArrowRightIcon,
  BarChart3Icon,
  BriefcaseIcon,
  Building2Icon,
  CheckCircle2Icon,
  Loader2Icon,
  TrendingUpIcon,
  UserCheckIcon,
  UsersRoundIcon,
  UserPlusIcon,
} from 'lucide-react';
import type { AdminOrganization, AdminPerson } from '../../data/admin';
import { adminApi, type DashboardAnalyticsDto } from '../../services/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AdminOverviewProps {
  people: AdminPerson[];
  organizations: AdminOrganization[];
  publishedJobs?: number;
  onViewChange: (
    view: 'people' | 'organizations' | 'departments' | 'analytics' | 'audit-settings'
  ) => void;
}

// Simple inline bar for funnel steps
function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-300">{label}</span>
        <span className="text-xs font-bold text-white">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function AdminOverview({
  people,
  organizations,
  publishedJobs = 0,
  onViewChange,
}: AdminOverviewProps) {
  const [analytics, setAnalytics] = useState<DashboardAnalyticsDto | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const activePeople = people.filter((p) => p.status === 'Active').length;
  const recruiters = people.filter((p) => p.role === 'Recruiter').length;
  const candidates = people.filter((p) => p.role === 'Candidate').length;

  const totalApplicants = analytics?.totalApplicants ?? 0;
  const totalHired     = analytics?.totalHired ?? 0;
  const conversionRate = totalApplicants > 0 ? ((totalHired / totalApplicants) * 100).toFixed(1) : '0.0';

  const metrics = [
    {
      label: 'People on platform',
      value: people.length.toLocaleString(),
      detail: `${activePeople} active · ${candidates} candidates`,
      icon: UsersRoundIcon,
      tone: 'brand' as const,
    },
    {
      label: 'Active organizations',
      value: organizations.length.toLocaleString(),
      detail: `${recruiters} recruiters assigned`,
      icon: Building2Icon,
      tone: 'accent' as const,
    },
    {
      label: 'Total applicants',
      value: totalApplicants.toLocaleString(),
      detail: `${conversionRate}% conversion to hire`,
      icon: UserCheckIcon,
      tone: 'green' as const,
    },
    {
      label: 'Published jobs',
      value: publishedJobs.toLocaleString(),
      detail: 'Live openings platform-wide',
      icon: BriefcaseIcon,
      tone: 'blue' as const,
    },
  ];

  const recentPeople = [...people]
    .sort((a, b) => Date.parse(b.joined) - Date.parse(a.joined) || 0)
    .slice(0, 4);

  const pipeline = analytics?.pipeline;
  const funnelMax = pipeline?.received ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8 text-white"
    >
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric',
            })}{' '}
            · Operations snapshot
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">
            Platform overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Live counts from users, organizations, and recruitment activity.
          </p>
        </div>
        <Button onClick={() => onViewChange('people')} className="bg-brand-600 hover:bg-brand-500 text-white font-bold">
          <UserPlusIcon className="h-4 w-4" /> Manage People
        </Button>
      </div>

      {/* Metric cards */}
      <section aria-label="Platform metrics" className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, tone }, index) => (
          <motion.article
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              tone === 'brand'  ? 'bg-brand-500/20 text-teal-300 border border-brand-500/30' :
              tone === 'accent' ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30' :
              tone === 'green'  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-3xl font-extrabold text-white">{value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-300">{label}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          </motion.article>
        ))}
      </section>

      {/* Main content row */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">

        {/* Recruitment Pipeline Funnel — replaces moderation queue */}
        <section
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl text-white"
          aria-labelledby="pipeline-title"
        >
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-teal-300 border border-brand-500/30">
                <TrendingUpIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 id="pipeline-title" className="font-display text-lg font-bold text-white">
                  Recruitment Pipeline
                </h2>
                <p className="mt-0.5 text-sm text-slate-400">
                  Candidate funnel across all active job postings.
                </p>
              </div>
            </div>
            <button
              onClick={() => onViewChange('analytics')}
              className="inline-flex items-center gap-1 text-sm font-bold text-teal-300 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Full report <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="h-6 w-6 animate-spin text-teal-300" />
            </div>
          ) : pipeline ? (
            <div className="px-5 pb-6 sm:px-6 space-y-4">
              <FunnelBar label="Applications received" value={pipeline.received}         max={funnelMax} color="bg-brand-500" />
              <FunnelBar label="Under review"           value={pipeline.underReview}     max={funnelMax} color="bg-accent-500" />
              <FunnelBar label="Interview scheduled"    value={pipeline.interviewScheduled} max={funnelMax} color="bg-amber-400" />
              <FunnelBar label="Hired"                  value={pipeline.hired}           max={funnelMax} color="bg-emerald-500" />

              {/* Summary row */}
              <div className="mt-2 grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
                <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-center">
                  <p className="font-display text-xl font-extrabold text-white">{pipeline.received}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400 font-semibold">Total applied</p>
                </div>
                <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/30 p-3 text-center">
                  <p className="font-display text-xl font-extrabold text-emerald-300">{pipeline.hired}</p>
                  <p className="mt-0.5 text-[11px] text-emerald-400 font-semibold">Hired</p>
                </div>
                <div className="rounded-xl bg-brand-950/60 border border-brand-500/30 p-3 text-center">
                  <p className="font-display text-xl font-extrabold text-teal-300">{conversionRate}%</p>
                  <p className="mt-0.5 text-[11px] text-teal-400 font-semibold">Conversion</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="px-6 pb-10 pt-2 text-sm text-slate-400">
              Analytics data unavailable. Check back when jobs and applications exist.
            </p>
          )}
        </section>

        {/* Organization pulse */}
        <aside
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white sm:p-6"
          aria-labelledby="org-title"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-teal-300 border border-brand-500/30">
            <Building2Icon className="h-5 w-5" />
          </span>
          <h2 id="org-title" className="mt-5 font-display text-lg font-bold text-white">
            Organization pulse
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {organizations.length > 0
              ? `${organizations.length} organization${organizations.length === 1 ? '' : 's'} · ${publishedJobs} published role${publishedJobs === 1 ? '' : 's'}.`
              : 'Create organizations from the Organizations tab to get started.'}
          </p>
          <div className="mt-5 space-y-3">
            {organizations.slice(0, 4).map((org) => (
              <div key={org.id} className="flex items-center justify-between rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-white">{org.name}</p>
                  <p className="text-xs text-slate-400">{org.members} members · {org.activeJobs} jobs</p>
                </div>
                <Badge tone="green">{org.status}</Badge>
              </div>
            ))}
            {organizations.length === 0 && (
              <p className="text-sm text-slate-400">No organizations created yet.</p>
            )}
          </div>
          <button
            onClick={() => onViewChange('organizations')}
            className="mt-5 text-sm font-bold text-teal-300 hover:text-white underline transition"
          >
            View organizations
          </button>
        </aside>
      </div>

      {/* Second row */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">

        {/* Top hiring organizations */}
        <section
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white sm:p-6"
          aria-labelledby="top-orgs-title"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/20 text-accent-300 border border-accent-500/30">
                <BarChart3Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 id="top-orgs-title" className="font-display text-lg font-bold text-white">
                  Top hiring organizations
                </h2>
                <p className="mt-0.5 text-sm text-slate-400">
                  Ranked by total hires this period.
                </p>
              </div>
            </div>
            <button
              onClick={() => onViewChange('analytics')}
              className="text-sm font-bold text-teal-300 hover:text-white underline"
            >
              See all
            </button>
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2Icon className="h-5 w-5 animate-spin text-teal-300" />
            </div>
          ) : analytics?.topOrganizations && analytics.topOrganizations.length > 0 ? (
            <div className="mt-5 space-y-3">
              {analytics.topOrganizations.slice(0, 4).map((org, i) => (
                <div key={org.organizationName} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-extrabold text-teal-300 border border-slate-700">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white truncate">{org.organizationName}</p>
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
                        <CheckCircle2Icon className="h-3.5 w-3.5" />{org.hired} hired
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      <span>{org.totalJobs} jobs</span>
                      <span>{org.totalApplications} applicants</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {recentPeople.slice(0, 4).map((p) => (
                <div key={p.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {p.role} account: {p.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{p.organization}</p>
                  </div>
                </div>
              ))}
              {recentPeople.length === 0 && (
                <p className="text-sm text-slate-400">No hiring data yet.</p>
              )}
            </div>
          )}
        </section>

        {/* Quick stats */}
        <section
          className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white sm:p-6"
          aria-labelledby="stats-title"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <ActivityIcon className="h-5 w-5" />
            </span>
            <h2 id="stats-title" className="font-display text-lg font-bold text-white">Platform stats</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4">
              <p className="font-display text-2xl font-extrabold text-teal-300">
                {analytics?.totalJobsPosted ?? publishedJobs}
              </p>
              <p className="mt-1 text-xs text-slate-400 font-medium">Jobs posted</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4">
              <p className="font-display text-2xl font-extrabold text-white">
                {people.length}
              </p>
              <p className="mt-1 text-xs text-slate-400 font-medium">Registered users</p>
            </div>
            <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/30 p-4">
              <p className="font-display text-2xl font-extrabold text-emerald-300">
                {analytics?.totalHired ?? 0}
              </p>
              <p className="mt-1 text-xs text-emerald-400 font-medium">Total hires</p>
            </div>
            <div className="rounded-xl bg-amber-950/60 border border-amber-500/30 p-4">
              <p className="font-display text-2xl font-extrabold text-amber-300">
                {analytics?.pipeline?.interviewScheduled ?? 0}
              </p>
              <p className="mt-1 text-xs text-amber-300 font-medium">Interviews scheduled</p>
            </div>
          </div>

          <button
            onClick={() => onViewChange('analytics')}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-teal-300 hover:text-white underline"
          >
            <BarChart3Icon className="h-4 w-4" /> Full analytics
          </button>
        </section>
      </div>
    </motion.div>
  );
}

