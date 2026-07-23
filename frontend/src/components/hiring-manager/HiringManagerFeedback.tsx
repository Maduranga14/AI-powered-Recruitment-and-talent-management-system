import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  Edit3Icon,
  ExternalLinkIcon,
  GraduationCapIcon,
  HistoryIcon,
  MailIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  StarIcon,
  UserCheckIcon,
  SearchIcon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react';

import type {
  ManagerCandidate,
  ManagerRecommendation,
} from '../../data/hiringManager';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { MatchScore } from '../ui/MatchScore';

interface HiringManagerFeedbackProps {
  candidates: ManagerCandidate[];
  initialCandidateId: string | null;
  onSubmitFeedback: (
    candidateId: string,
    recommendation: ManagerRecommendation,
    evidence: string,
    overallRating: number,
    skillRatingsJson?: string
  ) => void;
  onMakeDecision?: (
    candidateId: string,
    decision: 'Hired' | 'Rejected' | 'UnderFinalReview',
    notes?: string
  ) => void;
}

function formatDateRange(start: string, end: string | null, isCurrent?: boolean): string {
  const s = new Date(start);
  const startStr = s.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  if (isCurrent) return `${startStr} – Present`;
  if (!end) return startStr;
  const e = new Date(end);
  return `${startStr} – ${e.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;
}

export function HiringManagerFeedback({
  candidates,
  initialCandidateId,
  onSubmitFeedback,
  onMakeDecision,
}: HiringManagerFeedbackProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [recommendationFilter, setRecommendationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const uniqueRoles = useMemo(
    () => Array.from(new Set(candidates.map((c) => c.role))).filter(Boolean),
    [candidates]
  );

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchRole = c.role.toLowerCase().includes(q);
        const matchEvidence = (c.evidence || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchLocation = (c.location || '').toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchEvidence && !matchEmail && !matchLocation) return false;
      }

      // Role filter
      if (roleFilter !== 'all' && c.role !== roleFilter) return false;

      // Recommendation filter
      if (recommendationFilter !== 'all') {
        if (!c.recommendation) return false;
        if (recommendationFilter === 'yes' && !c.recommendation.includes('Yes')) return false;
        if (recommendationFilter === 'maybe' && c.recommendation !== 'Maybe') return false;
        if (recommendationFilter === 'no' && !c.recommendation.includes('No')) return false;
      }

      // Status filter
      if (statusFilter === 'pending' && !(c.decisionStatus === 'Awaiting feedback' || c.decisionStatus === 'Interview')) {
        return false;
      }
      if (statusFilter === 'submitted' && c.decisionStatus !== 'Feedback submitted') {
        return false;
      }
      if (statusFilter === 'decision' && !(c.decisionStatus === 'Offer' || c.decisionStatus === 'Hired' || c.decisionStatus === 'Rejected' || c.decisionStatus === 'Under Final Review')) {
        return false;
      }

      return true;
    });
  }, [candidates, searchQuery, roleFilter, recommendationFilter, statusFilter]);

  const pending = useMemo(
    () => filteredCandidates.filter((c) => c.decisionStatus === 'Awaiting feedback' || c.decisionStatus === 'Interview'),
    [filteredCandidates]
  );

  const submittedFeedbacks = useMemo(() => {
    return filteredCandidates.filter(
      (c) =>
        c.decisionStatus === 'Feedback submitted' ||
        c.decisionStatus === 'Offer' ||
        c.decisionStatus === 'Hired' ||
        c.decisionStatus === 'Rejected' ||
        c.decisionStatus === 'Under Final Review' ||
        Boolean(c.evidence) ||
        Boolean(c.overallRating) ||
        Boolean(c.recommendation)
    );
  }, [filteredCandidates]);

  const hasActiveFilters = searchQuery.trim() !== '' || roleFilter !== 'all' || recommendationFilter !== 'all' || statusFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setRecommendationFilter('all');
    setStatusFilter('all');
  };

  const fallbackId = pending[0]?.id ?? candidates[0]?.id ?? '';
  const [candidateId, setCandidateId] = useState<string>(initialCandidateId ?? fallbackId);

  // View state: 'list' (shows history & candidate cards) | 'review' (shows pre-interview feedback form page)
  const [activeView, setActiveView] = useState<'list' | 'review'>(
    initialCandidateId ? 'review' : 'list'
  );

  // Form states
  const [recommendation, setRecommendation] = useState<ManagerRecommendation | null>(null);
  const [strengths, setStrengths] = useState('');
  const [concerns, setConcerns] = useState('');
  const [generalImpression, setGeneralImpression] = useState('');
  const [overallRating, setOverallRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);


  const candidate = useMemo(
    () => candidates.find((c) => c.id === candidateId),
    [candidates, candidateId]
  );

  useEffect(() => {
    if (initialCandidateId) {
      setCandidateId(initialCandidateId);
      setActiveView('review');
    }
  }, [initialCandidateId]);

  useEffect(() => {
    if (candidate) {
      setRecommendation(candidate.recommendation ?? null);
      setStrengths('');
      setConcerns('');
      setGeneralImpression(candidate.evidence ?? '');
      setOverallRating(candidate.overallRating ?? 0);
      setSubmitted(false);
    }
  }, [candidateId, candidate]);

  const canSubmit = Boolean(
    candidate && recommendation && overallRating > 0 && generalImpression.trim().length >= 10
  );

  const submit = async () => {
    if (!candidate || !recommendation || !canSubmit) return;
    const combined = `Strengths:\n${strengths.trim() || 'None specified'}\n\nConcerns:\n${concerns.trim() || 'None specified'}\n\nGeneral Impression:\n${generalImpression.trim()}`;
    onSubmitFeedback(candidate.id, recommendation, combined, overallRating, undefined);
    setSubmitted(true);
  };

  const openReviewForCandidate = (id: string) => {
    setCandidateId(id);
    setActiveView('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1240px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8 text-white"
    >
      {/* ════ VIEW 1: FEEDBACK HISTORY & CANDIDATE LIST ════ */}
      {activeView === 'list' ? (
        <div className="space-y-8">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Structured decision records</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">
                Candidate evaluations &amp; feedback
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Review candidate cards below and click &quot;Review Candidate&quot; to open the pre-interview feedback page.
              </p>
            </div>
            <Badge tone="accent" className="bg-brand-500/20 text-teal-300 border-brand-500/30">
              <ClipboardCheckIcon className="h-3.5 w-3.5 text-teal-400" /> Feedback Dashboard
            </Badge>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name, role, evidence, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-10 pr-9 py-2 text-xs font-medium text-white placeholder-slate-400 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white transition focus:border-teal-400 focus:outline-none"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {/* Recommendation Filter */}
              <select
                value={recommendationFilter}
                onChange={(e) => setRecommendationFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white transition focus:border-teal-400 focus:outline-none"
              >
                <option value="all">All Recommendations</option>
                <option value="yes">Recommended (Yes / Strong Yes)</option>
                <option value="maybe">Neutral (Maybe)</option>
                <option value="no">Not Recommended (No / Strong No)</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white transition focus:border-teal-400 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Awaiting Review</option>
                <option value="submitted">Feedback Submitted</option>
                <option value="decision">Final Decision Made</option>
              </select>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
                  title="Clear search and filters"
                >
                  <RotateCcwIcon className="h-3.5 w-3.5 text-teal-400" /> Clear
                </button>
              )}
            </div>
          </div>


          {/* SECTION: Candidates Awaiting Pre-Interview Feedback */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-display text-xl font-extrabold text-white flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-teal-400" />
                  Candidates Awaiting Review
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click &quot;Review Candidate&quot; to open the pre-interview evaluation page for a candidate.
                </p>
              </div>
              <Badge tone="amber" className="bg-amber-500/20 text-amber-300 border-amber-500/30">{pending.length} awaiting review</Badge>
            </div>

            {pending.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/90 p-8 text-center text-white">
                <CheckCircle2Icon className="mx-auto h-9 w-9 text-emerald-400" />
                <p className="mt-2 text-sm font-bold text-white">
                  {hasActiveFilters ? 'No pending candidates match your search and filter criteria.' : 'All candidate feedback complete!'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {hasActiveFilters ? 'Try adjusting your search query or clearing filters.' : 'No pending candidates awaiting review at this time.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-teal-300 hover:bg-slate-700 transition"
                  >
                    <RotateCcwIcon className="h-3.5 w-3.5" /> Clear filters
                  </button>
                )}
              </div>
            ) : (

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pending.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="h-12 w-12 rounded-xl object-cover border border-slate-700 bg-slate-950"
                          />
                          <div>
                            <h3 className="font-display text-base font-extrabold text-white">{c.name}</h3>
                            <p className="text-xs text-slate-400 font-medium">{c.role}</p>
                          </div>
                        </div>
                        {c.matchScore > 0 && <MatchScore score={c.matchScore} size={36} />}
                      </div>

                      <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">
                        <p className="flex items-center gap-1.5">
                          <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                          {c.location} &middot; Applied {c.applied}
                        </p>
                        {c.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {c.skills.slice(0, 3).map((skill) => (
                              <span key={skill} className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-800 pt-3">
                      <Button
                        onClick={() => openReviewForCandidate(c.id)}
                        className="w-full justify-center gap-2 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white"
                      >
                        <ClipboardCheckIcon className="h-4 w-4" />
                        Review Candidate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION: Previous Feedback & Decision History */}
          {submittedFeedbacks.length > 0 && (
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-white flex items-center gap-2">
                    <HistoryIcon className="h-5 w-5 text-teal-400" />
                    Previous Feedback &amp; Decision History
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Review past pre-interview evaluations, ratings, and submitted recommendations.
                  </p>
                </div>
                <Badge tone="green" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{submittedFeedbacks.length} submitted</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {submittedFeedbacks.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-700 bg-slate-950"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-base font-extrabold text-white truncate">
                              {c.name}
                            </h3>
                            {c.recommendation && (
                              <Badge
                                tone={
                                  c.recommendation.includes('Yes')
                                    ? 'green'
                                    : c.recommendation === 'Maybe'
                                    ? 'amber'
                                    : 'red'
                                }
                                className="bg-brand-500/20 text-teal-300 border-brand-500/30"
                              >
                                {c.recommendation}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium">{c.role}</p>

                          {/* Rating Stars */}
                          {c.overallRating && c.overallRating > 0 ? (
                            <div className="mt-1.5 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                  key={star}
                                  className={`h-3.5 w-3.5 ${
                                    (c.overallRating || 0) >= star
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-700'
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs font-bold text-white">
                                {c.overallRating}/5
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Submitted Written Evidence / Feedback */}
                      {c.evidence && (
                        <div className="mt-3.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-200 space-y-1">
                          <p className="font-bold text-teal-400 text-[11px] uppercase tracking-wider">
                            Submitted Evaluation:
                          </p>
                          <p className="whitespace-pre-wrap leading-relaxed line-clamp-4 text-slate-300">
                            {c.evidence}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Status: <strong className="text-white">{c.decisionStatus}</strong>
                      </span>
                      <button
                        onClick={() => openReviewForCandidate(c.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
                      >
                        <Edit3Icon className="h-3.5 w-3.5" /> Re-evaluate / Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* ════ VIEW 2: PRE-INTERVIEW FEEDBACK & SCORECARD FORM PAGE ════ */
        <div className="space-y-6">
          {/* Navigation Bar & Candidate Selector */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
            <button
              onClick={() => setActiveView('list')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition self-start sm:self-auto"
            >
              <ArrowLeftIcon className="h-4 w-4 text-teal-400" />
              Back to Feedback History
            </button>

            {/* Select Candidate Dropdown inside Evaluation Page */}
            <div className="flex items-center gap-2">
              <label htmlFor="eval-candidate-select" className="text-xs font-bold text-slate-400 shrink-0">
                Select Candidate:
              </label>
              <select
                id="eval-candidate-select"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-teal-400"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.role} ({c.decisionStatus})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Success State */}
          {submitted && candidate ? (
            <motion.section
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-7 rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 text-center shadow-xl text-white"
              aria-live="polite"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2Icon className="h-9 w-9 text-emerald-400" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-white">Feedback Shared</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
                Your {recommendation?.toLowerCase()} recommendation for{' '}
                <strong className="text-white">{candidate.name}</strong> is now ready for the team decision.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  onClick={() => setActiveView('list')}
                  className="font-bold bg-brand-600 hover:bg-brand-500 text-white"
                >
                  Return to Feedback History
                </Button>
              </div>
            </motion.section>
          ) : candidate ? (
            /* Pre-Interview Feedback Form Page */
            <div className="grid gap-6 xl:grid-cols-[1fr_1.45fr]">
              {/* ══ LEFT: Full Candidate Profile ══ */}
              <aside className="space-y-4">
                {/* Identity */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white">
                  <div className="flex items-start gap-4">
                    <img
                      src={candidate.avatar}
                      alt=""
                      className="h-16 w-16 rounded-2xl object-cover border border-slate-700 bg-slate-950"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-xl font-extrabold leading-tight text-white">
                        {candidate.name}
                      </h2>
                      <p className="mt-0.5 text-sm font-medium text-slate-300">{candidate.title}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge
                          tone={
                            candidate.decisionStatus === 'Awaiting feedback'
                              ? 'amber'
                              : candidate.decisionStatus === 'Feedback submitted'
                              ? 'brand'
                              : 'green'
                          }
                          className="bg-brand-500/20 text-teal-300 border-brand-500/30"
                        >
                          {candidate.decisionStatus}
                        </Badge>
                        {candidate.departmentName && (
                          <Badge tone="slate" className="bg-slate-800 text-slate-300 border-slate-700">{candidate.departmentName}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 space-y-2.5 border-t border-slate-800 pt-4 text-sm">
                    {candidate.location && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>{candidate.location}</span>
                      </div>
                    )}
                    {candidate.email && (
                      <div className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4 shrink-0 text-slate-400" />
                        <a
                          href={`mailto:${candidate.email}`}
                          className="truncate text-teal-400 hover:underline font-semibold"
                        >
                          {candidate.email}
                        </a>
                      </div>
                    )}
                    {candidate.appliedAt && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>
                          Applied{' '}
                          {new Date(candidate.appliedAt).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-300">
                      <BriefcaseIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-semibold text-white">{candidate.role}</span>
                    </div>
                  </div>

                  {/* Resume */}
                  {candidate.resumeUrl && (
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
                    >
                      <ExternalLinkIcon className="h-4 w-4 text-teal-400" />
                      View Resume
                    </a>
                  )}
                </section>

                {/* Skills */}
                {candidate.skills.length > 0 && (
                  <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white">
                    <h3 className="mb-3 text-sm font-bold text-white">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} tone="brand" className="bg-brand-500/20 text-teal-300 border-brand-500/30">{skill}</Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Work Experience timeline */}
                {candidate.experiences.length > 0 && (
                  <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                      <BriefcaseIcon className="h-4 w-4 text-teal-400" />
                      Work Experience
                    </h3>
                    <ol className="relative border-l-2 border-slate-800 pl-4">
                      {candidate.experiences.map((exp, i) => (
                        <li key={i} className="mb-5 last:mb-0">
                          <div className="absolute -left-[7px] h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-teal-400" />
                          <p className="text-sm font-extrabold leading-tight text-white">
                            {exp.title}
                            {exp.isCurrent && (
                              <span className="ml-2 inline-block rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 align-middle">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-300">
                            <BuildingIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            {exp.company}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                          </p>
                          {exp.description && (
                            <p className="mt-1.5 text-xs leading-5 text-slate-300">
                              {exp.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {/* Education */}
                {candidate.educations.length > 0 && (
                  <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-white">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                      <GraduationCapIcon className="h-4 w-4 text-teal-400" />
                      Education
                    </h3>
                    <div className="space-y-4">
                      {candidate.educations.map((edu, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                            <GraduationCapIcon className="h-4 w-4 text-teal-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold leading-tight text-white">
                              {edu.degree} · {edu.fieldOfStudy}
                            </p>
                            <p className="text-xs font-medium text-slate-300">{edu.institution}</p>
                            <p className="text-xs text-slate-400">
                              {formatDateRange(edu.startDate, edu.endDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Cover letter */}
                {candidate.coverLetter && (
                  <section className="rounded-2xl border border-brand-500/30 bg-slate-950/70 p-5 text-white">
                    <div className="mb-3 flex items-center gap-2">
                      <MessageSquareTextIcon className="h-4 w-4 text-teal-400" />
                      <h3 className="text-sm font-bold text-white">Cover Letter</h3>
                    </div>
                    <p className="text-sm leading-6 text-slate-300 whitespace-pre-wrap line-clamp-6">
                      {candidate.coverLetter}
                    </p>
                  </section>
                )}

                {/* Interview focus hint */}
                <section className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Suggested interview focus
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{candidate.interviewFocus}</p>
                </section>
              </aside>

              {/* ══ RIGHT: Pre-Interview Scorecard & Feedback Form ══ */}
              <section
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl sm:p-6 self-start text-white"
                aria-labelledby="scorecard-title"
              >
                <h2 id="scorecard-title" className="font-display text-lg font-extrabold text-white">
                  Pre-Interview Scorecard
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Rate this candidate based on direct observable evidence.
                </p>

                {/* Overall rating */}
                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <span className="text-sm font-bold text-white">Overall rating</span>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        className="transition text-slate-700 hover:text-amber-400"
                      >
                        <StarIcon
                          className={`h-7 w-7 ${
                            overallRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    {overallRating > 0 && (
                      <span className="ml-2 text-sm font-bold text-white">
                        {overallRating} / 5
                      </span>
                    )}
                  </div>
                </div>

                {/* Recommendation */}
                <fieldset className="mt-6 border-t border-slate-800 pt-5">
                  <legend className="text-sm font-bold text-white">Recommendation decision</legend>
                  <div className="mt-3 grid gap-2 grid-cols-5">
                    {(['Strong Yes', 'Yes', 'Maybe', 'No', 'Strong No'] as ManagerRecommendation[]).map(
                      (option) => {
                        const isSelected = recommendation === option;
                        let cls = 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700';
                        if (isSelected) {
                          cls =
                            option === 'Strong Yes' || option === 'Yes'
                              ? 'border-emerald-500 bg-emerald-600 text-white font-extrabold shadow-md'
                              : option === 'Maybe'
                              ? 'border-amber-500 bg-amber-600 text-white font-extrabold shadow-md'
                              : 'border-red-500 bg-red-600 text-white font-extrabold shadow-md';
                        }
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setRecommendation(option)}
                            className={`rounded-xl border py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${cls}`}
                          >
                            {option}
                          </button>
                        );
                      }
                    )}
                  </div>
                </fieldset>

                {/* Written evaluation */}
                <div className="mt-6 border-t border-slate-800 pt-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">Written evaluation</h3>
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">Strengths</label>
                    <textarea
                      rows={3}
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="What did they excel at? Technical competence, experience highlights..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">Concerns</label>
                    <textarea
                      rows={3}
                      value={concerns}
                      onChange={(e) => setConcerns(e.target.value)}
                      placeholder="Any gaps or issues? Areas for growth, concerns about performance..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-white">
                      General Impression <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={generalImpression}
                      onChange={(e) => setGeneralImpression(e.target.value)}
                      placeholder="Summarize your final view and impressions of this candidate..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                    />
                    <p className="mt-1 text-right text-[10px] text-slate-400">
                      {generalImpression.trim().length} / 10 min characters
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-7 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <StarIcon className="h-4 w-4 text-amber-400 shrink-0" />
                    Overall rating and general impression are required.
                  </p>
                  <Button disabled={!canSubmit} onClick={submit} className="bg-brand-600 hover:bg-brand-500 text-white font-bold disabled:opacity-40">
                    <CheckCircle2Icon className="h-4 w-4" /> Submit pre-interview feedback
                  </Button>
                </div>
              </section>
            </div>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}