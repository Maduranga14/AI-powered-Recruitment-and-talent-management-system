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
      className="mx-auto max-w-[1240px] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8"
    >
      {/* ════ VIEW 1: FEEDBACK HISTORY & CANDIDATE LIST ════ */}
      {activeView === 'list' ? (
        <div className="space-y-8">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Structured decision records</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
                Candidate evaluations & feedback
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Review candidate cards below and click &quot;Review Candidate&quot; to open the pre-interview feedback page.
              </p>
            </div>
            <Badge tone="accent">
              <ClipboardCheckIcon className="h-3.5 w-3.5" /> Feedback Dashboard
            </Badge>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name, role, evidence, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition focus:border-brand-500 focus:bg-white focus:outline-none"
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
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition focus:border-brand-500 focus:bg-white focus:outline-none"
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
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 transition focus:border-brand-500 focus:bg-white focus:outline-none"
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
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                  title="Clear search and filters"
                >
                  <RotateCcwIcon className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>
          </div>


          {/* SECTION: Candidates Awaiting Pre-Interview Feedback */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-brand-600" />
                  Candidates Awaiting Review
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click &quot;Review Candidate&quot; to open the pre-interview evaluation page for a candidate.
                </p>
              </div>
              <Badge tone="amber">{pending.length} awaiting review</Badge>
            </div>

            {pending.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <CheckCircle2Icon className="mx-auto h-9 w-9 text-emerald-500" />
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {hasActiveFilters ? 'No pending candidates match your search and filter criteria.' : 'All candidate feedback complete!'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {hasActiveFilters ? 'Try adjusting your search query or clearing filters.' : 'No pending candidates awaiting review at this time.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-slate-50 transition"
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
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-soft hover:border-brand-300 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <h3 className="font-display text-base font-bold text-slate-900">{c.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">{c.role}</p>
                          </div>
                        </div>
                        {c.matchScore > 0 && <MatchScore score={c.matchScore} size={36} />}
                      </div>

                      <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                          {c.location} &middot; Applied {c.applied}
                        </p>
                        {c.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {c.skills.slice(0, 3).map((skill) => (
                              <span key={skill} className="rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200/60">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-3">
                      <Button
                        onClick={() => openReviewForCandidate(c.id)}
                        className="w-full justify-center gap-2 text-xs font-bold"
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
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <HistoryIcon className="h-5 w-5 text-brand-600" />
                    Previous Feedback & Decision History
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Review past pre-interview evaluations, ratings, and submitted recommendations.
                  </p>
                </div>
                <Badge tone="green">{submittedFeedbacks.length} submitted</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {submittedFeedbacks.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-soft hover:border-brand-200 transition"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-base font-bold text-slate-900 truncate">
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
                              >
                                {c.recommendation}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{c.role}</p>

                          {/* Rating Stars */}
                          {c.overallRating && c.overallRating > 0 ? (
                            <div className="mt-1.5 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                  key={star}
                                  className={`h-3.5 w-3.5 ${
                                    (c.overallRating || 0) >= star
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs font-bold text-slate-700">
                                {c.overallRating}/5
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Submitted Written Evidence / Feedback */}
                      {c.evidence && (
                        <div className="mt-3.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                          <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                            Submitted Evaluation:
                          </p>
                          <p className="whitespace-pre-wrap leading-relaxed line-clamp-4">
                            {c.evidence}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Status: <strong className="text-slate-700">{c.decisionStatus}</strong>
                      </span>
                      <button
                        onClick={() => openReviewForCandidate(c.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 transition"
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
            <button
              onClick={() => setActiveView('list')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs self-start sm:self-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Feedback History
            </button>

            {/* Select Candidate Dropdown inside Evaluation Page */}
            <div className="flex items-center gap-2">
              <label htmlFor="eval-candidate-select" className="text-xs font-bold text-slate-500 shrink-0">
                Select Candidate:
              </label>
              <select
                id="eval-candidate-select"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 shadow-2xs"
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
              className="mt-7 rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-soft"
              aria-live="polite"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2Icon className="h-9 w-9" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-slate-900">Feedback Shared</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Your {recommendation?.toLowerCase()} recommendation for{' '}
                <strong>{candidate.name}</strong> is now ready for the team decision.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  onClick={() => setActiveView('list')}
                  className="font-bold"
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
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="flex items-start gap-4">
                    <img
                      src={candidate.avatar}
                      alt=""
                      className="h-16 w-16 rounded-2xl object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-xl font-extrabold leading-tight text-slate-900">
                        {candidate.name}
                      </h2>
                      <p className="mt-0.5 text-sm font-medium text-slate-600">{candidate.title}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge
                          tone={
                            candidate.decisionStatus === 'Awaiting feedback'
                              ? 'amber'
                              : candidate.decisionStatus === 'Feedback submitted'
                              ? 'brand'
                              : 'green'
                          }
                        >
                          {candidate.decisionStatus}
                        </Badge>
                        {candidate.departmentName && (
                          <Badge tone="slate">{candidate.departmentName}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
                    {candidate.location && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>{candidate.location}</span>
                      </div>
                    )}
                    {candidate.email && (
                      <div className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4 shrink-0 text-slate-400" />
                        <a
                          href={`mailto:${candidate.email}`}
                          className="truncate text-brand-600 hover:underline"
                        >
                          {candidate.email}
                        </a>
                      </div>
                    )}
                    {candidate.appliedAt && (
                      <div className="flex items-center gap-2 text-slate-600">
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
                    <div className="flex items-center gap-2 text-slate-600">
                      <BriefcaseIcon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-semibold text-slate-700">{candidate.role}</span>
                    </div>
                  </div>

                  {/* Resume */}
                  {candidate.resumeUrl && (
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                      View Resume
                    </a>
                  )}
                </section>

                {/* Skills */}
                {candidate.skills.length > 0 && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <h3 className="mb-3 text-sm font-bold text-slate-800">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} tone="brand">{skill}</Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Work Experience timeline */}
                {candidate.experiences.length > 0 && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                      Work Experience
                    </h3>
                    <ol className="relative border-l-2 border-slate-100 pl-4">
                      {candidate.experiences.map((exp, i) => (
                        <li key={i} className="mb-5 last:mb-0">
                          <div className="absolute -left-[7px] h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-500" />
                          <p className="text-sm font-bold leading-tight text-slate-900">
                            {exp.title}
                            {exp.isCurrent && (
                              <span className="ml-2 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 align-middle">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                            <BuildingIcon className="h-3.5 w-3.5 shrink-0" />
                            {exp.company}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                          </p>
                          {exp.description && (
                            <p className="mt-1.5 text-xs leading-5 text-slate-500">
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
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <GraduationCapIcon className="h-4 w-4 text-slate-400" />
                      Education
                    </h3>
                    <div className="space-y-4">
                      {candidate.educations.map((edu, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <GraduationCapIcon className="h-4 w-4 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold leading-tight text-slate-800">
                              {edu.degree} · {edu.fieldOfStudy}
                            </p>
                            <p className="text-xs font-medium text-slate-500">{edu.institution}</p>
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
                  <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <MessageSquareTextIcon className="h-4 w-4 text-brand-600" />
                      <h3 className="text-sm font-bold text-slate-800">Cover Letter</h3>
                    </div>
                    <p className="text-sm leading-6 text-slate-600 whitespace-pre-wrap line-clamp-6">
                      {candidate.coverLetter}
                    </p>
                  </section>
                )}

                {/* Interview focus hint */}
                <section className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Suggested interview focus
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{candidate.interviewFocus}</p>
                </section>
              </aside>

              {/* ══ RIGHT: Pre-Interview Scorecard & Feedback Form ══ */}
              <section
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6 self-start"
                aria-labelledby="scorecard-title"
              >
                <h2 id="scorecard-title" className="font-display text-lg font-bold">
                  Pre-Interview Scorecard
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Rate this candidate based on direct observable evidence.
                </p>

                {/* Overall rating */}
                <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <span className="text-sm font-bold text-slate-800">Overall rating</span>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        className="transition text-slate-300 hover:text-amber-400"
                      >
                        <StarIcon
                          className={`h-7 w-7 ${
                            overallRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    {overallRating > 0 && (
                      <span className="ml-2 text-sm font-bold text-slate-700">
                        {overallRating} / 5
                      </span>
                    )}
                  </div>
                </div>

                {/* Recommendation */}
                <fieldset className="mt-6 border-t border-slate-100 pt-5">
                  <legend className="text-sm font-bold text-slate-800">Recommendation decision</legend>
                  <div className="mt-3 grid gap-2 grid-cols-5">
                    {(['Strong Yes', 'Yes', 'Maybe', 'No', 'Strong No'] as ManagerRecommendation[]).map(
                      (option) => {
                        const isSelected = recommendation === option;
                        let cls = 'border-slate-200 text-slate-600 hover:bg-slate-50';
                        if (isSelected) {
                          cls =
                            option === 'Strong Yes' || option === 'Yes'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold'
                              : option === 'Maybe'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 font-extrabold'
                              : 'border-red-500 bg-red-50 text-red-700 font-extrabold';
                        }
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setRecommendation(option)}
                            className={`rounded-xl border py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${cls}`}
                          >
                            {option}
                          </button>
                        );
                      }
                    )}
                  </div>
                </fieldset>

                {/* Written evaluation */}
                <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Written evaluation</h3>
                  <Textarea
                    label="Strengths"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="What did they excel at? Technical competence, experience highlights..."
                  />
                  <Textarea
                    label="Concerns"
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                    placeholder="Any gaps or issues? Areas for growth, concerns about performance..."
                  />
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      General Impression <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={generalImpression}
                      onChange={(e) => setGeneralImpression(e.target.value)}
                      placeholder="Summarize your final view and impressions of this candidate..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                    <p className="mt-1 text-right text-[10px] text-slate-400">
                      {generalImpression.trim().length} / 10 min characters
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <StarIcon className="h-4 w-4 text-amber-500" />
                    Overall rating and general impression are required.
                  </p>
                  <Button disabled={!canSubmit} onClick={submit}>
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