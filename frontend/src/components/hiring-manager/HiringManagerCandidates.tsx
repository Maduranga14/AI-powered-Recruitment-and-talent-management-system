import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  CheckCircle2Icon,
  FilterIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  XCircleIcon,
} from 'lucide-react';
import type {
  ManagerCandidate,
  ManagerDecisionStatus
} from
  '../../data/hiringManager';
import { DECISION_TONES } from '../../data/hiringManager';
import { Badge } from '../ui/Badge';
import { MatchScore } from '../ui/MatchScore';
interface HiringManagerCandidatesProps {
  candidates: ManagerCandidate[];
  onCandidateSelect: (candidate: ManagerCandidate) => void;
  onToggleAiScores?: (enable: boolean) => void;
}
export function HiringManagerCandidates({
  candidates,
  onCandidateSelect,
  onToggleAiScores,
}: HiringManagerCandidatesProps) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All assigned roles');
  const [statusFilter, setStatusFilter] = useState<
    'All decisions' | ManagerDecisionStatus>(
      'All decisions');

  const [showAiScore, setShowAiScore] = useState(false);

  const handleToggleAi = () => {
    const next = !showAiScore;
    setShowAiScore(next);
    if (next && onToggleAiScores) {
      onToggleAiScores(true);
    }
  };
  const roles = Array.from(
    new Set(candidates.map((candidate) => candidate.role))
  );
  const visible = useMemo(() => {
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
          roleFilter === 'All assigned roles' ||
          candidate.role === roleFilter) && (
          statusFilter === 'All decisions' ||
          candidate.decisionStatus === statusFilter));

    });
  }, [candidates, query, roleFilter, statusFilter]);
  const clearFilters = () => {
    setQuery('');
    setRoleFilter('All assigned roles');
    setStatusFilter('All decisions');
  };
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
          <p className="text-sm font-medium text-slate-400">
            Decision ownership
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">
            My candidates
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Review the people assigned to you and move the hiring conversation
            forward.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleAi}
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-md ${showAiScore
              ? 'border-teal-400/40 bg-brand-600/30 text-teal-300 ring-2 ring-teal-400/20'
              : 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
            }`}
        >
          <SparklesIcon className={`h-4 w-4 ${showAiScore ? 'text-teal-300 fill-teal-400/30' : 'text-slate-400'}`} />
          <span>AI Score</span>
          <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold ${showAiScore ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {showAiScore ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>
      <section
        className="mt-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-white shadow-xl sm:p-5"
        aria-label="Candidate filters">

        <div className="grid gap-3 lg:grid-cols-[1fr_230px_200px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, skill, or role"
              className="w-full bg-transparent py-2.5 text-sm outline-none text-white placeholder:text-slate-400"
              aria-label="Search assigned candidates" />

          </label>
          <label className="relative">
            <span className="sr-only">Filter by assigned role</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20">

              <option className="bg-slate-900 text-white">All assigned roles</option>
              {roles.map((role) =>
                <option key={role} className="bg-slate-900 text-white">{role}</option>
              )}
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by decision status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'All decisions' | ManagerDecisionStatus
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20">

              <option className="bg-slate-900 text-white">All decisions</option>
              <option className="bg-slate-900 text-white">Interview</option>
              <option className="bg-slate-900 text-white">Awaiting feedback</option>
              <option className="bg-slate-900 text-white">Feedback submitted</option>
              <option className="bg-slate-900 text-white">Hired</option>
              <option className="bg-slate-900 text-white">Rejected</option>
              <option className="bg-slate-900 text-white">Under Final Review</option>
            </select>
            <SlidersHorizontalIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
        </div>
      </section>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          <strong className="text-white">{visible.length}</strong>{' '}
          candidates shown
        </p>
        <button
          onClick={clearFilters}
          className="text-sm font-bold text-teal-300 hover:text-white underline underline-offset-4">

          Clear filters
        </button>
      </div>
      {visible.length ?
        <section
          className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 text-white shadow-xl"
          aria-label="Assigned candidates">

          <div className={`hidden gap-4 border-b border-slate-800 bg-slate-950/60 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid ${showAiScore
              ? 'grid-cols-[minmax(280px,1.5fr)_minmax(175px,1fr)_110px_150px]'
              : 'grid-cols-[minmax(280px,1.5fr)_minmax(175px,1fr)_150px]'
            }`}>
            <span>Candidate</span>
            <span>Assigned role</span>
            {showAiScore && <span>Fit</span>}
            <span>Decision status</span>
          </div>
          <div className="divide-y divide-slate-800">
            {visible.map((candidate) =>
              <button
                key={candidate.id}
                onClick={() => onCandidateSelect(candidate)}
                className={`grid w-full gap-4 p-4 text-left transition-colors hover:bg-slate-800/60 lg:items-center lg:px-5 ${showAiScore
                    ? 'lg:grid-cols-[minmax(280px,1.5fr)_minmax(175px,1fr)_110px_150px]'
                    : 'lg:grid-cols-[minmax(280px,1.5fr)_minmax(175px,1fr)_150px]'
                  }`}>

                <span className="flex min-w-0 items-center gap-3">
                  <img
                    src={candidate.avatar}
                    alt=""
                    className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-700 bg-slate-950" />

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {candidate.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {candidate.title} · {candidate.location}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5 lg:hidden">
                      {candidate.skills.slice(0, 3).map((skill) =>
                        <Badge key={skill} tone="slate" className="bg-slate-800 text-slate-300 border-slate-700">
                          {skill}
                        </Badge>
                      )}
                    </span>
                  </span>
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-200">
                    {candidate.role}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {candidate.interviewTime ?? candidate.applied}
                  </span>
                </span>
                {showAiScore && (
                  <span className="flex items-center gap-2">
                    {candidate.decisionStatus === 'Interview' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 text-xs font-bold text-blue-300">
                        <CalendarIcon className="h-3.5 w-3.5" /> Scheduled
                      </span>
                    ) : candidate.decisionStatus === 'Offer' || candidate.decisionStatus === 'Hired' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300">
                        <CheckCircle2Icon className="h-3.5 w-3.5" /> Offered
                      </span>
                    ) : candidate.decisionStatus === 'Rejected' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-400">
                        <XCircleIcon className="h-3.5 w-3.5" /> Passed
                      </span>
                    ) : (
                      <>
                        <MatchScore score={candidate.matchScore} size={38} />
                        <span className="text-xs font-semibold text-slate-400 lg:hidden">
                          Match
                        </span>
                      </>
                    )}
                  </span>
                )}
                <span>
                  <Badge tone={DECISION_TONES[candidate.decisionStatus]} className="bg-brand-500/20 text-teal-300 border-brand-500/30">
                    {candidate.decisionStatus}
                  </Badge>
                </span>
              </button>
            )}
          </div>
        </section> :

        <div className="mt-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/90 px-5 py-16 text-center text-white">
          <SearchIcon className="mx-auto h-9 w-9 text-slate-400" />
          <p className="mt-3 font-bold text-white">
            No candidates match these filters
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Try another search or reset your filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 transition">

            Reset filters
          </button>
        </div>
      }
    </motion.div>
  );
}