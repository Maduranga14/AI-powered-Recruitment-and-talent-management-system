import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FilterIcon,
  SearchIcon,
  SparklesIcon,
  UserRoundCheckIcon,
  UserRoundXIcon } from
'lucide-react';
import type { RecruiterCandidate, RecruiterStage } from '../../data/recruiter';
import { STAGE_TONES } from '../../data/recruiter';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchScore } from '../ui/MatchScore';
interface RecruiterCandidatesProps {
  candidates: RecruiterCandidate[];
  loading?: boolean;
  jobTitle?: string | null;
  onCandidateSelect: (candidate: RecruiterCandidate) => void;
  onStageChange: (candidateId: string, stage: RecruiterStage) => void;
  onClearJobFilter?: () => void;
}
export function RecruiterCandidates({
  candidates,
  loading,
  jobTitle,
  onCandidateSelect,
  onStageChange,
  onClearJobFilter
}: RecruiterCandidatesProps) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [stageFilter, setStageFilter] = useState<'All stages' | RecruiterStage>(
    'All stages'
  );
  const visibleCandidates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const matchesQuery =
      !normalized ||
      [
      candidate.name,
      candidate.title,
      candidate.location,
      candidate.role,
      ...candidate.skills].

      join(' ').
      toLowerCase().
      includes(normalized);
      return (
        matchesQuery && (
        roleFilter === 'All roles' || candidate.role === roleFilter) && (
        stageFilter === 'All stages' || candidate.stage === stageFilter));

    });
  }, [candidates, query, roleFilter, stageFilter]);
  const roles = Array.from(
    new Set(candidates.map((candidate) => candidate.role))
  );
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="mx-auto max-w-[1600px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Talent pipeline</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Candidates
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {jobTitle
              ? `Applicants for “${jobTitle}”.`
              : 'Review top-fit talent and keep every conversation moving.'}
          </p>
          {jobTitle && onClearJobFilter && (
            <button
              onClick={onClearJobFilter}
              className="mt-2 text-sm font-semibold text-brand-600 hover:underline">
              Show all candidates
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent">
            <SparklesIcon className="h-3.5 w-3.5" /> AI scoring active
          </Badge>
        </div>
      </div>
      {loading ? (
        <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <p className="font-semibold text-slate-900">Loading applicants…</p>
          <p className="mt-1 text-sm text-slate-500">
            Fetching candidates who applied to this role.
          </p>
        </div>
      ) : (
      <>
      <section
        className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5"
        aria-label="Candidate filters">
        
        <div className="grid gap-3 lg:grid-cols-[1fr_200px_180px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, skill, role, or location"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
              aria-label="Search candidates" />
            
          </label>
          <label className="relative">
            <span className="sr-only">Filter by role</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              
              <option>All roles</option>
              {roles.map((role) =>
              <option key={role}>{role}</option>
              )}
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by stage</span>
            <select
              value={stageFilter}
              onChange={(event) =>
              setStageFilter(
                event.target.value as 'All stages' | RecruiterStage
              )
              }
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              
              <option>All stages</option>
              {(
                [
                  'New',
                  'Screening',
                  'Shortlisted',
                  'Reviewed',
                  'Interview',
                  'Under Final Review',
                  'Offer',
                  'Rejected',
                ] as RecruiterStage[]
              ).map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
        </div>
      </section>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-900">{visibleCandidates.length}</strong>{' '}
          candidates shown
        </p>
        <button
          onClick={() => {
            setQuery('');
            setRoleFilter('All roles');
            setStageFilter('All stages');
          }}
          className="text-sm font-semibold text-brand-600 hover:underline">
          
          Clear filters
        </button>
      </div>
      {visibleCandidates.length ?
      <section
        className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
        aria-label="Candidate list">
        
          <div className="hidden grid-cols-[minmax(270px,1.5fr)_minmax(180px,1fr)_120px_130px_170px] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
            <span>Candidate</span>
            <span>Applied role</span>
            <span>AI match</span>
            <span>Stage</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {visibleCandidates.map((candidate) =>
          <article
            key={candidate.id}
            className="grid gap-4 p-4 transition-colors hover:bg-slate-50 lg:grid-cols-[minmax(270px,1.5fr)_minmax(180px,1fr)_120px_130px_170px] lg:items-center lg:px-5">
            
                <button
              onClick={() => onCandidateSelect(candidate)}
              className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              
                  <img
                src={candidate.avatar}
                alt=""
                className="h-10 w-10 rounded-xl" />
              
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-800">
                      {candidate.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {candidate.title} · {candidate.location}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5 lg:hidden">
                      {candidate.skills.slice(0, 3).map((skill) =>
                  <Badge key={skill} tone="slate">
                          {skill}
                        </Badge>
                  )}
                    </span>
                  </span>
                </button>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {candidate.role}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Applied {candidate.applied}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MatchScore score={candidate.matchScore} size={38} />
                  <span className="text-xs font-semibold text-slate-500 lg:hidden">
                    AI match
                  </span>
                </div>
                <div>
                  <Badge tone={STAGE_TONES[candidate.stage]}>
                    {candidate.stage}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {candidate.stage === 'Under Final Review' ? (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={() => onStageChange(candidate.id, 'Offer')}
                      >
                        <UserRoundCheckIcon className="h-4 w-4" />
                        <span className="hidden xl:inline">Hire</span>
                      </Button>
                      <button
                        onClick={() => onStageChange(candidate.id, 'Rejected')}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        aria-label={`Reject ${candidate.name}`}
                      >
                        <UserRoundXIcon className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onStageChange(candidate.id, 'Shortlisted')}
                        disabled={candidate.stage === 'Shortlisted'}
                      >
                        <UserRoundCheckIcon className="h-4 w-4" />
                        <span className="hidden xl:inline">Shortlist</span>
                      </Button>
                      <button
                        onClick={() => onStageChange(candidate.id, 'Rejected')}
                        disabled={candidate.stage === 'Rejected'}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        aria-label={`Reject ${candidate.name}`}
                      >
                        <UserRoundXIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </article>
          )}
          </div>
        </section> :

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
          <SearchIcon className="mx-auto h-9 w-9 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">
            {jobTitle
              ? 'No applicants yet'
              : candidates.length === 0
                ? 'No applicants yet'
                : 'No candidates match these filters'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {jobTitle
              ? 'When candidates apply to this job, they will appear here.'
              : candidates.length === 0
                ? 'No one has applied to your jobs yet.'
                : 'Try broadening your search or clearing a filter.'}
          </p>
        </div>
      }
      </>
      )}
    </motion.div>);

}