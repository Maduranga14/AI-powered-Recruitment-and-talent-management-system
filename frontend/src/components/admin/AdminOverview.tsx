import { motion } from 'framer-motion';
import {
  ActivityIcon,
  ArrowRightIcon,
  Building2Icon,
  BriefcaseIcon,
  FileCheck2Icon,
  UsersRoundIcon,
  UserPlusIcon
} from 'lucide-react';
import type {
  AdminOrganization,
  AdminPerson,
  ModerationItem,
} from '../../data/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AdminOverviewProps {
  people: AdminPerson[];
  organizations: AdminOrganization[];
  moderation: ModerationItem[];
  publishedJobs?: number;
  onViewChange: (
    view: 'people' | 'organizations' | 'departments' | 'moderation' | 'audit-settings'
  ) => void;
}

export function AdminOverview({
  people,
  organizations,
  moderation,
  publishedJobs = 0,
  onViewChange,
}: AdminOverviewProps) {
  const pendingModeration = moderation.filter((item) => item.status === 'Pending');
  const activePeople = people.filter((p) => p.status === 'Active').length;
  const recruiters = people.filter((p) => p.role === 'Recruiter').length;

  const metrics = [
    {
      label: 'People on platform',
      value: people.length.toLocaleString(),
      detail: `${activePeople} active accounts`,
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
      label: 'Moderation Queue',
      value: pendingModeration.length,
      detail:
        pendingModeration.length === 0
          ? 'Queue is clear'
          : `${pendingModeration.length} items awaiting review`,
      icon: FileCheck2Icon,
      tone: 'amber' as const,
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
    .slice(0, 3);

  const activityEvents =
    recentPeople.length > 0
      ? recentPeople.map((p) => ({
          text: `${p.role} account created: ${p.name}`,
          meta: p.organization,
        }))
      : [
          {
            text: 'No recent account activity yet',
            meta: 'New users will appear here',
          },
        ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · Operations snapshot
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Platform overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Live counts from users, organizations, departments, and published jobs.
          </p>
        </div>
        <Button onClick={() => onViewChange('people')}>
          <UserPlusIcon className="h-4 w-4" /> Manage People
        </Button>
      </div>

      <section
        aria-label="Platform metrics"
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map(({ label, value, detail, icon: Icon, tone }, index) => (
          <motion.article
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                tone === 'brand'
                  ? 'bg-brand-50 text-brand-600'
                  : tone === 'accent'
                    ? 'bg-accent-50 text-accent-600'
                    : tone === 'amber'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-3xl font-extrabold text-slate-900">
              {value}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          </motion.article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
          aria-labelledby="review-queue-title"
        >
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div>
              <h2
                id="review-queue-title"
                className="font-display text-lg font-bold"
              >
                Moderation Queue
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Job posting reviews and content moderation items awaiting platform decision.
              </p>
            </div>
            <button
              onClick={() => onViewChange('moderation')}
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              View queue <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingModeration.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">
                No moderation items awaiting review.
              </p>
            ) : (
              pendingModeration.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange('moderation')}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 sm:px-6"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      item.type === 'Report'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-brand-50 text-brand-600'
                    }`}
                  >
                    <FileCheck2Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-800">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {item.organization} · {item.submittedAt}
                    </span>
                  </span>
                  <Badge tone="amber">Pending</Badge>
                </button>
              ))
            )}
          </div>
        </section>

        <aside
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="org-title"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Building2Icon className="h-5 w-5" />
          </span>
          <h2 id="org-title" className="mt-5 font-display text-lg font-bold">
            Organization pulse
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {organizations.length > 0
              ? `${organizations.length} organization${organizations.length === 1 ? '' : 's'} with ${publishedJobs} published role${publishedJobs === 1 ? '' : 's'} across the platform.`
              : 'Create organizations from the Organizations tab to get started.'}
          </p>
          <div className="mt-5 space-y-3">
            {organizations.slice(0, 3).map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {org.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {org.members} members · {org.activeJobs} jobs
                  </p>
                </div>
                <Badge tone="green">{org.status}</Badge>
              </div>
            ))}
            {organizations.length === 0 && (
              <p className="text-sm text-slate-500">No organizations created yet.</p>
            )}
          </div>
          <button
            onClick={() => onViewChange('organizations')}
            className="mt-5 text-sm font-bold text-brand-600 hover:underline"
          >
            View organizations
          </button>
        </aside>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="activity-title"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2
                id="activity-title"
                className="font-display text-lg font-bold"
              >
                Recent platform activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest accounts registered on Talenta.
              </p>
            </div>
            <ActivityIcon className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-5 space-y-4">
            {activityEvents.map((event) => (
              <div key={event.text} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {event.text}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{event.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="usage-title"
        >
          <h2 id="usage-title" className="font-display text-lg font-bold">
            Platform pulse
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Live totals across workspaces.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-display text-xl font-extrabold">
                {people.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">Registered users</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-display text-xl font-extrabold">
                {publishedJobs}
              </p>
              <p className="mt-1 text-xs text-slate-500">Published jobs</p>
            </div>
          </div>
          <button
            onClick={() => onViewChange('organizations')}
            className="mt-5 text-sm font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            View organizations
          </button>
        </section>
      </div>
    </motion.div>
  );
}
