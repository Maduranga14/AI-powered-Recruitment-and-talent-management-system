import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  CheckCircle2Icon,
  FilterIcon,
  SearchIcon,
  SparklesIcon,
  UserRoundCheckIcon,
  UserRoundXIcon,
  XCircleIcon,
} from 'lucide-react';
import type { RecruiterCandidate, RecruiterStage } from '../../data/recruiter';
import { STAGE_TONES } from '../../data/recruiter';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchScore } from '../ui/MatchScore';
interface RecruiterCandidatesProps {
  candidates: RecruiterCandidate[];
  loading?: boolean;
  jobTitle?: string | null;
  departments?: { id?: string; name: string }[];
  onCandidateSelect: (candidate: RecruiterCandidate) => void;
  onStageChange: (candidateId: string, stage: RecruiterStage) => void;
  onClearJobFilter?: () => void;
  onToggleAiScores?: (enable: boolean) => void;
}
export function RecruiterCandidates({
  candidates,
  loading,
  jobTitle,
  departments: orgDepartments = [],
  onCandidateSelect,
  onStageChange,
  onClearJobFilter,
  onToggleAiScores,
}: RecruiterCandidatesProps) {
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All departments');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [stageFilter, setStageFilter] = useState<'All stages' | RecruiterStage>(
    'All stages'
  );

  const [showAiScore, setShowAiScore] = useState(false);

  const handleToggleAi = () => {
    const next = !showAiScore;
    setShowAiScore(next);
    if (next && onToggleAiScores) {
      onToggleAiScores(true);
    }
  };

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    // Add dynamic organization departments from system
    orgDepartments.forEach((d) => {
      if (d.name?.trim()) set.add(d.name.trim());
    });
    // Add any department names attached to candidates
    candidates.forEach((c) => {
      if (c.department?.trim()) set.add(c.department.trim());
    });
    return Array.from(set).sort();
  }, [orgDepartments, candidates]);

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
          candidate.department,
          ...candidate.skills,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalized);

      const matchesDept =
        deptFilter === 'All departments' || candidate.department === deptFilter;
      const matchesRole =
        roleFilter === 'All roles' || candidate.role === roleFilter;
      const matchesStage =
        stageFilter === 'All stages' || candidate.stage === stageFilter;

      return matchesQuery && matchesDept && matchesRole && matchesStage;
    });
  }, [candidates, query, deptFilter, roleFilter, stageFilter]);

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
          <button
            type="button"
            onClick={handleToggleAi}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
              showAiScore
                ? 'border-brand-300 bg-gradient-to-r from-brand-50 to-indigo-50 text-brand-700 shadow-brand-100 ring-2 ring-brand-200'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SparklesIcon className={`h-4 w-4 ${showAiScore ? 'text-brand-600 fill-brand-200' : 'text-slate-400'}`} />
            <span>AI Score</span>
            <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold ${showAiScore ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {showAiScore ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="mt-7 rounded-2xl border border-dashed border-slate-800 bg-slate-900/90 px-5 py-16 text-center shadow-xl text-white">
          <p className="font-bold text-white text-base">Loading applicants…</p>
          <p className="mt-1 text-sm text-slate-400">
            Fetching candidates who applied to this role.
          </p>
        </div>
      ) : (
      <>
      <section
        className="mt-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl text-white sm:p-5"
        aria-label="Candidate filters">
        
        <div className="grid gap-3 lg:grid-cols-[1fr_170px_170px_160px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search candidate name, skills, role, or department..."
              className="w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-400"
              aria-label="Search candidates" />
            
          </label>
          <label className="relative">
            <span className="sr-only">Filter by department</span>
            <select
              value={deptFilter}
              onChange={(event) => setDeptFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20">
              
              <option className="bg-slate-900 text-white">All departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} className="bg-slate-900 text-white">{dept}</option>
              ))}
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Filter by role</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20">
              
              <option className="bg-slate-900 text-white">All roles</option>
              {roles.map((role) =>
              <option key={role} className="bg-slate-900 text-white">{role}</option>
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
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20">
              
              <option className="bg-slate-900 text-white">All stages</option>
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
                <option key={stage} className="bg-slate-900 text-white">{stage}</option>
              ))}
            </select>
            <FilterIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </label>
        </div>
      </section>
      <div className="mt-5 flex items-center justify-between text-white">
        <p className="text-sm text-slate-400">
          <strong className="text-white">{visibleCandidates.length}</strong>{' '}
          candidates shown
        </p>
        <button
          onClick={() => {
            setQuery('');
            setDeptFilter('All departments');
            setRoleFilter('All roles');
            setStageFilter('All stages');
          }}
          className="text-sm font-bold text-teal-300 hover:text-white underline">
          
          Clear filters
        </button>
      </div>
      {visibleCandidates.length ?
      <section
        className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl text-white"
        aria-label="Candidate list">
        
          <div className={`hidden gap-4 border-b border-slate-800 bg-slate-950/60 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 lg:grid ${
            showAiScore
              ? 'grid-cols-[minmax(270px,1.5fr)_minmax(180px,1fr)_120px_130px_170px]'
              : 'grid-cols-[minmax(270px,1.5fr)_minmax(180px,1fr)_130px_170px]'
          }`}>
            <span>Candidate</span>
            <span>Applied role</span>
            {showAiScore && <span>AI match</span>}
            <span>Stage</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-800">
            {visibleCandidates.map((candidate) =>
          <article
            key={candidate.id}
            className={`grid gap-4 p-4 transition-colors hover:bg-slate-800/60 lg:items-center lg:px-5 ${
              showAiScore
                ? 'lg:grid-cols-[minmax(270px,1.5fr)_minmax(180px,1fr)_120px_130px_170px]'
                : 'lg:grid-cols-[minmax(270px,1.5fr)_minmax(180px,1fr)_130px_170px]'
            }`}>
            
                <button
              onClick={() => onCandidateSelect(candidate)}
              className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
              
                  <img
                src={candidate.avatar}
                alt=""
                className="h-10 w-10 rounded-xl border border-slate-800 bg-slate-950" />
              
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {candidate.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {candidate.title} · {candidate.location}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5 lg:hidden">
                      {candidate.skills.slice(0, 3).map((skill) =>
                  <Badge key={skill} tone="slate" className="bg-slate-800 text-slate-200 border-slate-700">
                          {skill}
                        </Badge>
                  )}
                    </span>
                  </span>
                </button>
                <div>
                  <p className="text-sm font-bold text-white">
                    {candidate.role}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Applied {candidate.applied}
                  </p>
                </div>
                {showAiScore && (
                  <div className="flex items-center gap-2">
                    {candidate.stage === 'Interview' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
                        <CalendarIcon className="h-3.5 w-3.5" /> Scheduled
                      </span>
                    ) : candidate.stage === 'Offer' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2Icon className="h-3.5 w-3.5" /> Offered
                      </span>
                    ) : candidate.stage === 'Rejected' ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-400 border border-slate-700">
                        <XCircleIcon className="h-3.5 w-3.5" /> Passed
                      </span>
                    ) : (
                      <>
                        <MatchScore score={candidate.matchScore} size={38} />
                        <span className="text-xs font-semibold text-slate-400 lg:hidden">
                          AI match
                        </span>
                      </>
                    )}
                  </div>
                )}
                <div>
                  <Badge tone={STAGE_TONES[candidate.stage]} className="bg-brand-500/20 text-teal-300 border-brand-500/30">
                    {candidate.stage}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {candidate.stage === 'Under Final Review' ? (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        onClick={() => onStageChange(candidate.id, 'Offer')}
                      >
                        <UserRoundCheckIcon className="h-4 w-4" />
                        <span className="hidden xl:inline">Hire</span>
                      </Button>
                      <button
                        onClick={() => onStageChange(candidate.id, 'Rejected')}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition"
                        aria-label={`Reject ${candidate.name}`}
                      >
                        <UserRoundXIcon className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant={candidate.stage !== 'New' ? 'secondary' : 'primary'}
                        onClick={() => onStageChange(candidate.id, 'Shortlisted')}
                        disabled={candidate.stage !== 'New'}
                        className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 font-bold"
                      >
                        <UserRoundCheckIcon className="h-4 w-4 text-teal-400" />
                        <span className="hidden xl:inline">
                          {candidate.stage !== 'New' ? 'Shortlisted' : 'Shortlist'}
                        </span>
                      </Button>
                      <button
                        onClick={() => onStageChange(candidate.id, 'Rejected')}
                        disabled={candidate.stage === 'Rejected'}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-40"
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

      <div className="mt-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/90 px-5 py-16 text-center shadow-xl text-white">
          <SearchIcon className="mx-auto h-9 w-9 text-slate-400" />
          <p className="mt-3 font-bold text-white text-base">
            {jobTitle
              ? 'No applicants yet'
              : candidates.length === 0
                ? 'No applicants yet'
                : 'No candidates match these filters'}
          </p>
          <p className="mt-1 text-sm text-slate-400">
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