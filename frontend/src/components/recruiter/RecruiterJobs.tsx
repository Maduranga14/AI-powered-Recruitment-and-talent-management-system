import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  FilterIcon,
  MoreHorizontalIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersRoundIcon,
  XIcon,
} from 'lucide-react';
import type { RecruiterInterview, RecruiterJob } from '../../data/recruiter';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface RecruiterJobsProps {
  jobs: RecruiterJob[];
  interviews?: RecruiterInterview[];
  loading?: boolean;
  onCreateJob: () => void;
  onSchedule: () => void;
  onStatusChange: (jobId: string) => void;
  onViewApplicants: (jobId: string) => void;
  onEditJob: (job: RecruiterJob) => void;
  onDeleteJob: (jobId: string) => void;
}

function countInterviewsThisWeek(interviews: RecruiterInterview[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() + (day === 0 ? -6 : 1 - day));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return interviews.filter((i) => {
    if (!i.scheduledAt) return false;
    const at = new Date(i.scheduledAt);
    return at >= weekStart && at < weekEnd;
  }).length;
}

export function RecruiterJobs({
  jobs,
  interviews = [],
  loading,
  onCreateJob,
  onSchedule,
  onStatusChange,
  onViewApplicants,
  onEditJob,
  onDeleteJob,
}: RecruiterJobsProps) {
  const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [teamFilter, setTeamFilter] = useState('All teams');

  const interviewsThisWeek = countInterviewsThisWeek(interviews);

  // Unique list of teams/departments from jobs
  const teams = useMemo(() => {
    return Array.from(new Set(jobs.map((j) => j.team).filter(Boolean)));
  }, [jobs]);

  // Unique list of statuses from jobs
  const statuses = useMemo(() => {
    const set = new Set(jobs.map((j) => j.status).filter(Boolean));
    return ['Active', 'Draft', 'Closed'].filter((s) => set.has(s) || s === 'Active');
  }, [jobs]);

  // Filtered jobs list
  const visibleJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [job.title, job.team, job.location].some((field) =>
          field?.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === 'All statuses' || job.status === statusFilter;

      const matchesTeam =
        teamFilter === 'All teams' || job.team === teamFilter;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [jobs, searchQuery, statusFilter, teamFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All statuses' ||
    teamFilter !== 'All teams';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All statuses');
    setTeamFilter('All teams');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Hiring plan &middot; Q2</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Jobs
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor pipeline activity and prioritize the searches that need attention.
          </p>
        </div>
        <Button onClick={onCreateJob}>
          <PlusIcon className="h-4 w-4" /> Create job
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-medium text-slate-500">Active roles</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">
            {jobs.filter((job) => job.status === 'Active').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-medium text-slate-500">
            Candidates in pipeline
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">
            {jobs.reduce((total, job) => total + job.applicants, 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-medium text-slate-500">
            Interviews this week
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">
            {interviewsThisWeek}
          </p>
        </div>
      </div>

      {/* Main Section */}
      <section
        className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
        aria-labelledby="open-roles-title"
      >
        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="open-roles-title" className="font-display text-lg font-bold text-slate-900">
              Your openings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Pipeline progress at a glance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="slate">{visibleJobs.length} of {jobs.length} roles</Badge>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px_180px]">
            {/* Search Input */}
            <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition shadow-xs">
              <SearchIcon className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, department, or location..."
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400 text-slate-900 font-medium"
                aria-label="Search jobs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </label>

            {/* Department / Team Filter */}
            <label className="relative">
              <span className="sr-only">Filter by department</span>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition shadow-xs pr-9"
              >
                <option>All teams</option>
                {teams.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </label>

            {/* Status Filter */}
            <label className="relative">
              <span className="sr-only">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition shadow-xs pr-9"
              >
                <option>All statuses</option>
                {statuses.map((st) => (
                  <option key={st}>{st}</option>
                ))}
              </select>
              <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </label>
          </div>

          {/* Active Filter Bar & Reset */}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                <span>Active filters:</span>
                {searchQuery && (
                  <span className="rounded-md bg-brand-50 text-brand-700 px-2 py-1 border border-brand-100">
                    &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
                {teamFilter !== 'All teams' && (
                  <span className="rounded-md bg-brand-50 text-brand-700 px-2 py-1 border border-brand-100">
                    Team: {teamFilter}
                  </span>
                )}
                {statusFilter !== 'All statuses' && (
                  <span className="rounded-md bg-brand-50 text-brand-700 px-2 py-1 border border-brand-100">
                    Status: {statusFilter}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-brand-600 hover:underline shrink-0"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className="divide-y divide-slate-100">
          {visibleJobs.length === 0 ? (
            <div className="p-12 text-center">
              <SearchIcon className="mx-auto h-9 w-9 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-800">No matching jobs found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {hasActiveFilters
                  ? 'Try clearing your search query or filters.'
                  : 'Get started by creating your first job posting!'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            visibleJobs.map((job) => {
              return (
                <article key={job.id} className="p-5 sm:p-6 transition hover:bg-slate-50/50">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-bold text-slate-900">
                          {job.title}
                        </h3>
                        <Badge tone={job.status === 'Active' ? 'green' : job.status === 'Draft' ? 'amber' : 'slate'}>
                          {job.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {job.team} &middot; {job.location} &middot; {job.posted}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-5 text-center sm:w-72">
                      <div>
                        <p className="font-display text-lg font-extrabold text-slate-900">
                          {job.applicants}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">
                          Applicants
                        </p>
                      </div>
                      <div>
                        <p className="font-display text-lg font-extrabold text-slate-900">
                          {job.shortlisted}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">
                          Shortlisted
                        </p>
                      </div>
                      <div>
                        <p className="font-display text-lg font-extrabold text-slate-900">
                          {job.interviews}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">
                          Interviews
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onViewApplicants(job.id)}
                      >
                        <UsersRoundIcon className="h-4 w-4" /> View applicants
                      </Button>
                      <button
                        onClick={() =>
                          setActiveMenuJobId(
                            activeMenuJobId === job.id ? null : job.id
                          )
                        }
                        aria-label={`More actions for ${job.title}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <MoreHorizontalIcon className="h-5 w-5" />
                      </button>

                      {/* Dropdown Action Menu */}
                      <AnimatePresence>
                        {activeMenuJobId === job.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuJobId(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl"
                            >
                              <button
                                onClick={() => {
                                  setActiveMenuJobId(null);
                                  onEditJob(job);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Edit Job Details
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuJobId(null);
                                  onStatusChange(job.id);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                {job.status === 'Active' ? (
                                  <>
                                    <PauseCircleIcon className="h-4 w-4 text-amber-500" />
                                    Pause Job
                                  </>
                                ) : (
                                  <>
                                    <PlayCircleIcon className="h-4 w-4 text-emerald-500" />
                                    Publish / Activate
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuJobId(null);
                                  onDeleteJob(job.id);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <Trash2Icon className="h-4 w-4" />
                                Delete Job
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </motion.div>
  );
}